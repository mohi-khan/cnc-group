'use client'

import React, { useState, useEffect } from 'react'
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
  type CompanyFromLocalstorage,
  type JournalQuery,
  type JournalResult,
  type LocationFromLocalstorage,
  type User,
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

export default function VoucherTable() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [vouchergrid, setVoucherGrid] = useState<JournalResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
      setIsLoading(false)
    }
  }, [])

  async function fetchAllVoucher(company: number[], location: number[]) {
    setIsLoading(true)
    const voucherQuery: JournalQuery = {
      date: new Date().toISOString().split('T')[0],
      companyId: company,
      locationId: location,
      voucherType: VoucherTypes.JournalVoucher,
    }
    const response = await getAllVoucher(voucherQuery)
    if (response.error) {
      console.log('Error getting Voucher Data:', response.error)
    } else {
      console.log('voucher', response.data)
      setVoucherGrid(response.data || [])
    }
    setIsLoading(false)
  }

  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }
  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
  }

  const handleSubmit = (voucherData: Omit<Voucher, 'id'>) => {
    console.log('Submitting voucher:', voucherData)
    const newVoucher: Voucher = {
      ...voucherData,
      id: vouchers.length + 1,
      amount: Number.parseFloat(voucherData.amount.toString()),
    }
    setVouchers([...vouchers, newVoucher])
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Journal Vouchers</h1>
        <JournalVoucherPopup onSubmit={handleSubmit} />
      </div>
      <Table className='border'>
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Loading...
              </TableCell>
            </TableRow>
          ) : vouchergrid.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No journal voucher is available.
              </TableCell>
            </TableRow>
          ) : (
            vouchergrid.map((voucher) => (
              <TableRow key={voucher.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/accounting/journal-voucher/single-journal-voucher/${voucher.voucherid}`}
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
