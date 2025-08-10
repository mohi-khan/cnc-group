'use client'
import {
  VoucherById,
  JournalEntryWithDetails,
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
      date: new Date().toISOString().split('T')[0], // New date for duplication
      journalType: firstEntry.journaltype,
      companyId: firstEntry.companyId || 0, // Added fallback for safety
      locationId: firstEntry.locationId || 0, // Added fallback for safety
      currencyId: firstEntry.currencyId || 1, // Added fallback, assuming 1 is default currency ID
      amountTotal: amountTotal,
      exchangeRate: 0, // Added fallback for safety
      payTo: firstEntry.payTo || '',
      notes: firstEntry.notes || '',
      createdBy: userId,
      state: 0, // Always start as Draft for duplicated vouchers
    },
    journalDetails: voucherData.map((detail) => ({
      accountId: detail.accountId || 0, // Added fallback for safety
      costCenterId: detail.costCenterId || 0,
      departmentId: detail.departmentID || 0,
      debit: detail.debit || 0, // Added fallback for safety
      credit: detail.credit || 0, // Added fallback for safety
      analyticTags: null, // Reset or handle as needed
      taxId: null, // Reset or handle as needed
      resPartnerId: detail.partner || null,
      notes: detail.detail_notes || '',
      type: 'Receipt', // Default for Cash Voucher
      bankAccountId: detail.bankAccountId || 0, // For Bank/Contra Voucher
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
    async (data: JournalEntryWithDetails, resetForm: () => void) => {
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
          handleSubmit={handleJournalSubmit} // Pass the generic submit handler
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

// 'use client'

// import type React from 'react'
// import { useEffect, useCallback, useMemo, useState } from 'react'
// import { toast } from '@/hooks/use-toast'
// import { useAtom } from 'jotai'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { JournalEntryWithDetailsSchema, VoucherTypes } from '@/utils/type'
// import { editJournalMasterWithDetail } from '@/api/journal-voucher-api'
// import type {
//   AccountsHead,
//   BankAccount,
//   CompanyFromLocalstorage,
//   CostCenter,
//   CurrencyType,
//   GetDepartment,
//   JournalEntryWithDetails,
//   LocationFromLocalstorage,
//   ResPartner,
//   VoucherById,
// } from '@/utils/type'
// import CashVoucherMaster from '@/components/cash/cash-voucher/cash-voucher-master'
// import CashVoucherDetails from '@/components/cash/cash-voucher/cash-voucher-details'
// import BankVoucherMaster from '@/components/bank/bank-vouchers/bank-voucher-master'
// import BankVoucherDetails from '@/components/bank/bank-vouchers/bank-voucher-details'
// import { JournalVoucherMasterSection } from '@/components/accounting/journal-voucher/journal-voucher-master-section'
// import { JournalVoucherDetailsSection } from '@/components/accounting/journal-voucher/journal-voucher-details-section'
// import { JournalVoucherSubmit } from '@/components/accounting/journal-voucher/journal-voucher-submit'
// import { ContraVoucherMasterSection } from '@/components/cash/contra-voucher/contra-voucher-master-section'
// import { ContraVoucherDetailsSection } from '@/components/cash/contra-voucher/contra-voucher-details-section'
// import { ContraVoucherSubmit } from '@/components/cash/contra-voucher/contra-voucher-submit'
// import { useForm, useFieldArray } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import type { ComboboxItem } from '@/utils/custom-combobox-with-api'
// import { useRouter } from 'next/navigation'
// import {
//   getAllBankAccounts,
//   getAllChartOfAccounts,
//   getAllCostCenters,
//   getAllCurrency,
//   getAllDepartments,
//   getResPartnersBySearch,
// } from '@/api/common-shared-api'
// import { Button } from '@/components/ui/button'

// interface VoucherEditContentProps {
//   voucherData: VoucherById[]
//   userId: number
//   onClose: () => void
//   // Optional: fire when edit succeeds to let parent refresh
//   onEdited?: (voucherId: number) => void
// }

// // This function is now a pure utility function, no hooks inside
// function transformVoucherDataForEdit(
//   voucherData: VoucherById[],
//   userId: number
// ): {
//   initial: JournalEntryWithDetails | null
//   meta: {
//     voucherId?: number
//     voucherNo?: string
//     companyname?: string
//     location?: string
//     currency?: string
//     reference?: string
//   }
// } {
//   if (!voucherData || voucherData.length === 0) {
//     return { initial: null, meta: {} }
//   }

//   const first = voucherData[0]

//   // Compute totals from the details
//   const totalDebit = voucherData.reduce((sum, d) => sum + (d.debit || 0), 0)
//   const totalCredit = voucherData.reduce((sum, d) => sum + (d.credit || 0), 0)
//   const amountTotal = Math.max(totalDebit, totalCredit)

//   const journalDetails = voucherData.map((detail) => ({
//     accountId: detail.accountId || 0,
//     costCenterId: (detail.costCenterId as number | null | undefined) ?? null,
//     departmentId: (detail.departmentID as number | null | undefined) ?? null,
//     debit: detail.debit || 0,
//     credit: detail.credit || 0,
//     analyticTags: null,
//     taxId: null,
//     resPartnerId:
//       (detail as any).resPartnerId ?? (detail as any).partner ?? null,
//     notes: (detail as any).detail_notes || '',
//     type: 'Receipt', // Often ignored for Journal, required for some cash flows; leave default.
//     bankAccountId: (detail as any).bankAccountId || null,
//     createdBy: userId,
//     balance: (detail as any).balance || 0,
//     updatedBy: (detail as any).updatedBy || userId,
//   }))

//   const initial: JournalEntryWithDetails = {
//     journalEntry: {
//       date: (first as any).date || new Date().toISOString().split('T')[0],
//       journalType: (first as any).journaltype,
//       companyId: (first as any).companyId || 0,
//       locationId: (first as any).locationId || 0,
//       currencyId: (first as any).currencyId || 1,
//       amountTotal,
//       exchangeRate: (first as any).exchangeRate || 1,
//       payTo: (first as any).payTo || '',
//       notes: (first as any).notes || '',
//       createdBy: userId,
//       state: (first as any).state ?? 0,
//     },
//     journalDetails,
//   }

//   return {
//     initial,
//     meta: {
//       voucherId: (first as any).voucherId ?? (first as any).voucherid,
//       voucherNo: (first as any).voucherNo ?? (first as any).voucherno,
//       companyname: (first as any).companyname,
//       location: (first as any).location,
//       currency: (first as any).currency,
//       reference: (first as any).reference,
//     },
//   }
// }

// const VoucherEditContent: React.FC<VoucherEditContentProps> = ({
//   voucherData,
//   userId,
//   onClose,
//   onEdited,
// }) => {
//   // Initialize user data and get token
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)
//   const router = useRouter()

//   const [isSubmitting, setIsSubmitting] = useState(false)

//   // States for fetched data
//   const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
//   const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
//   const [currency, setCurrency] = useState<CurrencyType[]>([])
//   const [bankAccount, setBankAccount] = useState<BankAccount[]>([])
//   const [costCenters, setCostCenters] = useState<CostCenter[]>([])
//   const [chartOfAccounts, setChartOfAccounts] = useState<AccountsHead[]>([])
//   const [departments, setDepartments] = useState<GetDepartment[]>([])
//   const [partners, setPartners] = useState<ResPartner[]>([])

//   // Prepare initial data and meta using the pure transform function
//   const { initial, meta } = useMemo(
//     () => transformVoucherDataForEdit(voucherData, userId),
//     [voucherData, userId]
//   )

//   const voucherType =
//     (initial?.journalEntry.journalType as unknown as VoucherTypes) ?? null

//   // React Hook Form setup
//   const form = useForm<JournalEntryWithDetails>({
//     resolver: zodResolver(JournalEntryWithDetailsSchema),
//     defaultValues: initial || {
//       journalEntry: {
//         date: new Date().toISOString().split('T')[0],
//         journalType: VoucherTypes.JournalVoucher, // Default to JournalVoucher if no initial data
//         companyId: 0,
//         locationId: 0,
//         currencyId: 1,
//         amountTotal: 0,
//         exchangeRate: 1,
//         payTo: '',
//         notes: '',
//         createdBy: userId,
//         state: 0,
//       },
//       journalDetails: [
//         {
//           accountId: 0,
//           costCenterId: null,
//           departmentId: null,
//           debit: 0,
//           credit: 0,
//           analyticTags: null,
//           taxId: null,
//           resPartnerId: null,
//           notes: '',
//           type: 'Receipt',
//           bankaccountid: null,
//           createdBy: userId,
//           // balance: 0,
//           // updatedBy: userId,
//         },
//       ],
//     },
//   })

//   const { fields, append, remove } = useFieldArray({
//     control: form.control,
//     name: 'journalDetails',
//   })

//   // Fetch user companies and locations
//   const fetchUserData = useCallback(() => {
//     if (userData) {
//       setCompanies(userData.userCompanies)
//       setLocations(userData.userLocations)
//     }
//   }, [userData])

//   // Function to fetch currency data
//   const fetchCurrency = useCallback(async () => {
//     if (!token) return
//     const data = await getAllCurrency(token)
//     if (data?.error?.status === 401) {
//       router.push('/unauthorized-access')
//       return
//     } else if (data.error || !data.data) {
//       console.error('Error getting currency:', data.error)
//       toast({
//         title: 'Error',
//         description: data.error?.message || 'Failed to get currency',
//       })
//     } else {
//       setCurrency(data.data)
//     }
//   }, [token, router])

//   const fetchBankAccounts = useCallback(async () => {
//     if (!token) return
//     const data = await getAllBankAccounts(token)
//     if (data?.error?.status === 401) {
//       router.push('/unauthorized-access')
//       return
//     } else if (data.error || !data.data) {
//       console.error('Error getting currency:', data.error)
//       toast({
//         title: 'Error',
//         description: data.error?.message || 'Failed to get currency',
//       })
//     } else {
//       setBankAccount(data.data)
//     }
//   }, [token, router])

//   // Fetching chart of accounts data
//   const fetchChartOfAccounts = useCallback(async () => {
//     if (!token) return
//     const response = await getAllChartOfAccounts(token)
//     if (response.error || !response.data) {
//       console.error('Error getting Chart Of accounts:', response.error)
//       toast({
//         title: 'Error',
//         description:
//           response.error?.message || 'Failed to get Chart Of accounts',
//       })
//     } else {
//       const filteredCoa = response.data?.filter((account) => {
//         return account.isGroup === false
//       })
//       setChartOfAccounts(filteredCoa)
//     }
//   }, [token])

//   // Fetching cost centers data
//   const fetchCostCenters = useCallback(async () => {
//     if (!token) return
//     const data = await getAllCostCenters(token)
//     if (data.error || !data.data) {
//       console.error('Error getting cost centers:', data.error)
//       toast({
//         title: 'Error',
//         description: data.error?.message || 'Failed to get cost centers',
//       })
//     } else {
//       setCostCenters(data.data)
//     }
//   }, [token])

//   // Fetching departments data
//   const fetchDepartments = useCallback(async () => {
//     if (!token) return
//     const response = await getAllDepartments(token)
//     if (response.error || !response.data) {
//       console.error('Error getting departments:', response.error)
//       toast({
//         title: 'Error',
//         description: response.error?.message || 'Failed to get departments',
//       })
//     } else {
//       setDepartments(response.data)
//     }
//   }, [token])

//   const fetchgetResPartner = useCallback(async () => {
//     const search = ''
//     if (!token) return
//     try {
//       const response = await getResPartnersBySearch(search, token)
//       if (response?.error?.status === 401) {
//         router.push('/unauthorized-access')
//         return
//       } else if (response.error || !response.data) {
//         console.error('Error getting partners:', response.error)
//         toast({
//           title: 'Error',
//           description: response.error?.message || 'Failed to load partners',
//         })
//         setPartners([])
//         return
//       } else {
//         setPartners(response.data)
//       }
//     } catch (error) {
//       console.error('Error getting partners:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to load partners',
//       })
//       setPartners([])
//     }
//   }, [token, router])

//   // Effect to fetch all necessary data on component mount
//   useEffect(() => {
//     fetchUserData()
//     fetchCurrency()
//     fetchBankAccounts()
//     fetchChartOfAccounts()
//     fetchCostCenters()
//     fetchDepartments()
//     fetchgetResPartner()
//   }, [
//     fetchUserData,
//     fetchCurrency,
//     fetchBankAccounts,
//     fetchChartOfAccounts,
//     fetchCostCenters,
//     fetchDepartments,
//     fetchgetResPartner,
//   ])

//   // Function to search partners for combobox (if needed by child components)
//   const searchPartners = useCallback(
//     async (query: string): Promise<ComboboxItem[]> => {
//       try {
//         const response = await getResPartnersBySearch(query, token)
//         if (response.error || !response.data) {
//           console.error('Error fetching partners:', response.error)
//           return []
//         }
//         return response.data.map((partner) => ({
//           id: partner.id.toString(),
//           name: partner.name || 'Unnamed Partner',
//         }))
//       } catch (error) {
//         console.error('Error fetching partners:', error)
//         return []
//       }
//     },
//     [token]
//   )

//   // State for BankVoucher (simulating external state, now using fetched partners)
//   const [bankFormState, setBankFormState] = useState({
//     companies: [],
//     locations: [],
//     bankAccounts: [],
//     chartOfAccounts: [],
//     filteredChartOfAccounts: [],
//     costCenters: [],
//     partners: [],
//     departments: [],
//     selectedBankAccount: null,
//     formType: 'Credit',
//     status: 'Draft',
//   })

//   // Update bankFormState when partners data changes
//   useEffect(() => {
//     setBankFormState((prev) => ({ ...prev, partners: partners }))
//   }, [partners])

//   // Handlers for dynamic detail rows
//   const addDetailRow = useCallback(() => {
//     append({
//       accountId: 0,
//       costCenterId: null,
//       departmentId: null,
//       debit: 0,
//       credit: 0,
//       analyticTags: null,
//       taxId: null,
//       resPartnerId: null,
//       notes: '',
//       type: 'Receipt',
//       bankaccountid: null,
//       createdBy: userId,
//       // balance: 0,
//       // updatedBy: userId,
//     })
//   }, [append, userId])

//   const addEntry = addDetailRow // Alias for JournalVoucherDetailsSection
//   const removeEntry = useCallback((index: number) => remove(index), [remove])

//   const handleVoucherTypeChange = useCallback((type: string) => {
//     console.log('Voucher type changed to:', type)
//   }, [])

//   // Submit handler specifically for JournalVoucherPopup editing
//   const handleJournalEditSubmit = useCallback(
//     async (data: JournalEntryWithDetails, resetForm: () => void) => {
//       if (!token) {
//         toast({
//           title: 'Unauthorized',
//           description: 'Missing token',
//           variant: 'destructive',
//         })
//         return
//       }
//       const headerVoucherId =
//         meta.voucherId ??
//         (voucherData[0] as any)?.voucherId ??
//         (voucherData[0] as any)?.voucherid
//       try {
//         setIsSubmitting(true)
//         const apiData = {
//           journalEntry: {
//             id: headerVoucherId,
//             voucherNo: meta.voucherNo || '',
//             date: data.journalEntry.date,
//             journalType: data.journalEntry.journalType,
//             state: data.journalEntry.state ?? 0,
//             companyId: data.journalEntry.companyId,
//             locationId: data.journalEntry.locationId,
//             currencyId: data.journalEntry.currencyId,
//             exchangeRate: data.journalEntry.exchangeRate,
//             amountTotal: data.journalEntry.amountTotal,
//             notes: data.journalEntry.notes ?? undefined,
//             createdBy: data.journalEntry.createdBy,
//             taxTotal: 0,
//             payTo: data.journalEntry.payTo ?? '',
//             reference: meta.reference ?? '',
//           },
//           journalDetails: data.journalDetails.map((detail, idx) => {
//             return {
//               id: idx + 1,
//               voucherId: headerVoucherId,
//               accountId: detail.accountId,
//               costCenterId:
//                 detail.costCenterId !== undefined ? detail.costCenterId : null,
//               departmentId:
//                 detail.departmentId !== undefined ? detail.departmentId : null,
//               resPartnerId:
//                 detail.resPartnerId !== undefined ? detail.resPartnerId : null,
//               debit: detail.debit,
//               credit: detail.credit,
//               notes: detail.notes ?? '',
//               analyticTags: detail.analyticTags ?? null,
//               taxId: detail.taxId !== undefined ? detail.taxId : null,
//               createdBy: detail.createdBy ?? userId,
//             }
//           }),
//         }
//         const response = await editJournalMasterWithDetail(apiData, token)
//         console.log('🚀 ~ VoucherEditContent ~ apiData:', apiData)
//         if (response.error) {
//           toast({
//             title: 'Error',
//             description: response.error?.message || 'Failed to update voucher',
//             variant: 'destructive',
//           })
//           return
//         }
//         toast({
//           title: 'Success',
//           description: 'Voucher updated successfully',
//         })
//         resetForm()
//         onEdited?.(headerVoucherId as number)
//         onClose()
//       } catch (error) {
//         console.error('Error updating voucher:', error)
//         toast({
//           title: 'Error',
//           description: 'Failed to update voucher',
//           variant: 'destructive',
//         })
//       } finally {
//         setIsSubmitting(false)
//       }
//     },
//     [meta, voucherData, token, userId, onClose, onEdited]
//   )

//   // Generic onSubmit handler for all voucher types
//   const onSubmit = useCallback(
//     async (data: JournalEntryWithDetails) => {
//       switch (voucherType) {
//         case VoucherTypes.JournalVoucher:
//           await handleJournalEditSubmit(data, form.reset)
//           break
//         case VoucherTypes.CashVoucher:
//           // Placeholder for Cash Voucher submission logic
//           console.log('Submitting Cash Voucher:', data)
//           toast({
//             title: 'Cash Voucher Submitted (Placeholder)',
//             description: 'This is a dummy submission.',
//           })
//           onClose()
//           break
//         case VoucherTypes.BankVoucher:
//           // Placeholder for Bank Voucher submission logic
//           console.log('Submitting Bank Voucher:', data)
//           toast({
//             title: 'Bank Voucher Submitted (Placeholder)',
//             description: 'This is a dummy submission.',
//           })
//           onClose()
//           break
//         case VoucherTypes.ContraVoucher:
//           // Placeholder for Contra Voucher submission logic
//           console.log('Submitting Contra Voucher:', data)
//           toast({
//             title: 'Contra Voucher Submitted (Placeholder)',
//             description: 'This is a dummy submission.',
//           })
//           onClose()
//           break
//         default:
//           toast({
//             title: 'Error',
//             description: 'Unknown voucher type for submission.',
//             variant: 'destructive',
//           })
//       }
//     },
//     [voucherType, handleJournalEditSubmit, form.reset, onClose]
//   )

//   if (!initial || !voucherType) {
//     return (
//       <p className="text-sm text-muted-foreground">
//         Unable to load voucher for editing.
//       </p>
//     )
//   }

//   // Render the appropriate popup/component for editing
//   switch (voucherType) {
//     case VoucherTypes.CashVoucher:
//       return (
//         <div>
//           <CashVoucherMaster
//             form={form}
//             companies={companies}
//             locations={locations}
//           />
//           <CashVoucherDetails
//             form={form}
//             fields={fields}
//             filteredChartOfAccounts={chartOfAccounts}
//             costCenters={costCenters}
//             departments={departments}
//             partners={partners}
//             addDetailRow={addDetailRow}
//             onSubmit={form.handleSubmit(onSubmit)} // Pass the form's handleSubmit
//             onVoucherTypeChange={handleVoucherTypeChange}
//           />
//         </div>
//       )
//     case VoucherTypes.BankVoucher:
//       return (
//         <div>
//           <BankVoucherMaster
//             form={form}
//             formState={bankFormState}
//             requisition={undefined}
//             setFormState={setBankFormState}
//           />
//           <BankVoucherDetails
//             form={form}
//             formState={bankFormState}
//             requisition={undefined}
//             partners={bankFormState.partners}
//           />
//           {/* Add a submit button for BankVoucher if it's not part of BankVoucherDetails */}
//           <div className="flex justify-end p-4">
//             <Button
//               onClick={form.handleSubmit(onSubmit)}
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? 'Updating...' : 'Update Bank Voucher'}
//             </Button>
//           </div>
//         </div>
//       )
//     case VoucherTypes.JournalVoucher:
//       return (
//         <div>
//           <JournalVoucherMasterSection form={form} />
//           <JournalVoucherDetailsSection
//             form={form}
//             onAddEntry={addEntry}
//             onRemoveEntry={removeEntry}
//           />
//           <JournalVoucherSubmit
//             form={form}
//             onSubmit={form.handleSubmit(onSubmit)}
//             isSubmitting={isSubmitting}
//           />
//         </div>
//       )
//     case VoucherTypes.ContraVoucher:
//       return (
//         <div>
//           <ContraVoucherMasterSection form={form} />
//           <ContraVoucherDetailsSection
//             form={form}
//             onRemoveEntry={removeEntry}
//           />
//           <ContraVoucherSubmit
//             form={form}
//             onSubmit={form.handleSubmit(onSubmit)}
//             isSubmitting={isSubmitting}
//           />
//         </div>
//       )
//     default:
//       return (
//         <p className="text-sm text-muted-foreground">
//           Unknown Voucher Type: {String(voucherType)}
//         </p>
//       )
//   }
// }

// export default VoucherEditContent
