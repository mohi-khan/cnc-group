'use client'
import { Card, CardHeader, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { getAllVoucherById } from '@/api/vouchers-api'
import { useParams } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { useEffect, useState } from 'react'
import { JournalEntryWithDetails } from '@/utils/type'
import { Button } from '@/components/ui/button'
import { Printer, RotateCcw } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'
import { CompanyType, getAllCompany } from '@/api/company-api'
import clsx from 'clsx'

export default function Voucher() {
  const { voucherid } = useParams() // Extract voucherId from the URL
  console.log(voucherid)
  const [voucherData, setVoucherData] = useState<JournalEntryWithDetails>()
  const contentRef = useRef<HTMLDivElement>(null)
  const reactToPrintFn = useReactToPrint({ contentRef })
  const [companyData, setCompanyData] = useState<CompanyType[]>()

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
    const filteredData = response.data.data.filter(
      (item) => item.accountsname !== 'cash in hand'
    )

    // Set the filtered data to state
    setVoucherData(filteredData)

    console.log('Filtered data (without cash in hand):', filteredData)
  }
  async function getAllCompanyData() {
    if (!voucherid) {
      throw new Error('Voucher ID is missing')
    }

    const response = await getAllCompany()

    if (response.error || !response.data) {
      console.error('Error getting voucher details:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get voucher details',
      })
      return
    }

    const filterCompanyId = response.data.filter(
      (item) => item.companyId === 75
    )
    setCompanyData(filterCompanyId)
    console.log('get all company data:', filterCompanyId)
  }

  useEffect(() => {
    getVoucherDetailsById()
    getAllCompanyData()
  }, [voucherid])

  if (!voucherData) {
    return <p>Loading...</p>
  }

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
        {/* <CardHeader className="grid grid-cols-2 gap-4 border-b pb-4">
          {companyData?.map((Item) => (
            <div key={Item.companyId} className="space-y-2">
              <div className="text-center py-4 bg-yellow-100">
                <h1 className="text-xl font-bold uppercase">
                  {Item.companyName}
                </h1>
              </div>
              <p>Phone: {Item.phone}</p>
              <p>Email: {Item.email}</p>
              <p>State: {Item.state}</p>
              <p>Address 1: {Item.address}</p>
              <p>Address 2: {Item.city}</p>

              <img
                src="/logo.webp"
                alt="Company Logo"
                className="w-24 h-24 object-contain"
              />

              <Label>Date</Label>
              <p>{voucherData.date}</p>
              <Label>Voucher No</Label>
              <p>{voucherData.voucherno}</p>
              <Label>Payable To</Label>
              <p>{voucherData.payableTo}</p>
            </div>
          ))}
        </CardHeader> */}
        <CardHeader className="space-y-4 border-b pb-4">
          {companyData?.map((Item) => (
            <div key={Item.companyId} className="space-y-4">
              {/* Headline */}
              <div className="text-center py-4 bg-yellow-100">
                <h1 className="text-xl font-bold uppercase">
                  {Item.companyName}
                </h1>
              </div>

              {/* Two Columns */}
              <div className="grid grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-2">
                  <p>Phone: {Item.phone}</p>
                  <p>Email: {Item.email}</p>
                  <p>State: {Item.state}</p>
                  <p>Address 1: {Item.address}</p>
                  <p>Address 2: {Item.city}</p>
                </div>

                {/* Right Column */}
                <div className="flex flex-col items-end space-y-2">
                  <img
                    src="/logo.webp"
                    alt="Company Logo"
                    className="w-24 h-24 object-contain"
                  />
                  <div>
                    <Label>Date</Label>
                    <p>{Item.date}</p>
                  </div>
                  <div>
                    <Label>Voucher No</Label>
                    <p>{voucherData.voucherno}</p>
                  </div>
                  <div>
                    <Label>Payable To</Label>
                    <p>{voucherData.payableTo}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
                <h4 className="text-sm font-medium mb-2">
                  Terms & Conditions:
                </h4>

                <p className="text-sm text-gray-700 mb-4">
                  {voucherData.map((item, id) => (
                    <div key={id}>
                      <p>{item.notes}</p>
                    </div>
                  ))}
                </p>
              </div>
            </div>
            {/* Right Column */}
            <div className="border rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm font-medium mb-2 bg-[#bf8f00] p-2 text-white">
                <div>Total Amount:</div>
                <div className="text-right">
                  {voucherData
                    .reduce((total, item) => total + item.totalamount, 0)
                    .toLocaleString()}
                </div>
              </div>
            </div>
            <div>
              <CardFooter className=" mt-4 space-y-2 bg-[#fff2cc] p-2">
                <p className="text-sm text-muted-foreground py-10">
                  Authorized Signatory
                </p>
              </CardFooter>
            </div>
          </div>
        </div>
      </div>
      {/* Footer Section */}
    </Card>
  )
}
