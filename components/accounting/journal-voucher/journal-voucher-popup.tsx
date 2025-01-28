'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { Plus } from 'lucide-react'
import { JournalVoucherMasterSection } from './journal-voucher-master-section'
import { JournalVoucherDetailsSection } from './journal-voucher-details-section'
import { JournalVoucherSubmit } from './journal-voucher-submit'
import {
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  VoucherTypes,
} from '@/utils/type'

interface JournalVoucherPopupProps {
  handleSubmit: (data: JournalEntryWithDetails) => void
  isSubmitting: boolean
}

export function JournalVoucherPopup({
  handleSubmit,
  isSubmitting,
}: JournalVoucherPopupProps) {
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: {
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
        journalType: VoucherTypes.JournalVoucher,
        state: 0,
        companyId: 0,
        locationId: 0,
        currencyId: 1,
        amountTotal: 55,
        createdBy: 60,
      },
      journalDetails: [
        {
          accountId: 0,
          debit: 0,
          credit: 0,
          createdBy: 60,
        },
      ],
    },
  })

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
    const totalDebit = form
      .watch('journalDetails')
      .reduce((sum, detail) => sum + (detail.debit || 0), 0)
    form.setValue('journalEntry.amountTotal', totalDebit)
  }, [form.watch('journalDetails'), form.setValue]) // Added form.setValue to dependencies

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Voucher
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Journal Voucher</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <JournalVoucherMasterSection form={form} />

            <JournalVoucherDetailsSection
              form={form}
              onAddEntry={addEntry}
              onRemoveEntry={removeEntry}
            />

            <JournalVoucherSubmit
              form={form}
              onSubmit={form.handleSubmit(handleSubmit)}
              isSubmitting={isSubmitting}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
