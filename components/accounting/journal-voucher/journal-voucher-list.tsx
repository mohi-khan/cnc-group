'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
  type JournalEntryWithDetails,
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
import { Button } from '@/components/ui/button'
import { Loader2, ArrowUpDown } from 'lucide-react'
import Loader from '@/utils/loader'

interface Voucher {
  voucherid: number
  voucherno: string
  date: string
  notes: string
  companyname: string
  location: string
  currency: string
  state: number
  totalamount: number
}

type SortColumn = keyof Voucher
type SortDirection = 'asc' | 'desc'

export default function VoucherTable() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
  const [userId, setUserId] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [sortColumn, setSortColumn] = useState<SortColumn>('voucherno')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const sortedVouchers = useMemo(() => {
    return [...vouchers].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [vouchers, sortColumn, sortDirection])

  const fetchAllVoucher = useCallback(
    async (company: number[], location: number[]) => {
      setIsLoading(true)
      const voucherQuery: JournalQuery = {
        date: new Date().toISOString().split('T')[0],
        companyId: company,
        locationId: location,
        voucherType: VoucherTypes.JournalVoucher,
      }
      try {
        const response = await getAllVoucher(voucherQuery)
        if (response.error) {
          throw new Error(response.error)
        }
        console.log('API Response:', response.data)
        setVouchers(Array.isArray(response.data) ? response.data : [])
        setRetryCount(0) // Reset retry count on successful fetch
      } catch (error) {
        console.error('Error getting Voucher Data:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch vouchers. Retrying...',
        })
        setVouchers([])
        setRetryCount((prevCount) => prevCount + 1)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUserId(userData.userId)
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
      console.log('Current user from localStorage:', userData.userId)

      const companyIds = getCompanyIds(userData.userCompanies)
      const locationIds = getLocationIds(userData.userLocations)
      console.log({ companyIds, locationIds })

      fetchAllVoucher(companyIds, locationIds)
    } else {
      console.log('No user data found in localStorage')
      setIsLoading(false)
    }
  }, [fetchAllVoucher])

  useEffect(() => {
    if (retryCount > 0 && retryCount <= 3) {
      const timer = setTimeout(() => {
        fetchAllVoucher(getCompanyIds(companies), getLocationIds(locations))
      }, 2000) // Retry after 2 seconds
      return () => clearTimeout(timer)
    }
  }, [retryCount, companies, locations, fetchAllVoucher])

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
    // const amountTotal = data.journalDetails.reduce(
    //   (sum, detail) => sum + (Number(detail.debit) - Number(detail.credit)),
    //   0
    // )
    console.log(
      '🚀 ~ handleSubmit ~ amountTotal:',
      data.journalEntry.amountTotal
    )

    // Update the total amount before submission
    const submissionData = {
      ...data,
      journalEntry: {
        ...data.journalEntry,
        amountTotal: data.journalEntry.amountTotal,
        createdBy: userId,
      },
      journalDetails: data.journalDetails.map(detail => ({
        ...detail,
        createdBy: userId,
      })),
    };
    
    console.log('🚀 ~ handleSubmit ~ submissionData:', submissionData)

    const response = await createJournalEntryWithDetails(submissionData)

    if (response.error || !response.data) {
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
      setIsOpen(false)
    }

    setIsOpen(false)
    setIsSubmitting(false)
    fetchAllVoucher(getCompanyIds(companies), getLocationIds(locations))
  }

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Journal Vouchers</h1>
        <JournalVoucherPopup
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
      <Table className="border shadow-md">
        <TableHeader className="sticky top-28 bg-slate-200 shadow-md">
          <TableRow>
            {[
              { key: 'voucherno', label: 'Voucher No.' },
              { key: 'date', label: 'Voucher Date' },
              { key: 'notes', label: 'Notes' },
              { key: 'companyname', label: 'Company Name' },
              { key: 'location', label: 'Location' },
              { key: 'currency', label: 'Currency' },
              { key: 'state', label: 'Status' },
              { key: 'totalamount', label: 'Amount' },
            ].map(({ key, label }) => (
              <TableHead
                key={key}
                className="cursor-pointer"
                onClick={() => handleSort(key as SortColumn)}
              >
                <div className="flex items-center gap-1">
                  {label}
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-4">
                <Loader />
              </TableCell>
            </TableRow>
          ) : sortedVouchers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-4">
                No journal voucher is available.
                {/* {retryCount <= 3 && (
                  <Button
                    onClick={() =>
                      fetchAllVoucher(
                        getCompanyIds(companies),
                        getLocationIds(locations)
                      )
                    }
                    className="ml-2"
                  >
                    Retry
                  </Button>
                )} */}
              </TableCell>
            </TableRow>
          ) : (
            sortedVouchers.map((voucher) => (
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
                <TableCell>{`${voucher.state == 0 ? 'Draft' : 'Post'}`}</TableCell>
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
