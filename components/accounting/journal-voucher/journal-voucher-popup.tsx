'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from '@/components/ui/form'
import { JournalVoucherMasterSection } from './journal-voucher-master-section'
import { JournalVoucherDetailsSection } from './journal-voucher-details-section'
import { JournalVoucherSubmit } from './journal-voucher-submit'
import {
  JournalEditWithDetails,
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  VoucherTypes,
} from '@/utils/type'
import { Popup } from '@/utils/popup'

// Updated interface to include initialData prop
interface JournalVoucherPopupProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  handleSubmit: (data: JournalEntryWithDetails | JournalEditWithDetails, resetForm: () => void) => void
  isSubmitting: boolean
  initialData?: JournalEntryWithDetails | JournalEditWithDetails// Added optional initialData prop
}

export function JournalVoucherPopup({
  isOpen,
  onOpenChange,
  handleSubmit,
  isSubmitting,
  initialData, // Added initialData to destructuring
}: JournalVoucherPopupProps) {
  // Updated defaultValues to use initialData if provided
  const defaultValues = useMemo(
    () =>
      initialData || {
        journalEntry: {
          date: new Date().toISOString().split('T')[0],
          journalType: VoucherTypes.JournalVoucher,
          state: 0,
          companyId: 0,
          locationId: 0,
          currencyId: 1,
          exchangeRate: 1,
          amountTotal: 0,
          createdBy: 0,
        },
        journalDetails: [
          {
            accountId: 0,
            debit: 0,
            credit: 0,
            createdBy: 0,
          },
        ],
      },
    [initialData]
  )

  const form = useForm<JournalEntryWithDetails | JournalEditWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues,
  })

  const resetForm = useCallback(() => {
    form.reset(defaultValues)
  }, [form, defaultValues])

  // Reset form when popup opens/closes or when initialData changes
  useEffect(() => {
    if (isOpen) {
      // Reset with current defaultValues when opening
      form.reset(defaultValues)
    } else {
      // Reset to original defaultValues when closing
      resetForm()
    }
  }, [isOpen, defaultValues, form, resetForm])

  const addEntry = () => {
    const currentEntries = form.getValues('journalDetails')
    form.setValue('journalDetails', [
      ...currentEntries,
      {
        accountId: 0,
        debit: 0,
        credit: 0,
        createdBy: 0,
      },
    ])
  }

  const removeEntry = (index: number) => {
    const currentEntries = form.getValues('journalDetails')
    if (currentEntries.length > 1) {
      form.setValue(
        'journalDetails',
        currentEntries.filter((_, i) => i !== index)
      )
    }
  }

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.startsWith('journalDetails')) {
        const totalDebit =
          value.journalDetails?.reduce(
            (sum, detail) => sum + (detail?.debit || 0),
            0
          ) || 0
        const totalCredit =
          value.journalDetails?.reduce(
            (sum, detail) => sum + (detail?.credit || 0),
            0
          ) || 0
        const amountTotal = Math.max(totalDebit, totalCredit)
        form.setValue('journalEntry.amountTotal', amountTotal)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const onSubmit = (data: JournalEntryWithDetails | JournalEditWithDetails) => {
    handleSubmit(data, resetForm)
  }

  return (
    <>
      {/* Only show the ADD button if no initialData is provided (normal mode) */}
      {!initialData && (
        <Button onClick={() => onOpenChange(true)}>
          <Plus className="mr-2 h-4 w-4" /> ADD
        </Button>
      )}
      <Popup
        isOpen={isOpen}
        onClose={() => onOpenChange(false)}
        title="Journal Voucher"
        size="max-w-6xl"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <JournalVoucherMasterSection form={form} />
            <JournalVoucherDetailsSection
              form={form}
              onAddEntry={addEntry}
              onRemoveEntry={removeEntry}
            />
            <JournalVoucherSubmit
              form={form}
              onSubmit={form.handleSubmit(onSubmit)}
              isSubmitting={isSubmitting}
            />
          </form>
        </Form>
      </Popup>
    </>
  )
}
