'use client'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { getAllVoucherById } from '@/api/vouchers-api'
import { useParams } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { useEffect, useState } from 'react'
import { JournalEntryWithDetails } from '@/utils/type'

export default function Voucher() {
  const { voucherid } = useParams() // Extract voucherId from the URL
  console.log(voucherid)
  const [voucherData, setVoucherData] = useState<JournalEntryWithDetails>()

  async function getVoucherDetailsById() {
    if (!voucherid) {
      throw new Error('Voucher ID is missing')
    }

    const response = await getAllVoucherById(voucherid as string)

    if (response.error || !response.data) {
      console.error('Error getting voucher details:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get voucher details',
      })
      return
    }
    setVoucherData(response.data.data)
    console.log('Get all data by id:', response.data.data)
  }

  useEffect(() => {
    getVoucherDetailsById()
  }, [voucherid])

  if (!voucherData) {
    return <p>Loading...</p>
  }

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 p-4 border shadow-lg">
      {/* Header Section */}
      <CardHeader className="grid grid-cols-2 gap-4 border-b pb-4">
        <div className="space-y-2">
          <div className="text-center py-4 bg-yellow-100">
            <h1 className="text-xl font-bold uppercase">
              {voucherData[0].companyname}
            </h1>
          </div>
          <p>Phone: {voucherData.phoneNumber}</p>
          <p>Email: {voucherData.email}</p>
          <p>State: {voucherData.state}</p>
          <p>Address 1: {voucherData[0].location}</p>
          <p>Address 2: {voucherData.address2}</p>
        </div>
        <div className="flex flex-col items-end">
          <img
            src="/logo.webp"
            alt="Company Logo"
            className="w-24 h-24 object-contain"
          />
          <div className="mt-4 space-y-2">
            <Label>Date</Label>
            <p>{voucherData[0].date}</p>
            <Label>Voucher No</Label>
            <p>{voucherData[0].voucherno}</p>
            <Label>Payable To</Label>
            <p>{voucherData.payableTo}</p>
          </div>
        </div>
      </CardHeader>

      {/* Table Section */}
      <div className="mb-6">
        <div className="border rounded-lg">
          {/* Table Header */}
          <div className="grid grid-cols-[50px,2fr,1fr,2fr] gap-2 p-3 bg-muted text-sm font-medium">
            <div>Serial no:</div>
            <div>Particulars</div>
            <div>Payment Mode</div>
            <div>Amount</div>
          </div>
          {/* Table Rows */}
          {voucherData.map((item, id) => (
            <div
              key={id}
              className="grid grid-cols-[50px,2fr,1fr,2fr] gap-2 p-3 border-t items-center text-sm"
            >
              <div>{item.id}</div>
              <div>{item.particulars}</div>
              <div>{item.paymentMode}</div>
              <div>{item.totalamount.toLocaleString()}</div>
            </div>
          ))}
          {/* Total Amount Row */}
          <div className="grid grid-cols-[50px,2fr,1fr,2fr] gap-2 p-3 border-t items-center text-sm font-medium bg-gray-100">
            <div></div>
            <div></div>
            <div>Total:</div>
            <div>
              {voucherData
                .reduce((total, item) => total + item.totalamount, 0)
                .toLocaleString()}
            </div>
          </div>
        </div>
        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Left Column */}
          <div>
            <div className="border-2 py-4 px-2 bg-[#fff2cc]">
              <h4 className="text-sm font-medium mb-2">Amount in Words:</h4>
              <p className="text-sm text-gray-700 mb-4">Two Thousand Only</p>
            </div>
            <div className="border-2 py-4 px-2 bg-[#fff2cc] mt-2">
              <h4 className="text-sm font-medium mb-2">Terms & Conditions:</h4>
            </div>
          </div>
          {/* Right Column */}
          <div className="border rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm font-medium mb-2 bg-[#bf8f00] p-2 text-white">
              <div>Total Amount:</div>
              <div className="text-right">2,000</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm font-medium mb-2">
              <div>Paid:</div>
              <div className="text-right">1,000</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <div>Balance:</div>
              <div className="text-right">1,000</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <CardFooter className="text-center mt-4 space-y-2">
        <p className="text-sm text-muted-foreground">
          Generated on {voucherData[0].date}
        </p>
      </CardFooter>
    </Card>
  )
}
