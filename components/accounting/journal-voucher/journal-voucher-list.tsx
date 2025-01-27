'use client'

import React, { useState, useEffect, use } from 'react'
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
  JournalEntryWithDetails,
  type JournalQuery,
  type LocationFromLocalstorage,
  type User,
  VoucherTypes,
} from '@/utils/type'
import { toast } from '@/hooks/use-toast'
import {
  createJournalEntryWithDetails,
  getAllVoucher,
} from '@/api/journal-voucher-api'
import Link from 'next/link'

interface Voucher {
  voucherid: number
  voucherno: string
  date: string
  notes: string
  companyname: string
  location: string
  currency: string
  totalamount: number
}

export default function VoucherTable() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

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
      console.error('Error getting Voucher Data:', response.error)
      toast({
        title: 'Error',
        description: 'Failed to fetch vouchers.',
      })
      setVouchers([]) // Reset to an empty array on error
    } else {
      console.log('API Response:', response.data)
      // Ensure response.data is an array
      setVouchers(Array.isArray(response.data) ? response.data : [])
    }
    setIsLoading(false)
  }

  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }
  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
  }

  const handleSubmit = async (data: JournalEntryWithDetails) => {
    setIsSubmitting(true)
    console.log('Submitting voucher:', data)

    // Calculate total amount from details
    const amountTotal = data.journalDetails.reduce(
      (sum, detail) => sum + (Number(detail.debit) - Number(detail.credit)),
      0
    )

    // Update the total amount before submission
    const submissionData = {
      ...data,
      journalEntry: {
        ...data.journalEntry,
        amountTotal,
      },
    }

    const response = await createJournalEntryWithDetails(submissionData)

    if (response.error || !response.data) {
      // throw new Error(response.error?.message || 'Failed to create voucher')
      toast({
        title: 'error',
        description: `${response.error?.message}`,
        variant: 'destructive',
        
      })
    } else {
      toast({
        title: 'Success',
        description: 'Voucher created successfully',
      })
    }

    setIsOpen(false)
    setIsSubmitting(false)
    fetchAllVoucher(getCompanyIds(companies), getLocationIds(locations))
    // setIsSubmitting(false)
  }

  useEffect(() => {
    fetchAllVoucher(getCompanyIds(companies), getLocationIds(locations))
  }, [])

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Journal Vouchers</h1>
        <JournalVoucherPopup
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </div>
      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead>Voucher No.</TableHead>
            <TableHead>Voucher Date</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Company Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                Loading...
              </TableCell>
            </TableRow>
          ) : vouchers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No journal voucher is available.
              </TableCell>
            </TableRow>
          ) : (
            vouchers.map((voucher) => (
              <TableRow key={voucher.voucherid}>
                <TableCell className="font-medium">
                  <Link
                    href={`/accounting/journal-voucher/single-journal-voucher/${voucher.voucherid}`}
                  >
                    {voucher.voucherno}
                  </Link>
                </TableCell>
                <TableCell>{voucher.date}</TableCell>
                <TableCell>{voucher.notes}</TableCell>
                <TableCell>{voucher.companyname}</TableCell>
                <TableCell>{voucher.location}</TableCell>
                <TableCell>{voucher.currency}</TableCell>
                <TableCell className="text-right">
                  {voucher.totalamount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
