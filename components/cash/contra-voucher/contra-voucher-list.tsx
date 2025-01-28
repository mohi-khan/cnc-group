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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  type CompanyFromLocalstorage,
  JournalEntryWithDetails,
  type JournalQuery,
  type JournalResult,
  type LocationFromLocalstorage,
  type User,
  VoucherTypes,
} from '@/utils/type'
import { getAllVoucher } from '@/api/journal-voucher-api'
import Link from 'next/link'
import { ContraVoucherPopup } from './contra-voucher-popup'
import Loader from '@/utils/loader'

const ITEMS_PER_PAGE = 10

export default function ContraVoucherTable() {
  const [vouchers, setVouchers] = useState<JournalResult[]>([])
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

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

  const totalPages = Math.ceil(vouchers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentVouchers = vouchers.slice(startIndex, endIndex)

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Contra Vouchers</h1>
        <ContraVoucherPopup
          fetchAllVoucher={fetchAllVoucher} />
      </div>

      <Table className="border shadow-md">
        <TableHeader>
          <TableRow className="bg-slate-200 shadow-md">
            <TableHead>Voucher No.</TableHead>
            <TableHead>Voucher Date</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Company Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                <Loader />
              </TableCell>
            </TableRow>
          ) : currentVouchers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No contra voucher is available
              </TableCell>
            </TableRow>
          ) : (
            currentVouchers.map((voucher) => (
              <TableRow key={voucher.voucherid}>
                <TableCell className="font-medium">
                  <Link
                    href={`/cash/contra-vouchers/single-contra-voucher/${voucher.voucherid}`}
                  >
                    {voucher.voucherno}
                  </Link>
                </TableCell>
                <TableCell>{voucher.date}</TableCell>
                <TableCell>{voucher.notes}</TableCell>
                <TableCell>{voucher.companyname}</TableCell>
                <TableCell>{voucher.location}</TableCell>
                <TableCell>{voucher.currency}</TableCell>
                <TableCell>{voucher.state === 1 ? 'Post' : 'Draft'}</TableCell>
                <TableCell className="text-right">
                  {voucher.totalamount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

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
