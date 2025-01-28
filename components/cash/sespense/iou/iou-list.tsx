'use client'

import type React from 'react'
import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'
import type { Employee, IouRecordGetType } from '@/utils/type'

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

interface LoanListProps {
  onAddCategory: () => void
  loanAllData: IouRecordGetType[]
  isLoading: boolean
  employeeData: Employee[]
}
const IouList: React.FC<LoanListProps> = ({
  onAddCategory,
  loanAllData,
  isLoading,
  employeeData,
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof IouRecordGetType
    direction: 'asc' | 'desc'
  }>({
    key: 'dateIssued',
    direction: 'desc',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [popupIouId, setPopupIouId] = useState<number | null>(null) // State to track which IOU ID the popup is for

  const itemsPerPage = 10

  // Find employee name by matching employeeId
  const getEmployeeName = (employeeId: number) => {
    const employee = employeeData.find((emp) => emp.id === employeeId)
    return employee ? employee.employeeName : 'Unknown Employee'
  }

  const sortedLoanData = useMemo(() => {
    const sorted = [...loanAllData]
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
  }, [loanAllData, sortConfig])

  const paginatedLoanData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedLoanData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedLoanData, currentPage])

  const totalPages = Math.ceil(loanAllData.length / itemsPerPage)

  const handleButtonClick = (loan: IouRecordGetType) => {
    console.log(`Adding Adj Amount for IOU ID: ${loan.iouId}`)
    setPopupIouId(loan.iouId) // Set the ID of the current loan
  }

  const closePopup = () => {
    setPopupIouId(null) // Close the popup by clearing the ID
  }

  const requestSort = (key: keyof IouRecordGetType) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }))
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">IOU List</h1>
        </div>
        <Button onClick={onAddCategory}>Add IOU</Button>
      </div>

      <>
        {/* Table Section */}
        {isLoading ? (
          <Loader />
        ) : (
          <Table className=" border shadow-md">
            <TableHeader className="sticky top-28 bg-slate-200 shadow-md">
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('employeeId')}
                  >
                    Employee Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('amount')}>
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('dateIssued')}
                  >
                    Issued Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('dueDate')}
                  >
                    Due Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('adjustedAmount')}
                  >
                    Adj.Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('notes')}>
                    Notes
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('status')}>
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLoanData.map((loan) => (
                <TableRow key={loan.iouId}>
                  <TableCell>{getEmployeeName(loan.employeeId)}</TableCell>
                  <TableCell>{loan.amount}</TableCell>

                  <TableCell>
                    {isNaN(new Date(loan.dateIssued).getTime())
                      ? 'Invalid Date'
                      : new Date(loan.dateIssued).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {isNaN(new Date(loan.dueDate).getTime())
                      ? 'Invalid Date'
                      : new Date(loan.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{loan.adjustedAmount}</TableCell>

                  <TableCell>{loan.notes}</TableCell>
                  <TableCell>
                    <span
                      className={
                        loan.status === 'inactive'
                          ? 'text-red-500 capitalize'
                          : loan.status === 'active'
                            ? 'text-green-500 capitalize'
                            : 'text-gray-800'
                      }
                    >
                      {loan.status}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => handleButtonClick(loan)}
                    >
                      Adjustment
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {/* Render the popup only for the selected IOU */}
        {popupIouId && (
          <IouAdjPopUp
            iouId={popupIouId} // Pass only the selected IOU ID
            isOpen={!!popupIouId}
            onOpenChange={closePopup} // Close handler
          />
        )}

        {/* Pagination */}
        <div className="mt-4">
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
      </>
    </div>
  )
}

export default IouList
