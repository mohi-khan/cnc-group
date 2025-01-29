'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  type CompanyFromLocalstorage,
  type JournalQuery,
  type JournalResult,
  type LocationFromLocalstorage,
  type User,
  VoucherTypes,
} from '@/utils/type'
import { getAllVoucher } from '@/api/journal-voucher-api'
import { ContraVoucherPopup } from './contra-voucher-popup'
import VoucherList from '@/components/voucher-list/voucher-list'

const ITEMS_PER_PAGE = 10

type SortField = keyof JournalResult
type SortDirection = 'asc' | 'desc'

export default function ContraVoucherTable() {
  const [vouchers, setVouchers] = useState<JournalResult[]>([])
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('voucherno')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

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
    setIsLoading(true)
    const voucherQuery: JournalQuery = {
      date: new Date().toISOString().split('T')[0],
      companyId: company,
      locationId: location,
      voucherType: VoucherTypes.ContraVoucher,
    }
    const response = await getAllVoucher(voucherQuery)
    if (response.data && Array.isArray(response.data)) {
      console.log(
        'contra voucher data line no 57 and i am from contra voucher list:',
        response.data
      )

      setVouchers(response.data)
    } else {
      console.log('No voucher data available')
      setVouchers([])
    }
    setIsLoading(false)
  }

  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }

  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedVouchers = useMemo(() => {
    return [...vouchers].sort((a, b) => {
      if (a[sortField] == null || b[sortField] == null) return 0
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [vouchers, sortField, sortDirection])

  const totalPages = Math.ceil(sortedVouchers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentVouchers = sortedVouchers.slice(startIndex, endIndex)

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
    `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.ContraVoucher}`

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Contra Vouchers</h1>
        <ContraVoucherPopup fetchAllVoucher={fetchAllVoucher} />
      </div>

      <VoucherList
        vouchers={currentVouchers}
        columns={columns}
        isLoading={isLoading}
        onSort={handleSort}
        linkGenerator={linkGenerator}
      />

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
