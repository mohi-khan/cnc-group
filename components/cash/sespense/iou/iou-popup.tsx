'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { toast } from '@/hooks/use-toast'

import {
  type Employee,
  IouRecordCreateSchema,
  type IouRecordCreateType,
} from '@/utils/type'

import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { getEmployee } from '@/api/common-shared-api'
import { useRouter } from 'next/navigation'
import { createIou } from '@/api/iou-api'

interface LoanPopUpProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCategoryAdded: () => void
  employeeData: Employee[] // Type for employeeData
  fetchLoanData: () => Promise<void> // Type for the fetchLoanData function
}

export default function IouPopUp({
  isOpen,
  onOpenChange,
  onCategoryAdded,
  fetchLoanData,
  employeeData,
}: LoanPopUpProps) {
  //getting userData from jotai atom component
  useInitializeUser()

  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  // State variables
  const [isSubmitting, setIsSubmitting] = useState(false)
  // const [employeeData, setEmployeeData] = useState<Employee[]>([])
  const [userId, setUserId] = useState<number | null>(null) // set to null initially

  React.useEffect(() => {
    if (userData) {
      setUserId(userData.userId)
      console.log('Current user from localStorage:', userData)
    } else {
      console.log('No user data found in localStorage')
    }
  }, [userData])

  const form = useForm<IouRecordCreateType>({
    resolver: zodResolver(IouRecordCreateSchema),
    defaultValues: {
      amount: 0,
      adjustedAmount: 0,
      employeeId: 1,
      dateIssued: new Date(),
      dueDate: new Date(),
      status: 'active',
      notes: '',
      createdBy: userId ?? undefined, // set to undefined initially or when userId is not available
    },
  })



  useEffect(() => {
    if (userId !== null) {
      // Update the form's default values when userId is available
      form.setValue('createdBy', userId)
    }
  }, [userId, form])

  // Fetch all Employee Data
  // const fetchEmployeeData = useCallback(async () => {
  //   const employees = await getEmployee(token)
  //   if (employees.data) {
  //     setEmployeeData(employees.data)
  //   } else {
  //     setEmployeeData([])
  //   }
  //   console.log('Show The Employee Data :', employees.data)
  // }, [token])
  // useEffect(() => {
  //   fetchEmployeeData()
  // }, [fetchEmployeeData])

  const onSubmit = async (data: IouRecordCreateType) => {
    if (data.adjustedAmount >= data.amount) {
      toast({
        title: 'Validation Error',
        description:
          'Adjusted Amount must be less than the Amount and cannot be equal or higher.',
        variant: 'destructive',
      })
      return // Prevent form submission
    }

    setIsSubmitting(true)
    try {
      await createIou(data, token)
      toast({
        title: 'Success',
        description: 'IOU has been created successfully',
      })
      onCategoryAdded()
      fetchLoanData()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Failed to create IOU:', error)
      toast({
        title: 'Error',
        description: 'Failed to create IOU. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New IOU</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => form.handleSubmit(onSubmit)(e)}
            className="space-y-4"
          >
            <FormField
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      onChange={(e) =>
                        field.onChange(Number.parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adjustedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjusted Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="Enter adjusted amount"
                      onChange={(e) => {
                        const adjustedValue =
                          Number.parseFloat(e.target.value) || 0
                        field.onChange(adjustedValue)

                        // Custom validation for adjustedAmount
                        if (adjustedValue >= form.getValues('amount')) {
                          form.setError('adjustedAmount', {
                            type: 'manual',
                            message:
                              'Adjusted amount must be less than the amount.',
                          })
                        } else {
                          form.clearErrors('adjustedAmount')
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employeeData.map((employee) => (
                        <SelectItem
                          key={employee.id}
                          value={employee.id.toString()}
                        >
                          {employee.employeeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateIssued"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Issued</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      placeholder="YYYY-MM-DD"
                      value={
                        field.value ? format(field.value, 'yyyy-MM-dd') : ''
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      placeholder="YYYY-MM-DD"
                      value={
                        field.value ? format(field.value, 'yyyy-MM-dd') : ''
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
