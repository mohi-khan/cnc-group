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

export default function BankVoucherDetails({
  form,
  formState,
  requisition,
  partners,
  isFromInvoice = false,
  invoicePartnerName = '',
  isEdit = false, // Add isEdit prop
}: {
  form: UseFormReturn<any>
  formState: FormStateType
  requisition: any
  partners: ResPartner[]
  isFromInvoice?: boolean
  invoicePartnerName?: string
  isEdit?: boolean // Add isEdit prop
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

  // Update amounts when rows are added or removed (only in create mode)
  useEffect(() => {
    if (!isEdit && fields.length > 0 && fields.length === 1) {
      const totalAmount = form.getValues('journalEntry.amountTotal') || 0
      form.setValue(
        `journalDetails.0.${formState.formType === 'Credit' ? 'debit' : 'credit'}`,
        totalAmount
      )
    }
  }, [fields.length, form, formState.formType, isEdit])

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

  // Live calculation function for edit mode
  const calculateTotalAmount = () => {
    if (!isEdit) return

    const currentDetails = form.getValues('journalDetails') || []

    const totalDebit = currentDetails.reduce((sum: number, detail: any) => {
      return sum + (Number(detail.debit) || 0)
    }, 0)

    const totalCredit = currentDetails.reduce((sum: number, detail: any) => {
      return sum + (Number(detail.credit) || 0)
    }, 0)

    const calculatedAmount = Math.max(totalDebit, totalCredit)

    form.setValue('journalEntry.amountTotal', calculatedAmount, {
      shouldValidate: false,
    })
  }

  return (
    <div>
      <Table className="border shadow-md">
        <TableHeader className="bg-slate-200 shadow-md">
          <TableRow>
            <TableHead>Account Name</TableHead>
            <TableHead>Cost Center</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Partner Name</TableHead>
            <TableHead>Cheque Number</TableHead>
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
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.costCenterId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomCombobox
                            items={formState.costCenters
                              .filter((center) => center.isActive)
                              .map((center) => ({
                                id: center.costCenterId.toString(),
                                name:
                                  center.costCenterName ||
                                  'Unnamed Cost Center',
                              }))}
                            value={
                              field.value
                                ? {
                                    id: field.value.toString(),
                                    name:
                                      formState.costCenters.find(
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
                </TableCell>
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
                                onChange={(item) => {
                                  field.onChange(
                                    item ? Number.parseInt(item.id) : null
                                  )
                                }}
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
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="Enter cheque no" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>
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
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(
                                value === '' ? undefined : Number(value)
                              )
                              // Trigger live calculation in edit mode
                              if (isEdit) {
                                setTimeout(() => calculateTotalAmount(), 0)
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      remove(index)
                      // Trigger live calculation after removal in edit mode
                      if (isEdit) {
                        setTimeout(() => calculateTotalAmount(), 0)
                      }
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {!isEdit && (
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
              notes: '',
              createdBy: 0,
              bankaccountid: formState.selectedBankAccount?.id || null,
            })
          }}
        >
          Add Another
        </Button>
      )}

     
    </div>
  )
}

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
// import { useEffect, useState } from 'react'
// import {
//   type ComboboxItem,
//   CustomComboboxWithApi,
// } from '@/utils/custom-combobox-with-api'
// import { getPartnerById, getResPartnersBySearch } from '@/api/common-shared-api'
// import { useAtom } from 'jotai'
// import { tokenAtom } from '@/utils/user'

// export default function BankVoucherDetails({
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
//             <TableHead>Cost Center</TableHead>
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
//                     name={`journalDetails.${index}.costCenterId`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormControl>
//                           <CustomCombobox
//                             items={formState.costCenters
//                               .filter((center) => center.isActive)
//                               .map((center) => ({
//                                 id: center.costCenterId.toString(),
//                                 name:
//                                   center.costCenterName ||
//                                   'Unnamed Cost Center',
//                               }))}
//                             value={
//                               field.value
//                                 ? {
//                                     id: field.value.toString(),
//                                     name:
//                                       formState.costCenters.find(
//                                         (c) => c.costCenterId === field.value
//                                       )?.costCenterName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(value) =>
//                               field.onChange(
//                                 value ? Number.parseInt(value.id, 10) : null
//                               )
//                             }
//                             placeholder="Select cost center"
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
//                             value={field.value ?? ''} // ensure value is string, not NaN/undefined
//                             onChange={(e) => {
//                               const value = e.target.value
//                               field.onChange(
//                                 value === '' ? undefined : Number(value)
//                               )
//                             }}
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
