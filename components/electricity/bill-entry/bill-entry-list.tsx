'use client'
import { getBillEntry } from '@/api/bill-entry-api'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { GetElectricityBillType } from '@/utils/type'
import { Plus } from 'lucide-react'
import React, { useEffect } from 'react'

interface BillTableProps {
  onAddCategory: () => void
}

const BillTable: React.FC<BillTableProps> = ({ onAddCategory }) => {
  const [billEntry, setBillEntry] = React.useState<GetElectricityBillType[]>([])
  // const data = [
  //   {
  //     meterNo: '001',
  //     billDate: '2024-03-01',
  //     billAmount: '$100',
  //     payment: 'Paid',
  //   },
  //   {
  //     meterNo: '002',
  //     billDate: '2024-03-05',
  //     billAmount: '$150',
  //     payment: 'Pending',
  //   },
  //   {
  //     meterNo: '003',
  //     billDate: '2024-03-10',
  //     billAmount: '$200',
  //     payment: 'Paid',
  //   },
  //   {
  //     meterNo: '004',
  //     billDate: '2024-03-15',
  //     billAmount: '$250',
  //     payment: 'Pending',
  //   },
  //   {
  //     meterNo: '005',
  //     billDate: '2024-03-20',
  //     billAmount: '$300',
  //     payment: 'Paid',
  //   },
  // ]

  const fetchBillEntry = async () => {
    const response = await getBillEntry()
    setBillEntry(response.data ?? [])
    console.log('🚀 ~get meter entry data :', response)
  }

  useEffect(() => {
    fetchBillEntry()
  }, [])

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bill List</h1>
        <Button onClick={onAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          ADD
        </Button>
      </div>
      <Table className="shadow-md border">
        <TableHeader className="bg-slate-200 shadow-md">
          <TableRow>
            <TableHead>Meter No</TableHead>
            <TableHead>Bill Date</TableHead>
            <TableHead>Bill Amount</TableHead>
            <TableHead>Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {billEntry.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.meterName}</TableCell>
              <TableCell>{row.billDate}</TableCell>
              <TableCell>{row.amount}</TableCell>
              <TableCell>{row.payment}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default BillTable
