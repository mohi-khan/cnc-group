'use client'

import { X, Plus } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
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
import { editJournalEntryWithDetails } from '@/api/vouchers-api'
import { useAtom } from 'jotai'
import { tokenAtom } from '@/utils/user'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface JournalVoucherPopupProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  handleSubmit: (
    data: JournalEntryWithDetails | JournalEditWithDetails,
    resetForm: () => void
  ) => void
  isSubmitting: boolean
  initialData?: JournalEntryWithDetails | JournalEditWithDetails
  isEdit?: boolean
  onClose?: () => void
}

export function JournalVoucherPopup({
  isOpen,
  onOpenChange,
  handleSubmit,
  isSubmitting,
  initialData,
  isEdit,
  onClose,
}: JournalVoucherPopupProps) {
  const [token] = useAtom(tokenAtom)

  const defaultValues = useMemo(
    () =>
      initialData
        ? {
            ...initialData,
            journalDetails: initialData.journalDetails.map((detail) => ({
              ...detail,
              accountId: Number(detail.accountId || 0),
              resPartnerId:
                detail.resPartnerId === null ||
                detail.resPartnerId === undefined
                  ? null
                  : Number(detail.resPartnerId),
              costCenterId:
                detail.costCenterId === null ||
                detail.costCenterId === undefined
                  ? null
                  : Number(detail.costCenterId),
              departmentId:
                detail.departmentId === null ||
                detail.departmentId === undefined
                  ? null
                  : Number(detail.departmentId),
            })),
          }
        : {
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
                resPartnerId: null,
                costCenterId: null,
                departmentId: null,
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

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues)
    } else {
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
        resPartnerId: null,
        costCenterId: null,
        departmentId: null,
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
    const subscription = form.watch((value, { name }) => {
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
        form.setValue(
          'journalEntry.amountTotal',
          Math.max(totalDebit, totalCredit)
        )
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const onSubmit = async (
    data: JournalEntryWithDetails | JournalEditWithDetails
  ) => {
    if (!isEdit) {
      handleSubmit(data, resetForm)
    } else {
      const payload: JournalEditWithDetails = {
        ...(initialData as JournalEditWithDetails),
        ...data,
        journalEntry: {
          ...(initialData as JournalEditWithDetails).journalEntry,
          ...data.journalEntry,
          id: (initialData as JournalEditWithDetails).journalEntry.id,
        },
        journalDetails: (data.journalDetails || []).map((detail, idx) => {
          const baseDetail =
            (initialData as JournalEditWithDetails).journalDetails[idx] || {}

          return {
            ...baseDetail,
            ...detail,
            accountId: Number(detail.accountId || baseDetail.accountId || 0),
            resPartnerId:
              detail.resPartnerId === null || detail.resPartnerId === undefined
                ? null
                : Number(detail.resPartnerId),
            costCenterId:
              detail.costCenterId === null || detail.costCenterId === undefined
                ? null
                : Number(detail.costCenterId),
            departmentId:
              detail.departmentId === null || detail.departmentId === undefined
                ? null
                : Number(detail.departmentId),
          }
        }),
      }

      const response = await editJournalEntryWithDetails(payload, token)

      if (response.error || !response.data) {
        toast({
          title: 'Error',
          description: response.error?.message || 'Error editing Journal',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Voucher is edited successfully',
        })
        resetForm()
        onClose?.()
      }
    }
  }


  // Calculate if debit and credit are balanced
// In JournalVoucherPopup component, update the isBalanced calculation:

const entries = form.watch('journalDetails') || []
const totals = entries.reduce(
  (acc, entry) => ({
    debit: acc.debit + (entry?.debit || 0),
    credit: acc.credit + (entry?.credit || 0),
  }),
  { debit: 0, credit: 0 }
)

// Updated validation: totals must be equal AND greater than 0
const isBalanced = 
  totals.debit === totals.credit && 
  totals.debit > 0 && 
  totals.credit > 0

  return (
    <>
      {!initialData && (
        <Button onClick={() => onOpenChange(true)}>
          <Plus className="mr-2 h-4 w-4" /> ADD
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={onOpenChange} modal>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="max-w-6xl h-[95vh] overflow-hidden"
        >
          <DialogHeader>
            <div>
              <DialogTitle>Journal Voucher</DialogTitle>
              <DialogDescription>
                Enter the details for the journal voucher here. Click save when
                you are done.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[85vh] p-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <JournalVoucherMasterSection form={form} />

                <JournalVoucherDetailsSection
                  form={form}
                  onAddEntry={addEntry}
                  onRemoveEntry={removeEntry}
                  isEdit={isEdit}
                />

                <JournalVoucherSubmit
                  form={form}
                  onSubmit={form.handleSubmit(onSubmit)}
                  isSubmitting={isSubmitting}
                   isBalanced={isBalanced}
                />
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
