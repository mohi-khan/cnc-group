

'use client'

import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { toast } from '@/hooks/use-toast'
import {
  IouAdjustmentCreateSchema,
  type IouAdjustmentCreateType,
  type IouRecordGetType,
} from '@/utils/type'
import { createAdjustment, getLoanData } from '@/api/iou-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { CustomCombobox } from '@/utils/custom-combobox'

const adjtype = ['Return', 'Adjustment']

interface IouAdjPopUpProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  iouId: number
  fetchLoanData: () => Promise<void> // Type for the fetchLoanData function
}

const IouAdjPopUp: React.FC<IouAdjPopUpProps> = ({
  isOpen,
  onOpenChange,
  iouId,
  fetchLoanData,
 
}) => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loanData, setLoanData] = useState<IouRecordGetType[]>([])
  const [currentLoanAmount, setCurrentLoanAmount] = useState(0)
  const [adjustmentError, setAdjustmentError] = useState('') // for validation message

  const fetchLoanDatas = useCallback(async () => {
    try {
      const loansdata = await getLoanData(token)
      if (loansdata.data) {
        setLoanData(loansdata.data)
       
        const currentLoan = loansdata.data.find((loan) => loan.iouId === iouId)
        if (currentLoan) {
          setCurrentLoanAmount(currentLoan.amount - currentLoan.adjustedAmount)
        }
      } else {
        setLoanData([])
        
      }

    } catch (error) {
      console.error('Failed to fetch Loan Data :', error)
    }
  }, [iouId, token])

  useEffect(() => {
    fetchLoanDatas()
  }, [iouId, fetchLoanDatas])

  const form = useForm<IouAdjustmentCreateType>({
    resolver: zodResolver(IouAdjustmentCreateSchema),
    defaultValues: {
      iouId: iouId,
      amountAdjusted: 0,
      adjustmentDate: new Date(),
      adjustmentType: 'refund',
      notes: '',
    },
  })

  useEffect(() => {
    if (currentLoanAmount > 0) {
      form.setValue('amountAdjusted', currentLoanAmount)
    }
  }, [currentLoanAmount, form])

  const onSubmit = async (data: IouAdjustmentCreateType) => {
    if (data.amountAdjusted > currentLoanAmount) {
      toast({
        title: 'Invalid Amount',
        description:
          'Adjustment amount cannot exceed the remaining loan amount.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createAdjustment(data, token)
      toast({
        title: 'Success',
        description: 'Adjustment record has been created successfully.',
      })
      onOpenChange(false)
     fetchLoanData()
      form.reset()
      setAdjustmentError('')
    } catch (error) {
      console.error('Failed to create adjustment record:', error)
      toast({
        title: 'Error',
        description: 'Failed to create adjustment record. Please try again.',
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
          <DialogTitle>Add Adjustment Record</DialogTitle>
          <DialogDescription></DialogDescription>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Remaining amount before adjustment: {currentLoanAmount}
          </p>
          {form.watch('amountAdjusted') > 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Remaining amount after adjustment:{' '}
              {currentLoanAmount - (form.watch('amountAdjusted') || 0)}
            </p>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Adjusted Amount Field */}
            <FormField
              name="amountAdjusted"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjusted Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder={`Enter adjusted amount (max: ${currentLoanAmount})`}
                      onChange={(e) => {
                        const value = e.target.value
                        const parsed =
                          value === '' ? '' : Number.parseFloat(value)

                        field.onChange(parsed)

                        if (parsed !== '' && parsed > currentLoanAmount) {
                          setAdjustmentError(
                            'Amount cannot exceed remaining loan amount.'
                          )
                        } else {
                          setAdjustmentError('')
                        }

                        if (parsed !== '' && parsed <= currentLoanAmount) {
                          setLoanData((prevData) =>
                            prevData.map((loan) =>
                              loan.iouId === iouId
                                ? { ...loan, amount: loan.amount - parsed }
                                : loan
                            )
                          )
                        }
                      }}
                    />
                  </FormControl>
                  {adjustmentError && (
                    <p className="text-red-500 text-sm mt-1">
                      {adjustmentError}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Adjustment Type */}
            <FormField
              name="adjustmentType"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Type</FormLabel>
                  <FormControl>
                    <CustomCombobox
                      items={adjtype.map((type) => ({
                        id: type.toLowerCase(),
                        name: type,
                      }))}
                      value={
                        field.value
                          ? {
                              id: field.value,
                              name:
                                adjtype.find(
                                  (type) => type.toLowerCase() === field.value
                                ) || 'Select Adjustment type',
                            }
                          : null
                      }
                      onChange={(value) =>
                        field.onChange(value ? value.id : null)
                      }
                      placeholder="Select Adjustment type"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Adjustment Date */}
            <FormField
              name="adjustmentDate"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      value={
                        field.value ? format(field.value, 'yyyy-MM-dd') : ''
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              name="notes"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter notes for adjustment"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
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

export default IouAdjPopUp
