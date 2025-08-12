'use client'
import {
  VoucherById,
  JournalEditWithDetails,
  VoucherTypes,
} from '@/utils/type'
import { toast } from '@/hooks/use-toast'
import { editJournalEntryWithDetails } from '@/api/vouchers-api' // Assuming this API is used for all voucher types
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import CashVoucher from '@/components/cash/cash-voucher/cash-voucher'
import BankVoucher from '@/components/bank/bank-vouchers/bank-vouchers'
import { JournalVoucherPopup } from '@/components/accounting/journal-voucher/journal-voucher-popup'
import { ContraVoucherPopup } from '@/components/cash/contra-voucher/contra-voucher-popup'
import { tokenAtom } from '@/utils/user'

interface VoucherDuplicationContentProps {
  voucherData: VoucherById[]
  userId: number
  onClose: () => void // Callback to close the parent modal
  isOpen: boolean // New prop to control visibility of internal dialogs
}

// Helper function to transform VoucherById[] to JournalEditWithDetails
const transformVoucherData = (
  voucherData: VoucherById[],
  userId: number
): JournalEditWithDetails | null => {
  console.log("🚀 ~ transformVoucherData ~ voucherData:", voucherData)
  if (!voucherData || voucherData.length === 0) {
    return null
  }
  const firstEntry = voucherData[0]

  // Calculate total debit and credit for the journal entry amountTotal
  const totalDebit = voucherData.reduce(
    (sum, detail) => sum + (detail.debit || 0),
    0
  )
  const totalCredit = voucherData.reduce(
    (sum, detail) => sum + (detail.credit || 0),
    0
  )
  const amountTotal = Math.max(totalDebit, totalCredit)

  return {
    journalEntry: {
      id: firstEntry.voucherid,
      date: new Date().toISOString().split('T')[0], // New date for duplication
      journalType: firstEntry.journaltype,
      companyId: firstEntry.companyId || 0, // Added fallback for safety
      locationId: firstEntry.locationId || 0, // Added fallback for safety
      currencyId: firstEntry.currencyId || 1, // Added fallback, assuming 1 is default currency ID
      amountTotal: amountTotal,
      exchangeRate: 1, // Added fallback for safety
      payTo: firstEntry.payTo || '',
      notes: (firstEntry as any).MasterNotes || '',
      periodid: (firstEntry as any).periodid,
      createdBy: userId,
      state: 0, // Always start as Draft for edit vouchers
    },
    journalDetails: voucherData.map((detail) => ({
      id: detail.id,
      accountId: (detail.accountId ?? 0) as number,
      costCenterId: detail.costCenterId ?? null,
      departmentId: detail.departmentID ?? null,
      debit: detail.debit || 0,
      credit: detail.credit || 0,
      balance: 0,
      analyticTags: null,
      taxId: null,
      resPartnerId: detail.partner || null,
      notes: detail.detail_notes || '',
      type: 'Receipt',
      bankAccountid: detail.bankAccountid || null,
      createdBy: userId,
    })),    
  }
}

const VoucherEditContent: React.FC<VoucherDuplicationContentProps> = ({
  voucherData,
  userId,
  onClose,
  isOpen, // Accept the new prop
}) => {
  console.log("🚀 ~ VoucherEditContent ~ voucherData:", voucherData)
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL
  const [token] = useAtom(tokenAtom)

  // Dummy fetchAllVoucher for ContraVoucherPopup (if it's not globally available)
  // In a real application, this should trigger a refresh of the main voucher list.
  const dummyFetchAllVoucher = useCallback(
    (company: number[], location: number[]) => {
      console.log(
        'Dummy fetchAllVoucher called for ContraVoucherPopup during duplication.'
      )
      // You might want to call a prop function here to refresh the main list
      // For example: onVoucherListRefresh(company, location);
    },
    []
  )

  // Generic handleSubmit for Journal Vouchers (as JournalVoucherPopup expects it)
  const handleJournalSubmit = useCallback(
    async (data: JournalEditWithDetails, resetForm: () => void) => {
      try {
        const response = await editJournalEntryWithDetails(data, token)
        console.log('🚀 ~ VoucherEditContent ~ data:', data)
        if (response.error || !response.data) {
          throw new Error(response.error?.message || 'Failed to edit voucher')
        }
        toast({
          title: 'Success',
          description: 'Voucher created successfully',
        })
        resetForm() // Reset the form in the popup
        onClose() // Close the duplication modal
      } catch (error) {
        console.error('Error creating voucher:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to create voucher',
          variant: 'destructive',
        })
      }
    },
    [token, onClose]
  )

  // Now, the conditional return comes AFTER all hook calls
  const initialFormData = transformVoucherData(voucherData, userId)
  console.log("🚀 ~ VoucherEditContent ~ initialFormData:", initialFormData)
  if (!initialFormData) {
    return <p>Error: Could not prepare data for duplication.</p>
  }

  const voucherType = initialFormData.journalEntry.journalType

  switch (voucherType) {
    case VoucherTypes.CashVoucher:
      return <CashVoucher initialData={initialFormData} onClose={onClose} isEdit={true}/>
    case VoucherTypes.BankVoucher:
      return <BankVoucher initialData={initialFormData} onClose={onClose} />
    case VoucherTypes.JournalVoucher:
      return (
        <JournalVoucherPopup
          isOpen={isOpen} // Pass the isOpen prop from parent
          onOpenChange={onClose} // When this popup wants to close, close the parent modal
          initialData={initialFormData}
          handleSubmit={handleJournalSubmit as any} // Pass the generic submit handler
          isSubmitting={false} // Managed internally by the popup
        />
      )
    case VoucherTypes.ContraVoucher:
      return (
        <ContraVoucherPopup
          isOpen={isOpen} // Pass the isOpen prop from parent
          onOpenChange={onClose} // When this popup wants to close, close the parent modal
          initialData={initialFormData}
          fetchAllVoucher={dummyFetchAllVoucher} // Pass a dummy or actual fetch function
        />
      )
    default:
      return <p>Unknown Voucher Type: {voucherType}</p>
  }
}

export default VoucherEditContent