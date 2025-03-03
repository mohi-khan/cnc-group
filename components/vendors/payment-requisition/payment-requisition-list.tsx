'use client'

import { useState } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { approveInvoice } from '@/api/payment-requisition-api'

interface PaymentRequisitionListProps {
  requisitions: GetPaymentOrder[]
  token: string
  onRefresh: () => void
}

const PaymentRequisitionList: React.FC<PaymentRequisitionListProps> = ({
  requisitions,
  token,
  onRefresh,
}) => {
  const { toast } = useToast()
  const [isApproving, setIsApproving] = useState(false)
  const [selectedRequisition, setSelectedRequisition] =
    useState<GetPaymentOrder | null>(null)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)

  const handleApproveClick = (requisition: GetPaymentOrder) => {
    setSelectedRequisition(requisition)
    setApprovalDialogOpen(true)
  }

  const handleApproveInvoice = async () => {
    if (!selectedRequisition) return

    try {
      setIsApproving(true)

      // Prepare the data for approval
      const approvalData = {
        invoiceId: '5',
        approvalStatus: 'Approved',
        approvedBy: '61',
        poId: '10',
      }

      await approveInvoice(approvalData, token)

      toast({
        title: 'Invoice approved',
        description: `Invoice for PO ${selectedRequisition.poNo} has been approved successfully.`,
      })

      // Close dialog and refresh data
      setApprovalDialogOpen(false)
      onRefresh()
    } catch (error) {
      console.error('Error approving invoice:', error)
      toast({
        title: 'Approval failed',
        description:
          'There was an error approving the invoice. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsApproving(false)
    }
  }

  if (!requisitions || requisitions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-xl font-light">
        No payment requisitions available
      </div>
    )
  }

  return (
    <div className="w-full">
      <Table className="border shadow-md">
        <TableHeader className="border bg-slate-200 shadow-md">
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
                  <Button size="sm" onClick={() => handleApproveClick(req)}>
                    Approve Invoice
                  </Button>
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

      {/* Approval Confirmation Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve the invoice for PO{' '}
              {selectedRequisition?.poNo}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalDialogOpen(false)}
              disabled={isApproving}
            >
              Cancel
            </Button>
            <Button onClick={handleApproveInvoice} disabled={isApproving}>
              {isApproving ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PaymentRequisitionList
