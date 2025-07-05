'use client'

import type React from 'react'
import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Plus } from 'lucide-react'
import { GetElectricityBillType } from '@/utils/type'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BillTableProps {
  onAddCategory: () => void
  billEntry: GetElectricityBillType[]
}

const BillTable: React.FC<BillTableProps> = ({ onAddCategory, billEntry }) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof GetElectricityBillType
    direction: 'asc' | 'desc'
  }>({
    key: 'billDate',
    direction: 'desc',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const sortedBillData = useMemo(() => {
    const sorted = [...billEntry]
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
  }, [billEntry, sortConfig])

  const paginatedBillData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedBillData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedBillData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(billEntry.length / itemsPerPage)

  const requestSort = (key: keyof GetElectricityBillType) => {
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
          <h1 className="text-2xl font-bold">Bill List</h1>
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
        </div>
        <Button onClick={onAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          ADD
        </Button>
      </div>
      <Table className="shadow-md border">
        <TableHeader className="bg-slate-200 shadow-md">
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={() => requestSort('meterName')}>
                Meter No
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => requestSort('billDate')}>
                Bill Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => requestSort('amount')}>
                Bill Amount
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => requestSort('payment')}>
                Payment
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedBillData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.meterName}</TableCell>
              <TableCell>{row.billDate}</TableCell>
              <TableCell>{row.amount}</TableCell>
              <TableCell>
                {row.payment === 0 ? 'Pre-paid' : 'Post-paid'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">
        {/* <Pagination>
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
        </Pagination> */}
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

export default BillTable
