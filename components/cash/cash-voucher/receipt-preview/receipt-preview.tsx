'use client'
import { Card, CardHeader, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { getAllVoucherById } from '@/api/vouchers-api'
import { useParams } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { useEffect, useState } from 'react'
import { VoucherById } from '@/utils/type'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'
import { toWords } from 'number-to-words'

export default function Voucher() {
  const { voucherid } = useParams() // Extract voucherId from the URL
  console.log(voucherid)
  const [voucherData, setVoucherData] = useState<VoucherById[]>()
  const contentRef = useRef<HTMLDivElement>(null)
  const reactToPrintFn = useReactToPrint({ contentRef })

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

    // Filter out records where accountsname is 'cash in hand'
    const filteredData = response.data.filter(
      (item) => item.accountsname !== 'Cash in Hand'
    )

    // Set the filtered data to state
    setVoucherData(filteredData)

    console.log('Filtered data (without cash in hand):', filteredData)
  }

  useEffect(() => {
    getVoucherDetailsById()
    // getAllCompanyData()
  }, [voucherid])

  if (!voucherData) {
    return <p>Loading...</p>
  }

  // Calculate total amount
  const totalAmount = voucherData.reduce(
    (total, item) => total + item.totalamount,
    0
  )

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 p-4 border shadow-lg">
      {/* Header Section */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reverse
        </Button>
        <Button variant="outline" size="sm" onClick={() => reactToPrintFn()}>
          Print
        </Button>
      </div>
      <div ref={contentRef}>
        <CardHeader className="space-y-4 border-b pb-4">
          <div className="space-y-4">
            {/* Headline */}
            <div className="text-center py-4 bg-yellow-100">
              <h1 className="text-xl font-bold uppercase">
                {voucherData[0].companyname}
              </h1>
            </div>

            {/* Two Columns */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-2">
                <p>Phone: {}</p>
                <p>Email: {}</p>
                <p>State: {voucherData[0].state}</p>
                <p>Address 1: {voucherData[0].location}</p>
                <p>Address 2: {}</p>
              </div>

              {/* Right Column */}
              <div className="flex flex-col items-end space-y-2">
                <img
                  src="/logo.webp"
                  alt="Company Logo"
                  className="w-24 h-24 object-contain"
                />
                <div className="flex items-center space-x-2">
                  <Label>Date:</Label>
                  <p>{voucherData[0].date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label>Voucher No:</Label>
                  <p>{voucherData[0].voucherno}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label>Payable To:</Label>
                  <p>{}</p>
                </div>
              </div>
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
                <div>{item.accountsname}</div>
                <div>{item.journaltype}</div>
                <div>{item.totalamount.toLocaleString()}</div>
              </div>
            ))}
            {/* Total Amount Row */}
            <div className="grid grid-cols-[50px,2fr,1fr,2fr] gap-2 p-3 border-t items-center text-sm font-medium bg-gray-100">
              <div></div>
              <div></div>
              <div>Total:</div>
              <div>{totalAmount.toLocaleString()}</div>
            </div>
          </div>
          {/* Bottom Section */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            {/* Left Column */}
            <div>
              <div className="border-2 py-4 px-2 bg-[#fff2cc]">
                <h4 className="text-sm font-medium mb-2">Amount in Words:</h4>
                <p className="text-sm text-gray-700 mb-4">
                  {toWords(totalAmount)} Only
                </p>
              </div>
              <div className="border-2 py-4 px-2 bg-[#fff2cc] mt-2">
                <h4 className="text-sm font-medium mb-2">
                  Terms & Conditions:
                </h4>
                <div className="text-sm text-gray-700 mb-4">
                  {voucherData.map((item, id) => (
                    <p key={id}>{item.detail_notes}</p>
                  ))}
                </div>
              </div>
            </div>
            {/* Right Column */}
            <div className="border rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm font-medium mb-2 bg-[#bf8f00] p-2 text-white">
                <div>Total Amount:</div>
                <div className="text-right">{totalAmount.toLocaleString()}</div>
              </div>
            </div>
            <div>
              <CardFooter className="mt-4 space-y-2 bg-[#fff2cc] p-2">
                <p className="text-sm text-muted-foreground py-10">
                  Authorized Signatory
                </p>
              </CardFooter>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
