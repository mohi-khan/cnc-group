'use client'
import { getAllBudgetDetails } from '@/api/budget-api'
import { toast } from '@/hooks/use-toast'
import { BudgetItems } from '@/utils/type'
import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useParams } from 'next/navigation'

const SingleBudgetItemsDetails = () => {
    const [budgetItems, setBudgetItems] = useState<BudgetItems[]>([])
    
    const {id} = useParams()
    console.log('id id', id)

  async function fetchGetAllBudgetItems(id: number) {
    try {
      const response = await getAllBudgetDetails(id)
      if (!response.data) throw new Error('No data received')
      setBudgetItems(response.data)
      console.log(' budget items data:', response.data)
    } catch (error) {
      console.error('Error getting master budget:', error)
      toast({
        title: 'Error',
        description: 'Failed to load master budget',
      })
      setBudgetItems([])
    }
  }

  useEffect(() => {
    fetchGetAllBudgetItems(id)
  }, [id])

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Budget Details</h2>
      {budgetItems.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Name</TableHead>
              <TableHead className="w-1/3">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgetItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.budgetAmount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-gray-500">No budget items found.</p>
      )}
    </div>
  )
}

export default SingleBudgetItemsDetails
