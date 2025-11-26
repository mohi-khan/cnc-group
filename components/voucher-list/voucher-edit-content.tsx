'use client'
import { VoucherById, JournalEditWithDetails, VoucherTypes } from '@/utils/type'
import { toast } from '@/hooks/use-toast'
import { editJournalEntryWithDetails } from '@/api/vouchers-api'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import CashVoucher from '@/components/cash/cash-voucher/cash-voucher'
import BankVoucher from '@/components/bank/bank-vouchers/bank-vouchers'
import { JournalVoucherPopup } from '@/components/accounting/journal-voucher/journal-voucher-popup'
import { ContraVoucherPopup } from '@/components/cash/contra-voucher/contra-voucher-popup'
import { tokenAtom } from '@/utils/user'
import OpeningBalance from '../opening-balance/opening-balance'

interface VoucherDuplicationContentProps {
  voucherData: VoucherById[]
  userId: number
  onClose: () => void
  isOpen: boolean
  onEdited?: () => Promise<void>
}

// Helper function to transform VoucherById[] to JournalEditWithDetails
const transformVoucherData = (
  voucherData: VoucherById[],
  userId: number
): JournalEditWithDetails | null => {
  console.log('🚀 ~ transformVoucherData ~ voucherData:', voucherData)
  if (!voucherData || voucherData.length === 0) {
    return null
  }
  const firstEntry = voucherData[0]

  return {
    journalEntry: {
      id: firstEntry.voucherid,
      date: firstEntry.date,
      journalType: firstEntry.journaltype,
      companyId: firstEntry.companyId || 0,
      locationId: firstEntry.locationId || 0,
      currencyId: firstEntry.currencyId || 1,
      amountTotal: firstEntry.totalamount,
      exchangeRate: 1,
      payTo: firstEntry.payTo || '',
      notes: (firstEntry as any).MasterNotes || '',
      periodid: (firstEntry as any).periodid,
      createdBy: userId,
      state: 0,
    },
    journalDetails: voucherData.map((detail) => ({
      id: detail.id,
      accountId: (detail.accountId ?? 0) as number,
      costCenterId: detail.costCenterId ?? null,
      departmentId: detail.departmentID ?? null,
      employeeId: (detail as any).employeeId ?? null,
      debit: detail.debit || 0,
      credit: detail.credit || 0,
      balance: 0,
      analyticTags: null,
      taxId: null,
      resPartnerId: detail.partnarId || null,
      notes: detail.detail_notes || '',
      type: detail.debit ? 'Payment' : detail.credit ? 'Receipt' : 'Unknown',
      bankaccountid: (detail as any).bankaccountid || null,
      createdBy: userId,
    })),
  }
}

const VoucherEditContent: React.FC<VoucherDuplicationContentProps> = ({
  voucherData,
  userId,
  onClose,
  isOpen,
  onEdited,
}) => {
  console.log('🚀 ~ VoucherEditContent ~ voucherData:', voucherData)
  const [token] = useAtom(tokenAtom)

  const dummyFetchAllVoucher = useCallback(
    (company: number[], location: number[]) => {
      console.log(
        'Dummy fetchAllVoucher called for ContraVoucherPopup during duplication.'
      )
    },
    []
  )

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
          description: 'Voucher updated successfully',
        })

        resetForm()

        // Trigger auto-refresh event for DayBooks component
        window.dispatchEvent(new Event('voucherUpdated'))

        // Call onEdited callback if provided
        if (onEdited) {
          await onEdited()
        }

        onClose()
      } catch (error) {
        console.error('Error updating voucher:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to update voucher',
          variant: 'destructive',
        })
      }
    },
    [token, onClose, onEdited]
  )

  // Wrapper for CashVoucher success callback
  const handleCashVoucherSuccess = useCallback(() => {
    window.dispatchEvent(new Event('voucherUpdated'))
    if (onEdited) {
      onEdited()
    }
  }, [onEdited])

  // Wrapper for BankVoucher success callback
  const handleBankVoucherSuccess = useCallback(() => {
    window.dispatchEvent(new Event('voucherUpdated'))
    if (onEdited) {
      onEdited()
    }
  }, [onEdited])

  // Wrapper for OpeningBalance success callback
  const handleOpeningBalanceSuccess = useCallback(() => {
    window.dispatchEvent(new Event('voucherUpdated'))
    if (onEdited) {
      onEdited()
    }
  }, [onEdited])

  const initialFormData = transformVoucherData(voucherData, userId)

  if (!initialFormData) {
    return <p>Error: Could not prepare data for duplication.</p>
  }

  const voucherType = initialFormData.journalEntry.journalType
  const voucherNo = voucherData[0]?.voucherno || 'N/A'
  const voucherDate = voucherData[0]?.date || 'N/A'

  // Wrapper with consistent responsive height handling
  const wrapperClassName = 'w-full h-[80vh] overflow-y-auto'

  // Common header component for all voucher types
   const VoucherHeader = () => (
    <div className="sticky top-0 z-10 bg-white border-b px-6 py-3 mb-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
            <span className="font-medium">
              Voucher No: <span className="text-blue-600">{voucherNo}</span>
            </span>
            <span className="text-gray-400">|</span>
            <span>Date: {voucherDate}</span>
          </div>
        </div>
      </div>
    </div>
  )

  switch (voucherType) {
    case VoucherTypes.CashVoucher:
      return (
        <div className={wrapperClassName}>
          <VoucherHeader />
          <div className="px-6">
            <CashVoucher
              initialData={initialFormData}
              onClose={onClose}
              isEdit={true}
              onSuccess={handleCashVoucherSuccess}
            />
          </div>
        </div>
      )
    case VoucherTypes.BankVoucher:
      return (
        <div className={wrapperClassName}>
          <VoucherHeader />
          <div className="px-6">
            <BankVoucher
              initialData={initialFormData}
              onClose={onClose}
              isEdit={true}
              onSuccess={handleBankVoucherSuccess}
            />
          </div>
        </div>
      )
    case VoucherTypes.JournalVoucher:
      return (
        <div>
         
          <JournalVoucherPopup
            isOpen={isOpen}
            onOpenChange={onClose}
            initialData={initialFormData}
            handleSubmit={handleJournalSubmit as any}
            isSubmitting={false}
            isEdit={true}
            onClose={onClose}
          />
        </div>
      )
    case VoucherTypes.ContraVoucher:
      return (
        <div>
          <VoucherHeader />
          <ContraVoucherPopup
            isOpen={isOpen}
            onOpenChange={onClose}
            initialData={initialFormData}
            fetchAllVoucher={dummyFetchAllVoucher}
            isEdit={true}
            onClose={onClose}
            onSuccess={handleCashVoucherSuccess}
          />
        </div>
      )
    case VoucherTypes.OpeningBalance:
      return (
        <div className={wrapperClassName}>
          <VoucherHeader />
          <div className="px-6">
            <OpeningBalance
              initialData={initialFormData}
              isEdit={true}
              onClose={onClose}
            />
          </div>
        </div>
      )
    default:
      return <p>Unknown Voucher Type: {voucherType}</p>
  }
}

export default VoucherEditContent
