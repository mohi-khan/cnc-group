'use client'

import type React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, X } from 'lucide-react'
import {
  JournalEditWithDetails,
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  VoucherTypes,
} from '@/utils/type'
import { createJournalEntryWithDetails } from '@/api/journal-voucher-api'
import { toast } from '@/hooks/use-toast'
import { ContraVoucherMasterSection } from './contra-voucher-master-section'
import { ContraVoucherDetailsSection } from './contra-voucher-details-section'
import { ContraVoucherSubmit } from './contra-voucher-submit'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { editJournalEntryWithDetails } from '@/api/vouchers-api'
import type { LastUsedContraValues } from './contra-voucher-list'
import { getLocalDateString } from '@/utils/localtime'

interface ContraVoucherPopupProps {
  fetchAllVoucher: (company: number[], location: number[]) => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  initialData?: JournalEntryWithDetails
  isEdit?: boolean
  onClose?: () => void
  onSuccess: any
  // ── Last-used props ──
  lastUsedValues?: LastUsedContraValues | null
  showLastUsedBanner?: boolean
  onClearLastUsed?: () => void
  onSaveLastUsed?: (
    companyId: number,
    locationId: number,
    currencyId: number,
    date: string
  ) => void
}

/** Build static default values — no localStorage read (avoids SSR mismatch). */
const buildDefaultValues = (
  lastUsed: LastUsedContraValues | null | undefined,
  userId: number
): JournalEntryWithDetails => ({
  journalEntry: {
    date: lastUsed?.date ?? getLocalDateString(),
    journalType: VoucherTypes.ContraVoucher,
    state: 0,
    companyId: lastUsed?.companyId ?? 0,
    locationId: lastUsed?.locationId ?? 0,
    currencyId: lastUsed?.currencyId ?? 1,
    exchangeRate: 1,
    amountTotal: 0,
    createdBy: userId,
  },
  journalDetails: [
    {
      accountId: 0,
      debit: 0,
      credit: 0,
      createdBy: userId,
    },
  ],
})

export const ContraVoucherPopup: React.FC<ContraVoucherPopupProps> = ({
  fetchAllVoucher,
  isOpen: externalIsOpen,
  onOpenChange,
  initialData,
  isEdit,
  onClose,
  onSuccess,
  lastUsedValues,
  showLastUsedBanner: showBannerProp = false,
  onClearLastUsed,
  onSaveLastUsed,
}) => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<number>(0)

  // Local banner state — driven by prop, can be dismissed independently
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    setShowBanner(showBannerProp)
  }, [showBannerProp])

  const isDuplicationMode = initialData !== undefined
  const isOpen = isDuplicationMode ? (externalIsOpen ?? false) : internalIsOpen
  const setIsOpen = isDuplicationMode
    ? (open: boolean) => onOpenChange?.(open)
    : setInternalIsOpen

  useEffect(() => {
    if (userData) setUserId(userData.userId)
  }, [userData])

  // ─── Default values ──────────────────────────────────────────────────────────
  const defaultValues = useMemo(() => {
    if (initialData) {
      return {
        ...initialData,
        journalEntry: {
          ...initialData.journalEntry,
          createdBy: userData?.userId || 0,
        },
        journalDetails: initialData.journalDetails.map((detail) => ({
          ...detail,
          createdBy: userData?.userId || 0,
          bankaccountid: detail.bankaccountid || 0,
        })),
      }
    }
    // New voucher — pre-fill with last-used master values
    return buildDefaultValues(lastUsedValues, userId)
  }, [initialData, lastUsedValues, userId, userData?.userId])

  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues,
  })

  useEffect(() => {
    if (userId !== 0) form.reset(defaultValues)
  }, [userId, form, defaultValues])

  useEffect(() => {
    if (isOpen) form.reset(defaultValues)
  }, [isOpen, defaultValues, form])

  // ─── Clear banner handler ────────────────────────────────────────────────────
  const handleClearBanner = () => {
    setShowBanner(false)
    onClearLastUsed?.()
    // Reset to blank (no last-used values)
    form.reset(buildDefaultValues(null, userId))
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (data: JournalEntryWithDetails) => {
    const amountTotal = data.journalDetails.reduce(
      (sum, detail) => sum + Number(detail.debit),
      0
    )

    if (!isEdit) {
      setIsSubmitting(true)

      const submissionData = {
        ...data,
        journalEntry: {
          ...data.journalEntry,
          amountTotal,
          exchangeRate: data.journalEntry.exchangeRate || 1,
        },
      }

      try {
        const response = await createJournalEntryWithDetails(submissionData, token)

        if (response.error || !response.data) {
          throw new Error(response.error?.message || 'Failed to create voucher')
        }

        // ✅ Persist last-used values on successful create
        onSaveLastUsed?.(
          data.journalEntry.companyId,
          data.journalEntry.locationId,
          data.journalEntry.currencyId,
          data.journalEntry.date
        )

        toast({ title: 'Success', description: 'Voucher created successfully' })

        // Reset form but keep master values pre-filled
        form.reset(buildDefaultValues(lastUsedValues, userId))
      } catch (error) {
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to create voucher',
          variant: 'destructive',
        })
      } finally {
        setIsSubmitting(false)
        fetchAllVoucher(
          [data.journalEntry.companyId],
          [data.journalEntry.locationId]
        )
      }
    } else {
      setIsSubmitting(true)

      const payload: JournalEditWithDetails = {
        ...(initialData as JournalEditWithDetails),
        ...data,
        journalEntry: {
          ...(initialData as JournalEditWithDetails).journalEntry,
          ...data.journalEntry,
          id: (initialData as JournalEditWithDetails).journalEntry.id,
          amountTotal,
          exchangeRate: data.journalEntry.exchangeRate || 1,
        },
        journalDetails: (data.journalDetails || []).map((detail, idx) => ({
          ...(initialData as JournalEditWithDetails).journalDetails[idx],
          ...detail,
        })),
      }

      try {
        const response = await editJournalEntryWithDetails(payload, token)

        if (response.error || !response.data) {
          throw new Error(response.error?.message || 'Failed to edit voucher')
        }

        toast({ title: 'Success', description: 'Voucher edited successfully' })
        if (onSuccess) onSuccess()
        form.reset()
        onClose?.()
      } catch (error) {
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to edit voucher',
          variant: 'destructive',
        })
      } finally {
        setIsSubmitting(false)
        fetchAllVoucher(
          [data.journalEntry.companyId],
          [data.journalEntry.locationId]
        )
        setIsOpen(false)
      }
    }
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

  const entries = form.watch('journalDetails') || []
  const totals = entries.reduce(
    (acc, entry) => ({
      debit: acc.debit + (entry?.debit || 0),
      credit: acc.credit + (entry?.credit || 0),
    }),
    { debit: 0, credit: 0 }
  )

  const isBalanced =
    totals.debit === totals.credit && totals.debit > 0 && totals.credit > 0

  return (
    <>
      {!isDuplicationMode && (
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> ADD
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen} modal={true}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="max-w-6xl h-[95vh] overflow-auto"
        >
          <DialogHeader>
            <DialogTitle>Contra Voucher</DialogTitle>
            <DialogDescription>
              Enter your voucher details here.
            </DialogDescription>
          </DialogHeader>

          {/*
            ── Last-used banner ──
            showBanner is false on server + initial client render.
            Set to true only via useEffect (client-only) — zero SSR mismatch.
          */}
          {showBanner && !initialData && !isEdit && (
            <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium">
                  ℹ️ Using last filled values
                </span>
                <span className="text-sm text-blue-700">
                  (Company, Location, Currency, Date)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearBanner}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <ContraVoucherMasterSection form={form} />
              <ContraVoucherDetailsSection
                form={form}
                onRemoveEntry={removeEntry}
                isEdit={isEdit}
              />
              <ContraVoucherSubmit
                form={form}
                onSubmit={form.handleSubmit(handleSubmit)}
                isSubmitting={isSubmitting}
                isBalanced={isBalanced}
              />
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

