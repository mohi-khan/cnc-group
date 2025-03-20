'use client'

import { useRef, useState } from 'react'
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
import { PaymentRequisitionPopup } from './payment-requisition-popup'
import { useReactToPrint } from 'react-to-print'
import { toWords } from 'number-to-words'

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
  const [paymentPopupOpen, setPaymentPopupOpen] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<string>('')

  const checkRef = useRef<HTMLDivElement>(null)
  const printCheckFn = useReactToPrint({ contentRef: checkRef })

  const handleApproveClick = (requisition: GetPaymentOrder) => {
    setSelectedRequisition(requisition)
    setApprovalDialogOpen(true)
  }

  const handleActionClick = (requisition: GetPaymentOrder, status: string) => {
    setSelectedRequisition(requisition)
    setCurrentStatus(status)
    setPaymentPopupOpen(true)
  }

  const handleApproveInvoice = async () => {
    if (!selectedRequisition) return

    try {
      setIsApproving(true)

      // Prepare the data for approval
      const approvalData = {
        invoiceId: '5',
        approvalStatus: 'Approved',
        approvedBy: '1',
        poId: '10',
      }

      await approveInvoice(approvalData, token)

      // Only show success toast and close dialog if API call succeeds
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
                  <Button
                    size="sm"
                    onClick={() => handleActionClick(req, 'Invoice Approved')}
                  >
                    Create Payment
                  </Button>
                )}
                {req.status === 'GRN Completed' && (
                  <Button
                    size="sm"
                    onClick={() => handleActionClick(req, 'GRN Completed')}
                  >
                    Create Invoice
                  </Button>
                )}
                {req.status === 'Purchase Order' && (
                  <Button
                    size="sm"
                    onClick={() => handleActionClick(req, 'Purchase Order')}
                  >
                    Create Advance
                  </Button>
                )}
                {(req.status === 'Invoice Approved' ||
                  req.status === 'Purchase Order') && (
                  <Button
                    size="sm"
                    className="ml-3"
                    onClick={() => printCheckFn()}
                  >
                    Print Check
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {requisitions.map((req, index) => (
        <div className="hidden" key={index}>
          <div ref={checkRef} className="p-8 bg-white">
            <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="relative p-6 border border-gray-300 bg-white">
                <div className="flex justify-end items-start mb-8">
                  <div className="text-right">
                    <div className="flex items-center justify-end">
                      {/* date */}
                      <span className="text-sm mr-2">{new Date(req.PurDate).toISOString().split('T')[0]}</span>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex items-center mb-1">
                    {/* pay to */}
                    <p className="flex-1 pb-1 pt-2 ">sdfsdf</p>
                  </div>
                </div>
                <div className="flex mb-6">
                  <div className="flex-1">
                    {/* amoutn word */}
                    <p className="flex-1 pb-1 pt-2 ">{toWords(req.amount)} only</p>
                  </div>
                  <div className="px-2 py-1 flex items-center whitespace-nowrap ml-5">
                    {/* amount */}
                    <span className="font-medium">{req.amount}/-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

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

      {/* Payment Requisition Popup */}
      {selectedRequisition && (
        <PaymentRequisitionPopup
          isOpen={paymentPopupOpen}
          onOpenChange={setPaymentPopupOpen}
          requisition={selectedRequisition}
          token={token}
          onSuccess={onRefresh}
          status={currentStatus}
        />
      )}
    </div>
  )
}

export default PaymentRequisitionList
