import type React from 'react'
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
  onSort: (key: keyof Voucher) => void
  linkGenerator: (voucherId: number) => string
}

const VoucherList: React.FC<VoucherListProps> = ({
  vouchers,
  columns,
  isLoading,
  onSort,
  linkGenerator,
}) => {
  return (
    <Table className="border shadow-md">
      <TableHeader className="sticky top-28 bg-slate-200 shadow-md">
        <TableRow>
          {columns.map(({ key, label }) => (
            <TableHead
              key={key}
              className="cursor-pointer"
              onClick={() => onSort(key)}
            >
              <div className="flex items-center gap-1">
                {label}
                <ArrowUpDown className="h-4 w-4" />
              </div>
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
        ) : vouchers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center py-4">
              No journal voucher is available.
            </TableCell>
          </TableRow>
        ) : (
          vouchers.map((voucher) => (
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
  )
}

export default VoucherList
