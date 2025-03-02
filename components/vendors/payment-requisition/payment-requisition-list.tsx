import type React from 'react'
import type { GetPaymentOrder } from '@/utils/type'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface PaymentRequisitionListProps {
  requisitions: GetPaymentOrder[]
}

const PaymentRequisitionList: React.FC<PaymentRequisitionListProps> = ({
  requisitions,
}) => {
  if (!requisitions || requisitions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-xl font-light">
        No payment requisitions available
      </div>
    )
  }

  return (
    <div className="w-full">
      <Table className='border shadow-md'>
        <TableHeader className='border bg-slate-200 shadow-md'>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>PO Number</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead>Req No</TableHead>
            <TableHead>Prepared By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requisitions.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-medium">{req.companyName}</TableCell>
              <TableCell>{req.poNo}</TableCell>
              <TableCell>{req.vendorName}</TableCell>
              <TableCell>${req.amount}</TableCell>
              <TableCell>
                {new Date(req.PurDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{req.reqNo}</TableCell>
              <TableCell>{req.preparedBy}</TableCell>
              <TableCell>{req.status}</TableCell>
              <TableCell className="text-right">
                {req.status === 'Invoice Created' && (
                  <Button size="sm">Approve Invoice</Button>
                )}
                {req.status === 'Invoice Approved' && (
                  <Button size="sm">Create Payment</Button>
                )}
                {req.status === 'GRN Completed' && (
                  <Button size="sm">Create Invoice</Button>
                )}
                {req.status === 'Purchase Order' && (
                  <Button size="sm">Create Advance</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default PaymentRequisitionList
