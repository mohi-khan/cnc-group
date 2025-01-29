'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { JournalVoucherPopup } from './journal-voucher-popup'
import {
  type CompanyFromLocalstorage,
  type JournalEntryWithDetails,
  type JournalQuery,
  type LocationFromLocalstorage,
  VoucherTypes,
} from '@/utils/type'
import { toast } from '@/hooks/use-toast'
import {
  createJournalEntryWithDetails,
  getAllVoucher,
} from '@/api/journal-voucher-api'
import VoucherList from '@/components/voucher-list/voucher-list'

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

  const columns = [
    { key: 'voucherno' as const, label: 'Voucher No.' },
    { key: 'date' as const, label: 'Voucher Date' },
    { key: 'notes' as const, label: 'Notes' },
    { key: 'companyname' as const, label: 'Company Name' },
    { key: 'location' as const, label: 'Location' },
    { key: 'currency' as const, label: 'Currency' },
    { key: 'state' as const, label: 'Status' },
    { key: 'totalamount' as const, label: 'Amount' },
  ]

  const linkGenerator = (voucherId: number) =>
    `/accounting/journal-voucher/single-journal-voucher/${voucherId}`

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

    console.log(
      '🚀 ~ handleSubmit ~ amountTotal:',
      data.journalEntry.amountTotal
    )

    const submissionData = {
      ...data,
      journalEntry: {
        ...data.journalEntry,
        amountTotal: data.journalEntry.amountTotal,
        createdBy: userId,
      },
      journalDetails: data.journalDetails.map((detail) => ({
        ...detail,
        createdBy: userId,
      })),
    }

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
      <VoucherList
        vouchers={sortedVouchers}
        columns={columns}
        isLoading={isLoading}
        onSort={handleSort}
        linkGenerator={linkGenerator}
      />
    </div>
  )
}
