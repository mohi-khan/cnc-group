'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DetailRow {
  id: number
  accountHead: string
  particulars: string
  costCenter: string
  amount: string
}

interface Voucher {
  voucherNo: string
  paymentReceipt: string
  payee: string
  payeePhRefNo: string
  totalAmount: string
  status: string
}

interface FormData {
  date: string
  location: string
  paymentReceipt: string
  refNo: string
  payee: string
  payeePh: string
  remarks: string
}

export default function CashVoucher() {
  const [detailRows, setDetailRows] = useState<DetailRow[]>([
    { id: 1, accountHead: '', particulars: '', costCenter: '', amount: '' },
  ])
  const [voucherList, setVoucherList] = useState<Voucher[]>([])
  const [formData, setFormData] = useState<FormData>({
    date: '',
    location: '',
    paymentReceipt: '',
    refNo: '',
    payee: '',
    payeePh: '',
    remarks: '',
  })

  const addDetailRow = () => {
    const newRow: DetailRow = {
      id: detailRows.length + 1,
      accountHead: '',
      particulars: '',
      costCenter: '',
      amount: '',
    }
    setDetailRows([...detailRows, newRow])
  }

  const handleDetailChange = (
    id: number,
    field: keyof DetailRow,
    value: string
  ) => {
    setDetailRows(
      detailRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    )
  }

  const deleteDetailRow = (id: number) => {
    setDetailRows(detailRows.filter((row) => row.id !== id))
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = (isDraft: boolean) => {
    const totalAmount = detailRows.reduce(
      (sum, row) => sum + Number(row.amount || 0),
      0
    )
    const newVoucher: Voucher = {
      voucherNo: `00${voucherList.length + 1}`,
      paymentReceipt: formData.paymentReceipt,
      payee: formData.payee,
      payeePhRefNo: formData.payeePh,
      totalAmount: totalAmount.toFixed(2),
      status: isDraft ? 'Draft' : 'Posted',
    }
    setVoucherList([...voucherList, newVoucher])

    // Reset form and detail rows
    setFormData({
      date: '',
      location: '',
      paymentReceipt: '',
      refNo: '',
      payee: '',
      payeePh: '',
      remarks: '',
    })
    setDetailRows([
      { id: 1, accountHead: '', particulars: '', costCenter: '', amount: '' },
    ])
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <div className="w-full my-10 p-6">
        <h1 className="text-xl font-semibold mb-6">Screen for Cash Voucher</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date:</Label>
            <Input
              type="date"
              id="date"
              placeholder="mm/dd/yyyy"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location:</Label>
            <Input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Payment/Receipt:</Label>
            <Select
              value={formData.paymentReceipt}
              onValueChange={(value) =>
                handleInputChange('paymentReceipt', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Payment/Receipt" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ref">Ref. No:</Label>
            <Input
              type="text"
              id="ref"
              value={formData.refNo}
              onChange={(e) => handleInputChange('refNo', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payee">Payee:</Label>
            <Input
              type="text"
              id="payee"
              value={formData.payee}
              onChange={(e) => handleInputChange('payee', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payee-ph">Payee Ph:</Label>
            <Input
              type="tel"
              id="payee-ph"
              value={formData.payeePh}
              onChange={(e) => handleInputChange('payeePh', e.target.value)}
            />
          </div>
        </div>

        {/* Detail Section */}
        <div className="mb-6">
          <Table className="border">
            <TableHeader className="border">
              <TableRow>
                <TableHead>Account Head</TableHead>
                <TableHead>Particulars</TableHead>
                <TableHead>Cost Center Internal Order</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detailRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Input
                      type="text"
                      value={row.accountHead}
                      onChange={(e) =>
                        handleDetailChange(
                          row.id,
                          'accountHead',
                          e.target.value
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={row.particulars}
                      onChange={(e) =>
                        handleDetailChange(
                          row.id,
                          'particulars',
                          e.target.value
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={row.costCenter}
                      onChange={(e) =>
                        handleDetailChange(row.id, 'costCenter', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.amount}
                      onChange={(e) =>
                        handleDetailChange(row.id, 'amount', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() => deleteDetailRow(row.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="text-right">
            <Button onClick={addDetailRow} className="mt-4">
              Add Another
            </Button>
          </div>
        </div>

        {/* Total and Remarks */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <Label htmlFor="total">Total Amount:</Label>
            <Input
              type="number"
              id="total"
              readOnly
              value={detailRows.reduce(
                (sum, row) => sum + Number(row.amount || 0),
                0
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks:</Label>
            <Input
              type="text"
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
            />
          </div>
        </div>

        {/* List Section */}
        <div className="mb-6">
          <Table className="border">
            <TableHeader className="border">
              <TableRow>
                <TableHead>Voucher No</TableHead>
                <TableHead>Payment/Receipt</TableHead>
                <TableHead>Payee</TableHead>
                <TableHead>Payee Ph. Ref. No</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Draft/Post</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {voucherList.map((voucher, index) => (
                <TableRow key={index}>
                  <TableCell>{voucher.voucherNo}</TableCell>
                  <TableCell>{voucher.paymentReceipt}</TableCell>
                  <TableCell>{voucher.payee}</TableCell>
                  <TableCell>{voucher.payeePhRefNo}</TableCell>
                  <TableCell>{voucher.totalAmount}</TableCell>
                  <TableCell>{voucher.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Cash Balance */}
        <div className="flex justify-between items-center mb-6">
          <div className="font-medium">Cash Balance:</div>
          <div className="font-medium">TK. 125000</div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => handleSubmit(true)}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSubmit(false)}>Post</Button>
        </div>
      </div>
    </div>
  )
}
