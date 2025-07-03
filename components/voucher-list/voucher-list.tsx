'use client'

import type React from 'react'
import { useState, useMemo, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import Loader from '@/utils/loader'
import { usePathname } from 'next/navigation'
import { makePostJournal } from '@/api/vouchers-api'
import { toast } from '@/hooks/use-toast'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'

interface Voucher {
  voucherid: number
  voucherno: string
  date: string
  notes: string | null
  companyname: string | null
  location: string | null
  currency: string | null
  state: number
  totalamount: number
  journaltype: string
}

export interface Column {
  key: keyof Voucher
  label: string
}

interface VoucherListProps {
  vouchers: Voucher[]
  columns: Column[]
  isLoading: boolean
  linkGenerator: (voucherId: number) => string
  itemsPerPage?: number
  token?: string
  onJournalPosted?: (voucherId: number) => void
}

const VoucherList: React.FC<VoucherListProps> = ({
  vouchers,
  columns,
  isLoading,
  linkGenerator,
  itemsPerPage = 10,
  onJournalPosted,
}) => {
  const pathname = usePathname()
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Voucher>('voucherno')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isPosting, setIsPosting] = useState<Record<number, boolean>>({})

  // Local state to manage vouchers and allow updates
  const [localVouchers, setLocalVouchers] = useState<Voucher[]>(vouchers)

  // Update local vouchers when props change
  useEffect(() => {
    setLocalVouchers(vouchers)
  }, [vouchers])

  const handleSort = (field: keyof Voucher) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedVouchers = useMemo(() => {
    return [...localVouchers].sort((a, b) => {
      if (a[sortField] == null || b[sortField] == null) return 0
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [localVouchers, sortField, sortDirection])

  const totalPages = Math.ceil(sortedVouchers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVouchers = sortedVouchers.slice(startIndex, endIndex)

  const handlePostJournal = async (voucherId: number, createId: string) => {
    try {
      setIsPosting((prev) => ({ ...prev, [voucherId]: true }))

      const response = await makePostJournal(
        voucherId.toString(),
        userData?.userId?.toString() ?? '',
        token
      )

      if (response.error || !response.data) {
        console.error('Error posting journal:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to post journal',
          variant: 'destructive',
        })
      } else {
        console.log('Journal posted successfully')
        toast({
          title: 'Success',
          description: 'Journal posted successfully',
        })

        // Update the local voucher state to reflect the change
        setLocalVouchers((prevVouchers) =>
          prevVouchers.map((voucher) =>
            voucher.voucherid === voucherId
              ? { ...voucher, state: 1 } // Change state from 0 (Draft) to 1 (Post)
              : voucher
          )
        )

        // Call the callback if provided
        onJournalPosted?.(voucherId)
      }
    } catch (error) {
      console.error('Error posting journal:', error)
      toast({
        title: 'Error',
        description: 'Failed to post journal',
        variant: 'destructive',
      })
    } finally {
      setIsPosting((prev) => ({ ...prev, [voucherId]: false }))
    }
  }

  return (
    <>
      <Table className="border shadow-md">
        <TableHeader className="sticky top-28 bg-slate-200 shadow-md">
          <TableRow>
            {columns.map(({ key, label }) => (
              <TableHead
                key={key}
                className="cursor-pointer text-left"
                onClick={() => handleSort(key)}
              >
                <Button variant="ghost" className="hover:bg-transparent">
                  {label}
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
            ))}
            {pathname.includes('accounting/day-books') && (
              <TableHead className="text-right">
                <Button variant="ghost" className="hover:bg-transparent">
                  Action
                </Button>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={
                  columns.length +
                  (pathname.includes('accounting/day-books') ? 1 : 0)
                }
                className="text-center py-4"
              >
                <Loader />
              </TableCell>
            </TableRow>
          ) : currentVouchers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  columns.length +
                  (pathname.includes('accounting/day-books') ? 1 : 0)
                }
                className="text-center py-4"
              >
                No voucher is available.
              </TableCell>
            </TableRow>
          ) : (
            currentVouchers.map((voucher) => (
              <TableRow key={voucher.voucherid}>
                {columns.map(({ key }) => (
                  <TableCell key={key}>
                    {key === 'voucherno' ? (
                      <Link
                        href={linkGenerator(voucher.voucherid)}
                        className="text-blue-600 hover:underline"
                      >
                        {voucher[key]}
                      </Link>
                    ) : key === 'state' ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          voucher[key] === 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {voucher[key] === 0 ? 'Draft' : 'Posted'}
                      </span>
                    ) : key === 'totalamount' ? (
                      <span className="font-mono">
                        {voucher.currency && `${voucher.currency} `}
                        {voucher[key].toFixed(2)}
                      </span>
                    ) : (
                      voucher[key]
                    )}
                  </TableCell>
                ))}
                {pathname.includes('accounting/day-books') && (
                  <TableCell className="text-right">
                    <Button
                      disabled={
                        voucher.state !== 0 || isPosting[voucher.voucherid]
                      }
                      variant={voucher.state === 0 ? 'outline' : 'outline'}
                      onClick={() =>
                        handlePostJournal(voucher.voucherid, voucher.voucherno)
                      }
                      className="min-w-[80px]"
                    >
                      {isPosting[voucher.voucherid]
                        ? 'Posting...'
                        : voucher.state === 0
                          ? 'Make Post'
                          : 'Make Post'}
                    </Button>
                  </TableCell>
                )}
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
                  currentPage === 1
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  isActive={currentPage === i + 1}
                  className="cursor-pointer"
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
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  )
}

export default VoucherList