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
import { ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import Loader from '@/utils/loader'

interface Voucher {
  voucherid: number
  voucherno: string
  date: string
  notes: string | null
  companyname: string | null
  location: string | null
  currency: string | null
  state: number
  totalamount: number
}

interface Column {
  key: keyof Voucher
  label: string
}

interface VoucherListProps {
  vouchers: Voucher[]
  columns: Column[]
  isLoading: boolean
  linkGenerator: (voucherId: number) => string
  itemsPerPage?: number
}

const VoucherList: React.FC<VoucherListProps> = ({
  vouchers,
  columns,
  isLoading,
  linkGenerator,
  itemsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Voucher>('voucherno')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (field: keyof Voucher) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedVouchers = useMemo(() => {
    return [...vouchers].sort((a, b) => {
      if (a[sortField] == null || b[sortField] == null) return 0
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [vouchers, sortField, sortDirection])

  const totalPages = Math.ceil(sortedVouchers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVouchers = sortedVouchers.slice(startIndex, endIndex)

  return (
    <>
      <Table className="border shadow-md">
        <TableHeader className="sticky top-28 bg-slate-200 shadow-md">
          <TableRow>
            {columns.map(({ key, label }) => (
              <TableHead
                key={key}
                className="cursor-pointer text-left"
                onClick={() => handleSort(key)}
              >
                <Button variant="ghost" className="hover:bg-transparent">
                  {label}
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-4">
                <Loader />
              </TableCell>
            </TableRow>
          ) : currentVouchers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-4">
                No voucher is available.
              </TableCell>
            </TableRow>
          ) : (
            currentVouchers.map((voucher) => (
              <TableRow key={voucher.voucherid}>
                {columns.map(({ key }) => (
                  <TableCell key={key}>
                    {key === 'voucherno' ? (
                      <Link href={linkGenerator(voucher.voucherid)}>
                        {voucher[key]}
                      </Link>
                    ) : key === 'state' ? (
                      `${voucher[key] === 0 ? 'Draft' : 'Post'}`
                    ) : key === 'totalamount' ? (
                      voucher[key].toFixed(2)
                    ) : (
                      voucher[key]
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
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
      )}
    </>
  )
}

export default VoucherList
