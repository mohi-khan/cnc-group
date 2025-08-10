'use client'

import type React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { useAtom } from 'jotai'
import { tokenAtom } from '@/utils/user'
import { VoucherTypes } from '@/utils/type' // Import VoucherTypes

import { editJournalMasterWithDetail } from '@/api/journal-voucher-api'

// Types
import type { VoucherById, JournalEntryWithDetails } from '@/utils/type'

// Existing UI flows
import CashVoucher from '@/components/cash/cash-voucher/cash-voucher'
import BankVoucher from '@/components/bank/bank-vouchers/bank-vouchers'
import { JournalVoucherPopup } from '@/components/accounting/journal-voucher/journal-voucher-popup'
import { ContraVoucherPopup } from '@/components/cash/contra-voucher/contra-voucher-popup'

interface VoucherEditContentProps {
  voucherData: VoucherById[]
  userId: number
  onClose: () => void
  // Optional: fire when edit succeeds to let parent refresh
  onEdited?: (voucherId: number) => void
}

/**
 * Transform VoucherById[] (existing voucher rows) into JournalEntryWithDetails
 * suitable for the popup initialData when editing.
 * - Preserves original date, journalType, and state.
 * - Computes amountTotal from lines.
 * - Attempts to keep partner/bank/department/cost center mapping.
 */
function transformVoucherDataForEdit(
  voucherData: VoucherById[],
  userId: number
): {
  initial: JournalEntryWithDetails | null
  meta: {
    voucherId?: number
    voucherNo?: string
    companyname?: string
    location?: string
    currency?: string
    reference?: string
  }
} {
  if (!voucherData || voucherData.length === 0) {
    return { initial: null, meta: {} }
  }

  const first = voucherData[0]

  // Compute totals from the details
  const totalDebit = voucherData.reduce((sum, d) => sum + (d.debit || 0), 0)
  const totalCredit = voucherData.reduce((sum, d) => sum + (d.credit || 0), 0)
  const amountTotal = Math.max(totalDebit, totalCredit)

  const journalDetails = voucherData.map((detail) => ({
    // Note: Many popups don't require the detail id in the initialData shape.
    // We keep only what the popup needs. We'll re-inject IDs on submit.
    accountId: detail.accountId || 0,
    costCenterId: (detail.costCenterId as number | null | undefined) ?? 0,
    departmentId: (detail.departmentID as number | null | undefined) ?? 0,
    debit: detail.debit || 0,
    credit: detail.credit || 0,
    analyticTags: null,
    taxId: null,
    resPartnerId:
      (detail as any).resPartnerId ?? (detail as any).partner ?? null,
    notes: (detail as any).detail_notes || '',
    type: 'Receipt', // Often ignored for Journal, required for some cash flows; leave default.
    bankAccountId: (detail as any).bankAccountId || 0,
    createdBy: userId,
  }))

  const initial: JournalEntryWithDetails = {
    journalEntry: {
      date: (first as any).date || new Date().toISOString().split('T')[0],
      journalType: (first as any).journaltype,
      companyId: (first as any).companyId || 0,
      locationId: (first as any).locationId || 0,
      currencyId: (first as any).currencyId || 1,
      amountTotal,
      exchangeRate: (first as any).exchangeRate || 1,
      payTo: (first as any).payTo || '',
      notes: (first as any).notes || '',
      createdBy: userId,
      state: (first as any).state ?? 0,
    },
    journalDetails,
  }

  return {
    initial,
    meta: {
      voucherId: (first as any).voucherId ?? (first as any).voucherid,
      voucherNo: (first as any).voucherNo ?? (first as any).voucherno,
      companyname: (first as any).companyname,
      location: (first as any).location,
      currency: (first as any).currency,
      reference: (first as any).reference,
    },
  }
}

/**
 * VoucherEditContent
 * - Opens the appropriate popup pre-filled with existing voucher data.
 * - On submit (Journal flow), calls editJournalMasterWithDetail with proper API payload.
 * - Cash/Bank/Contra flows are rendered with initialData and onClose.
 */
const VoucherEditContent: React.FC<VoucherEditContentProps> = ({
  voucherData,
  userId,
  onClose,
  onEdited,
}) => {
  // Hooks at top level
  const [token] = useAtom(tokenAtom)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Prepare initial data and meta
  const { initial, meta } = useMemo(
    () => transformVoucherDataForEdit(voucherData, userId),
    [voucherData, userId]
  )

  const voucherType =
    (initial?.journalEntry.journalType as unknown as VoucherTypes) ?? null

  // Keep a reference array for detail IDs to include in edit payload if available
  const originalDetails = voucherData

  // Dummy fetch for Contra popups (refresh hook for parent if needed)
  const dummyFetchAllVoucher = useCallback(
    (_company: number[], _location: number[]) => {
      // Optionally trigger parent refresh here
      // This is a placeholder to match ContraVoucherPopup props
    },
    []
  )

  // Submit handler specifically for JournalVoucherPopup editing
  const handleJournalEditSubmit = useCallback(
    async (data: JournalEntryWithDetails, resetForm: () => void) => {
      if (!token) {
        toast({
          title: 'Unauthorized',
          description: 'Missing token',
          variant: 'destructive',
        })
        return
      }

      const headerVoucherId =
        meta.voucherId ??
        (voucherData[0] as any)?.voucherId ??
        (voucherData[0] as any)?.voucherid

      try {
        setIsSubmitting(true)

        // Build API payload similar to your VoucherList onSubmit
        const apiData = {
          id: headerVoucherId,
          voucherid: headerVoucherId,
          voucherno: meta.voucherNo || '',
          date: data.journalEntry.date,
          notes: data.journalEntry.notes,
          companyname: meta.companyname || '',
          location: meta.location || '',
          currency: meta.currency || '',
          totalamount: data.journalEntry.amountTotal,
          journaltype: data.journalEntry.journalType,

          journalEntry: {
            id: headerVoucherId,
            voucherNo: meta.voucherNo || '',
            date: data.journalEntry.date,
            journalType: data.journalEntry.journalType,
            state: data.journalEntry.state ?? 0,
            companyId: data.journalEntry.companyId,
            locationId: data.journalEntry.locationId,
            currencyId: data.journalEntry.currencyId,
            exchangeRate: data.journalEntry.exchangeRate,
            amountTotal: data.journalEntry.amountTotal,
            notes: data.journalEntry.notes ?? null,
            createdBy: data.journalEntry.createdBy,
            taxTotal: 0,
            payTo: data.journalEntry.payTo ?? '',
            reference: meta.reference ?? '',
          },

          journalDetails: data.journalDetails.map((detail, idx) => {
            // Try to preserve original detail id if present
            const original = originalDetails[idx] as any
            const originalDetailId =
              original?.detailId ?? original?.id ?? undefined

            // Some shapes include balance as string/number; normalize to number
            const toNumberOrZero = (maybe: unknown) => {
              if (typeof maybe === 'number') return maybe
              if (maybe === undefined || maybe === null || maybe === '')
                return 0
              const n = Number(maybe)
              return Number.isFinite(n) ? n : 0
            }

            return {
              id:
                typeof originalDetailId === 'number'
                  ? originalDetailId
                  : idx + 1,
              voucherId: headerVoucherId,
              accountId: detail.accountId,
              costCenterId:
                (detail as any).costCenterId !== undefined
                  ? (detail as any).costCenterId
                  : null,
              departmentId:
                (detail as any).departmentId !== undefined
                  ? (detail as any).departmentId
                  : null,
              resPartnerId:
                (detail as any).resPartnerId !== undefined
                  ? (detail as any).resPartnerId
                  : null,
              debit: detail.debit,
              credit: detail.credit,
              notes: (detail as any).notes ?? '',
              analyticTags: (detail as any).analyticTags ?? null,
              taxId:
                (detail as any).taxId !== undefined
                  ? (detail as any).taxId
                  : null,
              createdBy: (detail as any).createdBy ?? userId,
              balance: toNumberOrZero((detail as any).balance),
              bankaccountid:
                (detail as any).bankAccountId ??
                (detail as any).bankaccountid ??
                null,
              updatedBy:
                typeof (detail as any).updatedBy === 'number'
                  ? (detail as any).updatedBy
                  : ((detail as any).createdBy ?? userId),
            }
          }),
        }

        const response = await editJournalMasterWithDetail(apiData, token)
        if (response.error) {
          toast({
            title: 'Error',
            description: response.error?.message || 'Failed to update voucher',
            variant: 'destructive',
          })
          return
        }

        toast({
          title: 'Success',
          description: 'Voucher updated successfully',
        })

        resetForm()
        onEdited?.(headerVoucherId as number)
        onClose()
      } catch (error) {
        console.error('Error updating voucher:', error)
        toast({
          title: 'Error',
          description: 'Failed to update voucher',
          variant: 'destructive',
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [meta, originalDetails, token, userId, voucherData, onClose, onEdited]
  )

  if (!initial || !voucherType) {
    return (
      <p className="text-sm text-muted-foreground">
        Unable to load voucher for editing.
      </p>
    )
  }

  // Render the appropriate popup/component for editing
  switch (voucherType) {
    case VoucherTypes.CashVoucher:
      // Assuming CashVoucher can handle initialData for editing.
      return <CashVoucher initialData={initial} onClose={onClose} />

    case VoucherTypes.BankVoucher:
      // Assuming BankVoucher can handle initialData for editing.
      return <BankVoucher initialData={initial} onClose={onClose} />

    case VoucherTypes.JournalVoucher:
      return (
        <JournalVoucherPopup
          isOpen={true}
          onOpenChange={onClose}
          initialData={initial}
          handleSubmit={handleJournalEditSubmit}
          isSubmitting={isSubmitting}
        />
      )

    case VoucherTypes.ContraVoucher:
      // Assuming ContraVoucherPopup accepts initialData and can handle edit flows internally
      return (
        <ContraVoucherPopup
          isOpen={true}
          onOpenChange={onClose}
          initialData={initial}
          fetchAllVoucher={dummyFetchAllVoucher}
        />
      )

    default:
      return (
        <p className="text-sm text-muted-foreground">
          Unknown Voucher Type: {String(voucherType)}
        </p>
      )
  }
}

export default VoucherEditContent
