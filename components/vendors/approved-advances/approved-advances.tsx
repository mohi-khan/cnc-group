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
import type { ApproveAdvanceType } from '@/utils/type'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { PaymentRequisitionPopup } from '../payment-requisition/payment-requisition-popup'
import { getAllAdvance } from '@/api/approved-advances-api'
import { useAtom } from 'jotai'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useRouter } from 'next/navigation'

const ApprovedAdvances = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [advances, setAdvances] = useState<ApproveAdvanceType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false)
  const [selectedAdvance, setSelectedAdvance] =
    useState<ApproveAdvanceType | null>(null)

  const fetchAdvances = useCallback(async () => {
    if (!token) return
    try {
      setIsLoading(true)
      setError(null)
      const data = await getAllAdvance(token)
      console.log('🚀 ~ fetchAdvances ~ data:', data)
      if (data?.error?.status === 401) {
        console.log('Unauthorized access')
        return
      } else if (data.error || !data.data) {
        console.error('Error fetching approved advances:', data.error)
        setError(data.error?.message || 'Failed to fetch approved advances')
        return
      } else {
        setAdvances(Array.isArray(data?.data) ? data.data : [])
      }
    } catch (err) {
      console.error('Error fetching approved advances:', err)
      setError('Failed to fetch approved advances')
      setAdvances([])
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        console.log('No user data or token found in localStorage')
        router.push('/')
        return
      }
    }

    checkUserData()
    fetchAdvances()
  }, [fetchAdvances, router])

  const handleCreatePayment = (advance: ApproveAdvanceType) => {
    setSelectedAdvance(advance)
    setIsPaymentPopupOpen(true)
  }

  return (
    <div className="w-[96%] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mt-10">Approved Advances</h1>
      </div>
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <p>Loading approved advances...</p>
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
                      ? 'Failed to fetch approved advances'
                      : 'No approved advances found'}
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
                    <TableCell>
                      {new Date(advance.requestedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {advance.advanceamount} {advance.currency}
                    </TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={advance.description || undefined}
                    >
                      {advance.description}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleCreatePayment(advance)}
                        disabled={processingId === advance.id.toString()}
                        variant="default"
                      >
                        {processingId === advance.id.toString()
                          ? 'Processing...'
                          : 'Create Payment'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
      {selectedAdvance && (
        <PaymentRequisitionPopup
          isOpen={isPaymentPopupOpen}
          onOpenChange={setIsPaymentPopupOpen}
          requisition={selectedAdvance}
          token={token}
          onSuccess={() => {
            fetchAdvances()
            toast({
              title: 'Success',
              description: 'Payment created successfully',
            })
          }}
          status="Invoice Approved"
        />
      )}
    </div>
  )
}

export default ApprovedAdvances
