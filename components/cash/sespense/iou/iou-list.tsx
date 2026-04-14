'use client'

import type React from 'react'
import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
  TableHead as TableHeadCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Search } from 'lucide-react'
import type { Employee, IouRecordGetType, LocationData } from '@/utils/type'
import Loader from '@/utils/loader'
import IouAdjPopUp from './iou-adj-popup'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { CompanyType } from '@/api/company-api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatIndianNumber } from '@/utils/Formatindiannumber'
import { toast } from '@/hooks/use-toast'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { postIouRecord, deleteIouRecord } from '@/api/iou-api'

interface LoanListProps {
  onAddCategory: () => void
  loanAllData: IouRecordGetType[]
  isLoading: boolean
  employeeData: Employee[]
  getCompany: CompanyType[]
  getLoaction: LocationData[]
  fetchLoanData: () => Promise<void>
}

const IouList: React.FC<LoanListProps> = ({
  onAddCategory,
  loanAllData,
  isLoading,
  employeeData,
  getCompany,
  getLoaction,
  fetchLoanData,
}) => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)

  const [sortConfig, setSortConfig] = useState<{
    key: keyof IouRecordGetType
    direction: 'asc' | 'desc'
  }>({ key: 'dateIssued', direction: 'desc' })

  const [currentPage, setCurrentPage] = useState(1)
  const [popupIouId, setPopupIouId] = useState<number | null>(null)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  // ✅ Post IOU — draft → active
  const handlePostIou = async (iouId: number) => {
    try {
      await postIouRecord(iouId, token)
      toast({ title: 'Success', description: 'IOU posted successfully!' })
      fetchLoanData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post IOU.',
        variant: 'destructive',
      })
    }
  }

  // ✅ Delete IOU — শুধু draft delete হবে
  const handleDeleteIou = async (iouId: number) => {
    try {
      await deleteIouRecord(iouId, token)
      toast({ title: 'Success', description: 'IOU deleted successfully!' })
      fetchLoanData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete IOU.',
        variant: 'destructive',
      })
    }
  }

  const getEmployeeName = (employeeId: number) => {
    const employee = employeeData.find((emp) => emp.id === employeeId)
    return employee
      ? `${employee.employeeName} (${employee.employeeId})`
      : 'Unknown Employee'
  }

  const getCompanyName = (companyId: number) => {
    const company = getCompany.find((comp) => comp.companyId === companyId)
    return company ? company.companyName : 'Unknown Company'
  }

  const getLocationName = (locationId: number) => {
    const location = getLoaction.find((loc) => loc.locationId === locationId)
    return location ? location.branchName : 'Unknown Location'
  }

  const filteredLoanData = useMemo(() => {
    if (!searchQuery.trim()) return loanAllData
    const lower = searchQuery.toLowerCase()
    return loanAllData.filter((loan) => {
      const employee = employeeData.find((emp) => emp.id === loan.employeeId)
      const employeeName = (employee?.employeeName || '').toLowerCase()
      const employeeId = String(employee?.employeeId || '').toLowerCase()
      const iouId = String(loan.iouId || '').toLowerCase()
      return (
        employeeName.includes(lower) ||
        employeeId.includes(lower) ||
        iouId.includes(lower)
      )
    })
  }, [loanAllData, employeeData, searchQuery])

  const sortedLoanData = useMemo(() => {
    const sorted = [...filteredLoanData]
    sorted.sort((a, b) => {
      if (a[sortConfig.key] !== undefined && b[sortConfig.key] !== undefined) {
        if ((a[sortConfig.key] ?? 0) < (b[sortConfig.key] ?? 0))
          return sortConfig.direction === 'asc' ? -1 : 1
        if ((a[sortConfig.key] ?? 0) > (b[sortConfig.key] ?? 0))
          return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
    return sorted
  }, [filteredLoanData, sortConfig])

  const paginatedLoanData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedLoanData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedLoanData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredLoanData.length / itemsPerPage)

  const handleButtonClick = (loan: IouRecordGetType) =>
    setPopupIouId(loan.iouId)
  const closePopup = () => setPopupIouId(null)

  const requestSort = (key: keyof IouRecordGetType) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }))
  }

  const grandTotalAmount = filteredLoanData.reduce(
    (total, loan) => total + (loan.amount || 0),
    0
  )
  const grandTotalAdjusted = filteredLoanData.reduce(
    (total, loan) => total + (loan.adjustedAmount || 0),
    0
  )

  return (
    <div className="p-1">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">IOU List</h1>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Employee Name, ID or IOU ID"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 pr-4 py-2 border rounded-md text-sm w-96 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <Button onClick={onAddCategory}>Add IOU</Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full h-[500px] overflow-auto border shadow-md">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 bg-slate-200 z-20 text-center">
              <TableRow>
                <TableHeadCell>
                  <Button variant="ghost" onClick={() => requestSort('dateIssued')}>
                    Issued Date <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHeadCell>
                <TableHeadCell>
                  <Button variant="ghost" onClick={() => requestSort('iouId')}>
                    Iou Id <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHeadCell>
                <TableHeadCell>
                  <Button variant="ghost" onClick={() => requestSort('employeeId')}>
                    Employee Name <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHeadCell>
                <TableHeadCell>
                  <Button variant="ghost" onClick={() => requestSort('companyId')}>
                    Company Name <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHeadCell>
                <TableHeadCell>
                  <Button variant="ghost" onClick={() => requestSort('locationId')}>
                    Location Name <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHeadCell>
                <TableHeadCell>
                  <Button variant="ghost" onClick={() => requestSort('amount')}>
                    Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHeadCell>
                <TableHeadCell>
                  <Button variant="ghost" onClick={() => requestSort('adjustedAmount')}>
                    Adjusted Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHeadCell>
                <TableHeadCell>
                  <Button variant="ghost" onClick={() => requestSort('dueDate')}>
                    Due Date <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHeadCell>
                <TableHeadCell>
                  <Button variant="ghost" onClick={() => requestSort('notes')}>
                    Notes <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Action</TableHeadCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedLoanData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No records found matching &quot;{searchQuery}&quot;
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLoanData.map((loan) => (
                  <TableRow className="text-center" key={loan.iouId}>
                    <TableCell>
                      {isNaN(new Date(loan.dateIssued).getTime())
                        ? 'Invalid Date'
                        : new Date(loan.dateIssued).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{loan.iouId}</TableCell>
                    <TableCell>{getEmployeeName(loan.employeeId)}</TableCell>
                    <TableCell>{getCompanyName(loan.companyId)}</TableCell>
                    <TableCell>{getLocationName(loan.locationId)}</TableCell>
                    {loan.amount !== loan.adjustedAmount ? (
                      <>
                        <TableCell>{formatIndianNumber(loan.amount)}</TableCell>
                        <TableCell>{formatIndianNumber(loan.adjustedAmount)}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </>
                    )}
                    <TableCell>
                      {isNaN(new Date(loan.dueDate).getTime())
                        ? 'Invalid Date'
                        : new Date(loan.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{loan.notes}</TableCell>

                    {/* ✅ Status Badge */}
                    <TableCell>
                      <span
                        className={
                          loan.status === 'draft'
                            ? 'px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700'
                            : 'px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700'
                        }
                      >
                        {loan.status === 'draft' ? 'Draft' : 'Active'}
                      </span>
                    </TableCell>

                    {/* ✅ Action Column */}
                    <TableCell className="flex gap-2 justify-center">
                      {loan.status === 'draft' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePostIou(loan.iouId)}
                          >
                            Post
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteIou(loan.iouId)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                      {loan.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleButtonClick(loan)}
                        >
                          Adjustment
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}

              {/* Grand Total */}
              <TableRow className="bg-slate-100 font-bold sticky bottom-0 z-10">
                <TableCell colSpan={4} className="text-right">
                  Grand Total:
                </TableCell>
                <TableCell>{formatIndianNumber(grandTotalAmount)}</TableCell>
                <TableCell>{formatIndianNumber(grandTotalAdjusted)}</TableCell>
                <TableCell colSpan={5}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {/* Popup */}
      {popupIouId && (
        <IouAdjPopUp
          fetchLoanData={fetchLoanData}
          iouId={popupIouId}
          isOpen={!!popupIouId}
          onOpenChange={closePopup}
        />
      )}

      {/* Pagination */}
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
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
      </div>
    </div>
  )
}

export default IouList

// 'use client'

// import type React from 'react'
// import { useState, useMemo } from 'react'
// import {
//   Table,
//   TableBody,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableCell,
//   TableHead as TableHeadCell,
// } from '@/components/ui/table'
// import { Button } from '@/components/ui/button'
// import { ArrowUpDown, Search } from 'lucide-react'
// import type { Employee, IouRecordGetType, LocationData } from '@/utils/type'
// import Loader from '@/utils/loader'
// import IouAdjPopUp from './iou-adj-popup'
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from '@/components/ui/pagination'
// import { CompanyType } from '@/api/company-api'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { formatIndianNumber } from '@/utils/Formatindiannumber'
// import { toast } from '@/hooks/use-toast'
// import { tokenAtom, useInitializeUser } from '@/utils/user'  // ✅ যোগ
// import { useAtom } from 'jotai'                               // ✅ যোগ
// import { postIouRecord } from '@/api/iou-api'                 // ✅ যোগ

// interface LoanListProps {
//   onAddCategory: () => void
//   loanAllData: IouRecordGetType[]
//   isLoading: boolean
//   employeeData: Employee[]
//   getCompany: CompanyType[]
//   getLoaction: LocationData[]
//   fetchLoanData: () => Promise<void>
// }

// const IouList: React.FC<LoanListProps> = ({
//   onAddCategory,
//   loanAllData,
//   isLoading,
//   employeeData,
//   getCompany,
//   getLoaction,
//   fetchLoanData,
// }) => {
//   useInitializeUser()                          // ✅ যোগ
//   const [token] = useAtom(tokenAtom)           // ✅ যোগ

//   const [sortConfig, setSortConfig] = useState<{
//     key: keyof IouRecordGetType
//     direction: 'asc' | 'desc'
//   }>({ key: 'dateIssued', direction: 'desc' })

//   const [currentPage, setCurrentPage] = useState(1)
//   const [popupIouId, setPopupIouId] = useState<number | null>(null)
//   const [itemsPerPage, setItemsPerPage] = useState(10)
//   const [searchQuery, setSearchQuery] = useState('')

//   // ✅ handlePostIou function
//   const handlePostIou = async (iouId: number) => {
//     try {
//       await postIouRecord(iouId, token)
//       toast({ title: 'Success', description: 'IOU posted successfully!' })
//       fetchLoanData()
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to post IOU.',
//         variant: 'destructive',
//       })
//     }
//   }

//   const getEmployeeName = (employeeId: number) => {
//     const employee = employeeData.find((emp) => emp.id === employeeId)
//     return employee
//       ? `${employee.employeeName} (${employee.employeeId})`
//       : 'Unknown Employee'
//   }

//   const getCompanyName = (companyId: number) => {
//     const company = getCompany.find((comp) => comp.companyId === companyId)
//     return company ? company.companyName : 'Unknown Company'
//   }

//   const getLocationName = (locationId: number) => {
//     const location = getLoaction.find((loc) => loc.locationId === locationId)
//     return location ? location.branchName : 'Unknown Location'
//   }

//   const filteredLoanData = useMemo(() => {
//     if (!searchQuery.trim()) return loanAllData
//     const lower = searchQuery.toLowerCase()
//     return loanAllData.filter((loan) => {
//       const employee = employeeData.find((emp) => emp.id === loan.employeeId)
//       const employeeName = (employee?.employeeName || '').toLowerCase()
//       const employeeId = String(employee?.employeeId || '').toLowerCase()
//       const iouId = String(loan.iouId || '').toLowerCase()
//       return (
//         employeeName.includes(lower) ||
//         employeeId.includes(lower) ||
//         iouId.includes(lower)
//       )
//     })
//   }, [loanAllData, employeeData, searchQuery])

//   const sortedLoanData = useMemo(() => {
//     const sorted = [...filteredLoanData]
//     sorted.sort((a, b) => {
//       if (a[sortConfig.key] !== undefined && b[sortConfig.key] !== undefined) {
//         if ((a[sortConfig.key] ?? 0) < (b[sortConfig.key] ?? 0))
//           return sortConfig.direction === 'asc' ? -1 : 1
//         if ((a[sortConfig.key] ?? 0) > (b[sortConfig.key] ?? 0))
//           return sortConfig.direction === 'asc' ? 1 : -1
//       }
//       return 0
//     })
//     return sorted
//   }, [filteredLoanData, sortConfig])

//   const paginatedLoanData = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage
//     return sortedLoanData.slice(startIndex, startIndex + itemsPerPage)
//   }, [sortedLoanData, currentPage, itemsPerPage])

//   const totalPages = Math.ceil(filteredLoanData.length / itemsPerPage)

//   const handleButtonClick = (loan: IouRecordGetType) =>
//     setPopupIouId(loan.iouId)
//   const closePopup = () => setPopupIouId(null)

//   const requestSort = (key: keyof IouRecordGetType) => {
//     setSortConfig((prevConfig) => ({
//       key,
//       direction:
//         prevConfig.key === key && prevConfig.direction === 'asc'
//           ? 'desc'
//           : 'asc',
//     }))
//   }

//   const grandTotalAmount = filteredLoanData.reduce(
//     (total, loan) => total + (loan.amount || 0),
//     0
//   )
//   const grandTotalAdjusted = filteredLoanData.reduce(
//     (total, loan) => total + (loan.adjustedAmount || 0),
//     0
//   )

//   return (
//     <div className="p-1">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center gap-4">
//           <h1 className="text-2xl font-bold">IOU List</h1>
//           <Select
//             value={itemsPerPage.toString()}
//             onValueChange={(value) => {
//               setItemsPerPage(Number(value))
//               setCurrentPage(1)
//             }}
//           >
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Select items per page" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="5">5 per page</SelectItem>
//               <SelectItem value="10">10 per page</SelectItem>
//               <SelectItem value="20">20 per page</SelectItem>
//               <SelectItem value="50">50 per page</SelectItem>
//               <SelectItem value="100">100 per page</SelectItem>
//             </SelectContent>
//           </Select>

//           {/* Search Bar */}
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <input
//               type="text"
//               placeholder="Search by Employee Name, ID or IOU ID"
//               value={searchQuery}
//               onChange={(e) => {
//                 setSearchQuery(e.target.value)
//                 setCurrentPage(1)
//               }}
//               className="pl-9 pr-4 py-2 border rounded-md text-sm w-96 focus:outline-none focus:ring-2 focus:ring-ring"
//             />
//           </div>
//         </div>
//         <Button onClick={onAddCategory}>Add IOU</Button>
//       </div>

//       {/* Table */}
//       {isLoading ? (
//         <Loader />
//       ) : (
//         <div className="w-full h-[500px] overflow-auto border shadow-md">
//           <Table className="min-w-full">
//             <TableHeader className="sticky top-0 bg-slate-200 z-20 text-center">
//               <TableRow>
//                 <TableHeadCell>
//                   <Button variant="ghost" onClick={() => requestSort('dateIssued')}>
//                     Issued Date <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>
//                   <Button variant="ghost" onClick={() => requestSort('iouId')}>
//                     Iou Id <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>
//                   <Button variant="ghost" onClick={() => requestSort('employeeId')}>
//                     Employee Name <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>
//                   <Button variant="ghost" onClick={() => requestSort('companyId')}>
//                     Company Name <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>
//                   <Button variant="ghost" onClick={() => requestSort('locationId')}>
//                     Location Name <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>
//                   <Button variant="ghost" onClick={() => requestSort('amount')}>
//                     Amount <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>
//                   <Button variant="ghost" onClick={() => requestSort('adjustedAmount')}>
//                     Adjusted Amount <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>
//                   <Button variant="ghost" onClick={() => requestSort('dueDate')}>
//                     Due Date <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>
//                   <Button variant="ghost" onClick={() => requestSort('notes')}>
//                     Notes <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>Status</TableHeadCell>
//                 <TableHeadCell>Action</TableHeadCell>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {paginatedLoanData.length === 0 ? (
//                 <TableRow>
//                   <TableCell
//                     colSpan={11}
//                     className="text-center py-8 text-muted-foreground"
//                   >
//                     No records found matching &quot;{searchQuery}&quot;
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 paginatedLoanData.map((loan) => (
//                   <TableRow className="text-center" key={loan.iouId}>
//                     <TableCell>
//                       {isNaN(new Date(loan.dateIssued).getTime())
//                         ? 'Invalid Date'
//                         : new Date(loan.dateIssued).toLocaleDateString()}
//                     </TableCell>
//                     <TableCell>{loan.iouId}</TableCell>
//                     <TableCell>{getEmployeeName(loan.employeeId)}</TableCell>
//                     <TableCell>{getCompanyName(loan.companyId)}</TableCell>
//                     <TableCell>{getLocationName(loan.locationId)}</TableCell>
//                     {loan.amount !== loan.adjustedAmount ? (
//                       <>
//                         <TableCell>{formatIndianNumber(loan.amount)}</TableCell>
//                         <TableCell>{formatIndianNumber(loan.adjustedAmount)}</TableCell>
//                       </>
//                     ) : (
//                       <>
//                         <TableCell></TableCell>
//                         <TableCell></TableCell>
//                       </>
//                     )}
//                     <TableCell>
//                       {isNaN(new Date(loan.dueDate).getTime())
//                         ? 'Invalid Date'
//                         : new Date(loan.dueDate).toLocaleDateString()}
//                     </TableCell>
//                     <TableCell>{loan.notes}</TableCell>

//                     {/* ✅ Status Badge */}
//                     <TableCell>
//                       <span
//                         className={
//                           loan.status === 'draft'
//                             ? 'px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700'
//                             : 'px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700'
//                         }
//                       >
//                         {loan.status === 'draft' ? 'Draft' : 'Active'}
//                       </span>
//                     </TableCell>

//                     {/* ✅ Action Column */}
//                     <TableCell className="flex gap-2 justify-center">
//                       {loan.status === 'draft' && (
//                         <Button
//                           variant="default"
//                           size="sm"
//                           onClick={() => handlePostIou(loan.iouId)}
//                         >
//                           Post
//                         </Button>
//                       )}
//                       {loan.status === 'active' && (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleButtonClick(loan)}
//                         >
//                           Adjustment
//                         </Button>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}

//               {/* Grand Total */}
//               <TableRow className="bg-slate-100 font-bold sticky bottom-0 z-10">
//                 <TableCell colSpan={4} className="text-right">
//                   Grand Total:
//                 </TableCell>
//                 <TableCell>{formatIndianNumber(grandTotalAmount)}</TableCell>
//                 <TableCell>{formatIndianNumber(grandTotalAdjusted)}</TableCell>
//                 <TableCell colSpan={5}></TableCell>
//               </TableRow>
//             </TableBody>
//           </Table>
//         </div>
//       )}

//       {/* Popup */}
//       {popupIouId && (
//         <IouAdjPopUp
//           fetchLoanData={fetchLoanData}
//           iouId={popupIouId}
//           isOpen={!!popupIouId}
//           onOpenChange={closePopup}
//         />
//       )}

//       {/* Pagination */}
//       <div className="mt-4">
//         <Pagination>
//           <PaginationContent>
//             <PaginationItem>
//               <PaginationPrevious
//                 onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                 className={
//                   currentPage === 1 ? 'pointer-events-none opacity-50' : ''
//                 }
//               />
//             </PaginationItem>
//             {[...Array(totalPages)].map((_, index) => (
//               <PaginationItem key={index}>
//                 <PaginationLink
//                   onClick={() => setCurrentPage(index + 1)}
//                   isActive={currentPage === index + 1}
//                 >
//                   {index + 1}
//                 </PaginationLink>
//               </PaginationItem>
//             ))}
//             <PaginationItem>
//               <PaginationNext
//                 onClick={() =>
//                   setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                 }
//                 className={
//                   currentPage === totalPages
//                     ? 'pointer-events-none opacity-50'
//                     : ''
//                 }
//               />
//             </PaginationItem>
//           </PaginationContent>
//         </Pagination>
//       </div>
//     </div>
//   )
// }

// export default IouList





// 'use client'

// import type React from 'react'
// import { useState, useMemo } from 'react'
// import {
//   Table,
//   TableBody,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableCell,
//   TableHead as TableHeadCell,
// } from '@/components/ui/table'
// import { Button } from '@/components/ui/button'
// import { ArrowUpDown, Search } from 'lucide-react'
// import type { Employee, IouRecordGetType, LocationData } from '@/utils/type'

// import Loader from '@/utils/loader'
// import IouAdjPopUp from './iou-adj-popup'
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from '@/components/ui/pagination'
// import { CompanyType } from '@/api/company-api'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { formatIndianNumber } from '@/utils/Formatindiannumber'
// import { toast } from '@/hooks/use-toast'
// import { postIouRecord } from '@/api/iou-api'

// interface LoanListProps {
//   onAddCategory: () => void
//   loanAllData: IouRecordGetType[]
//   isLoading: boolean
//   employeeData: Employee[]
//   getCompany: CompanyType[]
//   getLoaction: LocationData[]
//   fetchLoanData: () => Promise<void>
// }

// const IouList: React.FC<LoanListProps> = ({
//   onAddCategory,
//   loanAllData,
//   isLoading,
//   employeeData,
//   getCompany,
//   getLoaction,
//   fetchLoanData,
// }) => {
//   const [sortConfig, setSortConfig] = useState<{
//     key: keyof IouRecordGetType
//     direction: 'asc' | 'desc'
//   }>({ key: 'dateIssued', direction: 'desc' })

//   const [currentPage, setCurrentPage] = useState(1)
//   const [popupIouId, setPopupIouId] = useState<number | null>(null)
//   const [itemsPerPage, setItemsPerPage] = useState(10)
//   const [searchQuery, setSearchQuery] = useState('')

//   const getEmployeeName = (employeeId: number) => {
//     const employee = employeeData.find((emp) => emp.id === employeeId)
//     return employee
//       ? `${employee.employeeName} (${employee.employeeId})`
//       : 'Unknown Employee'
//   }

//   const getCompanyName = (companyId: number) => {
//     const company = getCompany.find((comp) => comp.companyId === companyId)
//     return company ? company.companyName : 'Unknown Company'
//   }

//   const getLocationName = (locationId: number) => {
//     const location = getLoaction.find((loc) => loc.locationId === locationId)
//     return location ? location.branchName : 'Unknown Location'
//   }

//   const filteredLoanData = useMemo(() => {
//     if (!searchQuery.trim()) return loanAllData
//     const lower = searchQuery.toLowerCase()
//     return loanAllData.filter((loan) => {
//       const employee = employeeData.find((emp) => emp.id === loan.employeeId)

//       const employeeName = (employee?.employeeName || '').toLowerCase()
//       const employeeId = String(employee?.employeeId || '').toLowerCase()
//       const iouId = String(loan.iouId || '').toLowerCase()

//       return (
//         employeeName.includes(lower) ||
//         employeeId.includes(lower) ||
//         iouId.includes(lower)
//       )
//     })
//   }, [loanAllData, employeeData, searchQuery])

//   const sortedLoanData = useMemo(() => {
//     const sorted = [...filteredLoanData]
//     sorted.sort((a, b) => {
//       if (a[sortConfig.key] !== undefined && b[sortConfig.key] !== undefined) {
//         if ((a[sortConfig.key] ?? 0) < (b[sortConfig.key] ?? 0))
//           return sortConfig.direction === 'asc' ? -1 : 1
//         if ((a[sortConfig.key] ?? 0) > (b[sortConfig.key] ?? 0))
//           return sortConfig.direction === 'asc' ? 1 : -1
//       }
//       return 0
//     })
//     return sorted
//   }, [filteredLoanData, sortConfig])

//   const paginatedLoanData = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage
//     return sortedLoanData.slice(startIndex, startIndex + itemsPerPage)
//   }, [sortedLoanData, currentPage, itemsPerPage])

//   const totalPages = Math.ceil(filteredLoanData.length / itemsPerPage)

//   const handleButtonClick = (loan: IouRecordGetType) =>
//     setPopupIouId(loan.iouId)
//   const closePopup = () => setPopupIouId(null)

//   const requestSort = (key: keyof IouRecordGetType) => {
//     setSortConfig((prevConfig) => ({
//       key,
//       direction:
//         prevConfig.key === key && prevConfig.direction === 'asc'
//           ? 'desc'
//           : 'asc',
//     }))
//   }

//   // Grand totals (based on filtered data)
//   const grandTotalAmount = filteredLoanData.reduce(
//     (total, loan) => total + (loan.amount || 0),
//     0
//   )
//   const grandTotalAdjusted = filteredLoanData.reduce(
//     (total, loan) => total + (loan.adjustedAmount || 0),
//     0
//   )

//   // Post IOU API call
//   const handlePostIou = async (iouId: number) => {
//   try {
//     await postIouRecord(iouId, token);
//     toast({ title: "Success", description: "IOU posted successfully!" });
//     fetchLoanData();
//   } catch (error) {
//     toast({ title: "Error", description: "Failed to post IOU.", variant: "destructive" });
//   }
// };

//   return (
//     <div className="p-1">
//       {/* Header and Add IOU Button */}
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center gap-4">
//           <h1 className="text-2xl font-bold">IOU List</h1>
//           <Select
//             value={itemsPerPage.toString()}
//             onValueChange={(value) => {
//               setItemsPerPage(Number(value))
//               setCurrentPage(1)
//             }}
//           >
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Select items per page" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="5">5 per page</SelectItem>
//               <SelectItem value="10">10 per page</SelectItem>
//               <SelectItem value="20">20 per page</SelectItem>
//               <SelectItem value="50">50 per page</SelectItem>
//               <SelectItem value="100">100 per page</SelectItem>
//             </SelectContent>
//           </Select>

//           {/* Employee Search Bar */}
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <input
//               type="text"
//               placeholder="Search by Employee Name, ID or IOU ID "
//               value={searchQuery}
//               onChange={(e) => {
//                 setSearchQuery(e.target.value)
//                 setCurrentPage(1)
//               }}
//               className="pl-9 pr-4 py-2 border rounded-md text-sm w-96 focus:outline-none focus:ring-2 focus:ring-ring"
//             />
//           </div>
//         </div>
//         <Button onClick={onAddCategory}>Add IOU</Button>
//       </div>

//       {/* Table */}
//       {isLoading ? (
//         <Loader />
//       ) : (
//         <div className="w-full h-[500px] overflow-auto border shadow-md">
//           <Table className="min-w-full">
//             <TableHeader className="sticky top-0 bg-slate-200 z-20 text-center">
//               <TableRow>
//                 <TableHeadCell>
//                   <Button
//                     variant="ghost"
//                     onClick={() => requestSort('dateIssued')}
//                   >
//                     Issued Date <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>
//                   <Button variant="ghost" onClick={() => requestSort('iouId')}>
//                     Iou Id <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>
//                   <Button
//                     variant="ghost"
//                     onClick={() => requestSort('employeeId')}
//                   >
//                     Employee Name <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>
//                   <Button
//                     variant="ghost"
//                     onClick={() => requestSort('companyId')}
//                   >
//                     Company Name <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>
//                   <Button
//                     variant="ghost"
//                     onClick={() => requestSort('locationId')}
//                   >
//                     Location Name <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>
//                   <Button variant="ghost" onClick={() => requestSort('amount')}>
//                     Amount <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>
//                   <Button
//                     variant="ghost"
//                     onClick={() => requestSort('adjustedAmount')}
//                   >
//                     Adjusted Amount <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>

//                 <TableHeadCell>
//                   <Button
//                     variant="ghost"
//                     onClick={() => requestSort('dueDate')}
//                   >
//                     Due Date <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>
//                   <Button variant="ghost" onClick={() => requestSort('notes')}>
//                     Notes <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHeadCell>
//                 <TableHeadCell>Status</TableHeadCell>
//                 <TableHeadCell>Action</TableHeadCell>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {paginatedLoanData.length === 0 ? (
//                 <TableRow>
//                   <TableCell
//                     colSpan={10}
//                     className="text-center py-8 text-muted-foreground"
//                   >
//                     No employees found matching &quot;{searchQuery}&quot;
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 paginatedLoanData.map((loan) => (
//                   <TableRow className="text-center" key={loan.iouId}>
//                     <TableCell>
//                       {isNaN(new Date(loan.dateIssued).getTime())
//                         ? 'Invalid Date'
//                         : new Date(loan.dateIssued).toLocaleDateString()}
//                     </TableCell>
//                     <TableCell>{loan.iouId}</TableCell>
//                     <TableCell>{getEmployeeName(loan.employeeId)}</TableCell>
//                     <TableCell>{getCompanyName(loan.companyId)}</TableCell>
//                     <TableCell>{getLocationName(loan.locationId)}</TableCell>
//                     {loan.amount !== loan.adjustedAmount ? (
//                       <>
//                         <TableCell>{formatIndianNumber(loan.amount)}</TableCell>
//                         <TableCell>
//                           {formatIndianNumber(loan.adjustedAmount)}
//                         </TableCell>
//                       </>
//                     ) : (
//                       <>
//                         <TableCell></TableCell>
//                         <TableCell></TableCell>
//                       </>
//                     )}

//                     <TableCell>
//                       {isNaN(new Date(loan.dueDate).getTime())
//                         ? 'Invalid Date'
//                         : new Date(loan.dueDate).toLocaleDateString()}
//                     </TableCell>
//                     <TableCell>{loan.notes}</TableCell>
//                     <TableCell>
//                       <span
//                         className={
//                           loan.status === 'draft'
//                             ? 'text-yellow-600 font-semibold'
//                             : 'text-green-600 font-semibold'
//                         }
//                       >
//                         {loan.status === 'draft' ? 'Draft' : 'Active'}
//                       </span>
//                     </TableCell>
//                     {/* <TableCell>
//                       <Button
//                         variant="outline"
//                         onClick={() => handleButtonClick(loan)}
//                       >
//                         Adjustment
//                       </Button>
//                     </TableCell> */}
//                     <TableCell className="flex gap-2">
//                       {loan.status === 'draft' && (
//                         <Button
//                           variant="default"
//                           size="sm"
//                           onClick={() => handlePostIou(loan.iouId)}
//                         >
//                           Post
//                         </Button>
//                       )}
//                       {loan.status === 'active' && (
//                         <Button
//                           variant="outline"
//                           onClick={() => handleButtonClick(loan)}
//                         >
//                           Adjustment
//                         </Button>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}

//               {/* Grand Total */}
//               <TableRow className="bg-slate-100 font-bold sticky bottom-0 z-10">
//                 <TableCell colSpan={4} className="text-right">
//                   Grand Total:
//                 </TableCell>
//                 <TableCell>{formatIndianNumber(grandTotalAmount)}</TableCell>
//                 <TableCell>{formatIndianNumber(grandTotalAdjusted)}</TableCell>
//                 <TableCell colSpan={4}></TableCell>
//               </TableRow>
//             </TableBody>
//           </Table>
//         </div>
//       )}

//       {/* Popup */}
//       {popupIouId && (
//         <IouAdjPopUp
//           fetchLoanData={fetchLoanData}
//           iouId={popupIouId}
//           isOpen={!!popupIouId}
//           onOpenChange={closePopup}
//         />
//       )}

//       {/* Pagination */}
//       <div className="mt-4">
//         <Pagination>
//           <PaginationContent>
//             <PaginationItem>
//               <PaginationPrevious
//                 onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                 className={
//                   currentPage === 1 ? 'pointer-events-none opacity-50' : ''
//                 }
//               />
//             </PaginationItem>
//             {[...Array(totalPages)].map((_, index) => (
//               <PaginationItem key={index}>
//                 <PaginationLink
//                   onClick={() => setCurrentPage(index + 1)}
//                   isActive={currentPage === index + 1}
//                 >
//                   {index + 1}
//                 </PaginationLink>
//               </PaginationItem>
//             ))}
//             <PaginationItem>
//               <PaginationNext
//                 onClick={() =>
//                   setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                 }
//                 className={
//                   currentPage === totalPages
//                     ? 'pointer-events-none opacity-50'
//                     : ''
//                 }
//               />
//             </PaginationItem>
//           </PaginationContent>
//         </Pagination>
//       </div>
//     </div>
//   )
// }

// export default IouList
