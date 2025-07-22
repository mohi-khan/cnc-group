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
  const [isLoading, setIsLoading] = useState(true)
  const [showPeriods, setShowPeriods] = useState(false)
  const [updatingPeriods, setUpdatingPeriods] = useState<Set<number>>(new Set())

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

  // Function to create API payload for single period update
  function createPeriodUpdatePayload(periodId: number, isOpen: boolean) {
    const result = {
      postingIds: [periodId],
      isOpen: isOpen,
    }
    return result
  }

  // Function to handle status change of a period with immediate API call
  const handleStatusChange = async (periodId: number, newStatus: boolean) => {
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Authentication token is missing. Please log in again.',
      })
      return
    }

    // Check if opening a new period would exceed the limit of 2 open periods
    const openPeriodsCount = periods.filter((p) => p.isOpen).length
    const isCurrentlyOpen = periods.find((p) => p.periodId === periodId)?.isOpen

    if (newStatus && !isCurrentlyOpen && openPeriodsCount >= 2) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Only two periods can be open at a time.',
      })
      return
    }

    // Add period to updating set to show loading state
    setUpdatingPeriods((prev) => new Set(prev).add(periodId))

    try {
      // Create the payload for the API call
      const periodData = updatePostingPeriodsSchema.parse(
        createPeriodUpdatePayload(periodId, newStatus)
      )

      console.log('Updating period:', periodData)

      // Call the updatePostingPeriod API
      const response = await updatePostingPeriod(periodData, token)

      if (response?.error) {
        throw new Error(response.error.message || 'Failed to update period')
      }

      // Update the periods state with the new status only on successful API call
      setPeriods((prevPeriods) => {
        const updatedPeriods = prevPeriods.map((period) =>
          period.periodId === periodId
            ? { ...period, isOpen: newStatus }
            : period
        )
        console.log('Updated periods:', updatedPeriods)
        return updatedPeriods
      })

      // Show success message
      toast({
        title: 'Success',
        description: `Period ${newStatus ? 'opened' : 'closed'} successfully.`,
      })

      // Clear any existing error
      setError(null)
    } catch (error) {
      console.error('Error updating posting period:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update posting period. Please try again.',
      })
    } finally {
      // Remove period from updating set
      setUpdatingPeriods((prev) => {
        const newSet = new Set(prev)
        newSet.delete(periodId)
        return newSet
      })
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

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading posting periods...</p>
          </div>
        ) : (
          <>
            {/* Table to display posting periods */}
            {showPeriods && selectedYearId && periods.length > 0 ? (
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
                          disabled={updatingPeriods.has(period.periodId)}
                          onChange={(event) =>
                            handleStatusChange(period.periodId, event.target.checked)
                          }
                        />
                        {updatingPeriods.has(period.periodId) && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            Updating...
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
