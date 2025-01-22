'use client'

import type React from 'react'
import { useEffect, useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import type { Employee, IouRecordGetType } from '@/utils/type'
import { getEmployee, getLoanData } from '@/api/loan-api'
import { Loader2 } from 'lucide-react'
import Loader from '@/utils/loader'

interface LoanListProps {
  onAddCategory: () => void
}

const LoanList: React.FC<LoanListProps> = ({ onAddCategory }) => {
  const [loanData, setLoanData] = useState<IouRecordGetType[]>([])
  const [employeeData, setEmployeeData] = useState<Employee[]>([])
  const [sortBy, setSortBy] = useState<string>('date-desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 5

  useEffect(() => {
    fetchLoanData()
    fetchEmployeeData()
  }, [])

  // Fetch all Loan Data
  const fetchLoanData = async () => {
    setIsLoading(true)
    try {
      const loansdata = await getLoanData()
      if (loansdata.data) {
        setLoanData(loansdata.data)
      } else {
        setLoanData([])
      }
      console.log('Show The Loan  All Data :', loansdata.data)
    } catch (error) {
      console.error('Failed to fetch Loan Data :', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch all Employee Data
  const fetchEmployeeData = async () => {
    try {
      const employees = await getEmployee()
      if (employees.data) {
        setEmployeeData(employees.data)
      } else {
        setEmployeeData([])
      }
      console.log('Show The Employee Data :', employees.data)
    } catch (error) {
      console.error('Failed to fetch Employee Data :', error)
    }
  }

  // Find employee name by matching employeeId
  const getEmployeeName = (employeeId: number) => {
    const employee = employeeData.find((emp) => emp.id === employeeId)
    return employee ? employee.employeeName : 'Unknown Employee'
  }

  const sortedLoanData = useMemo(() => {
    const sorted = [...loanData]
    switch (sortBy) {
      case 'amount-asc':
        sorted.sort((a, b) => a.amount - b.amount)
        break
      case 'amount-desc':
        sorted.sort((a, b) => b.amount - a.amount)
        break
      case 'date-asc':
        sorted.sort(
          (a, b) =>
            new Date(a.dateIssued).getTime() - new Date(b.dateIssued).getTime()
        )
        break
      case 'date-desc':
        sorted.sort(
          (a, b) =>
            new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime()
        )
        break
    }
    return sorted
  }, [loanData, sortBy])

  const paginatedLoanData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedLoanData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedLoanData, currentPage])

  const totalPages = Math.ceil(loanData.length / itemsPerPage)

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">IOU List</h1>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
              <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
              <SelectItem value="date-asc">
                Date Issued (Oldest First)
              </SelectItem>
              <SelectItem value="date-desc">
                Date Issued (Newest First)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddCategory}>Add IOU List</Button>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* Table Section */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Adj.Amount</TableHead>
                <TableHead>Employee Name</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLoanData.map((loan) => (
                <TableRow key={loan.iouId}>
                  <TableCell>{loan.amount}</TableCell>
                  <TableCell>{loan.adjustedAmount}</TableCell>
                  <TableCell>{getEmployeeName(loan.employeeId)}</TableCell>
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
                  {/* <TableCell>{loan.status}</TableCell> */}
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

                  <TableCell>{loan.notes}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() =>
                        alert(`Adding Adj Amount for IOU ID: ${loan.iouId}`)
                      }
                    >
                      Add IOU Adj
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
      )}
    </div>
  )
}

export default LoanList
