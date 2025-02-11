'use client'

import type React from 'react'
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
  type PurchaseEntryType,
  PurchaseOrderStatus,
  purchaseEntrySchema,
} from '@/utils/type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { Popup } from '@/utils/popup'

interface PaymentRequisitionPopupProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PurchaseEntryType) => void
}

const PaymentRequisitionPopup: React.FC<PaymentRequisitionPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PurchaseEntryType>({
    resolver: zodResolver(purchaseEntrySchema),
    defaultValues: {
      purchaseMaster: {
        poNo: '',
        poDate: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        status: PurchaseOrderStatus.PurchaseOrder,
        companyId: 0,
        vendorCode: '',
        createdBy: 0,
      },
      purchaseDetails: [{ itemCode: '', quantity: 0, rate: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'purchaseDetails',
  })

  const onSubmitForm = (data: PurchaseEntryType) => {
    onSubmit(data)
    onClose()
  }

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title="Create Payment Requisition"
      size="max-w-6xl"
    >
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="poNo">PO Number</Label>
          <Input id="poNo" {...register('purchaseMaster.poNo')} />
          {errors.purchaseMaster?.poNo && (
            <p className="text-red-500 text-sm">
              {errors.purchaseMaster.poNo.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="poDate">PO Date</Label>
          <Input
            id="poDate"
            type="date"
            {...register('purchaseMaster.poDate')}
          />
          {errors.purchaseMaster?.poDate && (
            <p className="text-red-500 text-sm">
              {errors.purchaseMaster.poDate.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalAmount">Total Amount</Label>
          <Input
            id="totalAmount"
            type="number"
            {...register('purchaseMaster.totalAmount', { valueAsNumber: true })}
          />
          {errors.purchaseMaster?.totalAmount && (
            <p className="text-red-500 text-sm">
              {errors.purchaseMaster.totalAmount.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            onValueChange={(value) =>
              register('purchaseMaster.status').onChange({ target: { value } })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PurchaseOrderStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.purchaseMaster?.status && (
            <p className="text-red-500 text-sm">
              {errors.purchaseMaster.status.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyId">Company ID</Label>
          <Input
            id="companyId"
            type="number"
            {...register('purchaseMaster.companyId', { valueAsNumber: true })}
          />
          {errors.purchaseMaster?.companyId && (
            <p className="text-red-500 text-sm">
              {errors.purchaseMaster.companyId.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="vendorCode">Vendor Code</Label>
          <Input id="vendorCode" {...register('purchaseMaster.vendorCode')} />
          {errors.purchaseMaster?.vendorCode && (
            <p className="text-red-500 text-sm">
              {errors.purchaseMaster.vendorCode.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Purchase Details</Label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex space-x-2">
              <Input
                {...register(`purchaseDetails.${index}.itemCode`)}
                placeholder="Item Code"
              />
              <Input
                {...register(`purchaseDetails.${index}.quantity`, {
                  valueAsNumber: true,
                })}
                placeholder="Quantity"
                type="number"
              />
              <Input
                {...register(`purchaseDetails.${index}.rate`, {
                  valueAsNumber: true,
                })}
                placeholder="Rate"
                type="number"
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => append({ itemCode: '', quantity: 0, rate: 0 })}
          >
            Add Item
          </Button>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Popup>
  )
}

export default PaymentRequisitionPopup
