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

import { ArrowUpDown, Edit } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Import dialog components from your UI library
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { updateBudgetMaster } from '@/api/budget-api'

interface CreateBudgetProps {
  masterBudget: MasterBudgetType[]
}

// Define valid keys of MasterBudgetType for sorting
type SortColumn = keyof MasterBudgetType

// New component to handle editing and submitting budget changes
const EditBudgetDialog: React.FC<{ item: MasterBudgetType }> = ({ item }) => {
  const [name, setName] = useState(item.name)
  const [fromDate, setFromDate] = useState(item.fromDate)
  const [toDate, setToDate] = useState(item.toDate)

 
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg0LCJ1c2VybmFtZSI6InJpYWRuIiwiaWF0IjoxNzQwMjg0NjEzLCJleHAiOjE3NDAzNzEwMTN9.kfBHfbDQbHpMH19zhgh4qVrNSqe0Kh_BkqczoycE2fc'; // Replace with actual auth token
    const response = await updateBudgetMaster(item.budgetId, token);

    if (response.data) {
      console.log('Budget updated successfully:', {
        id: item.budgetId,
        name,
        fromDate,
        toDate,
      });
    } else {
      console.error('Failed to update budget');
    }
  } catch (error) {
    console.error('Error updating budget:', error);
  }
};


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4">
          <label className="block mb-2">
            Budget Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded p-1 w-full"
            />
          </label>
          <label className="block mb-2">
            From Date:
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded p-1 w-full"
            />
          </label>
          <label className="block mb-2">
            End Date:
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded p-1 w-full"
            />
          </label>
          <Button type="submit" variant="default" className="mt-2">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

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

  // Pagination indexes
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage

  const currentItems = useMemo(() => {
    const sortedData = sortData(masterBudget)
    return sortedData.slice(indexOfFirstItem, indexOfLastItem)
  }, [masterBudget, currentPage, sortColumn, sortDirection])

  return (
    <div>
      <Table className="border shadow-md mt-2 mb-4">
        <TableHeader className="sticky top-28 bg-slate-200 shadow-md">
          <TableRow>
            <SortableTableHead column="name">Budget Name</SortableTableHead>
            <SortableTableHead column="fromDate">From Date</SortableTableHead>
            <SortableTableHead column="toDate">End Date</SortableTableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((item, budgetId) => (
            <TableRow key={budgetId}>
              <TableCell>
                <Link href={`/budget/create-budget/${item.budgetId}`}>
                  {item.name}
                </Link>
              </TableCell>
              <TableCell>{item.fromDate}</TableCell>
              <TableCell>{item.toDate}</TableCell>
              <TableCell>
                <EditBudgetDialog item={item} />
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


