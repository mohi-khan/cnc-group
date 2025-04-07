'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation' // Get dynamic route params
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getCostBreakdownDetails } from '@/api/dashboard-api'
import { GetCostBreakdownDetailsType } from '@/utils/type'

const CostBreakdownDetails = () => {
  const { financialTag } = useParams() // Get the financialTag from the URL
  const [costBreakdownDetails, setCostBreakdownDetails] = useState<
    GetCostBreakdownDetailsType[]
  >([])

  useEffect(() => {
    if (financialTag) {
      const tag = Array.isArray(financialTag) ? financialTag[0] : financialTag
      fetchCostBreakdown(tag)
    }
  }, [financialTag])

  const fetchCostBreakdown = async (financialTag: string) => {
    const response = await getCostBreakdownDetails()
    if (response.data) {
      setCostBreakdownDetails(
        Array.isArray(response.data) ? response.data : [response.data]
      )
    } else {
      setCostBreakdownDetails([])
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Details for {financialTag}</h2>
      <Table className='border shadow-md '>
        <TableHeader className='bg-slate-200 shadow-md '>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {costBreakdownDetails.length > 0 ? (
            costBreakdownDetails.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>${item.balance}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="text-center">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default CostBreakdownDetails
