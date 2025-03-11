'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ApproveAdvanceType } from '@/utils/type'
import { getAllAdvance, approveAdvance } from '@/api/approve-advance-api'
import { Button } from '../ui/button'
import { toast } from '@/hooks/use-toast'

const ApproveAdvance = () => {
  const [advances, setAdvances] = useState<ApproveAdvanceType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const mainToken = localStorage.getItem('authToken')
  const token = `Bearer ${mainToken}`
  const userId = localStorage.getItem('userId') || '1' // Default to '1' if not found

  useEffect(() => {
    fetchAdvances()
  }, [])

  const fetchAdvances = async () => {
    try {
      setIsLoading(true)
      const data = await getAllAdvance(token)
      setAdvances(data.data || [])
      console.log('🚀 ~ fetchAdvances ~ data:', data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch advance requests')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveClick = async (advance: ApproveAdvanceType) => {
    try {
      setProcessingId(advance.id.toString())

      const approvalData = {
        invoiceId: advance.id.toString(),
        approvalStatus: 'APPROVED',
        approvedBy: userId,
      }

      const response = await approveAdvance(approvalData, token)

      if ((response as any).success) {
        toast({
          title: 'Advance Approved',
          description: `Successfully approved advance request ${advance.requisitionNo}`,
        })

        // Remove the approved advance from the list or refresh the list
        setAdvances(advances.filter((item) => item.id !== advance.id))
      }
    } catch (err) {
      console.error('Error approving advance:', err)
      toast({
        title: 'Approval Failed',
        description:
          err instanceof Error
            ? err.message
            : 'Failed to approve advance request',
        variant: 'destructive',
      })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="w-[96%] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mt-10">Pending Advance Requests</h1>
      </div>
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <p>Loading advance requests...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <Table className="border shadow-md">
            <TableHeader className="border shadow-md bg-slate-200">
              <TableRow>
                <TableHead>Requisition No</TableHead>
                <TableHead>PO ID</TableHead>
                <TableHead>Vendor ID</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Check Name</TableHead>
                <TableHead>Requested Date</TableHead>
                <TableHead>Advance Amount</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    No pending advance requests found
                  </TableCell>
                </TableRow>
              ) : (
                advances?.map((advance) => (
                  <TableRow key={advance.id}>
                    <TableCell>{advance.requisitionNo}</TableCell>
                    <TableCell>{advance.poId}</TableCell>
                    <TableCell>{advance.vendorId}</TableCell>
                    <TableCell>{advance.requestedBy}</TableCell>
                    <TableCell>{advance.createdBy}</TableCell>
                    <TableCell>{advance.checkName}</TableCell>
                    <TableCell>{advance.requestedDate}</TableCell>
                    <TableCell>
                      {advance.advanceAmount} {advance.currency}
                    </TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={advance.remarks}
                    >
                      {advance.remarks}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleApproveClick(advance)}
                        disabled={processingId === advance.id.toString()}
                      >
                        {processingId === advance.id.toString()
                          ? 'Processing...'
                          : 'Approve'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}

export default ApproveAdvance
