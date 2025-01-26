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
import {
  type CompanyFromLocalstorage,
  type JournalQuery,
  type JournalResult,
  type LocationFromLocalstorage,
  type User,
  VoucherTypes,
} from '@/utils/type'
import { getAllVoucher } from '@/api/journal-voucher-api'
import Link from 'next/link'
import { ContraVoucherPopup } from './contra-voucher-popup'

const initialVouchers: JournalResult[] = []

export default function ContraVoucherTable() {
  const [vouchers, setVouchers] = useState<JournalResult[]>([])
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [vouchergrid, setVoucherGrid] = useState<JournalResult[]>([])

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
    }
  }, [])

  async function fetchAllVoucher(company: number[], location: number[]) {
    const voucherQuery: JournalQuery = {
      date: new Date().toISOString().split('T')[0],
      companyId: company,
      locationId: location,
      voucherType: VoucherTypes.ContraVoucher,
    }
    const response = await getAllVoucher(voucherQuery)
    if (response.data) {
      console.log('voucher', response.data)
      setVoucherGrid(response.data)
      setVouchers(response.data)
    } else {
      console.log('No voucher data available')
      setVoucherGrid([])
      setVouchers([])
    }
  }

  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }

  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
  }

  const handleSubmit = (voucherData: Partial<JournalResult>) => {
    console.log('Submitting voucher:', voucherData)
    // Here you would typically send the data to your backend
    // For now, we'll just add it to the local state
    const newVoucher: JournalResult = {
      ...voucherData,
      id: vouchergrid.length + 1,
      totalamount: Number(voucherData.totalamount),
    } as JournalResult
    setVoucherGrid([...vouchergrid, newVoucher])
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Contra Vouchers</h1>
        <ContraVoucherPopup onSubmit={handleSubmit} />
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
          {vouchers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No contra voucher is available
              </TableCell>
            </TableRow>
          ) : (
            vouchers.map((voucher) => (
              <TableRow key={voucher.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/cash/contra-vouchers/single-contra-voucher/${voucher.voucherid}`}
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
