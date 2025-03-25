'use client'

import type React from 'react'
import { useState, useMemo } from 'react'
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { ArrowUpDown } from 'lucide-react'
import type { AssetCategoryType } from '@/utils/type'

interface AssetCategoryListProps {
  categories: AssetCategoryType[]
  onAddCategory: () => void
}

type SortColumn =
  | 'category_name'
  | 'depreciation_rate'
  | 'account_code'
  | 'depreciation_account_code'
type SortDirection = 'asc' | 'desc'

export const AssetCategoryList: React.FC<AssetCategoryListProps> = ({
  categories,
  onAddCategory,
}) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('category_name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const sortedCategories = useMemo(() => {
    const sorted = [...categories]
    sorted.sort((a, b) => {
      if (sortColumn === 'depreciation_rate') {
        return sortDirection === 'asc'
          ? Number(a[sortColumn]) - Number(b[sortColumn])
          : Number(b[sortColumn]) - Number(a[sortColumn])
      }
      return sortDirection === 'asc'
        ? String(a[sortColumn]).localeCompare(String(b[sortColumn]))
        : String(b[sortColumn]).localeCompare(String(a[sortColumn]))
    })
    return sorted
  }, [categories, sortColumn, sortDirection])

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedCategories.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedCategories, currentPage])

  const totalPages = Math.ceil(categories.length / itemsPerPage)

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

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
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableHead>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Asset Categories</h1>
        <Button onClick={onAddCategory}>Add Asset Category</Button>
      </div>
      <Table className="border shadow-md">
        <TableHeader className="bg-slate-200">
          <TableRow>
            <SortableTableHead column="category_name">
              Category Name
            </SortableTableHead>
            <SortableTableHead column="depreciation_rate">
              Depreciation Rate
            </SortableTableHead>
            <SortableTableHead column="account_code">
              Account
            </SortableTableHead>
            <SortableTableHead column="depreciation_account_code">
              Depreciation Account
            </SortableTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCategories.map((category) => (
            <TableRow key={category.category_id}>
              <TableCell>{category.category_name}</TableCell>
              <TableCell>{category.depreciation_rate}%</TableCell>
              <TableCell>{category.account}</TableCell>
              <TableCell>{category.depreciation_account}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
