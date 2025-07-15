
"use client"
import { useCallback, useEffect, useState } from "react"
import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { ApproveAdvanceType } from "@/utils/type"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { PaymentRequisitionPopup } from "../payment-requisition/payment-requisition-popup"
import { getAllAdvance } from "@/api/approved-advances-api"
import { useAtom } from "jotai"
import { tokenAtom, useInitializeUser, userDataAtom } from "@/utils/user"
import { useRouter } from "next/navigation"

type SortField = keyof ApproveAdvanceType
type SortDirection = "asc" | "desc" | null

const ApprovedAdvances = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()
  const [advances, setAdvances] = useState<ApproveAdvanceType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false)
  const [selectedAdvance, setSelectedAdvance] = useState<ApproveAdvanceType | null>(null)

  // Search and Sort states
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage] = useState(10)

  const fetchAdvances = useCallback(async () => {
    if (!token) return
    try {
      setIsLoading(true)
      setError(null)
      const data = await getAllAdvance(token)
      console.log("🚀 ~ fetchAdvances ~ data:", data)
      if (data?.error?.status === 401) {
        console.log("Unauthorized access")
        return
      } else if (data.error || !data.data) {
        console.error("Error fetching approved advances:", data.error)
        setError(data.error?.message || "Failed to fetch approved advances")
        return
      } else {
        setAdvances(Array.isArray(data?.data) ? data.data : [])
      }
    } catch (err) {
      console.error("Error fetching approved advances:", err)
      setError("Failed to fetch approved advances")
      setAdvances([])
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem("currentUser")
      const storedToken = localStorage.getItem("authToken")
      if (!storedUserData || !storedToken) {
        console.log("No user data or token found in localStorage")
        router.push("/")
        return
      }
    }
    checkUserData()
    fetchAdvances()
  }, [fetchAdvances, router])

  const handleCreatePayment = (advance: ApproveAdvanceType) => {
    setSelectedAdvance(advance)
    setIsPaymentPopupOpen(true)
  }

  // Search and Sort functions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortDirection(null)
        setSortField(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4" />
    }
    if (sortDirection === "desc") {
      return <ArrowDown className="ml-2 h-4 w-4" />
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />
  }

  // Filter and sort advances
  const filteredAndSortedAdvances = React.useMemo(() => {
    const filtered = advances.filter((advance) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        advance.reqno?.toLowerCase().includes(searchLower) ||
        advance.poid?.toString().toLowerCase().includes(searchLower) ||
        advance.vendorname?.toLowerCase().includes(searchLower) ||
        advance.requestedby?.toLowerCase().includes(searchLower) ||
        advance.checkName?.toLowerCase().includes(searchLower) ||
        advance.requestedDate?.toLowerCase().includes(searchLower) ||
        advance.advanceamount?.toString().toLowerCase().includes(searchLower) ||
        advance.description?.toLowerCase().includes(searchLower) ||
        advance.currency?.toLowerCase().includes(searchLower)
      )
    })

    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aValue = a[sortField] ?? ''
        let bValue = b[sortField] ?? ''

        // Handle different data types
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (aValue < bValue) {
          return sortDirection === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortDirection === "asc" ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [advances, searchTerm, sortField, sortDirection])

  // Reset current page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  return (
    <div className="w-[96%] mx-auto">
      <div className="flex justify-between items-center mb-6 mt-10">
        <div>
          <h1 className="text-2xl font-bold ">Approved Advances</h1>
        </div>
         <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search approved advances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

     

      <div>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <p>Loading approved advances...</p>
          </div>
        ) : (
          <>
            <Table className="border shadow-md">
              <TableHeader className="border shadow-md bg-slate-200">
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("reqno")} className="h-auto p-0 font-semibold">
                      Requisition No
                      {getSortIcon("reqno")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("poid")} className="h-auto p-0 font-semibold">
                      PO ID
                      {getSortIcon("poid")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("vendorname")}
                      className="h-auto p-0 font-semibold"
                    >
                      Vendor Name
                      {getSortIcon("vendorname")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("requestedby")}
                      className="h-auto p-0 font-semibold"
                    >
                      Requested By
                      {getSortIcon("requestedby")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("checkName")}
                      className="h-auto p-0 font-semibold"
                    >
                      Check Name
                      {getSortIcon("checkName")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("requestedDate")}
                      className="h-auto p-0 font-semibold"
                    >
                      Requested Date
                      {getSortIcon("requestedDate")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("advanceamount")}
                      className="h-auto p-0 font-semibold"
                    >
                      Advance Amount
                      {getSortIcon("advanceamount")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("description")}
                      className="h-auto p-0 font-semibold"
                    >
                      Remarks
                      {getSortIcon("description")}
                    </Button>
                  </TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedAdvances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      {searchTerm
                        ? "No approved advances found matching your search."
                        : error
                          ? "Failed to fetch approved advances"
                          : "No approved advances found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedAdvances
                    .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                    .map((advance) => (
                      <TableRow key={advance.id}>
                        <TableCell>{advance.reqno}</TableCell>
                        <TableCell>{advance.poid}</TableCell>
                        <TableCell>{advance.vendorname}</TableCell>
                        <TableCell>{advance.requestedby}</TableCell>
                        <TableCell>{advance.checkName}</TableCell>
                        <TableCell>{new Date(advance.requestedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {advance.advanceamount} {advance.currency}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={advance.description || undefined}>
                          {advance.description}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleCreatePayment(advance)}
                            disabled={processingId === advance.id.toString()}
                            variant="default"
                          >
                            {processingId === advance.id.toString() ? "Processing..." : "Create Payment"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {filteredAndSortedAdvances.length > 0 && (
              <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                  {Math.min(currentPage * rowsPerPage, filteredAndSortedAdvances.length)} of{" "}
                  {filteredAndSortedAdvances.length} approved advances
                  {searchTerm && ` (filtered from ${advances.length} total)`}
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {[...Array(Math.ceil(filteredAndSortedAdvances.length / rowsPerPage))].map((_, index) => {
                      if (
                        index === 0 ||
                        index === Math.ceil(filteredAndSortedAdvances.length / rowsPerPage) - 1 ||
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
                      } else if (index === currentPage - 3 || index === currentPage + 3) {
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
                            Math.min(prev + 1, Math.ceil(filteredAndSortedAdvances.length / rowsPerPage)),
                          )
                        }
                        className={
                          currentPage === Math.ceil(filteredAndSortedAdvances.length / rowsPerPage)
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {selectedAdvance && (
        <PaymentRequisitionPopup
          isOpen={isPaymentPopupOpen}
          onOpenChange={setIsPaymentPopupOpen}
          requisition={selectedAdvance}
          token={token}
          onSuccess={() => {
            fetchAdvances()
            toast({
              title: "Success",
              description: "Payment created successfully",
            })
          }}
          status="Invoice Approved"
        />
      )}
    </div>
  )
}

export default ApprovedAdvances


// 'use client'

// import { useCallback, useEffect, useState } from 'react'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import type { ApproveAdvanceType } from '@/utils/type'
// import { Button } from '@/components/ui/button'
// import { toast } from '@/hooks/use-toast'
// import { PaymentRequisitionPopup } from '../payment-requisition/payment-requisition-popup'
// import { getAllAdvance } from '@/api/approved-advances-api'
// import { useAtom } from 'jotai'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useRouter } from 'next/navigation'

// const ApprovedAdvances = () => {
//   //getting userData from jotai atom component
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)
//   const router = useRouter()

//   const [advances, setAdvances] = useState<ApproveAdvanceType[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [processingId, setProcessingId] = useState<string | null>(null)
//   const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false)
//   const [selectedAdvance, setSelectedAdvance] =
//     useState<ApproveAdvanceType | null>(null)

//   const fetchAdvances = useCallback(async () => {
//     if (!token) return
//     try {
//       setIsLoading(true)
//       setError(null)
//       const data = await getAllAdvance(token)
//       console.log('🚀 ~ fetchAdvances ~ data:', data)
//       if (data?.error?.status === 401) {
//         console.log('Unauthorized access')
//         return
//       } else if (data.error || !data.data) {
//         console.error('Error fetching approved advances:', data.error)
//         setError(data.error?.message || 'Failed to fetch approved advances')
//         return
//       } else {
//         setAdvances(Array.isArray(data?.data) ? data.data : [])
//       }
//     } catch (err) {
//       console.error('Error fetching approved advances:', err)
//       setError('Failed to fetch approved advances')
//       setAdvances([])
//     } finally {
//       setIsLoading(false)
//     }
//   }, [token])

//   useEffect(() => {
//     const checkUserData = () => {
//       const storedUserData = localStorage.getItem('currentUser')
//       const storedToken = localStorage.getItem('authToken')

//       if (!storedUserData || !storedToken) {
//         console.log('No user data or token found in localStorage')
//         router.push('/')
//         return
//       }
//     }

//     checkUserData()
//     fetchAdvances()
//   }, [fetchAdvances, router])

//   const handleCreatePayment = (advance: ApproveAdvanceType) => {
//     setSelectedAdvance(advance)
//     setIsPaymentPopupOpen(true)
//   }

//   return (
//     <div className="w-[96%] mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold mt-10">Approved Advances</h1>
//       </div>
//       <div>
//         {isLoading ? (
//           <div className="flex justify-center items-center">
//             <p>Loading approved advances...</p>
//           </div>
//         ) : (
//           <Table className="border shadow-md">
//             <TableHeader className="border shadow-md bg-slate-200">
//               <TableRow>
//                 <TableHead>Requisition No</TableHead>
//                 <TableHead>PO ID</TableHead>
//                 <TableHead>Vendor Name</TableHead>
//                 <TableHead>Requested By</TableHead>
//                 <TableHead>Check Name</TableHead>
//                 <TableHead>Requested Date</TableHead>
//                 <TableHead>Advance Amount</TableHead>
//                 <TableHead>Remarks</TableHead>
//                 <TableHead>Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {advances.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={10} className="text-center">
//                     {error
//                       ? 'Failed to fetch approved advances'
//                       : 'No approved advances found'}
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 advances.map((advance) => (
//                   <TableRow key={advance.id}>
//                     <TableCell>{advance.reqno}</TableCell>
//                     <TableCell>{advance.poid}</TableCell>
//                     <TableCell>{advance.vendorname}</TableCell>
//                     <TableCell>{advance.requestedby}</TableCell>
//                     <TableCell>{advance.checkName}</TableCell>
//                     <TableCell>
//                       {new Date(advance.requestedDate).toLocaleDateString()}
//                     </TableCell>
//                     <TableCell>
//                       {advance.advanceamount} {advance.currency}
//                     </TableCell>
//                     <TableCell
//                       className="max-w-xs truncate"
//                       title={advance.description || undefined}
//                     >
//                       {advance.description}
//                     </TableCell>
//                     <TableCell>
//                       <Button
//                         size="sm"
//                         onClick={() => handleCreatePayment(advance)}
//                         disabled={processingId === advance.id.toString()}
//                         variant="default"
//                       >
//                         {processingId === advance.id.toString()
//                           ? 'Processing...'
//                           : 'Create Payment'}
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         )}
//       </div>
//       {selectedAdvance && (
//         <PaymentRequisitionPopup
//           isOpen={isPaymentPopupOpen}
//           onOpenChange={setIsPaymentPopupOpen}
//           requisition={selectedAdvance}
//           token={token}
//           onSuccess={() => {
//             fetchAdvances()
//             toast({
//               title: 'Success',
//               description: 'Payment created successfully',
//             })
//           }}
//           status="Invoice Approved"
//         />
//       )}
//     </div>
//   )
// }

// export default ApprovedAdvances
