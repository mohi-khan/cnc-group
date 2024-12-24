'use client'

import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { JournalVoucherPopup } from './journal-voucher-popup'
import {
  CompanyFromLocalstorage,
  JournalQuery,
  JournalResult,
  LocationFromLocalstorage,
  User,
  VoucherTypes,
} from '@/utils/type'
import { toast } from '@/hooks/use-toast'
import { getAllVoucher } from '@/api/journal-voucher-api'
import Link from 'next/link'

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
  const [companies, setCompanies] = React.useState<CompanyFromLocalstorage[]>(
    []
  )
  const [locations, setLocations] = React.useState<LocationFromLocalstorage[]>(
    []
  )
  const [user, setUser] = React.useState<User | null>(null)
  const [vouchergrid, setVoucherGrid] = React.useState<JournalResult[]>([])

  React.useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUser(userData)
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
      console.log('Current user from localStorage:', userData)

      const companyIds = getCompanyIds(userData.userCompanies)
      const locationIds = getLocationIds(userData.userLocations)
      console.log({ companyIds, locationIds })
      fetchAllVoucher(companyIds, locationIds)
    } else {
      console.log('No user data found in localStorage')
    }
  }, [])

  async function fetchAllVoucher(company: number[], location: number[]) {
    const voucherQuery: JournalQuery = {
      date: new Date().toISOString().split('T')[0],
      companyId: company,
      locationId: location,
      voucherType: VoucherTypes.JournalVoucher,
    }
    const response = await getAllVoucher(voucherQuery)
    if (response.error || !response.data) {
      console.error('Error getting Voucher Data:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get Voucher Data',
      })
    } else {
      console.log('voucher', response.data)
      setVoucherGrid(response.data)
    }
  }

  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }
  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
  }

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
          {vouchergrid.map((voucher) => (
            <TableRow key={voucher.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/journal-voucher/single-journal-voucher/${voucher.voucherid}`}
                >
                  {voucher.voucherno}
                </Link>
              </TableCell>
              <TableCell>{voucher.date}</TableCell>
              <TableCell>{voucher.notes}</TableCell>
              <TableCell>{`${voucher.companyname} - ${voucher.location}`}</TableCell>
              <TableCell className="text-right">
                ${voucher.totalamount.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
