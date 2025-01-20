"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { AssetCategoryType } from "@/utils/type"

interface AssetCategoryListProps {
  categories: AssetCategoryType[]
  onAddCategory: () => void
}

export const AssetCategoryList: React.FC<AssetCategoryListProps> = ({ categories, onAddCategory }) => {
  const [sortBy, setSortBy] = useState<string>("name-asc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const sortedCategories = useMemo(() => {
    const sorted = [...categories]
    switch (sortBy) {
      case "name-asc":
        sorted.sort((a, b) => a.category_name.localeCompare(b.category_name))
        break
      case "name-desc":
        sorted.sort((a, b) => b.category_name.localeCompare(a.category_name))
        break
      case "rate-asc":
        sorted.sort((a, b) => Number(a.depreciation_rate) - Number(b.depreciation_rate))
        break
      case "rate-desc":
        sorted.sort((a, b) => Number(b.depreciation_rate) - Number(a.depreciation_rate))
        break
    }
    return sorted
  }, [categories, sortBy])

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedCategories.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedCategories, currentPage])

  const totalPages = Math.ceil(categories.length / itemsPerPage)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Asset Categories</h1>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="rate-asc">Depreciation Rate (Low to High)</SelectItem>
              <SelectItem value="rate-desc">Depreciation Rate (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddCategory}>Add Asset Category</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category Name</TableHead>
            <TableHead>Depreciation Rate</TableHead>
            <TableHead>Account Code</TableHead>
            <TableHead>Depreciation Account Code</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCategories.map((category) => (
            <TableRow key={category.category_id}>
              <TableCell>{category.category_name}</TableCell>
              <TableCell>{category.depreciation_rate}%</TableCell>
              <TableCell>{category.account_code}</TableCell>
              <TableCell>{category.depreciation_account_code}</TableCell>
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
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink onClick={() => setCurrentPage(index + 1)} isActive={currentPage === index + 1}>
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

