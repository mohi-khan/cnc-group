'use client'

import { useCallback, useEffect, useState } from 'react'
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
import { createAdvance, getAllEmployees } from '@/api/payment-requisition-api'
import { useToast } from '@/hooks/use-toast'
import {
  type Employee,
  requisitionAdvanceSchema,
  type RequisitionAdvanceType,
} from '@/utils/type'
import { useForm, useWatch } from 'react-hook-form'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { CustomCombobox } from '@/utils/custom-combobox'
import { useRouter } from 'next/navigation'

interface PaymentRequisitionAdvanceFormProps {
  requisition?: any
  token?: string
  onSuccess?: () => void
}

export default function PaymentRequisitionAdvanceForm({
  requisition = null,
  onSuccess = () => {},
}: PaymentRequisitionAdvanceFormProps) {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  // State variables
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])

  console.log('from requisition advance form', requisition)

  const fetchEmployees = useCallback(async () => {
    if (!token) return
    try {
      const response = await getAllEmployees(token)
      console.log('Raw API response:', response) // Log the entire response to see its structure
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        console.log('Unauthorized access')
        return
      } else if (response.error || !response.data) {
        console.error('Error fetching employees:', response.error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error?.message || 'Failed to fetch employees',
        })
        return
      } else if (response && response.data) {
        console.log('Employee data structure:', response.data[0]) // Log the first employee to see structure
        setEmployees(response.data)
        console.log('Employees data set:', response.data)
      } else {
        console.error('Invalid response format from getAllEmployees:', response)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }, [token])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const defaultValues: Partial<RequisitionAdvanceType> = {
    requisitionNo: requisition?.poNo || '',
    poId: requisition?.id || 0,
    vendorId: requisition?.vendorId || 0,
    requestedBy: 0,
    createdBy: userData?.userId,
    requestedDate: new Date(),
    advanceAmount: 0,
    currency: requisition?.currency || '',
    checkName: '',
    remarks: '',
  }

  const form = useForm<RequisitionAdvanceType>({
    resolver: zodResolver(requisitionAdvanceSchema),
    defaultValues,
  })

  const advanceAmount = useWatch({
    control: form.control,
    name: 'advanceAmount',
  })
  const maxAmount = requisition?.amount || 0

  useEffect(() => {
    if (advanceAmount > maxAmount) {
      form.setError('advanceAmount', {
        type: 'manual',
        message: `Amount can't exceed ${maxAmount}`,
      })
    } else {
      form.clearErrors('advanceAmount')
    }
  }, [advanceAmount, maxAmount, form])

  const onSubmit = async (values: RequisitionAdvanceType) => {
    if (values.advanceAmount > maxAmount) {
      form.setError('advanceAmount', {
        type: 'manual',
        message: `Amount can't exceed ${maxAmount}`,
      })
      return
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
            render={({ field }) => (
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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

          <FormField
            control={form.control}
            name="requestedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requested By</FormLabel>
                <FormControl>
                  <CustomCombobox
                    items={employees.map((e) => ({
                      id: Number(e.id),
                      name: e.employeeName,
                    }))}
                    value={
                      field.value
                        ? {
                            id: Number(field.value),
                            name:
                              employees.find(
                                (e) => Number(e.id) === Number(field.value)
                              )?.employeeName || '',
                          }
                        : null
                    }
                    onChange={(value) => {
                      console.log('Selected employee ID:', value?.id)
                      field.onChange(value?.id || '')
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
