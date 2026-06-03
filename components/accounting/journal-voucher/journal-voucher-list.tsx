'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { JournalVoucherMasterSection } from './journal-voucher-master-section'
import { JournalVoucherDetailsSection } from './journal-voucher-details-section'
import { JournalVoucherSubmit } from './journal-voucher-submit'
import { JournalVoucherPopup } from './journal-voucher-popup'
import {
  type CompanyFromLocalstorage,
  type JournalEntryWithDetails,
  type JournalQuery,
  JournalResult,
  type LocationFromLocalstorage,
  VoucherTypes,
  JournalEntryWithDetailsSchema,
  Employee,
} from '@/utils/type'
import { toast } from '@/hooks/use-toast'
import {
  createJournalEntryWithDetails,
  getAllVoucher,
} from '@/api/journal-voucher-api'
import VoucherList from '@/components/voucher-list/voucher-list'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { getLocalDateString } from '@/utils/localtime'
import { getEmployee } from '@/api/common-shared-api'

// ─── localStorage key ──────────────────────────────────────────────────────────
const LAST_USED_KEY = 'lastJournalVoucherValues'

// ─── Shape saved to localStorage ──────────────────────────────────────────────
export interface LastUsedJournalValues {
  companyId: number
  locationId: number
  currencyId: number
  date: string
}

/** Static default — no localStorage read here (avoids SSR/client mismatch). */
const staticDefault = (
  lastUsed?: LastUsedJournalValues | null
): JournalEntryWithDetails => ({
  journalEntry: {
    date: lastUsed?.date ?? getLocalDateString(),
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

export default function VoucherTable() {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [vouchers, setVouchers] = useState<JournalResult[]>([])
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
  const [userId, setUserId] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])

  // ── Last-used state (client-only — starts null to avoid SSR mismatch) ─────────
  const [lastUsedValues, setLastUsedValues] =
    useState<LastUsedJournalValues | null>(null)
  const [showLastUsedBanner, setShowLastUsedBanner] = useState(false)

  // ─── Flat form state ──────────────────────────────────────────────────────────
  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: staticDefault(null),
  })

  // ✅ form.reset কে ref এ রাখলে useEffect dependency loop হবে না
  const formResetRef = React.useRef(form.reset)
  useEffect(() => {
    formResetRef.current = form.reset
  })

  // ─── localStorage helpers ────────────────────────────────────────────────────
  const getLastUsedValues = useCallback((): LastUsedJournalValues | null => {
    try {
      const saved = localStorage.getItem(LAST_USED_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }, [])

  const saveLastUsedValues = useCallback((values: JournalEntryWithDetails) => {
    try {
      const toSave: LastUsedJournalValues = {
        companyId: values.journalEntry.companyId,
        locationId: values.journalEntry.locationId,
        currencyId: values.journalEntry.currencyId,
        date: values.journalEntry.date,
      }
      localStorage.setItem(LAST_USED_KEY, JSON.stringify(toSave))
    } catch {
      // silently ignore write failures
    }
  }, [])

  const clearLastUsedValues = useCallback(() => {
    try {
      localStorage.removeItem(LAST_USED_KEY)
    } catch {
      // ignore
    }
    setLastUsedValues(null)
    setShowLastUsedBanner(false)
  }, [])

  // ─── Client-only: restore last-used values AFTER first paint ─────────────────
  useEffect(() => {
    const last = getLastUsedValues()
    if (!last) return
    if (!last.companyId && !last.currencyId) return
    setLastUsedValues(last)
    setShowLastUsedBanner(true)
    formResetRef.current(staticDefault(last))
  }, [getLastUsedValues])

  // ─── Fetch Employees ─────────────────────────────────────────────────────────
  const fetchEmployees = useCallback(async () => {
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
    }
  }, [token, router])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // ─── Columns / link ──────────────────────────────────────────────────────────
  const columns = [
    { key: 'voucherno' as const, label: 'Voucher No.' },
    { key: 'date' as const, label: 'Voucher Date' },
    { key: 'companyname' as const, label: 'Company Name' },
    { key: 'location' as const, label: 'Location' },
    { key: 'currency' as const, label: 'Currency' },
    { key: 'state' as const, label: 'Status' },
    { key: 'totalamount' as const, label: 'Amount' },
  ]

  const linkGenerator = (voucherId: number) =>
    `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.JournalVoucher}`

  // ─── Fetch vouchers ──────────────────────────────────────────────────────────
  const fetchAllVoucher = useCallback(
    async (company: number[], location: number[], token: string) => {
      setIsLoading(true)
      const voucherQuery: JournalQuery = {
        date: getLocalDateString(),
        companyId: company,
        locationId: location,
        voucherType: VoucherTypes.JournalVoucher,
      }

      try {
        if (!token) return
        const response = await getAllVoucher(voucherQuery, token)
        if (response?.error?.status === 401) {
          router.push('/unauthorized-access')
          return
        } else if (response.error || !response.data) {
          toast({
            title: 'Error',
            description: response.error?.message || 'Failed to fetch vouchers',
            variant: 'destructive',
          })
          setVouchers([])
        } else {
          let data = Array.isArray(response.data) ? response.data : []

          if (userData?.roleId !== 1) {
            data = data.filter(
              (item) => Number(item.createdBy) === Number(userData?.userId)
            )
          }

          setVouchers(data)
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch vouchers. Please try again.',
          variant: 'destructive',
        })
        setVouchers([])
      } finally {
        setIsLoading(false)
      }
    },
    [router, userData]
  )

  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }
  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
  }

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')
      if (!storedUserData || !storedToken) {
        router.push('/')
        return
      }
    }

    checkUserData()
    if (userData) {
      setUserId(userData.userId)
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
      fetchAllVoucher(
        getCompanyIds(userData.userCompanies),
        getLocationIds(userData.userLocations),
        token
      )
    } else {
      setIsLoading(false)
    }
  }, [fetchAllVoucher, router, userData, token])

  // ─── amountTotal auto-calculate (watch journalDetails) ───────────────────────
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

  // ─── Reset form after successful submit ──────────────────────────────────────
  const resetForm = useCallback(() => {
    form.reset(staticDefault(lastUsedValues))
  }, [form, lastUsedValues])

  // ─── Add / Remove entry ───────────────────────────────────────────────────────
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

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (data: JournalEntryWithDetails) => {
    setIsSubmitting(true)

    const submissionData = {
      ...data,
      journalEntry: {
        ...data.journalEntry,
        amountTotal: data.journalEntry.amountTotal,
        createdBy: userId,
      },
      journalDetails: data.journalDetails.map((detail) => ({
        ...detail,
        createdBy: userId,
        costCenterId: detail.costCenterId || null,
        departmentId: detail.departmentId || null,
      })),
    }

    const response = await createJournalEntryWithDetails(submissionData, token)

    if (response.error || !response.data) {
      toast({
        title: 'Error',
        description: `${response.error?.message}`,
        variant: 'destructive',
      })
    } else {
      // ✅ Persist last-used values on successful create
      saveLastUsedValues(data)
      setShowLastUsedBanner(true)
      setLastUsedValues({
        companyId: data.journalEntry.companyId,
        locationId: data.journalEntry.locationId,
        currencyId: data.journalEntry.currencyId,
        date: data.journalEntry.date,
      })

      toast({
        title: 'Success',
        description: 'Voucher created successfully',
      })
      resetForm()
    }

    setIsSubmitting(false)
    fetchAllVoucher(getCompanyIds(companies), getLocationIds(locations), token)
  }

  // ─── isBalanced check ─────────────────────────────────────────────────────────
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

  // ─── Handle clear banner ──────────────────────────────────────────────────────
  const handleClearBanner = () => {
    setShowLastUsedBanner(false)
    clearLastUsedValues()
    form.reset(staticDefault(null))
  }

  return (
    <div className="w-[97%] mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Journal Vouchers</h1>

      {/* ✅ FLAT CREATE FORM — সরাসরি page এ, popup নেই */}
      <div className="border rounded-xl shadow-md p-6 mb-8 bg-white">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Create Journal Voucher
        </h2>

        {/* Last-used banner */}
        {showLastUsedBanner && (
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
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <JournalVoucherMasterSection form={form} />

            <JournalVoucherDetailsSection
              form={form}
              onAddEntry={addEntry}
              onRemoveEntry={removeEntry}
              isEdit={false}
              employees={employees}
            />

            <JournalVoucherSubmit
              form={form}
              onSubmit={form.handleSubmit(handleSubmit)}
              isSubmitting={isSubmitting}
              isBalanced={isBalanced}
            />
          </form>
        </Form>
      </div>

      {/* ✅ Voucher List — নিচে থাকবে */}
      <VoucherList
        vouchers={vouchers}
        columns={columns}
        isLoading={isLoading}
        linkGenerator={linkGenerator}
        itemsPerPage={10}
      />
    </div>
  )
}


// 'use client'

// import React, { useState, useEffect, useCallback } from 'react'
// import { JournalVoucherPopup } from './journal-voucher-popup'
// import {
//   type CompanyFromLocalstorage,
//   type JournalEntryWithDetails,
//   type JournalQuery,
//   JournalResult,
//   type LocationFromLocalstorage,
//   VoucherTypes,
// } from '@/utils/type'
// import { toast } from '@/hooks/use-toast'
// import {
//   createJournalEntryWithDetails,
//   getAllVoucher,
// } from '@/api/journal-voucher-api'
// import VoucherList from '@/components/voucher-list/voucher-list'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { useRouter } from 'next/navigation'
// import { getLocalDateString } from '@/utils/localtime'

// // ─── localStorage key ──────────────────────────────────────────────────────────
// const LAST_USED_KEY = 'lastJournalVoucherValues'

// // ─── Shape saved to localStorage ──────────────────────────────────────────────
// export interface LastUsedJournalValues {
//   companyId: number
//   locationId: number
//   currencyId: number
//   date: string
// }

// export default function VoucherTable() {
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)
//   const router = useRouter()

//   const [vouchers, setVouchers] = useState<JournalResult[]>([])
//   const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
//   const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
//   const [userId, setUserId] = useState(0)
//   const [isLoading, setIsLoading] = useState(true)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [isPopupOpen, setIsPopupOpen] = useState(false)

//   // ── Last-used state (client-only — starts null to avoid SSR mismatch) ─────────
//   const [lastUsedValues, setLastUsedValues] =
//     useState<LastUsedJournalValues | null>(null)
//   const [showLastUsedBanner, setShowLastUsedBanner] = useState(false)

//   // ─── localStorage helpers ────────────────────────────────────────────────────
//   const getLastUsedValues = useCallback((): LastUsedJournalValues | null => {
//     try {
//       const saved = localStorage.getItem(LAST_USED_KEY)
//       return saved ? JSON.parse(saved) : null
//     } catch {
//       return null
//     }
//   }, [])

//   const saveLastUsedValues = useCallback((values: JournalEntryWithDetails) => {
//     try {
//       const toSave: LastUsedJournalValues = {
//         companyId: values.journalEntry.companyId,
//         locationId: values.journalEntry.locationId,
//         currencyId: values.journalEntry.currencyId,
//         date: values.journalEntry.date,
//       }
//       localStorage.setItem(LAST_USED_KEY, JSON.stringify(toSave))
//     } catch {
//       // silently ignore write failures
//     }
//   }, [])

//   const clearLastUsedValues = useCallback(() => {
//     try {
//       localStorage.removeItem(LAST_USED_KEY)
//     } catch {
//       // ignore
//     }
//     setLastUsedValues(null)
//     setShowLastUsedBanner(false)
//   }, [])

//   // ─── Client-only: restore last-used values AFTER first paint ─────────────────
//   useEffect(() => {
//     const last = getLastUsedValues()
//     if (!last) return
//     if (!last.companyId && !last.currencyId) return
//     setLastUsedValues(last)
//     setShowLastUsedBanner(true)
//   }, [getLastUsedValues])

//   // ─── Columns / link ──────────────────────────────────────────────────────────
//   const columns = [
//     { key: 'voucherno' as const, label: 'Voucher No.' },
//     { key: 'date' as const, label: 'Voucher Date' },
//     { key: 'companyname' as const, label: 'Company Name' },
//     { key: 'location' as const, label: 'Location' },
//     { key: 'currency' as const, label: 'Currency' },
//     { key: 'state' as const, label: 'Status' },
//     { key: 'totalamount' as const, label: 'Amount' },
//   ]

//   const linkGenerator = (voucherId: number) =>
//     `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.JournalVoucher}`

//   // ─── Fetch vouchers ──────────────────────────────────────────────────────────
//   const fetchAllVoucher = useCallback(
//   async (company: number[], location: number[], token: string) => {
//     setIsLoading(true)
//     const voucherQuery: JournalQuery = {
//       date: getLocalDateString(),
//       companyId: company,
//       locationId: location,
//       voucherType: VoucherTypes.JournalVoucher,
//     }

//     try {
//       if (!token) return
//       const response = await getAllVoucher(voucherQuery, token)
//       if (response?.error?.status === 401) {
//         router.push('/unauthorized-access')
//         return
//       } else if (response.error || !response.data) {
//         toast({
//           title: 'Error',
//           description: response.error?.message || 'Failed to fetch vouchers',
//           variant: 'destructive',
//         })
//         setVouchers([])
//       } else {
//         let data = Array.isArray(response.data) ? response.data : []

//         // ✅ Admin হলে সব দেখাবে, অন্যরা শুধু নিজেরটা
//         if (userData?.roleId !== 1) {
//           data = data.filter(
//             (item) => Number(item.createdBy) === Number(userData?.userId)
//           )
//         }

//         setVouchers(data)
//       }
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to fetch vouchers. Please try again.',
//         variant: 'destructive',
//       })
//       setVouchers([])
//     } finally {
//       setIsLoading(false)
//     }
//   },
//   [router, userData] // ✅ userData যোগ করুন
// )

//   function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
//     return data.map((company) => company.company.companyId)
//   }
//   function getLocationIds(data: LocationFromLocalstorage[]): number[] {
//     return data.map((location) => location.location.locationId)
//   }

//   useEffect(() => {
//     const checkUserData = () => {
//       const storedUserData = localStorage.getItem('currentUser')
//       const storedToken = localStorage.getItem('authToken')
//       if (!storedUserData || !storedToken) {
//         router.push('/')
//         return
//       }
//     }

//     checkUserData()
//     if (userData) {
//       setUserId(userData.userId)
//       setCompanies(userData.userCompanies)
//       setLocations(userData.userLocations)
//       fetchAllVoucher(
//         getCompanyIds(userData.userCompanies),
//         getLocationIds(userData.userLocations),
//         token
//       )
//     } else {
//       setIsLoading(false)
//     }
//   }, [fetchAllVoucher, router, userData, token])

//   // ─── Submit ──────────────────────────────────────────────────────────────────
//   const handleSubmit = async (
//     data: JournalEntryWithDetails,
//     resetForm: () => void
//   ) => {
//     setIsSubmitting(true)

//     const submissionData = {
//       ...data,
//       journalEntry: {
//         ...data.journalEntry,
//         amountTotal: data.journalEntry.amountTotal,
//         createdBy: userId,
//       },
//       journalDetails: data.journalDetails.map((detail) => ({
//         ...detail,
//         createdBy: userId,
//         costCenterId: detail.costCenterId || null,
//         departmentId: detail.departmentId || null,
//       })),
//     }

//     const response = await createJournalEntryWithDetails(submissionData, token)

//     if (response.error || !response.data) {
//       toast({
//         title: 'Error',
//         description: `${response.error?.message}`,
//         variant: 'destructive',
//       })
//     } else {
//       // ✅ Persist last-used values on successful create
//       saveLastUsedValues(data)
//       setShowLastUsedBanner(true)
//       setLastUsedValues({
//         companyId: data.journalEntry.companyId,
//         locationId: data.journalEntry.locationId,
//         currencyId: data.journalEntry.currencyId,
//         date: data.journalEntry.date,
//       })

//       toast({
//         title: 'Success',
//         description: 'Voucher created successfully',
//       })
//       resetForm()
//     }

//     setIsSubmitting(false)
//     fetchAllVoucher(getCompanyIds(companies), getLocationIds(locations), token)
//   }

//   return (
//     <div className="w-[97%] mx-auto py-10">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold">Journal Vouchers</h1>
//         <JournalVoucherPopup
//           isOpen={isPopupOpen}
//           onOpenChange={setIsPopupOpen}
//           handleSubmit={handleSubmit}
//           isSubmitting={isSubmitting}
//           lastUsedValues={lastUsedValues}
//           showLastUsedBanner={showLastUsedBanner}
//           onClearLastUsed={clearLastUsedValues}
//         />
//       </div>
//       <VoucherList
//         vouchers={vouchers}
//         columns={columns}
//         isLoading={isLoading}
//         linkGenerator={linkGenerator}
//         itemsPerPage={10}
//       />
//     </div>
//   )
// }

