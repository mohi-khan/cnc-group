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
import { useEffect } from 'react'
import {
  type ComboboxItem,
  CustomComboboxWithApi,
} from '@/utils/custom-combobox-with-api'
import { getResPartnersBySearch } from '@/api/common-shared-api'
import { useAtom } from 'jotai'
import { tokenAtom } from '@/utils/user'

export default function BankVoucherDetails({
  form,
  formState,
  requisition,
  partners,
  isFromInvoice = false, // Add this prop to detect if coming from invoice
  invoicePartnerName = '', // Add this prop to get the invoice partner name
}: {
  form: UseFormReturn<any>
  formState: FormStateType
  requisition: any
  partners: ResPartner[]
  isFromInvoice?: boolean // New prop
  invoicePartnerName?: string // New prop
}) {
  // Destructure the formState to get the filteredChartOfAccounts, costCenters, departments, and partners
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'journalDetails',
  })

  const [token] = useAtom(tokenAtom)

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

  // Update amounts when rows are added or removed
  useEffect(() => {
    if (fields.length > 0 && fields.length === 1) {
      // Only auto-distribute when there's exactly one row (initial state)
      const totalAmount = form.getValues('journalEntry.amountTotal') || 0

      form.setValue(
        `journalDetails.0.${formState.formType === 'Credit' ? 'debit' : 'credit'}`,
        totalAmount
      )
    }
  }, [fields.length, form, formState.formType])

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
          {fields.map((field, index) => (
            <TableRow key={field.id}>
              <TableCell>
                <FormField
                  control={form.control}
                  name={`journalDetails.${index}.accountId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <CustomCombobox
                          items={formState.filteredChartOfAccounts.filter((account) => account.isActive).map(
                            (account) => ({
                              id: account.accountId.toString(),
                              name: account.name || 'Unnamed Account',
                            })
                          )}
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
                          onChange={(value) =>
                            field.onChange(
                              value ? Number.parseInt(value.id, 10) : null
                            )
                          }
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
                          items={formState.costCenters.filter((center) => center.isActive).map((center) => ({
                            id: center.costCenterId.toString(),
                            name:
                              center.costCenterName || 'Unnamed Cost Center',
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
                          items={formState.departments.filter((department) => department.isActive).map((department) => ({
                            id: department.departmentID.toString(),
                            name: department.departmentName || 'Unnamed Unit',
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
                          // When coming from invoice, show partner name directly (no search)
                          <Input
                            value={invoicePartnerName}
                            disabled
                            className="bg-gray-100 cursor-not-allowed"
                            placeholder="Partner name from invoice"
                          />
                        ) : (
                          // Normal bank voucher - use search combobox
                          <CustomComboboxWithApi
                            items={partners.filter((partner) => partner.active).map((partner) => ({
                              id: partner.id.toString(),
                              name: partner.name || 'Unnamed Partner',
                            }))}
                            value={
                              field.value
                                ? {
                                    id: field.value.toString(),
                                    name:
                                      partners.find((p) => p.id === field.value)
                                        ?.name || '',
                                  }
                                : null
                            }
                            onChange={(value) =>
                              field.onChange(
                                value ? Number.parseInt(value.id, 10) : null
                              )
                            }
                              placeholder="Select partner"
                            searchFunction={searchPartners}
                          />
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
                          onChange={(e) =>
                            field.onChange(Number.parseFloat(e.target.value))
                          }
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
                  onClick={() => remove(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-5"
        onClick={() => {
          const totalAmount = form.getValues('journalEntry.amountTotal') || 0
          const currentDetails = form.getValues('journalDetails') || []

          // Calculate the sum of all existing amounts
          const currentField =
            formState.formType === 'Credit' ? 'debit' : 'credit'
          const usedAmount = currentDetails.reduce(
            (sum: number, detail: Record<string, number>) =>
              sum + (detail[currentField] || 0),
            0
          )

          // Calculate the remaining amount
          const remainingAmount = totalAmount - usedAmount

          // Add new row with the remaining amount
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
          })
        }}
      >
        Add Another
      </Button>
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
// import { useEffect } from 'react'
// import { ComboboxItem, CustomComboboxWithApi } from '@/utils/custom-combobox-with-api'
// import { getResPartnersBySearch } from '@/api/common-shared-api'
// import { useAtom } from 'jotai'
// import { tokenAtom } from '@/utils/user'

// export default function BankVoucherDetails({
//   form,
//   formState,
//   requisition,
//   partners
// }: {
//   form: UseFormReturn<any>
//   formState: FormStateType
//   requisition: any
//   partners: ResPartner[]
// }) {
//   // Destructure the formState to get the filteredChartOfAccounts, costCenters, departments, and partners
//   const { fields, append, remove } = useFieldArray({
//     control: form.control,
//     name: 'journalDetails',
//   })

//   const [token] = useAtom(tokenAtom)
//   // const [partners, setPartners] = useState<ResPartner[]>([])

//   const searchPartners = async (query: string): Promise<ComboboxItem[]> => {
//     try {
//       const response = await getResPartnersBySearch(query, token)
//       if (response.error || !response.data) {
//         console.error('Error fetching partners:', response.error)
//         return []
//       }
//       // else {
//       //   console.log('response.data', response.data)
//       //   setPartners(response.data)
//       // }

//       return response.data.map((partner) => ({
//         id: partner.id.toString(),
//         name: partner.name || 'Unnamed Partner',
//       }))
//     } catch (error) {
//       console.error('Error fetching partners:', error)
//       return []
//     }
//   }

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

//   return (
//     <div>
//       <Table className="border shadow-md">
//         <TableHeader className="bg-slate-200 shadow-md">
//           <TableRow>
//             <TableHead>Account Name</TableHead>
//             <TableHead>Cost Center</TableHead>
//             <TableHead>Unit</TableHead>
//             <TableHead>Partner Name</TableHead>
//             <TableHead>Remarks</TableHead>
//             <TableHead>Amount</TableHead>
//             <TableHead>Action</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {fields.map((field, index) => (
//             <TableRow key={field.id}>
//               <TableCell>
//                 <FormField
//                   control={form.control}
//                   name={`journalDetails.${index}.accountId`}
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormControl>
//                         <CustomCombobox
//                           items={formState.filteredChartOfAccounts.map(
//                             (account) => ({
//                               id: account.accountId.toString(),
//                               name: account.name || 'Unnamed Account',
//                             })
//                           )}
//                           value={
//                             field.value
//                               ? {
//                                   id: field.value.toString(),
//                                   name:
//                                     formState.filteredChartOfAccounts.find(
//                                       (a) => a.accountId === field.value
//                                     )?.name || '',
//                                 }
//                               : null
//                           }
//                           onChange={(value) =>
//                             field.onChange(
//                               value ? Number.parseInt(value.id, 10) : null
//                             )
//                           }
//                           placeholder="Select account"
//                         />
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />
//               </TableCell>
//               <TableCell>
//                 <FormField
//                   control={form.control}
//                   name={`journalDetails.${index}.costCenterId`}
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormControl>
//                         <CustomCombobox
//                           items={formState.costCenters.map((center) => ({
//                             id: center.costCenterId.toString(),
//                             name:
//                               center.costCenterName || 'Unnamed Cost Center',
//                           }))}
//                           value={
//                             field.value
//                               ? {
//                                   id: field.value.toString(),
//                                   name:
//                                     formState.costCenters.find(
//                                       (c) => c.costCenterId === field.value
//                                     )?.costCenterName || '',
//                                 }
//                               : null
//                           }
//                           onChange={(value) =>
//                             field.onChange(
//                               value ? Number.parseInt(value.id, 10) : null
//                             )
//                           }
//                           placeholder="Select cost center"
//                         />
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />
//               </TableCell>
//               <TableCell>
//                 <FormField
//                   control={form.control}
//                   name={`journalDetails.${index}.departmentId`}
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormControl>
//                         <CustomCombobox
//                           items={formState.departments.map((department) => ({
//                             id: department.departmentID.toString(),
//                             name:
//                               department.departmentName || 'Unnamed Unit',
//                           }))}
//                           value={
//                             field.value
//                               ? {
//                                   id: field.value.toString(),
//                                   name:
//                                     formState.departments.find(
//                                       (d) => d.departmentID === field.value
//                                     )?.departmentName || '',
//                                 }
//                               : null
//                           }
//                           onChange={(value) =>
//                             field.onChange(
//                               value ? Number.parseInt(value.id, 10) : null
//                             )
//                           }
//                           placeholder="Select Unit"
//                         />
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />
//               </TableCell>
//               <TableCell>
//                 <FormField
//                   control={form.control}
//                   name={`journalDetails.${index}.resPartnerId`}
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormControl>
//                         <CustomComboboxWithApi
//                           items={partners.map((partner) => ({
//                             id: partner.id.toString(),
//                             name: partner.name || 'Unnamed Partner',
//                           }))}
//                           value={
//                             field.value
//                               ? {
//                                   id: field.value.toString(),
//                                   name:
//                                     partners.find((p) => p.id === field.value)
//                                       ?.name || '',
//                                 }
//                               : null
//                           }
//                           onChange={(value) =>
//                             field.onChange(
//                               value ? Number.parseInt(value.id, 10) : null
//                             )
//                           }
//                           searchFunction={searchPartners}
//                         />
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />
//               </TableCell>
//               <TableCell>
//                 <FormField
//                   control={form.control}
//                   name={`journalDetails.${index}.notes`}
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormControl>
//                         <Input {...field} placeholder="Enter remarks" />
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />
//               </TableCell>

//               <TableCell>
//                 <FormField
//                   control={form.control}
//                   name={`journalDetails.${index}.${formState.formType === 'Credit' ? 'debit' : 'credit'}`}
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           placeholder="Enter amount"
//                           {...field}
//                           onChange={(e) =>
//                             field.onChange(Number.parseFloat(e.target.value))
//                           }
//                         />
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />
//               </TableCell>
//               <TableCell>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   size="sm"
//                   onClick={() => remove(index)}
//                 >
//                   <Trash className="h-4 w-4" />
//                 </Button>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//       <Button
//         type="button"
//         variant="outline"
//         size="sm"
//         className="mt-5"
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
//           })
//         }}
//       >
//         Add Another
//       </Button>
//     </div>
//   )
// }
