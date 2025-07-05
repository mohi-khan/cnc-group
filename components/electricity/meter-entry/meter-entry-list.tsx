'use client'

import { getMeterEntry } from '@/api/meter-entry-api'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { GetElectricityMeterType } from '@/utils/type'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { Plus, ArrowUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useMemo } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface MeterEntryListProps {
  onAddCategory: () => void
  meterEntry: GetElectricityMeterType[]
}

const MeterEntryList: React.FC<MeterEntryListProps> = ({
  onAddCategory,
  meterEntry,
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof GetElectricityMeterType
    direction: 'asc' | 'desc'
  }>({
    key: 'meterName',
    direction: 'desc',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const sortedMeterData = useMemo(() => {
    const sorted = [...meterEntry]
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
  }, [meterEntry, sortConfig])

  const paginatedMeterData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedMeterData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedMeterData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(meterEntry.length / itemsPerPage)

  const requestSort = (key: keyof GetElectricityMeterType) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }))
  }

  return (
    <div className="p-4 ">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Meter List</h1>
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
      <div className='overflow-x-scroll'>
        <Table className="shadow-md border">
          <TableHeader className="bg-slate-200 shadow-md">
            <TableRow >
              <TableHead >
                <Button variant="ghost" onClick={() => requestSort('meterName')}>
                  Meter Name
                  <ArrowUpDown className=" h-2 w-2" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('companyName')}>
                  Company Name
                  <ArrowUpDown className=" h-2 w-2" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('metertpe')}>
                  Meter Type
                  <ArrowUpDown className=" h-2 w-2" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('utilityType')}>
                  Utility Type
                  <ArrowUpDown className=" h-2 w-2" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('costCenterName')}>
                  Cost Center
                  <ArrowUpDown className=" h-2 w-2" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('description')}>
                  Meter Description
                  <ArrowUpDown className=" h-2 w-2" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('provaccountName')}>
                  Provision Account Name
                  <ArrowUpDown className=" h-2 w-2" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('accountHead')}>
                  Expense Account Name
                  <ArrowUpDown className=" h-2 w-2" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMeterData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.meterName}</TableCell>
                <TableCell>{row.companyName}</TableCell>
                <TableCell>{row.metertpe === 0 ? 'Pre-paid' : 'Post-paid'}</TableCell>
                <TableCell>{row.utilityType}</TableCell>
                <TableCell>{row.costCenterName}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.provaccountName}</TableCell>
                <TableCell>{row.accountHead}</TableCell>
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
      </div>
    </div>
  )
}

export default MeterEntryList
