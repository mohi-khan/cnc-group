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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import Loader from '@/utils/loader'
import { useInitializeUser, tokenAtom, userDataAtom } from '@/utils/user'
import { toast } from '@/hooks/use-toast'
import { makePostJournal } from '@/api/vouchers-api'
import { getCashReport } from '@/api/cash-report-api'
import type {
  VoucherById,
  CompanyFromLocalstorage,
  LocationFromLocalstorage,
} from '@/utils/type'
import { CustomCombobox } from '@/utils/custom-combobox'
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

  // Today's date for filtering
  const todayDate = new Date().toISOString().split('T')[0]

  // Filter states
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<
    number | undefined
  >()
  const [selectedLocationId, setSelectedLocationId] = useState<
    number | undefined
  >()
  const [openingBalance, setOpeningBalance] = useState<number | null>(null)

  // Multiple selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isBulkPosting, setIsBulkPosting] = useState(false)

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

  // Initialize companies and locations from userData
  useEffect(() => {
    if (userData) {
      setCompanies(userData.userCompanies || [])
      setLocations(userData.userLocations || [])
    }
  }, [userData])

  // Fetch opening balance for Cash Vouchers
  const fetchOpeningBalance = useCallback(async () => {
    if (!token) return

    const CashReportParams = {
      date: todayDate,
      companyId: selectedCompanyId !== undefined ? selectedCompanyId : 0,
      location: selectedLocationId !== undefined ? selectedLocationId : 0,
    }

    try {
      const response = await getCashReport(CashReportParams, token)
      const data = Array.isArray(response.data)
        ? response.data
        : response.data
          ? [response.data]
          : []

      if (
        data.length > 0 &&
        data[0].openingBal &&
        data[0].openingBal.length > 0
      ) {
        setOpeningBalance(data[0].openingBal[0].balance)
      } else {
        setOpeningBalance(null)
      }
    } catch (error) {
      console.error('Error fetching opening balance:', error)
      setOpeningBalance(null)
    }
  }, [token, todayDate, selectedCompanyId, selectedLocationId])

  useEffect(() => {
    fetchOpeningBalance()
  }, [fetchOpeningBalance])

  useEffect(() => {
    const hasChanged =
      JSON.stringify(vouchersRef.current) !== JSON.stringify(vouchers)
    if (hasChanged) {
      vouchersRef.current = vouchers
      setLocalVouchers(vouchers)
      // Reset selections when vouchers change
      setSelectedIds([])
      setSelectAll(false)
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

  // Filter vouchers based on today's date, company, and location
  const filteredVouchers = useMemo(() => {
    let filtered = [...localVouchers]

    // Filter by company if selected
    if (selectedCompanyId !== undefined) {
      filtered = filtered.filter((v) => {
        // Get company name from the voucher and match with selected company
        const selectedCompany = companies.find(
          (c) => c.company?.companyId === selectedCompanyId
        )
        return v.companyname === selectedCompany?.company?.companyName
      })
    }

    // Filter by location if selected
    if (selectedLocationId !== undefined) {
      filtered = filtered.filter((v) => {
        // Get location address from the voucher and match with selected location
        const selectedLocation = locations.find(
          (l) => l.location?.locationId === selectedLocationId
        )
        return v.location === selectedLocation?.location?.address
      })
    }

    return filtered
  }, [
    localVouchers,
    
    selectedCompanyId,
    selectedLocationId,
    companies,
    locations,
  ])

  const sortedVouchers = useMemo(() => {
    return [...filteredVouchers].sort((a, b) => {
      if (a[sortField] == null || b[sortField] == null) return 0
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredVouchers, sortField, sortDirection])

  const totalPages = Math.ceil(sortedVouchers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVouchers = sortedVouchers.slice(startIndex, endIndex)

  // Check if we're on Cash Voucher list page (not day book)
  const isDayBook =
    pathname.includes('day-book') || pathname.includes('daybook')
  const isCashVoucherPage = !isDayBook

  // Show filter section if it's Cash Voucher page, regardless of whether there are vouchers
  const showFilterSection = isCashVoucherPage

  // Get only draft Cash vouchers for selection
  const draftCashVouchers = currentVouchers.filter(
    (v) => v.state === 0 && v.journaltype === 'Cash Voucher'
  )

  // Handle individual checkbox selection
  const handleIndividualSelection = (voucherId: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, voucherId])
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== voucherId))
      setSelectAll(false)
    }
  }

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedIds(draftCashVouchers.map((v) => v.voucherid))
    } else {
      setSelectedIds([])
    }
  }

  // Update select all state when individual selections change
  useEffect(() => {
    if (draftCashVouchers.length > 0) {
      setSelectAll(selectedIds.length === draftCashVouchers.length)
    }
  }, [selectedIds, draftCashVouchers.length])

  // Single posting
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

  // Bulk posting
  const handleBulkPosting = async () => {
    if (selectedIds.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select at least one voucher to post',
        variant: 'destructive',
      })
      return
    }

    if (!userData?.userId || !token) return

    try {
      setIsBulkPosting(true)
      let successCount = 0
      let failCount = 0

      for (const voucherId of selectedIds) {
        try {
          const response = await makePostJournal(
            voucherId,
            userData.userId,
            token
          )
          if (response.error || !response.data) {
            failCount++
          } else {
            successCount++
            setLocalVouchers((prev) =>
              prev.map((v) =>
                v.voucherid === voucherId ? { ...v, state: 1 } : v
              )
            )
            onJournalPosted?.(voucherId)
          }
        } catch (error) {
          failCount++
        }
      }

      if (successCount > 0) {
        toast({
          title: 'Success',
          description: `${successCount} voucher(s) posted successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to post vouchers',
          variant: 'destructive',
        })
      }

      // Reset selections after posting
      setSelectedIds([])
      setSelectAll(false)
    } catch (error) {
      console.error('Error in bulk posting:', error)
      toast({
        title: 'Error',
        description: 'Failed to post vouchers',
        variant: 'destructive',
      })
    } finally {
      setIsBulkPosting(false)
    }
  }

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

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }, [totalPages])

  const handlePageClick = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // Filtered locations based on selected company
  const filteredLocations = useMemo(() => {
    if (!selectedCompanyId) return locations
    return locations.filter(
      (loc) => loc.location?.companyId === selectedCompanyId
    )
  }, [locations, selectedCompanyId])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCompanyId, selectedLocationId])

  return (
    <>
      {/* Filter Section - Show on Cash Voucher page, always visible */}
      {showFilterSection && (
        <div className="mb-6 p-4 border rounded-lg bg-slate-50">
          <div className="grid grid-cols-3 gap-4 items-end">
            {/* Company Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Company</Label>
              <CustomCombobox
                value={
                  companies
                    .map((company) => ({
                      id: company.company?.companyId ?? 0,
                      name: company.company?.companyName,
                    }))
                    .find((item) => item.id === Number(selectedCompanyId)) ||
                  null
                }
                onChange={(item) => {
                  setSelectedCompanyId(item ? Number(item.id) : undefined)
                  setSelectedLocationId(undefined) // Reset location when company changes
                }}
                items={companies.map((company) => ({
                  id: company.company?.companyId ?? 0,
                  name: company.company?.companyName,
                }))}
                placeholder="Select Company"
              />
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Location</Label>
              <CustomCombobox
                value={
                  filteredLocations
                    .map((location) => ({
                      id: location.location?.locationId ?? 0,
                      name: location.location?.address,
                    }))
                    .find((item) => item.id === selectedLocationId) || null
                }
                onChange={(item) =>
                  setSelectedLocationId(item ? Number(item.id) : undefined)
                }
                items={filteredLocations.map((location) => ({
                  id: location.location?.locationId ?? 0,
                  name: location.location?.address,
                }))}
                placeholder="Select Location"
              />
            </div>

            {/* Opening Balance Display */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Opening Balance</Label>
              <div className="p-2 border rounded bg-white font-mono text-right font-semibold">
                {openingBalance !== null ? openingBalance : '0.00'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Button - Only show for Cash Vouchers */}
      {draftCashVouchers.length > 0 && (
        <div className="mb-4 flex justify-end">
          <Button
            type="button"
            onClick={handleBulkPosting}
            disabled={selectedIds.length === 0 || isBulkPosting}
          >
            {isBulkPosting
              ? 'Posting...'
              : `Post Selected (${selectedIds.length})`}
          </Button>
        </div>
      )}

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
            <TableHead className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span>Action</span>
                {draftCashVouchers.length > 0 && (
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    className="border border-black"
                  />
                )}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                className="text-center py-4"
              >
                <Loader />
              </TableCell>
            </TableRow>
          ) : currentVouchers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                className="text-center py-4"
              >
                No voucher is available.
              </TableCell>
            </TableRow>
          ) : (
            currentVouchers.map((voucher) => {
              const isCurrentlyPosting = isPosting[voucher.voucherid]
              const isButtonDisabled = voucher.state !== 0 || isCurrentlyPosting
              const isDraftCashVoucher =
                voucher.state === 0 && voucher.journaltype === 'Cash Voucher'
              return (
                <TableRow key={voucher.voucherid}>
                  {columns.map(({ key }) => (
                    <TableCell key={key}>
                      {key === 'voucherno' ? (
                        <Link
                          target="_blank"
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
                  <TableCell className="text-right">
                    <div className="flex gap-2 items-center justify-end">
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
                      {isDraftCashVoucher && (
                        <Checkbox
                          checked={selectedIds.includes(voucher.voucherid)}
                          onCheckedChange={(checked) =>
                            handleIndividualSelection(
                              voucher.voucherid,
                              checked as boolean
                            )
                          }
                        />
                      )}
                    </div>
                  </TableCell>
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

      {/* Popup Section */}
      {isEditOpen && (
        <>
          {editVoucherData?.[0]?.journaltype !== 'Journal Voucher' &&
          editVoucherData?.[0]?.journaltype !== 'Contra Voucher' ? (
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="max-w-7xl p-0">
                <DialogHeader>
                  <DialogTitle className="px-6 pt-6 text-2xl">
                    {editVoucherData?.[0]?.journaltype === 'Bank Voucher' && (
                      <span>Bank Voucher</span>
                    )}
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
                        isOpen={isEditOpen}
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
                      isOpen={isEditOpen}
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



// 'use client'

// import type React from 'react'
// import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
// import Link from 'next/link'
// import { usePathname, useRouter } from 'next/navigation'
// import { useAtom } from 'jotai'
// import { ArrowUpDown } from 'lucide-react'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from '@/components/ui/pagination'
// import { Button } from '@/components/ui/button'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import { Checkbox } from '@/components/ui/checkbox'
// import { Label } from '@/components/ui/label'
// import Loader from '@/utils/loader'
// import { useInitializeUser, tokenAtom, userDataAtom } from '@/utils/user'
// import { toast } from '@/hooks/use-toast'
// import { makePostJournal } from '@/api/vouchers-api'
// import { getCashReport } from '@/api/cash-report-api'
// import type {
//   VoucherById,
//   CompanyFromLocalstorage,
//   LocationFromLocalstorage,
// } from '@/utils/type'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import VoucherEditContent from './voucher-edit-content'
// import { getSingleVoucher } from '@/api/journal-voucher-api'

// // Local types matching your list data shape
// interface JournalDetail {
//   id?: number
//   notes?: string
//   accountId: number
//   costCenterId?: number | null
//   departmentId?: number | null
//   debit: number
//   credit: number
//   balance?: string
//   taxDebit?: number
//   taxCredit?: number
//   fcDebit?: number
//   resPartnerId?: number | null
//   bankaccountid?: number | null
//   updatedBy?: number | null
// }

// interface Voucher {
//   voucherid: number
//   voucherno: string
//   date: string
//   notes: string | null
//   companyname: string | null
//   location: string | null
//   currency: string | null
//   state: number
//   totalamount: number
//   journaltype: string
//   journalDetails?: JournalDetail[]
// }

// export interface Column {
//   key: keyof Voucher
//   label: string
// }

// interface VoucherListProps {
//   vouchers: Voucher[]
//   columns: Column[]
//   isLoading: boolean
//   linkGenerator: (voucherId: number) => string
//   itemsPerPage?: number
//   onJournalPosted?: (voucherId: number) => void
// }

// const VoucherList: React.FC<VoucherListProps> = ({
//   vouchers,
//   columns,
//   isLoading,
//   linkGenerator,
//   itemsPerPage = 10,
//   onJournalPosted,
// }) => {
//   const pathname = usePathname()
//   const router = useRouter()
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [sortField, setSortField] = useState<keyof Voucher>('voucherno')
//   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
//   const [isPosting, setIsPosting] = useState<Record<number, boolean>>({})

//   // Today's date for filtering
//   const todayDate = new Date().toISOString().split('T')[0]

//   // Filter states
//   const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
//   const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
//   const [selectedCompanyId, setSelectedCompanyId] = useState<
//     number | undefined
//   >()
//   const [selectedLocationId, setSelectedLocationId] = useState<
//     number | undefined
//   >()
//   const [openingBalance, setOpeningBalance] = useState<number>(0)

//   // Multiple selection state
//   const [selectedIds, setSelectedIds] = useState<number[]>([])
//   const [selectAll, setSelectAll] = useState(false)
//   const [isBulkPosting, setIsBulkPosting] = useState(false)

//   // Edit popup state
//   const [isEditOpen, setIsEditOpen] = useState(false)
//   const [editVoucherId, setEditVoucherId] = useState<number | null>(null)
//   const [editVoucherData, setEditVoucherData] = useState<VoucherById[] | null>(
//     null
//   )
//   const [isEditLoading, setIsEditLoading] = useState(false)

//   // Keep a local copy of vouchers
//   const vouchersRef = useRef<Voucher[]>(vouchers)
//   const [localVouchers, setLocalVouchers] = useState<Voucher[]>(vouchers)

//   // Initialize companies and locations from userData
//   useEffect(() => {
//     if (userData) {
//       setCompanies(userData.userCompanies || [])
//       setLocations(userData.userLocations || [])
//     }
//   }, [userData])

//   // Fetch opening balance for Cash Vouchers
//   const fetchOpeningBalance = useCallback(async () => {
//     if (!token) return

//     const CashReportParams = {
//       date: todayDate,
//       companyId: selectedCompanyId !== undefined ? selectedCompanyId : 0,
//       location: selectedLocationId !== undefined ? selectedLocationId : 0,
//     }

//     try {
//       const response = await getCashReport(CashReportParams, token)
//       const data = Array.isArray(response.data)
//         ? response.data
//         : response.data
//           ? [response.data]
//           : []

//       if (
//         data.length > 0 &&
//         data[0].openingBal &&
//         data[0].openingBal.length > 0
//       ) {
//         // Convert to number to ensure it's always a number type
//         setOpeningBalance(Number(data[0].openingBal[0].balance) || 0)
//       } else {
//         setOpeningBalance(0)
//       }
//     } catch (error) {
//       console.error('Error fetching opening balance:', error)
//       setOpeningBalance(0)
//     }
//   }, [token, todayDate, selectedCompanyId, selectedLocationId])

//   useEffect(() => {
//     fetchOpeningBalance()
//   }, [fetchOpeningBalance])

//   useEffect(() => {
//     const hasChanged =
//       JSON.stringify(vouchersRef.current) !== JSON.stringify(vouchers)
//     if (hasChanged) {
//       vouchersRef.current = vouchers
//       setLocalVouchers(vouchers)
//       // Reset selections when vouchers change
//       setSelectedIds([])
//       setSelectAll(false)
//     }
//   }, [vouchers])

//   const handleSort = useCallback((field: keyof Voucher) => {
//     setSortField((prevField) => {
//       if (field === prevField) {
//         setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
//       } else {
//         setSortDirection('asc')
//       }
//       return field
//     })
//   }, [])

//   // Filter vouchers based on today's date, company, and location
//   const filteredVouchers = useMemo(() => {
//     let filtered = [...localVouchers]

//     // Filter by company if selected
//     if (selectedCompanyId !== undefined) {
//       filtered = filtered.filter((v) => {
//         // Get company name from the voucher and match with selected company
//         const selectedCompany = companies.find(
//           (c) => c.company?.companyId === selectedCompanyId
//         )
//         return v.companyname === selectedCompany?.company?.companyName
//       })
//     }

//     // Filter by location if selected
//     if (selectedLocationId !== undefined) {
//       filtered = filtered.filter((v) => {
//         // Get location address from the voucher and match with selected location
//         const selectedLocation = locations.find(
//           (l) => l.location?.locationId === selectedLocationId
//         )
//         return v.location === selectedLocation?.location?.address
//       })
//     }

//     return filtered
//   }, [
//     localVouchers,
//     selectedCompanyId,
//     selectedLocationId,
//     companies,
//     locations,
//   ])

//   const sortedVouchers = useMemo(() => {
//     return [...filteredVouchers].sort((a, b) => {
//       if (a[sortField] == null || b[sortField] == null) return 0
//       if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1
//       if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1
//       return 0
//     })
//   }, [filteredVouchers, sortField, sortDirection])

//   const totalPages = Math.ceil(sortedVouchers.length / itemsPerPage)
//   const startIndex = (currentPage - 1) * itemsPerPage
//   const endIndex = startIndex + itemsPerPage
//   const currentVouchers = sortedVouchers.slice(startIndex, endIndex)

//   // Check if we're on Cash Voucher list page (not day book)
//   const isDayBook =
//     pathname.includes('day-book') || pathname.includes('daybook')
//   const isCashVoucherPage = !isDayBook

//   // Show filter section if it's Cash Voucher page, regardless of whether there are vouchers
//   const showFilterSection = isCashVoucherPage

//   // Get only draft Cash vouchers for selection
//   const draftCashVouchers = currentVouchers.filter(
//     (v) => v.state === 0 && v.journaltype === 'Cash Voucher'
//   )

//   // Handle individual checkbox selection
//   const handleIndividualSelection = (voucherId: number, checked: boolean) => {
//     if (checked) {
//       setSelectedIds((prev) => [...prev, voucherId])
//     } else {
//       setSelectedIds((prev) => prev.filter((id) => id !== voucherId))
//       setSelectAll(false)
//     }
//   }

//   // Handle select all checkbox
//   const handleSelectAll = (checked: boolean) => {
//     setSelectAll(checked)
//     if (checked) {
//       setSelectedIds(draftCashVouchers.map((v) => v.voucherid))
//     } else {
//       setSelectedIds([])
//     }
//   }

//   // Update select all state when individual selections change
//   useEffect(() => {
//     if (draftCashVouchers.length > 0) {
//       setSelectAll(selectedIds.length === draftCashVouchers.length)
//     }
//   }, [selectedIds, draftCashVouchers.length])

//   // Single posting
//   const handlePostJournal = useCallback(
//     async (voucherId: number) => {
//       if (!userData?.userId || !token) return
//       try {
//         setIsPosting((prev) => ({ ...prev, [voucherId]: true }))
//         const response = await makePostJournal(
//           voucherId,
//           userData.userId,
//           token
//         )
//         if (response.error || !response.data) {
//           toast({
//             title: 'Error',
//             description: response.error?.message || 'Failed to post journal',
//             variant: 'destructive',
//           })
//         } else {
//           toast({
//             title: 'Success',
//             description: 'Journal posted successfully',
//           })
//           setLocalVouchers((prev) =>
//             prev.map((v) =>
//               v.voucherid === voucherId ? { ...v, state: 1 } : v
//             )
//           )
//           onJournalPosted?.(voucherId)
//         }
//       } catch (error) {
//         console.error('Error posting journal:', error)
//         toast({
//           title: 'Error',
//           description: 'Failed to post journal',
//           variant: 'destructive',
//         })
//       } finally {
//         setIsPosting((prev) => ({ ...prev, [voucherId]: false }))
//       }
//     },
//     [userData?.userId, token, onJournalPosted]
//   )

//   // Bulk posting
//   const handleBulkPosting = async () => {
//     if (selectedIds.length === 0) {
//       toast({
//         title: 'Warning',
//         description: 'Please select at least one voucher to post',
//         variant: 'destructive',
//       })
//       return
//     }

//     if (!userData?.userId || !token) return

//     try {
//       setIsBulkPosting(true)
//       let successCount = 0
//       let failCount = 0

//       for (const voucherId of selectedIds) {
//         try {
//           const response = await makePostJournal(
//             voucherId,
//             userData.userId,
//             token
//           )
//           if (response.error || !response.data) {
//             failCount++
//           } else {
//             successCount++
//             setLocalVouchers((prev) =>
//               prev.map((v) =>
//                 v.voucherid === voucherId ? { ...v, state: 1 } : v
//               )
//             )
//             onJournalPosted?.(voucherId)
//           }
//         } catch (error) {
//           failCount++
//         }
//       }

//       if (successCount > 0) {
//         toast({
//           title: 'Success',
//           description: `${successCount} voucher(s) posted successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
//         })
//       } else {
//         toast({
//           title: 'Error',
//           description: 'Failed to post vouchers',
//           variant: 'destructive',
//         })
//       }

//       // Reset selections after posting
//       setSelectedIds([])
//       setSelectAll(false)
//     } catch (error) {
//       console.error('Error in bulk posting:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to post vouchers',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsBulkPosting(false)
//     }
//   }

//   // Edit click: open dialog and fetch details
//   const openEditPopup = useCallback(
//     async (voucher: Voucher) => {
//       if (!token) {
//         toast({
//           title: 'Unauthorized',
//           description: 'Missing token',
//           variant: 'destructive',
//         })
//         return
//       }
//       setIsEditOpen(true)
//       setEditVoucherId(voucher.voucherid)
//       setIsEditLoading(true)
//       setEditVoucherData(null)
//       try {
//         const response = await getSingleVoucher(voucher.voucherid, token)
//         if (response?.error?.status === 401) {
//           router.push('/unauthorized-access')
//           return
//         }
//         if (response.error || !response.data) {
//           toast({
//             title: 'Error',
//             description:
//               response.error?.message || 'Failed to load voucher details',
//             variant: 'destructive',
//           })
//           setIsEditOpen(false)
//           return
//         }
//         setEditVoucherData(response.data as VoucherById[])
//       } catch (error) {
//         console.error('Error fetching voucher details:', error)
//         toast({
//           title: 'Error',
//           description: 'Failed to load voucher details',
//           variant: 'destructive',
//         })
//         setIsEditOpen(false)
//       } finally {
//         setIsEditLoading(false)
//       }
//     },
//     [router, token]
//   )

//   const handlePreviousPage = useCallback(() => {
//     setCurrentPage((prev) => Math.max(prev - 1, 1))
//   }, [])

//   const handleNextPage = useCallback(() => {
//     setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//   }, [totalPages])

//   const handlePageClick = useCallback((page: number) => {
//     setCurrentPage(page)
//   }, [])

//   // Filtered locations based on selected company
//   const filteredLocations = useMemo(() => {
//     if (!selectedCompanyId) return locations
//     return locations.filter(
//       (loc) => loc.location?.companyId === selectedCompanyId
//     )
//   }, [locations, selectedCompanyId])

//   // Reset to page 1 when filters change
//   useEffect(() => {
//     setCurrentPage(1)
//   }, [selectedCompanyId, selectedLocationId])

//   return (
//     <>
//       {/* Filter Section - Show on Cash Voucher page, always visible */}
//       {showFilterSection && (
//         <div className="mb-6 p-4 border rounded-lg bg-slate-50">
//           <div className="grid grid-cols-3 gap-4 items-end">
//             {/* Company Filter */}
//             <div className="space-y-2">
//               <Label className="text-sm font-medium">Company</Label>
//               <CustomCombobox
//                 value={
//                   companies
//                     .map((company) => ({
//                       id: company.company?.companyId ?? 0,
//                       name: company.company?.companyName,
//                     }))
//                     .find((item) => item.id === Number(selectedCompanyId)) ||
//                   null
//                 }
//                 onChange={(item) => {
//                   setSelectedCompanyId(item ? Number(item.id) : undefined)
//                   setSelectedLocationId(undefined) // Reset location when company changes
//                 }}
//                 items={companies.map((company) => ({
//                   id: company.company?.companyId ?? 0,
//                   name: company.company?.companyName,
//                 }))}
//                 placeholder="Select Company"
//               />
//             </div>

//             {/* Location Filter */}
//             <div className="space-y-2">
//               <Label className="text-sm font-medium">Location</Label>
//               <CustomCombobox
//                 value={
//                   filteredLocations
//                     .map((location) => ({
//                       id: location.location?.locationId ?? 0,
//                       name: location.location?.address,
//                     }))
//                     .find((item) => item.id === selectedLocationId) || null
//                 }
//                 onChange={(item) =>
//                   setSelectedLocationId(item ? Number(item.id) : undefined)
//                 }
//                 items={filteredLocations.map((location) => ({
//                   id: location.location?.locationId ?? 0,
//                   name: location.location?.address,
//                 }))}
//                 placeholder="Select Location"
//               />
//             </div>

//             {/* Opening Balance Display */}
//             <div className="space-y-2">
//               <Label className="text-sm font-medium">Opening Balance</Label>
//               <div className="p-2 border rounded bg-white font-mono text-right font-semibold">
//                 {openingBalance.toFixed(2)}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Bulk Action Button - Only show for Cash Vouchers */}
//       {draftCashVouchers.length > 0 && (
//         <div className="mb-4 flex justify-end">
//           <Button
//             type="button"
//             onClick={handleBulkPosting}
//             disabled={selectedIds.length === 0 || isBulkPosting}
//           >
//             {isBulkPosting
//               ? 'Posting...'
//               : `Post Selected (${selectedIds.length})`}
//           </Button>
//         </div>
//       )}

//       <Table className="border shadow-md">
//         <TableHeader className="sticky top-28 bg-slate-200 shadow-md">
//           <TableRow>
//             {columns.map(({ key, label }) => (
//               <TableHead
//                 key={key}
//                 className="cursor-pointer text-left"
//                 onClick={() => handleSort(key)}
//               >
//                 <Button variant="ghost" className="hover:bg-transparent">
//                   {label}
//                   <ArrowUpDown className="h-4 w-4" />
//                 </Button>
//               </TableHead>
//             ))}
//             <TableHead className="text-right">
//               <div className="flex items-center justify-end gap-2">
//                 <span>Action</span>
//                 {draftCashVouchers.length > 0 && (
//                   <Checkbox
//                     checked={selectAll}
//                     onCheckedChange={handleSelectAll}
//                     className="border border-black"
//                   />
//                 )}
//               </div>
//             </TableHead>
//           </TableRow>
//         </TableHeader>

//         <TableBody>
//           {isLoading ? (
//             <TableRow>
//               <TableCell
//                 colSpan={columns.length + 1}
//                 className="text-center py-4"
//               >
//                 <Loader />
//               </TableCell>
//             </TableRow>
//           ) : currentVouchers.length === 0 ? (
//             <TableRow>
//               <TableCell
//                 colSpan={columns.length + 1}
//                 className="text-center py-4"
//               >
//                 No voucher is available.
//               </TableCell>
//             </TableRow>
//           ) : (
//             currentVouchers.map((voucher) => {
//               const isCurrentlyPosting = isPosting[voucher.voucherid]
//               const isButtonDisabled = voucher.state !== 0 || isCurrentlyPosting
//               const isDraftCashVoucher =
//                 voucher.state === 0 && voucher.journaltype === 'Cash Voucher'
//               return (
//                 <TableRow key={voucher.voucherid}>
//                   {columns.map(({ key }) => (
//                     <TableCell key={key}>
//                       {key === 'voucherno' ? (
//                         <Link
//                           target="_blank"
//                           href={linkGenerator(voucher.voucherid)}
//                           className="text-blue-600 hover:underline"
//                         >
//                           {voucher[key]}
//                         </Link>
//                       ) : key === 'state' ? (
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs font-medium ${
//                             voucher[key] === 0
//                               ? 'bg-yellow-100 text-yellow-800'
//                               : 'bg-green-100 text-green-800'
//                           }`}
//                         >
//                           {voucher[key] === 0 ? 'Draft' : 'Posted'}
//                         </span>
//                       ) : key === 'totalamount' ? (
//                         <span className="font-mono">
//                           {voucher.currency && `${voucher.currency} `}
//                           {voucher[key].toFixed(2)}
//                         </span>
//                       ) : Array.isArray(voucher[key]) ? (
//                         JSON.stringify(voucher[key])
//                       ) : (
//                         voucher[key]
//                       )}
//                     </TableCell>
//                   ))}
//                   <TableCell className="text-right">
//                     <div className="flex gap-2 items-center justify-end">
//                       <Button
//                         disabled={isButtonDisabled}
//                         variant="outline"
//                         onClick={() => handlePostJournal(voucher.voucherid)}
//                         className="min-w-[80px]"
//                       >
//                         {isCurrentlyPosting ? 'Posting...' : 'Make Post'}
//                       </Button>
//                       <Button
//                         disabled={voucher.state !== 0}
//                         variant="outline"
//                         onClick={() => openEditPopup(voucher)}
//                         className="min-w-[80px]"
//                       >
//                         Edit
//                       </Button>
//                       {isDraftCashVoucher && (
//                         <Checkbox
//                           checked={selectedIds.includes(voucher.voucherid)}
//                           onCheckedChange={(checked) =>
//                             handleIndividualSelection(
//                               voucher.voucherid,
//                               checked as boolean
//                             )
//                           }
//                         />
//                       )}
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               )
//             })
//           )}
//         </TableBody>
//       </Table>

//       {totalPages > 1 && (
//         <Pagination className="mt-4">
//           <PaginationContent>
//             <PaginationItem>
//               <PaginationPrevious
//                 onClick={handlePreviousPage}
//                 className={
//                   currentPage === 1
//                     ? 'pointer-events-none opacity-50'
//                     : 'cursor-pointer'
//                 }
//               />
//             </PaginationItem>
//             {[...Array(totalPages)].map((_, i) => (
//               <PaginationItem key={i}>
//                 <PaginationLink
//                   onClick={() => handlePageClick(i + 1)}
//                   isActive={currentPage === i + 1}
//                   className="cursor-pointer"
//                 >
//                   {i + 1}
//                 </PaginationLink>
//               </PaginationItem>
//             ))}
//             <PaginationItem>
//               <PaginationNext
//                 onClick={handleNextPage}
//                 className={
//                   currentPage === totalPages
//                     ? 'pointer-events-none opacity-50'
//                     : 'cursor-pointer'
//                 }
//               />
//             </PaginationItem>
//           </PaginationContent>
//         </Pagination>
//       )}

//       {/* Popup Section */}
//       {isEditOpen && (
//         <>
//           {editVoucherData?.[0]?.journaltype !== 'Journal Voucher' &&
//           editVoucherData?.[0]?.journaltype !== 'Contra Voucher' ? (
//             <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
//               <DialogContent className="max-w-7xl p-0">
//                 <DialogHeader>
//                   <DialogTitle className="px-6 pt-6 text-2xl">
//                     {editVoucherData?.[0]?.journaltype === 'Bank Voucher' && (
//                       <span>Bank Voucher</span>
//                     )}
//                   </DialogTitle>
//                 </DialogHeader>
//                 <div className="p-6">
//                   {isEditLoading && (
//                     <div className="flex items-center justify-center py-12">
//                       <Loader />
//                     </div>
//                   )}
//                   {!isEditLoading &&
//                     editVoucherData &&
//                     userData?.userId != null && (
//                       <VoucherEditContent
//                         voucherData={editVoucherData}
//                         userId={userData.userId}
//                         onClose={() => setIsEditOpen(false)}
//                         isOpen={isEditOpen}
//                       />
//                     )}
//                   {!isEditLoading && !editVoucherData && (
//                     <p className="text-sm text-muted-foreground">
//                       Unable to load voucher details.
//                     </p>
//                   )}
//                 </div>
//               </DialogContent>
//             </Dialog>
//           ) : (
//             <div className="max-w-7xl p-0">
//               <div className="p-6">
//                 {isEditLoading && (
//                   <div className="flex items-center justify-center py-12">
//                     <Loader />
//                   </div>
//                 )}
//                 {!isEditLoading &&
//                   editVoucherData &&
//                   userData?.userId != null && (
//                     <VoucherEditContent
//                       voucherData={editVoucherData}
//                       userId={userData.userId}
//                       onClose={() => setIsEditOpen(false)}
//                       isOpen={isEditOpen}
//                     />
//                   )}
//                 {!isEditLoading && !editVoucherData && (
//                   <p className="text-sm text-muted-foreground">
//                     Unable to load voucher details.
//                   </p>
//                 )}
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </>
//   )
// }

// export default VoucherList


