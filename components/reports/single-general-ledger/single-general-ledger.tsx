'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, RotateCcw, Check, Copy } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import {
  getSingleVoucher,
  reverseJournalVoucher,
  editJournalDetail,
} from '@/api/journal-voucher-api'
import { VoucherById } from '@/utils/type'
import { useReactToPrint } from 'react-to-print'
import { Popup } from '@/utils/popup' // Import Popup component
import VoucherDuplicationContent from './voucher-duplication-content'

export default function SingleGenralLedger() {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const voucherid: number = parseInt(useParams().voucherid as string, 10)
  const router = useRouter()
  const [data, setData] = useState<VoucherById[]>()
  const [editingReferenceIndex, setEditingReferenceIndex] = useState<
    number | null
  >(null)
  const [editingReferenceText, setEditingReferenceText] = useState('')
  const [isReversingVoucher, setIsReversingVoucher] = useState(false)
  const [userId, setUserId] = React.useState<number>(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const reactToPrintFn = useReactToPrint({ contentRef })

  // New state for duplication popup
  const [isDuplicatePopupOpen, setIsDuplicatePopupOpen] = useState(false)
  const [voucherToDuplicate, setVoucherToDuplicate] = useState<
    VoucherById[] | undefined
  >(undefined)

  const fetchVoucher = useCallback(async () => {
    if (!voucherid) return
    try {
      if (!token) return
      const response = await getSingleVoucher(voucherid, token)
      if (response.error || !response.data) {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to get Voucher Data',
        })
      } else {
        setData(response.data)
        console.log('all data: ', response.data)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching the voucher.',
      })
    }
  }, [voucherid, token])

  useEffect(() => {
    fetchVoucher()
  }, [fetchVoucher])

  const handleReferenceEdit = (index: number, currentText: string) => {
    setEditingReferenceIndex(index)
    setEditingReferenceText(currentText)
  }

  const handleReferenceSave = async () => {
    if (editingReferenceIndex === null || !data) {
      return
    }
    const journalDetail = data[editingReferenceIndex]
    setIsUpdating(true)
    setError(null)
    try {
      const response = await editJournalDetail(
        {
          id: journalDetail.id,
          notes: editingReferenceText,
        },
        token
      )
      if (response.error) {
        throw new Error(response.error?.message || 'Failed to update notes')
      }
      setEditingReferenceIndex(null)
      setEditingReferenceText('')
      if (voucherid) {
        if (!token) return
        const refreshResponse = await getSingleVoucher(voucherid, token)
        if (refreshResponse.error || !refreshResponse.data) {
          throw new Error(
            refreshResponse.error?.message || 'Failed to refresh data'
          )
        }
        setData(refreshResponse.data)
      }
      toast({
        title: 'Success',
        description: 'Notes updated successfully',
      })
    } catch (error) {
      console.error('Error updating notes:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to update notes'
      )
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update notes',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  React.useEffect(() => {
    if (userData) {
      setUserId(userData?.userId)
    } else {
    }
  }, [userData])

  const handleReverseVoucher = React.useCallback(async () => {
    const createdId = userId
    let voucherId
    if (data && data[0]) {
      voucherId = data[0].voucherid
    }
    if (!voucherId || !data) return
    if (!voucherId) {
      toast({
        title: 'Error',
        description: 'Invalid voucher number',
        variant: 'destructive',
      })
      return
    }
    try {
      setIsReversingVoucher(true)
      if (!token) return
      const response = await reverseJournalVoucher(voucherId, createdId, token)
      if (!response.data || response.error) {
        toast({
          title: 'Error',
          description:
            response.error?.message || 'Failed to reverse the voucher',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Voucher reversed successfully',
        })
        router.refresh()
      }
    } catch (error: any) {
      console.error('Reverse voucher error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to reverse the voucher',
        variant: 'destructive',
      })
    } finally {
      setIsReversingVoucher(false)
    }
  }, [userId, data, token, router])

  const handleDuplicateVoucher = useCallback(() => {
    if (data && data.length > 0) {
      setVoucherToDuplicate(data)
      setIsDuplicatePopupOpen(true)
    } else {
      toast({
        title: 'Error',
        description: 'No voucher data available to duplicate.',
        variant: 'destructive',
      })
    }
  }, [data])

  const handleCloseDuplicatePopup = useCallback(() => {
    setIsDuplicatePopupOpen(false)
    setVoucherToDuplicate(undefined)
    fetchVoucher() // Refresh the original voucher data after duplication attempt
  }, [fetchVoucher])

  if (!data) {
    return <p>Loading...</p>
  }

  return (
    <Card ref={contentRef} className="w-full max-w-5xl mx-auto mt-24">
      <CardContent className="p-6">
        {/* Header Section */}
        <h1 className="text-center text-3xl font-bold">
          {data[0].companyname}
        </h1>
        <p className="text-center mb-10 text-xl font-semibold">
          {data[0].location}{' '}
        </p>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="font-medium">Voucher No:</span>
              <span>{data[0].voucherno}</span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-8">
              <span className="font-medium whitespace-nowrap">
                Accounting Date:
              </span>
              <span>{data[0].date}</span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-8">
              <span className="font-medium whitespace-nowrap">Created By:</span>
              <span>{data[0].createdby}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 no-print">
            {/* New Duplicate Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicateVoucher}
              disabled={!data || data.length === 0}
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReverseVoucher}
              disabled={isReversingVoucher}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {isReversingVoucher ? 'Reversing...' : 'Reverse'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => reactToPrintFn && reactToPrintFn()}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
        {/* Journal Items Table */}
        <div className="mb-6">
          <h3 className="font-medium mb-4">Journal Items</h3>
          <div className="border rounded-lg">
            <div className="grid grid-cols-[2fr,1fr,1fr,1fr,2fr,1fr,1fr,auto] gap-2 p-3 bg-muted text-sm font-medium bg-slate-200 shadow-md border-2">
              <div>Accounts</div>
              <div>Cost Center</div>
              <div>Department</div>
              <div>Partner</div>
              <div>Notes</div>
              <div>Debit</div>
              <div>Credit</div>
              <div>Action</div>
            </div>
            {data.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[2fr,1fr,1fr,1fr,2fr,1fr,1fr,auto] gap-2 p-3 border-t items-center text-sm"
              >
                <div>{item.accountsname}</div>
                <div>{item.costcenter}</div>
                <div>{item.department}</div>
                <div>{item.partner}</div>
                <div>
                  {editingReferenceIndex === index ? (
                    <input
                      type="text"
                      value={editingReferenceText}
                      onChange={(e) => setEditingReferenceText(e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    item.notes
                  )}
                </div>
                <div>{item.debit.toLocaleString()}</div>
                <div>{item.credit.toLocaleString()}</div>
                <div>
                  {editingReferenceIndex === index ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReferenceSave}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Saving...' : <Check className="w-4 h-4" />}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReferenceEdit(index, item.notes)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="font-medium">Reference:</span>
              <span>{data[0].notes}</span>
            </div>
          </div>
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </CardContent>

      {/* Duplicate Voucher Modal */}
      {isDuplicatePopupOpen && voucherToDuplicate && (
        <Popup
          isOpen={isDuplicatePopupOpen}
          onClose={handleCloseDuplicatePopup}
          title={`Duplicate ${voucherToDuplicate[0]?.journaltype || 'Voucher'}`}
          size="max-w-6xl"
        >
          <VoucherDuplicationContent
            voucherData={voucherToDuplicate}
            userId={userId}
            onClose={handleCloseDuplicatePopup}
          />
        </Popup>
      )}
    </Card>
  )
}
