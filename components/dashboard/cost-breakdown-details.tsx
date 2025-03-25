'use client'
import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getCostBreakdownDetails } from '@/api/dashboard-api'
import { GetCostBreakdownDetailsType } from '@/utils/type'

const CostBreakdownDetails = () => {
    const [costBreakdownDetails, setCostBreakdownDetails] = useState<GetCostBreakdownDetailsType[]>([])

    //Get Cost Breakdown Data
      const fetchCostBreakdown = async () => {
        // const departmentId = 14 // Default to 0 if no department is selected
        // const startDate = '2025-01-01' // Example startDate
        // const endDate = '2025-03-31' // Example endDate
        // const companyId = 75 // Example companyId
        // const financialTag = 'Asset' // Example financialTag
    
        const response = await getCostBreakdownDetails()
        if (response.data) {
          setCostBreakdownDetails(
            Array.isArray(response.data) ? response.data : [response.data]
          )
        } else {
          setCostBreakdownDetails([])
        }
        console.log('🚀 ~ GetCostBreakdowndetails from details page ~ response:', response)
      }

      useEffect(() => {
        fetchCostBreakdown()
      }, [])
      
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {costBreakdownDetails.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.name}</TableCell>
              <TableCell>${item.balance}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>  )
}

export default CostBreakdownDetails