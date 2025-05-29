'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, RotateCcw, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { toWords } from 'number-to-words'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import { type VoucherById, VoucherTypes } from '@/utils/type'
import { useReactToPrint } from 'react-to-print'
import {
  getSingleVoucher,
  reverseJournalVoucher,
} from '@/api/contra-voucher-api'
import Loader from '@/utils/loader'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'

// Add this after your imports
const printStyles = `
  @media print {
    .no-print {
      display: none !important;
    }
    .print\\:block {
      display: block !important;
    }
    .print\\:mb-8 {
      margin-bottom: 2rem !important;
    }
  }
`

export default function SingleVoucherDetails() {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  // State variables
  const { voucherid } = useParams()
  const router = useRouter()
  const [data, setData] = useState<VoucherById[]>()
  const [editingReferenceIndex, setEditingReferenceIndex] = useState<
    number | null
  >(null)
  const [editingReferenceText, setEditingReferenceText] = useState('')
  const [isReversingVoucher, setIsReversingVoucher] = useState(false)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const checkRef = useRef<HTMLDivElement>(null)
  const reactToPrintFn = useReactToPrint({ contentRef })
  const printCheckFn = useReactToPrint({ contentRef: checkRef })
  const [userId, setUserId] = React.useState<number | null>(null)

  const isContraVoucher = data?.[0]?.journaltype === VoucherTypes.ContraVoucher

  useEffect(() => {
    async function fetchVoucher() {
      if (!voucherid || !token) return
      try {
        const response = await getSingleVoucher(voucherid as string, token)
        if (response.error || !response.data) {
          toast({
            title: 'Error',
            description:
              response.error?.message || 'Failed to get Voucher Data',
          })
        } else {
          setData(response.data)
          console.log('🚀 ~ fetchVoucher ~ response.data.data:', response.data)
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
  }, [voucherid, token])

  const handleReferenceEdit = (index: number, currentText: string) => {
    setEditingReferenceIndex(index)
    setEditingReferenceText(currentText)
  }

  React.useEffect(() => {
    if (userData) {
      setUserId(userData.userId)
      console.log(
        'Current userId from localStorage in everywhere:',
        userData.userId
      )
    } else {
      console.log('No user data found in localStorage')
    }
  }, [userData])

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

  const handleReverseVoucher = () => {
    setIsAlertDialogOpen(true)
  }

  const confirmReverseVoucher = async () => {
    setIsAlertDialogOpen(false)
    const createdId = userId ?? 0 // Replace with actual user ID
    const voucherId = data?.[0].voucherno
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
      const response = await reverseJournalVoucher(
        Number(voucherid),
        createdId,
        token
      )

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
  }

  if (!data) {
    return (
      <div className="felx items-center justify-center h-screen">
        <Loader />
      </div>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
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
              <div className="grid grid-cols-[120px,1fr] gap-8">
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
                <span className="font-medium whitespace-nowrap capitalize">
                  Created By: {data[0].createdby}
                </span>
                <span></span>
              </div>
            </div>
            <div className="flex justify-end gap-2 no-print">
              <AlertDialog
                open={isAlertDialogOpen}
                onOpenChange={setIsAlertDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReverseVoucher}
                    disabled={isReversingVoucher}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {isReversingVoucher ? 'Reversing...' : 'Reverse'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will reverse the voucher. This action cannot
                      be undone. Are you sure?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmReverseVoucher}>
                      Yes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {data[0].journaltype === VoucherTypes.BankVoucher && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => printCheckFn()}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Check
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => reactToPrintFn()}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Voucher
              </Button>
            </div>
          </div>

          {/* Journal Items Table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{data[0]?.journaltype}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="shadow-md border">
                <TableHeader className="bg-slate-200 shadow-md">
                  <TableRow>
                    <TableHead>Accounts</TableHead>
                    <TableHead>Bank Account</TableHead>
                    <TableHead>Cost Center</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Debit</TableHead>
                    <TableHead>Credit</TableHead>
                    <TableHead className="no-print">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.accountsname || "N/A"}</TableCell>
                      <TableCell>{item.bankaccount || 'N/A'}</TableCell>
                      <TableCell>{item.costcenter || "N/A"}</TableCell>
                      <TableCell>{item.department || "N/A"}</TableCell>
                      <TableCell>{item.partner || "N/A"}</TableCell>
                      <TableCell>
                        {editingReferenceIndex === index ? (
                          <Input
                            type="text"
                            value={editingReferenceText}
                            onChange={(e) =>
                              setEditingReferenceText(e.target.value)
                            }
                          />
                        ) : (
                          item.notes
                        )}
                      </TableCell>
                      <TableCell>{item.debit}</TableCell>
                      <TableCell>{item.credit}</TableCell>
                      <TableCell className="no-print">
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
                            onClick={() =>
                              handleReferenceEdit(index, item.notes)
                            }
                          >
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-6 grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium">Reference:</span>
                <span>{data[data.length - 1].notes}</span>
              </div>
              {/* Total Debit Amount */}
              <div className="mt-4 grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium">Total:</span>
                <span>{data[data.length - 1].totalamount} {data[data.length-1].currency}</span>
              </div>
              <div className="mt-4 grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium">Total:</span>
                <span className='capitalize'>{toWords(data[data.length - 1].totalamount)} {data[data.length-1].currency} only</span>
              </div>
              <div className="flex justify-between mt-20">
                <h1 className="border-t-2 border-black pt-2">
                  Signature of Recipient
                </h1>
                <h1 className="border-t-2 border-black pt-2">Prepared by</h1>
                <h1 className="border-t-2 border-black pt-2">Checked by</h1>
                <h1 className="border-t-2 border-black pt-2">
                  Approved by CM/MD
                </h1>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Hidden check for printing - completely separate from the main card */}
      {data.map((item, index) => (
        <div className="hidden" key={index}>
          <div ref={checkRef} className="p-8 bg-white">
            <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="relative p-6 border border-gray-300 bg-white">
                {/* Bank Header */}
                <div className="flex justify-end items-start mb-8">
                  <div className="text-right">
                    <div className="flex items-center justify-end">
                      <span className="text-sm mr-2">{item.date}</span>
                    </div>
                  </div>
                </div>

                {/* Payee Section */}
                <div className="mb-6">
                  <div className="flex items-center mb-1">
                    <p className="flex-1 pb-1 pt-2 ">{data[0]?.payTo}</p>
                  </div>
                </div>

                {/* Amount Section */}
                <div className="flex mb-6">
                  <div className="flex-1">
                    <p className="flex-1 pb-1 pt-2 ">
                      {item.debit === 0
                        ? toWords(item.credit)
                        : toWords(item.debit)}
                    </p>
                  </div>
                  <div className="px-2 py-1 flex items-center whitespace-nowrap ml-5">
                    <span className="font-medium">
                      {item.debit === 0 ? item.credit : item.debit}/-
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
