'use client'

import { useState, useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { Popup } from '@/utils/popup'
import { useToast } from '@/hooks/use-toast'
import {
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  VoucherTypes,
} from '@/utils/type'
import { JournalVoucherMasterSection } from '@/components/accounting/journal-voucher/journal-voucher-master-section'
import { JournalVoucherDetailsSection } from '@/components/accounting/journal-voucher/journal-voucher-details-section'
import { JournalVoucherSubmit } from '@/components/accounting/journal-voucher/journal-voucher-submit'

interface PaymentRequisitionPopupProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  requisition: any // Replace with proper type
  token: string
  onSuccess: () => void
  status: string
}

export function PaymentRequisitionPopup({
  isOpen,
  onOpenChange,
  requisition,
  token,
  onSuccess,
  status,
}: PaymentRequisitionPopupProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Default values for the payment form
  const defaultValues = useRef({
    journalEntry: {
      date: new Date().toISOString().split('T')[0],
      journalType: VoucherTypes.BankVoucher,
      state: 0,
      companyId: requisition?.companyId || 0,
      locationId: requisition?.locationId || 0,
      currencyId: 1,
      amountTotal: requisition?.amount || 0,
      createdBy: 0,
      notes: `Payment for PO: ${requisition?.poNo || ''}, Vendor: ${requisition?.vendorName || ''}`,
      poId: requisition?.id || null,
    },
    journalDetails: [
      {
        accountId: 0, // Account payable
        debit: requisition?.amount || 0,
        credit: 0,
        createdBy: 0,
        notes: `Payment for PO: ${requisition?.poNo || ''}`,
      },
      {
        accountId: 0, // Bank or cash account
        debit: 0,
        credit: requisition?.amount || 0,
        createdBy: 0,
        notes: `Payment for PO: ${requisition?.poNo || ''}`,
      },
    ],
  }).current

  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues,
  })

  // Reset form when requisition changes or popup opens/closes
  useEffect(() => {
    if (isOpen && requisition) {
      form.reset({
        ...defaultValues,
        journalEntry: {
          ...defaultValues.journalEntry,
          companyId: requisition.companyId || 0,
          locationId: requisition.locationId || 0,
          amountTotal: requisition.amount || 0,
          notes: `Payment for PO: ${requisition.poNo || ''}, Vendor: ${requisition.vendorName || ''}`,
          poId: requisition.id || null,
        },
        journalDetails: [
          {
            accountId: 0, // Account payable
            debit: requisition.amount || 0,
            credit: 0,
            createdBy: 0,
            notes: `Payment for PO: ${requisition.poNo || ''}`,
          },
          {
            accountId: 0, // Bank or cash account
            debit: 0,
            credit: requisition.amount || 0,
            createdBy: 0,
            notes: `Payment for PO: ${requisition.poNo || ''}`,
          },
        ],
      })
    } else if (!isOpen) {
      form.reset(defaultValues)
    }
  }, [isOpen, requisition, form, defaultValues])

  const handleSubmit = async (data: JournalEntryWithDetails) => {
    setIsSubmitting(true)
    try {
      // Here you would call your API to create the payment
      // Example: await createPayment(data, token)
      console.log('Submitting payment data:', data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: 'Payment created',
        description: `Payment for PO ${requisition?.poNo} has been created successfully.`,
      })

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error creating payment:', error)
      toast({
        title: 'Payment creation failed',
        description:
          'There was an error creating the payment. Please try again.',
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
    if (currentEntries.length > 2) {
      form.setValue(
        'journalDetails',
        currentEntries.filter((_, i) => i !== index)
      )
    }
  }

  // Render different forms based on status
  const renderFormContent = () => {
    switch (status) {
      case 'Invoice Approved':
        return (
          <>
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
          </>
        )
      case 'GRN Completed':
        return <div>Create Invoice Form</div>
      case 'Purchase Order':
        return <div>Create Advance Form</div>
      default:
        return <div>No form available for this status</div>
    }
  }

  const getPopupTitle = () => {
    switch (status) {
      case 'Invoice Approved':
        return 'Create Payment'
      case 'GRN Completed':
        return 'Create Invoice'
      case 'Purchase Order':
        return 'Create Advance'
      default:
        return 'Payment Requisition'
    }
  }

  return (
    <Popup
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      title={getPopupTitle()}
      size="max-w-6xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {renderFormContent()}
        </form>
      </Form>
    </Popup>
  )
}
