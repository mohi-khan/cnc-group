// 'use client'

// import type React from 'react'
// import { useState } from 'react'
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
// import { FdrCreateType } from '@/utils/type'
// import { useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'

// // Form validation schema
// const fdrSchema = z.object({
//   fdrNo: z.string().min(1, 'FDR Number is required'),
//   fdrDate: z.string().min(1, 'FDR Date is required'),
//   accountNo: z.string().min(1, 'Account Number is required'),
//   bank: z.string().min(1, 'Bank name is required'),
//   branch: z.string().min(1, 'Branch name is required'),
//   faceValue: z.number().min(1, 'Face Value must be greater than 0'),
//   interestRate: z.number().min(0.1, 'Interest Rate must be greater than 0'),
//   term: z.number().min(1, 'Term must be at least 1 month'),
//   maturedDate: z.string().min(1, 'Matured Date is required'),
//   company: z.number(),
//   createdBy: z.number(), // Optional field for createdBy
// })

// interface FdrRecordPopUpProps {
//   isOpen: boolean
//   onOpenChange: (open: boolean) => void
//   onRecordAdded: () => void
// }

// const FdrRecordPopUp: React.FC<FdrRecordPopUpProps> = ({
//   isOpen,
//   onOpenChange,
//   onRecordAdded,
// }) => {
//   const [isLoading, setIsLoading] = useState(false)
//   const { toast } = useToast()
//   useInitializeUser()
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
//       company: 0,
//       createdBy: userData?.userId, // Optional field
//     },
//   })

//   const onSubmit = async (values: z.infer<typeof fdrSchema>) => {
//     setIsLoading(true)
//     try {
//       // Get token from localStorage or your auth system
//       const token = localStorage.getItem('authToken') || ''

//       const fdrData: FdrCreateType = {
//         ...values,
//       }

//       await createFdr(fdrData, token)

//       toast({
//         title: 'Success',
//         description: 'FDR record created successfully',
//       })

//       form.reset()
//       onRecordAdded()
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to create FDR record. Please try again.',
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
//               <FormField
//                 control={form.control}
//                 name="fdrNo"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>FDR Number</FormLabel>
//                     <FormControl>
//                       <Input placeholder="e.g., FDR1007" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="fdrDate"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>FDR Date</FormLabel>
//                     <FormControl>
//                       <Input type="date" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="accountNo"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Account Number</FormLabel>
//                     <FormControl>
//                       <Input placeholder="e.g., AC987654327" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="bank"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Bank</FormLabel>
//                     <FormControl>
//                       <Input placeholder="e.g., DBBL" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="branch"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Branch</FormLabel>
//                     <FormControl>
//                       <Input placeholder="e.g., GEC Branch" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="company"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Company</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         placeholder="e.g., 101"
//                         value={field.value}
//                         onChange={(e) => field.onChange(Number(e.target.value))}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="faceValue"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Face Value</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         placeholder="e.g., 75000000"
//                         {...field}
//                         onChange={(e) => field.onChange(Number(e.target.value))}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="interestRate"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Interest Rate (%)</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         step="0.1"
//                         placeholder="e.g., 7.5"
//                         {...field}
//                         onChange={(e) => field.onChange(Number(e.target.value))}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="term"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Term (Months)</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         placeholder="e.g., 24"
//                         {...field}
//                         onChange={(e) => field.onChange(Number(e.target.value))}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="maturedDate"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Matured Date</FormLabel>
//                     <FormControl>
//                       <Input type="date" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
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
// import { CompanyType } from '@/api/company-api'

// interface FdrCreateType {
//   fdrNo: string
//   fdrDate: string
//   accountNo: string
//   bank: string
//   branch: string
//   faceValue: number
//   interestRate: number
//   term: number
//   maturedDate: string
//   company: number
//   createdBy: number
// }

// interface UserData {
//   userId: number
//   companyId?: number
// }

// // Form validation schema
// const fdrSchema = z.object({
//   fdrNo: z.string().min(1, 'FDR Number is required'),
//   fdrDate: z.string().min(1, 'FDR Date is required'),
//   accountNo: z.string().min(1, 'Account Number is required'),
//   bank: z.string().min(1, 'Bank name is required'),
//   branch: z.string().min(1, 'Branch name is required'),
//   faceValue: z.number().min(1, 'Face Value must be greater than 0'),
//   interestRate: z.number().min(0.1, 'Interest Rate must be greater than 0'),
//   term: z.number().min(1, 'Term must be at least 1 month'),
//   maturedDate: z.string().min(1, 'Matured Date is required'),
//   company: z.number().min(1, 'Company is required'),
//   createdBy: z.number(),
// })

// interface FdrRecordPopUpProps {
//   isOpen: boolean
//   onOpenChange: (open: boolean) => void
//   onRecordAdded: () => void
//   companyData: CompanyType[] // Pass company data as prop

//   refreshFdrData: () => void // ✅ Accept the function as prop
// }

// const FdrRecordPopUp: React.FC<FdrRecordPopUpProps> = ({
//   isOpen,
//   onOpenChange,
//   onRecordAdded,
//   companyData,
//   refreshFdrData,
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
//       company: 0,
//       createdBy: userData?.userId || 0, // Use userData from props or default to 0
//     },
//   })

//   // Debug: log form validation errors
//   useEffect(() => {
//     console.log('Form Errors:', form.formState.errors)
//   }, [form.formState.errors])

//   const onSubmit = async (values: z.infer<typeof fdrSchema>) => {
//     console.log('Submit triggered with values:', values)

//     if (!userData?.userId) {
//       toast({
//         title: 'Error',
//         description:
//           'User information not available. Please refresh and try again.',
//         variant: 'destructive',
//       })
//       return
//     }

//     setIsLoading(true)

//     try {
//       const fdrData: FdrCreateType = {
//         ...values,
//         createdBy: userData.userId,
//       }

//       console.log('Sending to API:', fdrData)

//       const result = await createFdr(fdrData, token)

//       console.log('FDR created:', result)

//       toast({
//         title: 'Success',
//         description: 'FDR record created successfully',
//       })

//       form.reset()
//       onRecordAdded()
//       onOpenChange(false)
//       refreshFdrData()
//     } catch (error) {
//       console.error('Error submitting form:', error)
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
//               {/* FDR Fields */}
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
//                 {
//                   name: 'bank',
//                   label: 'Bank',
//                   placeholder: 'DBBL',
//                 },
//                 {
//                   name: 'branch',
//                   label: 'Branch',
//                   placeholder: 'GEC Branch',
//                 },
//                 {
//                   name: 'company',
//                   label: 'Company',
//                   type: 'number',
//                   placeholder: '1',
//                 },
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
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               ))}
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
import { CompanyType } from '@/api/company-api'
import { CustomCombobox } from '@/utils/custom-combobox'


interface FdrCreateType {
  fdrNo: string
  fdrDate: string
  accountNo: string
  bank: string
  branch: string
  faceValue: number
  interestRate: number
  term: number
  maturedDate: string
  company: number
  createdBy: number
}

interface UserData {
  userId: number
  companyId?: number
}

// Form validation schema
const fdrSchema = z.object({
  fdrNo: z.string().min(1, 'FDR Number is required'),
  fdrDate: z.string().min(1, 'FDR Date is required'),
  accountNo: z.string().min(1, 'Account Number is required'),
  bank: z.string().min(1, 'Bank name is required'),
  branch: z.string().min(1, 'Branch name is required'),
  faceValue: z.number().min(1, 'Face Value must be greater than 0'),
  interestRate: z.number().min(0.1, 'Interest Rate must be greater than 0'),
  term: z.number().min(1, 'Term must be at least 1 month'),
  maturedDate: z.string().min(1, 'Matured Date is required'),
  company: z.number().min(1, 'Company is required'),
  createdBy: z.number(),
})

interface FdrRecordPopUpProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onRecordAdded: () => void
  companyData: CompanyType[]
  refreshFdrData: () => void
}

const FdrRecordPopUp: React.FC<FdrRecordPopUpProps> = ({
  isOpen,
  onOpenChange,
  onRecordAdded,
  companyData,
  refreshFdrData,
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
      company: 0,
      createdBy: userData?.userId || 0,
    },
  })

  useEffect(() => {
    console.log('Form Errors:', form.formState.errors)
  }, [form.formState.errors])

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

    setIsLoading(true)

    try {
      const fdrData: FdrCreateType = {
        ...values,
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              {/* ✅ Company Combobox */}
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
                        field.onChange(value ? Number(value.id) : 0)
                      }
                      placeholder="Select a company"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
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
