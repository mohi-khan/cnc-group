'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { JournalVoucherPopup } from './journal-voucher-popup'

interface Voucher {
  id: number
  voucherNo: string
  voucherDate: string
  notes: string
  companyNameLocation: string
  amount: number
}

// This would typically come from a database or API
const initialVouchers: Voucher[] = [
  {
    id: 1,
    voucherNo: 'V001',
    voucherDate: '2023-05-15',
    notes: 'Monthly expense report',
    companyNameLocation: 'Acme Corp, New York',
    amount: 1500.0,
  },
  {
    id: 2,
    voucherNo: 'V002',
    voucherDate: '2023-05-16',
    notes: 'Office supplies',
    companyNameLocation: 'Globex Inc, Los Angeles',
    amount: 250.75,
  },
]

export default function VoucherTable() {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers)

  const handleSubmit = (voucherData: Omit<Voucher, 'id'>) => {
    // Here you would typically send the data to your backend
    console.log('Submitting voucher:', voucherData)

    // For now, we'll just add it to the local state
    const newVoucher: Voucher = {
      ...voucherData,
      id: vouchers.length + 1,
      amount: parseFloat(voucherData.amount),
    }
    setVouchers([...vouchers, newVoucher])
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Vouchers</h1>
        <JournalVoucherPopup onSubmit={handleSubmit} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Voucher No.</TableHead>
            <TableHead>Voucher Date</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Company Name & Location</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vouchers.map((voucher) => (
            <TableRow key={voucher.id}>
              <TableCell className="font-medium">{voucher.voucherNo}</TableCell>
              <TableCell>{voucher.voucherDate}</TableCell>
              <TableCell>{voucher.notes}</TableCell>
              <TableCell>{voucher.companyNameLocation}</TableCell>
              <TableCell className="text-right">
                ${voucher.amount.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
