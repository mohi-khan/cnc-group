'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ApproveAdvanceType, CurrencyType } from '@/utils/type'
import { getAllAdvance, approveAdvance } from '@/api/approve-advance-api'
import { Button } from '../ui/button'
import { toast } from '@/hooks/use-toast'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { getAllCurrency } from '@/api/common-shared-api'
import { useRouter } from 'next/navigation'

const ApproveAdvance = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  const [advances, setAdvances] = useState<ApproveAdvanceType[]>([])
  const [currency, setCurrency] = useState<CurrencyType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const parsedUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
    setUser(parsedUser)
  }, [token])

  const fetchAdvances = useCallback(async () => {
    if (!token) return

    try {
      setIsLoading(true)
      setError(null)

      const data = await getAllAdvance(token)
      setAdvances(Array.isArray(data?.data) ? data.data : [])
    } catch (err) {
      console.error('Error fetching advances:', err)
      setError('Failed to fetch advance requests')
      setAdvances([])
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const handleApproveClick = async (advance: ApproveAdvanceType) => {
    if (!token || !user) return

    try {
      setProcessingId(advance.id.toString())

      const approvalData = {
        invoiceId: advance.id.toString(),
        approvalStatus: 'APPROVED',
        approvedBy: user?.employeeId ? String(user.employeeId) : '1',
      }

      const response = await approveAdvance(approvalData, token)

      if ((response as any).success) {
        toast({
          title: 'Advance Approved',
          description: `Successfully approved advance request ${advance.reqno}`,
        })
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
    await fetchAdvances()
  }

  const handleRejectClick = async (advance: ApproveAdvanceType) => {
    if (!token || !user) return

    try {
      setProcessingId(advance.id.toString())

      const approvalData = {
        invoiceId: advance.id.toString(),
        approvalStatus: 'REJECTED',
        approvedBy: user?.employeeId ? String(user.employeeId) : '1',
      }

      const response = await approveAdvance(approvalData, token)

      if ((response as any).success) {
        toast({
          title: 'Advance Rejected',
          description: `Successfully rejected advance request ${advance.reqno}`,
        })
      }
    } catch (err) {
      console.error('Error rejecting advance:', err)
      toast({
        title: 'Rejection Failed',
        description:
          err instanceof Error
            ? err.message
            : 'Failed to reject advance request',
        variant: 'destructive',
      })
    } finally {
      setProcessingId(null)
    }
    await fetchAdvances()
  }

  const fetchCurrency = useCallback(async () => {
    if (!token) return
    try {
      const response = await getAllCurrency(token)
      console.log('Raw API response:', response) // Log the entire response to see its structure
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        console.log('Unauthorized access')
        return
      } else if (response.error || !response.data) {
        console.error('Error fetching currency:', response.error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error?.message || 'Failed to fetch currency',
        })
        return
      } else if (response && response.data) {
        console.log('currency data structure:', response.data[0]) // Log the first currency to see structure
        setCurrency(response.data)
        console.log('currency data set:', response.data)
      } else {
        console.error('Invalid response format from getAllcurrency:', response)
      }
    } catch (error) {
      console.error('Error fetching currency:', error)
    }
  }, [token])

  useEffect(() => {
    fetchAdvances()
    fetchCurrency()
  }, [fetchAdvances, fetchCurrency, token])

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
        ) : (
          <Table className="border shadow-md">
            <TableHeader className="border shadow-md bg-slate-200">
              <TableRow>
                <TableHead>Requisition No</TableHead>
                <TableHead>PO ID</TableHead>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Requested By</TableHead>
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
                    {error
                      ? 'Failed to fetch advance requests'
                      : 'No pending advance requests for approval'}
                  </TableCell>
                </TableRow>
              ) : (
                advances.map((advance) => (
                  <TableRow key={advance.id}>
                    <TableCell>{advance.reqno}</TableCell>
                    <TableCell>{advance.poid}</TableCell>
                    <TableCell>{advance.vendorname}</TableCell>
                    <TableCell>{advance.requestedby}</TableCell>
                    <TableCell>{advance.checkName}</TableCell>
                    <TableCell>{advance.requestedDate}</TableCell>
                    <TableCell>
                      {advance.advanceamount}{' '}
                      {
                        currency.find(
                          (c) => String(c.currencyId) === String(advance.currency)
                        )?.currencyCode
                      }
                    </TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={advance.description || undefined}
                    >
                      {advance.description || undefined}
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2"
                        onClick={() => handleRejectClick(advance)}
                        disabled={processingId === advance.id.toString()}
                      >
                        {processingId === advance.id.toString()
                          ? 'Processing...'
                          : 'Reject'}
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
