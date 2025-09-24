// 'use client'
// import { useFieldArray, type UseFormReturn } from 'react-hook-form'
// import { Button } from '@/components/ui/button'
// import { FormControl, FormField, FormItem } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import { Trash } from 'lucide-react'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import type { FormStateType, ResPartner } from '@/utils/type'
// import { useCallback, useEffect, useState } from 'react'
// import {
//   type ComboboxItem,
//   CustomComboboxWithApi,
// } from '@/utils/custom-combobox-with-api'
// import {
//   getPartnerById,
//   getResPartnersBySearch,
//   getSettings,
// } from '@/api/common-shared-api'
// import { useAtom } from 'jotai'
// import { tokenAtom } from '@/utils/user'
// import { toast } from '@/hooks/use-toast'

// export default function OpeningBalanceDetails({
//   form,
//   formState,
//   requisition,
//   partners,
//   isFromInvoice = false, // Add this prop to detect if coming from invoice
//   invoicePartnerName = '', // Add this prop to get the invoice partner name
// }: {
//   form: UseFormReturn<any>
//   formState: FormStateType
//   requisition: any
//   partners: ResPartner[]
//   isFromInvoice?: boolean // New prop
//   invoicePartnerName?: string // New prop
// }) {
//   // Destructure the formState to get the filteredChartOfAccounts, costCenters, departments, and partners
//   const { fields, append, remove } = useFieldArray({
//     control: form.control,
//     name: 'journalDetails',
//   })

//   const [token] = useAtom(tokenAtom)

//   const [partnerValue, setPartnerValue] = useState<{
//     id: number | string
//     name: string
//   } | null>(null)
//   const { watch } = form

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

//   // Update amounts when rows are added or removed
//   useEffect(() => {
//     if (fields.length > 0 && fields.length === 1) {
//       // Only auto-distribute when there's exactly one row (initial state)
//       const totalAmount = form.getValues('journalEntry.amountTotal') || 0
//       form.setValue(
//         `journalDetails.0.${formState.formType === 'Credit' ? 'debit' : 'credit'}`,
//         totalAmount
//       )
//     }
//   }, [fields.length, form, formState.formType])

//   useEffect(() => {
//     if (formState.selectedBankAccount?.id) {
//       const currentDetails = form.getValues('journalDetails') || []
//       const updatedDetails = currentDetails.map((detail: any) => ({
//         ...detail,
//         bankaccountid: formState.selectedBankAccount?.id,
//       }))
//       form.setValue('journalDetails', updatedDetails)
//     }
//   }, [formState.selectedBankAccount?.id, form])

//   return (
//     <div>
//       <Table className="border shadow-md">
//         <TableHeader className="bg-slate-200 shadow-md">
//           <TableRow>
//             <TableHead>Account Name</TableHead>
//             <TableHead>Unit</TableHead>
//             <TableHead>Partner Name</TableHead>
//             <TableHead>Cheque Number</TableHead>
//             <TableHead>Amount</TableHead>
//             <TableHead>Action</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {fields.map((field, index) => {
//             // Get the selected account ID and find the account to check withholdingTax
//             const selectedAccountId = form.watch(
//               `journalDetails.${index}.accountId`
//             )
//             const selectedAccount = formState.filteredChartOfAccounts.find(
//               (account) => account.accountId === selectedAccountId
//             )
//             const isPartnerFieldEnabled =
//               selectedAccount?.withholdingTax === true

//             return (
//               <TableRow key={field.id}>
//                 <TableCell>
//                   <FormField
//                     control={form.control}
//                     name={`journalDetails.${index}.accountId`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormControl>
//                           <CustomCombobox
//                             items={formState.filteredChartOfAccounts
//                               .filter((account) => account.isActive)
//                               .map((account) => ({
//                                 id: account.accountId.toString(),
//                                 name: account.name || 'Unnamed Account',
//                               }))}
//                             value={
//                               field.value
//                                 ? {
//                                     id: field.value.toString(),
//                                     name:
//                                       formState.filteredChartOfAccounts.find(
//                                         (a) => a.accountId === field.value
//                                       )?.name || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(value) => {
//                               const newAccountId = value
//                                 ? Number.parseInt(value.id, 10)
//                                 : null
//                               field.onChange(newAccountId)
//                               // Clear resPartnerId if the new account doesn't have withholdingTax (only when not from invoice)
//                               if (!isFromInvoice) {
//                                 if (newAccountId) {
//                                   const newAccount =
//                                     formState.filteredChartOfAccounts.find(
//                                       (account) =>
//                                         account.accountId === newAccountId
//                                     )
//                                   if (!newAccount?.withholdingTax) {
//                                     form.setValue(
//                                       `journalDetails.${index}.resPartnerId`,
//                                       null
//                                     )
//                                   }
//                                 } else {
//                                   form.setValue(
//                                     `journalDetails.${index}.resPartnerId`,
//                                     null
//                                   )
//                                 }
//                               }
//                             }}
//                             placeholder="Select account"
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                 </TableCell>

//                 <TableCell>
//                   <FormField
//                     control={form.control}
//                     name={`journalDetails.${index}.departmentId`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormControl>
//                           <CustomCombobox
//                             items={formState.departments
//                               .filter((department) => department.isActive)
//                               .map((department) => ({
//                                 id: department.departmentID.toString(),
//                                 name:
//                                   department.departmentName || 'Unnamed Unit',
//                               }))}
//                             value={
//                               field.value
//                                 ? {
//                                     id: field.value.toString(),
//                                     name:
//                                       formState.departments.find(
//                                         (d) => d.departmentID === field.value
//                                       )?.departmentName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(value) =>
//                               field.onChange(
//                                 value ? Number.parseInt(value.id, 10) : null
//                               )
//                             }
//                             placeholder="Select unit"
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                 </TableCell>
//                 <TableCell>
//                   <FormField
//                     control={form.control}
//                     name={`journalDetails.${index}.resPartnerId`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormControl>
//                           {isFromInvoice ? (
//                             // When coming from invoice, show partner name directly (no search)
//                             <Input
//                               value={invoicePartnerName}
//                               disabled
//                               className="bg-gray-100 cursor-not-allowed"
//                               placeholder="Partner name from invoice"
//                             />
//                           ) : (
//                             // Normal bank voucher - use search combobox with withholding tax logic
//                             <div
//                               className={`${!isPartnerFieldEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
//                             >
//                               <CustomComboboxWithApi
//                                 items={partners.map((partner) => ({
//                                   id: partner.id.toString(),
//                                   name: partner.name || '',
//                                 }))}
//                                 value={
//                                   field.value
//                                     ? (partners.find(
//                                         (p) => p.id === Number(field.value)
//                                       ) ?? {
//                                         id: field.value,
//                                         name: partnerValue?.name || '',
//                                       })
//                                     : null
//                                 }
//                                 onChange={(item) => {
//                                   /// console.log('On Change',item)
//                                   field.onChange(
//                                     item ? Number.parseInt(item.id) : null
//                                   )
//                                 }}
//                                 placeholder="Select partner"
//                                 searchFunction={searchPartners}
//                                 fetchByIdFunction={async (id) => {
//                                   const numericId: number =
//                                     typeof id === 'string' && /^\d+$/.test(id)
//                                       ? parseInt(id, 10)
//                                       : (id as number)
//                                   console.log(id)
//                                   const partner = await getPartnerById(
//                                     numericId,
//                                     token
//                                   ) // <- implement API
//                                   console.log(partner.data)
//                                   return partner?.data
//                                     ? {
//                                         id: partner.data.id.toString(),
//                                         name: partner.data.name ?? '',
//                                       }
//                                     : null
//                                 }}
//                                 // disabled={!isPartnerFieldEnabled} // Removed as 'isPartnerFieldEnabled' is not defined
//                               />
//                             </div>
//                           )}
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                 </TableCell>
//                 <TableCell>
//                   <FormField
//                     control={form.control}
//                     name={`journalDetails.${index}.notes`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormControl>
//                           <Input {...field} placeholder="Enter cheque no" />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                 </TableCell>
//                 <TableCell>
//                   <FormField
//                     control={form.control}
//                     name={`journalDetails.${index}.${formState.formType === 'Credit' ? 'debit' : 'credit'}`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             placeholder="Enter amount"
//                             {...field}
//                             onChange={(e) =>
//                               field.onChange(Number.parseFloat(e.target.value))
//                             }
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                 </TableCell>
//                 <TableCell>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => remove(index)}
//                   >
//                     <Trash className="h-4 w-4" />
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             )
//           })}
//         </TableBody>
//       </Table>
//       <Button
//         type="button"
//         variant="outline"
//         size="sm"
//         className="mt-5 bg-transparent"
//         onClick={() => {
//           const totalAmount = form.getValues('journalEntry.amountTotal') || 0
//           const currentDetails = form.getValues('journalDetails') || []
//           // Calculate the sum of all existing amounts
//           const currentField =
//             formState.formType === 'Credit' ? 'debit' : 'credit'
//           const usedAmount = currentDetails.reduce(
//             (sum: number, detail: Record<string, number>) =>
//               sum + (detail[currentField] || 0),
//             0
//           )
//           // Calculate the remaining amount
//           const remainingAmount = totalAmount - usedAmount
//           // Add new row with the remaining amount
//           append({
//             voucherId: 0,
//             accountId: 0,
//             costCenterId: null,
//             departmentId: null,
//             debit: formState.formType === 'Credit' ? remainingAmount : 0,
//             credit: formState.formType === 'Debit' ? remainingAmount : 0,
//             analyticTags: null,
//             taxId: null,
//             resPartnerId: null,
//             notes: '',
//             createdBy: 0,
//             bankaccountid: formState.selectedBankAccount?.id || null, // Add bank account ID to new rows
//           })
//         }}
//       >
//         Add Another
//       </Button>
//     </div>
//   )
// }

'use client'
import { useFieldArray, type UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash } from 'lucide-react'
import { CustomCombobox } from '@/utils/custom-combobox'
import type { FormStateType, ResPartner } from '@/utils/type'
import { useEffect, useState } from 'react'
import {
  type ComboboxItem,
  CustomComboboxWithApi,
} from '@/utils/custom-combobox-with-api'
import { getPartnerById, getResPartnersBySearch } from '@/api/common-shared-api'
import { useAtom } from 'jotai'
import { tokenAtom } from '@/utils/user'

export default function OpeningBalanceDetails({
  form,
  formState,
  requisition,
  partners,
  isFromInvoice = false,
  invoicePartnerName = '',
}: {
  form: UseFormReturn<any>
  formState: FormStateType
  requisition: any
  partners: ResPartner[]
  isFromInvoice?: boolean
  invoicePartnerName?: string
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'journalDetails',
  })

  const [token] = useAtom(tokenAtom)

  const [partnerValue, setPartnerValue] = useState<{
    id: number | string
    name: string
  } | null>(null)
  const { watch } = form

  const searchPartners = async (query: string): Promise<ComboboxItem[]> => {
    try {
      const response = await getResPartnersBySearch(query, token)
      if (response.error || !response.data) return []
      return response.data.map((partner) => ({
        id: partner.id.toString(),
        name: partner.name || 'Unnamed Partner',
      }))
    } catch {
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

      const local = partners.find((p) => p.id === Number(watchedPartnerId))
      if (local) {
        setPartnerValue(local)
        return
      }

      const partner = await getPartnerById(Number(watchedPartnerId), token)
      if (partner?.data) {
        setPartnerValue({ id: partner.data.id, name: partner.data.name || '' })
      }
    }

    loadPartner()
  }, [watchedPartnerId, partners, token])

  useEffect(() => {
    if (fields.length > 0 && fields.length === 1) {
      const totalAmount = form.getValues('journalEntry.amountTotal') || 0
      form.setValue(
        `journalDetails.0.${formState.formType === 'Credit' ? 'debit' : 'credit'}`,
        totalAmount
      )
    }
  }, [fields.length, form, formState.formType])

  useEffect(() => {
    if (formState.selectedBankAccount?.id) {
      const currentDetails = form.getValues('journalDetails') || []
      const updatedDetails = currentDetails.map((detail: any) => ({
        ...detail,
        bankaccountid: formState.selectedBankAccount?.id,
      }))
      form.setValue('journalDetails', updatedDetails)
    }
  }, [formState.selectedBankAccount?.id, form])

  return (
    <div>
      <Table className="border shadow-md">
        <TableHeader className="bg-slate-200 shadow-md">
          <TableRow>
            <TableHead>Bank Account</TableHead>
            <TableHead>Account Name</TableHead>
            <TableHead>Cost Center</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Partner Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, index) => {
            const selectedAccountId = form.watch(
              `journalDetails.${index}.accountId`
            )
            const selectedAccount = formState.filteredChartOfAccounts.find(
              (account) => account.accountId === selectedAccountId
            )
            const isPartnerFieldEnabled =
              selectedAccount?.withholdingTax === true

            return (
              <TableRow key={field.id}>
                {/* Bank Account */}
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.bankaccountid`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomCombobox
                            items={formState.bankAccounts
                              .filter(
                                (acc) =>
                                  acc.isActive &&
                                  acc.companyId ===
                                    form.watch('journalEntry.companyId')
                              )
                              .map((acc) => ({
                                id: acc.id.toString(),
                                name: `${acc.bankName} - ${acc.accountName} (${acc.accountNumber})`,
                              }))}
                            value={
                              field.value
                                ? {
                                    id: field.value.toString(),
                                    name: formState.bankAccounts.find(
                                      (b) => b.id === field.value
                                    )
                                      ? `${formState.bankAccounts.find((b) => b.id === field.value)?.bankName} - ${
                                          formState.bankAccounts.find(
                                            (b) => b.id === field.value
                                          )?.accountName
                                        } (${
                                          formState.bankAccounts.find(
                                            (b) => b.id === field.value
                                          )?.accountNumber
                                        })`
                                      : '',
                                  }
                                : null
                            }
                            onChange={(value) => {
                              const selectedId = value ? Number(value.id) : null
                              field.onChange(selectedId)

                              if (selectedId) {
                                const selectedBank =
                                  formState.bankAccounts.find(
                                    (acc) => acc.id === selectedId
                                  )
                                // If bank has GL account → map it to accountId
                                if (selectedBank?.glAccountId) {
                                  form.setValue(
                                    `journalDetails.${index}.accountId`,
                                    selectedBank.glAccountId
                                  )
                                }
                              }
                            }}
                            placeholder={
                              form.watch('journalEntry.companyId')
                                ? 'Select a Bank Account'
                                : 'Select company first'
                            }
                            disabled={
                              !form.watch('journalEntry.companyId') ||
                              formState.bankAccounts.length === 0
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>

                {/* Account Name */}
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.accountId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomCombobox
                            items={formState.filteredChartOfAccounts
                              .filter((account) => account.isActive)
                              .map((account) => ({
                                id: account.accountId.toString(),
                                name: account.name || 'Unnamed Account',
                              }))}
                            value={
                              field.value
                                ? {
                                    id: field.value.toString(),
                                    name:
                                      formState.filteredChartOfAccounts.find(
                                        (a) => a.accountId === field.value
                                      )?.name || '',
                                  }
                                : null
                            }
                            onChange={(value) => {
                              const newAccountId = value
                                ? Number.parseInt(value.id, 10)
                                : null
                              field.onChange(newAccountId)
                              if (!isFromInvoice) {
                                if (newAccountId) {
                                  const newAccount =
                                    formState.filteredChartOfAccounts.find(
                                      (account) =>
                                        account.accountId === newAccountId
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
                              }
                            }}
                            placeholder="Select account"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>

                {/* Cost Center */}
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.costCenterId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomCombobox
                            items={formState.costCenters.map((cc) => ({
                              id: (cc.costCenterID ?? cc.id)?.toString(),
                              name:
                                cc.costCenterName ||
                                cc.name ||
                                'Unnamed Cost Center',
                            }))}
                            value={
                              field.value
                                ? {
                                    id: field.value.toString(),
                                    name:
                                      formState.costCenters.find(
                                        (c) =>
                                          c.costCenterID === field.value ||
                                          c.id === field.value
                                      )?.costCenterName ||
                                      formState.costCenters.find(
                                        (c) =>
                                          c.costCenterID === field.value ||
                                          c.id === field.value
                                      )?.name ||
                                      '',
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
                </TableCell>

                {/* Unit */}
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.departmentId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomCombobox
                            items={formState.departments
                              .filter((department) => department.isActive)
                              .map((department) => ({
                                id: department.departmentID.toString(),
                                name:
                                  department.departmentName || 'Unnamed Unit',
                              }))}
                            value={
                              field.value
                                ? {
                                    id: field.value.toString(),
                                    name:
                                      formState.departments.find(
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
                            placeholder="Select unit"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>

                {/* Partner */}
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.resPartnerId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          {isFromInvoice ? (
                            <Input
                              value={invoicePartnerName}
                              disabled
                              className="bg-gray-100 cursor-not-allowed"
                              placeholder="Partner name from invoice"
                            />
                          ) : (
                            <div
                              className={`${!isPartnerFieldEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
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
                                onChange={(item) =>
                                  field.onChange(
                                    item ? Number.parseInt(item.id) : null
                                  )
                                }
                                placeholder="Select partner"
                                searchFunction={searchPartners}
                                fetchByIdFunction={async (id) => {
                                  const numericId: number =
                                    typeof id === 'string' && /^\d+$/.test(id)
                                      ? parseInt(id, 10)
                                      : (id as number)
                                  const partner = await getPartnerById(
                                    numericId,
                                    token
                                  )
                                  return partner?.data
                                    ? {
                                        id: partner.data.id.toString(),
                                        name: partner.data.name ?? '',
                                      }
                                    : null
                                }}
                              />
                            </div>
                          )}
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>

                {/* Amount */}
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.${formState.formType === 'Credit' ? 'debit' : 'credit'}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            {...field}
                            value={field.value ?? ''} // avoid NaN
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(
                                value === '' ? '' : Number.parseFloat(value)
                              )
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>

                {/* Action */}
                <TableCell>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-5 bg-transparent"
        onClick={() => {
          const totalAmount = form.getValues('journalEntry.amountTotal') || 0
          const currentDetails = form.getValues('journalDetails') || []
          const currentField =
            formState.formType === 'Credit' ? 'debit' : 'credit'
          const usedAmount = currentDetails.reduce(
            (sum: number, detail: Record<string, number>) =>
              sum + (detail[currentField] || 0),
            0
          )
          const remainingAmount = totalAmount - usedAmount

          append({
            voucherId: 0,
            accountId: 0,
            costCenterId: null,
            departmentId: null,
            debit: formState.formType === 'Credit' ? remainingAmount : 0,
            credit: formState.formType === 'Debit' ? remainingAmount : 0,
            analyticTags: null,
            taxId: null,
            resPartnerId: null,
            bankaccountid: formState.selectedBankAccount?.id || null,
            notes: '',
            createdBy: 0,
          })
        }}
      >
        Add Another
      </Button>
    </div>
  )
}
