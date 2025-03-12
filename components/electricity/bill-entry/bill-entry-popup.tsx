'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Checkbox } from '@/components/ui/checkbox'

const createAssetSchema = z.object({
  asset_name: z.string().nonempty('Asset name is required'),
  category_id: z.number().min(1, 'Category is required'),
  purchase_date: z.date(),
  purchase_value: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid purchase value'),
  current_value: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid current value'),
  salvage_value: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid salvage value'),
  depreciation_method: z.string().nonempty('Depreciation method is required'),
  useful_life_years: z
    .number()
    .min(0, 'Useful life years must be non-negative'),
  status: z.string().nonempty('Status is required'),
  company_id: z.number().min(1, 'Company is required'),
  location_id: z.number().optional(),
})

interface CreateAssetData {
  meter_no: number
  category_id: number
  purchase_date: Date
  bill_date: Date
  bill_amount: number
  comments: string
  meter_type: 'prepaid' | 'postpaid'
  purchase_value: string
  description: string
  provision_account_name: string
  expense_account_name: string
  current_value: string
  salvage_value: string
  depreciation_method: string
  useful_life_years: number
  status: string
  company_id: number
}

interface MeterEntryPopUpProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCategoryAdded: () => void
}
const BillEntryPopUp: React.FC<MeterEntryPopUpProps> = ({
  isOpen,
  onOpenChange,
  onCategoryAdded,
}) => {
  const form = useForm<CreateAssetData>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      meter_no: 0,
      comments: '',
      bill_date: new Date(),
      bill_amount: 0,
    },
  })

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Meter Entry Input</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="meter_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meter No</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter asset name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bill_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bill_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Amount</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter bill amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter comments" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Adding...' : 'Add Bill Entry'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BillEntryPopUp
