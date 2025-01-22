'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { toast } from '@/hooks/use-toast'
import {
  IouAdjustmentCreateSchema,
  IouAdjustmentCreateType,
} from '@/utils/type'
import { createAdjustment } from '@/api/iou-api'

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

  const form = useForm<IouAdjustmentCreateType>({
    resolver: zodResolver(IouAdjustmentCreateSchema),
    defaultValues: {
      iouId: iouId, // Ensure iouId is initialized correctly
      amountAdjusted: 0,
      adjustmentDate: new Date(),
      adjustmentType: 'Refund',
      notes: '',
    },
  })

  // Persist iouId manually in case it changes in the parent component
  React.useEffect(() => {
    form.setValue('iouId', iouId) // Update the form value directly
  }, [iouId, form])

  const onSubmit = async (data: IouAdjustmentCreateType) => {
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
                      placeholder="Enter adjusted amount"
                      onChange={(e) =>
                        field.onChange(Number.parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Adjustment Type Field */}
            <FormField
              name="adjustmentType"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Type</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter adjustment type (e.g., Refund)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Adjustment Date Field */}
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

            {/* Notes Field */}
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
