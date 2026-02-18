'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Form } from '@/components/ui/form'
import { useRouter } from 'next/navigation'
import {
  createJournalEntryWithDetails,
  editJournalEntryWithDetails,
  getAllVoucher,
} from '@/api/vouchers-api'
import { toast } from '@/hooks/use-toast'
import {
  type AccountsHead,
  CompanyChartOfAccount,
  type CompanyFromLocalstorage,
  type CostCenter,
  Employee,
  type FormData,
  type GetDepartment,
  JournalEditWithDetails,
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  type JournalQuery,
  type JournalResult,
  type LocationFromLocalstorage,
  type ResPartner,
  type User,
  type Voucher,
  VoucherTypes,
} from '@/utils/type'
import { useFieldArray, useForm } from 'react-hook-form'
import type { z } from 'zod'
import CashVoucherMaster from './cash-voucher-master'
import CashVoucherDetails from './cash-voucher-details'
import VoucherList from '@/components/voucher-list/voucher-list'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import {
  getAllChartOfAccounts,
  getAllCostCenters,
  getAllDepartments,
  getEmployee,
  getResPartnersBySearch,
} from '@/api/common-shared-api'
import { zodResolver } from '@hookform/resolvers/zod'
import { getCompanyWiseChartOfAccounts } from '@/api/chart-of-accounts-api'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface CashVoucherProps {
  initialData?: JournalEntryWithDetails
  onClose?: () => void
  isEdit?: boolean
  onSuccess: any
}

const LAST_USED_KEY = 'lastCashVoucherValues'

/** Reusable blank detail row — avoids repeating the object literal. */
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
  notes: '',
  type: 'Receipt' as const,
  createdBy: 0,
}

export default function CashVoucher({
  initialData,
  onClose,
  isEdit,
  onSuccess,
}: CashVoucherProps) {
  const router = useRouter()
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  // ─── State ────────────────────────────────────────────────────────────────────
  const [voucherGrid, setVoucherGrid] = React.useState<JournalResult[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [companies, setCompanies] = React.useState<CompanyFromLocalstorage[]>(
    []
  )
  const [locations, setLocations] = React.useState<LocationFromLocalstorage[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(true)
  const [currentVoucherType, setCurrentVoucherType] = useState<string>('')
  const [chartOfAccounts, setChartOfAccounts] = React.useState<AccountsHead[]>(
    []
  )
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([])
  const [companyChartOfAccount, setCompanyChartOfAccount] = React.useState<
    CompanyChartOfAccount[]
  >([])
  const [departments, setDepartments] = React.useState<GetDepartment[]>([])
  const [partners, setPartners] = React.useState<ResPartner[]>([])
  const [filteredChartOfAccounts, setFilteredChartOfAccounts] = React.useState<
    AccountsHead[]
  >([])
  const [cashCoa, setCashCoa] = React.useState<AccountsHead[]>([])
  const [companyFilteredAccounts, setCompanyFilteredAccounts] = useState<
    AccountsHead[]
  >([])
  const [employees, setEmployees] = React.useState<Employee[]>([])

  // ── Banner: always false on first render so SSR and client match exactly.
  //    Set to true inside useEffect — client-only, after hydration completes.
  const [showLastUsedBanner, setShowLastUsedBanner] = useState(false)

  // Loading guards
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const [isLoadingLocations, setIsLoadingLocations] = useState(true)
  const [isLoadingPartners, setIsLoadingPartners] = useState(true)
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)
  const [isLoadingCostCenters, setIsLoadingCostCenters] = useState(true)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)

  const linkGenerator = (voucherId: number) =>
    `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.CashVoucher}`

  // ─── localStorage helpers ─────────────────────────────────────────────────────
  const getLastUsedValues = useCallback(() => {
    try {
      const saved = localStorage.getItem(LAST_USED_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }, [])

  const saveLastUsedValues = useCallback((values: JournalEntryWithDetails) => {
    try {
      localStorage.setItem(
        LAST_USED_KEY,
        JSON.stringify({
          companyId: values.journalEntry.companyId,
          locationId: values.journalEntry.locationId,
          currencyId: values.journalEntry.currencyId,
          date: values.journalEntry.date,
        })
      )
    } catch {
      // silently ignore write failures
    }
  }, [])

  // ─── Form ─────────────────────────────────────────────────────────────────────
  // IMPORTANT: defaultValues must be 100% static (no localStorage read).
  // Reading localStorage here runs on the server too → hydration mismatch.
  // We patch the form values after mount in the useEffect below instead.
  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: initialData || {
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
        journalType: VoucherTypes.CashVoucher,
        companyId: 0,
        locationId: 0,
        currencyId: 1,
        amountTotal: 0,
        exchangeRate: 1,
        payTo: '',
        notes: '',
        createdBy: 0,
      },
      journalDetails: [{ ...BLANK_DETAIL }],
    },
  })

  // ─── Client-only: restore last-used values AFTER first paint ──────────────────
  // This useEffect runs only in the browser, after React has already hydrated
  // the DOM from the static defaults above — so there is zero SSR/client diff.
  useEffect(() => {
    // Never restore when in edit/duplicate mode
    if (initialData || isEdit) return

    const last = getLastUsedValues()
    if (!last) return
    if (!last.companyId && !last.currencyId) return

    // Patch individual fields rather than calling form.reset() so that any
    // other fields the user may have already touched are not wiped.
    if (last.companyId)
      form.setValue('journalEntry.companyId', last.companyId, {
        shouldDirty: false,
      })
    if (last.locationId)
      form.setValue('journalEntry.locationId', last.locationId, {
        shouldDirty: false,
      })
    if (last.currencyId)
      form.setValue('journalEntry.currencyId', last.currencyId, {
        shouldDirty: false,
      })
    if (last.date)
      form.setValue('journalEntry.date', last.date, { shouldDirty: false })

    setShowLastUsedBanner(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // ← empty deps: run once on mount only

  // ─── Reset when initialData changes (edit / duplicate) ────────────────────────
  useEffect(() => {
    if (initialData) form.reset(initialData)
  }, [initialData, form])

  // ─── Auth + user companies / locations ────────────────────────────────────────
  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')
      if (!storedUserData || !storedToken) router.push('/')
    }
    checkUserData()
    setIsLoadingCompanies(true)
    setIsLoadingLocations(true)
    if (userData) {
      setUser(userData)
      if (userData?.userCompanies?.length > 0)
        setCompanies(userData.userCompanies)
      if (userData?.userLocations?.length > 0)
        setLocations(userData.userLocations)
      if (!userData.voucherTypes.includes('Cash Voucher'))
        router.push('/unauthorized-access')
    } else {
      toast({ title: 'Error', description: 'Failed to load user data' })
    }
  }, [router, userData])

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((c) => c.company.companyId)
  }
  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((l) => l.location.locationId)
  }

  // ─── Voucher list fetch ────────────────────────────────────────────────────────
  const getallVoucher = useCallback(
    async (company: number[], location: number[]) => {
      try {
        const voucherQuery: JournalQuery = {
          date: new Date().toISOString().split('T')[0],
          companyId: company,
          locationId: location,
          voucherType: VoucherTypes.CashVoucher,
        }
        const response = await getAllVoucher(voucherQuery, token)
        if (!response.data) throw new Error('No data received from server')
        setVoucherGrid(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error('Error getting Voucher Data:', error)
        setVoucherGrid([])
        throw error
      }
    },
    [token]
  )

  const fetchVoucherData = React.useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      await getallVoucher(getCompanyIds(companies), getLocationIds(locations))
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load voucher data. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [token, companies, locations, getallVoucher])

  React.useEffect(() => {
    if (companies.length > 0 && locations.length > 0) fetchVoucherData()
  }, [companies, locations, fetchVoucherData])

  // ─── COA filters ──────────────────────────────────────────────────────────────
  React.useEffect(() => {
    setFilteredChartOfAccounts(chartOfAccounts?.filter((a) => !a.isGroup) || [])
    setCashCoa(chartOfAccounts?.filter((a) => a.isCash) || [])
  }, [chartOfAccounts])

  // ─── API fetches ──────────────────────────────────────────────────────────────
  const fetchChartOfAccounts = useCallback(async () => {
    setIsLoadingAccounts(true)
    if (!token) return
    try {
      const res = await getAllChartOfAccounts(token)
      if (res?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      }
      if (res.error || !res.data) {
        toast({
          title: 'Error',
          description: res.error?.message || 'Failed to load chart of accounts',
        })
        setChartOfAccounts([])
      } else {
        setChartOfAccounts(res.data)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load chart of accounts' })
      setChartOfAccounts([])
    } finally {
      setIsLoadingAccounts(false)
    }
  }, [token, router])

  const fetchDepartments = useCallback(async () => {
    if (!token) return
    setIsLoadingAccounts(true)
    try {
      const res = await getAllDepartments(token)
      if (res?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      }
      if (res.error || !res.data) {
        toast({
          title: 'Error',
          description: res.error?.message || 'Failed to load departments',
        })
        setDepartments([])
      } else {
        setDepartments(res.data)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load departments' })
      setDepartments([])
    } finally {
      setIsLoading(false)
    }
  }, [token, router])

  const fetchgetAllCostCenters = useCallback(async () => {
    setIsLoadingCostCenters(true)
    if (!token) return
    try {
      const res = await getAllCostCenters(token)
      if (res?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      }
      if (res.error || !res.data) {
        toast({
          title: 'Error',
          description: res.error?.message || 'Failed to load cost centers',
        })
        setCostCenters([])
      } else {
        setCostCenters(res.data)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load cost centers' })
      setCostCenters([])
    } finally {
      setIsLoadingCostCenters(false)
    }
  }, [token, router])

  const fetchgetCompanyChartOfAccounts = useCallback(async () => {
    setIsLoadingCostCenters(true)
    if (!token) return
    try {
      const res = await getCompanyWiseChartOfAccounts(token)
      if (res?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      }
      if (res.error || !res.data) {
        toast({
          title: 'Error',
          description: res.error?.message || 'Failed to load company accounts',
        })
        setCompanyChartOfAccount([])
      } else {
        setCompanyChartOfAccount(res.data)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load company accounts' })
      setCompanyChartOfAccount([])
    } finally {
      setIsLoadingCostCenters(false)
    }
  }, [token, router])

  const fetchgetResPartner = useCallback(async () => {
    setIsLoadingPartners(true)
    if (!token) return
    try {
      const res = await getResPartnersBySearch('', token)
      if (res?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      }
      if (res.error || !res.data) {
        toast({
          title: 'Error',
          description: res.error?.message || 'Failed to load partners',
        })
        setPartners([])
      } else {
        setPartners(res.data)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load partners' })
      setPartners([])
    } finally {
      setIsLoadingPartners(false)
    }
  }, [token, router])

  const fetchEmployees = useCallback(async () => {
    setIsLoadingEmployees(true)
    if (!token) return
    try {
      const res = await getEmployee(token)
      if (res?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      }
      if (res.error || !res.data) {
        toast({
          title: 'Error',
          description: res.error?.message || 'Failed to load employees',
        })
        setEmployees([])
      } else {
        setEmployees(res.data)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load employees' })
      setEmployees([])
    } finally {
      setIsLoadingEmployees(false)
    }
  }, [token, router])

  useEffect(() => {
    fetchChartOfAccounts()
    fetchgetAllCostCenters()
    fetchgetResPartner()
    fetchDepartments()
    fetchgetCompanyChartOfAccounts()
    fetchEmployees()
  }, [
    fetchChartOfAccounts,
    fetchgetAllCostCenters,
    fetchgetResPartner,
    fetchDepartments,
    fetchgetCompanyChartOfAccounts,
    fetchEmployees,
  ])

  // ─── Company-filtered accounts ────────────────────────────────────────────────
  useEffect(() => {
    const subscription = form.watch((value) => {
      const selectedCompanyId = value.journalEntry?.companyId
      if (
        !selectedCompanyId ||
        !companyChartOfAccount.length ||
        !chartOfAccounts.length
      ) {
        setCompanyFilteredAccounts([])
        return
      }
      const ids = companyChartOfAccount
        .filter((m) => m.companyId === selectedCompanyId)
        .map((m) => m.chartOfAccountId)
      setCompanyFilteredAccounts(
        chartOfAccounts.filter(
          (acc) => ids.includes(acc.accountId) && !acc.isGroup
        )
      )
    })
    return () => subscription.unsubscribe()
  }, [form, companyChartOfAccount, chartOfAccounts])

  // Trigger initial filter once reference data has loaded
  useEffect(() => {
    const selectedCompanyId = form.getValues('journalEntry.companyId')
    if (
      selectedCompanyId &&
      companyChartOfAccount.length &&
      chartOfAccounts.length
    ) {
      const ids = companyChartOfAccount
        .filter((m) => m.companyId === selectedCompanyId)
        .map((m) => m.chartOfAccountId)
      setCompanyFilteredAccounts(
        chartOfAccounts.filter(
          (acc) => ids.includes(acc.accountId) && !acc.isGroup
        )
      )
    }
  }, [companyChartOfAccount, chartOfAccounts, form])

  const handleVoucherTypeChange = (voucherType: string) =>
    setCurrentVoucherType(voucherType)

  // ─── Field array ──────────────────────────────────────────────────────────────
  const { fields, append, remove } = useFieldArray<
    JournalEntryWithDetails,
    'journalDetails'
  >({
    control: form.control,
    name: 'journalDetails',
  })

  // ─── Submit ───────────────────────────────────────────────────────────────────
  const onSubmit = async (
    values: JournalEntryWithDetails,
    status: 'Draft' | 'Posted'
  ) => {
    if (userData) setUser(userData)

    if (isEdit) {
      const totalDebit = values.journalDetails.reduce(
        (s, d) => s + (d.debit || 0),
        0
      )
      const totalCredit = values.journalDetails.reduce(
        (s, d) => s + (d.credit || 0),
        0
      )
      if (totalDebit !== totalCredit) {
        toast({
          title: 'Validation Error',
          description: 'Total debit and credit must be equal before saving.',
        })
        return
      }
    }

    const updatedValues: JournalEntryWithDetails = {
      ...values,
      journalEntry: {
        ...values.journalEntry,
        state: status === 'Draft' ? 0 : 1,
        notes: values.journalEntry.notes || '',
        journalType: VoucherTypes.CashVoucher,
        exchangeRate: values.journalEntry.exchangeRate || 1,
        createdBy: user?.userId || 0,
        amountTotal: isEdit
          ? values.journalDetails.reduce(
              (s, d) => (d.debit || 0) + (d.credit || 0),
              0
            )
          : values.journalDetails.reduce(
              (s, d) => s + (d.debit || 0) + (d.credit || 0),
              0
            ),
      },
      journalDetails: values.journalDetails.map((detail) => {
        let normalizedResPartnerId = detail.resPartnerId
        if (detail.resPartnerId && typeof detail.resPartnerId === 'string') {
          const parsed = Number(detail.resPartnerId)
          normalizedResPartnerId = isNaN(parsed) ? detail.resPartnerId : parsed
        }
        return {
          ...detail,
          notes: detail.notes || '',
          createdBy: user?.userId || 0,
          ...(isEdit && { updatedBy: user?.userId || 0 }),
          ...(isEdit &&
            (values.journalEntry as any).voucherid && {
              voucherId: (values.journalEntry as any).voucherid,
            }),
          resPartnerId: normalizedResPartnerId,
        }
      }),
    }

    let finalValues: JournalEntryWithDetails

    if (isEdit) {
      finalValues = updatedValues
    } else {
      finalValues = {
        ...updatedValues,
        journalDetails: [
          ...updatedValues.journalDetails,
          {
            accountId: cashCoa[0]?.accountId,
            departmentId: null,
            debit: updatedValues.journalDetails.reduce(
              (s, d) => s + (d.type === 'Receipt' ? d.credit || 0 : 0),
              0
            ),
            credit: updatedValues.journalDetails.reduce(
              (s, d) => s + (d.type === 'Payment' ? d.debit || 0 : 0),
              0
            ),
            analyticTags: null,
            taxId: null,
            resPartnerId: null,
            bankaccountid: null,
            notes: updatedValues.journalEntry.notes || '',
            createdBy: user?.userId || 0,
          },
        ],
      }
    }

    try {
      const response = isEdit
        ? await editJournalEntryWithDetails(
            finalValues as JournalEditWithDetails,
            token
          )
        : await createJournalEntryWithDetails(finalValues, token)

      if (response.error || !response.data) {
        toast({
          title: 'Error',
          description:
            response.error?.message ||
            `Error ${isEdit ? 'editing' : 'creating'} Journal`,
        })
        return
      }

      // ✅ Persist last-used values on successful create
      if (!isEdit) saveLastUsedValues(values)

      toast({
        title: 'Success',
        description: `Voucher ${isEdit ? 'edited' : 'created'} successfully`,
      })
      window.dispatchEvent(new Event('voucherUpdated'))
      if (onSuccess) onSuccess()
      onClose?.()

      // Keep company / location / currency / date; clear everything else
      const keepCompanyId = form.getValues('journalEntry.companyId')
      const keepLocationId = form.getValues('journalEntry.locationId')
      const keepCurrencyId = form.getValues('journalEntry.currencyId')
      const keepDate = form.getValues('journalEntry.date')

      form.reset({
        journalEntry: {
          date: keepDate,
          journalType: VoucherTypes.CashVoucher,
          companyId: keepCompanyId,
          locationId: keepLocationId,
          currencyId: keepCurrencyId,
          amountTotal: 0,
          exchangeRate: 1,
          payTo: '',
          notes: '',
          createdBy: 0,
        },
        journalDetails: [{ ...BLANK_DETAIL }],
      })

      remove()
      append({ ...BLANK_DETAIL })
      setCurrentVoucherType('')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: `Something went wrong ${isEdit ? 'editing' : 'creating'} Journal`,
      })
    }
  }

  // ─── Columns ──────────────────────────────────────────────────────────────────
  const columns = [
    { key: 'voucherno' as const, label: 'Voucher No.' },
    { key: 'companyname' as const, label: 'Company Name' },
    { key: 'currency' as const, label: 'Currency' },
    { key: 'location' as const, label: 'Location' },
    { key: 'date' as const, label: 'Date' },
    { key: 'totalamount' as const, label: 'Total Amount' },
    { key: 'state' as const, label: 'Status' },
  ]

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="w-full mx-auto">
      <div className="w-full mb-10 p-8">
        <h1 className="text-2xl font-bold mb-6">
          Cash Vouchers{' '}
          {currentVoucherType !== 'Mixed' &&
            currentVoucherType &&
            `(${currentVoucherType})`}
        </h1>

        {/*
          ── Last-used banner ──
          showLastUsedBanner starts as `false` on both server and client.
          It is only set to `true` inside useEffect (client-only, post-hydration).
          This guarantees the server HTML and the initial client render are identical.
        */}
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
              onClick={() => {
                setShowLastUsedBanner(false)
                localStorage.removeItem(LAST_USED_KEY)
                form.reset({
                  journalEntry: {
                    date: new Date().toISOString().split('T')[0],
                    journalType: VoucherTypes.CashVoucher,
                    companyId: 0,
                    locationId: 0,
                    currencyId: 1,
                    amountTotal: 0,
                    exchangeRate: 1,
                    payTo: '',
                    notes: '',
                    createdBy: 0,
                  },
                  journalDetails: [{ ...BLANK_DETAIL }],
                })
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <CashVoucherMaster
              form={form}
              companies={companies}
              locations={locations}
              onCompanyChange={() => {
                const currentDetails = form.getValues('journalDetails') || []
                currentDetails.forEach((_, index) => {
                  form.setValue(
                    `journalDetails.${index}.accountId`,
                    null as any
                  )
                })
              }}
            />
            <CashVoucherDetails
              form={form}
              filteredChartOfAccounts={companyFilteredAccounts}
              costCenters={costCenters}
              departments={departments}
              employees={employees}
              partners={partners}
              onSubmit={onSubmit}
              onVoucherTypeChange={handleVoucherTypeChange}
              isEdit={isEdit}
            />
            {!initialData && (
              <div className="mb-6">
                <VoucherList
                  vouchers={voucherGrid}
                  columns={columns}
                  isLoading={isLoading}
                  linkGenerator={linkGenerator}
                  itemsPerPage={10}
                />
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}
