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
import type {
  Employee,
  IouRecordGetType,
} from '@/utils/type'

import Loader from '@/utils/loader'
import IouAdjPopUp from './iou-adj-popup'


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
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [popupIouId, setPopupIouId] = useState<number | null>(null); // State to track which IOU ID the popup is for

  const itemsPerPage = 10;

  // Find employee name by matching employeeId
  const getEmployeeName = (employeeId: number) => {
    const employee = employeeData.find((emp) => emp.id === employeeId);
    return employee ? employee.employeeName : 'Unknown Employee';
  };

  const sortedLoanData = useMemo(() => {
    const sorted = [...loanAllData];
    switch (sortBy) {
      case 'amount-asc':
        sorted.sort((a, b) => a.amount - b.amount);
        break;
      case 'amount-desc':
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case 'date-asc':
        sorted.sort(
          (a, b) =>
            new Date(a.dateIssued).getTime() - new Date(b.dateIssued).getTime()
        );
        break;
      case 'date-desc':
        sorted.sort(
          (a, b) =>
            new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime()
        );
        break;
    }
    return sorted;
  }, [loanAllData, sortBy]);

  const paginatedLoanData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedLoanData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedLoanData, currentPage]);

  const totalPages = Math.ceil(loanAllData.length / itemsPerPage);

  const handleButtonClick = (loan: IouRecordGetType) => {
    console.log(`Adding Adj Amount for IOU ID: ${loan.iouId}`);
    setPopupIouId(loan.iouId); // Set the ID of the current loan
  };

  const closePopup = () => {
    setPopupIouId(null); // Close the popup by clearing the ID
  };

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
        <Button onClick={onAddCategory}>Add IOU</Button>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* Table Section */}
          <Table className="border shadow-md">
            <TableHeader className="bg-slate-200 shadow-md">
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Adj.Amount</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
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
      )}
    </div>
  );
};

export default IouList;
