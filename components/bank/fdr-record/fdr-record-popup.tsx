

'use client'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createFdr } from '@/api/fdr-record-api'
import { useAtom } from 'jotai'
import { tokenAtom, userDataAtom } from '@/utils/user'
import type { CompanyType } from '@/api/company-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import type { FdrCreateType, FdrGetType } from '@/utils/type'

interface UserData {
  userId: number
  companyId?: number
}

// Updated form validation schema with custom validation
const fdrSchema = z
  .object({
    fdrNo: z.string().min(1, 'FDR Number is required'),
    fdrDate: z.string().min(1, 'FDR Date is required'),
    accountNo: z.string().min(1, 'Account Number is required'),
    bank: z.string().min(1, 'Bank name is required'),
    branch: z.string().min(1, 'Branch name is required'),
    faceValue: z.number().min(1, 'Face Value must be greater than 0'),
    interestRate: z.number().min(0.1, 'Interest Rate must be greater than 0'),
    term: z.number().min(1, 'Term must be at least 1 month'),
    maturedDate: z.string().min(1, 'Matured Date is required'),
    company: z.number().nullable(),
    companyOther: z.string(),
    createdBy: z.number(),
  })
  .refine(
    (data) => {
      // At least one company field must be filled
      return (
        (data.company && data.company > 0) ||
        (data.companyOther && data.companyOther.trim().length > 0)
      )
    },
    {
      message:
        "Either select a company or enter company name in 'Other Company' field",
      path: ['company'], // This will show the error on the company field
    }
  )

interface FdrRecordPopUpProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onRecordAdded: () => void
  companyData: CompanyType[]
  refreshFdrData: () => void
  fdrdata: FdrGetType[]
}

const FdrRecordPopUp: React.FC<FdrRecordPopUpProps> = ({
  isOpen,
  onOpenChange,
  onRecordAdded,
  companyData,
  refreshFdrData,
  fdrdata,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [token] = useAtom(tokenAtom)
  const [userData] = useAtom(userDataAtom)

  const form = useForm<z.infer<typeof fdrSchema>>({
    resolver: zodResolver(fdrSchema),
    defaultValues: {
      fdrNo: '',
      fdrDate: '',
      accountNo: '',
      bank: '',
      branch: '',
      faceValue: 0,
      interestRate: 0,
      term: 0,
      maturedDate: '',
      company: null,
      companyOther: '',
      createdBy: userData?.userId || 0,
    },
  })

  // Watch both company fields to enable/disable logic
  const watchCompany = form.watch('company')
  const watchCompanyOther = form.watch('companyOther')

  // Clear the other field when one is filled
  useEffect(() => {
    if (watchCompany && watchCompany > 0) {
      form.setValue('companyOther', '')
    }
  }, [watchCompany, form])

  useEffect(() => {
    if (watchCompanyOther && watchCompanyOther.trim().length > 0) {
      form.setValue('company', null)
    }
  }, [watchCompanyOther, form])

  useEffect(() => {
    console.log('Form Errors:', form.formState.errors)
  }, [form.formState.errors])

  // Auto-set maturedDate based on fdrDate + term
  const term = form.watch('term')
  const fdrDate = form.watch('fdrDate')

  useEffect(() => {
    if (!fdrDate || !term || term <= 0) {
      form.setValue('maturedDate', '')
      return
    }

    const startDate = new Date(fdrDate)
    if (isNaN(startDate.getTime())) return

    startDate.setMonth(startDate.getMonth() + term)

    const year = startDate.getFullYear()
    const month = String(startDate.getMonth() + 1).padStart(2, '0')
    const day = String(startDate.getDate()).padStart(2, '0')

    const maturedDate = `${year}-${month}-${day}`
    form.setValue('maturedDate', maturedDate)
  }, [term, fdrDate, form])

  const onSubmit = async (values: z.infer<typeof fdrSchema>) => {
    if (!userData?.userId) {
      toast({
        title: 'Error',
        description:
          'User information not available. Please refresh and try again.',
        variant: 'destructive',
      })
      return
    }

    // ✅ Duplicate FDR check (only new addition)
    const exists = fdrdata.some(
      (item) => item.fdrNo.toLowerCase() === values.fdrNo.toLowerCase()
    )
    if (exists) {
      form.setError('fdrNo', {
        type: 'manual',
        message: 'This FDR Number already exists',
      })
      return
    }

    setIsLoading(true)
    try {
      const fdrData: FdrCreateType = {
        ...values,
        // Send null for company if companyOther is used
        company:
          values.companyOther && values.companyOther.trim()
            ? null
            : values.company,
        companyOther:
          values.companyOther && values.companyOther.trim()
            ? values.companyOther
            : null,
        createdBy: userData.userId,
      }

      const result = await createFdr(fdrData, token)
      toast({
        title: 'Success',
        description: 'FDR record created successfully',
      })
      form.reset()
      onRecordAdded()
      onOpenChange(false)
      refreshFdrData()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create FDR record',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  if (!userData?.userId) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
            <DialogDescription>
              Please wait while we load your user information.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New FDR Record</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new Fixed Deposit Receipt record.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input Fields */}
              {[
                { name: 'fdrNo', label: 'FDR Number', placeholder: 'FDR1007' },
                {
                  name: 'fdrDate',
                  label: 'FDR Date',
                  type: 'date',
                  placeholder: '',
                },
                {
                  name: 'accountNo',
                  label: 'Account Number',
                  placeholder: 'AC987654327',
                },
                { name: 'bank', label: 'Bank', placeholder: 'DBBL' },
                { name: 'branch', label: 'Branch', placeholder: 'GEC Branch' },
                {
                  name: 'faceValue',
                  label: 'Face Value',
                  type: 'number',
                  placeholder: '75000000',
                },
                {
                  name: 'interestRate',
                  label: 'Interest Rate (%)',
                  type: 'number',
                  step: '0.1',
                  placeholder: '7.5',
                },
                {
                  name: 'term',
                  label: 'Term (Months)',
                  type: 'number',
                  placeholder: '24',
                },
                {
                  name: 'maturedDate',
                  label: 'Matured Date',
                  type: 'date',
                  placeholder: '',
                },
              ].map(({ name, label, type = 'text', placeholder, step }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof z.infer<typeof fdrSchema>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type={type}
                          step={step}
                          placeholder={placeholder}
                          value={field.value || ''}
                          onChange={(e) =>
                            field.onChange(
                              type === 'number'
                                ? e.target.value === ''
                                  ? 0
                                  : Number(e.target.value)
                                : e.target.value
                            )
                          }
                          // Make maturedDate input readonly
                          readOnly={name === 'maturedDate'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              {/* Company Combobox */}
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company *</FormLabel>
                    <CustomCombobox
                      items={companyData.map((company) => ({
                        id: company.companyId?.toString() ?? '',
                        name: company.companyName,
                      }))}
                      value={
                        field.value
                          ? {
                              id: field.value.toString(),
                              name:
                                companyData.find(
                                  (company) => company.companyId === field.value
                                )?.companyName || 'Select company',
                            }
                          : null
                      }
                      onChange={(value: { id: string; name: string } | null) =>
                        field.onChange(value ? Number(value.id) : null)
                      }
                      placeholder="Select a company"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company Other Text Field */}
              <FormField
                control={form.control}
                name="companyOther"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Company *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter company name"
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Helper text */}
            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
              <p>
                <strong>Note:</strong> You can either select a company from the
                dropdown OR enter a custom company name in the &quot;Other
                Company&quot; field. At least one must be filled.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create FDR Record
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default FdrRecordPopUp


// 'use client'
// import type React from 'react'
// import { useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import * as z from 'zod'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
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
// import { Button } from '@/components/ui/button'
// import { Loader2 } from 'lucide-react'
// import { useToast } from '@/hooks/use-toast'
// import { createFdr } from '@/api/fdr-record-api'
// import { useAtom } from 'jotai'
// import { tokenAtom, userDataAtom } from '@/utils/user'
// import type { CompanyType } from '@/api/company-api'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import type { FdrCreateType, FdrGetType } from '@/utils/type'

// interface UserData {
//   userId: number
//   companyId?: number
// }

// // Updated form validation schema with custom validation
// const fdrSchema = z
//   .object({
//     fdrNo: z.string().min(1, 'FDR Number is required'),
//     fdrDate: z.string().min(1, 'FDR Date is required'),
//     accountNo: z.string().min(1, 'Account Number is required'),
//     bank: z.string().min(1, 'Bank name is required'),
//     branch: z.string().min(1, 'Branch name is required'),
//     faceValue: z.number().min(1, 'Face Value must be greater than 0'),
//     interestRate: z.number().min(0.1, 'Interest Rate must be greater than 0'),
//     term: z.number().min(1, 'Term must be at least 1 month'),
//     maturedDate: z.string().min(1, 'Matured Date is required'),
//     company: z.number().nullable(),
//     companyOther: z.string(),
//     createdBy: z.number(),
//   })
//   .refine(
//     (data) => {
//       // At least one company field must be filled
//       return (
//         (data.company && data.company > 0) ||
//         (data.companyOther && data.companyOther.trim().length > 0)
//       )
//     },
//     {
//       message:
//         "Either select a company or enter company name in 'Other Company' field",
//       path: ['company'],
//     }
//   )

// interface FdrRecordPopUpProps {
//   isOpen: boolean
//   onOpenChange: (open: boolean) => void
//   onRecordAdded: () => void
//   companyData: CompanyType[]
//   refreshFdrData: () => void
//   fdrdata: FdrGetType[]
// }

// const FdrRecordPopUp: React.FC<FdrRecordPopUpProps> = ({
//   isOpen,
//   onOpenChange,
//   onRecordAdded,
//   companyData,
//   refreshFdrData,
//   fdrdata,
// }) => {
//   const [isLoading, setIsLoading] = useState(false)
//   const { toast } = useToast()
//   const [token] = useAtom(tokenAtom)
//   const [userData] = useAtom(userDataAtom)

//   const form = useForm<z.infer<typeof fdrSchema>>({
//     resolver: zodResolver(fdrSchema),
//     defaultValues: {
//       fdrNo: '',
//       fdrDate: '',
//       accountNo: '',
//       bank: '',
//       branch: '',
//       faceValue: 0,
//       interestRate: 0,
//       term: 0,
//       maturedDate: '',
//       company: null,
//       companyOther: '',
//       createdBy: userData?.userId || 0,
//     },
//   })

//   // Watch both company fields
//   const watchCompany = form.watch('company')
//   const watchCompanyOther = form.watch('companyOther')

//   useEffect(() => {
//     if (watchCompany && watchCompany > 0) {
//       form.setValue('companyOther', '')
//     }
//   }, [watchCompany, form])

//   useEffect(() => {
//     if (watchCompanyOther && watchCompanyOther.trim().length > 0) {
//       form.setValue('company', null)
//     }
//   }, [watchCompanyOther, form])

//   // Auto-set maturedDate based on fdrDate + term
//   const term = form.watch('term')
//   const fdrDate = form.watch('fdrDate')

//   useEffect(() => {
//     if (!fdrDate || !term || term <= 0) {
//       form.setValue('maturedDate', '')
//       return
//     }

//     const startDate = new Date(fdrDate)
//     if (isNaN(startDate.getTime())) return

//     startDate.setMonth(startDate.getMonth() + term)

//     const year = startDate.getFullYear()
//     const month = String(startDate.getMonth() + 1).padStart(2, '0')
//     const day = String(startDate.getDate()).padStart(2, '0')

//     const maturedDate = `${year}-${month}-${day}`
//     form.setValue('maturedDate', maturedDate)
//   }, [term, fdrDate, form])

//   const onSubmit = async (values: z.infer<typeof fdrSchema>) => {
//     if (!userData?.userId) {
//       toast({
//         title: 'Error',
//         description:
//           'User information not available. Please refresh and try again.',
//         variant: 'destructive',
//       })
//       return
//     }

//     // ✅ Duplicate FDR check (only new addition)
//     const exists = fdrdata.some(
//       (item) => item.fdrNo.toLowerCase() === values.fdrNo.toLowerCase()
//     )
//     if (exists) {
//       form.setError('fdrNo', {
//         type: 'manual',
//         message: 'This FDR Number already exists',
//       })
//       return
//     }

//     setIsLoading(true)
//     try {
//       const fdrData: FdrCreateType = {
//         ...values,
//         company:
//           values.companyOther && values.companyOther.trim()
//             ? null
//             : values.company,
//         companyOther:
//           values.companyOther && values.companyOther.trim()
//             ? values.companyOther
//             : null,
//         createdBy: userData.userId,
//       }

//       await createFdr(fdrData, token)
//       toast({
//         title: 'Success',
//         description: 'FDR record created successfully',
//       })
//       form.reset()
//       onRecordAdded()
//       onOpenChange(false)
//       refreshFdrData()
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description:
//           error instanceof Error
//             ? error.message
//             : 'Failed to create FDR record',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleClose = () => {
//     form.reset()
//     onOpenChange(false)
//   }

//   if (!userData?.userId) {
//     return (
//       <Dialog open={isOpen} onOpenChange={handleClose}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Loading...</DialogTitle>
//             <DialogDescription>
//               Please wait while we load your user information.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="flex justify-center py-4">
//             <Loader2 className="h-6 w-6 animate-spin" />
//           </div>
//         </DialogContent>
//       </Dialog>
//     )
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Add New FDR Record</DialogTitle>
//           <DialogDescription>
//             Fill in the details to create a new Fixed Deposit Receipt record.
//           </DialogDescription>
//         </DialogHeader>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Input Fields */}
//               {[
//                 { name: 'fdrNo', label: 'FDR Number', placeholder: 'FDR1007' },
//                 {
//                   name: 'fdrDate',
//                   label: 'FDR Date',
//                   type: 'date',
//                   placeholder: '',
//                 },
//                 {
//                   name: 'accountNo',
//                   label: 'Account Number',
//                   placeholder: 'AC987654327',
//                 },
//                 { name: 'bank', label: 'Bank', placeholder: 'DBBL' },
//                 { name: 'branch', label: 'Branch', placeholder: 'GEC Branch' },
//                 {
//                   name: 'faceValue',
//                   label: 'Face Value',
//                   type: 'number',
//                   placeholder: '75000000',
//                 },
//                 {
//                   name: 'interestRate',
//                   label: 'Interest Rate (%)',
//                   type: 'number',
//                   step: '0.1',
//                   placeholder: '7.5',
//                 },
//                 {
//                   name: 'term',
//                   label: 'Term (Months)',
//                   type: 'number',
//                   placeholder: '24',
//                 },
//                 {
//                   name: 'maturedDate',
//                   label: 'Matured Date',
//                   type: 'date',
//                   placeholder: '',
//                 },
//               ].map(({ name, label, type = 'text', placeholder, step }) => (
//                 <FormField
//                   key={name}
//                   control={form.control}
//                   name={name as keyof z.infer<typeof fdrSchema>}
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>{label} *</FormLabel>
//                       <FormControl>
//                         <Input
//                           {...field}
//                           type={type}
//                           step={step}
//                           placeholder={placeholder}
//                           value={field.value || ''}
//                           onChange={(e) =>
//                             field.onChange(
//                               type === 'number'
//                                 ? e.target.value === ''
//                                   ? 0
//                                   : Number(e.target.value)
//                                 : e.target.value
//                             )
//                           }
//                           // Make maturedDate input readonly
//                           readOnly={name === 'maturedDate'}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               ))}

//               {/* Company Combobox */}
//               <FormField
//                 control={form.control}
//                 name="company"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Company *</FormLabel>
//                     <CustomCombobox
//                       items={companyData.map((company) => ({
//                         id: company.companyId?.toString() ?? '',
//                         name: company.companyName,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name:
//                                 companyData.find(
//                                   (company) => company.companyId === field.value
//                                 )?.companyName || 'Select company',
//                             }
//                           : null
//                       }
//                       onChange={(value: { id: string; name: string } | null) =>
//                         field.onChange(value ? Number(value.id) : null)
//                       }
//                       placeholder="Select a company"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Company Other Text Field */}
//               <FormField
//                 control={form.control}
//                 name="companyOther"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Other Company *</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         placeholder="Enter company name"
//                         value={field.value || ''}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* Helper text */}
//             <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
//               <p>
//                 <strong>Note:</strong> You can either select a company from the
//                 dropdown OR enter a custom company name in the &quot;Other
//                 Company&quot; field. At least one must be filled.
//               </p>
//             </div>

//             <div className="flex justify-end space-x-2 pt-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={handleClose}
//                 disabled={isLoading}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={isLoading}>
//                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 Create FDR Record
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   )
// }

// export default FdrRecordPopUp