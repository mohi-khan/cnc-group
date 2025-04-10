'use client'

import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createAdvance } from '@/api/payment-requisition-api'
import { useToast } from '@/hooks/use-toast'
import {
  requisitionAdvanceSchema,
  type RequisitionAdvanceType,
} from '@/utils/type'
import { useForm } from 'react-hook-form'

interface PaymentRequisitionAdvanceFormProps {
  requisition?: any
  token?: string
  onSuccess?: () => void
}

export default function PaymentRequisitionAdvanceForm({
  requisition = null,
  token = '',
  onSuccess = () => {},
}: PaymentRequisitionAdvanceFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('currentUser')
      console.log('🚀 ~ getCurrentUser ~ userStr:', userStr)
      if (userStr) {
        return JSON.parse(userStr)
      }
      return { userId: 60 } // Default user ID if not found
    } catch (error) {
      console.error('Error getting current user:', error)
      return { userId: 60 }
    }
  }

  const currentUser = getCurrentUser()

  // Set default values based on requisition data
  const defaultValues: Partial<RequisitionAdvanceType> = {
    requisitionNo: requisition?.poNo || '',
    poId: requisition?.id || 0,
    vendorId: requisition?.vendorId || 0,
    requestedBy: currentUser.employeeId,
    createdBy: currentUser.userId,
    requestedDate: new Date(),
    advanceAmount: 0,
    currency: 'USD',
    checkName: '',
    remarks: '',
  }

  const form = useForm<RequisitionAdvanceType>({
    resolver: zodResolver(requisitionAdvanceSchema),
    defaultValues,
  })

  // For debugging - log form state
  console.log('Form state:', form.formState)
  console.log('Form errors:', form.formState.errors)

  const onSubmit = async (values: RequisitionAdvanceType) => {
    console.log('Form submitted with values:', values)

    // Check if advance amount exceeds the maximum
    const maxAmount = requisition?.amount || 0
    if (values.advanceAmount > maxAmount) {
      form.setError('advanceAmount', {
        type: 'manual',
        message: `Amount can't exceed ${maxAmount}`,
      })
      return // Prevent submission
    }

    setIsSubmitting(true)
    try {
      const response = await createAdvance(values, token)

      if (response.error) {
        toast({
          title: 'Error',
          description:
            response.error.message || 'Failed to create advance payment',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Advance payment request created successfully',
        })
        onSuccess()
      }
    } catch (error) {
      console.error('Error submitting advance form:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Required Fields */}
          <FormField
            control={form.control}
            name="requisitionNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requisition No</FormLabel>
                <FormControl>
                  <Input {...field} readOnly={!!requisition} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="poId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PO ID</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number.parseInt(e.target.value) || 0)
                    }
                    value={field.value || ''}
                    readOnly={!!requisition}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vendorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={requisition?.vendorName || ''}
                    readOnly={!!requisition}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="advanceAmount"
            render={({ field }) => {
              const maxAmount = requisition?.amount || 0
              const isInvalid = field.value > maxAmount

              // Register the validation error with React Hook Form
              React.useEffect(() => {
                if (isInvalid) {
                  form.setError('advanceAmount', {
                    type: 'manual',
                    message: `Amount can't exceed ${maxAmount}`,
                  })
                } else {
                  form.clearErrors('advanceAmount')
                }
              }, [field.value, isInvalid, maxAmount, form])

              return (
                <FormItem>
                  <FormLabel>Advance Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => {
                        const amount = Number.parseFloat(e.target.value) || 0
                        field.onChange(amount)
                      }}
                      value={field.value || ''}
                    />
                  </FormControl>
                  {isInvalid && (
                    <p className="text-red-500 text-sm">
                      Amount can&apos;t exceed {maxAmount}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="BDT">BDT</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requestedDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requested Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value)
                        : null
                      field.onChange(date)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter any additional notes or remarks"
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
