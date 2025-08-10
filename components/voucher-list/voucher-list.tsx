'use client'

import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAtom } from 'jotai'
import { ArrowUpDown } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Loader from '@/utils/loader'
import { useInitializeUser, tokenAtom, userDataAtom } from '@/utils/user'
import { toast } from '@/hooks/use-toast'
import { makePostJournal } from '@/api/vouchers-api'
import type { VoucherById } from '@/utils/type'
import VoucherEditContent from './voucher-edit-content'
import { getSingleVoucher } from '@/api/journal-voucher-api'

// Local types matching your list data shape
interface JournalDetail {
  id?: number
  notes?: string
  accountId: number
  costCenterId?: number | null
  departmentId?: number | null
  debit: number
  credit: number
  balance?: string
  taxDebit?: number
  taxCredit?: number
  fcDebit?: number
  resPartnerId?: number | null
  bankaccountid?: number | null
  updatedBy?: number | null
}

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
  journalDetails?: JournalDetail[]
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
  const router = useRouter()
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Voucher>('voucherno')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isPosting, setIsPosting] = useState<Record<number, boolean>>({})

  // Edit popup state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editVoucherId, setEditVoucherId] = useState<number | null>(null)
  const [editVoucherData, setEditVoucherData] = useState<VoucherById[] | null>(
    null
  )
  const [isEditLoading, setIsEditLoading] = useState(false)

  // Keep a local copy of vouchers
  const vouchersRef = useRef<Voucher[]>(vouchers)
  const [localVouchers, setLocalVouchers] = useState<Voucher[]>(vouchers)

  // Only update local vouchers if changed
  useEffect(() => {
    const hasChanged =
      JSON.stringify(vouchersRef.current) !== JSON.stringify(vouchers)
    if (hasChanged) {
      vouchersRef.current = vouchers
      setLocalVouchers(vouchers)
    }
  }, [vouchers])

  const handleSort = useCallback((field: keyof Voucher) => {
    setSortField((prevField) => {
      if (field === prevField) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortDirection('asc')
      }
      return field
    })
  }, [])

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

  // Posting
  const handlePostJournal = useCallback(
    async (voucherId: number) => {
      if (!userData?.userId || !token) return
      try {
        setIsPosting((prev) => ({ ...prev, [voucherId]: true }))
        const response = await makePostJournal(
          voucherId,
          userData.userId,
          token
        )
        if (response.error || !response.data) {
          toast({
            title: 'Error',
            description: response.error?.message || 'Failed to post journal',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Success',
            description: 'Journal posted successfully',
          })
          setLocalVouchers((prev) =>
            prev.map((v) =>
              v.voucherid === voucherId ? { ...v, state: 1 } : v
            )
          )
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
    },
    [userData?.userId, token, onJournalPosted]
  )

  // Edit click: open dialog and fetch details
  const openEditPopup = useCallback(
    async (voucher: Voucher) => {
      if (!token) {
        toast({
          title: 'Unauthorized',
          description: 'Missing token',
          variant: 'destructive',
        })
        return
      }
      setIsEditOpen(true)
      setEditVoucherId(voucher.voucherid)
      setIsEditLoading(true)
      setEditVoucherData(null)
      try {
        const response = await getSingleVoucher(voucher.voucherid, token)
        if (response?.error?.status === 401) {
          router.push('/unauthorized-access')
          return
        }
        if (response.error || !response.data) {
          toast({
            title: 'Error',
            description:
              response.error?.message || 'Failed to load voucher details',
            variant: 'destructive',
          })
          setIsEditOpen(false)
          return
        }
        setEditVoucherData(response.data as VoucherById[])
        console.log('🚀 ~ VoucherList ~ response.data:', response.data)
      } catch (error) {
        console.error('Error fetching voucher details:', error)
        toast({
          title: 'Error',
          description: 'Failed to load voucher details',
          variant: 'destructive',
        })
        setIsEditOpen(false)
      } finally {
        setIsEditLoading(false)
      }
    },
    [router, token]
  )

  // After successful edit, optionally refresh or patch list
  const handleEdited = useCallback((voucherId: number) => {
    // Option 1: optimistic patch (if you can compute new totals/notes locally)
    // Option 2: trigger a parent refresh outside this component
    // For now, we simply close the dialog (handled in child) and leave list as-is.
    // You can add a refetch callback via props if needed.
    // no-op
  }, [])

  // Pagination handlers
  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }, [totalPages])

  const handlePageClick = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

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
            currentVouchers.map((voucher) => {
              const isCurrentlyPosting = isPosting[voucher.voucherid]
              const isButtonDisabled = voucher.state !== 0 || isCurrentlyPosting
              return (
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
                      ) : Array.isArray(voucher[key]) ? (
                        JSON.stringify(voucher[key])
                      ) : (
                        voucher[key]
                      )}
                    </TableCell>
                  ))}
                  {pathname.includes('accounting/day-books') && (
                    <TableCell className="text-right flex gap-2">
                      <Button
                        disabled={isButtonDisabled}
                        variant="outline"
                        onClick={() => handlePostJournal(voucher.voucherid)}
                        className="min-w-[80px]"
                      >
                        {isCurrentlyPosting ? 'Posting...' : 'Make Post'}
                      </Button>
                      <Button
                        disabled={voucher.state !== 0}
                        variant="outline"
                        onClick={() => openEditPopup(voucher)}
                        className="min-w-[80px]"
                      >
                        Edit
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePreviousPage}
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
                  onClick={() => handlePageClick(i + 1)}
                  isActive={currentPage === i + 1}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={handleNextPage}
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

      {/* Conditionally render the entire popup structure based on isEditOpen */}
      {isEditOpen && (
        <>
          {editVoucherData?.[0]?.journaltype !== 'Journal Voucher' &&
          editVoucherData?.[0]?.journaltype !== 'Contra Voucher' ? (
            // For Cash/Bank Vouchers, VoucherList provides the Dialog
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="max-w-7xl p-0">
                <DialogHeader >
                  <DialogTitle className="px-6 pt-6 text-2xl">
                    {editVoucherData?.[0]?.journaltype === 'Bank Voucher' && <span>Bank Voucher</span>}
                  </DialogTitle>
                </DialogHeader>
                <div className="p-6">
                  {isEditLoading && (
                    <div className="flex items-center justify-center py-12">
                      <Loader />
                    </div>
                  )}
                  {!isEditLoading &&
                    editVoucherData &&
                    userData?.userId != null && (
                      <VoucherEditContent
                        voucherData={editVoucherData}
                        userId={userData.userId}
                        onClose={() => setIsEditOpen(false)}
                        isOpen={isEditOpen} // Pass isOpen prop
                      />
                    )}
                  {!isEditLoading && !editVoucherData && (
                    <p className="text-sm text-muted-foreground">
                      Unable to load voucher details.
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            // For Journal/Contra Vouchers, VoucherEditContent renders its own Dialog.
            // This div provides a title and loading state, and VoucherEditContent will render the actual popup.
            <div className="max-w-7xl p-0">
              <div className="p-6">
                {isEditLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader />
                  </div>
                )}
                {!isEditLoading &&
                  editVoucherData &&
                  userData?.userId != null && (
                    <VoucherEditContent
                      voucherData={editVoucherData}
                      userId={userData.userId}
                      onClose={() => setIsEditOpen(false)}
                      isOpen={isEditOpen} // Pass isOpen prop
                    />
                  )}
                {!isEditLoading && !editVoucherData && (
                  <p className="text-sm text-muted-foreground">
                    Unable to load voucher details.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default VoucherList
