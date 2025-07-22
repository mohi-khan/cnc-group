'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import React from 'react'

import type { CurrencyType, GetPaymentOrder } from '@/utils/type'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { approveInvoice } from '@/api/payment-requisition-api'
import { PaymentRequisitionPopup } from './payment-requisition-popup'
import { useReactToPrint } from 'react-to-print'
import { toWords } from 'number-to-words'
import { getAllCurrency } from '@/api/common-shared-api'
import { useRouter } from 'next/navigation'

type SortField = keyof GetPaymentOrder
type SortDirection = 'asc' | 'desc' | null

interface PaymentRequisitionListProps {
  requisitions: GetPaymentOrder[]
  token: string
  onRefresh: () => void
}

const PaymentRequisitionList: React.FC<PaymentRequisitionListProps> = ({
  requisitions,
  token,
  onRefresh,
}) => {
  const router = useRouter()
  // State variables
  const { toast } = useToast()
  const [isApproving, setIsApproving] = useState(false)
  const [selectedRequisition, setSelectedRequisition] =
    useState<GetPaymentOrder | null>(null)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [paymentPopupOpen, setPaymentPopupOpen] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<string>('')
  const [currency, setCurrency] = useState<CurrencyType[]>([])
  const checkRef = useRef<HTMLDivElement>(null)
  const printCheckFn = useReactToPrint({ contentRef: checkRef })

  // Search and Sort states
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage] = useState(10)

  const handleApproveClick = (requisition: GetPaymentOrder) => {
    setSelectedRequisition(requisition)
    setApprovalDialogOpen(true)
  }

  const handleActionClick = (requisition: GetPaymentOrder, status: string) => {
    setSelectedRequisition(requisition)
    setCurrentStatus(status)
    setPaymentPopupOpen(true)
  }

  const fetchCurrency = useCallback(async () => {
    if (!token) return
    try {
      const response = await getAllCurrency(token)
      
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        
        return
      } else if (response.error || !response.data) {
        console.error('Error fetching currency:', response.error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error?.message || 'Failed to fetch currency',
        })
        return
      } else if (response && response.data) {
        
        setCurrency(response.data)
        
      } else {
        console.error('Invalid response format from getAllcurrency:', response)
      }
    } catch (error) {
      console.error('Error fetching currency:', error)
    }
  }, [token, router, toast])

  useEffect(() => {
    fetchCurrency()
  }, [fetchCurrency])

  const handleApproveInvoice = async () => {
    if (!selectedRequisition) return
    try {
      setIsApproving(true)
      // Prepare the data for approval
      const approvalData = {
        invoiceId: '5',
        approvalStatus: 'Approved',
        approvedBy: '1',
        poId: '10',
      }
      await approveInvoice(approvalData, token)
      // Only show success toast and close dialog if API call succeeds
      toast({
        title: 'Invoice approved',
        description: `Invoice for PO ${selectedRequisition.poNo} has been approved successfully.`,
      })
      // Close dialog and refresh data
      setApprovalDialogOpen(false)
      onRefresh()
    } catch (error) {
      console.error('Error approving invoice:', error)
      toast({
        title: 'Approval failed',
        description:
          'There was an error approving the invoice. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsApproving(false)
    }
  }

  // Search and Sort functions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortField(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="ml-2 h-4 w-4" />
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />
  }

  // Filter and sort requisitions
  const filteredAndSortedRequisitions = React.useMemo(() => {
    const filtered = requisitions.filter((req) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        req.companyName?.toLowerCase().includes(searchLower) ||
        req.poNo?.toLowerCase().includes(searchLower) ||
        req.vendorName?.toLowerCase().includes(searchLower) ||
        req.amount?.toString().toLowerCase().includes(searchLower) ||
        req.reqNo?.toLowerCase().includes(searchLower) ||
        req.preparedBy?.toLowerCase().includes(searchLower) ||
        req.status?.toLowerCase().includes(searchLower)
      )
    })

    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aValue = a[sortField]
        let bValue = b[sortField]

        // Handle different data types
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (aValue < bValue) {
          return sortDirection === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortDirection === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [requisitions, searchTerm, sortField, sortDirection])

  // Reset current page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  if (!requisitions || requisitions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-xl font-light">
        No payment requisitions available
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="flex items-center justify-between mb-4">
         <div>
        <h1 className="text-2xl font-bold">Payment Requisition</h1>
      </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requisitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <Table className="border shadow-md">
        <TableHeader className="border bg-slate-200 shadow-md">
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('companyName')}
                className="h-auto p-0 font-semibold"
              >
                Company Name
                {getSortIcon('companyName')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('poNo')}
                className="h-auto p-0 font-semibold"
              >
                PO Number
                {getSortIcon('poNo')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('vendorName')}
                className="h-auto p-0 font-semibold"
              >
                Vendor
                {getSortIcon('vendorName')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('amount')}
                className="h-auto p-0 font-semibold"
              >
                Amount
                {getSortIcon('amount')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('PurDate')}
                className="h-auto p-0 font-semibold"
              >
                Purchase Date
                {getSortIcon('PurDate')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('reqNo')}
                className="h-auto p-0 font-semibold"
              >
                Req No
                {getSortIcon('reqNo')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('preparedBy')}
                className="h-auto p-0 font-semibold"
              >
                Prepared By
                {getSortIcon('preparedBy')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('status')}
                className="h-auto p-0 font-semibold"
              >
                Status
                {getSortIcon('status')}
              </Button>
            </TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedRequisitions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                {searchTerm
                  ? 'No requisitions found matching your search.'
                  : 'No payment requisitions available'}
              </TableCell>
            </TableRow>
          ) : (
            filteredAndSortedRequisitions
              .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
              .map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">
                    {req.companyName}
                  </TableCell>
                  <TableCell>{req.poNo}</TableCell>
                  <TableCell>{req.vendorName}</TableCell>
                  <TableCell>
                    {req.amount}{' '}
                    {
                      currency.find(
                        (c) => String(c.currencyId) === String(req.currency)
                      )?.currencyCode
                    }
                  </TableCell>
                  <TableCell>
                    {new Date(req.PurDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{req.reqNo}</TableCell>
                  <TableCell>{req.preparedBy}</TableCell>
                  <TableCell>{req.status}</TableCell>
                  <TableCell className="text-right">
                    {req.status === 'Invoice Created' && (
                      <Button size="sm" onClick={() => handleApproveClick(req)}>
                        Approve Invoice
                      </Button>
                    )}
                    {req.status === 'Invoice Approved' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleActionClick(req, 'Invoice Approved')
                        }
                      >
                        Create Payment
                      </Button>
                    )}
                    {req.status === 'GRN Completed' && (
                      <Button
                        size="sm"
                        onClick={() => handleActionClick(req, 'GRN Completed')}
                      >
                        Create Invoice
                      </Button>
                    )}
                    {req.status === 'Purchase Order' && (
                      <Button
                        size="sm"
                        onClick={() => handleActionClick(req, 'Purchase Order')}
                      >
                        Create Advance
                      </Button>
                    )}
                    {req.status === 'Invoice Approved' && (
                      <Button
                        size="sm"
                        className="ml-3"
                        onClick={() => printCheckFn()}
                      >
                        Print Check
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {filteredAndSortedRequisitions.length > 0 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
            {Math.min(
              currentPage * rowsPerPage,
              filteredAndSortedRequisitions.length
            )}{' '}
            of {filteredAndSortedRequisitions.length} requisitions
            {searchTerm && ` (filtered from ${requisitions.length} total)`}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                  }
                />
              </PaginationItem>
              {[
                ...Array(
                  Math.ceil(filteredAndSortedRequisitions.length / rowsPerPage)
                ),
              ].map((_, index) => {
                if (
                  index === 0 ||
                  index ===
                    Math.ceil(
                      filteredAndSortedRequisitions.length / rowsPerPage
                    ) -
                      1 ||
                  (index >= currentPage - 2 && index <= currentPage + 2)
                ) {
                  return (
                    <PaginationItem key={`page-${index}`}>
                      <PaginationLink
                        onClick={() => setCurrentPage(index + 1)}
                        isActive={currentPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (
                  index === currentPage - 3 ||
                  index === currentPage + 3
                ) {
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationLink>...</PaginationLink>
                    </PaginationItem>
                  )
                }
                return null
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(
                          filteredAndSortedRequisitions.length / rowsPerPage
                        )
                      )
                    )
                  }
                  className={
                    currentPage ===
                    Math.ceil(
                      filteredAndSortedRequisitions.length / rowsPerPage
                    )
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {requisitions.map((req, index) => (
        <div className="hidden" key={index}>
          <div ref={checkRef} className="p-8 bg-white">
            <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="relative p-6 border border-gray-300 bg-white">
                <div className="flex justify-end items-start mb-8">
                  <div className="text-right">
                    <div className="flex items-center justify-end">
                      {/* date */}
                      <span className="text-sm mr-2">
                        {new Date(req.PurDate).toISOString().split('T')[0]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex items-center mb-1">
                    {/* pay to */}
                    <p className="flex-1 pb-1 pt-2 ">sdfsdf</p>
                  </div>
                </div>
                <div className="flex mb-6">
                  <div className="flex-1">
                    {/* amoutn word */}
                    <p className="flex-1 pb-1 pt-2 ">
                      {toWords(req.amount)} only
                    </p>
                  </div>
                  <div className="px-2 py-1 flex items-center whitespace-nowrap ml-5">
                    {/* amount */}
                    <span className="font-medium">{req.amount}/-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Approval Confirmation Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve the invoice for PO{' '}
              {selectedRequisition?.poNo}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalDialogOpen(false)}
              disabled={isApproving}
            >
              Cancelstatus
            </Button>
            <Button onClick={handleApproveInvoice} disabled={isApproving}>
              {isApproving ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Requisition Popup */}
      {selectedRequisition && (
        <PaymentRequisitionPopup
          isOpen={paymentPopupOpen}
          onOpenChange={setPaymentPopupOpen}
          requisition={selectedRequisition}
          token={token}
          onSuccess={onRefresh}
          status={currentStatus}
        />
      )}
    </div>
  )
}

export default PaymentRequisitionList;


// ('use client')

// import { useCallback, useEffect, useRef, useState } from 'react'
// import type React from 'react'
// import type { CurrencyType, GetPaymentOrder } from '@/utils/type'
// import { Button } from '@/components/ui/button'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import { useToast } from '@/hooks/use-toast'
// import { approveInvoice } from '@/api/payment-requisition-api'
// import { PaymentRequisitionPopup } from './payment-requisition-popup'
// import { useReactToPrint } from 'react-to-print'
// import { toWords } from 'number-to-words'
// import { getAllCurrency } from '@/api/common-shared-api'
// import { useRouter } from 'next/navigation'

// interface PaymentRequisitionListProps {
//   requisitions: GetPaymentOrder[]
//   token: string
//   onRefresh: () => void
// }

// const PaymentRequisitionList: React.FC<PaymentRequisitionListProps> = ({
//   requisitions,
//   token,
//   onRefresh,
// }) => {
//   const router = useRouter()
//   // State variables
//   const { toast } = useToast()
//   const [isApproving, setIsApproving] = useState(false)
//   const [selectedRequisition, setSelectedRequisition] =
//     useState<GetPaymentOrder | null>(null)
//   const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
//   const [paymentPopupOpen, setPaymentPopupOpen] = useState(false)
//   const [currentStatus, setCurrentStatus] = useState<string>('')
//   const [currency, setCurrency] = useState<CurrencyType[]>([])

//   const checkRef = useRef<HTMLDivElement>(null)
//   const printCheckFn = useReactToPrint({ contentRef: checkRef })

//   const handleApproveClick = (requisition: GetPaymentOrder) => {
//     setSelectedRequisition(requisition)
//     setApprovalDialogOpen(true)
//   }

//   const handleActionClick = (requisition: GetPaymentOrder, status: string) => {
//     setSelectedRequisition(requisition)
//     setCurrentStatus(status)
//     setPaymentPopupOpen(true)
//   }

//   const fetchCurrency = useCallback(async () => {
//     if (!token) return
//     try {
//       const response = await getAllCurrency(token)
//       
//       if (response?.error?.status === 401) {
//         router.push('/unauthorized-access')
//         
//         return
//       } else if (response.error || !response.data) {
//         console.error('Error fetching currency:', response.error)
//         toast({
//           variant: 'destructive',
//           title: 'Error',
//           description: response.error?.message || 'Failed to fetch currency',
//         })
//         return
//       } else if (response && response.data) {
//         
//         setCurrency(response.data)
//         
//       } else {
//         console.error('Invalid response format from getAllcurrency:', response)
//       }
//     } catch (error) {
//       console.error('Error fetching currency:', error)
//     }
//   }, [token, router, toast])

//   useEffect(() => {
//     fetchCurrency()
//   }, [fetchCurrency])

//   const handleApproveInvoice = async () => {
//     if (!selectedRequisition) return

//     try {
//       setIsApproving(true)

//       // Prepare the data for approval
//       const approvalData = {
//         invoiceId: '5',
//         approvalStatus: 'Approved',
//         approvedBy: '1',
//         poId: '10',
//       }

//       await approveInvoice(approvalData, token)

//       // Only show success toast and close dialog if API call succeeds
//       toast({
//         title: 'Invoice approved',
//         description: `Invoice for PO ${selectedRequisition.poNo} has been approved successfully.`,
//       })

//       // Close dialog and refresh data
//       setApprovalDialogOpen(false)
//       onRefresh()
//     } catch (error) {
//       console.error('Error approving invoice:', error)
//       toast({
//         title: 'Approval failed',
//         description:
//           'There was an error approving the invoice. Please try again.',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsApproving(false)
//     }
//   }

//   if (!requisitions || requisitions.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-64 text-gray-500 text-xl font-light">
//         No payment requisitions available
//       </div>
//     )
//   }

//   return (
//     <div className="w-full">
//       <Table className="border shadow-md">
//         <TableHeader className="border bg-slate-200 shadow-md">
//           <TableRow>
//             <TableHead>Company Name</TableHead>
//             <TableHead>PO Number</TableHead>
//             <TableHead>Vendor</TableHead>
//             <TableHead>Amount</TableHead>
//             <TableHead>Purchase Date</TableHead>
//             <TableHead>Req No</TableHead>
//             <TableHead>Prepared By</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead className="text-right">Action</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {requisitions.map((req) => (
//             <TableRow key={req.id}>
//               <TableCell className="font-medium">{req.companyName}</TableCell>
//               <TableCell>{req.poNo}</TableCell>
//               <TableCell>{req.vendorName}</TableCell>
//               <TableCell>
//                 {req.amount}{' '}
//                 {
//                   currency.find(
//                     (c) => String(c.currencyId) === String(req.currency)
//                   )?.currencyCode
//                 }
//               </TableCell>
//               <TableCell>
//                 {new Date(req.PurDate).toLocaleDateString()}
//               </TableCell>
//               <TableCell>{req.reqNo}</TableCell>
//               <TableCell>{req.preparedBy}</TableCell>
//               <TableCell>{req.status}</TableCell>
//               <TableCell className="text-right">
//                 {req.status === 'Invoice Created' && (
//                   <Button size="sm" onClick={() => handleApproveClick(req)}>
//                     Approve Invoice
//                   </Button>
//                 )}
//                 {req.status === 'Invoice Approved' && (
//                   <Button
//                     size="sm"
//                     onClick={() => handleActionClick(req, 'Invoice Approved')}
//                   >
//                     Create Payment
//                   </Button>
//                 )}
//                 {req.status === 'GRN Completed' && (
//                   <Button
//                     size="sm"
//                     onClick={() => handleActionClick(req, 'GRN Completed')}
//                   >
//                     Create Invoice
//                   </Button>
//                 )}
//                 {req.status === 'Purchase Order' && (
//                   <Button
//                     size="sm"
//                     onClick={() => handleActionClick(req, 'Purchase Order')}
//                   >
//                     Create Advance
//                   </Button>
//                 )}
//                 {req.status === 'Invoice Approved' && (
//                   <Button
//                     size="sm"
//                     className="ml-3"
//                     onClick={() => printCheckFn()}
//                   >
//                     Print Check
//                   </Button>
//                 )}
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>

//       {requisitions.map((req, index) => (
//         <div className="hidden" key={index}>
//           <div ref={checkRef} className="p-8 bg-white">
//             <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden">
//               <div className="relative p-6 border border-gray-300 bg-white">
//                 <div className="flex justify-end items-start mb-8">
//                   <div className="text-right">
//                     <div className="flex items-center justify-end">
//                       {/* date */}
//                       <span className="text-sm mr-2">
//                         {new Date(req.PurDate).toISOString().split('T')[0]}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="mb-6">
//                   <div className="flex items-center mb-1">
//                     {/* pay to */}
//                     <p className="flex-1 pb-1 pt-2 ">sdfsdf</p>
//                   </div>
//                 </div>
//                 <div className="flex mb-6">
//                   <div className="flex-1">
//                     {/* amoutn word */}
//                     <p className="flex-1 pb-1 pt-2 ">
//                       {toWords(req.amount)} only
//                     </p>
//                   </div>
//                   <div className="px-2 py-1 flex items-center whitespace-nowrap ml-5">
//                     {/* amount */}
//                     <span className="font-medium">{req.amount}/-</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ))}

//       {/* Approval Confirmation Dialog */}
//       <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Approve Invoice</DialogTitle>
//             <DialogDescription>
//               Are you sure you want to approve the invoice for PO{' '}
//               {selectedRequisition?.poNo}? This action cannot be undone.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setApprovalDialogOpen(false)}
//               disabled={isApproving}
//             >
//               Cancelstatus
//             </Button>
//             <Button onClick={handleApproveInvoice} disabled={isApproving}>
//               {isApproving ? 'Approving...' : 'Approve'}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Payment Requisition Popup */}
//       {selectedRequisition && (
//         <PaymentRequisitionPopup
//           isOpen={paymentPopupOpen}
//           onOpenChange={setPaymentPopupOpen}
//           requisition={selectedRequisition}
//           token={token}
//           onSuccess={onRefresh}
//           status={currentStatus}
//         />
//       )}
//     </div>
//   )
// }

// export default PaymentRequisitionList
