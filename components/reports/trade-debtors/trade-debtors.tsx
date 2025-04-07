'use client'
import { getAllTradeDebtors } from '@/api/trade-debtors-api'
import { GetTradeDebtorsType } from '@/utils/type'
import React, { useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const TradeDebtors = () => {
  const [tradeDebtors, setTradeDebtors] = React.useState<GetTradeDebtorsType[]>(
    []
  )

  // fetch trade debtors data from API
  const fetchTradeDebtors = async () => {
    const response = await getAllTradeDebtors()
    console.log('This is from trade debtors:', response.data)
    setTradeDebtors(response.data || [])
  }

  useEffect(() => {
    fetchTradeDebtors()
  }, [])

  return (
    <div className="mt-10 mx-20 ">
      <h1 className="text-3xl font-bold mb-4 flex justify-center" >National Accessories Limited</h1>
      <h2 className="text-2xl font-bold mb-4">Trade Debtors</h2>
      <Table className="border shadow-md ">
        <TableHeader className="bg-slate-200 sticky top-28 shadow-md">
          <TableRow className='mb-4'>
            <TableHead>Partner Name</TableHead>
            <TableHead>Balance Current Year</TableHead>
            <TableHead>Balance Last Year</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tradeDebtors.map((debtor) => (
            <TableRow key={debtor.partnerId}>
              <TableCell>{debtor.partnerName}</TableCell>
              <TableCell>{debtor.balanceCurrentYear}</TableCell>
              <TableCell>{debtor.balanceLastYear}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
   

  )
}

export default TradeDebtors
