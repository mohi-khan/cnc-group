'use client'

import {
  VoucherById,
  JournalEntryWithDetails,
  VoucherTypes,
} from '@/utils/type'
import { toast } from '@/hooks/use-toast'
import { createJournalEntryWithDetails } from '@/api/vouchers-api'
import { tokenAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useCallback } from 'react'

import CashVoucher from '@/components/cash/cash-voucher/cash-voucher'
import BankVoucher from '@/components/bank/bank-vouchers/bank-vouchers'
import { JournalVoucherPopup } from '@/components/accounting/journal-voucher/journal-voucher-popup'
import { ContraVoucherPopup } from '@/components/cash/contra-voucher/contra-voucher-popup'

interface VoucherDuplicationContentProps {
  voucherData: VoucherById[]
  userId: number
  onClose: () => void
}

// ── Transform VoucherById[] → JournalEntryWithDetails ──────────────────────────
const transformVoucherData = (
  voucherData: VoucherById[],
  userId: number
): JournalEntryWithDetails | null => {
  if (!voucherData || voucherData.length === 0) return null

  const firstEntry = voucherData[0]

  const totalDebit = voucherData.reduce((sum, d) => sum + (d.debit || 0), 0)
  const totalCredit = voucherData.reduce((sum, d) => sum + (d.credit || 0), 0)
  const amountTotal = Math.max(totalDebit, totalCredit)

  return {
    journalEntry: {
      date: new Date().toISOString().split('T')[0], // today's date for duplicate
      journalType: firstEntry.journaltype,
      companyId: firstEntry.companyId || 0,
      locationId: firstEntry.locationId || 0,
      currencyId: firstEntry.currencyId || 1,
      exchangeRate: 1,                              // ✅ fixed: was 0
      amountTotal: amountTotal,
      payTo: firstEntry.payTo || '',
      notes: (firstEntry as any).MasterNotes || firstEntry.notes || '',
      createdBy: userId,
      state: 0,                                     // always Draft for duplicate
    },
    journalDetails: voucherData.map((detail) => ({
      accountId: detail.accountId ?? 0,             // ✅ correct: ID from API
      costCenterId: detail.costCenterId ?? null,    // ✅ correct: ID from API
      departmentId: detail.departmentID ?? null,    // ✅ correct: ID from API
      employeeId: (detail as any).employeeId ?? null,
      debit: detail.debit || 0,
      credit: detail.credit || 0,
      analyticTags: null,
      taxId: null,
      resPartnerId: detail.partnarId ?? null,       // ✅ fixed: was detail.partnar (নাম)
      notes: detail.detail_notes || '',
      type: detail.debit > 0 ? 'Payment' : 'Receipt',
      bankaccountid: (detail as any).bankaccountid ?? null, // ✅ fixed: correct key + null fallback
      createdBy: userId,
    })),
  }
}

const VoucherDuplicationContent: React.FC<VoucherDuplicationContentProps> = ({
  voucherData,
  userId,
  onClose,
}) => {
  const [token] = useAtom(tokenAtom)

  const dummyFetchAllVoucher = useCallback(
    async (_company: number[], _location: number[]) => {
      // no-op for duplication context
    },
    []
  )

  const handleJournalSubmit = useCallback(
    async (data: JournalEntryWithDetails, resetForm: () => void) => {
      try {
        const response = await createJournalEntryWithDetails(data, token)
        if (response.error || !response.data) {
          throw new Error(response.error?.message || 'Failed to create voucher')
        }
        toast({ title: 'Success', description: 'Voucher duplicated successfully' })
        resetForm()
        onClose()
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to create voucher',
          variant: 'destructive',
        })
      }
    },
    [token, onClose]
  )

  const initialFormData = transformVoucherData(voucherData, userId)

  if (!initialFormData) {
    return <p>Error: Could not prepare data for duplication.</p>
  }

  const voucherType = initialFormData.journalEntry.journalType

  switch (voucherType) {
    case VoucherTypes.CashVoucher:
      return (
        <CashVoucher
          initialData={initialFormData}
          onClose={onClose}
          isEdit={false}
          onSuccess={undefined}
        />
      )

    case VoucherTypes.BankVoucher:
      return (
        <BankVoucher
          initialData={initialFormData}
          onClose={onClose}
          onSuccess={undefined}
        />
      )

    case VoucherTypes.JournalVoucher:
      return (
        <JournalVoucherPopup
          isOpen={true}
          onOpenChange={onClose}
          initialData={initialFormData}
          handleSubmit={handleJournalSubmit}
          isSubmitting={false}
          isEdit={true}   // ← add this
        
        />
      )

    case VoucherTypes.ContraVoucher:
      return (
        <ContraVoucherPopup
          isOpen={true}
          onOpenChange={onClose}
          initialData={initialFormData}
          fetchAllVoucher={dummyFetchAllVoucher}
          isEdit={false}
          onClose={onClose}
          onSuccess={undefined}
        />
      )

    default:
      return <p>Unknown Voucher Type: {voucherType}</p>
  }
}

export default VoucherDuplicationContent


