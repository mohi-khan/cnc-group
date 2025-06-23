'use client'

import { useState, useEffect, useCallback } from 'react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  getFinancialYear,
  getPostingPeriod,
  updatePostingPeriod,
} from '@/api/financial-year.api'
import type { GetFinancialYearType, Period } from '@/utils/type'
import { updatePostingPeriodsSchema } from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useRouter } from 'next/navigation'
import { useAtom } from 'jotai'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CustomCombobox } from '@/utils/custom-combobox'
import { toast } from '@/hooks/use-toast'

const PostingPeriodManager = () => {
  // Getting userData from jotai atom component
  useInitializeUser()
  const router = useRouter()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  // State variables
  const [error, setError] = useState<string | null>(null)
  const [periods, setPeriods] = useState<Period[]>([])
  const [financialYears, setFinancialYears] = useState<GetFinancialYearType[]>(
    []
  )
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null)
  const [changedPeriods, setChangedPeriods] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [showPeriods, setShowPeriods] = useState(false)

  // Effect hook to fetch financial years when token is available
  const fetchFinancialYears = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const data = await getFinancialYear(token)
      if (data?.error?.status === 401) {
        router.push('/unauthorized-access')
        console.log('Unauthorized access')
        return
      } else if (data.error || !data.data) {
        console.error('Error getting users:', data.error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error?.message || 'Failed to get users',
        })
      } else {
        setFinancialYears(data.data)
      }
      console.log('🚀 ~ fetchFinancialYears ~ data.data:', data.data)
      setError(null)
    } catch (error) {
      console.error('Error fetching financial years:', error)
      setError(
        'Failed to load financial years. Please check your authentication.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [token, router])

  // Effect hook to fetch posting periods when token and selectedYearId are available
  const fetchPeriods = useCallback(async () => {
    if (!token || !selectedYearId) return
    setIsLoading(true)
    try {
      const data = await getPostingPeriod(token, selectedYearId)
      console.log('🚀 ~ fetchPeriods ~ data:', data)
      if (data?.error?.status === 401) {
        router.push('/unauthorized-access')
        console.log('Unauthorized access')
        return
      } else if (data.error || !data.data) {
        console.error('Error getting users:', data.error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error?.message || 'Failed to get users',
        })
      } else {
        setPeriods(data.data)
      }
      setShowPeriods(true) // Set showPeriods to true after successful fetch
      setError(null)
    } catch (error) {
      console.error('Error fetching posting periods:', error)
      setError(
        'Failed to load posting periods. Please check your authentication.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [token, selectedYearId, router])

  // Only fetch financial years when token changes and is available
  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        console.log('No user data or token found in localStorage')
        router.push('/')
        return
      }
    }

    checkUserData()
    if (token) {
      fetchFinancialYears()
    }
  }, [token, fetchFinancialYears, router])

  // Convert period type to json format for API calling to update Period Open Data
  function transformPeriods(periods: Period[], isopen: boolean) {
    if (!periods || periods.length === 0) {
      throw new Error('Input array is empty or undefined')
    }
    const postingIds: number[] = periods
      .map((period) => period.periodId)
      .filter((id): id is number => typeof id === 'number' && id > 0)
    const result = {
      postingIds: postingIds,
      isOpen: isopen,
    }
    return result
  }

  // Function to handle status change of a period
  const handleStatusChange = (periodId: number, newStatus: boolean) => {
    // Check if opening a new period would exceed the limit of 2 open periods
    const openPeriodsCount = periods.filter((p) => p.isOpen).length
    const isCurrentlyOpen = periods.find((p) => p.periodId === periodId)?.isOpen

    if (newStatus && !isCurrentlyOpen && openPeriodsCount >= 2) {
      setError('Only two periods can be open at a time.')
      return
    }

    // Update the periods state with the new status
    setPeriods((prevPeriods) => {
      const updatedPeriods = prevPeriods.map((period) =>
        period.periodId === periodId ? { ...period, isOpen: newStatus } : period
      )
      console.log('Updated periods:', updatedPeriods)
      return updatedPeriods
    })

    // Add the changed period to the set of changed periods
    setChangedPeriods((prev) => {
      const newSet = new Set(prev)
      newSet.add(periodId)
      return newSet
    })

    // Clear any existing error
    setError(null)
  }

  const onSubmit = async () => {
    if (!token) {
      setError('Authentication token is missing. Please log in again.')
      return
    }

    try {
      const openPeriodsCount = periods.filter((p) => p.isOpen)
      const perioddata = updatePostingPeriodsSchema.parse(
        transformPeriods(openPeriodsCount, true)
      )
      console.log(perioddata)

      // Call the updatePostingPeriod API with the transformed data
      const response = await updatePostingPeriod(perioddata, token)

      // Handle the successful response
      console.log('Posting periods updated successfully:', response)

      // Reset the changed periods set
      setChangedPeriods(new Set())

      // Refresh the periods list
      fetchPeriods()
    } catch (error) {
      console.error('Error updating posting periods:', error)
      setError('Failed to update posting periods.')
    }
  }

  // Handle financial year selection change
  const handleYearChange = (value: { id: number; name: string } | null) => {
    setSelectedYearId(value?.id || null)
    setShowPeriods(false) // Reset show periods when year changes
  }

  // Render the component
  return (
    <div className="w-[97%] mx-auto">
      <CardHeader>
        <CardTitle>Posting Periods</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Financial Year Selector */}
        <div className="mb-6">
          {/* <label className="block text-sm font-medium mb-2">
            Select Financial Year
          </label> */}
          <div className="flex justify-center items-center">
            <div className="max-w-md mt-2 mr-3">
              <CustomCombobox
                items={financialYears.map((year) => ({
                  id: year.yearid,
                  name: year.yearname,
                }))}
                value={
                  selectedYearId
                    ? {
                        id: selectedYearId,
                        name:
                          financialYears.find(
                            (year) => year.yearid === selectedYearId
                          )?.yearname || '',
                      }
                    : null
                }
                onChange={handleYearChange}
              />
            </div>
            <Button
              className="mt-2"
              onClick={fetchPeriods}
              disabled={!selectedYearId}
            >
              Show Periods
            </Button>
          </div>
        </div>

        {/* Display error message if there's an error */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading posting periods...</p>
          </div>
        ) : (
          <>
            {/* Table to display posting periods */}
            {showPeriods && selectedYearId && periods.length > 0 ? (
              <>
                <Table className="border shadow-md">
                  <TableHeader className="bg-gray-200 shadow-md">
                    <TableRow>
                      <TableHead>Period Name</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Map through periods and render each as a table row */}
                    {periods.map((period) => (
                      <TableRow key={period.periodId}>
                        <TableCell>{period.periodName}</TableCell>
                        <TableCell>
                          {new Date(period.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(period.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {/* Switch component to toggle period status */}
                          <Switch
                            checked={period.isOpen}
                            onChange={(e) =>
                              handleStatusChange(
                                period.periodId,
                                (e.target as HTMLInputElement).checked
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Save button */}
                {changedPeriods.size > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button onClick={onSubmit}>Save Changes</Button>
                  </div>
                )}
              </>
            ) : showPeriods && selectedYearId ? (
              <div className="text-center py-8">
                <p>No posting periods found for the selected financial year.</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p>
                  Please select a financial year and click &quot;Show
                  Periods&quot; to view posting periods.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </div>
  )
}

export default PostingPeriodManager
