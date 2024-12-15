'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { getPostingPeriod, updatePostingPeriod } from '@/api/financial-year.api'
import { Period } from '@/utils/type'
import { updatePostingPeriodsSchema } from '@/utils/type'
const PostingPeriodManager = () => {
  // State variables
  const [error, setError] = useState<string | null>(null)
  const [periods, setPeriods] = useState<Period[]>([])
  const [changedPeriods, setChangedPeriods] = useState<Set<number>>(new Set())

  // Effect hook to fetch posting periods on component mount
  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const data = await getPostingPeriod()
        if (data.data != null) {
          setPeriods(data.data)
        }
      } catch (error) {
        console.error('Error fetching posting periods:', error)
        setError('Failed to load posting periods.')
      }
    }

    fetchPeriods()
  }, [])
  // Convert my period type to json format for API calling to update Period Open Data
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
    const openPeriodsCount = periods.filter((p) => p.isOpen)
    const perioddata = updatePostingPeriodsSchema.parse(
      transformPeriods(openPeriodsCount, true)
    )
    console.log(perioddata)

    // Call the updatePostingPeriod API with the transformed data
    const response = await updatePostingPeriod(perioddata)

    // Handle the successful response
    console.log('Posting periods updated successfully:', response)

    // You might want to update your UI or state here based on the response
  }
  // Render the component
  return (
    <Card className="w-full max-w-5xl">
      <CardHeader>
        <CardTitle>Posting Periods</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display error message if there's an error */}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {/* Table to display posting periods */}
        <Table>
          <TableHeader>
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
                    onChange={(checked) =>
                      handleStatusChange(period.periodId, checked)
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Button to save changes */}
        <div className="mt-4 flex justify-end">
          <Button type="button" onClick={onSubmit}>
            Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default PostingPeriodManager
