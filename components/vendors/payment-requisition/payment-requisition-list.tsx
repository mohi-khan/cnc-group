import type React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PurchaseEntryType } from '@/utils/type'

interface PaymentRequisitionListProps {
  requisitions: PurchaseEntryType[]
}

const PaymentRequisitionList: React.FC<PaymentRequisitionListProps> = ({
  requisitions,
}) => {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO No</TableHead>
            <TableHead>PO Date</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Vendor Code</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requisitions && requisitions.length > 0 ? (
            requisitions.map((req) => (
              <TableRow key={req.purchaseMaster.poNo}>
                <TableCell>{req.purchaseMaster.poNo}</TableCell>
                <TableCell>
                  {new Date(req.purchaseMaster.poDate).toLocaleDateString()}
                </TableCell>
                <TableCell>${req.purchaseMaster.totalAmount}</TableCell>
                <TableCell>{req.purchaseMaster.status}</TableCell>
                <TableCell>{req.purchaseMaster.vendorCode}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center h-24 text-muted-foreground"
              >
                No payment requisition is available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default PaymentRequisitionList
