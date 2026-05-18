'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'

import {
  type Employee,
  IouRecordCreateSchema,
  type IouRecordCreateType,
  LocationData,
} from '@/utils/type'

import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { createIou } from '@/api/iou-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import { CompanyType } from '@/api/company-api'

interface LoanPopUpProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCategoryAdded: () => void
  employeeData: Employee[]
  fetchLoanData: () => Promise<void>
  getCompany: CompanyType[]
  getLoaction: LocationData[]
}

// ✅ localStorage থেকে last date issued পড়া
const getLastDateIssued = (): Date => {
  if (typeof window === 'undefined') return new Date()
  const saved = localStorage.getItem('iou_last_date_issued')
  if (saved) {
    const parsed = new Date(saved)
    if (!isNaN(parsed.getTime())) return parsed
  }
  return new Date()
}

// ✅ dateIssued থেকে dueDate (+7 দিন) বানানো
const getDueDateFrom = (issued: Date): Date => {
  const due = new Date(issued)
  due.setDate(issued.getDate() + 7)
  return due
}

export default function IouPopUp({
  isOpen,
  onOpenChange,
  onCategoryAdded,
  fetchLoanData,
  employeeData,
  getCompany,
  getLoaction,
}: LoanPopUpProps) {
  useInitializeUser()

  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)

  React.useEffect(() => {
    if (userData) {
      setUserId(userData.userId)
    }
  }, [userData])

  // ✅ last used date দিয়ে form initialize করো
  const initialDateIssued = getLastDateIssued()

  const form = useForm<IouRecordCreateType>({
    resolver: zodResolver(IouRecordCreateSchema),
    defaultValues: {
      amount: 0,
      adjustedAmount: 0,
      employeeId: 0,
      companyId: getCompany.length > 0 ? getCompany[0].companyId : undefined,
      locationId:
        getLoaction.length > 0 ? getLoaction[0].locationId : undefined,
      dateIssued: initialDateIssued,
      dueDate: getDueDateFrom(initialDateIssued),
      status: 'active',
      notes: '',
      createdBy: userData?.userId,
    },
  })

  const { watch, setValue } = form
  const dateIssued = watch('dateIssued')

  // ✅ dateIssued বদলালে dueDate আপডেট করো
  useEffect(() => {
    if (dateIssued) {
      const issued = new Date(dateIssued)
      setValue('dueDate', getDueDateFrom(issued))
    }
  }, [dateIssued, setValue])

  // ✅ Dialog খোলার সময় last saved date দিয়ে reset করো
  useEffect(() => {
    if (isOpen) {
      const lastDate = getLastDateIssued()
      setValue('dateIssued', lastDate)
      setValue('dueDate', getDueDateFrom(lastDate))
    }
  }, [isOpen, setValue])

  useEffect(() => {
    if (userId !== null) {
      form.setValue('createdBy', userId)
    }
  }, [userId, form])

  const onSubmit = async (data: IouRecordCreateType) => {
    if (data.adjustedAmount >= data.amount) {
      toast({
        title: 'Validation Error',
        description:
          'Adjusted Amount must be less than the Amount and cannot be equal or higher.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createIou(data, token)

      // ✅ Submit এর পর date localStorage এ save করো
      if (data.dateIssued) {
        localStorage.setItem(
          'iou_last_date_issued',
          format(new Date(data.dateIssued), 'yyyy-MM-dd')
        )
      }

      toast({
        title: 'Success',
        description: 'IOU has been created successfully',
      })
      onCategoryAdded()
      fetchLoanData()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Failed to create IOU:', error)
      toast({
        title: 'Error',
        description: 'Failed to create IOU. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCompanyId = form.watch('companyId')

  const filteredLocations = selectedCompanyId
    ? getLoaction.filter(
        (location) => Number(location.companyId) === Number(selectedCompanyId)
      )
    : getLoaction

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New IOU</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => form.handleSubmit(onSubmit)(e)}
            className="space-y-4"
          >
            <FormField
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter amount"
                      onChange={(e) => {
                        const raw = e.target.value
                        if (raw === '') {
                          field.onChange('')
                          return
                        }
                        const parsed = Number.parseFloat(raw)
                        if (isNaN(parsed) || parsed <= 0) {
                          field.onChange('')
                          return
                        }
                        field.onChange(parsed)
                      }}
                      value={
                        field.value === 0 ||
                        field.value === undefined ||
                        field.value === null
                          ? ''
                          : field.value
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <CustomCombobox
                    items={employeeData.map((employee) => ({
                      id: employee.id.toString(),
                      name: `${employee.employeeName} (${employee.employeeId})`,
                    }))}
                    value={
                      field.value
                        ? {
                            id: field.value.toString(),
                            name:
                              employeeData.find(
                                (employee) => employee.id === field.value
                              )?.employeeName || 'Select employee',
                          }
                        : null
                    }
                    onChange={(value: { id: string; name: string } | null) =>
                      field.onChange(value ? Number(value.id) : null)
                    }
                    placeholder="Select an employee"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <CustomCombobox
                    items={getCompany.map((company) => ({
                      id: company.companyId?.toString() ?? '',
                      name: company.companyName,
                    }))}
                    value={
                      field.value
                        ? {
                            id: field.value.toString(),
                            name:
                              getCompany.find(
                                (company) =>
                                  Number(company.companyId) === field.value
                              )?.companyName || 'Select company',
                          }
                        : null
                    }
                    onChange={(value: { id: string; name: string } | null) => {
                      field.onChange(value ? Number(value.id) : null)
                      form.setValue('locationId', 0)
                    }}
                    placeholder="Select a company"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <CustomCombobox
                    items={filteredLocations.map((location) => ({
                      id: location.locationId.toString(),
                      name: location.branchName,
                    }))}
                    value={
                      field.value
                        ? {
                            id: field.value.toString(),
                            name:
                              filteredLocations.find(
                                (location) =>
                                  Number(location.locationId) === field.value
                              )?.branchName || 'Select location',
                          }
                        : null
                    }
                    onChange={(value: { id: string; name: string } | null) =>
                      field.onChange(value ? Number(value.id) : null)
                    }
                    placeholder={
                      filteredLocations.length > 0
                        ? 'Select a location'
                        : 'No locations found for this company'
                    }
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ Date Issued - last used date দেখাবে */}
            <FormField
              control={form.control}
              name="dateIssued"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Date Issued
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      (last used date)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      placeholder="YYYY-MM-DD"
                      value={
                        field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''
                      }
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange(val ? new Date(val) : null)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ Due Date - auto calculated from dateIssued + 7 */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Due Date
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      (auto: issued + 7 days)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      placeholder="YYYY-MM-DD"
                      value={
                        field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''
                      }
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange(val ? new Date(val) : null)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              {/* Draft Button */}
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => {
                  form.setValue('status', 'draft')
                  form.handleSubmit(onSubmit)()
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save as Draft'}
              </Button>

              {/* Post Button */}
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  form.setValue('status', 'active')
                  form.handleSubmit(onSubmit)()
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Post'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}



// 'use client'

// import React, { useCallback, useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { format } from 'date-fns'
// import { Button } from '@/components/ui/button'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { toast } from '@/hooks/use-toast'

// import {
//   type Employee,
//   IouRecordCreateSchema,
//   type IouRecordCreateType,
//   LocationData,
// } from '@/utils/type'

// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { getEmployee } from '@/api/common-shared-api'
// import { useRouter } from 'next/navigation'
// import { createIou } from '@/api/iou-api'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import { CompanyType } from '@/api/company-api'

// interface LoanPopUpProps {
//   isOpen: boolean
//   onOpenChange: (open: boolean) => void
//   onCategoryAdded: () => void
//   employeeData: Employee[] // Type for employeeData
//   fetchLoanData: () => Promise<void> // Type for the fetchLoanData function
//   getCompany: CompanyType[]
//   getLoaction: LocationData[]
// }

// export default function IouPopUp({
//   isOpen,
//   onOpenChange,
//   onCategoryAdded,
//   fetchLoanData,
//   employeeData,
//   getCompany,
//   getLoaction,
// }: LoanPopUpProps) {
//   //getting userData from jotai atom component
//   useInitializeUser()

//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)

//   const router = useRouter()

//   // State variables
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [userId, setUserId] = useState<number | null>(null) // set to null initially

//   React.useEffect(() => {
//     if (userData) {
//       setUserId(userData.userId)
//     } else {
//     }
//   }, [userData])

//   const form = useForm<IouRecordCreateType>({
//     resolver: zodResolver(IouRecordCreateSchema),
//     defaultValues: {
//       amount: 0,
//       adjustedAmount: 0,
//       employeeId: 0,
//       companyId: getCompany.length > 0 ? getCompany[0].companyId : undefined,
//       locationId:
//         getLoaction.length > 0 ? getLoaction[0].locationId : undefined,
//       dateIssued: new Date(),
//       // dueDate: new Date(),
//       dueDate: (() => {
//         const issued = new Date()
//         const due = new Date(issued)
//         due.setDate(issued.getDate() + 7)
//         return due
//       })(),
//       status: 'active',
//       notes: '',
//       createdBy: userData?.userId, // set to undefined initially or when userId is not available
//     },
//   })

//   const { watch, setValue } = form
//   const dateIssued = watch('dateIssued')

//   // whenever dateIssued changes, update dueDate
//   useEffect(() => {
//     if (dateIssued) {
//       const issued = new Date(dateIssued)
//       const due = new Date(issued)
//       due.setDate(issued.getDate() + 7)
//       setValue('dueDate', due)
//     }
//   }, [dateIssued, setValue])

//   useEffect(() => {
//     if (userId !== null) {
//       // Update the form's default values when userId is available
//       form.setValue('createdBy', userId)
//     }
//   }, [userId, form])

//   const onSubmit = async (data: IouRecordCreateType) => {
//     if (data.adjustedAmount >= data.amount) {
//       toast({
//         title: 'Validation Error',
//         description:
//           'Adjusted Amount must be less than the Amount and cannot be equal or higher.',
//         variant: 'destructive',
//       })
//       return // Prevent form submission
//     }

//     setIsSubmitting(true)
//     try {
//       await createIou(data, token)
//       toast({
//         title: 'Success',
//         description: 'IOU has been created successfully',
//       })
//       onCategoryAdded()
//       fetchLoanData()
//       onOpenChange(false)
//       form.reset()
//     } catch (error) {
//       console.error('Failed to create IOU:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to create IOU. Please try again.',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const selectedCompanyId = form.watch('companyId')

//   // Filter locations based on selected company
//   const filteredLocations = selectedCompanyId
//     ? getLoaction.filter(
//         (location) => Number(location.companyId) === Number(selectedCompanyId)
//       )
//     : getLoaction

//   return (
//     <Dialog open={isOpen} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto flex flex-col">
//         <DialogHeader>
//           <DialogTitle>Add New IOU</DialogTitle>
//         </DialogHeader>
//         <Form {...form}>
//           <form
//             onSubmit={(e) => form.handleSubmit(onSubmit)(e)}
//             className="space-y-4"
//           >
//             <FormField
//               name="amount"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Amount</FormLabel>
//                   <FormControl>
//                     <Input
//                       {...field}
//                       type="number"
//                       step="0.01"
//                       min="0"
//                       placeholder="Enter amount"
//                       onChange={(e) => {
//                         const raw = e.target.value

//                         if (raw === '') {
//                           field.onChange('')
//                           return
//                         }

//                         const parsed = Number.parseFloat(raw)

//                         if (isNaN(parsed) || parsed <= 0) {
//                           field.onChange('')
//                           return
//                         }

//                         field.onChange(parsed)
//                       }}
//                       value={
//                         field.value === 0 ||
//                         field.value === undefined ||
//                         field.value === null
//                           ? ''
//                           : field.value
//                       }
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="employeeId"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Employee</FormLabel>
//                   <CustomCombobox
//                     items={employeeData.map((employee) => ({
//                       id: employee.id.toString(),
//                       name: `${employee.employeeName} (${employee.employeeId})`, // 👈
//                     }))}
//                     value={
//                       field.value
//                         ? {
//                             id: field.value.toString(),
//                             name:
//                               employeeData.find(
//                                 (employee) => employee.id === field.value
//                               )?.employeeName || 'Select employee',
//                           }
//                         : null
//                     }
//                     onChange={(value: { id: string; name: string } | null) =>
//                       field.onChange(value ? Number(value.id) : null)
//                     }
//                     placeholder="Select an employee"
//                   />
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="companyId"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Company</FormLabel>
//                   <CustomCombobox
//                     items={getCompany.map((company) => ({
//                       id: company.companyId?.toString() ?? '',
//                       name: company.companyName,
//                     }))}
//                     value={
//                       field.value
//                         ? {
//                             id: field.value.toString(),
//                             name:
//                               getCompany.find(
//                                 (company) =>
//                                   Number(company.companyId) === field.value
//                               )?.companyName || 'Select company',
//                           }
//                         : null
//                     }
//                     onChange={(value: { id: string; name: string } | null) => {
//                       field.onChange(value ? Number(value.id) : null)
//                       // reset location when company changes
//                       form.setValue('locationId', 0)
//                     }}
//                     placeholder="Select a company"
//                   />
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Location Dropdown (filtered company-wise) */}
//             <FormField
//               control={form.control}
//               name="locationId"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Location</FormLabel>
//                   <CustomCombobox
//                     items={filteredLocations.map((location) => ({
//                       id: location.locationId.toString(),
//                       name: location.branchName,
//                     }))}
//                     value={
//                       field.value
//                         ? {
//                             id: field.value.toString(),
//                             name:
//                               filteredLocations.find(
//                                 (location) =>
//                                   Number(location.locationId) === field.value
//                               )?.branchName || 'Select location',
//                           }
//                         : null
//                     }
//                     onChange={(value: { id: string; name: string } | null) =>
//                       field.onChange(value ? Number(value.id) : null)
//                     }
//                     placeholder={
//                       filteredLocations.length > 0
//                         ? 'Select a location'
//                         : 'No locations found for this company'
//                     }
//                   />
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="dateIssued"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Date Issued</FormLabel>
//                   <FormControl>
//                     <Input
//                       {...field}
//                       type="date"
//                       placeholder="YYYY-MM-DD"
//                       value={
//                         field.value ? format(field.value, 'yyyy-MM-dd') : ''
//                       }
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="dueDate"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Due Date</FormLabel>
//                   <FormControl>
//                     <Input
//                       {...field}
//                       type="date"
//                       placeholder="YYYY-MM-DD"
//                       value={
//                         field.value ? format(field.value, 'yyyy-MM-dd') : ''
//                       }
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="notes"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Notes</FormLabel>
//                   <FormControl>
//                     <Textarea {...field} placeholder="Enter notes" />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* <div className="flex justify-end space-x-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => onOpenChange(false)}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={isSubmitting}>
//                 {isSubmitting ? 'Submitting...' : 'Submit'}
//               </Button>
//             </div> */}

//             <div className="flex justify-end space-x-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => onOpenChange(false)}
//               >
//                 Cancel
//               </Button>

//               {/* Draft Button */}
//               <Button
//                 type="button"
//                 variant="secondary"
//                 disabled={isSubmitting}
//                 onClick={() => {
//                   form.setValue('status', 'draft')
//                   form.handleSubmit(onSubmit)()
//                 }}
//               >
//                 {isSubmitting ? 'Saving...' : 'Save as Draft'}
//               </Button>

//               {/* Post/Submit Button */}
//               <Button
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={() => {
//                   form.setValue('status', 'active')
//                   form.handleSubmit(onSubmit)()
//                 }}
//               >
//                 {isSubmitting ? 'Submitting...' : 'Post'}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   )
// }
