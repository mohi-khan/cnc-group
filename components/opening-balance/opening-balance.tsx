'use client'
import * as React from 'react'
import { useState, useCallback, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import {
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  type JournalResult,
  type JournalQuery,
  VoucherTypes,
  type User,
  type FormStateType,
  type JournalEditWithDetails,
} from '@/utils/type'
import {
  createJournalEntryWithDetails,
  editJournalEntryWithDetails,
  getAllVoucher,
} from '@/api/vouchers-api'
import VoucherList from '@/components/voucher-list/voucher-list'
import { useForm } from 'react-hook-form'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import {
  getAllBankAccounts,
  getAllChartOfAccounts,
  getAllCostCenters,
  getAllDepartments,
  getEmployee,
  getResPartnersBySearch,
  getSettings,
} from '@/api/common-shared-api'
import OpeningBalanceSubmit from './opening-balance-submit'
import OpeningBalanceMaster from './opening-balance-master'
import OpeningBalanceDetails from './opening-balance-details'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

// ─── localStorage key ──────────────────────────────────────────────────────────
const LAST_USED_KEY = 'lastOpeningBalanceValues'

// ─── Shape saved to localStorage ──────────────────────────────────────────────
export interface LastUsedOpeningBalanceValues {
  companyId: number
  locationId: number
  currencyId: number
  formType: 'Credit' | 'Debit'
  date: string
}

// ─── Blank detail row ─────────────────────────────────────────────────────────
const BLANK_DETAIL = {
  accountId: 0,
  costCenterId: null,
  departmentId: null,
  employeeId: null,
  debit: 0,
  credit: 0,
  analyticTags: null,
  taxId: null,
  resPartnerId: null,
  bankaccountid: null,
  notes: '',
  createdBy: 0,
}

interface OpeningBalanceProps {
  initialData?: JournalEntryWithDetails
  onClose?: () => void
  isEdit?: boolean
}

export default function OpeningBalance({
  initialData,
  onClose,
  isEdit,
}: OpeningBalanceProps) {
  useInitializeUser()
  const router = useRouter()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const [voucherGrid, setVoucherGrid] = React.useState<JournalResult[]>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [dataLoaded, setDataLoaded] = React.useState(false)
  const [user, setUser] = React.useState<User | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [settings, setSettings] = useState<number | null>(null)

  // ── Last-used state (client-only — starts null/false to avoid SSR mismatch) ──
  const [lastUsedValues, setLastUsedValues] =
    useState<LastUsedOpeningBalanceValues | null>(null)
  const [showLastUsedBanner, setShowLastUsedBanner] = useState(false)

  // ─── localStorage helpers ────────────────────────────────────────────────────
  const getLastUsedValues =
    useCallback((): LastUsedOpeningBalanceValues | null => {
      try {
        const saved = localStorage.getItem(LAST_USED_KEY)
        return saved ? JSON.parse(saved) : null
      } catch {
        return null
      }
    }, [])

  const saveLastUsedValues = useCallback(
    (
      companyId: number,
      locationId: number,
      currencyId: number,
      formType: 'Credit' | 'Debit',
      date: string
    ) => {
      try {
        const toSave: LastUsedOpeningBalanceValues = {
          companyId,
          locationId,
          currencyId,
          formType,
          date,
        }
        localStorage.setItem(LAST_USED_KEY, JSON.stringify(toSave))
        setLastUsedValues(toSave)
        setShowLastUsedBanner(true)
      } catch {
        // silently ignore write failures
      }
    },
    []
  )

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
  }, [getLastUsedValues])

  const fetchSettings = React.useCallback(async () => {
    if (!token) return
    const data = await getSettings(token, 'Difference of Opening')
    if (data.error || !data.data) {
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get Settings',
      })
    } else {
      setSettings(data.data)
    }
  }, [token])

  React.useEffect(() => {
    fetchSettings()
  }, [settings, token, fetchSettings])

  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: initialData || {
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
        journalType: VoucherTypes.OpeningBalance,
        companyId: 0,
        locationId: 0,
        currencyId: 1,
        exchangeRate: 1,
        amountTotal: 0,
        payTo: '',
        notes: '',
        createdBy: 0,
      },
      journalDetails: [{ ...BLANK_DETAIL }],
    },
  })

  const [formState, setFormState] = React.useState<FormStateType>({
    companies: [],
    locations: [],
    bankAccounts: [],
    chartOfAccounts: [],
    filteredChartOfAccounts: [],
    costCenters: [],
    partners: [],
    departments: [],
    employees: [],
    selectedBankAccount: null,
    formType: 'Credit',
    status: 'Draft',
  })

  // ─── Apply last-used values to form + formState when dialog opens ─────────────
  useEffect(() => {
    if (!isDialogOpen || !lastUsedValues || initialData || isEdit) return

    form.setValue('journalEntry.companyId', lastUsedValues.companyId, {
      shouldDirty: false,
    })
    form.setValue('journalEntry.locationId', lastUsedValues.locationId, {
      shouldDirty: false,
    })
    form.setValue('journalEntry.currencyId', lastUsedValues.currencyId, {
      shouldDirty: false,
    })
    form.setValue('journalEntry.date', lastUsedValues.date, {
      shouldDirty: false,
    })
    setFormState((prev) => ({ ...prev, formType: lastUsedValues.formType }))
  }, [isDialogOpen, lastUsedValues, form, initialData, isEdit])

  React.useEffect(() => {
    if (userData) {
      setFormState((prevState) => ({
        ...prevState,
        companies: userData.userCompanies,
        locations: userData.userLocations,
      }))
      if (!userData.voucherTypes.includes('OB  Voucher')) {
        router.push('/unauthorized-access')
      }
    }
  }, [router, userData])

  React.useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) return
      const search = ''

      const [
        bankAccountsResponse,
        chartOfAccountsResponse,
        costCentersResponse,
        partnersResponse,
        departmentsResponse,
        employeesResponse,
      ] = await Promise.all([
        getAllBankAccounts(token),
        getAllChartOfAccounts(token),
        getAllCostCenters(token),
        getResPartnersBySearch(search, token),
        getAllDepartments(token),
        getEmployee(token),
      ])

      if (
        bankAccountsResponse?.error?.status === 441 ||
        chartOfAccountsResponse?.error?.status === 441 ||
        costCentersResponse?.error?.status === 441 ||
        partnersResponse?.error?.status === 441 ||
        departmentsResponse?.error?.status === 441 ||
        employeesResponse?.error?.status === 441
      ) {
        router.push('/unauthorized-access')
        return
      }

      const filteredCoa = chartOfAccountsResponse.data?.filter(
        (account) => account.isGroup === false
      )

      setFormState((prevState) => ({
        ...prevState,
        bankAccounts: bankAccountsResponse.data || [],
        chartOfAccounts: chartOfAccountsResponse.data || [],
        filteredChartOfAccounts: filteredCoa || [],
        costCenters: costCentersResponse.data || [],
        partners: partnersResponse.data || [],
        departments: departmentsResponse.data || [],
        employees: employeesResponse.data || [],
      }))
    }

    fetchInitialData()
  }, [token, router])

  React.useEffect(() => {
    if (userData) setUser(userData)
  }, [userData])

  const getCompanyIds = React.useCallback((data: any[]): number[] => {
    return data.map((company) => company.company.companyId)
  }, [])

  const getLocationIds = React.useCallback((data: any[]): number[] => {
    return data.map((location) => location.location.locationId)
  }, [])

  const getallVoucher = React.useCallback(
    async (company: number[], location: number[]) => {
      if (!token) return
      let localVoucherGrid: JournalResult[] = []
      try {
        const voucherQuery: JournalQuery = {
          date: new Date().toISOString().split('T')[0],
          companyId: company,
          locationId: location,
          voucherType: VoucherTypes.OpeningBalance,
        }
        const response = await getAllVoucher(voucherQuery, token)
        if (response?.error?.status === 401) {
          router.push('/unauthorized-access')
          return
        } else if (!response.data) {
          throw new Error('No data received from server')
        }
        localVoucherGrid = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Error getting Voucher Data:', error)
        throw error
      }
      setVoucherGrid(localVoucherGrid)
    },
    [token, router]
  )

  React.useEffect(() => {
    if (
      formState.companies.length > 0 &&
      formState.locations.length > 0 &&
      !dataLoaded
    ) {
      setIsLoading(true)
      const fetchVoucherData = async () => {
        try {
          const mycompanies = getCompanyIds(formState.companies)
          const mylocations = getLocationIds(formState.locations)
          await getallVoucher(mycompanies, mylocations)
          setDataLoaded(true)
        } catch {
          toast({
            title: 'Error',
            description: 'Failed to load voucher data. Please try again.',
          })
        } finally {
          setIsLoading(false)
        }
      }
      fetchVoucherData()
    }
  }, [
    formState.companies,
    formState.locations,
    getCompanyIds,
    getLocationIds,
    getallVoucher,
    dataLoaded,
  ])

  // ─── Helper: reset form but keep master fields pre-filled ────────────────────
  const resetFormKeepMaster = React.useCallback(() => {
    const keepCompanyId = form.getValues('journalEntry.companyId')
    const keepLocationId = form.getValues('journalEntry.locationId')
    const keepCurrencyId = form.getValues('journalEntry.currencyId')
    const keepDate = form.getValues('journalEntry.date')

    form.reset({
      journalEntry: {
        date: keepDate,
        journalType: VoucherTypes.OpeningBalance,
        companyId: keepCompanyId,
        locationId: keepLocationId,
        currencyId: keepCurrencyId,
        exchangeRate: 1,
        amountTotal: 0,
        payTo: '',
        notes: '',
        createdBy: 0,
      },
      journalDetails: [{ ...BLANK_DETAIL }],
    })
    // formType is kept as-is in formState (not reset)
  }, [form])

  const onSubmit = async (values: any, status: 'Draft' | 'Posted') => {
    const updatedValues = {
      ...values,
      journalEntry: {
        ...values.journalEntry,
        state: status === 'Draft' ? 0 : 1,
        notes: values.journalEntry.notes || '',
        journalType: VoucherTypes.OpeningBalance,
        currencyId: values.journalEntry.currencyId || 1,
        amountTotal: values.journalEntry.amountTotal,
        createdBy: user?.userId ?? 0,
        ...(isEdit && { updatedBy: user?.userId || 0 }),
      },
      journalDetails: values.journalDetails.map((detail: any) => ({
        ...detail,
        notes: detail.notes || '',
        createdBy: user?.userId ?? 0,
        ...(isEdit && { updatedBy: user?.userId || 0 }),
        ...(isEdit &&
          (values.journalEntry as any).voucherid && {
            voucherId: (values.journalEntry as any).voucherid,
          }),
      })),
    }

    let finalValues: any
    if (isEdit === true) {
      finalValues = updatedValues
    } else {
      finalValues = {
        ...updatedValues,
        journalDetails: [
          ...updatedValues.journalDetails,
          {
            accountId: formState.selectedBankAccount?.glCode || settings || 0,
            costCenterId: null,
            departmentId: null,
            employeeId: null,
            debit:
              formState.formType === 'Credit'
                ? updatedValues.journalEntry.amountTotal
                : 0,
            credit:
              formState.formType === 'Debit'
                ? updatedValues.journalEntry.amountTotal
                : 0,
            analyticTags: null,
            taxId: null,
            resPartnerId: null,
            bankaccountid: formState.selectedBankAccount?.id,
            notes: updatedValues.journalEntry.notes || '',
            createdBy: user?.userId ?? 0,
          },
        ],
      }
    }

    if (isEdit === true) {
      const response = await editJournalEntryWithDetails(
        finalValues as JournalEditWithDetails,
        token
      )
      if (response.error || !response.data) {
        toast({
          title: 'Error',
          description: response.error?.message || 'Error editing Journal',
        })
      } else {
        setDataLoaded(false)
        getallVoucher(
          getCompanyIds(formState.companies),
          getLocationIds(formState.locations)
        )
        toast({ title: 'Success', description: 'Voucher is edited successfully' })
        onClose?.()
        setIsDialogOpen(false)
        form.reset()
      }
    } else {
      const response = await createJournalEntryWithDetails(finalValues, token)
      if (response.error || !response.data) {
        toast({
          title: 'Error',
          description: response.error?.message || 'Error creating Journal',
        })
      } else {
        // ✅ Persist last-used values (company, location, currency, type, date)
        saveLastUsedValues(
          values.journalEntry.companyId,
          values.journalEntry.locationId,
          values.journalEntry.currencyId,
          formState.formType,
          values.journalEntry.date
        )

        setDataLoaded(false)
        // Refetch list in background — dialog stays open
        getallVoucher(
          getCompanyIds(formState.companies),
          getLocationIds(formState.locations)
        )

        toast({
          title: 'Success',
          description: 'Opening Voucher is created successfully',
        })

        // ✅ Reset detail rows only, keep master fields pre-filled
        // Dialog is NOT closed — stays open for next entry
        resetFormKeepMaster()
      }
    }
  }

  // ─── Clear banner handler ────────────────────────────────────────────────────
  const handleClearBanner = () => {
    setShowLastUsedBanner(false)
    clearLastUsedValues()
    form.reset({
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
        journalType: VoucherTypes.OpeningBalance,
        companyId: 0,
        locationId: 0,
        currencyId: 1,
        exchangeRate: 1,
        amountTotal: 0,
        payTo: '',
        notes: '',
        createdBy: 0,
      },
      journalDetails: [{ ...BLANK_DETAIL }],
    })
    setFormState((prev) => ({ ...prev, formType: 'Credit' }))
  }

  const columns = [
    { key: 'voucherno' as const, label: 'Voucher No.' },
    { key: 'date' as const, label: 'Date' },
    { key: 'companyname' as const, label: 'Company Name' },
    { key: 'location' as const, label: 'Location' },
    { key: 'currency' as const, label: 'Currency' },
    { key: 'totalamount' as const, label: 'Amount' },
    { key: 'state' as const, label: 'Status' },
  ]

  const linkGenerator = (voucherId: number) =>
    `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.OpeningBalance}`

  const dialogForm = (
    <>
      {/*
        ── Last-used banner ──
        showLastUsedBanner starts false on server + first client render.
        Only set to true via useEffect (client-only) — zero SSR mismatch.
      */}
      {showLastUsedBanner && !initialData && !isEdit && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium">
              ℹ️ Using last filled values
            </span>
            <span className="text-sm text-blue-700">
              (Company, Location, Currency, Type, Date)
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
          onSubmit={form.handleSubmit((values) =>
            onSubmit(values, formState.status)
          )}
          className="space-y-8"
        >
          {validationError && (
            <div className="text-red-500 text-sm mb-4">{validationError}</div>
          )}
          <OpeningBalanceMaster
            form={form}
            formState={formState}
            requisition={undefined}
            setFormState={setFormState}
          />
          <OpeningBalanceDetails
            form={form}
            formState={formState}
            requisition={undefined}
            partners={formState.partners}
            isEdit={isEdit}
          />
          <OpeningBalanceSubmit form={form} onSubmit={onSubmit} />
        </form>
      </Form>
    </>
  )

  return (
    <div className="w-[97%] mx-auto py-10">
      {!initialData && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Opening Balance</h1>
          <Button
            onClick={() => {
              form.reset()
              setIsDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> ADD
          </Button>
        </div>
      )}

      {initialData ? (
        <div>
          <h1 className="text-2xl font-bold mb-6">Edit Opening Balance</h1>
          {dialogForm}
        </div>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={true}>
          <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            className="max-w-6xl h-[95vh] overflow-auto"
          >
            <DialogHeader>
              <DialogTitle>Opening Balance</DialogTitle>
              <DialogDescription>
                Enter the details for the bank voucher here. Click save when you
                are done.
              </DialogDescription>
            </DialogHeader>
            {dialogForm}
          </DialogContent>
        </Dialog>
      )}

      {!initialData && (
        <VoucherList
          vouchers={voucherGrid.map((v) => ({
            ...v,
            notes: v.notes || '',
            companyname: v.companyname || '',
            location: v.location || '',
            currency: v.currency || '',
            detail_notes: v.detail_notes || '',
          }))}
          columns={columns}
          isLoading={isLoading}
          linkGenerator={linkGenerator}
          itemsPerPage={10}
        />
      )}
    </div>
  )
}

// 'use client'
// import * as React from 'react'
// import { useState } from 'react'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { Plus } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Form } from '@/components/ui/form'
// import { useRouter } from 'next/navigation'
// import { toast } from '@/hooks/use-toast'
// import {
//   type JournalEntryWithDetails,
//   JournalEntryWithDetailsSchema,
//   type JournalResult,
//   type JournalQuery,
//   VoucherTypes,
//   type User,
//   type FormStateType,
//   type JournalEditWithDetails,
// } from '@/utils/type'
// import {
//   createJournalEntryWithDetails,
//   editJournalEntryWithDetails,
//   getAllVoucher,
// } from '@/api/vouchers-api'
// import VoucherList from '@/components/voucher-list/voucher-list'

// import { useForm } from 'react-hook-form'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import {
//   getAllBankAccounts,
//   getAllChartOfAccounts,
//   getAllCostCenters,
//   getAllDepartments,
//   getEmployee,
//   getResPartnersBySearch,
//   getSettings,
// } from '@/api/common-shared-api'
// import OpeningBalanceSubmit from './opening-balance-submit'
// import OpeningBalanceMaster from './opening-balance-master'
// import OpeningBalanceDetails from './opening-balance-details'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from '@/components/ui/dialog'

// interface OpeningBalanceProps {
//   initialData?: JournalEntryWithDetails
//   onClose?: () => void
//   isEdit?: boolean
// }

// export default function OpeningBalance({
//   initialData,
//   onClose,
//   isEdit,
// }: OpeningBalanceProps) {
//   useInitializeUser()
//   const router = useRouter()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)

//   const [voucherGrid, setVoucherGrid] = React.useState<JournalResult[]>([])
//   const [isDialogOpen, setIsDialogOpen] = React.useState(false)
//   const [isLoading, setIsLoading] = React.useState(false)
//   const [dataLoaded, setDataLoaded] = React.useState(false)
//   const [user, setUser] = React.useState<User | null>(null)
//   const [validationError, setValidationError] = useState<string | null>(null)
//   const [settings, setSettings] = useState<number | null>(null)

//   const fetchSettings = React.useCallback(async () => {
//     if (!token) return
//     const data = await getSettings(token, 'Difference of Opening')
//     if (data.error || !data.data) {
//       toast({
//         title: 'Error',
//         description: data.error?.message || 'Failed to get Settings',
//       })
//     } else {
//       setSettings(data.data)
//     }
//   }, [token])

//   React.useEffect(() => {
//     fetchSettings()
//   }, [settings, token, fetchSettings])

//   const form = useForm<JournalEntryWithDetails>({
//     resolver: zodResolver(JournalEntryWithDetailsSchema),
//     defaultValues: initialData || {
//       journalEntry: {
//         date: new Date().toISOString().split('T')[0],
//         journalType: VoucherTypes.OpeningBalance,
//         companyId: 0,
//         locationId: 0,
//         currencyId: 1,
//         exchangeRate: 1,
//         amountTotal: 0,
//         payTo: '',
//         notes: '',
//         createdBy: 0,
//       },
//       journalDetails: [
//         {
//           accountId: 0,
//           costCenterId: null,
//           departmentId: null,
//           employeeId: null,
//           debit: 0,
//           credit: 0,
//           analyticTags: null,
//           taxId: null,
//           resPartnerId: null,
//           bankaccountid: null,
//           notes: '',
//           createdBy: 0,
//         },
//       ],
//     },
//   })

//   const [formState, setFormState] = React.useState<FormStateType>({
//     companies: [],
//     locations: [],
//     bankAccounts: [],
//     chartOfAccounts: [],
//     filteredChartOfAccounts: [],
//     costCenters: [],
//     partners: [],
//     departments: [],
//     employees: [],
//     selectedBankAccount: null,
//     formType: 'Credit',
//     status: 'Draft',
//   })

//   React.useEffect(() => {
//     const checkUserData = () => {
//       const storedUserData = localStorage.getItem('currentUser')
//       const storedToken = localStorage.getItem('authToken')
//       if (!storedUserData || !storedToken) {
//         router.push('/')
//         return
//       }
//     }

//     if (userData) {
//       setFormState((prevState) => ({
//         ...prevState,
//         companies: userData.userCompanies,
//         locations: userData.userLocations,
//       }))
//       if (!userData.voucherTypes.includes('OB  Voucher')) {
//         router.push('/unauthorized-access')
//       }
//     }
//   }, [router, userData])

//   React.useEffect(() => {
//     const fetchInitialData = async () => {
//       if (!token) return
//       const search = ''

//       const [
//         bankAccountsResponse,
//         chartOfAccountsResponse,
//         costCentersResponse,
//         partnersResponse,
//         departmentsResponse,
//         employeesResponse,
//       ] = await Promise.all([
//         getAllBankAccounts(token),
//         getAllChartOfAccounts(token),
//         getAllCostCenters(token),
//         getResPartnersBySearch(search, token),
//         getAllDepartments(token),
//         getEmployee(token),
//       ])

//       if (
//         bankAccountsResponse?.error?.status === 441 ||
//         chartOfAccountsResponse?.error?.status === 441 ||
//         costCentersResponse?.error?.status === 441 ||
//         partnersResponse?.error?.status === 441 ||
//         departmentsResponse?.error?.status === 441 ||
//         employeesResponse?.error?.status === 441
//       ) {
//         router.push('/unauthorized-access')
//         return
//       }

//       const filteredCoa = chartOfAccountsResponse.data?.filter(
//         (account) => account.isGroup === false
//       )

//       setFormState((prevState) => ({
//         ...prevState,
//         bankAccounts: bankAccountsResponse.data || [],
//         chartOfAccounts: chartOfAccountsResponse.data || [],
//         filteredChartOfAccounts: filteredCoa || [],
//         costCenters: costCentersResponse.data || [],
//         partners: partnersResponse.data || [],
//         departments: departmentsResponse.data || [],
//         employees: employeesResponse.data || [],
//       }))
//     }

//     fetchInitialData()
//   }, [token, router])

//   React.useEffect(() => {
//     if (userData) {
//       setUser(userData)
//     }
//   }, [userData])

//   const getCompanyIds = React.useCallback((data: any[]): number[] => {
//     return data.map((company) => company.company.companyId)
//   }, [])

//   const getLocationIds = React.useCallback((data: any[]): number[] => {
//     return data.map((location) => location.location.locationId)
//   }, [])

//   const getallVoucher = React.useCallback(
//     async (company: number[], location: number[]) => {
//       if (!token) return
//       let localVoucherGrid: JournalResult[] = []
//       try {
//         const voucherQuery: JournalQuery = {
//           date: new Date().toISOString().split('T')[0],
//           companyId: company,
//           locationId: location,
//           voucherType: VoucherTypes.OpeningBalance,
//         }
//         const response = await getAllVoucher(voucherQuery, token)
//         if (response?.error?.status === 401) {
//           router.push('/unauthorized-access')
//           return
//         } else if (!response.data) {
//           throw new Error('No data received from server')
//         }
//         localVoucherGrid = Array.isArray(response.data) ? response.data : []
//       } catch (error) {
//         console.error('Error getting Voucher Data:', error)
//         throw error
//       }
//       setVoucherGrid(localVoucherGrid)
//     },
//     [token, router]
//   )

//   React.useEffect(() => {
//     if (
//       formState.companies.length > 0 &&
//       formState.locations.length > 0 &&
//       !dataLoaded
//     ) {
//       setIsLoading(true)
//       const fetchVoucherData = async () => {
//         try {
//           const mycompanies = getCompanyIds(formState.companies)
//           const mylocations = getLocationIds(formState.locations)
//           await getallVoucher(mycompanies, mylocations)
//           setDataLoaded(true)
//         } catch (error) {
//           toast({
//             title: 'Error',
//             description: 'Failed to load voucher data. Please try again.',
//           })
//         } finally {
//           setIsLoading(false)
//         }
//       }
//       fetchVoucherData()
//     }
//   }, [
//     formState.companies,
//     formState.locations,
//     getCompanyIds,
//     getLocationIds,
//     getallVoucher,
//     dataLoaded,
//   ])

//   const onSubmit = async (values: any, status: 'Draft' | 'Posted') => {
//     const updatedValues = {
//       ...values,
//       journalEntry: {
//         ...values.journalEntry,
//         state: status === 'Draft' ? 0 : 1,
//         notes: values.journalEntry.notes || '',
//         journalType: VoucherTypes.OpeningBalance,
//         currencyId: values.journalEntry.currencyId || 1,
//         amountTotal: values.journalEntry.amountTotal,
//         createdBy: user?.userId ?? 0,
//         ...(isEdit && { updatedBy: user?.userId || 0 }),
//       },
//       journalDetails: values.journalDetails.map((detail: any) => ({
//         ...detail,
//         notes: detail.notes || '',
//         createdBy: user?.userId ?? 0,
//         ...(isEdit && { updatedBy: user?.userId || 0 }),
//         ...(isEdit &&
//           (values.journalEntry as any).voucherid && {
//             voucherId: (values.journalEntry as any).voucherid,
//           }),
//       })),
//     }

//     let finalValues: any
//     if (isEdit === true) {
//       finalValues = updatedValues
//     } else {
//       finalValues = {
//         ...updatedValues,
//         journalDetails: [
//           ...updatedValues.journalDetails,
//           {
//             accountId: formState.selectedBankAccount?.glCode || settings || 0,
//             costCenterId: null,
//             departmentId: null,
//             employeeId: null,
//             debit:
//               formState.formType === 'Credit'
//                 ? updatedValues.journalEntry.amountTotal
//                 : 0,
//             credit:
//               formState.formType === 'Debit'
//                 ? updatedValues.journalEntry.amountTotal
//                 : 0,
//             analyticTags: null,
//             taxId: null,
//             resPartnerId: null,
//             bankaccountid: formState.selectedBankAccount?.id,
//             notes: updatedValues.journalEntry.notes || '',
//             createdBy: user?.userId ?? 0,
//           },
//         ],
//       }
//     }

//     if (isEdit === true) {
//       const response = await editJournalEntryWithDetails(
//         finalValues as JournalEditWithDetails,
//         token
//       )
//       if (response.error || !response.data) {
//         toast({
//           title: 'Error',
//           description: response.error?.message || 'Error editing Journal',
//         })
//       } else {
//         setDataLoaded(false)
//         const mycompanies = getCompanyIds(formState.companies)
//         const mylocations = getLocationIds(formState.locations)
//         getallVoucher(mycompanies, mylocations)
//         toast({
//           title: 'Success',
//           description: 'Voucher is edited successfully',
//         })
//         onClose?.()
//         setIsDialogOpen(false)
//         form.reset()
//       }
//     } else {
//       const response = await createJournalEntryWithDetails(finalValues, token)
//       if (response.error || !response.data) {
//         toast({
//           title: 'Error',
//           description: response.error?.message || 'Error creating Journal',
//         })
//       } else {
//         setDataLoaded(false)
//         const mycompanies = getCompanyIds(formState.companies)
//         const mylocations = getLocationIds(formState.locations)
//         getallVoucher(mycompanies, mylocations)
//         toast({
//           title: 'Success',
//           description: 'Opening Voucher is created successfully',
//         })
//         onClose?.()
//         // setIsDialogOpen(false)
//         form.reset()
//       }
//     }
//   }

//   const columns = [
//     { key: 'voucherno' as const, label: 'Voucher No.' },
//     { key: 'date' as const, label: 'Date' },
//     { key: 'companyname' as const, label: 'Company Name' },
//     { key: 'location' as const, label: 'Location' },
//     { key: 'currency' as const, label: 'Currency' },
//     { key: 'totalamount' as const, label: 'Amount' },
//     { key: 'state' as const, label: 'Status' },
//   ]

//   const linkGenerator = (voucherId: number) =>
//     `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.OpeningBalance}`

//   return (
//     <div className="w-[97%] mx-auto py-10">
//       {!initialData && (
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">Opening Balance</h1>
//           <Button
//             onClick={() => {
//               form.reset()
//               setIsDialogOpen(true)
//             }}
//           >
//             <Plus className="mr-2 h-4 w-4" /> ADD
//           </Button>
//         </div>
//       )}

//       {initialData ? (
//         <div>
//           <h1 className="text-2xl font-bold mb-6">Edit Opening Balance</h1>
//           <Form {...form}>
//             <form
//               onSubmit={form.handleSubmit((values) =>
//                 onSubmit(values, formState.status)
//               )}
//               className="space-y-8"
//             >
//               {validationError && (
//                 <div className="text-red-500 text-sm mb-4">
//                   {validationError}
//                 </div>
//               )}
//               <OpeningBalanceMaster
//                 form={form}
//                 formState={formState}
//                 requisition={undefined}
//                 setFormState={setFormState}
//               />
//               <OpeningBalanceDetails
//                 form={form}
//                 formState={formState}
//                 requisition={undefined}
//                 partners={formState.partners}
//                 isEdit={isEdit}
//               />
//               <OpeningBalanceSubmit form={form} onSubmit={onSubmit} />
//             </form>
//           </Form>
//         </div>
//       ) : (
//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={true}>
//           <DialogContent
//             onInteractOutside={(e) => e.preventDefault()}
//             className="max-w-6xl h-[95vh] overflow-auto"
//           >
//             <DialogHeader>
//               <DialogTitle>Opening Balance</DialogTitle>
//               <DialogDescription>
//                 Enter the details for the bank voucher here. Click save when you
//                 are done.
//               </DialogDescription>
//             </DialogHeader>

//             <Form {...form}>
//               <form
//                 onSubmit={form.handleSubmit((values) =>
//                   onSubmit(values, formState.status)
//                 )}
//                 className="space-y-8"
//               >
//                 {validationError && (
//                   <div className="text-red-500 text-sm mb-4">
//                     {validationError}
//                   </div>
//                 )}
//                 <OpeningBalanceMaster
//                   form={form}
//                   formState={formState}
//                   requisition={undefined}
//                   setFormState={setFormState}
//                 />
//                 <OpeningBalanceDetails
//                   form={form}
//                   formState={formState}
//                   requisition={undefined}
//                   partners={formState.partners}
//                   isEdit={isEdit}
//                 />
//                 <OpeningBalanceSubmit form={form} onSubmit={onSubmit} />
//               </form>
//             </Form>
//           </DialogContent>
//         </Dialog>
//       )}

//       {!initialData && (
//         <VoucherList
//           vouchers={voucherGrid.map((v) => ({
//             ...v,
//             notes: v.notes || '',
//             companyname: v.companyname || '',
//             location: v.location || '',
//             currency: v.currency || '',
//             detail_notes: v.detail_notes || '',
//           }))}
//           columns={columns}
//           isLoading={isLoading}
//           linkGenerator={linkGenerator}
//           itemsPerPage={10}
//         />
//       )}
//     </div>
//   )
// }

