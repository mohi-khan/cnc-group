'use client'

import { X, Plus } from 'lucide-react'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
} from '@/components/ui/form'
import { JournalVoucherMasterSection } from './journal-voucher-master-section'
import { JournalVoucherDetailsSection } from './journal-voucher-details-section'
import { JournalVoucherSubmit } from './journal-voucher-submit'
import {
  Employee,
  JournalEditWithDetails,
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  VoucherTypes,
} from '@/utils/type'
import { editJournalEntryWithDetails } from '@/api/vouchers-api'
import { useAtom } from 'jotai'
import { tokenAtom } from '@/utils/user'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getEmployee } from '@/api/common-shared-api'
import { useRouter } from 'next/navigation'
import type { LastUsedJournalValues } from './journal-voucher-list'

interface JournalVoucherPopupProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  handleSubmit: (
    data: JournalEntryWithDetails | JournalEditWithDetails,
    resetForm: () => void
  ) => void
  isSubmitting: boolean
  initialData?: JournalEntryWithDetails | JournalEditWithDetails
  isEdit?: boolean
  onClose?: () => void
  // ── Last-used props (passed from journal-voucher-list) ──
  lastUsedValues?: LastUsedJournalValues | null
  showLastUsedBanner?: boolean
  onClearLastUsed?: () => void
}

/** Static default — no localStorage read here (avoids SSR/client mismatch). */
const staticDefault = (
  lastUsed?: LastUsedJournalValues | null
): JournalEntryWithDetails => ({
  journalEntry: {
    date: lastUsed?.date ?? new Date().toISOString().split('T')[0],
    journalType: VoucherTypes.JournalVoucher,
    state: 0,
    companyId: lastUsed?.companyId ?? 0,
    locationId: lastUsed?.locationId ?? 0,
    currencyId: lastUsed?.currencyId ?? 1,
    exchangeRate: 1,
    amountTotal: 0,
    createdBy: 0,
  },
  journalDetails: [
    {
      accountId: 0,
      debit: 0,
      credit: 0,
      createdBy: 0,
      resPartnerId: null,
      costCenterId: null,
      departmentId: null,
    },
  ],
})

export function JournalVoucherPopup({
  isOpen,
  onOpenChange,
  handleSubmit,
  isSubmitting,
  initialData,
  isEdit,
  onClose,
  lastUsedValues,
  showLastUsedBanner: showBannerProp = false,
  onClearLastUsed,
}: JournalVoucherPopupProps) {
  const [token] = useAtom(tokenAtom)
  const router = useRouter()
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)

  // Local banner state — driven by prop but can be dismissed without clearing storage
  const [showBanner, setShowBanner] = useState(false)

  // Keep local banner in sync with prop (e.g. after a successful save)
  useEffect(() => {
    setShowBanner(showBannerProp)
  }, [showBannerProp])

  const fetchEmployees = useCallback(async () => {
    setIsLoadingEmployees(true)
    if (!token) return
    try {
      const response = await getEmployee(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (response.error || !response.data) {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to load employees',
        })
        setEmployees([])
      } else {
        setEmployees(response.data)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load employees' })
      setEmployees([])
    } finally {
      setIsLoadingEmployees(false)
    }
  }, [token, router])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // ─── Build defaultValues ──────────────────────────────────────────────────────
  // When editing/duplicating: use initialData.
  // When creating: use last-used values if available, otherwise blank.
  const defaultValues = useMemo(() => {
    if (initialData) {
      return {
        ...initialData,
        journalDetails: initialData.journalDetails.map((detail) => ({
          ...detail,
          accountId: Number(detail.accountId || 0),
          resPartnerId:
            detail.resPartnerId == null ? null : Number(detail.resPartnerId),
          costCenterId:
            detail.costCenterId == null ? null : Number(detail.costCenterId),
          departmentId:
            detail.departmentId == null ? null : Number(detail.departmentId),
        })),
      }
    }
    // New voucher — apply last-used master values (company, location, currency, date)
    return staticDefault(lastUsedValues)
  }, [initialData, lastUsedValues])

  const form = useForm<JournalEntryWithDetails | JournalEditWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues,
  })

  const resetForm = useCallback(() => {
    // After reset, re-apply last-used values so the next voucher is pre-filled
    form.reset(staticDefault(lastUsedValues))
  }, [form, lastUsedValues])

  // Reset form whenever the dialog opens/closes or defaultValues change
  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues)
    } else {
      resetForm()
    }
  }, [isOpen, defaultValues, form, resetForm])

  // ─── Handle "Clear" button in the banner ──────────────────────────────────────
  const handleClearBanner = () => {
    setShowBanner(false)
    onClearLastUsed?.()
    // Reset to blank (no last-used values)
    form.reset(staticDefault(null))
  }

  const addEntry = () => {
    const currentEntries = form.getValues('journalDetails')
    form.setValue('journalDetails', [
      ...currentEntries,
      {
        accountId: 0,
        debit: 0,
        credit: 0,
        createdBy: 0,
        resPartnerId: null,
        costCenterId: null,
        departmentId: null,
      },
    ])
  }

  const removeEntry = (index: number) => {
    const currentEntries = form.getValues('journalDetails')
    if (currentEntries.length > 1) {
      form.setValue(
        'journalDetails',
        currentEntries.filter((_, i) => i !== index)
      )
    }
  }

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith('journalDetails')) {
        const totalDebit =
          value.journalDetails?.reduce(
            (sum, detail) => sum + (detail?.debit || 0),
            0
          ) || 0
        const totalCredit =
          value.journalDetails?.reduce(
            (sum, detail) => sum + (detail?.credit || 0),
            0
          ) || 0
        form.setValue(
          'journalEntry.amountTotal',
          Math.max(totalDebit, totalCredit)
        )
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const onSubmit = async (
    data: JournalEntryWithDetails | JournalEditWithDetails
  ) => {
    if (!isEdit) {
      handleSubmit(data, resetForm)
    } else {
      const payload: JournalEditWithDetails = {
        ...(initialData as JournalEditWithDetails),
        ...data,
        journalEntry: {
          ...(initialData as JournalEditWithDetails).journalEntry,
          ...data.journalEntry,
          id: (initialData as JournalEditWithDetails).journalEntry.id,
        },
        journalDetails: (data.journalDetails || []).map((detail, idx) => {
          const baseDetail =
            (initialData as JournalEditWithDetails).journalDetails[idx] || {}
          return {
            ...baseDetail,
            ...detail,
            accountId: Number(detail.accountId || baseDetail.accountId || 0),
            resPartnerId:
              detail.resPartnerId == null
                ? null
                : Number(detail.resPartnerId),
            costCenterId:
              detail.costCenterId == null
                ? null
                : Number(detail.costCenterId),
            departmentId:
              detail.departmentId == null
                ? null
                : Number(detail.departmentId),
          }
        }),
      }

      const response = await editJournalEntryWithDetails(payload, token)

      if (response.error || !response.data) {
        toast({
          title: 'Error',
          description: response.error?.message || 'Error editing Journal',
        })
      } else {
        toast({ title: 'Success', description: 'Voucher is edited successfully' })
        resetForm()
        onClose?.()
      }
    }
  }

  const entries = form.watch('journalDetails') || []
  const totals = entries.reduce(
    (acc, entry) => ({
      debit: acc.debit + (entry?.debit || 0),
      credit: acc.credit + (entry?.credit || 0),
    }),
    { debit: 0, credit: 0 }
  )

  const isBalanced =
    totals.debit === totals.credit && totals.debit > 0 && totals.credit > 0

  return (
    <>
      {!initialData && (
        <Button onClick={() => onOpenChange(true)}>
          <Plus className="mr-2 h-4 w-4" /> ADD
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={onOpenChange} modal>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="max-w-6xl h-[95vh] overflow-hidden"
        >
          <DialogHeader>
            <div>
              <DialogTitle>Journal Voucher</DialogTitle>
              <DialogDescription>
                Enter the details for the journal voucher here. Click save when
                you are done.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[85vh] p-4">
            {/*
              ── Last-used banner ──
              showBanner starts false on both server and client.
              It is only set to true inside useEffect (client-only).
              This guarantees SSR HTML and initial client render are identical.
            */}
            {showBanner && !initialData && !isEdit && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-medium">
                    ℹ️ Using last filled values
                  </span>
                  <span className="text-sm text-blue-700">
                    (Company, Location, Currency, Date)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearBanner}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <JournalVoucherMasterSection form={form} />

                <JournalVoucherDetailsSection
                  form={form}
                  onAddEntry={addEntry}
                  onRemoveEntry={removeEntry}
                  isEdit={isEdit}
                  employees={employees}
                />

                <JournalVoucherSubmit
                  form={form}
                  onSubmit={form.handleSubmit(onSubmit)}
                  isSubmitting={isSubmitting}
                  isBalanced={isBalanced}
                />
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// 'use client'

// import { X, Plus } from 'lucide-react'
// import React, { useState, useEffect, useCallback, useMemo } from 'react'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useForm } from 'react-hook-form'
// import { Button } from '@/components/ui/button'
// import {
//   Form,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormDescription,
//   FormMessage,
//   FormField,
// } from '@/components/ui/form'
// import { JournalVoucherMasterSection } from './journal-voucher-master-section'
// import { JournalVoucherDetailsSection } from './journal-voucher-details-section'
// import { JournalVoucherSubmit } from './journal-voucher-submit'
// import {
//   Employee,
//   JournalEditWithDetails,
//   type JournalEntryWithDetails,
//   JournalEntryWithDetailsSchema,
//   VoucherTypes,
// } from '@/utils/type'
// import { editJournalEntryWithDetails } from '@/api/vouchers-api'
// import { useAtom } from 'jotai'
// import { tokenAtom } from '@/utils/user'
// import { toast } from '@/hooks/use-toast'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import { getEmployee } from '@/api/common-shared-api'
// import { useRouter } from 'next/navigation'

// interface JournalVoucherPopupProps {
//   isOpen: boolean
//   onOpenChange: (open: boolean) => void
//   handleSubmit: (
//     data: JournalEntryWithDetails | JournalEditWithDetails,
//     resetForm: () => void
//   ) => void
//   isSubmitting: boolean
//   initialData?: JournalEntryWithDetails | JournalEditWithDetails
//   isEdit?: boolean
//   onClose?: () => void
// }

// export function JournalVoucherPopup({
//   isOpen,
//   onOpenChange,
//   handleSubmit,
//   isSubmitting,
//   initialData,
//   isEdit,
//   onClose,
// }: JournalVoucherPopupProps) {
//   const [token] = useAtom(tokenAtom)
//   const router = useRouter()
//   const [employees, setEmployees] = React.useState<Employee[]>([])
//   const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)

//   const fetchEmployees = useCallback(async () => {
//     setIsLoadingEmployees(true)
//     if (!token) return
//     try {
//       const response = await getEmployee(token)
//       if (response?.error?.status === 401) {
//         router.push('/unauthorized-access')
//         return
//       } else if (response.error || !response.data) {
//         console.error('Error getting employees:', response.error)
//         toast({
//           title: 'Error',
//           description: response.error?.message || 'Failed to load employees',
//         })
//         setEmployees([])

//         return
//       } else {
//         setEmployees(response.data)
//         console.log('Fetched Employees riad:', response.data)
//       }
//     } catch (error) {
//       console.error('Error getting employees:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to load employees',
//       })
//       setEmployees([])
//     } finally {
//       setIsLoadingEmployees(false)
//     }
//   }, [token, router])

//   useEffect(() => {
//     fetchEmployees()
//   }, [fetchEmployees])

//   const defaultValues = useMemo(
//     () =>
//       initialData
//         ? {
//             ...initialData,
//             journalDetails: initialData.journalDetails.map((detail) => ({
//               ...detail,
//               accountId: Number(detail.accountId || 0),
//               resPartnerId:
//                 detail.resPartnerId === null ||
//                 detail.resPartnerId === undefined
//                   ? null
//                   : Number(detail.resPartnerId),
//               costCenterId:
//                 detail.costCenterId === null ||
//                 detail.costCenterId === undefined
//                   ? null
//                   : Number(detail.costCenterId),
//               departmentId:
//                 detail.departmentId === null ||
//                 detail.departmentId === undefined
//                   ? null
//                   : Number(detail.departmentId),
//             })),
//           }
//         : {
//             journalEntry: {
//               date: new Date().toISOString().split('T')[0],
//               journalType: VoucherTypes.JournalVoucher,
//               state: 0,
//               companyId: 0,
//               locationId: 0,
//               currencyId: 1,
//               exchangeRate: 1,
//               amountTotal: 0,
//               createdBy: 0,
//             },
//             journalDetails: [
//               {
//                 accountId: 0,
//                 debit: 0,
//                 credit: 0,
//                 createdBy: 0,
//                 resPartnerId: null,
//                 costCenterId: null,
//                 departmentId: null,
//               },
//             ],
//           },
//     [initialData]
//   )

//   const form = useForm<JournalEntryWithDetails | JournalEditWithDetails>({
//     resolver: zodResolver(JournalEntryWithDetailsSchema),
//     defaultValues,
//   })

//   const resetForm = useCallback(() => {
//     form.reset(defaultValues)
//   }, [form, defaultValues])

//   useEffect(() => {
//     if (isOpen) {
//       form.reset(defaultValues)
//     } else {
//       resetForm()
//     }
//   }, [isOpen, defaultValues, form, resetForm])

//   const addEntry = () => {
//     const currentEntries = form.getValues('journalDetails')
//     form.setValue('journalDetails', [
//       ...currentEntries,
//       {
//         accountId: 0,
//         debit: 0,
//         credit: 0,
//         createdBy: 0,
//         resPartnerId: null,
//         costCenterId: null,
//         departmentId: null,
//       },
//     ])
//   }

//   const removeEntry = (index: number) => {
//     const currentEntries = form.getValues('journalDetails')
//     if (currentEntries.length > 1) {
//       form.setValue(
//         'journalDetails',
//         currentEntries.filter((_, i) => i !== index)
//       )
//     }
//   }

//   useEffect(() => {
//     const subscription = form.watch((value, { name }) => {
//       if (name?.startsWith('journalDetails')) {
//         const totalDebit =
//           value.journalDetails?.reduce(
//             (sum, detail) => sum + (detail?.debit || 0),
//             0
//           ) || 0
//         const totalCredit =
//           value.journalDetails?.reduce(
//             (sum, detail) => sum + (detail?.credit || 0),
//             0
//           ) || 0
//         form.setValue(
//           'journalEntry.amountTotal',
//           Math.max(totalDebit, totalCredit)
//         )
//       }
//     })
//     return () => subscription.unsubscribe()
//   }, [form])

//   const onSubmit = async (
//     data: JournalEntryWithDetails | JournalEditWithDetails
//   ) => {
//     if (!isEdit) {
//       handleSubmit(data, resetForm)
//     } else {
//       const payload: JournalEditWithDetails = {
//         ...(initialData as JournalEditWithDetails),
//         ...data,
//         journalEntry: {
//           ...(initialData as JournalEditWithDetails).journalEntry,
//           ...data.journalEntry,
//           id: (initialData as JournalEditWithDetails).journalEntry.id,
//         },
//         journalDetails: (data.journalDetails || []).map((detail, idx) => {
//           const baseDetail =
//             (initialData as JournalEditWithDetails).journalDetails[idx] || {}

//           return {
//             ...baseDetail,
//             ...detail,
//             accountId: Number(detail.accountId || baseDetail.accountId || 0),
//             resPartnerId:
//               detail.resPartnerId === null || detail.resPartnerId === undefined
//                 ? null
//                 : Number(detail.resPartnerId),
//             costCenterId:
//               detail.costCenterId === null || detail.costCenterId === undefined
//                 ? null
//                 : Number(detail.costCenterId),
//             departmentId:
//               detail.departmentId === null || detail.departmentId === undefined
//                 ? null
//                 : Number(detail.departmentId),
//           }
//         }),
//       }

//       const response = await editJournalEntryWithDetails(payload, token)

//       if (response.error || !response.data) {
//         toast({
//           title: 'Error',
//           description: response.error?.message || 'Error editing Journal',
//         })
//       } else {
//         toast({
//           title: 'Success',
//           description: 'Voucher is edited successfully',
//         })
//         resetForm()
//         onClose?.()
//       }
//     }
//   }

//   // Calculate if debit and credit are balanced
//   // In JournalVoucherPopup component, update the isBalanced calculation:

//   const entries = form.watch('journalDetails') || []
//   const totals = entries.reduce(
//     (acc, entry) => ({
//       debit: acc.debit + (entry?.debit || 0),
//       credit: acc.credit + (entry?.credit || 0),
//     }),
//     { debit: 0, credit: 0 }
//   )

//   // Updated validation: totals must be equal AND greater than 0
//   const isBalanced =
//     totals.debit === totals.credit && totals.debit > 0 && totals.credit > 0

//   return (
//     <>
//       {!initialData && (
//         <Button onClick={() => onOpenChange(true)}>
//           <Plus className="mr-2 h-4 w-4" /> ADD
//         </Button>
//       )}

//       <Dialog open={isOpen} onOpenChange={onOpenChange} modal>
//         <DialogContent
//           onInteractOutside={(e) => e.preventDefault()}
//           className="max-w-6xl h-[95vh] overflow-hidden"
//         >
//           <DialogHeader>
//             <div>
//               <DialogTitle>Journal Voucher</DialogTitle>
//               <DialogDescription>
//                 Enter the details for the journal voucher here. Click save when
//                 you are done.
//               </DialogDescription>
//             </div>
//           </DialogHeader>

//           <div className="overflow-y-auto max-h-[85vh] p-4">
//             <Form {...form}>
//               <form
//                 onSubmit={form.handleSubmit(onSubmit)}
//                 className="space-y-6"
//               >
//                 <JournalVoucherMasterSection form={form} />

//                 <JournalVoucherDetailsSection
//                   form={form}
//                   onAddEntry={addEntry}
//                   onRemoveEntry={removeEntry}
//                   isEdit={isEdit}
//                   employees={employees}
//                 />

//                 <JournalVoucherSubmit
//                   form={form}
//                   onSubmit={form.handleSubmit(onSubmit)}
//                   isSubmitting={isSubmitting}
//                   isBalanced={isBalanced}
//                 />
//               </form>
//             </Form>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }
