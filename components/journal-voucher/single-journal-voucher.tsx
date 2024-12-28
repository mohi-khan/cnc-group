'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, RotateCcw, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import {
  getSingleVoucher,
  reverseJournalVoucher,
} from '@/api/journal-voucher-api'
import { JournalEntryWithDetails } from '@/utils/type'
import { useReactToPrint } from 'react-to-print'

export default function SingleJournalVoucher() {
  const { voucherid } = useParams()
  const router = useRouter()
  const [data, setData] = useState<JournalEntryWithDetails>()
  const [editingReferenceIndex, setEditingReferenceIndex] = useState<
    number | null
  >(null)
  const [editingReferenceText, setEditingReferenceText] = useState('')
  const [isReversingVoucher, setIsReversingVoucher] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const reactToPrintFn = useReactToPrint({ contentRef })

  useEffect(() => {
    async function fetchVoucher() {
      if (!voucherid) return
      try {
        const response = await getSingleVoucher(voucherid as string)
        if (response.error || !response.data) {
          toast({
            title: 'Error',
            description:
              response.error?.message || 'Failed to get Voucher Data',
          })
        } else {
          setData(response.data.data)
        }
      } catch (error) {
        toast({
          title: 'Error',
          description:
            'An unexpected error occurred while fetching the voucher.',
        })
      }
    }

    fetchVoucher()
  }, [voucherid])

  const handleReferenceEdit = (index: number, currentText: string) => {
    setEditingReferenceIndex(index)
    setEditingReferenceText(currentText)
  }

  const handleReferenceSave = () => {
    if (data && editingReferenceIndex !== null) {
      const updatedData = [...data]
      updatedData[editingReferenceIndex] = {
        ...updatedData[editingReferenceIndex],
        notes: editingReferenceText,
      }
      setData(updatedData)
      setEditingReferenceIndex(null)
    }
  }

  const handleReverseVoucher = async () => {
    if (!voucherid || !data) return
    const createdId = 60 // Replace with the actual user ID or fetch it from your auth system
    const response = await reverseJournalVoucher(data[0].voucherno, createdId)
    console.log("🚀 ~ handleReverseVoucher ~ data[0].voucherno:", data[0].voucherno)
    if (!response.data || response.error) {
      console.log(response.error)
    } else {
      setIsReversingVoucher(true)
    }
  }

  if (!data) {
    return <p>Loading...</p>
  }

  return (
    <Card ref={contentRef} className="w-full max-w-5xl mx-auto mt-24">
      <CardContent className="p-6">
        {/* Header Section */}
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
              <span className="font-medium whitespace-nowrap">
                Created By:
              </span>
              <span></span>
            </div>
          </div>
          <div className="flex justify-end gap-2 no-print">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReverseVoucher}
              disabled={isReversingVoucher}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {isReversingVoucher ? 'Reversing...' : 'Reverse'}
            </Button>
            <Button variant="outline" size="sm" onClick={reactToPrintFn}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Journal Items Table */}
        <div className="mb-6">
          <h3 className="font-medium mb-4">Journal Items</h3>
          <div className="border rounded-lg">
            <div className="grid grid-cols-[2fr,1fr,1fr,1fr,2fr,1fr,1fr,auto] gap-2 p-3 bg-muted text-sm font-medium">
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
                key={item.voucherid}
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
                    >
                      <Check className="w-4 h-4" />
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
      </CardContent>
    </Card>
  )
}
