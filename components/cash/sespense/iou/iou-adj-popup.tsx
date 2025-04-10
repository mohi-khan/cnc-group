'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface IouAdjPopUpProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  iouId: number
}

const IouAdjPopUp: React.FC<IouAdjPopUpProps> = ({
  isOpen,
  onOpenChange,
  iouId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loanData, setLoanData] = useState<IouRecordGetType[]>([])
  const [currentLoanAmount, setCurrentLoanAmount] = useState(0)

  const fetchLoanData = async () => {
    try {
      const loansdata = await getLoanData()
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
  }

  useEffect(() => {
    fetchLoanData()
  }, [iouId])

  const form = useForm<IouAdjustmentCreateType>({
    resolver: zodResolver(IouAdjustmentCreateSchema),
    defaultValues: {
      iouId: iouId,
      amountAdjusted: 0, // We'll update this with setValue after data loads
      adjustmentDate: new Date(),
      adjustmentType: 'Refund',
      notes: '',
    },
  })

  useEffect(() => {
    fetchLoanData()
    // Update form value when currentLoanAmount changes
    if (currentLoanAmount > 0) {
      form.setValue('amountAdjusted', currentLoanAmount)
    }
  }, [iouId, currentLoanAmount, form])

  const validateAdjustmentAmount = (amount: number) => {
    if (amount > currentLoanAmount) {
      toast({
        title: 'Invalid Amount',
        description: 'Adjustment amount cannot be higher than the loan amount.',
        variant: 'destructive',
      })
      return false
    }
    return true
  }

  const onSubmit = async (data: IouAdjustmentCreateType) => {
    if (!validateAdjustmentAmount(data.amountAdjusted)) {
      return
    }

    setIsSubmitting(true)
    try {
      await createAdjustment(data)
      toast({
        title: 'Success',
        description: 'Adjustment record has been created successfully.',
      })

      onOpenChange(false)
      form.reset()
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
              {currentLoanAmount - form.watch('amountAdjusted')}
            </p>
          )}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        const adjustedAmount =
                          Number.parseFloat(e.target.value) || 0
                        if (adjustedAmount <= currentLoanAmount) {
                          field.onChange(adjustedAmount)
                          setLoanData((prevData) =>
                            prevData.map((loan) =>
                              loan.iouId === iouId
                                ? {
                                    ...loan,
                                    amount: loan.amount - adjustedAmount,
                                  }
                                : loan
                            )
                          )
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="adjustmentType"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select adjustment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Refund">Refund</SelectItem>
                        <SelectItem value="Adjustment">Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      value={format(field.value, 'yyyy-MM-dd')}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
