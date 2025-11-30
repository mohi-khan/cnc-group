// 'use client'

// import type { UseFormReturn } from 'react-hook-form'
// import { Button } from '@/components/ui/button'
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { Trash2 } from 'lucide-react'
// import type {
//   CostCenter,
//   JournalEntryWithDetails,
//   AccountsHead,
//   GetDepartment,
//   ResPartner,
// } from '@/utils/type'
// import React, { useCallback, useEffect, useRef, useState } from 'react'
// import { toast } from '@/hooks/use-toast'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import {
//   type ComboboxItem,
//   CustomComboboxWithApi,
// } from '@/utils/custom-combobox-with-api'
// import {
//   getAllChartOfAccounts,
//   getAllCostCenters,
//   getAllDepartments,
//   getPartnerById,
//   getResPartnersBySearch,
// } from '@/api/common-shared-api'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { useRouter } from 'next/navigation'

// // Define the props for the JournalVoucherDetailsSection component
// interface JournalVoucherDetailsSectionProps {
//   form: UseFormReturn<JournalEntryWithDetails>
//   onAddEntry: () => void
//   onRemoveEntry: (index: number) => void
//   isEdit?: boolean
// }

// export function JournalVoucherDetailsSection({
//   form,
//   onRemoveEntry,
//   isEdit = false,
// }: JournalVoucherDetailsSectionProps) {
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)
//   const router = useRouter()

//   const [partnerValue, setPartnerValue] = useState<{
//     id: number | string
//     name: string
//   } | null>(null)

//   const { watch } = form

//   //state variables
//   const [costCenters, setCostCenters] = React.useState<CostCenter[]>([])
//   const [chartOfAccounts, setChartOfAccounts] = React.useState<AccountsHead[]>(
//     []
//   )
//   const [departments, setDepartments] = React.useState<GetDepartment[]>([])
//   const [partners, setPartners] = React.useState<ResPartner[]>([])

//   const newRowRef = useRef<HTMLButtonElement>(null)
//   const entries = form.watch('journalDetails')

//   const searchPartners = async (query: string): Promise<ComboboxItem[]> => {
//     try {
//       const response = await getResPartnersBySearch(query, token)
//       if (response.error || !response.data) {
//         console.error('Error fetching partners:', response.error)
//         return []
//       }
//       return response.data.map((partner) => ({
//         id: partner.id.toString(),
//         name: partner.name || 'Unnamed Partner',
//       }))
//     } catch (error) {
//       console.error('Error fetching partners:', error)
//       return []
//     }
//   }

//   const watchedPartnerId = watch('journalDetails.0.resPartnerId')

//   useEffect(() => {
//     const loadPartner = async () => {
//       if (!watchedPartnerId) {
//         setPartnerValue(null)
//         return
//       }

//       // Check local list first
//       const local = partners.find((p) => p.id === Number(watchedPartnerId))
//       if (local) {
//         setPartnerValue(local)
//         return
//       }

//       // Fetch from API if not found locally
//       const partner = await getPartnerById(Number(watchedPartnerId), token)
//       if (partner?.data) {
//         setPartnerValue({ id: partner.data.id, name: partner.data.name || '' })
//       }
//     }

//     loadPartner()
//   }, [watchedPartnerId, partners, token])

//   // Fetching chart of accounts data
//   const fetchChartOfAccounts = useCallback(async () => {
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
//     } finally {
//     }
//   }, [token, router, setPartners])

//   useEffect(() => {
//     fetchChartOfAccounts()
//     fetchCostCenters()
//     fetchDepartments()
//     fetchgetResPartner()
//   }, [
//     fetchChartOfAccounts,
//     fetchCostCenters,
//     fetchDepartments,
//     fetchgetResPartner,
//   ])

//   useEffect(() => {
//     // to initialize with two rows
//     if (entries.length === 0) {
//       form.setValue('journalDetails', [
//         {
//           accountId: 0,
//           costCenterId: null,
//           departmentId: null,
//           debit: 0,
//           credit: 0,
//           notes: '',
//           createdBy: 60,
//           analyticTags: null,
//           taxId: null,
//           resPartnerId: null,
//         },
//         {
//           accountId: 0,
//           costCenterId: null,
//           departmentId: null,
//           debit: 0,
//           credit: 0,
//           notes: '',
//           createdBy: 60,
//           analyticTags: null,
//           taxId: null,
//           resPartnerId: null,
//         },
//       ])
//     }
//   }, [entries.length, form])

//   // Function to add a new entry to the journal details
//   const addEntry = () => {
//     const currentEntries = [...entries]
//     const firstEntry = currentEntries[0]
//     const newEntry = {
//       // bankaccountid: 0,
//       accountId: 0,
//       debit: 0,
//       credit: 0,
//       notes: '',
//       createdBy: 0,
//       analyticTags: null,
//       taxId: null,
//       resPartnerId: null,
//     }

//     if (firstEntry && firstEntry.debit > 0) {
//       const totalUsedCredit = currentEntries.reduce((sum, entry, index) => {
//         return index === 0 ? sum : sum + entry.credit
//       }, 0)
//       newEntry.credit = firstEntry.debit - totalUsedCredit
//     }

//     form.setValue('journalDetails', [...entries, newEntry])
//   }

//   const handleDebitChange = (index: number, value: string) => {
//     const updatedEntries = [...entries]
//     updatedEntries[index].debit = value === '' ? 0 : Number(value)
//     updatedEntries[index].credit = 0

//     if (index === 0) {
//       const debitValue = value === '' ? 0 : Number(value)
//       let remainingCredit = debitValue

//       // Start from index 1 and distribute remaining amount
//       for (let i = 1; i < updatedEntries.length; i++) {
//         if (i === updatedEntries.length - 1) {
//           // Last entry gets remaining amount
//           updatedEntries[i].credit = Number(remainingCredit.toFixed(2))
//         } else {
//           // Use existing credit value if available, otherwise use remaining credit
//           const existingCredit = updatedEntries[i].credit || 0
//           updatedEntries[i].credit =
//             existingCredit || Number(remainingCredit.toFixed(2))
//         }
//         updatedEntries[i].debit = 0
//         remainingCredit -= updatedEntries[i].credit
//         form.setValue(`journalDetails.${i}.credit`, updatedEntries[i].credit)
//         form.setValue(`journalDetails.${i}.debit`, updatedEntries[i].debit)
//       }
//     }

//     form.setValue('journalDetails', updatedEntries)
//   }

//   const handleCreditChange = (index: number, value: string) => {
//     const updatedEntries = [...entries]
//     updatedEntries[index].credit = value === '' ? 0 : Number(value)
//     updatedEntries[index].debit = 0

//     if (index > 0) {
//       const firstEntryDebit = updatedEntries[0].debit
//       let usedCredit = 0

//       // Calculate used credit from entries 1 to current index
//       for (let i = 1; i <= index; i++) {
//         usedCredit += updatedEntries[i].credit
//       }

//       // Distribute remaining amount to next entries if any
//       const remainingCredit = firstEntryDebit - usedCredit
//       for (let i = index + 1; i < updatedEntries.length; i++) {
//         if (i === updatedEntries.length - 1) {
//           updatedEntries[i].credit = Number(remainingCredit.toFixed(2))
//         } else {
//           updatedEntries[i].credit = 0
//         }
//         updatedEntries[i].debit = 0
//         form.setValue(`journalDetails.${i}.credit`, updatedEntries[i].credit)
//         form.setValue(`journalDetails.${i}.debit`, updatedEntries[i].debit)
//       }
//     }

//     form.setValue('journalDetails', updatedEntries)
//   }

//   // Function to calculate the total debit and credit values
//   const calculateTotals = () => {
//     return entries.reduce(
//       (totals, entry) => {
//         totals.debit += entry.debit
//         totals.credit += entry.credit
//         return totals
//       },
//       { debit: 0, credit: 0 }
//     )
//   }

//   const totals = calculateTotals()
//   // const isBalanced = totals.debit === totals.credit

//   return (
//     <div>
//       <div className="space-y-4 border pb-4 mb-4 rounded-md shadow-md">
//         <div className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-2 items-center text-sm font-medium border-b p-4 bg-slate-200 shadow-md">
//           <div>Account Name</div>
//           <div>Cost Center</div>
//           <div>Unit</div>
//           <div>Partner Name</div>
//           <div>Debit</div>
//           <div>Credit</div>
//           <div>Notes</div>
//           <div>Action</div>
//         </div>
//         {entries.map((_, index) => {
//           // Get the selected account ID and find the account to check withholdingTax
//           const selectedAccountId = form.watch(
//             `journalDetails.${index}.accountId`
//           )
//           const selectedAccount = chartOfAccounts.find(
//             (account) => account.accountId === selectedAccountId
//           )
//           const isPartnerFieldEnabled = selectedAccount?.withholdingTax === true

//           return (
//             <div
//               key={index}
//               className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-2 items-center px-4"
//             >
//               <FormField
//                 control={form.control}
//                 name={`journalDetails.${index}.accountId`}
//                 render={({ field }) => (
//                   <FormItem>
//                     <CustomCombobox
//                       // Convert each chart-of-accounts entry into an object with id and name.
//                       items={chartOfAccounts
//                         .filter((account) => account.isActive)
//                         .map((account) => ({
//                           id: account.accountId,
//                           name: account.name,
//                         }))}
//                       // Set the current value by finding the matching account.
//                       value={
//                         field.value
//                           ? {
//                               id: field.value,
//                               name:
//                                 chartOfAccounts.find(
//                                   (account) => account.accountId === field.value
//                                 )?.name || '',
//                             }
//                           : null
//                       }
//                       onChange={(selectedItem) => {
//                         const newAccountId = selectedItem?.id || null
//                         field.onChange(newAccountId)

//                         // Clear resPartnerId if the new account doesn't have withholdingTax
//                         if (newAccountId) {
//                           const newAccount = chartOfAccounts.find(
//                             (account) => account.accountId === newAccountId
//                           )
//                           if (!newAccount?.withholdingTax) {
//                             form.setValue(
//                               `journalDetails.${index}.resPartnerId`,
//                               null
//                             )
//                           }
//                         } else {
//                           form.setValue(
//                             `journalDetails.${index}.resPartnerId`,
//                             null
//                           )
//                         }
//                       }}
//                       placeholder="Select an account"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name={`journalDetails.${index}.costCenterId`}
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <CustomCombobox
//                         items={costCenters
//                           .filter((center) => center.isActive)
//                           .map((center) => ({
//                             id: center.costCenterId.toString(),
//                             name:
//                               center.costCenterName || 'Unnamed Cost Center',
//                           }))}
//                         value={
//                           field.value
//                             ? {
//                                 id: field.value.toString(),
//                                 name:
//                                   costCenters.find(
//                                     (c) => c.costCenterId === field.value
//                                   )?.costCenterName || '',
//                               }
//                             : null
//                         }
//                         onChange={(value) =>
//                           field.onChange(
//                             value ? Number.parseInt(value.id, 10) : null
//                           )
//                         }
//                         placeholder="Select cost center"
//                       />
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name={`journalDetails.${index}.departmentId`}
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <CustomCombobox
//                         items={departments
//                           .filter((department) => department.isActive)
//                           .map((department) => ({
//                             id: department.departmentID.toString(),
//                             name: department.departmentName || 'Unnamed Unit',
//                           }))}
//                         value={
//                           field.value
//                             ? {
//                                 id: field.value.toString(),
//                                 name:
//                                   departments.find(
//                                     (d) => d.departmentID === field.value
//                                   )?.departmentName || '',
//                               }
//                             : null
//                         }
//                         onChange={(value) =>
//                           field.onChange(
//                             value ? Number.parseInt(value.id, 10) : null
//                           )
//                         }
//                         placeholder="Select unit"
//                       />
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name={`journalDetails.${index}.resPartnerId`}
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <div
//                         className={`${!isPartnerFieldEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
//                       >
//                         <CustomComboboxWithApi
//                           items={partners.map((partner) => ({
//                             id: partner.id.toString(),
//                             name: partner.name || '',
//                           }))}
//                           value={
//                             field.value
//                               ? (partners.find(
//                                   (p) => p.id === Number(field.value)
//                                 ) ?? {
//                                   id: field.value,
//                                   name: partnerValue?.name || '',
//                                 })
//                               : null
//                           }
//                           onChange={(item) => {
//                             /// console.log('On Change',item)
//                             field.onChange(
//                               item ? Number.parseInt(String(item.id)) : null
//                             )
//                           }}
//                           placeholder="Select partner"
//                           searchFunction={searchPartners}
//                           fetchByIdFunction={async (id) => {
//                             const numericId: number =
//                               typeof id === 'string' && /^\d+$/.test(id)
//                                 ? parseInt(id, 10)
//                                 : (id as number)
//                             console.log(id)
//                             const partner = await getPartnerById(
//                               numericId,
//                               token
//                             ) // <- implement API
//                             console.log(partner.data)
//                             return partner?.data
//                               ? {
//                                   id: partner.data.id.toString(),
//                                   name: partner.data.name ?? '',
//                                 }
//                               : null
//                           }}
//                           // disabled={!isPartnerFieldEnabled} // Removed as 'isPartnerFieldEnabled' is not defined
//                         />
//                       </div>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name={`journalDetails.${index}.debit`}
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         {...field}
//                         value={field.value === 0 ? '' : field.value}
//                         onChange={(e) =>
//                           handleDebitChange(index, e.target.value)
//                         }
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name={`journalDetails.${index}.credit`}
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         {...field}

//                         value={field.value === 0 ? '' : field.value}
//                         onChange={(e) =>
//                           handleCreditChange(index, e.target.value)
//                         }
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name={`journalDetails.${index}.notes`}
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <Input {...field} value={field.value || ''} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <div className="">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   size="icon"
//                   onClick={() => onRemoveEntry(index)}
//                   disabled={entries.length <= 2}
//                 >
//                   <Trash2 className="w-10 h-10" />
//                 </Button>
//               </div>
//             </div>
//           )
//         })}
//       </div>
//       {!isEdit && (
//         <Button type="button" variant="outline" onClick={addEntry}>
//           Add Another
//         </Button>
//       )}
//       <div className="flex justify-between items-center pt-4">
//         <div>
//           <p>Total Debit: {totals.debit}</p>
//           <p>Total Credit: {totals.credit}</p>
//         </div>
//         {/* <div>
//           {!isBalanced && (
//             <p className="text-red-500">
//               Debit and Credit totals must be equal to post/draft the voucher.
//             </p>
//           )}
//         </div> */}
//       </div>
//     </div>
//   )
// }

'use client'

import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import type {
  CostCenter,
  JournalEntryWithDetails,
  AccountsHead,
  GetDepartment,
  ResPartner,
  Employee,
} from '@/utils/type'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { CustomCombobox } from '@/utils/custom-combobox'
import {
  type ComboboxItem,
  CustomComboboxWithApi,
} from '@/utils/custom-combobox-with-api'
import {
  getAllChartOfAccounts,
  getAllCostCenters,
  getAllDepartments,
  getPartnerById,
  getResPartnersBySearch,
} from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { getCompanyWiseChartOfAccounts } from '@/api/chart-of-accounts-api'

// Define the props for the JournalVoucherDetailsSection component
interface JournalVoucherDetailsSectionProps {
  form: UseFormReturn<JournalEntryWithDetails>
  onAddEntry: () => void
  onRemoveEntry: (index: number) => void
  isEdit?: boolean
  employees: Employee[]
}

export function JournalVoucherDetailsSection({
  form,
  onRemoveEntry,
  isEdit = false,
  employees,
}: JournalVoucherDetailsSectionProps) {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [partnerValue, setPartnerValue] = useState<{
    id: number | string
    name: string
  } | null>(null)

  const { watch } = form

  //state variables
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([])
  const [chartOfAccounts, setChartOfAccounts] = React.useState<AccountsHead[]>(
    []
  )
  const [departments, setDepartments] = React.useState<GetDepartment[]>([])
  const [partners, setPartners] = React.useState<ResPartner[]>([])
  const [companyChartOfAccount, setCompanyChartOfAccount] = useState<any[]>([])
  const [companyFilteredAccounts, setCompanyFilteredAccounts] = useState<any[]>(
    []
  )

  const newRowRef = useRef<HTMLButtonElement>(null)
  const entries = form.watch('journalDetails')

  const searchPartners = async (query: string): Promise<ComboboxItem[]> => {
    try {
      const response = await getResPartnersBySearch(query, token)
      if (response.error || !response.data) {
        console.error('Error fetching partners:', response.error)
        return []
      }
      return response.data.map((partner) => ({
        id: partner.id.toString(),
        name: partner.name || 'Unnamed Partner',
      }))
    } catch (error) {
      console.error('Error fetching partners:', error)
      return []
    }
  }

  const watchedPartnerId = watch('journalDetails.0.resPartnerId')

  useEffect(() => {
    const loadPartner = async () => {
      if (!watchedPartnerId) {
        setPartnerValue(null)
        return
      }

      // Check local list first
      const local = partners.find((p) => p.id === Number(watchedPartnerId))
      if (local) {
        setPartnerValue(local)
        return
      }

      // Fetch from API if not found locally
      const partner = await getPartnerById(Number(watchedPartnerId), token)
      if (partner?.data) {
        setPartnerValue({ id: partner.data.id, name: partner.data.name || '' })
      }
    }

    loadPartner()
  }, [watchedPartnerId, partners, token])

  // Fetching chart of accounts data
  const fetchChartOfAccounts = useCallback(async () => {
    const response = await getAllChartOfAccounts(token)
    if (response.error || !response.data) {
      console.error('Error getting Chart Of accounts:', response.error)
      toast({
        title: 'Error',
        description:
          response.error?.message || 'Failed to get Chart Of accounts',
      })
    } else {
      const filteredCoa = response.data?.filter((account) => {
        return account.isGroup === false
      })
      setChartOfAccounts(filteredCoa)
    }
  }, [token])

  // Fetching cost centers data
  const fetchCostCenters = useCallback(async () => {
    const data = await getAllCostCenters(token)
    if (data.error || !data.data) {
      console.error('Error getting cost centers:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get cost centers',
      })
    } else {
      setCostCenters(data.data)
    }
  }, [token])

  // Fetching departments data
  const fetchDepartments = useCallback(async () => {
    const response = await getAllDepartments(token)
    if (response.error || !response.data) {
      console.error('Error getting departments:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get departments',
      })
    } else {
      setDepartments(response.data)
    }
  }, [token])

  const fetchgetResPartner = useCallback(async () => {
    const search = ''

    if (!token) return
    try {
      const response = await getResPartnersBySearch(search, token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')

        return
      } else if (response.error || !response.data) {
        console.error('Error getting partners:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to load partners',
        })
        setPartners([])
        return
      } else {
        setPartners(response.data)
      }
    } catch (error) {
      console.error('Error getting partners:', error)
      toast({
        title: 'Error',
        description: 'Failed to load partners',
      })
      setPartners([])
    } finally {
    }
  }, [token, router, setPartners])

  const fetchgetCompanyChartOfAccounts = useCallback(async () => {
    if (!token) return
    try {
      const response = await getCompanyWiseChartOfAccounts(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (response.error || !response.data) {
        console.error(
          'Error getting company chart of accounts:',
          response.error
        )
        toast({
          title: 'Error',
          description:
            response.error?.message ||
            'Failed to load company chart of accounts',
        })
        setCompanyChartOfAccount([])
        return
      } else {
        setCompanyChartOfAccount(response.data)
        console.log('Company Chart of Accounts:', response.data)
      }
    } catch (error) {
      console.error('Error getting company chart of accounts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load company chart of accounts',
      })
      setCompanyChartOfAccount([])
    }
  }, [token, router])

  useEffect(() => {
    fetchChartOfAccounts()
    fetchCostCenters()
    fetchDepartments()
    fetchgetResPartner()
    fetchgetCompanyChartOfAccounts()
  }, [
    fetchChartOfAccounts,
    fetchCostCenters,
    fetchDepartments,
    fetchgetResPartner,
    fetchgetCompanyChartOfAccounts,
  ])

  // Filter accounts based on selected company
  useEffect(() => {
    const subscription = form.watch((value) => {
      const selectedCompanyId = value.journalEntry?.companyId

      console.log('🔍 Company Selection Debug:')
      console.log('Selected Company ID:', selectedCompanyId)
      console.log('Company Chart Mappings:', companyChartOfAccount)
      console.log('All Chart of Accounts:', chartOfAccounts)

      if (!selectedCompanyId) {
        console.log('⚠️ No company selected - setting empty array')
        setCompanyFilteredAccounts([])
        return
      }

      if (!companyChartOfAccount.length) {
        console.log('⚠️ No company chart mappings - setting empty array')
        setCompanyFilteredAccounts([])
        return
      }

      if (!chartOfAccounts.length) {
        console.log('⚠️ No chart of accounts loaded - setting empty array')
        setCompanyFilteredAccounts([])
        return
      }

      const companyAccountIds = companyChartOfAccount
        .filter((mapping) => {
          console.log(
            `Checking mapping: companyId ${mapping.companyId} === ${selectedCompanyId}?`,
            mapping.companyId === selectedCompanyId
          )
          return mapping.companyId === selectedCompanyId
        })
        .map((mapping) => mapping.chartOfAccountId)

      console.log('📋 Account IDs for selected company:', companyAccountIds)

      const filtered = chartOfAccounts.filter((account) => {
        const isIncluded = companyAccountIds.includes(account.accountId)
        const isNotGroup = account.isGroup === false
        if (isIncluded && isNotGroup) {
          console.log(
            `✓ Including account: ${account.name} (ID: ${account.accountId})`
          )
        }
        return isIncluded && isNotGroup
      })

      console.log('✅ Filtered Accounts for Details:', filtered)
      console.log('Total accounts found:', filtered.length)

      setCompanyFilteredAccounts(filtered)
    })

    return () => subscription.unsubscribe()
  }, [form, companyChartOfAccount, chartOfAccounts])

  // Trigger initial filter when data loads
  useEffect(() => {
    const selectedCompanyId = form.getValues('journalEntry.companyId')
    if (
      selectedCompanyId &&
      companyChartOfAccount.length &&
      chartOfAccounts.length
    ) {
      console.log('🔄 Initial trigger for company:', selectedCompanyId)
      const companyAccountIds = companyChartOfAccount
        .filter((mapping) => mapping.companyId === selectedCompanyId)
        .map((mapping) => mapping.chartOfAccountId)

      const filtered = chartOfAccounts.filter(
        (account) =>
          companyAccountIds.includes(account.accountId) &&
          account.isGroup === false
      )

      setCompanyFilteredAccounts(filtered)
    }
  }, [companyChartOfAccount, chartOfAccounts, form])

  useEffect(() => {
    // to initialize with two rows
    if (entries.length === 0) {
      form.setValue('journalDetails', [
        {
          accountId: 0,
          costCenterId: null,
          departmentId: null,
          debit: 0,
          credit: 0,
          notes: '',
          createdBy: 60,
          analyticTags: null,
          taxId: null,
          resPartnerId: null,
        },
        {
          accountId: 0,
          costCenterId: null,
          departmentId: null,
          debit: 0,
          credit: 0,
          notes: '',
          createdBy: 60,
          analyticTags: null,
          taxId: null,
          resPartnerId: null,
        },
      ])
    }
  }, [entries.length, form])

  // Function to add a new entry to the journal details
  const addEntry = () => {
    const currentEntries = [...entries]
    const firstEntry = currentEntries[0]
    const newEntry = {
      // bankaccountid: 0,
      accountId: 0,
      debit: 0,
      credit: 0,
      notes: '',
      createdBy: 0,
      analyticTags: null,
      taxId: null,
      resPartnerId: null,
    }

    if (firstEntry && firstEntry.debit > 0) {
      const totalUsedCredit = currentEntries.reduce((sum, entry, index) => {
        return index === 0 ? sum : sum + entry.credit
      }, 0)
      newEntry.credit = firstEntry.debit - totalUsedCredit
    }

    form.setValue('journalDetails', [...entries, newEntry])
  }

  const handleDebitChange = (index: number, value: string) => {
    const updatedEntries = [...entries]
    updatedEntries[index].debit = value === '' ? 0 : Number(value)
    updatedEntries[index].credit = 0

    if (index === 0) {
      const debitValue = value === '' ? 0 : Number(value)
      let remainingCredit = debitValue

      // Start from index 1 and distribute remaining amount
      for (let i = 1; i < updatedEntries.length; i++) {
        if (i === updatedEntries.length - 1) {
          // Last entry gets remaining amount
          updatedEntries[i].credit = Number(remainingCredit.toFixed(2))
        } else {
          // Use existing credit value if available, otherwise use remaining credit
          const existingCredit = updatedEntries[i].credit || 0
          updatedEntries[i].credit =
            existingCredit || Number(remainingCredit.toFixed(2))
        }
        updatedEntries[i].debit = 0
        remainingCredit -= updatedEntries[i].credit
        form.setValue(`journalDetails.${i}.credit`, updatedEntries[i].credit)
        form.setValue(`journalDetails.${i}.debit`, updatedEntries[i].debit)
      }
    }

    form.setValue('journalDetails', updatedEntries)
  }

  const handleCreditChange = (index: number, value: string) => {
    const updatedEntries = [...entries]
    updatedEntries[index].credit = value === '' ? 0 : Number(value)
    updatedEntries[index].debit = 0

    if (index > 0) {
      const firstEntryDebit = updatedEntries[0].debit
      let usedCredit = 0

      // Calculate used credit from entries 1 to current index
      for (let i = 1; i <= index; i++) {
        usedCredit += updatedEntries[i].credit
      }

      // Distribute remaining amount to next entries if any
      const remainingCredit = firstEntryDebit - usedCredit
      for (let i = index + 1; i < updatedEntries.length; i++) {
        if (i === updatedEntries.length - 1) {
          updatedEntries[i].credit = Number(remainingCredit.toFixed(2))
        } else {
          updatedEntries[i].credit = 0
        }
        updatedEntries[i].debit = 0
        form.setValue(`journalDetails.${i}.credit`, updatedEntries[i].credit)
        form.setValue(`journalDetails.${i}.debit`, updatedEntries[i].debit)
      }
    }

    form.setValue('journalDetails', updatedEntries)
  }

  // Function to calculate the total debit and credit values
  const calculateTotals = () => {
    return entries.reduce(
      (totals, entry) => {
        totals.debit += entry.debit
        totals.credit += entry.credit
        return totals
      },
      { debit: 0, credit: 0 }
    )
  }

  const totals = calculateTotals()
  // const selectedCompanyId = form.watch('journalEntry.companyId')

  const selectedCompanyId = form.watch('journalEntry.companyId')
  const isCompanySelected = !!selectedCompanyId

  return (
    <div>
      {!selectedCompanyId && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
          ⚠️ Please select a company first to see available chart of accounts
        </div>
      )}
      <div className="space-y-4 border pb-4 mb-4 rounded-md shadow-md">
        <div className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-2 items-center text-sm font-medium border-b p-4 bg-slate-200 shadow-md">
          <div>Account Name</div>
          <div>Cost Center</div>
          <div>Unit</div>
          <div>Employee</div>
          <div>Partner Name</div>
          <div>Debit</div>
          <div>Credit</div>
          <div>Notes</div>
          <div>Action</div>
        </div>
        {entries.map((_, index) => {
          // Get the selected account ID and find the account to check withholdingTax
          const selectedAccountId = form.watch(
            `journalDetails.${index}.accountId`
          )
          const selectedAccount = companyFilteredAccounts.find(
            (account) => account.accountId === selectedAccountId
          )
          const isPartnerFieldEnabled = selectedAccount?.withholdingTax === true

          return (
            <div
              key={index}
              className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-2 items-center px-4"
            >
              <FormField
                control={form.control}
                name={`journalDetails.${index}.accountId`}
                render={({ field }) => (
                  <FormItem>
                    <CustomCombobox
                      // Convert each chart-of-accounts entry into an object with id and name.
                      items={companyFilteredAccounts
                        .filter((account) => account.isActive)
                        .map((account) => ({
                          id: account.accountId,
                          name: account.name,
                        }))}
                      // Set the current value by finding the matching account.
                      value={
                        field.value
                          ? {
                              id: field.value,
                              name:
                                companyFilteredAccounts.find(
                                  (account) => account.accountId === field.value
                                )?.name || '',
                            }
                          : null
                      }
                      onChange={(selectedItem) => {
                        const newAccountId = selectedItem?.id || null
                        field.onChange(newAccountId)

                        // Clear resPartnerId if the new account doesn't have withholdingTax
                        if (newAccountId) {
                          const newAccount = companyFilteredAccounts.find(
                            (account) => account.accountId === newAccountId
                          )
                          if (!newAccount?.withholdingTax) {
                            form.setValue(
                              `journalDetails.${index}.resPartnerId`,
                              null
                            )
                          }
                        } else {
                          form.setValue(
                            `journalDetails.${index}.resPartnerId`,
                            null
                          )
                        }
                      }}
                      placeholder={
                        !selectedCompanyId
                          ? 'Select company first'
                          : companyFilteredAccounts.length === 0
                            ? 'No accounts for this company'
                            : 'Select an account'
                      }
                      disabled={
                        !selectedCompanyId ||
                        companyFilteredAccounts.length === 0
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`journalDetails.${index}.costCenterId`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CustomCombobox
                        items={costCenters
                          .filter((center) => center.isActive)
                          .map((center) => ({
                            id: center.costCenterId.toString(),
                            name:
                              center.costCenterName || 'Unnamed Cost Center',
                          }))}
                        value={
                          field.value
                            ? {
                                id: field.value.toString(),
                                name:
                                  costCenters.find(
                                    (c) => c.costCenterId === field.value
                                  )?.costCenterName || '',
                              }
                            : null
                        }
                        onChange={(value) =>
                          field.onChange(
                            value ? Number.parseInt(value.id, 10) : null
                          )
                        }
                        placeholder="Select cost center"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`journalDetails.${index}.departmentId`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CustomCombobox
                        items={departments
                          .filter(
                            (department) =>
                              department.isActive &&
                              department.companyCode === selectedCompanyId
                          )
                          .map((department) => ({
                            id: department.departmentID.toString(),
                            name:
                              department.departmentName || 'Unnamed Department',
                          }))}
                        value={
                          field.value
                            ? {
                                id: field.value.toString(),
                                name:
                                  departments.find(
                                    (d) => d.departmentID === field.value
                                  )?.departmentName || '',
                              }
                            : null
                        }
                        onChange={(value) =>
                          field.onChange(
                            value ? Number.parseInt(value.id, 10) : null
                          )
                        }
                        placeholder={
                          !isCompanySelected
                            ? 'Select company first'
                            : departments.filter(
                                  (d) => d.companyCode === selectedCompanyId
                                ).length === 0
                              ? 'No departments for this company'
                              : 'Select a department'
                        }
                        disabled={
                          !isCompanySelected ||
                          departments.filter(
                            (d) => d.companyCode === selectedCompanyId
                          ).length === 0
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`journalDetails.${index}.employeeId`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CustomCombobox
                        items={employees.map((employee) => ({
                          id: employee.id.toString(),
                          name: `${employee.employeeName} (${employee.employeeId})`, // 👈 Show both,
                        }))}
                        value={
                          field.value
                            ? {
                                id: field.value.toString(),
                                name:
                                  employees.find((e) => e.id === field.value)
                                    ?.employeeName || '',
                              }
                            : null
                        }
                        onChange={(value) =>
                          field.onChange(
                            value ? Number.parseInt(value.id, 10) : null
                          )
                        }
                        placeholder="Select an employee"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`journalDetails.${index}.resPartnerId`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div
                        className={`${!isPartnerFieldEnabled ? 'cursor-not-allowed' : ''}`}
                      >
                        <CustomComboboxWithApi
                          items={partners.map((partner) => ({
                            id: partner.id.toString(),
                            name: partner.name || '',
                          }))}
                          value={
                            field.value
                              ? (partners.find(
                                  (p) => p.id === Number(field.value)
                                ) ?? {
                                  id: field.value,
                                  name: partnerValue?.name || '',
                                })
                              : null
                          }
                          onChange={(item) => {
                            /// console.log('On Change',item)
                            field.onChange(
                              item ? Number.parseInt(String(item.id)) : null
                            )
                          }}
                          placeholder="Select partner"
                          searchFunction={searchPartners}
                          fetchByIdFunction={async (id) => {
                            const numericId: number =
                              typeof id === 'string' && /^\d+$/.test(id)
                                ? parseInt(id, 10)
                                : (id as number)
                            console.log(id)
                            const partner = await getPartnerById(
                              numericId,
                              token
                            ) // <- implement API
                            console.log(partner.data)
                            return partner?.data
                              ? {
                                  id: partner.data.id.toString(),
                                  name: partner.data.name ?? '',
                                }
                              : null
                          }}
                          // disabled={!isPartnerFieldEnabled} // Removed as 'isPartnerFieldEnabled' is not defined
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`journalDetails.${index}.debit`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) =>
                          handleDebitChange(index, e.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`journalDetails.${index}.credit`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) =>
                          handleCreditChange(index, e.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`journalDetails.${index}.notes`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onRemoveEntry(index)}
                  disabled={entries.length <= 2}
                >
                  <Trash2 className="w-10 h-10" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
      {!isEdit && (
        <Button type="button" variant="outline" onClick={addEntry}>
          Add Another
        </Button>
      )}
      <div className="flex justify-between items-center pt-4">
        <div>
          <p>Total Debit: {totals.debit}</p>
          <p>Total Credit: {totals.credit}</p>
        </div>
      </div>
    </div>
  )
}
