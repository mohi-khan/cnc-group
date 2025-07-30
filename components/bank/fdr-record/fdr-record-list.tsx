// 'use client'

// import { getFdrData } from '@/api/fdr-record-api'
// import type { FdrGetType } from '@/utils/type'
// import { tokenAtom, useInitializeUser } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { useCallback, useEffect, useState } from 'react'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Skeleton } from '@/components/ui/skeleton'
// import {
//   CalendarDays,
//   Building2,
//   CreditCard,
//   Percent,
//   Clock,
//   Banknote,
// } from 'lucide-react'

// const FdrRecordList = () => {
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)
//   const [fdrdata, setFdrdata] = useState<FdrGetType[]>([])
//   const [loading, setLoading] = useState(true)

//   const fetchFdrData = useCallback(async () => {
//     if (!token) return

//     try {
//       setLoading(true)
//       const fdrdata = await getFdrData(token)
//       setFdrdata(fdrdata.data ? fdrdata.data : [])
//       console.log('FDR Data:', fdrdata.data)
//     } catch (error) {
//       console.error('Error fetching FDR data:', error)
//     } finally {
//       setLoading(false)
//     }
//   }, [token])

//   useEffect(() => {
//     fetchFdrData()
//   }, [fetchFdrData])

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'BDT',
//       minimumFractionDigits: 0,
//     })
//       .format(amount)
//       .replace('BDT', '৳')
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//     })
//   }

//   const getMaturityStatus = (maturedDate: string) => {
//     const today = new Date()
//     const maturity = new Date(maturedDate)
//     const diffTime = maturity.getTime() - today.getTime()
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

//     if (diffDays < 0) {
//       return {
//         status: 'Matured',
//         variant: 'default' as const,
//         days: Math.abs(diffDays),
//       }
//     } else if (diffDays <= 30) {
//       return {
//         status: 'Maturing Soon',
//         variant: 'destructive' as const,
//         days: diffDays,
//       }
//     } else {
//       return { status: 'Active', variant: 'secondary' as const, days: diffDays }
//     }
//   }

//   if (loading) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>FDR Records</CardTitle>
//           <CardDescription>Loading FDR data...</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-3">
//             {Array.from({ length: 5 }).map((_, index) => (
//               <Skeleton
//                 key={`loading-skeleton-${index}`}
//                 className="h-12 w-full"
//               />
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <CreditCard className="h-5 w-5" />
//           FDR Records
//         </CardTitle>
//         <CardDescription>
//           Manage and view all Fixed Deposit Receipt records
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         {fdrdata.length === 0 ? (
//           <div className="text-center py-8">
//             <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//             <p className="text-muted-foreground">No FDR records found</p>
//           </div>
//         ) : (
//           <div className="rounded-md border overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-[120px]">FDR No.</TableHead>
//                   <TableHead>Company</TableHead>
//                   <TableHead>Bank & Branch</TableHead>
//                   <TableHead>Account No.</TableHead>
//                   <TableHead className="text-right">Face Value</TableHead>
//                   <TableHead className="text-center">Interest Rate</TableHead>
//                   <TableHead className="text-center">Term</TableHead>
//                   <TableHead>FDR Date</TableHead>
//                   <TableHead>Matured Date</TableHead>
//                   <TableHead className="text-center">Status</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {fdrdata.map((fdr, index) => {
//                   const maturityInfo = getMaturityStatus(fdr.maturedDate)
//                   return (
//                     <TableRow key={`fdr-${fdr.id}-${fdr.fdrNo}-${index}`}>
//                       <TableCell className="font-medium">
//                         <div className="flex items-center gap-2">
//                           <Banknote className="h-4 w-4 text-muted-foreground" />
//                           {fdr.fdrNo}
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-2">
//                           <Building2 className="h-4 w-4 text-muted-foreground" />
//                           <div>
//                             <div className="font-medium">{fdr.company}</div>
//                           </div>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div>
//                           <div className="font-medium">{fdr.bank}</div>
//                           <div className="text-sm text-muted-foreground">
//                             {fdr.branch}
//                           </div>
//                         </div>
//                       </TableCell>
//                       <TableCell className="font-mono text-sm">
//                         {fdr.accountNo}
//                       </TableCell>
//                       <TableCell className="text-right font-medium">
//                         {formatCurrency(fdr.faceValue)}
//                       </TableCell>
//                       <TableCell className="text-center">
//                         <div className="flex items-center justify-center gap-1">
//                           <Percent className="h-3 w-3 text-muted-foreground" />
//                           <span className="font-medium">
//                             {fdr.interestRate}%
//                           </span>
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-center">
//                         <div className="flex items-center justify-center gap-1">
//                           <Clock className="h-3 w-3 text-muted-foreground" />
//                           <span>{fdr.term} months</span>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-1">
//                           <CalendarDays className="h-3 w-3 text-muted-foreground" />
//                           <span className="text-sm">
//                             {formatDate(fdr.fdrDate)}
//                           </span>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-1">
//                           <CalendarDays className="h-3 w-3 text-muted-foreground" />
//                           <span className="text-sm">
//                             {formatDate(fdr.maturedDate)}
//                           </span>
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-center">
//                         <Badge variant={maturityInfo.variant}>
//                           {maturityInfo.status}
//                         </Badge>
//                         <div className="text-xs text-muted-foreground mt-1">
//                           {maturityInfo.status === 'Matured'
//                             ? `${maturityInfo.days} days ago`
//                             : `${maturityInfo.days} days`}
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   )
//                 })}
//               </TableBody>
//             </Table>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
// }

// export default FdrRecordList

'use client'

import { getFdrData } from '@/api/fdr-record-api'
import type { FdrGetType } from '@/utils/type'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  CalendarDays,
  Building2,
  CreditCard,
  Percent,
  Clock,
  Banknote,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

type SortField = keyof FdrGetType
type SortOrder = 'asc' | 'desc'

const FdrRecordList = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const [fdrdata, setFdrdata] = useState<FdrGetType[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('fdrDate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const itemsPerPage = 10
  const totalPages = Math.ceil(fdrdata.length / itemsPerPage)

  const fetchFdrData = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      const fdrdata = await getFdrData(token)
      setFdrdata(fdrdata.data ? fdrdata.data : [])
      console.log('FDR Data:', fdrdata.data)
    } catch (error) {
      console.error('Error fetching FDR data:', error)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchFdrData()
  }, [fetchFdrData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace('BDT', '৳')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getMaturityStatus = (maturedDate: string) => {
    const today = new Date()
    const maturity = new Date(maturedDate)
    const diffTime = maturity.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return {
        status: 'Matured',
        variant: 'default' as const,
        days: Math.abs(diffDays),
      }
    } else if (diffDays <= 30) {
      return {
        status: 'Maturing Soon',
        variant: 'destructive' as const,
        days: diffDays,
      }
    } else {
      return { status: 'Active', variant: 'secondary' as const, days: diffDays }
    }
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    )
  }

  const sortedData = [...fdrdata].sort((a, b) => {
    let aValue = a[sortField] ?? ''
    let bValue = b[sortField] ?? ''

    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      // For dates, convert to Date objects for proper comparison
      if (
        sortField === 'fdrDate' ||
        sortField === 'maturedDate' ||
        sortField === 'createdAt'
      ) {
        aValue = new Date(aValue).getTime() as any
        bValue = new Date(bValue).getTime() as any
      } else {
        aValue = aValue.toLowerCase() as any
        bValue = bValue.toLowerCase() as any
      }
    }

    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1
    }
    return 0
  })

  // Paginate the sorted data
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = sortedData.slice(startIndex, endIndex)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>FDR Records</CardTitle>
          <CardDescription>Loading FDR data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={`loading-skeleton-${index}`}
                className="h-12 w-full"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        {fdrdata.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No FDR records found</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table className=" border shadow-md">
                <TableHeader className=" bg-slate-200 shadow-md">
                  <TableRow>
                    <TableHead className="w-[120px]">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('fdrNo')}
                        className="h-auto p-0 font-semibold"
                      >
                        FDR No.
                        {getSortIcon('fdrNo')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('company')}
                        className="h-auto p-0 font-semibold"
                      >
                        Company
                        {getSortIcon('company')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('bank')}
                        className="h-auto p-0 font-semibold"
                      >
                        Bank & Branch
                        {getSortIcon('bank')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('accountNo')}
                        className="h-auto p-0 font-semibold"
                      >
                        Account No.
                        {getSortIcon('accountNo')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('faceValue')}
                        className="h-auto p-0 font-semibold"
                      >
                        Face Value
                        {getSortIcon('faceValue')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('interestRate')}
                        className="h-auto p-0 font-semibold"
                      >
                        Interest Rate
                        {getSortIcon('interestRate')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('term')}
                        className="h-auto p-0 font-semibold"
                      >
                        Term
                        {getSortIcon('term')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('fdrDate')}
                        className="h-auto p-0 font-semibold"
                      >
                        FDR Date
                        {getSortIcon('fdrDate')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('maturedDate')}
                        className="h-auto p-0 font-semibold"
                      >
                        Matured Date
                        {getSortIcon('maturedDate')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((fdr, index) => {
                    const maturityInfo = getMaturityStatus(fdr.maturedDate)
                    return (
                      <TableRow key={`fdr-${fdr.id}-${fdr.fdrNo}-${index}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                            {fdr.fdrNo}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{fdr.company}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{fdr.bank}</div>
                            <div className="text-sm text-muted-foreground">
                              {fdr.branch}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {fdr.accountNo}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(fdr.faceValue)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Percent className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">
                              {fdr.interestRate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{fdr.term} months</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(fdr.fdrDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(fdr.maturedDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={maturityInfo.variant}>
                            {maturityInfo.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {maturityInfo.status === 'Matured'
                              ? `${maturityInfo.days} days ago`
                              : `${maturityInfo.days} days`}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className={
                          currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : ''
                        }
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, index) => {
                      if (
                        index === 0 ||
                        index === totalPages - 1 ||
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
                            Math.min(prev + 1, totalPages)
                          )
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
            )}

            {/* Results info */}
            <div className="text-sm text-muted-foreground mt-4 text-center">
              Showing {startIndex + 1} to {Math.min(endIndex, fdrdata.length)}{' '}
              of {fdrdata.length} results
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default FdrRecordList
