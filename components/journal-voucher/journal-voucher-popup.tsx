'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Plus } from 'lucide-react'
import { JournalVoucherMasterSection } from './journal-voucher-master-section'
import { JournalVoucherDetailsSection } from './journal-voucher-details-section'
import { JournalVoucherSubmit } from './journal-voucher-submit'
import {
  JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
} from '@/utils/type'

export function JournalVoucherPopup() {
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: {
      journalEntry: {
        date: '',
        journalType: '',
        state: 0,
        companyId: 0,
        locationId: 0,
        currencyId: 0,
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
  })

  const handleSubmit = (data: JournalEntryWithDetails) => {
    console.log('Submitting voucher:', data)
    setIsOpen(false)
    form.reset()
  }

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Voucher
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl overflow-y-auto">
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
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
