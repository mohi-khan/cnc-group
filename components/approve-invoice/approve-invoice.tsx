'use client'

import { approveInvoice, getAllInvoices } from '@/api/approve-invoice-api'
import { GetPaymentOrder } from '@/utils/type'
import React, { useEffect, useState } from 'react'
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
import { toast } from '@/hooks/use-toast'

const ApproveInvoice = () => {
  const [isApproving, setIsApproving] = useState(false)
  const [requisitions, setInvoices] = useState<GetPaymentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequisition, setSelectedRequisition] =
    useState<GetPaymentOrder | null>(null)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)

  const mainToken = localStorage.getItem('authToken')
  console.log('🚀 ~ PaymentRequisition ~ mainToken:', mainToken)
  const token = `Bearer ${mainToken}`

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
      fetchInvoices()
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

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const data = await getAllInvoices({
        companyId: 75,
        token: token,
      })

      // Filter newly fetched data, not the existing state
      const filteredRequisitions =
        data.data?.filter((req) => req.status === 'Invoice Created') || []

      setInvoices(filteredRequisitions)
      console.log('🚀 ~ fetchRequisitions ~ data:', filteredRequisitions)
    } catch (err) {
      setError('Failed to fetch requisitions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  if (!requisitions || requisitions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-xl font-light">
        No payment requisitions available
      </div>
    )
  }

  return (
    <div className="w-[96%] mx-auto">
      <h1 className="text-2xl font-bold py-5">Approve Invoice</h1>
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
                <Button size="sm" onClick={() => handleApproveClick(req)}>
                  Approve Invoice
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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

export default ApproveInvoice
