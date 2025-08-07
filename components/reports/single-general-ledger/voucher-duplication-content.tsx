// 'use client'


// import { VoucherById, JournalEntryWithDetails, VoucherTypes } from '@/utils/type'

// import { toast } from '@/hooks/use-toast'
// import { createJournalEntryWithDetails } from '@/api/vouchers-api' // Assuming this API is used for all voucher types
// import { tokenAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { useCallback } from 'react'
// import CashVoucher from '@/components/cash/cash-voucher/cash-voucher'
// import BankVoucher from '@/components/bank/bank-vouchers/bank-vouchers'
// import { JournalVoucherPopup } from '@/components/accounting/journal-voucher/journal-voucher-popup'
// import { ContraVoucherPopup } from '@/components/cash/contra-voucher/contra-voucher-popup'

// interface VoucherDuplicationContentProps {
//   voucherData: VoucherById[]
//   userId: number
//   onClose: () => void // Callback to close the parent modal
// }

// // Helper function to transform VoucherById[] to JournalEntryWithDetails
// const transformVoucherData = (
//   voucherData: VoucherById[],
//   userId: number
// ): JournalEntryWithDetails | null => {
//   if (!voucherData || voucherData.length === 0) {
//     return null
//   }

//   const firstEntry = voucherData[0]

//   // Calculate total debit and credit for the journal entry amountTotal
//   const totalDebit = voucherData.reduce((sum, detail) => sum + detail.debit, 0);
//   const totalCredit = voucherData.reduce((sum, detail) => sum + detail.credit, 0);
//   const amountTotal = Math.max(totalDebit, totalCredit);

//   return {
//     journalEntry: {
//       date: new Date().toISOString().split('T')[0], // New date for duplication
//       journalType: firstEntry.journaltype,
//       companyId: firstEntry.companyid,
//       locationId: firstEntry.locationid,
//       currencyId: firstEntry.currencyid,
//       amountTotal: amountTotal,
//       exchangeRate: firstEntry.exchangerate,
//       payTo: firstEntry.payto || '',
//       notes: firstEntry.notes || '',
//       createdBy: userId,
//       state: 0, // Always start as Draft for duplicated vouchers
//     },
//     journalDetails: voucherData.map((detail) => ({
//       accountId: detail.accountid,
//       costCenterId: detail.costcenterid || null,
//       departmentId: detail.departmentid || null,
//       debit: detail.debit,
//       credit: detail.credit,
//       analyticTags: null, // Reset or handle as needed
//       taxId: null, // Reset or handle as needed
//       resPartnerId: detail.respartnerid || null,
//       notes: detail.detail_notes || '',
//       type: detail.type || 'Receipt', // Default for Cash Voucher
//       bankaccountid: detail.bankaccountid || null, // For Bank/Contra Voucher
//       createdBy: userId,
//     })),
//   }
// }

// const VoucherDuplicationContent: React.FC<VoucherDuplicationContentProps> = ({
//   voucherData,
//   userId,
//   onClose,
// }) => {
//   const [token] = useAtom(tokenAtom);
//   const initialFormData = transformVoucherData(voucherData, userId)

//   if (!initialFormData) {
//     return <p>Error: Could not prepare data for duplication.</p>
//   }

//   const voucherType = initialFormData.journalEntry.journalType

//   // Dummy fetchAllVoucher for ContraVoucherPopup (if it's not globally available)
//   const dummyFetchAllVoucher = useCallback(() => {
//     console.log('Dummy fetchAllVoucher called for ContraVoucherPopup during duplication.');
//     // In a real application, you might want to trigger a refresh of the main voucher list here.
//   }, []);

//   // Generic handleSubmit for Journal and Contra Vouchers
//   // This will be passed to JournalVoucherPopup and ContraVoucherPopup
//   const handleJournalOrContraSubmit = useCallback(async (data: JournalEntryWithDetails, resetForm: () => void) => {
//     try {
//       const response = await createJournalEntryWithDetails(data, token);
//       if (response.error || !response.data) {
//         throw new Error(response.error?.message || 'Failed to create voucher');
//       }
//       toast({
//         title: 'Success',
//         description: 'Voucher created successfully',
//       });
//       resetForm(); // Reset the form in the popup
//       onClose(); // Close the duplication modal
//     } catch (error) {
//       console.error('Error creating voucher:', error);
//       toast({
//         title: 'Error',
//         description: error instanceof Error ? error.message : 'Failed to create voucher',
//         variant: 'destructive',
//       });
//     }
//   }, [token, onClose]);


//   switch (voucherType) {
//     case VoucherTypes.CashVoucher:
//       return <CashVoucher initialData={initialFormData} onClose={onClose} />
//     case VoucherTypes.BankVoucher:
//       return <BankVoucher initialData={initialFormData} onClose={onClose} />
//     case VoucherTypes.JournalVoucher:
//       return (
//         <JournalVoucherPopup
//           isOpen={true} // This popup should be open when rendered
//           onOpenChange={onClose} // When this popup wants to close, close the parent modal
//           initialData={initialFormData}
//           handleSubmit={handleJournalOrContraSubmit} // Pass the generic submit handler
//           isSubmitting={false} // Managed internally by the popup
//         />
//       )
//     case VoucherTypes.ContraVoucher:
//       return (
//         <ContraVoucherPopup
//           isOpen={true} // This popup should be open when rendered
//           onOpenChange={onClose} // When this popup wants to close, close the parent modal
//           initialData={initialFormData}
//           fetchAllVoucher={dummyFetchAllVoucher} // Pass a dummy or actual fetch function
//         />
//       )
//     default:
//       return <p>Unknown Voucher Type: {voucherType}</p>
//   }
// }

// export default VoucherDuplicationContent
'use client'

import { VoucherById, JournalEntryWithDetails, VoucherTypes } from '@/utils/type'
import { toast } from '@/hooks/use-toast'
import { createJournalEntryWithDetails } from '@/api/vouchers-api' // Assuming this API is used for all voucher types
import { tokenAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useCallback } from 'react'

// Corrected import paths based on your provided code
import CashVoucher from '@/components/cash/cash-voucher/cash-voucher'
import BankVoucher from '@/components/bank/bank-vouchers/bank-vouchers'
import { JournalVoucherPopup } from '@/components/accounting/journal-voucher/journal-voucher-popup'
import { ContraVoucherPopup } from '@/components/cash/contra-voucher/contra-voucher-popup'

interface VoucherDuplicationContentProps {
  voucherData: VoucherById[]
  userId: number
  onClose: () => void // Callback to close the parent modal
}

// Helper function to transform VoucherById[] to JournalEntryWithDetails
const transformVoucherData = (
  voucherData: VoucherById[],
  userId: number
): JournalEntryWithDetails | null => {
  if (!voucherData || voucherData.length === 0) {
    return null
  }
  const firstEntry = voucherData[0]

  // Calculate total debit and credit for the journal entry amountTotal
  const totalDebit = voucherData.reduce((sum, detail) => sum + (detail.debit || 0), 0);
  const totalCredit = voucherData.reduce((sum, detail) => sum + (detail.credit || 0), 0);
  const amountTotal = Math.max(totalDebit, totalCredit);

  return {
    journalEntry: {
      date: new Date().toISOString().split('T')[0], // New date for duplication
      journalType: firstEntry.journaltype,
      companyId: firstEntry.companyaId || 0, // Added fallback for safety
      locationId: firstEntry.locationId || 0, // Added fallback for safety
      currencyId: firstEntry.currencyid || 1, // Added fallback, assuming 1 is default currency ID
      amountTotal: amountTotal,
      exchangeRate: firstEntry.exchangerate || 1, // Added fallback for safety
      payTo: firstEntry.payto || '',
      notes: firstEntry.notes || '',
      createdBy: userId,
      state: 0, // Always start as Draft for duplicated vouchers
    },
    journalDetails: voucherData.map((detail) => ({
      accountId: detail.accountid || 0, // Added fallback for safety
      costCenterId: detail.costcenterid || null,
      departmentId: detail.departmentid || null,
      debit: detail.debit || 0, // Added fallback for safety
      credit: detail.credit || 0, // Added fallback for safety
      analyticTags: null, // Reset or handle as needed
      taxId: null, // Reset or handle as needed
      resPartnerId: detail.respartnerid || null,
      notes: detail.detail_notes || '',
      type: detail.type || 'Receipt', // Default for Cash Voucher
      bankaccountid: detail.bankaccountid || null, // For Bank/Contra Voucher
      createdBy: userId,
    })),
  }
}

const VoucherDuplicationContent: React.FC<VoucherDuplicationContentProps> = ({
  voucherData,
  userId,
  onClose,
}) => {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL
  const [token] = useAtom(tokenAtom);

  // Dummy fetchAllVoucher for ContraVoucherPopup (if it's not globally available)
  // In a real application, this should trigger a refresh of the main voucher list.
  const dummyFetchAllVoucher = useCallback((company: number[], location: number[]) => {
    console.log('Dummy fetchAllVoucher called for ContraVoucherPopup during duplication.');
    // You might want to call a prop function here to refresh the main list
    // For example: onVoucherListRefresh(company, location);
  }, []);

  // Generic handleSubmit for Journal Vouchers (as JournalVoucherPopup expects it)
  const handleJournalSubmit = useCallback(async (data: JournalEntryWithDetails, resetForm: () => void) => {
    try {
      const response = await createJournalEntryWithDetails(data, token);
      if (response.error || !response.data) {
        throw new Error(response.error?.message || 'Failed to create voucher');
      }
      toast({
        title: 'Success',
        description: 'Voucher created successfully',
      });
      resetForm(); // Reset the form in the popup
      onClose(); // Close the duplication modal
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create voucher',
        variant: 'destructive',
      });
    }
  }, [token, onClose]);

  // Now, the conditional return comes AFTER all hook calls
  const initialFormData = transformVoucherData(voucherData, userId)
  if (!initialFormData) {
    return <p>Error: Could not prepare data for duplication.</p>
  }

  const voucherType = initialFormData.journalEntry.journalType

  switch (voucherType) {
    case VoucherTypes.CashVoucher:
      return <CashVoucher initialData={initialFormData} onClose={onClose} />
    case VoucherTypes.BankVoucher:
      return <BankVoucher initialData={initialFormData} onClose={onClose} />
    case VoucherTypes.JournalVoucher:
      return (
        <JournalVoucherPopup
          isOpen={true} // This popup should be open when rendered
          onOpenChange={onClose} // When this popup wants to close, close the parent modal
          initialData={initialFormData}
          handleSubmit={handleJournalSubmit} // Pass the generic submit handler
          isSubmitting={false} // Managed internally by the popup
        />
      )
    case VoucherTypes.ContraVoucher:
      return (
        <ContraVoucherPopup
          isOpen={true} // This popup should be open when rendered
          onOpenChange={onClose} // When this popup wants to close, close the parent modal
          initialData={initialFormData}
          fetchAllVoucher={dummyFetchAllVoucher} // Pass a dummy or actual fetch function
        />
      )
    default:
      return <p>Unknown Voucher Type: {voucherType}</p>
  }
}

export default VoucherDuplicationContent
