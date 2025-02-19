'use client'
import React, { useState, useMemo } from 'react'
import { MasterBudgetType } from '@/utils/type'

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
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from '@/components/ui/pagination'

import { ArrowUpDown } from 'lucide-react'
import Link from 'next/link'

interface CreateBudgetProps {
  masterBudget: MasterBudgetType[]
}

// Define valid keys of MasterBudgetType for sorting
type SortColumn = keyof MasterBudgetType

const CreateBudgetList: React.FC<CreateBudgetProps> = ({ masterBudget }) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage] = useState<number>(5)

  const totalPages = Math.ceil(masterBudget.length / itemsPerPage)

  // Sorting Function
  const sortData = (data: MasterBudgetType[]) => {
    return [...data].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  // Handle Sorting
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Sortable Table Head Component
  const SortableTableHead: React.FC<{
    column: SortColumn
    children: React.ReactNode
  }> = ({ column, children }) => {
    const isActive = column === sortColumn
    return (
      <TableHead
        onClick={() => handleSort(column)}
        className="cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-1">
          <span>{children}</span>
          <ArrowUpDown
            className={`h-4 w-4 ${isActive ? 'text-black' : 'text-muted-foreground'}`}
          />
        </div>
      </TableHead>
    )
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage

  const currentItems = useMemo(() => {
    const sortedData = sortData(masterBudget)
    return sortedData.slice(indexOfFirstItem, indexOfLastItem)
  }, [masterBudget, currentPage, sortColumn, sortDirection])

  return (
    <div>
      <Table className="border shadow-md mt-2">
        <TableHeader className="sticky top-28 bg-slate-200 shadow-md">
          <TableRow>
            <SortableTableHead column="name">Budget Name</SortableTableHead>
            <SortableTableHead column="fromDate">From Date</SortableTableHead>
            <SortableTableHead column="toDate">End Date</SortableTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Link href={`/budget/create-budget/${item.id}`}>
                  {item.name}
                </Link>
              </TableCell>
              <TableCell>{item.fromDate}</TableCell>
              <TableCell>{item.toDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination (Following Your Style) */}
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

export default CreateBudgetList
