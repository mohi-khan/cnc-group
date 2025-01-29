'use client'
import React, { useState } from 'react'
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

interface ChildComponentProps {
  fetchAllVoucher: (company: number[], location: number[]) => void
}

export const ContraVoucherPopup: React.FC<ChildComponentProps> = ({
  fetchAllVoucher,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)

  React.useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUserId(userData.userId)
      console.log(
        'Current userId from localStorage in everywhere:',
        userData.userId
      )
    } else {
      console.log('No user data found in localStorage')
    }
  }, [])

  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: {
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
        journalType: VoucherTypes.ContraVoucher,
        state: 0,
        companyId: 0,
        locationId: 0,
        currencyId: 0,
        amountTotal: 0,
        createdBy: undefined, // Initialize as undefined
      },
      journalDetails: [
        {
          accountId: 0,
          debit: 0,
          credit: 0,
          createdBy: undefined, // Initialize as undefined
        },
      ],
    },
  })

  // Update form fields when `userId` changes
  React.useEffect(() => {
    if (userId !== null) {
      form.setValue('journalEntry.createdBy', userId)
      form.setValue(
        'journalDetails',
        form.getValues('journalDetails').map((detail) => ({
          ...detail,
          createdBy: userId,
        }))
      )
    }
  }, [userId, form])

  const handleSubmit = async (data: JournalEntryWithDetails) => {
    setIsSubmitting(true)
    console.log('Submitting voucher:', data)

    // Calculate total amount from details
    const amountTotal = data.journalDetails.reduce(
      (sum, detail) => sum + Number(detail.debit),
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

    await createJournalEntryWithDetails(submissionData)
      .then((response) => {
        if (response.error || !response.data) {
          console.error('Error creating voucher:', response.error)
          toast({
            title: 'Error',
            description: response.error?.message || 'Failed to create voucher',
            variant: 'destructive',
          })
          return
        }

        toast({
          title: 'Success',
          description: 'Voucher created successfully',
        })

        form.reset()
      })
      .catch((error) => {
        console.error('Error creating voucher:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to create voucher',
          variant: 'destructive',
        })
      })
      .finally(() => {
        setIsSubmitting(false)
        fetchAllVoucher(
          [data.journalEntry.companyId],
          [data.journalEntry.locationId]
        )
        setIsOpen(false)
      })
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
          <Plus className="mr-2 h-4 w-4" /> ADD
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
