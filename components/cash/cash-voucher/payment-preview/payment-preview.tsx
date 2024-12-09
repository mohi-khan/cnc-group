'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function PaymentPreview() {
  const searchParams = useSearchParams()

  const paymentData = {
    voucherNo: '001',
    companyName: 'Ward and Holman Co',
    currency: 'USD',
    location: 'Factory',
    type: 'payment',
    accountName: 'bank',
    costCenter: 'sales',
    department: 'engineering',
    partnerName: 'initech',
    remarks: 'dfsd',
    totalAmount: '21.00',
    status: 'Posted',
    date: new Date().toLocaleDateString(), // Keeping this as we need a date
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-2xl font-bold">Payment Voucher</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex justify-between">
            <div>
              <Label className="text-sm text-gray-500">Voucher No:</Label>
              <p>{paymentData.voucherNo}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Date:</Label>
              <p>{paymentData.date}</p>
            </div>
          </div>

          {/* Company Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-500">Company:</Label>
              <p>{paymentData.companyName}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Location:</Label>
              <p>{paymentData.location}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-gray-500">Amount:</Label>
              <p className="text-xl font-semibold">
                {paymentData.currency} {paymentData.totalAmount}
              </p>
            </div>

            <div>
              <Label className="text-sm text-gray-500">
                Method of Payment:
              </Label>
              <div className="flex gap-4 mt-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border rounded-sm" />
                  <span>Cash</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border rounded-sm" />
                  <span>Check</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm text-gray-500">To:</Label>
              <p>{paymentData.partnerName}</p>
            </div>

            <div>
              <Label className="text-sm text-gray-500">The Sum of:</Label>
              <p>
                {paymentData.totalAmount} {paymentData.currency}
              </p>
            </div>

            <div>
              <Label className="text-sm text-gray-500">Being:</Label>
              <p>{paymentData.remarks}</p>
            </div>

            <div>
              <Label className="text-sm text-gray-500">Account Details:</Label>
              <div className="grid grid-cols-3 gap-4 mt-1">
                <p>Account: {paymentData.accountName}</p>
                <p>Cost Center: {paymentData.costCenter}</p>
                <p>Department: {paymentData.department}</p>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="h-20 border-b mb-2" />
              <Label className="text-sm text-gray-500">Approved By</Label>
            </div>
            <div className="text-center">
              <div className="h-20 border-b mb-2" />
              <Label className="text-sm text-gray-500">Paid By</Label>
            </div>
            <div className="text-center">
              <div className="h-20 border-b mb-2" />
              <Label className="text-sm text-gray-500">Signature</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}