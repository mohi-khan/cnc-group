'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, RotateCcw, Edit2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { getSingleVoucher } from '@/api/journal-voucher-api'
import { JournalEntryWithDetails } from '@/utils/type'

export default function SingleJournalVoucher() {
  const { voucherid } = useParams() // Get voucherid from URL
  console.log('🚀 ~ SingleJournalVoucher ~ voucherid:', voucherid)
  const [data, setData] = useState<JournalEntryWithDetails>()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [editingNotes, setEditingNotes] = useState('')

  useEffect(() => {
    async function fetchVoucher() {
      if (!voucherid) return
      try {
        const response = await getSingleVoucher(voucherid as string)
        if (response.error || !response.data) {
          console.error('Error getting Voucher Data:', response.error)
          toast({
            title: 'Error',
            description:
              response.error?.message || 'Failed to get Voucher Data',
          })
        } else {
          setData(response.data.data)
          console.log('data', response.data.data)
        }
      } catch (error) {
        console.error('Error fetching voucher:', error)
        toast({
          title: 'Error',
          description:
            'An unexpected error occurred while fetching the voucher.',
        })
      }
    }

    fetchVoucher()
  }, [voucherid])

  const handleEditClick = (index: number) => {
    if (!data) return
    setEditingItemIndex(index)
    setEditingNotes(data.items[index].notes || '')
    setIsEditDialogOpen(true)
  }

  const handleSaveNotes = () => {
    if (data && editingItemIndex !== null) {
      const newItems = [...data.items]
      newItems[editingItemIndex] = {
        ...newItems[editingItemIndex],
        notes: editingNotes,
      }
      setData({
        ...data,
        items: newItems,
      })
      setIsEditDialogOpen(false)
      setEditingItemIndex(null)
    }
  }

  if (!data) {
    return <p>Loading...</p>
  }

  return (
    <>
      <Card className="w-full max-w-5xl mx-auto mt-20">
        <CardContent className="p-6">
          {/* Header Section */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium">Voucher No:</span>
                <span>{data[0].voucherno}</span>
              </div>
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium">Accounting Date:</span>
                <span>{data[0].date}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reverse
              </Button>
              <Button variant="outline" size="sm" onClick={()=> window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          {/* Created By */}
          <div className="mb-6">
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="font-medium">Created by:</span>
              <span>{data.createdBy}</span>
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
              {data.map((item) => (
                <div
                  key={item.voucherid}
                  className="grid grid-cols-[2fr,1fr,1fr,1fr,2fr,1fr,1fr,auto] gap-2 p-3 border-t items-center text-sm"
                >
                  <div>{item.accountsname}</div>
                  <div>{item.costcenter}</div>
                  <div>{item.department}</div>
                  <div>{item.partner}</div>
                  <div>{item.notes}</div>
                  <div>{item.debit.toLocaleString()}</div>
                  <div>{item.credit.toLocaleString()}</div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(item.voucherid)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reference Section */}
          <div className="mt-6">
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="font-medium">Reference:</span>
              <span>{data[0].reference}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Notes Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveNotes}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
