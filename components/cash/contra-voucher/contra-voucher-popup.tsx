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

import {
  JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  VoucherTypes,
} from '@/utils/type'
import { createJournalEntryWithDetails } from '@/api/journal-voucher-api'
import { toast } from '@/hooks/use-toast'
import { ContraVoucherMasterSection } from './contra-voucher-master-section'
import { ContraVoucherDetailsSection } from './contra-voucher-details-section'
import { ContraVoucherSubmit } from './contra-voucher-submit'

export function ContraVoucherPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        amountTotal: 0,
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

  const handleSubmit = async (data: JournalEntryWithDetails) => {
    try {
      setIsSubmitting(true)
      console.log('Submitting voucher:', data)

      // Calculate total amount from details
      const amountTotal = data.journalDetails.reduce(
        (sum, detail) => sum + (Number(detail.debit) - Number(detail.credit)),
        0
      )

      // Update the total amount before submission
      const submissionData = {
        ...data,
        journalEntry: {
          ...data.journalEntry,
          amountTotal,
        },
      }

      const response = await createJournalEntryWithDetails(submissionData)

      if (response.error || !response.data) {
        throw new Error(response.error?.message || 'Failed to create voucher')
      }

      toast({
        title: 'Success',
        description: 'Voucher created successfully',
      })

      setIsOpen(false)
      form.reset()
    } catch (error) {
      console.error('Error creating voucher:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create voucher',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
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
      <DialogContent className="max-w-6xl max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contra Voucher</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <ContraVoucherMasterSection form={form} />

            <ContraVoucherDetailsSection
              form={form}
              onAddEntry={addEntry}
              onRemoveEntry={removeEntry}
            />

            <ContraVoucherSubmit
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
