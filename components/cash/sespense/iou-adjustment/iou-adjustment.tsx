'use client'

import type React from 'react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CustomCombobox } from '@/utils/custom-combobox'
import {
  type ComboboxItem,
  CustomComboboxWithApi,
} from '@/utils/custom-combobox-with-api'
import { toast } from '@/hooks/use-toast'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import type {
  Employee,
  LocationData,
  CostCenter,
  IouRecordGetType,
  AccountsHead,
  CompanyChartOfAccount,
  GetDepartment,
  ResPartner,
} from '@/utils/type'
import type { CompanyType } from '@/api/company-api'
import {
  getEmployee,
  getAllCompanies,
  getAllLocations,
  getAllCostCenters,
  getAllCurrency,
  getAllChartOfAccounts,
  getAllDepartments,
  getResPartnersBySearch,
  getPartnerById,
} from '@/api/common-shared-api'
import { getCompanyWiseChartOfAccounts } from '@/api/chart-of-accounts-api'
import { getLoanData, createIouAdjBulk } from '@/api/iou-api'
import Loader from '@/utils/loader'

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const AdjRowSchema = z.object({
  accountId: z
    .number({ invalid_type_error: 'Account is required' })
    .int()
    .positive('Account is required'),
  costCenterId: z.number().int().positive().nullable().optional(),
  departmentId: z.number().int().positive().nullable().optional(),
  employeeId: z.number().int().positive().nullable().optional(),
  resPartnerId: z.number().int().positive().nullable().optional(),
  remarks: z.string().optional(),
  amount: z
    .number({ invalid_type_error: 'Amount is required' })
    .positive('Must be greater than 0'),
})

const IouAdjFormSchema = z.object({
  companyId: z
    .number({ invalid_type_error: 'Company is required' })
    .int()
    .positive('Company is required'),
  locationId: z
    .number({ invalid_type_error: 'Location is required' })
    .int()
    .positive('Location is required'),
  currency: z.string().min(1, 'Currency is required'),
  date: z.string().min(1, 'Date is required'),
  receiverEmployeeId: z.number().int().positive().optional(),
  iouId: z
    .number({ invalid_type_error: 'IOU is required' })
    .int()
    .positive('IOU is required'),
  receiverName: z.string().min(1, 'Receiver name is required'),
  notes: z.string().optional(),
  rows: z.array(AdjRowSchema).min(1),
})

type IouAdjFormType = z.infer<typeof IouAdjFormSchema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

const emptyRow = () => ({
  accountId: undefined as unknown as number,
  costCenterId: null as null,
  departmentId: null as null,
  employeeId: null as null,
  resPartnerId: null as null,
  remarks: '',
  amount: undefined as unknown as number,
})

// ─── Component ────────────────────────────────────────────────────────────────

const IouAdjustmentForm: React.FC = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const [userData] = useAtom(userDataAtom)

  // ── Data state ──
  const [employeeData, setEmployeeData] = useState<Employee[]>([])
  const [companyData, setCompanyData] = useState<CompanyType[]>([])
  const [locationData, setLocationData] = useState<LocationData[]>([])
  const [costCenterData, setCostCenterData] = useState<CostCenter[]>([])
  const [currencyList, setCurrencyList] = useState<{ currencyCode: string }[]>([])
  const [iouList, setIouList] = useState<IouRecordGetType[]>([])
  const [chartOfAccounts, setChartOfAccounts] = useState<AccountsHead[]>([])
  const [companyChartOfAccount, setCompanyChartOfAccount] = useState<
    CompanyChartOfAccount[]
  >([])
  const [departments, setDepartments] = useState<GetDepartment[]>([])
  const [partners, setPartners] = useState<ResPartner[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Per-row partner display values ──
  const [partnerValues, setPartnerValues] = useState<
    Record<number, { id: number | string; name: string } | null>
  >({})

  // ── Fetch on mount — wait for token ──
  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      try {
        const [
          empRes,
          compRes,
          locRes,
          ccRes,
          curRes,
          iouRes,
          coaRes,
          companyCoaRes,
          deptRes,
          partnerRes,
        ] = await Promise.all([
          getEmployee(token),
          getAllCompanies(token),
          getAllLocations(token),
          getAllCostCenters(token),
          getAllCurrency(token),
          getLoanData(token),
          getAllChartOfAccounts(token),
          getCompanyWiseChartOfAccounts(token),
          getAllDepartments(token),
          getResPartnersBySearch('', token),
        ])
        setEmployeeData(empRes.data ?? [])
        setCompanyData(compRes.data ?? [])
        setLocationData(locRes.data ?? [])
        setCostCenterData(ccRes.data ?? [])
        setCurrencyList(curRes.data ?? [])
        setIouList(iouRes.data ?? [])
        setChartOfAccounts(coaRes.data ?? [])
        setCompanyChartOfAccount(companyCoaRes.data ?? [])
        setDepartments(deptRes.data ?? [])
        setPartners(partnerRes.data ?? [])
      } catch (error) {
        console.error('Failed to load form data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load form data.',
          variant: 'destructive',
        })
      } finally {
        setIsDataLoading(false)
      }
    }

    fetchData()
  }, [token])

  // ── Form ──
  const form = useForm<IouAdjFormType>({
    resolver: zodResolver(IouAdjFormSchema),
    defaultValues: {
      companyId: undefined,
      locationId: undefined,
      currency: 'BDT',
      date: format(new Date(), 'yyyy-MM-dd'),
      receiverEmployeeId: undefined,
      iouId: undefined,
      receiverName: '',
      notes: '',
      rows: [emptyRow()],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rows',
  })

  const selectedCompanyId = form.watch('companyId')

  const filteredLocations = selectedCompanyId
    ? locationData.filter(
        (loc) => Number(loc.companyId) === Number(selectedCompanyId)
      )
    : locationData

  // Only show IOUs that still have an outstanding balance
  const filteredIouList = useMemo(
    () =>
      iouList.filter(
        (iou) => (iou.amount ?? 0) - (iou.adjustedAmount ?? 0) > 0
      ),
    [iouList]
  )

  // Company-wise chart of accounts
  const companyFilteredAccounts = useMemo(() => {
    if (
      !selectedCompanyId ||
      !companyChartOfAccount.length ||
      !chartOfAccounts.length
    ) {
      return []
    }
    const ids = companyChartOfAccount
      .filter((m) => m.companyId === selectedCompanyId)
      .map((m) => m.chartOfAccountId)
    return chartOfAccounts.filter(
      (acc) => ids.includes(acc.accountId) && !acc.isGroup && acc.isActive
    )
  }, [selectedCompanyId, companyChartOfAccount, chartOfAccounts])

  // Departments — company-wise filtered
  const filteredDepartments = useMemo(() => {
    if (!selectedCompanyId) return []
    return departments.filter(
      (d) => d.isActive && d.companyCode === selectedCompanyId
    )
  }, [departments, selectedCompanyId])

  const isCompanySelected = !!selectedCompanyId

  // ── Partner search ──
  const searchPartners = useCallback(
    async (query: string): Promise<ComboboxItem[]> => {
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
    },
    [token]
  )

  // ── Resolve display name for each row's selected partner ──
  const watchedRows = form.watch('rows')

  useEffect(() => {
    const loadPartners = async () => {
      const updates: Record<
        number,
        { id: number | string; name: string } | null
      > = {}

      for (let index = 0; index < watchedRows.length; index++) {
        const partnerId = watchedRows[index]?.resPartnerId
        if (!partnerId) {
          updates[index] = null
          continue
        }
        const local = partners.find((p) => p.id === Number(partnerId))
        if (local) {
          updates[index] = { id: local.id, name: local.name || '' }
          continue
        }
        const fetched = await getPartnerById(Number(partnerId), token)
        updates[index] = fetched?.data
          ? { id: fetched.data.id, name: fetched.data.name || '' }
          : null
      }

      setPartnerValues(updates)
    }

    loadPartners()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedRows?.map((r) => r.resPartnerId)), partners, token])

  // Selected IOU's outstanding balance
  const selectedIouId = form.watch('iouId')
  const selectedIouOutstanding = useMemo(() => {
    const iou = filteredIouList.find((i) => i.iouId === selectedIouId)
    if (!iou) return null
    return (iou.amount ?? 0) - (iou.adjustedAmount ?? 0)
  }, [filteredIouList, selectedIouId])

  const addRow = () => {
    if (selectedIouOutstanding !== null) {
      const currentRows = form.getValues('rows') || []
      const usedSoFar = currentRows.reduce(
        (sum, row) => sum + (Number(row.amount) || 0),
        0
      )
      const remaining = Math.max(selectedIouOutstanding - usedSoFar, 0)
      append({ ...emptyRow(), amount: remaining as unknown as number })
      return
    }
    append(emptyRow())
  }

  // ── Submit ──
  const onSubmit = async (data: IouAdjFormType) => {
    const createdBy = userData?.userId
    if (!createdBy) {
      toast({
        title: 'Error',
        description: 'User not found.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        iouId: data.iouId,
        companyId: data.companyId,
        locationId: data.locationId,
        currencyId: 1, // TODO: map currency code → id when API supports it
        exchangeRate: 1,
        iouReceivableAccountId: 167, // TODO: replace with real IOU Receivable account id once created
        adjustmentDate: data.date,
        notes: data.notes,
        createdBy,
        rows: data.rows.map((row) => ({
          accountId: row.accountId,
          costCenterId: row.costCenterId ?? null,
          departmentId: row.departmentId ?? null,
          employeeId: row.employeeId ?? null,
          resPartnerId: row.resPartnerId ?? null,
          remarks: row.remarks,
          amountAdjusted: row.amount,
          adjustmentType: 'adjustment',
        })),
      }

      const result = await createIouAdjBulk(token, payload)

      if (result.error) {
        toast({
          title: 'Error',
          description:
            typeof result.error === 'string'
              ? result.error
              : (result.error as any)?.message ?? 'Something went wrong.',
          variant: 'destructive',
        })
        return
      }

      // Refresh IOU list so outstanding balances update without page reload
      const refreshed = await getLoanData(token)
      setIouList(refreshed.data ?? [])

      toast({
        title: 'Success',
        description: `IOU Adjustment submitted! Voucher: ${result.data?.voucherNo ?? ''}`,
      })

      form.reset({
        companyId: data.companyId,
        locationId: data.locationId,
        currency: data.currency,
        date: data.date,
        receiverEmployeeId: undefined,
        iouId: undefined,
        receiverName: '',
        notes: '',
        rows: [emptyRow()],
      })
      setPartnerValues({})
    } catch (error) {
      console.error('Failed to submit IOU adjustment:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit IOU adjustment.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loader until token is ready or data is loading
  if (!token || isDataLoading) return <Loader />

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-4">
      <div className="border rounded-lg p-6 bg-slate-50 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">IOU Adjustment</h2>

        {!isCompanySelected && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
            ⚠️ Please select a company first to see available accounts and
            units.
          </div>
        )}

        <Form {...form}>
          <form className="space-y-4">
            {/* ══ Master Row: Company | Location | Currency | Date ══ */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Company */}
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <CustomCombobox
                      items={companyData.map((c) => ({
                        id: c.companyId?.toString() ?? '',
                        name: c.companyName,
                      }))}
                      value={
                        field.value
                          ? {
                              id: field.value.toString(),
                              name:
                                companyData.find(
                                  (c) => Number(c.companyId) === field.value
                                )?.companyName || '',
                            }
                          : null
                      }
                      onChange={(val) => {
                        field.onChange(val ? Number(val.id) : null)
                        form.setValue(
                          'locationId',
                          undefined as unknown as number
                        )
                        form.setValue('iouId', undefined as unknown as number)
                        form.setValue('receiverName', '')
                        const currentRows = form.getValues('rows') || []
                        currentRows.forEach((_, idx) => {
                          form.setValue(
                            `rows.${idx}.accountId`,
                            undefined as unknown as number
                          )
                          form.setValue(`rows.${idx}.departmentId`, null)
                        })
                      }}
                      placeholder="Select a company"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <CustomCombobox
                      items={filteredLocations.map((loc) => ({
                        id: loc.locationId.toString(),
                        name: loc.branchName,
                      }))}
                      value={
                        field.value
                          ? {
                              id: field.value.toString(),
                              name:
                                filteredLocations.find(
                                  (loc) =>
                                    Number(loc.locationId) === field.value
                                )?.branchName || '',
                            }
                          : null
                      }
                      onChange={(val) =>
                        field.onChange(val ? Number(val.id) : null)
                      }
                      placeholder={
                        filteredLocations.length > 0
                          ? 'Select a location'
                          : 'No locations'
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Currency */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <CustomCombobox
                      items={
                        currencyList.length > 0
                          ? currencyList.map((c) => ({
                              id: c.currencyCode,
                              name: c.currencyCode,
                            }))
                          : ['BDT', 'USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD'].map(
                              (c) => ({ id: c, name: c })
                            )
                      }
                      value={
                        field.value
                          ? { id: field.value, name: field.value }
                          : null
                      }
                      onChange={(val) => field.onChange(val ? val.id : '')}
                      placeholder="Select currency"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ══ Receiver Name Row ══ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Employee dropdown */}
              <FormField
                control={form.control}
                name="receiverEmployeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receiver Name</FormLabel>
                    <CustomCombobox
                      items={employeeData.map((emp) => ({
                        id: emp.id.toString(),
                        name: `${emp.employeeName} (${emp.employeeId})`,
                      }))}
                      value={
                        field.value
                          ? {
                              id: field.value.toString(),
                              name:
                                employeeData.find(
                                  (emp) => emp.id === field.value
                                )?.employeeName || '',
                            }
                          : null
                      }
                      onChange={(val) => {
                        field.onChange(val ? Number(val.id) : null)
                        if (val) {
                          const emp = employeeData.find(
                            (e) => e.id === Number(val.id)
                          )
                          if (emp)
                            form.setValue('receiverName', emp.employeeName)
                        } else {
                          form.setValue('receiverName', '')
                        }
                      }}
                      placeholder="Select employee"
                      disabled={
                        !!form.watch('receiverName')?.trim() &&
                        !form.watch('receiverEmployeeId')
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Receiver Name — free text */}
              <FormField
                control={form.control}
                name="receiverName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>&nbsp;</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter receiver name"
                        onChange={(e) => {
                          field.onChange(e.target.value)
                          if (e.target.value) {
                            form.setValue('receiverEmployeeId', undefined)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* IOU List dropdown */}
              <FormField
                control={form.control}
                name="iouId"
                render={({ field }) => {
                  const selectedIou = filteredIouList.find(
                    (iou) => iou.iouId === field.value
                  )
                  const outstandingBalance = selectedIou
                    ? (selectedIou.amount ?? 0) -
                      (selectedIou.adjustedAmount ?? 0)
                    : null

                  return (
                    <FormItem>
                      <FormLabel>IOU List</FormLabel>
                      <div className="flex flex-col">
                        <CustomCombobox
                          items={filteredIouList.map((iou) => ({
                            id: iou.iouId.toString(),
                            name: `IOU-${iou.iouId}`,
                          }))}
                          value={
                            field.value
                              ? {
                                  id: field.value.toString(),
                                  name: `IOU-${field.value}`,
                                }
                              : null
                          }
                          onChange={(val) => {
                            const newIouId = val ? Number(val.id) : null
                            field.onChange(newIouId)

                            if (!newIouId) return

                            const selected = filteredIouList.find(
                              (iou) => iou.iouId === newIouId
                            )
                            if (!selected) return

                            // Auto-fill Company, Location, Receiver
                            if (selected.companyId) {
                              form.setValue(
                                'companyId',
                                Number(selected.companyId)
                              )
                            }
                            if (selected.locationId) {
                              form.setValue(
                                'locationId',
                                Number(selected.locationId)
                              )
                            }
                            if (selected.employeeId) {
                              form.setValue(
                                'receiverEmployeeId',
                                Number(selected.employeeId)
                              )
                              const emp = employeeData.find(
                                (e) => e.id === Number(selected.employeeId)
                              )
                              if (emp)
                                form.setValue(
                                  'receiverName',
                                  emp.employeeName
                                )
                            }

                            // Auto-fill amount on first row if only one row exists
                            const outstanding =
                              (selected.amount ?? 0) -
                              (selected.adjustedAmount ?? 0)
                            const currentRows = form.getValues('rows') || []
                            if (currentRows.length === 1) {
                              form.setValue(
                                'rows.0.amount',
                                outstanding as unknown as number
                              )
                            }
                          }}
                          placeholder="Select IOU"
                        />
                        <div className="min-h-[18px] px-1 mt-0.5">
                          {outstandingBalance !== null && (
                            <p className="flex items-center gap-1">
                              <span className="text-[10px] text-black font-bold">
                                Adjustment Amount:
                              </span>
                              <span
                                className={`text-[11px] font-semibold tabular-nums ${
                                  outstandingBalance > 0
                                    ? 'text-emerald-600'
                                    : 'text-slate-400'
                                }`}
                              >
                                {outstandingBalance.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>

            {/* ══ Notes ══ */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter notes (optional)"
                      className="min-h-[80px] resize-y"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ══ Details Table ══ */}
            <div className="border rounded-md">
              {/* Table header */}
              <div className="bg-slate-100 grid grid-cols-[2fr_1.5fr_1.5fr_2fr_2fr_1.5fr_1.5fr_40px] text-xs font-semibold text-muted-foreground border-b rounded-t-md overflow-hidden">
                <div className="px-3 py-2 border-r">Account Name</div>
                <div className="px-3 py-2 border-r">Cost Center</div>
                <div className="px-3 py-2 border-r">Unit</div>
                <div className="px-3 py-2 border-r">Employee</div>
                <div className="px-3 py-2 border-r">Partner Name</div>
                <div className="px-3 py-2 border-r">Remarks</div>
                <div className="px-3 py-2 border-r">Amount</div>
                <div className="px-3 py-2" />
              </div>

              {/* Rows */}
              <div className="divide-y">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-[2fr_1.5fr_1.5fr_2fr_2fr_1.5fr_1.5fr_40px] bg-white items-start"
                  >
                    {/* Account Name */}
                    <FormField
                      control={form.control}
                      name={`rows.${index}.accountId`}
                      render={({ field: f }) => (
                        <FormItem className="border-r">
                          <CustomCombobox
                            items={companyFilteredAccounts.map((account) => ({
                              id: account.accountId.toString(),
                              name: account.name || 'Unnamed Account',
                            }))}
                            value={
                              f.value
                                ? {
                                    id: f.value.toString(),
                                    name:
                                      companyFilteredAccounts.find(
                                        (a) => a.accountId === f.value
                                      )?.name || '',
                                  }
                                : null
                            }
                            onChange={(val) =>
                              f.onChange(val ? Number(val.id) : null)
                            }
                            placeholder={
                              !isCompanySelected
                                ? 'Select company first'
                                : companyFilteredAccounts.length === 0
                                  ? 'No accounts'
                                  : 'Select an account'
                            }
                            disabled={
                              !isCompanySelected ||
                              companyFilteredAccounts.length === 0
                            }
                          />
                          <FormMessage className="px-3 pb-1 text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Cost Center */}
                    <FormField
                      control={form.control}
                      name={`rows.${index}.costCenterId`}
                      render={({ field: f }) => (
                        <FormItem className="border-r">
                          <CustomCombobox
                            items={costCenterData
                              .filter((cc) => cc.isActive)
                              .map((cc) => ({
                                id: cc.costCenterId.toString(),
                                name: cc.costCenterName,
                              }))}
                            value={
                              f.value
                                ? {
                                    id: f.value.toString(),
                                    name:
                                      costCenterData.find(
                                        (cc) => cc.costCenterId === f.value
                                      )?.costCenterName || '',
                                  }
                                : null
                            }
                            onChange={(val) =>
                              f.onChange(val ? Number(val.id) : null)
                            }
                            placeholder="Select a cost center"
                          />
                          <FormMessage className="px-3 pb-1 text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Unit (Department) */}
                    <FormField
                      control={form.control}
                      name={`rows.${index}.departmentId`}
                      render={({ field: f }) => (
                        <FormItem className="border-r">
                          <CustomCombobox
                            items={filteredDepartments.map((dept) => ({
                              id: dept.departmentID.toString(),
                              name: dept.departmentName || 'Unnamed Department',
                            }))}
                            value={
                              f.value
                                ? {
                                    id: f.value.toString(),
                                    name:
                                      filteredDepartments.find(
                                        (d) => d.departmentID === f.value
                                      )?.departmentName || '',
                                  }
                                : null
                            }
                            onChange={(val) =>
                              f.onChange(val ? Number(val.id) : null)
                            }
                            placeholder={
                              !isCompanySelected
                                ? 'Select company first'
                                : filteredDepartments.length === 0
                                  ? 'No units'
                                  : 'Select a unit'
                            }
                            disabled={
                              !isCompanySelected ||
                              filteredDepartments.length === 0
                            }
                          />
                          <FormMessage className="px-3 pb-1 text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Employee */}
                    <FormField
                      control={form.control}
                      name={`rows.${index}.employeeId`}
                      render={({ field: f }) => (
                        <FormItem className="border-r">
                          <CustomCombobox
                            items={employeeData.map((emp) => ({
                              id: emp.id.toString(),
                              name: `${emp.employeeName} (${emp.employeeId})`,
                            }))}
                            value={
                              f.value
                                ? {
                                    id: f.value.toString(),
                                    name:
                                      employeeData.find(
                                        (emp) => emp.id === f.value
                                      )?.employeeName || '',
                                  }
                                : null
                            }
                            onChange={(val) =>
                              f.onChange(val ? Number(val.id) : null)
                            }
                            placeholder="Select an employee"
                          />
                          <FormMessage className="px-3 pb-1 text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Partner */}
                    <FormField
                      control={form.control}
                      name={`rows.${index}.resPartnerId`}
                      render={({ field: f }) => (
                        <FormItem className="border-r">
                          <CustomComboboxWithApi
                            items={partners.map((partner) => ({
                              id: partner.id.toString(),
                              name: partner.name || '',
                            }))}
                            value={
                              f.value
                                ? (partners.find(
                                    (p) => p.id === Number(f.value)
                                  ) ?? {
                                    id: f.value,
                                    name: partnerValues[index]?.name || '',
                                  })
                                : null
                            }
                            onChange={(item) =>
                              f.onChange(item ? Number(item.id) : null)
                            }
                            placeholder="Select partner"
                            searchFunction={searchPartners}
                            fetchByIdFunction={async (id) => {
                              const numericId =
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
                          <FormMessage className="px-3 pb-1 text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Remarks */}
                    <FormField
                      control={form.control}
                      name={`rows.${index}.remarks`}
                      render={({ field: f }) => (
                        <FormItem className="border-r">
                          <FormControl>
                            <Input
                              {...f}
                              placeholder="Enter remarks"
                              className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10"
                            />
                          </FormControl>
                          <FormMessage className="px-3 pb-1 text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Amount */}
                    <FormField
                      control={form.control}
                      name={`rows.${index}.amount`}
                      render={({ field: f }) => (
                        <FormItem className="border-r">
                          <FormControl>
                            <Input
                              {...f}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Amount"
                              value={
                                f.value === undefined ||
                                (f.value as unknown) === 0
                                  ? ''
                                  : f.value
                              }
                              onChange={(e) => {
                                const raw = e.target.value
                                f.onChange(
                                  raw === '' ? undefined : parseFloat(raw)
                                )
                              }}
                              onWheel={(e) =>
                                (e.target as HTMLInputElement).blur()
                              }
                              onKeyDown={(e) => {
                                if (
                                  e.key === 'ArrowUp' ||
                                  e.key === 'ArrowDown'
                                )
                                  e.preventDefault()
                              }}
                              className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </FormControl>
                          <FormMessage className="px-3 pb-1 text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Delete */}
                    <div className="flex items-center justify-center h-10">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => fields.length > 1 && remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Another */}
              <button
                type="button"
                onClick={addRow}
                className="w-full py-2 border-t text-sm text-muted-foreground hover:bg-slate-50 hover:text-foreground flex items-center justify-center gap-2 transition-colors rounded-b-md"
                disabled={!isCompanySelected}
              >
                <Plus className="h-4 w-4" />
                Add Another
              </button>
            </div>

            {/* ══ Action Buttons ══ */}
            <div className="flex justify-end space-x-3 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  form.reset({
                    companyId: form.getValues('companyId'),
                    locationId: form.getValues('locationId'),
                    currency: form.getValues('currency'),
                    date: form.getValues('date'),
                    iouId: undefined,
                    receiverName: '',
                    notes: '',
                    rows: [emptyRow()],
                  })
                }
              >
                Reset
              </Button>

              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => form.handleSubmit(onSubmit)()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Adjustment'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default IouAdjustmentForm



// 'use client'

// import type React from 'react'
// import { useState, useEffect, useCallback, useMemo } from 'react'
// import { useForm, useFieldArray } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { format } from 'date-fns'
// import { Plus, Trash2 } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import {
//   type ComboboxItem,
//   CustomComboboxWithApi,
// } from '@/utils/custom-combobox-with-api'
// import { toast } from '@/hooks/use-toast'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import type {
//   Employee,
//   LocationData,
//   CostCenter,
//   IouRecordGetType,
//   AccountsHead,
//   CompanyChartOfAccount,
//   GetDepartment,
//   ResPartner,
// } from '@/utils/type'
// import type { CompanyType } from '@/api/company-api'
// import {
//   getEmployee,
//   getAllCompanies,
//   getAllLocations,
//   getAllCostCenters,
//   getAllCurrency,
//   getAllChartOfAccounts,
//   getAllDepartments,
//   getResPartnersBySearch,
//   getPartnerById,
// } from '@/api/common-shared-api'
// import { getCompanyWiseChartOfAccounts } from '@/api/chart-of-accounts-api'
// import { getLoanData, createIouAdjBulk } from '@/api/iou-api'
// import Loader from '@/utils/loader'

// // ─── Zod Schema ───────────────────────────────────────────────────────────────

// const AdjRowSchema = z.object({
//   accountId: z
//     .number({ invalid_type_error: 'Account is required' })
//     .int()
//     .positive('Account is required'),
//   costCenterId: z.number().int().positive().nullable().optional(),
//   departmentId: z.number().int().positive().nullable().optional(),
//   employeeId: z.number().int().positive().nullable().optional(),
//   resPartnerId: z.number().int().positive().nullable().optional(),
//   remarks: z.string().optional(),
//   amount: z
//     .number({ invalid_type_error: 'Amount is required' })
//     .positive('Must be greater than 0'),
// })

// const IouAdjFormSchema = z.object({
//   companyId: z
//     .number({ invalid_type_error: 'Company is required' })
//     .int()
//     .positive('Company is required'),
//   locationId: z
//     .number({ invalid_type_error: 'Location is required' })
//     .int()
//     .positive('Location is required'),
//   currency: z.string().min(1, 'Currency is required'),
//   date: z.string().min(1, 'Date is required'),
//   receiverEmployeeId: z.number().int().positive().optional(),
//   iouId: z
//     .number({ invalid_type_error: 'IOU is required' })
//     .int()
//     .positive('IOU is required'),
//   receiverName: z.string().min(1, 'Receiver name is required'),
//   notes: z.string().optional(),
//   rows: z.array(AdjRowSchema).min(1),
// })

// type IouAdjFormType = z.infer<typeof IouAdjFormSchema>

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const emptyRow = () => ({
//   accountId: undefined as unknown as number,
//   costCenterId: undefined as unknown as number,
//   departmentId: undefined as unknown as number,
//   employeeId: undefined as unknown as number,
//   resPartnerId: null,
//   remarks: '',
//   amount: undefined as unknown as number,
// })

// // ─── Component ────────────────────────────────────────────────────────────────

// const IouAdjustmentForm: React.FC = () => {
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)
//   const [userData] = useAtom(userDataAtom)

//   // ── Data state ──
//   const [employeeData, setEmployeeData] = useState<Employee[]>([])
//   const [companyData, setCompanyData] = useState<CompanyType[]>([])
//   const [locationData, setLocationData] = useState<LocationData[]>([])
//   const [costCenterData, setCostCenterData] = useState<CostCenter[]>([])
//   const [currencyList, setCurrencyList] = useState<{ currencyCode: string }[]>([])
//   const [iouList, setIouList] = useState<IouRecordGetType[]>([])
//   const [chartOfAccounts, setChartOfAccounts] = useState<AccountsHead[]>([])
//   const [companyChartOfAccount, setCompanyChartOfAccount] = useState<
//     CompanyChartOfAccount[]
//   >([])
//   const [departments, setDepartments] = useState<GetDepartment[]>([])
//   const [partners, setPartners] = useState<ResPartner[]>([])
//   const [isDataLoading, setIsDataLoading] = useState(true)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   // ── Per-row partner display values ──
//   const [partnerValues, setPartnerValues] = useState<
//     Record<number, { id: number | string; name: string } | null>
//   >({})

//   // ── Fetch on mount ──
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [
//           empRes,
//           compRes,
//           locRes,
//           ccRes,
//           curRes,
//           iouRes,
//           coaRes,
//           companyCoaRes,
//           deptRes,
//           partnerRes,
//         ] = await Promise.all([
//           getEmployee(token),
//           getAllCompanies(token),
//           getAllLocations(token),
//           getAllCostCenters(token),
//           getAllCurrency(token),
//           getLoanData(token),
//           getAllChartOfAccounts(token),
//           getCompanyWiseChartOfAccounts(token),
//           getAllDepartments(token),
//           getResPartnersBySearch('', token),
//         ])
//         setEmployeeData(empRes.data ?? [])
//         setCompanyData(compRes.data ?? [])
//         setLocationData(locRes.data ?? [])
//         setCostCenterData(ccRes.data ?? [])
//         setCurrencyList(curRes.data ?? [])
//         setIouList(iouRes.data ?? [])
//         setChartOfAccounts(coaRes.data ?? [])
//         setCompanyChartOfAccount(companyCoaRes.data ?? [])
//         setDepartments(deptRes.data ?? [])
//         setPartners(partnerRes.data ?? [])
//       } catch (error) {
//         console.error('Failed to load form data:', error)
//         toast({
//           title: 'Error',
//           description: 'Failed to load form data.',
//           variant: 'destructive',
//         })
//       } finally {
//         setIsDataLoading(false)
//       }
//     }
//     if (token) fetchData()
//   }, [token])

//   // ── Form ──
//   const form = useForm<IouAdjFormType>({
//     resolver: zodResolver(IouAdjFormSchema),
//     defaultValues: {
//       companyId: undefined,
//       locationId: undefined,
//       currency: 'BDT',
//       date: format(new Date(), 'yyyy-MM-dd'),
//       receiverEmployeeId: undefined,
//       iouId: undefined,
//       receiverName: '',
//       notes: '',
//       rows: [emptyRow()],
//     },
//   })

//   const { fields, append, remove } = useFieldArray({
//     control: form.control,
//     name: 'rows',
//   })

//   const selectedCompanyId = form.watch('companyId')

//   const filteredLocations = selectedCompanyId
//     ? locationData.filter(
//         (loc) => Number(loc.companyId) === Number(selectedCompanyId)
//       )
//     : locationData

//   // Only show IOUs that still have an outstanding balance
//   const filteredIouList = useMemo(
//     () =>
//       iouList.filter(
//         (iou) => (iou.amount ?? 0) - (iou.adjustedAmount ?? 0) > 0
//       ),
//     [iouList]
//   )

//   // Company-wise chart of accounts
//   const companyFilteredAccounts = useMemo(() => {
//     if (
//       !selectedCompanyId ||
//       !companyChartOfAccount.length ||
//       !chartOfAccounts.length
//     ) {
//       return []
//     }
//     const ids = companyChartOfAccount
//       .filter((m) => m.companyId === selectedCompanyId)
//       .map((m) => m.chartOfAccountId)
//     return chartOfAccounts.filter(
//       (acc) => ids.includes(acc.accountId) && !acc.isGroup && acc.isActive
//     )
//   }, [selectedCompanyId, companyChartOfAccount, chartOfAccounts])

//   // Departments — company-wise filtered
//   const filteredDepartments = useMemo(() => {
//     if (!selectedCompanyId) return []
//     return departments.filter(
//       (d) => d.isActive && d.companyCode === selectedCompanyId
//     )
//   }, [departments, selectedCompanyId])

//   const isCompanySelected = !!selectedCompanyId

//   // ── Partner search ──
//   const searchPartners = useCallback(
//     async (query: string): Promise<ComboboxItem[]> => {
//       try {
//         const response = await getResPartnersBySearch(query, token)
//         if (response.error || !response.data) return []
//         return response.data.map((partner) => ({
//           id: partner.id.toString(),
//           name: partner.name || 'Unnamed Partner',
//         }))
//       } catch {
//         return []
//       }
//     },
//     [token]
//   )

//   // ── Resolve display name for each row's selected partner ──
//   const watchedRows = form.watch('rows')

//   useEffect(() => {
//     const loadPartners = async () => {
//       const updates: Record<
//         number,
//         { id: number | string; name: string } | null
//       > = {}

//       for (let index = 0; index < watchedRows.length; index++) {
//         const partnerId = watchedRows[index]?.resPartnerId
//         if (!partnerId) {
//           updates[index] = null
//           continue
//         }
//         const local = partners.find((p) => p.id === Number(partnerId))
//         if (local) {
//           updates[index] = { id: local.id, name: local.name || '' }
//           continue
//         }
//         const fetched = await getPartnerById(Number(partnerId), token)
//         updates[index] = fetched?.data
//           ? { id: fetched.data.id, name: fetched.data.name || '' }
//           : null
//       }

//       setPartnerValues(updates)
//     }

//     loadPartners()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [JSON.stringify(watchedRows?.map((r) => r.resPartnerId)), partners, token])

//   // Selected IOU's outstanding balance
//   const selectedIouId = form.watch('iouId')
//   const selectedIouOutstanding = useMemo(() => {
//     const iou = filteredIouList.find((i) => i.iouId === selectedIouId)
//     if (!iou) return null
//     return (iou.amount ?? 0) - (iou.adjustedAmount ?? 0)
//   }, [filteredIouList, selectedIouId])

//   const addRow = () => {
//     if (selectedIouOutstanding !== null) {
//       const currentRows = form.getValues('rows') || []
//       const usedSoFar = currentRows.reduce(
//         (sum, row) => sum + (Number(row.amount) || 0),
//         0
//       )
//       const remaining = Math.max(selectedIouOutstanding - usedSoFar, 0)
//       append({ ...emptyRow(), amount: remaining as unknown as number })
//       return
//     }
//     append(emptyRow())
//   }

//   // ── Submit ──
//   const onSubmit = async (data: IouAdjFormType) => {
//     const createdBy = userData?.userId
//     if (!createdBy) {
//       toast({
//         title: 'Error',
//         description: 'User not found.',
//         variant: 'destructive',
//       })
//       return
//     }

//     setIsSubmitting(true)
//     try {
//       const payload = {
//         iouId: data.iouId,
//         companyId: data.companyId,
//         locationId: data.locationId,
//         currencyId: 1, // TODO: map currency code → id when API supports it
//         exchangeRate: 1,
//         iouReceivableAccountId: 167, // TODO: replace with real account id once account head is created
//         adjustmentDate: data.date,
//         notes: data.notes,
//         createdBy,
//         rows: data.rows.map((row) => ({
//           accountId: row.accountId,
//           costCenterId: row.costCenterId,
//           departmentId: row.departmentId,
//           employeeId: row.employeeId,
//           resPartnerId: row.resPartnerId ?? null,
//           remarks: row.remarks,
//           amountAdjusted: row.amount,
//           adjustmentType: 'adjustment',
//         })),
//       }

//       const result = await createIouAdjBulk(token, payload)
//       console.log('API Response:', result) // ← এটা যোগ করো

//      if (result.error) {
//   toast({
//     title: 'Error',
//     description: typeof result.error === 'string' 
//       ? result.error 
//       : result.error?.message ?? 'Something went wrong.',
//     variant: 'destructive',
//   })
//   return
// }

// // ✅ iouList refresh করো
// const refreshed = await getLoanData(token)
// setIouList(refreshed.data ?? [])

//       toast({
//         title: 'Success',
//         description: `IOU Adjustment submitted! Voucher: ${result.data?.voucherNo ?? ''}`,
//       })

//       form.reset({
//         companyId: data.companyId,
//         locationId: data.locationId,
//         currency: data.currency,
//         date: data.date,
//         receiverEmployeeId: undefined,
//         iouId: undefined,
//         receiverName: '',
//         notes: '',
//         rows: [emptyRow()],
//       })
//       setPartnerValues({})
//     } catch (error) {
//       console.error('Failed to submit IOU adjustment:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to submit IOU adjustment.',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   if (isDataLoading) return <Loader />

//   // ─────────────────────────────────────────────────────────────────────────────

//   return (
//     <div className="p-4">
//       <div className="border rounded-lg p-6 bg-slate-50 shadow-sm">
//         <h2 className="text-lg font-semibold mb-4">IOU Adjustment</h2>

//         {!isCompanySelected && (
//           <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
//             ⚠️ Please select a company first to see available accounts and
//             units.
//           </div>
//         )}

//         <Form {...form}>
//           <form className="space-y-4">
//             {/* ══ Master Row: Company | Location | Currency | Date ══ */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               {/* Company */}
//               <FormField
//                 control={form.control}
//                 name="companyId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Company Name</FormLabel>
//                     <CustomCombobox
//                       items={companyData.map((c) => ({
//                         id: c.companyId?.toString() ?? '',
//                         name: c.companyName,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name:
//                                 companyData.find(
//                                   (c) => Number(c.companyId) === field.value
//                                 )?.companyName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => {
//                         field.onChange(val ? Number(val.id) : null)
//                         form.setValue(
//                           'locationId',
//                           undefined as unknown as number
//                         )
//                         form.setValue('iouId', undefined as unknown as number)
//                         form.setValue('receiverName', '')
//                         const currentRows = form.getValues('rows') || []
//                         currentRows.forEach((_, idx) => {
//                           form.setValue(
//                             `rows.${idx}.accountId`,
//                             undefined as unknown as number
//                           )
//                           form.setValue(
//                             `rows.${idx}.departmentId`,
//                             undefined as unknown as number
//                           )
//                         })
//                       }}
//                       placeholder="Select a company"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Location */}
//               <FormField
//                 control={form.control}
//                 name="locationId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Location</FormLabel>
//                     <CustomCombobox
//                       items={filteredLocations.map((loc) => ({
//                         id: loc.locationId.toString(),
//                         name: loc.branchName,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name:
//                                 filteredLocations.find(
//                                   (loc) =>
//                                     Number(loc.locationId) === field.value
//                                 )?.branchName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) =>
//                         field.onChange(val ? Number(val.id) : null)
//                       }
//                       placeholder={
//                         filteredLocations.length > 0
//                           ? 'Select a location'
//                           : 'No locations'
//                       }
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Currency */}
//               <FormField
//                 control={form.control}
//                 name="currency"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Currency</FormLabel>
//                     <CustomCombobox
//                       items={
//                         currencyList.length > 0
//                           ? currencyList.map((c) => ({
//                               id: c.currencyCode,
//                               name: c.currencyCode,
//                             }))
//                           : ['BDT', 'USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD'].map(
//                               (c) => ({ id: c, name: c })
//                             )
//                       }
//                       value={
//                         field.value
//                           ? { id: field.value, name: field.value }
//                           : null
//                       }
//                       onChange={(val) => field.onChange(val ? val.id : '')}
//                       placeholder="Select currency"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Date */}
//               <FormField
//                 control={form.control}
//                 name="date"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Date</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         type="date"
//                         value={field.value ?? ''}
//                         onChange={(e) => field.onChange(e.target.value)}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* ══ Receiver Name Row ══ */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {/* Employee dropdown */}
//               <FormField
//                 control={form.control}
//                 name="receiverEmployeeId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Receiver Name</FormLabel>
//                     <CustomCombobox
//                       items={employeeData.map((emp) => ({
//                         id: emp.id.toString(),
//                         name: `${emp.employeeName} (${emp.employeeId})`,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name:
//                                 employeeData.find(
//                                   (emp) => emp.id === field.value
//                                 )?.employeeName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => {
//                         field.onChange(val ? Number(val.id) : null)
//                         if (val) {
//                           const emp = employeeData.find(
//                             (e) => e.id === Number(val.id)
//                           )
//                           if (emp) form.setValue('receiverName', emp.employeeName)
//                         } else {
//                           form.setValue('receiverName', '')
//                         }
//                       }}
//                       placeholder="Select employee"
//                       disabled={
//                         !!form.watch('receiverName')?.trim() &&
//                         !form.watch('receiverEmployeeId')
//                       }
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Receiver Name — free text */}
//               <FormField
//                 control={form.control}
//                 name="receiverName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>&nbsp;</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         placeholder="Enter receiver name"
//                         onChange={(e) => {
//                           field.onChange(e.target.value)
//                           if (e.target.value) {
//                             form.setValue('receiverEmployeeId', undefined)
//                           }
//                         }}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* IOU List dropdown */}
//               <FormField
//                 control={form.control}
//                 name="iouId"
//                 render={({ field }) => {
//                   const selectedIou = filteredIouList.find(
//                     (iou) => iou.iouId === field.value
//                   )
//                   const outstandingBalance = selectedIou
//                     ? (selectedIou.amount ?? 0) -
//                       (selectedIou.adjustedAmount ?? 0)
//                     : null

//                   return (
//                     <FormItem>
//                       <FormLabel>IOU List</FormLabel>
//                       <div className="flex flex-col">
//                         <CustomCombobox
//                           items={filteredIouList.map((iou) => ({
//                             id: iou.iouId.toString(),
//                             name: `IOU-${iou.iouId}`,
//                           }))}
//                           value={
//                             field.value
//                               ? {
//                                   id: field.value.toString(),
//                                   name: `IOU-${field.value}`,
//                                 }
//                               : null
//                           }
//                           onChange={(val) => {
//                             const newIouId = val ? Number(val.id) : null
//                             field.onChange(newIouId)

//                             if (!newIouId) return

//                             const selected = filteredIouList.find(
//                               (iou) => iou.iouId === newIouId
//                             )
//                             if (!selected) return

//                             // Auto-fill Company, Location, Receiver
//                             if (selected.companyId) {
//                               form.setValue(
//                                 'companyId',
//                                 Number(selected.companyId)
//                               )
//                             }
//                             if (selected.locationId) {
//                               form.setValue(
//                                 'locationId',
//                                 Number(selected.locationId)
//                               )
//                             }
//                             if (selected.employeeId) {
//                               form.setValue(
//                                 'receiverEmployeeId',
//                                 Number(selected.employeeId)
//                               )
//                               const emp = employeeData.find(
//                                 (e) => e.id === Number(selected.employeeId)
//                               )
//                               if (emp)
//                                 form.setValue('receiverName', emp.employeeName)
//                             }

//                             // Auto-fill amount on first row if only one row exists
//                             const outstanding =
//                               (selected.amount ?? 0) -
//                               (selected.adjustedAmount ?? 0)
//                             const currentRows = form.getValues('rows') || []
//                             if (currentRows.length === 1) {
//                               form.setValue(
//                                 'rows.0.amount',
//                                 outstanding as unknown as number
//                               )
//                             }
//                           }}
//                           placeholder="Select IOU"
//                         />
//                         <div className="min-h-[18px] px-1 mt-0.5">
//                           {outstandingBalance !== null && (
//                             <p className="flex items-center gap-1">
//                               <span className="text-[10px] text-black font-bold">
//                                 Adjustment Amount:
//                               </span>
//                               <span
//                                 className={`text-[11px] font-semibold tabular-nums ${
//                                   outstandingBalance > 0
//                                     ? 'text-emerald-600'
//                                     : 'text-slate-400'
//                                 }`}
//                               >
//                                 {outstandingBalance.toLocaleString('en-US', {
//                                   minimumFractionDigits: 2,
//                                   maximumFractionDigits: 2,
//                                 })}
//                               </span>
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                       <FormMessage />
//                     </FormItem>
//                   )
//                 }}
//               />
//             </div>

//             {/* ══ Notes ══ */}
//             <FormField
//               control={form.control}
//               name="notes"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Notes</FormLabel>
//                   <FormControl>
//                     <Textarea
//                       {...field}
//                       placeholder="Enter notes (optional)"
//                       className="min-h-[80px] resize-y"
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* ══ Details Table ══ */}
//             <div className="border rounded-md">
//               {/* Table header */}
//               <div className="bg-slate-100 grid grid-cols-[2fr_1.5fr_1.5fr_2fr_2fr_1.5fr_1.5fr_40px] text-xs font-semibold text-muted-foreground border-b rounded-t-md overflow-hidden">
//                 <div className="px-3 py-2 border-r">Account Name</div>
//                 <div className="px-3 py-2 border-r">Cost Center</div>
//                 <div className="px-3 py-2 border-r">Unit</div>
//                 <div className="px-3 py-2 border-r">Employee</div>
//                 <div className="px-3 py-2 border-r">Partner Name</div>
//                 <div className="px-3 py-2 border-r">Remarks</div>
//                 <div className="px-3 py-2 border-r">Amount</div>
//                 <div className="px-3 py-2" />
//               </div>

//               {/* Rows */}
//               <div className="divide-y">
//                 {fields.map((field, index) => (
//                   <div
//                     key={field.id}
//                     className="grid grid-cols-[2fr_1.5fr_1.5fr_2fr_2fr_1.5fr_1.5fr_40px] bg-white items-start"
//                   >
//                     {/* Account Name */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.accountId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={companyFilteredAccounts.map((account) => ({
//                               id: account.accountId.toString(),
//                               name: account.name || 'Unnamed Account',
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name:
//                                       companyFilteredAccounts.find(
//                                         (a) => a.accountId === f.value
//                                       )?.name || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) =>
//                               f.onChange(val ? Number(val.id) : null)
//                             }
//                             placeholder={
//                               !isCompanySelected
//                                 ? 'Select company first'
//                                 : companyFilteredAccounts.length === 0
//                                   ? 'No accounts'
//                                   : 'Select an account'
//                             }
//                             disabled={
//                               !isCompanySelected ||
//                               companyFilteredAccounts.length === 0
//                             }
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Cost Center */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.costCenterId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={costCenterData
//                               .filter((cc) => cc.isActive)
//                               .map((cc) => ({
//                                 id: cc.costCenterId.toString(),
//                                 name: cc.costCenterName,
//                               }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name:
//                                       costCenterData.find(
//                                         (cc) => cc.costCenterId === f.value
//                                       )?.costCenterName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) =>
//                               f.onChange(val ? Number(val.id) : null)
//                             }
//                             placeholder="Select a cost center"
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Unit (Department) */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.departmentId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={filteredDepartments.map((dept) => ({
//                               id: dept.departmentID.toString(),
//                               name: dept.departmentName || 'Unnamed Department',
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name:
//                                       filteredDepartments.find(
//                                         (d) => d.departmentID === f.value
//                                       )?.departmentName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) =>
//                               f.onChange(val ? Number(val.id) : null)
//                             }
//                             placeholder={
//                               !isCompanySelected
//                                 ? 'Select company first'
//                                 : filteredDepartments.length === 0
//                                   ? 'No units'
//                                   : 'Select a unit'
//                             }
//                             disabled={
//                               !isCompanySelected ||
//                               filteredDepartments.length === 0
//                             }
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Employee */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.employeeId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={employeeData.map((emp) => ({
//                               id: emp.id.toString(),
//                               name: `${emp.employeeName} (${emp.employeeId})`,
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name:
//                                       employeeData.find(
//                                         (emp) => emp.id === f.value
//                                       )?.employeeName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) =>
//                               f.onChange(val ? Number(val.id) : null)
//                             }
//                             placeholder="Select an employee"
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Partner */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.resPartnerId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomComboboxWithApi
//                             items={partners.map((partner) => ({
//                               id: partner.id.toString(),
//                               name: partner.name || '',
//                             }))}
//                             value={
//                               f.value
//                                 ? (partners.find(
//                                     (p) => p.id === Number(f.value)
//                                   ) ?? {
//                                     id: f.value,
//                                     name: partnerValues[index]?.name || '',
//                                   })
//                                 : null
//                             }
//                             onChange={(item) =>
//                               f.onChange(item ? Number(item.id) : null)
//                             }
//                             placeholder="Select partner"
//                             searchFunction={searchPartners}
//                             fetchByIdFunction={async (id) => {
//                               const numericId =
//                                 typeof id === 'string' && /^\d+$/.test(id)
//                                   ? parseInt(id, 10)
//                                   : (id as number)
//                               const partner = await getPartnerById(
//                                 numericId,
//                                 token
//                               )
//                               return partner?.data
//                                 ? {
//                                     id: partner.data.id.toString(),
//                                     name: partner.data.name ?? '',
//                                   }
//                                 : null
//                             }}
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Remarks */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.remarks`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               placeholder="Enter remarks"
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Amount */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.amount`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               type="number"
//                               step="0.01"
//                               min="0"
//                               placeholder="Amount"
//                               value={
//                                 f.value === undefined ||
//                                 (f.value as unknown) === 0
//                                   ? ''
//                                   : f.value
//                               }
//                               onChange={(e) => {
//                                 const raw = e.target.value
//                                 f.onChange(
//                                   raw === '' ? undefined : parseFloat(raw)
//                                 )
//                               }}
//                               onWheel={(e) =>
//                                 (e.target as HTMLInputElement).blur()
//                               }
//                               onKeyDown={(e) => {
//                                 if (
//                                   e.key === 'ArrowUp' ||
//                                   e.key === 'ArrowDown'
//                                 )
//                                   e.preventDefault()
//                               }}
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Delete */}
//                     <div className="flex items-center justify-center h-10">
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="icon"
//                         className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
//                         onClick={() => fields.length > 1 && remove(index)}
//                         disabled={fields.length === 1}
//                       >
//                         <Trash2 className="h-3.5 w-3.5" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Add Another */}
//               <button
//                 type="button"
//                 onClick={addRow}
//                 className="w-full py-2 border-t text-sm text-muted-foreground hover:bg-slate-50 hover:text-foreground flex items-center justify-center gap-2 transition-colors rounded-b-md"
//                 disabled={!isCompanySelected}
//               >
//                 <Plus className="h-4 w-4" />
//                 Add Another
//               </button>
//             </div>

//             {/* ══ Action Buttons ══ */}
//             <div className="flex justify-end space-x-3 pt-2 border-t">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() =>
//                   form.reset({
//                     companyId: form.getValues('companyId'),
//                     locationId: form.getValues('locationId'),
//                     currency: form.getValues('currency'),
//                     date: form.getValues('date'),
//                     iouId: undefined,
//                     receiverName: '',
//                     notes: '',
//                     rows: [emptyRow()],
//                   })
//                 }
//               >
//                 Reset
//               </Button>

//               <Button
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={() => form.handleSubmit(onSubmit)()}
//               >
//                 {isSubmitting ? 'Submitting...' : 'Submit Adjustment'}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </div>
//     </div>
//   )
// }

// export default IouAdjustmentForm


// 'use client'

// import type React from 'react'
// import { useState, useEffect, useCallback, useMemo } from 'react'
// import { useForm, useFieldArray } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { format } from 'date-fns'
// import { Plus, Trash2 } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import {
//   type ComboboxItem,
//   CustomComboboxWithApi,
// } from '@/utils/custom-combobox-with-api'
// import { toast } from '@/hooks/use-toast'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import type {
//   Employee,
//   LocationData,
//   CostCenter,
//   IouRecordGetType,
//   AccountsHead,
//   CompanyChartOfAccount,
//   GetDepartment,
//   ResPartner,
// } from '@/utils/type'
// import type { CompanyType } from '@/api/company-api'
// import {
//   getEmployee,
//   getAllCompanies,
//   getAllLocations,
//   getAllCostCenters,
//   getAllCurrency,
//   getAllChartOfAccounts,
//   getAllDepartments,
//   getResPartnersBySearch,
//   getPartnerById,
// } from '@/api/common-shared-api'
// import { getCompanyWiseChartOfAccounts } from '@/api/chart-of-accounts-api'
// import { getLoanData } from '@/api/iou-api'
// import Loader from '@/utils/loader'

// // ─── Zod Schema ───────────────────────────────────────────────────────────────

// const AdjRowSchema = z.object({
//   accountId: z
//     .number({ invalid_type_error: 'Account is required' })
//     .int()
//     .positive('Account is required'),
//   costCenterId: z
//     .number({ invalid_type_error: 'Cost center is required' })
//     .int()
//     .positive('Cost center is required'),
//   departmentId: z
//     .number({ invalid_type_error: 'Unit is required' })
//     .int()
//     .positive('Unit is required'),
//   employeeId: z
//     .number({ invalid_type_error: 'Employee is required' })
//     .int()
//     .positive('Employee is required'),
//   resPartnerId: z.number().int().positive().nullable().optional(),
//   remarks: z.string().optional(),
//   amount: z
//     .number({ invalid_type_error: 'Amount is required' })
//     .positive('Must be greater than 0'),
// })

// const IouAdjFormSchema = z.object({
//   companyId: z
//     .number({ invalid_type_error: 'Company is required' })
//     .int()
//     .positive('Company is required'),
//   locationId: z
//     .number({ invalid_type_error: 'Location is required' })
//     .int()
//     .positive('Location is required'),
//   currency: z.string().min(1, 'Currency is required'),
//   date: z.string().min(1, 'Date is required'),
//   // Receiver employee (optional — selecting auto-fills receiverName)
//   receiverEmployeeId: z.number().int().positive().optional(),
//   // IOU List selection
//   iouId: z
//     .number({ invalid_type_error: 'IOU is required' })
//     .int()
//     .positive('IOU is required'),
//   receiverName: z.string().min(1, 'Receiver name is required'),
//   notes: z.string().optional(),
//   rows: z.array(AdjRowSchema).min(1),
// })

// type IouAdjFormType = z.infer<typeof IouAdjFormSchema>

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const emptyRow = () => ({
//   accountId: undefined as unknown as number,
//   costCenterId: undefined as unknown as number,
//   departmentId: undefined as unknown as number,
//   employeeId: undefined as unknown as number,
//   resPartnerId: null,
//   remarks: '',
//   amount: undefined as unknown as number,
// })

// // ─── Component ────────────────────────────────────────────────────────────────

// const IouAdjustmentForm: React.FC = () => {
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)
//   const [userData] = useAtom(userDataAtom)

//   // ── Data state ──
//   const [employeeData, setEmployeeData] = useState<Employee[]>([])
//   const [companyData, setCompanyData] = useState<CompanyType[]>([])
//   const [locationData, setLocationData] = useState<LocationData[]>([])
//   const [costCenterData, setCostCenterData] = useState<CostCenter[]>([])
//   const [currencyList, setCurrencyList] = useState<{ currencyCode: string }[]>([])
//   const [iouList, setIouList] = useState<IouRecordGetType[]>([])
//   const [chartOfAccounts, setChartOfAccounts] = useState<AccountsHead[]>([])
//   const [companyChartOfAccount, setCompanyChartOfAccount] = useState<
//     CompanyChartOfAccount[]
//   >([])
//   const [departments, setDepartments] = useState<GetDepartment[]>([])
//   const [partners, setPartners] = useState<ResPartner[]>([])
//   const [isDataLoading, setIsDataLoading] = useState(true)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   // ── Per-row partner display values (mirrors CashVoucherDetails' partnerValue pattern) ──
//   // Keyed by row index. Needed because a previously-saved resPartnerId may not be in the
//   // initially-loaded `partners` list (e.g. it was found via search), so we resolve it once
//   // via getPartnerById and cache the {id, name} here for display.
//   const [partnerValues, setPartnerValues] = useState<
//     Record<number, { id: number | string; name: string } | null>
//   >({})

//   // ── Fetch on mount ──
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [
//           empRes,
//           compRes,
//           locRes,
//           ccRes,
//           curRes,
//           iouRes,
//           coaRes,
//           companyCoaRes,
//           deptRes,
//           partnerRes,
//         ] = await Promise.all([
//           getEmployee(token),
//           getAllCompanies(token),
//           getAllLocations(token),
//           getAllCostCenters(token),
//           getAllCurrency(token),
//           getLoanData(token),
//           getAllChartOfAccounts(token),
//           getCompanyWiseChartOfAccounts(token),
//           getAllDepartments(token),
//           getResPartnersBySearch('', token),
//         ])
//         setEmployeeData(empRes.data ?? [])
//         setCompanyData(compRes.data ?? [])
//         setLocationData(locRes.data ?? [])
//         setCostCenterData(ccRes.data ?? [])
//         setCurrencyList(curRes.data ?? [])
//         setIouList(iouRes.data ?? [])
//         setChartOfAccounts(coaRes.data ?? [])
//         setCompanyChartOfAccount(companyCoaRes.data ?? [])
//         setDepartments(deptRes.data ?? [])
//         setPartners(partnerRes.data ?? [])
//       } catch (error) {
//         console.error('Failed to load form data:', error)
//         toast({ title: 'Error', description: 'Failed to load form data.', variant: 'destructive' })
//       } finally {
//         setIsDataLoading(false)
//       }
//     }
//     if (token) fetchData()
//   }, [token])

//   // ── Form ──
//   const form = useForm<IouAdjFormType>({
//     resolver: zodResolver(IouAdjFormSchema),
//     defaultValues: {
//       companyId: undefined,
//       locationId: undefined,
//       currency: 'BDT',
//       date: format(new Date(), 'yyyy-MM-dd'),
//       receiverEmployeeId: undefined,
//       iouId: undefined,
//       receiverName: '',
//       notes: '',
//       rows: [emptyRow()],
//     },
//   })

//   const { fields, append, remove } = useFieldArray({ control: form.control, name: 'rows' })

//   const selectedCompanyId = form.watch('companyId')

//   const filteredLocations = selectedCompanyId
//     ? locationData.filter((loc) => Number(loc.companyId) === Number(selectedCompanyId))
//     : locationData

//   // Only show IOUs that still have an outstanding balance — fully settled
//   // (amount - adjustedAmount <= 0) IOUs are hidden from the dropdown.
//   const filteredIouList = useMemo(
//     () =>
//       iouList.filter(
//         (iou) => (iou.amount ?? 0) - (iou.adjustedAmount ?? 0) > 0
//       ),
//     [iouList]
//   )

//   // ── Company-wise chart of accounts (same pattern as Cash Voucher) ──
//   const companyFilteredAccounts = useMemo(() => {
//     if (!selectedCompanyId || !companyChartOfAccount.length || !chartOfAccounts.length) {
//       return []
//     }
//     const ids = companyChartOfAccount
//       .filter((m) => m.companyId === selectedCompanyId)
//       .map((m) => m.chartOfAccountId)
//     return chartOfAccounts.filter((acc) => ids.includes(acc.accountId) && !acc.isGroup && acc.isActive)
//   }, [selectedCompanyId, companyChartOfAccount, chartOfAccounts])

//   // Departments ("Unit") — company-wise filtered
//   const filteredDepartments = useMemo(() => {
//     if (!selectedCompanyId) return []
//     return departments.filter(
//       (d) => d.isActive && d.companyCode === selectedCompanyId
//     )
//   }, [departments, selectedCompanyId])

//   const isCompanySelected = !!selectedCompanyId

//   // ── Partner search (always enabled, same as Cash Voucher pattern) ──
//   const searchPartners = useCallback(
//     async (query: string): Promise<ComboboxItem[]> => {
//       try {
//         const response = await getResPartnersBySearch(query, token)
//         if (response.error || !response.data) return []
//         return response.data.map((partner) => ({
//           id: partner.id.toString(),
//           name: partner.name || 'Unnamed Partner',
//         }))
//       } catch {
//         return []
//       }
//     },
//     [token]
//   )

//   // ── Resolve display name for each row's selected partner ──
//   // Mirrors CashVoucherDetails: watch each row's resPartnerId, try local `partners`
//   // list first, and only hit the API if it's not found there.
//   const watchedRows = form.watch('rows')

//   useEffect(() => {
//     const loadPartners = async () => {
//       const updates: Record<number, { id: number | string; name: string } | null> = {}

//       for (let index = 0; index < watchedRows.length; index++) {
//         const partnerId = watchedRows[index]?.resPartnerId
//         if (!partnerId) {
//           updates[index] = null
//           continue
//         }
//         const local = partners.find((p) => p.id === Number(partnerId))
//         if (local) {
//           updates[index] = { id: local.id, name: local.name || '' }
//           continue
//         }
//         // Not in the locally loaded list — resolve once via API
//         const fetched = await getPartnerById(Number(partnerId), token)
//         updates[index] = fetched?.data
//           ? { id: fetched.data.id, name: fetched.data.name || '' }
//           : null
//       }

//       setPartnerValues(updates)
//     }

//     loadPartners()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [JSON.stringify(watchedRows?.map((r) => r.resPartnerId)), partners, token])

//   // Selected IOU's outstanding balance — used to auto-fill row amounts
//   const selectedIouId = form.watch('iouId')
//   const selectedIouOutstanding = useMemo(() => {
//     const iou = filteredIouList.find((i) => i.iouId === selectedIouId)
//     if (!iou) return null
//     return (iou.amount ?? 0) - (iou.adjustedAmount ?? 0)
//   }, [filteredIouList, selectedIouId])

//   const addRow = () => {
//     if (selectedIouOutstanding !== null) {
//       const currentRows = form.getValues('rows') || []
//       const usedSoFar = currentRows.reduce(
//         (sum, row) => sum + (Number(row.amount) || 0),
//         0
//       )
//       const remaining = Math.max(selectedIouOutstanding - usedSoFar, 0)
//       append({ ...emptyRow(), amount: remaining as unknown as number })
//       return
//     }
//     append(emptyRow())
//   }

//   // ── Submit ──
//   const onSubmit = async (data: IouAdjFormType) => {
//     const createdBy = userData?.userId
//     if (!createdBy) {
//       toast({ title: 'Error', description: 'User not found.', variant: 'destructive' })
//       return
//     }

//     setIsSubmitting(true)
//     try {
//       // Each row becomes one adjustment; backend creates the linked journal entry.
//       const payload = {
//         iouId: data.iouId,
//         companyId: data.companyId,
//         locationId: data.locationId,
//         currencyId: 1, // TODO: map data.currency (code) -> currencyId once currency API returns ids here
//         exchangeRate: 1,
//         adjustmentDate: data.date,
//         notes: data.notes,
//         createdBy,
//         rows: data.rows.map((row) => ({
//           accountId: row.accountId,
//           costCenterId: row.costCenterId,
//           departmentId: row.departmentId,
//           employeeId: row.employeeId,
//           resPartnerId: row.resPartnerId ?? null,
//           remarks: row.remarks,
//           amountAdjusted: row.amount,
//           adjustmentType: 'adjustment',
//         })),
//       }

//       // TODO: await createIouAdjustment(payload, token)
//       console.log('IOU Adjustment payload:', payload)

//       toast({ title: 'Success', description: 'IOU Adjustment submitted successfully!' })
//       form.reset({
//         companyId: data.companyId,
//         locationId: data.locationId,
//         currency: data.currency,
//         date: data.date,
//         receiverEmployeeId: undefined,
//         iouId: undefined,
//         receiverName: '',
//         notes: '',
//         rows: [emptyRow()],
//       })
//       setPartnerValues({})
//     } catch (error) {
//       console.error('Failed to submit IOU adjustment:', error)
//       toast({ title: 'Error', description: 'Failed to submit IOU adjustment.', variant: 'destructive' })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   if (isDataLoading) return <Loader />

//   // ─────────────────────────────────────────────────────────────────────────────

//   return (
//     <div className="p-4">
//       <div className="border rounded-lg p-6 bg-slate-50 shadow-sm">
//         <h2 className="text-lg font-semibold mb-4">IOU Adjustment</h2>

//         {!isCompanySelected && (
//           <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
//             ⚠️ Please select a company first to see available accounts and units.
//           </div>
//         )}

//         <Form {...form}>
//           <form className="space-y-4">

//             {/* ══ Master Row: Company | Location | Currency | Date ══ */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

//               {/* Company */}
//               <FormField
//                 control={form.control}
//                 name="companyId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Company Name</FormLabel>
//                     <CustomCombobox
//                       items={companyData.map((c) => ({
//                         id: c.companyId?.toString() ?? '',
//                         name: c.companyName,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: companyData.find((c) => Number(c.companyId) === field.value)?.companyName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => {
//                         field.onChange(val ? Number(val.id) : null)
//                         // reset dependent selections when company is changed manually
//                         form.setValue('locationId', undefined as unknown as number)
//                         form.setValue('iouId', undefined as unknown as number)
//                         form.setValue('receiverName', '')
//                         const currentRows = form.getValues('rows') || []
//                         currentRows.forEach((_, idx) => {
//                           form.setValue(`rows.${idx}.accountId`, undefined as unknown as number)
//                           form.setValue(`rows.${idx}.departmentId`, undefined as unknown as number)
//                         })
//                       }}
//                       placeholder="Select a company"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Location */}
//               <FormField
//                 control={form.control}
//                 name="locationId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Location</FormLabel>
//                     <CustomCombobox
//                       items={filteredLocations.map((loc) => ({
//                         id: loc.locationId.toString(),
//                         name: loc.branchName,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: filteredLocations.find((loc) => Number(loc.locationId) === field.value)?.branchName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => field.onChange(val ? Number(val.id) : null)}
//                       placeholder={filteredLocations.length > 0 ? 'Select a location' : 'No locations'}
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Currency */}
//               <FormField
//                 control={form.control}
//                 name="currency"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Currency</FormLabel>
//                     <CustomCombobox
//                       items={
//                         currencyList.length > 0
//                           ? currencyList.map((c) => ({ id: c.currencyCode, name: c.currencyCode }))
//                           : ['BDT', 'USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD'].map((c) => ({ id: c, name: c }))
//                       }
//                       value={field.value ? { id: field.value, name: field.value } : null}
//                       onChange={(val) => field.onChange(val ? val.id : '')}
//                       placeholder="Select currency"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Date */}
//               <FormField
//                 control={form.control}
//                 name="date"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Date</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         type="date"
//                         value={field.value ?? ''}
//                         onChange={(e) => field.onChange(e.target.value)}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* ══ Receiver Name Row: [Employee dropdown] [Name text] [IOU List] ══ */}
//             {/* Order matches Cash Voucher's payTo field: combobox first, manual text second */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

//               {/* Employee dropdown — selecting fills the name */}
//               <FormField
//                 control={form.control}
//                 name="receiverEmployeeId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Receiver Name</FormLabel>
//                     <CustomCombobox
//                       items={employeeData.map((emp) => ({
//                         id: emp.id.toString(),
//                         name: `${emp.employeeName} (${emp.employeeId})`,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: employeeData.find((emp) => emp.id === field.value)?.employeeName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => {
//                         field.onChange(val ? Number(val.id) : null)
//                         if (val) {
//                           const emp = employeeData.find((e) => e.id === Number(val.id))
//                           if (emp) form.setValue('receiverName', emp.employeeName)
//                         } else {
//                           form.setValue('receiverName', '')
//                         }
//                       }}
//                       placeholder="Select employee"
//                       disabled={!!form.watch('receiverName')?.trim() && !form.watch('receiverEmployeeId')}
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Receiver Name — free text */}
//               <FormField
//                 control={form.control}
//                 name="receiverName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>&nbsp;</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         placeholder="Enter receiver name"
//                         onChange={(e) => {
//                           field.onChange(e.target.value)
//                           // Manual typing overrides the dropdown-selected employee
//                           if (e.target.value) {
//                             form.setValue('receiverEmployeeId', undefined)
//                           }
//                         }}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* IOU List dropdown — shows outstanding balance once selected */}
//               <FormField
//                 control={form.control}
//                 name="iouId"
//                 render={({ field }) => {
//                   const selectedIou = filteredIouList.find(
//                     (iou) => iou.iouId === field.value
//                   )
//                   const outstandingBalance = selectedIou
//                     ? (selectedIou.amount ?? 0) - (selectedIou.adjustedAmount ?? 0)
//                     : null

//                   return (
//                     <FormItem>
//                       <FormLabel>IOU List</FormLabel>
//                       <div className="flex flex-col">
//                         <CustomCombobox
//                           items={filteredIouList.map((iou) => ({
//                             id: iou.iouId.toString(),
//                             name: `IOU-${iou.iouId}`,
//                           }))}
//                           value={
//                             field.value
//                               ? { id: field.value.toString(), name: `IOU-${field.value}` }
//                               : null
//                           }
//                           onChange={(val) => {
//                             const newIouId = val ? Number(val.id) : null
//                             field.onChange(newIouId)

//                             if (!newIouId) return

//                             const selected = filteredIouList.find(
//                               (iou) => iou.iouId === newIouId
//                             )
//                             if (!selected) return

//                             // Auto-fill Company, Location, and Receiver — date stays independent
//                             if (selected.companyId) {
//                               form.setValue('companyId', Number(selected.companyId))
//                             }
//                             if (selected.locationId) {
//                               form.setValue('locationId', Number(selected.locationId))
//                             }
//                             if (selected.employeeId) {
//                               form.setValue('receiverEmployeeId', Number(selected.employeeId))
//                               const emp = employeeData.find(
//                                 (e) => e.id === Number(selected.employeeId)
//                               )
//                               if (emp) form.setValue('receiverName', emp.employeeName)
//                             }

//                             // Auto-fill the amount on the first row with the full
//                             // outstanding balance — only when a single row exists
//                             // (i.e. user hasn't started splitting the adjustment yet).
//                             const outstanding =
//                               (selected.amount ?? 0) - (selected.adjustedAmount ?? 0)
//                             const currentRows = form.getValues('rows') || []
//                             if (currentRows.length === 1) {
//                               form.setValue(
//                                 'rows.0.amount',
//                                 outstanding as unknown as number
//                               )
//                             }
//                           }}
//                           placeholder="Select IOU"
//                         />
//                         {/* Balance row — same pattern as Cash Voucher account balance */}
//                         <div className="min-h-[18px] px-1 mt-0.5">
//                           {outstandingBalance !== null && (
//                             <p className="flex items-center gap-1">
//                               <span className="text-[10px] text-black font-bold">
//                                 Adjustment Amount:
//                               </span>
//                               <span
//                                 className={`text-[11px] font-semibold tabular-nums ${
//                                   outstandingBalance > 0
//                                     ? 'text-emerald-600'
//                                     : 'text-slate-400'
//                                 }`}
//                               >
//                                 {outstandingBalance.toLocaleString('en-US', {
//                                   minimumFractionDigits: 2,
//                                   maximumFractionDigits: 2,
//                                 })}
//                               </span>
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                       <FormMessage />
//                     </FormItem>
//                   )
//                 }}
//               />
//             </div>

//             {/* ══ Notes ══ */}
//             <FormField
//               control={form.control}
//               name="notes"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Notes</FormLabel>
//                   <FormControl>
//                     <Textarea
//                       {...field}
//                       placeholder="Enter notes (optional)"
//                       className="min-h-[80px] resize-y"
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* ══ Details Table ══ */}
//             <div className="border rounded-md">
//               {/* Table header */}
//               <div className="bg-slate-100 grid grid-cols-[2fr_1.5fr_1.5fr_2fr_2fr_1.5fr_1.5fr_40px] text-xs font-semibold text-muted-foreground border-b rounded-t-md overflow-hidden">
//                 <div className="px-3 py-2 border-r">Account Name</div>
//                 <div className="px-3 py-2 border-r">Cost Center</div>
//                 <div className="px-3 py-2 border-r">Unit</div>
//                 <div className="px-3 py-2 border-r">Employee</div>
//                 <div className="px-3 py-2 border-r">Partner Name</div>
//                 <div className="px-3 py-2 border-r">Remarks</div>
//                 <div className="px-3 py-2 border-r">Amount</div>
//                 <div className="px-3 py-2" />
//               </div>

//               {/* Rows */}
//               <div className="divide-y">
//                 {fields.map((field, index) => (
//                   <div
//                     key={field.id}
//                     className="grid grid-cols-[2fr_1.5fr_1.5fr_2fr_2fr_1.5fr_1.5fr_40px] bg-white items-start"
//                   >
//                     {/* Account Name — company-wise filtered */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.accountId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={companyFilteredAccounts.map((account) => ({
//                               id: account.accountId.toString(),
//                               name: account.name || 'Unnamed Account',
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name:
//                                       companyFilteredAccounts.find(
//                                         (a) => a.accountId === f.value
//                                       )?.name || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder={
//                               !isCompanySelected
//                                 ? 'Select company first'
//                                 : companyFilteredAccounts.length === 0
//                                   ? 'No accounts'
//                                   : 'Select an account'
//                             }
//                             disabled={!isCompanySelected || companyFilteredAccounts.length === 0}
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Cost Center */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.costCenterId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={costCenterData
//                               .filter((cc) => cc.isActive)
//                               .map((cc) => ({
//                                 id: cc.costCenterId.toString(),
//                                 name: cc.costCenterName,
//                               }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name: costCenterData.find((cc) => cc.costCenterId === f.value)?.costCenterName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder="Select a cost center"
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Unit (Department) — company-wise filtered */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.departmentId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={filteredDepartments.map((dept) => ({
//                               id: dept.departmentID.toString(),
//                               name: dept.departmentName || 'Unnamed Department',
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name:
//                                       filteredDepartments.find(
//                                         (d) => d.departmentID === f.value
//                                       )?.departmentName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder={
//                               !isCompanySelected
//                                 ? 'Select company first'
//                                 : filteredDepartments.length === 0
//                                   ? 'No units'
//                                   : 'Select a unit'
//                             }
//                             disabled={!isCompanySelected || filteredDepartments.length === 0}
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Employee */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.employeeId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={employeeData.map((emp) => ({
//                               id: emp.id.toString(),
//                               name: `${emp.employeeName} (${emp.employeeId})`,
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name: employeeData.find((emp) => emp.id === f.value)?.employeeName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder="Select an employee"
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Partner — always enabled, search-as-you-type (mirrors CashVoucherDetails) */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.resPartnerId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomComboboxWithApi
//                             items={partners.map((partner) => ({
//                               id: partner.id.toString(),
//                               name: partner.name || '',
//                             }))}
//                             value={
//                               f.value
//                                 ? (partners.find((p) => p.id === Number(f.value)) ?? {
//                                     id: f.value,
//                                     name: partnerValues[index]?.name || '',
//                                   })
//                                 : null
//                             }
//                             onChange={(item) => f.onChange(item ? Number(item.id) : null)}
//                             placeholder="Select partner"
//                             searchFunction={searchPartners}
//                             fetchByIdFunction={async (id) => {
//                               const numericId =
//                                 typeof id === 'string' && /^\d+$/.test(id) ? parseInt(id, 10) : (id as number)
//                               const partner = await getPartnerById(numericId, token)
//                               return partner?.data
//                                 ? { id: partner.data.id.toString(), name: partner.data.name ?? '' }
//                                 : null
//                             }}
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Remarks */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.remarks`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               placeholder="Enter remarks"
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Amount */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.amount`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               type="number"
//                               step="0.01"
//                               min="0"
//                               placeholder="Amount"
//                               value={
//                                 f.value === undefined || (f.value as unknown) === 0
//                                   ? ''
//                                   : f.value
//                               }
//                               onChange={(e) => {
//                                 const raw = e.target.value
//                                 f.onChange(raw === '' ? undefined : parseFloat(raw))
//                               }}
//                               onWheel={(e) => (e.target as HTMLInputElement).blur()}
//                               onKeyDown={(e) => {
//                                 if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault()
//                               }}
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Delete */}
//                     <div className="flex items-center justify-center h-10">
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="icon"
//                         className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
//                         onClick={() => fields.length > 1 && remove(index)}
//                         disabled={fields.length === 1}
//                       >
//                         <Trash2 className="h-3.5 w-3.5" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Add Another */}
//               <button
//                 type="button"
//                 onClick={addRow}
//                 className="w-full py-2 border-t text-sm text-muted-foreground hover:bg-slate-50 hover:text-foreground flex items-center justify-center gap-2 transition-colors rounded-b-md"
//                 disabled={!isCompanySelected}
//               >
//                 <Plus className="h-4 w-4" />
//                 Add Another
//               </button>
//             </div>

//             {/* ══ Action Buttons ══ */}
//             <div className="flex justify-end space-x-3 pt-2 border-t">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() =>
//                   form.reset({
//                     companyId: form.getValues('companyId'),
//                     locationId: form.getValues('locationId'),
//                     currency: form.getValues('currency'),
//                     date: form.getValues('date'),
//                     iouId: undefined,
//                     receiverName: '',
//                     notes: '',
//                     rows: [emptyRow()],
//                   })
//                 }
//               >
//                 Reset
//               </Button>

//               <Button
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={() => form.handleSubmit(onSubmit)()}
//               >
//                 {isSubmitting ? 'Submitting...' : 'Submit Adjustment'}
//               </Button>
//             </div>

//           </form>
//         </Form>
//       </div>
//     </div>
//   )
// }

// export default IouAdjustmentForm


// 'use client'

// import type React from 'react'
// import { useState, useEffect, useCallback, useMemo } from 'react'
// import { useForm, useFieldArray } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { format } from 'date-fns'
// import { Plus, Trash2 } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import {
//   type ComboboxItem,
//   CustomComboboxWithApi,
// } from '@/utils/custom-combobox-with-api'
// import { toast } from '@/hooks/use-toast'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import type {
//   Employee,
//   LocationData,
//   CostCenter,
//   IouRecordGetType,
//   AccountsHead,
//   CompanyChartOfAccount,
//   GetDepartment,
//   ResPartner,
// } from '@/utils/type'
// import type { CompanyType } from '@/api/company-api'
// import {
//   getEmployee,
//   getAllCompanies,
//   getAllLocations,
//   getAllCostCenters,
//   getAllCurrency,
//   getAllChartOfAccounts,
//   getAllDepartments,
//   getResPartnersBySearch,
//   getPartnerById,
// } from '@/api/common-shared-api'
// import { getCompanyWiseChartOfAccounts } from '@/api/chart-of-accounts-api'
// import { getLoanData } from '@/api/iou-api'
// import Loader from '@/utils/loader'

// // ─── Zod Schema ───────────────────────────────────────────────────────────────

// const AdjRowSchema = z.object({
//   accountId: z
//     .number({ invalid_type_error: 'Account is required' })
//     .int()
//     .positive('Account is required'),
//   costCenterId: z
//     .number({ invalid_type_error: 'Cost center is required' })
//     .int()
//     .positive('Cost center is required'),
//   departmentId: z
//     .number({ invalid_type_error: 'Unit is required' })
//     .int()
//     .positive('Unit is required'),
//   employeeId: z
//     .number({ invalid_type_error: 'Employee is required' })
//     .int()
//     .positive('Employee is required'),
//   resPartnerId: z.number().int().positive().nullable().optional(),
//   remarks: z.string().optional(),
//   amount: z
//     .number({ invalid_type_error: 'Amount is required' })
//     .positive('Must be greater than 0'),
// })

// const IouAdjFormSchema = z.object({
//   companyId: z
//     .number({ invalid_type_error: 'Company is required' })
//     .int()
//     .positive('Company is required'),
//   locationId: z
//     .number({ invalid_type_error: 'Location is required' })
//     .int()
//     .positive('Location is required'),
//   currency: z.string().min(1, 'Currency is required'),
//   date: z.string().min(1, 'Date is required'),
//   // Receiver employee (optional — selecting auto-fills receiverName)
//   receiverEmployeeId: z.number().int().positive().optional(),
//   // IOU List selection
//   iouId: z
//     .number({ invalid_type_error: 'IOU is required' })
//     .int()
//     .positive('IOU is required'),
//   receiverName: z.string().min(1, 'Receiver name is required'),
//   notes: z.string().optional(),
//   rows: z.array(AdjRowSchema).min(1),
// })

// type IouAdjFormType = z.infer<typeof IouAdjFormSchema>

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const emptyRow = () => ({
//   accountId: undefined as unknown as number,
//   costCenterId: undefined as unknown as number,
//   departmentId: undefined as unknown as number,
//   employeeId: undefined as unknown as number,
//   resPartnerId: null,
//   remarks: '',
//   amount: undefined as unknown as number,
// })

// // ─── Component ────────────────────────────────────────────────────────────────

// const IouAdjustmentForm: React.FC = () => {
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)
//   const [userData] = useAtom(userDataAtom)

//   // ── Data state ──
//   const [employeeData, setEmployeeData] = useState<Employee[]>([])
//   const [companyData, setCompanyData] = useState<CompanyType[]>([])
//   const [locationData, setLocationData] = useState<LocationData[]>([])
//   const [costCenterData, setCostCenterData] = useState<CostCenter[]>([])
//   const [currencyList, setCurrencyList] = useState<{ currencyCode: string }[]>([])
//   const [iouList, setIouList] = useState<IouRecordGetType[]>([])
//   const [chartOfAccounts, setChartOfAccounts] = useState<AccountsHead[]>([])
//   const [companyChartOfAccount, setCompanyChartOfAccount] = useState<
//     CompanyChartOfAccount[]
//   >([])
//   const [departments, setDepartments] = useState<GetDepartment[]>([])
//   const [partners, setPartners] = useState<ResPartner[]>([])
//   const [isDataLoading, setIsDataLoading] = useState(true)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   // ── Per-row partner display values (mirrors CashVoucherDetails' partnerValue pattern) ──
//   // Keyed by row index. Needed because a previously-saved resPartnerId may not be in the
//   // initially-loaded `partners` list (e.g. it was found via search), so we resolve it once
//   // via getPartnerById and cache the {id, name} here for display.
//   const [partnerValues, setPartnerValues] = useState<
//     Record<number, { id: number | string; name: string } | null>
//   >({})

//   // ── Fetch on mount ──
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [
//           empRes,
//           compRes,
//           locRes,
//           ccRes,
//           curRes,
//           iouRes,
//           coaRes,
//           companyCoaRes,
//           deptRes,
//           partnerRes,
//         ] = await Promise.all([
//           getEmployee(token),
//           getAllCompanies(token),
//           getAllLocations(token),
//           getAllCostCenters(token),
//           getAllCurrency(token),
//           getLoanData(token),
//           getAllChartOfAccounts(token),
//           getCompanyWiseChartOfAccounts(token),
//           getAllDepartments(token),
//           getResPartnersBySearch('', token),
//         ])
//         setEmployeeData(empRes.data ?? [])
//         setCompanyData(compRes.data ?? [])
//         setLocationData(locRes.data ?? [])
//         setCostCenterData(ccRes.data ?? [])
//         setCurrencyList(curRes.data ?? [])
//         setIouList(iouRes.data ?? [])
//         setChartOfAccounts(coaRes.data ?? [])
//         setCompanyChartOfAccount(companyCoaRes.data ?? [])
//         setDepartments(deptRes.data ?? [])
//         setPartners(partnerRes.data ?? [])
//       } catch (error) {
//         console.error('Failed to load form data:', error)
//         toast({ title: 'Error', description: 'Failed to load form data.', variant: 'destructive' })
//       } finally {
//         setIsDataLoading(false)
//       }
//     }
//     if (token) fetchData()
//   }, [token])

//   // ── Form ──
//   const form = useForm<IouAdjFormType>({
//     resolver: zodResolver(IouAdjFormSchema),
//     defaultValues: {
//       companyId: undefined,
//       locationId: undefined,
//       currency: 'BDT',
//       date: format(new Date(), 'yyyy-MM-dd'),
//       receiverEmployeeId: undefined,
//       iouId: undefined,
//       receiverName: '',
//       notes: '',
//       rows: [emptyRow()],
//     },
//   })

//   const { fields, append, remove } = useFieldArray({ control: form.control, name: 'rows' })

//   const selectedCompanyId = form.watch('companyId')

//   const filteredLocations = selectedCompanyId
//     ? locationData.filter((loc) => Number(loc.companyId) === Number(selectedCompanyId))
//     : locationData

//   // Only show IOUs that still have an outstanding balance — fully settled
//   // (amount - adjustedAmount <= 0) IOUs are hidden from the dropdown.
//   const filteredIouList = useMemo(
//     () =>
//       iouList.filter(
//         (iou) => (iou.amount ?? 0) - (iou.adjustedAmount ?? 0) > 0
//       ),
//     [iouList]
//   )

//   // ── Company-wise chart of accounts (same pattern as Cash Voucher) ──
//   const companyFilteredAccounts = useMemo(() => {
//     if (!selectedCompanyId || !companyChartOfAccount.length || !chartOfAccounts.length) {
//       return []
//     }
//     const ids = companyChartOfAccount
//       .filter((m) => m.companyId === selectedCompanyId)
//       .map((m) => m.chartOfAccountId)
//     return chartOfAccounts.filter((acc) => ids.includes(acc.accountId) && !acc.isGroup && acc.isActive)
//   }, [selectedCompanyId, companyChartOfAccount, chartOfAccounts])

//   // Departments ("Unit") — company-wise filtered
//   const filteredDepartments = useMemo(() => {
//     if (!selectedCompanyId) return []
//     return departments.filter(
//       (d) => d.isActive && d.companyCode === selectedCompanyId
//     )
//   }, [departments, selectedCompanyId])

//   const isCompanySelected = !!selectedCompanyId

//   // ── Partner search (always enabled, same as Cash Voucher pattern) ──
//   const searchPartners = useCallback(
//     async (query: string): Promise<ComboboxItem[]> => {
//       try {
//         const response = await getResPartnersBySearch(query, token)
//         if (response.error || !response.data) return []
//         return response.data.map((partner) => ({
//           id: partner.id.toString(),
//           name: partner.name || 'Unnamed Partner',
//         }))
//       } catch {
//         return []
//       }
//     },
//     [token]
//   )

//   // ── Resolve display name for each row's selected partner ──
//   // Mirrors CashVoucherDetails: watch each row's resPartnerId, try local `partners`
//   // list first, and only hit the API if it's not found there.
//   const watchedRows = form.watch('rows')

//   useEffect(() => {
//     const loadPartners = async () => {
//       const updates: Record<number, { id: number | string; name: string } | null> = {}

//       for (let index = 0; index < watchedRows.length; index++) {
//         const partnerId = watchedRows[index]?.resPartnerId
//         if (!partnerId) {
//           updates[index] = null
//           continue
//         }
//         const local = partners.find((p) => p.id === Number(partnerId))
//         if (local) {
//           updates[index] = { id: local.id, name: local.name || '' }
//           continue
//         }
//         // Not in the locally loaded list — resolve once via API
//         const fetched = await getPartnerById(Number(partnerId), token)
//         updates[index] = fetched?.data
//           ? { id: fetched.data.id, name: fetched.data.name || '' }
//           : null
//       }

//       setPartnerValues(updates)
//     }

//     loadPartners()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [JSON.stringify(watchedRows?.map((r) => r.resPartnerId)), partners, token])

//   const addRow = () => append(emptyRow())

//   // ── Submit ──
//   const onSubmit = async (data: IouAdjFormType) => {
//     const createdBy = userData?.userId
//     if (!createdBy) {
//       toast({ title: 'Error', description: 'User not found.', variant: 'destructive' })
//       return
//     }

//     setIsSubmitting(true)
//     try {
//       // Each row becomes one adjustment; backend creates the linked journal entry.
//       const payload = {
//         iouId: data.iouId,
//         companyId: data.companyId,
//         locationId: data.locationId,
//         currencyId: 1, // TODO: map data.currency (code) -> currencyId once currency API returns ids here
//         exchangeRate: 1,
//         adjustmentDate: data.date,
//         notes: data.notes,
//         createdBy,
//         rows: data.rows.map((row) => ({
//           accountId: row.accountId,
//           costCenterId: row.costCenterId,
//           departmentId: row.departmentId,
//           employeeId: row.employeeId,
//           resPartnerId: row.resPartnerId ?? null,
//           remarks: row.remarks,
//           amountAdjusted: row.amount,
//           adjustmentType: 'adjustment',
//         })),
//       }

//       // TODO: await createIouAdjustment(payload, token)
//       console.log('IOU Adjustment payload:', payload)

//       toast({ title: 'Success', description: 'IOU Adjustment submitted successfully!' })
//       form.reset({
//         companyId: data.companyId,
//         locationId: data.locationId,
//         currency: data.currency,
//         date: data.date,
//         receiverEmployeeId: undefined,
//         iouId: undefined,
//         receiverName: '',
//         notes: '',
//         rows: [emptyRow()],
//       })
//       setPartnerValues({})
//     } catch (error) {
//       console.error('Failed to submit IOU adjustment:', error)
//       toast({ title: 'Error', description: 'Failed to submit IOU adjustment.', variant: 'destructive' })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   if (isDataLoading) return <Loader />

//   // ─────────────────────────────────────────────────────────────────────────────

//   return (
//     <div className="p-4">
//       <div className="border rounded-lg p-6 bg-slate-50 shadow-sm">
//         <h2 className="text-lg font-semibold mb-4">IOU Adjustment</h2>

//         {!isCompanySelected && (
//           <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
//             ⚠️ Please select a company first to see available accounts and units.
//           </div>
//         )}

//         <Form {...form}>
//           <form className="space-y-4">

//             {/* ══ Master Row: Company | Location | Currency | Date ══ */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

//               {/* Company */}
//               <FormField
//                 control={form.control}
//                 name="companyId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Company Name</FormLabel>
//                     <CustomCombobox
//                       items={companyData.map((c) => ({
//                         id: c.companyId?.toString() ?? '',
//                         name: c.companyName,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: companyData.find((c) => Number(c.companyId) === field.value)?.companyName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => {
//                         field.onChange(val ? Number(val.id) : null)
//                         // reset dependent selections when company is changed manually
//                         form.setValue('locationId', undefined as unknown as number)
//                         form.setValue('iouId', undefined as unknown as number)
//                         form.setValue('receiverName', '')
//                         const currentRows = form.getValues('rows') || []
//                         currentRows.forEach((_, idx) => {
//                           form.setValue(`rows.${idx}.accountId`, undefined as unknown as number)
//                           form.setValue(`rows.${idx}.departmentId`, undefined as unknown as number)
//                         })
//                       }}
//                       placeholder="Select a company"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Location */}
//               <FormField
//                 control={form.control}
//                 name="locationId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Location</FormLabel>
//                     <CustomCombobox
//                       items={filteredLocations.map((loc) => ({
//                         id: loc.locationId.toString(),
//                         name: loc.branchName,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: filteredLocations.find((loc) => Number(loc.locationId) === field.value)?.branchName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => field.onChange(val ? Number(val.id) : null)}
//                       placeholder={filteredLocations.length > 0 ? 'Select a location' : 'No locations'}
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Currency */}
//               <FormField
//                 control={form.control}
//                 name="currency"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Currency</FormLabel>
//                     <CustomCombobox
//                       items={
//                         currencyList.length > 0
//                           ? currencyList.map((c) => ({ id: c.currencyCode, name: c.currencyCode }))
//                           : ['BDT', 'USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD'].map((c) => ({ id: c, name: c }))
//                       }
//                       value={field.value ? { id: field.value, name: field.value } : null}
//                       onChange={(val) => field.onChange(val ? val.id : '')}
//                       placeholder="Select currency"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Date */}
//               <FormField
//                 control={form.control}
//                 name="date"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Date</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         type="date"
//                         value={field.value ?? ''}
//                         onChange={(e) => field.onChange(e.target.value)}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* ══ Receiver Name Row: [Employee dropdown] [Name text] [IOU List] ══ */}
//             {/* Order matches Cash Voucher's payTo field: combobox first, manual text second */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

//               {/* Employee dropdown — selecting fills the name */}
//               <FormField
//                 control={form.control}
//                 name="receiverEmployeeId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Receiver Name</FormLabel>
//                     <CustomCombobox
//                       items={employeeData.map((emp) => ({
//                         id: emp.id.toString(),
//                         name: `${emp.employeeName} (${emp.employeeId})`,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: employeeData.find((emp) => emp.id === field.value)?.employeeName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => {
//                         field.onChange(val ? Number(val.id) : null)
//                         if (val) {
//                           const emp = employeeData.find((e) => e.id === Number(val.id))
//                           if (emp) form.setValue('receiverName', emp.employeeName)
//                         } else {
//                           form.setValue('receiverName', '')
//                         }
//                       }}
//                       placeholder="Select employee"
//                       disabled={!!form.watch('receiverName')?.trim() && !form.watch('receiverEmployeeId')}
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Receiver Name — free text */}
//               <FormField
//                 control={form.control}
//                 name="receiverName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>&nbsp;</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         placeholder="Enter receiver name"
//                         onChange={(e) => {
//                           field.onChange(e.target.value)
//                           // Manual typing overrides the dropdown-selected employee
//                           if (e.target.value) {
//                             form.setValue('receiverEmployeeId', undefined)
//                           }
//                         }}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* IOU List dropdown — shows outstanding balance once selected */}
//               <FormField
//                 control={form.control}
//                 name="iouId"
//                 render={({ field }) => {
//                   const selectedIou = filteredIouList.find(
//                     (iou) => iou.iouId === field.value
//                   )
//                   const outstandingBalance = selectedIou
//                     ? (selectedIou.amount ?? 0) - (selectedIou.adjustedAmount ?? 0)
//                     : null

//                   return (
//                     <FormItem>
//                       <FormLabel>IOU List</FormLabel>
//                       <div className="flex flex-col">
//                         <CustomCombobox
//                           items={filteredIouList.map((iou) => ({
//                             id: iou.iouId.toString(),
//                             name: `IOU-${iou.iouId}`,
//                           }))}
//                           value={
//                             field.value
//                               ? { id: field.value.toString(), name: `IOU-${field.value}` }
//                               : null
//                           }
//                           onChange={(val) => {
//                             const newIouId = val ? Number(val.id) : null
//                             field.onChange(newIouId)

//                             if (!newIouId) return

//                             const selected = filteredIouList.find(
//                               (iou) => iou.iouId === newIouId
//                             )
//                             if (!selected) return

//                             // Auto-fill Company, Location, and Receiver — date stays independent
//                             if (selected.companyId) {
//                               form.setValue('companyId', Number(selected.companyId))
//                             }
//                             if (selected.locationId) {
//                               form.setValue('locationId', Number(selected.locationId))
//                             }
//                             if (selected.employeeId) {
//                               form.setValue('receiverEmployeeId', Number(selected.employeeId))
//                               const emp = employeeData.find(
//                                 (e) => e.id === Number(selected.employeeId)
//                               )
//                               if (emp) form.setValue('receiverName', emp.employeeName)
//                             }
//                           }}
//                           placeholder="Select IOU"
//                         />
//                         {/* Balance row — same pattern as Cash Voucher account balance */}
//                         <div className="min-h-[18px] px-1 mt-0.5">
//                           {outstandingBalance !== null && (
//                             <p className="flex items-center gap-1">
//                               <span className="text-[10px] text-black font-bold">
//                                 Adjustment Amount:
//                               </span>
//                               <span
//                                 className={`text-[11px] font-semibold tabular-nums ${
//                                   outstandingBalance > 0
//                                     ? 'text-emerald-600'
//                                     : 'text-slate-400'
//                                 }`}
//                               >
//                                 {outstandingBalance.toLocaleString('en-US', {
//                                   minimumFractionDigits: 2,
//                                   maximumFractionDigits: 2,
//                                 })}
//                               </span>
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                       <FormMessage />
//                     </FormItem>
//                   )
//                 }}
//               />
//             </div>

//             {/* ══ Notes ══ */}
//             <FormField
//               control={form.control}
//               name="notes"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Notes</FormLabel>
//                   <FormControl>
//                     <Textarea
//                       {...field}
//                       placeholder="Enter notes (optional)"
//                       className="min-h-[80px] resize-y"
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* ══ Details Table ══ */}
//             <div className="border rounded-md">
//               {/* Table header */}
//               <div className="bg-slate-100 grid grid-cols-[2fr_1.5fr_1.5fr_2fr_2fr_1.5fr_1.5fr_40px] text-xs font-semibold text-muted-foreground border-b rounded-t-md overflow-hidden">
//                 <div className="px-3 py-2 border-r">Account Name</div>
//                 <div className="px-3 py-2 border-r">Cost Center</div>
//                 <div className="px-3 py-2 border-r">Unit</div>
//                 <div className="px-3 py-2 border-r">Employee</div>
//                 <div className="px-3 py-2 border-r">Partner Name</div>
//                 <div className="px-3 py-2 border-r">Remarks</div>
//                 <div className="px-3 py-2 border-r">Amount</div>
//                 <div className="px-3 py-2" />
//               </div>

//               {/* Rows */}
//               <div className="divide-y">
//                 {fields.map((field, index) => (
//                   <div
//                     key={field.id}
//                     className="grid grid-cols-[2fr_1.5fr_1.5fr_2fr_2fr_1.5fr_1.5fr_40px] bg-white items-start"
//                   >
//                     {/* Account Name — company-wise filtered */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.accountId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={companyFilteredAccounts.map((account) => ({
//                               id: account.accountId.toString(),
//                               name: account.name || 'Unnamed Account',
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name:
//                                       companyFilteredAccounts.find(
//                                         (a) => a.accountId === f.value
//                                       )?.name || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder={
//                               !isCompanySelected
//                                 ? 'Select company first'
//                                 : companyFilteredAccounts.length === 0
//                                   ? 'No accounts'
//                                   : 'Select an account'
//                             }
//                             disabled={!isCompanySelected || companyFilteredAccounts.length === 0}
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Cost Center */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.costCenterId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={costCenterData
//                               .filter((cc) => cc.isActive)
//                               .map((cc) => ({
//                                 id: cc.costCenterId.toString(),
//                                 name: cc.costCenterName,
//                               }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name: costCenterData.find((cc) => cc.costCenterId === f.value)?.costCenterName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder="Select a cost center"
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Unit (Department) — company-wise filtered */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.departmentId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={filteredDepartments.map((dept) => ({
//                               id: dept.departmentID.toString(),
//                               name: dept.departmentName || 'Unnamed Department',
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name:
//                                       filteredDepartments.find(
//                                         (d) => d.departmentID === f.value
//                                       )?.departmentName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder={
//                               !isCompanySelected
//                                 ? 'Select company first'
//                                 : filteredDepartments.length === 0
//                                   ? 'No units'
//                                   : 'Select a unit'
//                             }
//                             disabled={!isCompanySelected || filteredDepartments.length === 0}
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Employee */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.employeeId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={employeeData.map((emp) => ({
//                               id: emp.id.toString(),
//                               name: `${emp.employeeName} (${emp.employeeId})`,
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name: employeeData.find((emp) => emp.id === f.value)?.employeeName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder="Select an employee"
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Partner — always enabled, search-as-you-type (mirrors CashVoucherDetails) */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.resPartnerId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomComboboxWithApi
//                             items={partners.map((partner) => ({
//                               id: partner.id.toString(),
//                               name: partner.name || '',
//                             }))}
//                             value={
//                               f.value
//                                 ? (partners.find((p) => p.id === Number(f.value)) ?? {
//                                     id: f.value,
//                                     name: partnerValues[index]?.name || '',
//                                   })
//                                 : null
//                             }
//                             onChange={(item) => f.onChange(item ? Number(item.id) : null)}
//                             placeholder="Select partner"
//                             searchFunction={searchPartners}
//                             fetchByIdFunction={async (id) => {
//                               const numericId =
//                                 typeof id === 'string' && /^\d+$/.test(id) ? parseInt(id, 10) : (id as number)
//                               const partner = await getPartnerById(numericId, token)
//                               return partner?.data
//                                 ? { id: partner.data.id.toString(), name: partner.data.name ?? '' }
//                                 : null
//                             }}
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Remarks */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.remarks`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               placeholder="Enter remarks"
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Amount */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.amount`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               type="number"
//                               step="0.01"
//                               min="0"
//                               placeholder="Amount"
//                               value={
//                                 f.value === undefined || (f.value as unknown) === 0
//                                   ? ''
//                                   : f.value
//                               }
//                               onChange={(e) => {
//                                 const raw = e.target.value
//                                 f.onChange(raw === '' ? undefined : parseFloat(raw))
//                               }}
//                               onWheel={(e) => (e.target as HTMLInputElement).blur()}
//                               onKeyDown={(e) => {
//                                 if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault()
//                               }}
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Delete */}
//                     <div className="flex items-center justify-center h-10">
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="icon"
//                         className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
//                         onClick={() => fields.length > 1 && remove(index)}
//                         disabled={fields.length === 1}
//                       >
//                         <Trash2 className="h-3.5 w-3.5" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Add Another */}
//               <button
//                 type="button"
//                 onClick={addRow}
//                 className="w-full py-2 border-t text-sm text-muted-foreground hover:bg-slate-50 hover:text-foreground flex items-center justify-center gap-2 transition-colors rounded-b-md"
//                 disabled={!isCompanySelected}
//               >
//                 <Plus className="h-4 w-4" />
//                 Add Another
//               </button>
//             </div>

//             {/* ══ Action Buttons ══ */}
//             <div className="flex justify-end space-x-3 pt-2 border-t">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() =>
//                   form.reset({
//                     companyId: form.getValues('companyId'),
//                     locationId: form.getValues('locationId'),
//                     currency: form.getValues('currency'),
//                     date: form.getValues('date'),
//                     iouId: undefined,
//                     receiverName: '',
//                     notes: '',
//                     rows: [emptyRow()],
//                   })
//                 }
//               >
//                 Reset
//               </Button>

//               <Button
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={() => form.handleSubmit(onSubmit)()}
//               >
//                 {isSubmitting ? 'Submitting...' : 'Submit Adjustment'}
//               </Button>
//             </div>

//           </form>
//         </Form>
//       </div>
//     </div>
//   )
// }

// export default IouAdjustmentForm


// 'use client'

// import type React from 'react'
// import { useState, useEffect, useCallback, useMemo } from 'react'
// import { useForm, useFieldArray } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { format } from 'date-fns'
// import { Plus, Trash2 } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import {
//   type ComboboxItem,
//   CustomComboboxWithApi,
// } from '@/utils/custom-combobox-with-api'
// import { toast } from '@/hooks/use-toast'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import type {
//   Employee,
//   LocationData,
//   CostCenter,
//   IouRecordGetType,
//   AccountsHead,
//   CompanyChartOfAccount,
//   GetDepartment,
//   ResPartner,
// } from '@/utils/type'
// import type { CompanyType } from '@/api/company-api'
// import {
//   getEmployee,
//   getAllCompanies,
//   getAllLocations,
//   getAllCostCenters,
//   getAllCurrency,
//   getAllChartOfAccounts,
//   getAllDepartments,
//   getResPartnersBySearch,
//   getPartnerById,
// } from '@/api/common-shared-api'
// import { getCompanyWiseChartOfAccounts } from '@/api/chart-of-accounts-api'
// import { getLoanData } from '@/api/iou-api'
// import Loader from '@/utils/loader'

// // ─── Zod Schema ───────────────────────────────────────────────────────────────

// const AdjRowSchema = z.object({
//   accountId: z
//     .number({ invalid_type_error: 'Account is required' })
//     .int()
//     .positive('Account is required'),
//   costCenterId: z
//     .number({ invalid_type_error: 'Cost center is required' })
//     .int()
//     .positive('Cost center is required'),
//   departmentId: z
//     .number({ invalid_type_error: 'Unit is required' })
//     .int()
//     .positive('Unit is required'),
//   employeeId: z
//     .number({ invalid_type_error: 'Employee is required' })
//     .int()
//     .positive('Employee is required'),
//   resPartnerId: z.number().int().positive().nullable().optional(),
//   remarks: z.string().optional(),
//   amount: z
//     .number({ invalid_type_error: 'Amount is required' })
//     .positive('Must be greater than 0'),
// })

// const IouAdjFormSchema = z.object({
//   companyId: z
//     .number({ invalid_type_error: 'Company is required' })
//     .int()
//     .positive('Company is required'),
//   locationId: z
//     .number({ invalid_type_error: 'Location is required' })
//     .int()
//     .positive('Location is required'),
//   currency: z.string().min(1, 'Currency is required'),
//   date: z.string().min(1, 'Date is required'),
//   // Receiver employee (optional — selecting auto-fills receiverName)
//   receiverEmployeeId: z.number().int().positive().optional(),
//   // IOU List selection
//   iouId: z
//     .number({ invalid_type_error: 'IOU is required' })
//     .int()
//     .positive('IOU is required'),
//   receiverName: z.string().min(1, 'Receiver name is required'),
//   notes: z.string().optional(),
//   rows: z.array(AdjRowSchema).min(1),
// })

// type IouAdjFormType = z.infer<typeof IouAdjFormSchema>

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const emptyRow = () => ({
//   accountId: undefined as unknown as number,
//   costCenterId: undefined as unknown as number,
//   departmentId: undefined as unknown as number,
//   employeeId: undefined as unknown as number,
//   resPartnerId: null,
//   remarks: '',
//   amount: undefined as unknown as number,
// })

// // ─── Component ────────────────────────────────────────────────────────────────

// const IouAdjustmentForm: React.FC = () => {
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)
//   const [userData] = useAtom(userDataAtom)

//   // ── Data state ──
//   const [employeeData, setEmployeeData] = useState<Employee[]>([])
//   const [companyData, setCompanyData] = useState<CompanyType[]>([])
//   const [locationData, setLocationData] = useState<LocationData[]>([])
//   const [costCenterData, setCostCenterData] = useState<CostCenter[]>([])
//   const [currencyList, setCurrencyList] = useState<{ currencyCode: string }[]>([])
//   const [iouList, setIouList] = useState<IouRecordGetType[]>([])
//   const [chartOfAccounts, setChartOfAccounts] = useState<AccountsHead[]>([])
//   const [companyChartOfAccount, setCompanyChartOfAccount] = useState<
//     CompanyChartOfAccount[]
//   >([])
//   const [departments, setDepartments] = useState<GetDepartment[]>([])
//   const [partners, setPartners] = useState<ResPartner[]>([])
//   const [isDataLoading, setIsDataLoading] = useState(true)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   // ── Per-row partner display values (mirrors CashVoucherDetails' partnerValue pattern) ──
//   // Keyed by row index. Needed because a previously-saved resPartnerId may not be in the
//   // initially-loaded `partners` list (e.g. it was found via search), so we resolve it once
//   // via getPartnerById and cache the {id, name} here for display.
//   const [partnerValues, setPartnerValues] = useState<
//     Record<number, { id: number | string; name: string } | null>
//   >({})

//   // ── Fetch on mount ──
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [
//           empRes,
//           compRes,
//           locRes,
//           ccRes,
//           curRes,
//           iouRes,
//           coaRes,
//           companyCoaRes,
//           deptRes,
//           partnerRes,
//         ] = await Promise.all([
//           getEmployee(token),
//           getAllCompanies(token),
//           getAllLocations(token),
//           getAllCostCenters(token),
//           getAllCurrency(token),
//           getLoanData(token),
//           getAllChartOfAccounts(token),
//           getCompanyWiseChartOfAccounts(token),
//           getAllDepartments(token),
//           getResPartnersBySearch('', token),
//         ])
//         setEmployeeData(empRes.data ?? [])
//         setCompanyData(compRes.data ?? [])
//         setLocationData(locRes.data ?? [])
//         setCostCenterData(ccRes.data ?? [])
//         setCurrencyList(curRes.data ?? [])
//         setIouList(iouRes.data ?? [])
//         setChartOfAccounts(coaRes.data ?? [])
//         setCompanyChartOfAccount(companyCoaRes.data ?? [])
//         setDepartments(deptRes.data ?? [])
//         setPartners(partnerRes.data ?? [])
//       } catch (error) {
//         console.error('Failed to load form data:', error)
//         toast({ title: 'Error', description: 'Failed to load form data.', variant: 'destructive' })
//       } finally {
//         setIsDataLoading(false)
//       }
//     }
//     if (token) fetchData()
//   }, [token])

//   // ── Form ──
//   const form = useForm<IouAdjFormType>({
//     resolver: zodResolver(IouAdjFormSchema),
//     defaultValues: {
//       companyId: undefined,
//       locationId: undefined,
//       currency: 'BDT',
//       date: format(new Date(), 'yyyy-MM-dd'),
//       receiverEmployeeId: undefined,
//       iouId: undefined,
//       receiverName: '',
//       notes: '',
//       rows: [emptyRow()],
//     },
//   })

//   const { fields, append, remove } = useFieldArray({ control: form.control, name: 'rows' })

//   const selectedCompanyId = form.watch('companyId')

//   // Reset location when company changes
//   useEffect(() => {
//     form.setValue('locationId', undefined as unknown as number)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedCompanyId])

//   const filteredLocations = selectedCompanyId
//     ? locationData.filter((loc) => Number(loc.companyId) === Number(selectedCompanyId))
//     : locationData

//   // Only show IOUs that still have an outstanding balance — fully settled
//   // (amount - adjustedAmount <= 0) IOUs are hidden from the dropdown.
//   const filteredIouList = useMemo(
//     () =>
//       iouList.filter(
//         (iou) => (iou.amount ?? 0) - (iou.adjustedAmount ?? 0) > 0
//       ),
//     [iouList]
//   )

//   // ── Company-wise chart of accounts (same pattern as Cash Voucher) ──
//   const companyFilteredAccounts = useMemo(() => {
//     if (!selectedCompanyId || !companyChartOfAccount.length || !chartOfAccounts.length) {
//       return []
//     }
//     const ids = companyChartOfAccount
//       .filter((m) => m.companyId === selectedCompanyId)
//       .map((m) => m.chartOfAccountId)
//     return chartOfAccounts.filter((acc) => ids.includes(acc.accountId) && !acc.isGroup && acc.isActive)
//   }, [selectedCompanyId, companyChartOfAccount, chartOfAccounts])

//   // Departments ("Unit") — company-wise filtered
//   const filteredDepartments = useMemo(() => {
//     if (!selectedCompanyId) return []
//     return departments.filter(
//       (d) => d.isActive && d.companyCode === selectedCompanyId
//     )
//   }, [departments, selectedCompanyId])

//   const isCompanySelected = !!selectedCompanyId

//   // ── Partner search (always enabled, same as Cash Voucher pattern) ──
//   const searchPartners = useCallback(
//     async (query: string): Promise<ComboboxItem[]> => {
//       try {
//         const response = await getResPartnersBySearch(query, token)
//         if (response.error || !response.data) return []
//         return response.data.map((partner) => ({
//           id: partner.id.toString(),
//           name: partner.name || 'Unnamed Partner',
//         }))
//       } catch {
//         return []
//       }
//     },
//     [token]
//   )

//   // ── Resolve display name for each row's selected partner ──
//   // Mirrors CashVoucherDetails: watch each row's resPartnerId, try local `partners`
//   // list first, and only hit the API if it's not found there.
//   const watchedRows = form.watch('rows')

//   useEffect(() => {
//     const loadPartners = async () => {
//       const updates: Record<number, { id: number | string; name: string } | null> = {}

//       for (let index = 0; index < watchedRows.length; index++) {
//         const partnerId = watchedRows[index]?.resPartnerId
//         if (!partnerId) {
//           updates[index] = null
//           continue
//         }
//         const local = partners.find((p) => p.id === Number(partnerId))
//         if (local) {
//           updates[index] = { id: local.id, name: local.name || '' }
//           continue
//         }
//         // Not in the locally loaded list — resolve once via API
//         const fetched = await getPartnerById(Number(partnerId), token)
//         updates[index] = fetched?.data
//           ? { id: fetched.data.id, name: fetched.data.name || '' }
//           : null
//       }

//       setPartnerValues(updates)
//     }

//     loadPartners()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [JSON.stringify(watchedRows?.map((r) => r.resPartnerId)), partners, token])

//   const addRow = () => append(emptyRow())

//   // ── Submit ──
//   const onSubmit = async (data: IouAdjFormType) => {
//     const createdBy = userData?.userId
//     if (!createdBy) {
//       toast({ title: 'Error', description: 'User not found.', variant: 'destructive' })
//       return
//     }

//     setIsSubmitting(true)
//     try {
//       // Each row becomes one adjustment; backend creates the linked journal entry.
//       const payload = {
//         iouId: data.iouId,
//         companyId: data.companyId,
//         locationId: data.locationId,
//         currencyId: 1, // TODO: map data.currency (code) -> currencyId once currency API returns ids here
//         exchangeRate: 1,
//         adjustmentDate: data.date,
//         notes: data.notes,
//         createdBy,
//         rows: data.rows.map((row) => ({
//           accountId: row.accountId,
//           costCenterId: row.costCenterId,
//           departmentId: row.departmentId,
//           employeeId: row.employeeId,
//           resPartnerId: row.resPartnerId ?? null,
//           remarks: row.remarks,
//           amountAdjusted: row.amount,
//           adjustmentType: 'adjustment',
//         })),
//       }

//       // TODO: await createIouAdjustment(payload, token)
//       console.log('IOU Adjustment payload:', payload)

//       toast({ title: 'Success', description: 'IOU Adjustment submitted successfully!' })
//       form.reset({
//         companyId: data.companyId,
//         locationId: data.locationId,
//         currency: data.currency,
//         date: data.date,
//         receiverEmployeeId: undefined,
//         iouId: undefined,
//         receiverName: '',
//         notes: '',
//         rows: [emptyRow()],
//       })
//       setPartnerValues({})
//     } catch (error) {
//       console.error('Failed to submit IOU adjustment:', error)
//       toast({ title: 'Error', description: 'Failed to submit IOU adjustment.', variant: 'destructive' })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   if (isDataLoading) return <Loader />

//   // ─────────────────────────────────────────────────────────────────────────────

//   return (
//     <div className="p-4">
//       <div className="border rounded-lg p-6 bg-slate-50 shadow-sm">
//         <h2 className="text-lg font-semibold mb-4">IOU Adjustment</h2>

//         {!isCompanySelected && (
//           <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
//             ⚠️ Please select a company first to see available accounts and units.
//           </div>
//         )}

//         <Form {...form}>
//           <form className="space-y-4">

//             {/* ══ Master Row: Company | Location | Currency | Date ══ */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

//               {/* Company */}
//               <FormField
//                 control={form.control}
//                 name="companyId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Company Name</FormLabel>
//                     <CustomCombobox
//                       items={companyData.map((c) => ({
//                         id: c.companyId?.toString() ?? '',
//                         name: c.companyName,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: companyData.find((c) => Number(c.companyId) === field.value)?.companyName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => {
//                         field.onChange(val ? Number(val.id) : null)
//                         // reset dependent selections when company changes
//                         form.setValue('iouId', undefined as unknown as number)
//                         form.setValue('receiverName', '')
//                         const currentRows = form.getValues('rows') || []
//                         currentRows.forEach((_, idx) => {
//                           form.setValue(`rows.${idx}.accountId`, undefined as unknown as number)
//                           form.setValue(`rows.${idx}.departmentId`, undefined as unknown as number)
//                         })
//                       }}
//                       placeholder="Select a company"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Location */}
//               <FormField
//                 control={form.control}
//                 name="locationId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Location</FormLabel>
//                     <CustomCombobox
//                       items={filteredLocations.map((loc) => ({
//                         id: loc.locationId.toString(),
//                         name: loc.branchName,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: filteredLocations.find((loc) => Number(loc.locationId) === field.value)?.branchName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => field.onChange(val ? Number(val.id) : null)}
//                       placeholder={filteredLocations.length > 0 ? 'Select a location' : 'No locations'}
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Currency */}
//               <FormField
//                 control={form.control}
//                 name="currency"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Currency</FormLabel>
//                     <CustomCombobox
//                       items={
//                         currencyList.length > 0
//                           ? currencyList.map((c) => ({ id: c.currencyCode, name: c.currencyCode }))
//                           : ['BDT', 'USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD'].map((c) => ({ id: c, name: c }))
//                       }
//                       value={field.value ? { id: field.value, name: field.value } : null}
//                       onChange={(val) => field.onChange(val ? val.id : '')}
//                       placeholder="Select currency"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Date */}
//               <FormField
//                 control={form.control}
//                 name="date"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Date</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         type="date"
//                         value={field.value ?? ''}
//                         onChange={(e) => field.onChange(e.target.value)}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* ══ Receiver Name Row: [Employee dropdown] [Name text] [IOU List] ══ */}
//             {/* Order matches Cash Voucher's payTo field: combobox first, manual text second */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

//               {/* Employee dropdown — selecting fills the name */}
//               <FormField
//                 control={form.control}
//                 name="receiverEmployeeId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Receiver Name</FormLabel>
//                     <CustomCombobox
//                       items={employeeData.map((emp) => ({
//                         id: emp.id.toString(),
//                         name: `${emp.employeeName} (${emp.employeeId})`,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: employeeData.find((emp) => emp.id === field.value)?.employeeName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => {
//                         field.onChange(val ? Number(val.id) : null)
//                         if (val) {
//                           const emp = employeeData.find((e) => e.id === Number(val.id))
//                           if (emp) form.setValue('receiverName', emp.employeeName)
//                         } else {
//                           form.setValue('receiverName', '')
//                         }
//                       }}
//                       placeholder="Select employee"
//                       disabled={!!form.watch('receiverName')?.trim() && !form.watch('receiverEmployeeId')}
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Receiver Name — free text */}
//               <FormField
//                 control={form.control}
//                 name="receiverName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>&nbsp;</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         placeholder="Enter receiver name"
//                         onChange={(e) => {
//                           field.onChange(e.target.value)
//                           // Manual typing overrides the dropdown-selected employee
//                           if (e.target.value) {
//                             form.setValue('receiverEmployeeId', undefined)
//                           }
//                         }}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* IOU List dropdown — shows outstanding balance once selected */}
//               <FormField
//                 control={form.control}
//                 name="iouId"
//                 render={({ field }) => {
//                   const selectedIou = filteredIouList.find(
//                     (iou) => iou.iouId === field.value
//                   )
//                   const outstandingBalance = selectedIou
//                     ? (selectedIou.amount ?? 0) - (selectedIou.adjustedAmount ?? 0)
//                     : null

//                   return (
//                     <FormItem>
//                       <FormLabel>IOU List</FormLabel>
//                       <div className="flex flex-col">
//                         <CustomCombobox
//                           items={filteredIouList.map((iou) => ({
//                             id: iou.iouId.toString(),
//                             name: `IOU-${iou.iouId}`,
//                           }))}
//                           value={
//                             field.value
//                               ? { id: field.value.toString(), name: `IOU-${field.value}` }
//                               : null
//                           }
//                           onChange={(val) => field.onChange(val ? Number(val.id) : null)}
//                           placeholder="Select IOU"
//                         />
//                         {/* Balance row — same pattern as Cash Voucher account balance */}
//                         <div className="min-h-[18px] px-1 mt-0.5">
//                           {outstandingBalance !== null && (
//                             <p className="flex items-center gap-1">
//                               <span className="text-[10px] text-black font-bold">
//                                 Adjustment Amount:
//                               </span>
//                               <span
//                                 className={`text-[11px] font-semibold tabular-nums ${
//                                   outstandingBalance > 0
//                                     ? 'text-emerald-600'
//                                     : 'text-slate-400'
//                                 }`}
//                               >
//                                 {outstandingBalance.toLocaleString('en-US', {
//                                   minimumFractionDigits: 2,
//                                   maximumFractionDigits: 2,
//                                 })}
//                               </span>
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                       <FormMessage />
//                     </FormItem>
//                   )
//                 }}
//               />
//             </div>

//             {/* ══ Notes ══ */}
//             <FormField
//               control={form.control}
//               name="notes"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Notes</FormLabel>
//                   <FormControl>
//                     <Textarea
//                       {...field}
//                       placeholder="Enter notes (optional)"
//                       className="min-h-[80px] resize-y"
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* ══ Details Table ══ */}
//             <div className="border rounded-md">
//               {/* Table header */}
//               <div className="bg-slate-100 grid grid-cols-[2fr_1.5fr_1.5fr_2fr_2fr_1.5fr_1.5fr_40px] text-xs font-semibold text-muted-foreground border-b rounded-t-md overflow-hidden">
//                 <div className="px-3 py-2 border-r">Account Name</div>
//                 <div className="px-3 py-2 border-r">Cost Center</div>
//                 <div className="px-3 py-2 border-r">Unit</div>
//                 <div className="px-3 py-2 border-r">Employee</div>
//                 <div className="px-3 py-2 border-r">Partner Name</div>
//                 <div className="px-3 py-2 border-r">Remarks</div>
//                 <div className="px-3 py-2 border-r">Amount</div>
//                 <div className="px-3 py-2" />
//               </div>

//               {/* Rows */}
//               <div className="divide-y">
//                 {fields.map((field, index) => (
//                   <div
//                     key={field.id}
//                     className="grid grid-cols-[2fr_1.5fr_1.5fr_2fr_2fr_1.5fr_1.5fr_40px] bg-white items-start"
//                   >
//                     {/* Account Name — company-wise filtered */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.accountId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={companyFilteredAccounts.map((account) => ({
//                               id: account.accountId.toString(),
//                               name: account.name || 'Unnamed Account',
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name:
//                                       companyFilteredAccounts.find(
//                                         (a) => a.accountId === f.value
//                                       )?.name || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder={
//                               !isCompanySelected
//                                 ? 'Select company first'
//                                 : companyFilteredAccounts.length === 0
//                                   ? 'No accounts'
//                                   : 'Select an account'
//                             }
//                             disabled={!isCompanySelected || companyFilteredAccounts.length === 0}
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Cost Center */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.costCenterId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={costCenterData
//                               .filter((cc) => cc.isActive)
//                               .map((cc) => ({
//                                 id: cc.costCenterId.toString(),
//                                 name: cc.costCenterName,
//                               }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name: costCenterData.find((cc) => cc.costCenterId === f.value)?.costCenterName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder="Select a cost center"
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Unit (Department) — company-wise filtered */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.departmentId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={filteredDepartments.map((dept) => ({
//                               id: dept.departmentID.toString(),
//                               name: dept.departmentName || 'Unnamed Department',
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name:
//                                       filteredDepartments.find(
//                                         (d) => d.departmentID === f.value
//                                       )?.departmentName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder={
//                               !isCompanySelected
//                                 ? 'Select company first'
//                                 : filteredDepartments.length === 0
//                                   ? 'No units'
//                                   : 'Select a unit'
//                             }
//                             disabled={!isCompanySelected || filteredDepartments.length === 0}
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Employee */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.employeeId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={employeeData.map((emp) => ({
//                               id: emp.id.toString(),
//                               name: `${emp.employeeName} (${emp.employeeId})`,
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name: employeeData.find((emp) => emp.id === f.value)?.employeeName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder="Select an employee"
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Partner — always enabled, search-as-you-type (mirrors CashVoucherDetails) */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.resPartnerId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomComboboxWithApi
//                             items={partners.map((partner) => ({
//                               id: partner.id.toString(),
//                               name: partner.name || '',
//                             }))}
//                             value={
//                               f.value
//                                 ? (partners.find((p) => p.id === Number(f.value)) ?? {
//                                     id: f.value,
//                                     name: partnerValues[index]?.name || '',
//                                   })
//                                 : null
//                             }
//                             onChange={(item) => f.onChange(item ? Number(item.id) : null)}
//                             placeholder="Select partner"
//                             searchFunction={searchPartners}
//                             fetchByIdFunction={async (id) => {
//                               const numericId =
//                                 typeof id === 'string' && /^\d+$/.test(id) ? parseInt(id, 10) : (id as number)
//                               const partner = await getPartnerById(numericId, token)
//                               return partner?.data
//                                 ? { id: partner.data.id.toString(), name: partner.data.name ?? '' }
//                                 : null
//                             }}
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Remarks */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.remarks`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               placeholder="Enter remarks"
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Amount */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.amount`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               type="number"
//                               step="0.01"
//                               min="0"
//                               placeholder="Amount"
//                               value={
//                                 f.value === undefined || (f.value as unknown) === 0
//                                   ? ''
//                                   : f.value
//                               }
//                               onChange={(e) => {
//                                 const raw = e.target.value
//                                 f.onChange(raw === '' ? undefined : parseFloat(raw))
//                               }}
//                               onWheel={(e) => (e.target as HTMLInputElement).blur()}
//                               onKeyDown={(e) => {
//                                 if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault()
//                               }}
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Delete */}
//                     <div className="flex items-center justify-center h-10">
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="icon"
//                         className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
//                         onClick={() => fields.length > 1 && remove(index)}
//                         disabled={fields.length === 1}
//                       >
//                         <Trash2 className="h-3.5 w-3.5" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Add Another */}
//               <button
//                 type="button"
//                 onClick={addRow}
//                 className="w-full py-2 border-t text-sm text-muted-foreground hover:bg-slate-50 hover:text-foreground flex items-center justify-center gap-2 transition-colors rounded-b-md"
//                 disabled={!isCompanySelected}
//               >
//                 <Plus className="h-4 w-4" />
//                 Add Another
//               </button>
//             </div>

//             {/* ══ Action Buttons ══ */}
//             <div className="flex justify-end space-x-3 pt-2 border-t">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() =>
//                   form.reset({
//                     companyId: form.getValues('companyId'),
//                     locationId: form.getValues('locationId'),
//                     currency: form.getValues('currency'),
//                     date: form.getValues('date'),
//                     iouId: undefined,
//                     receiverName: '',
//                     notes: '',
//                     rows: [emptyRow()],
//                   })
//                 }
//               >
//                 Reset
//               </Button>

//               <Button
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={() => form.handleSubmit(onSubmit)()}
//               >
//                 {isSubmitting ? 'Submitting...' : 'Submit Adjustment'}
//               </Button>
//             </div>

//           </form>
//         </Form>
//       </div>
//     </div>
//   )
// }

// export default IouAdjustmentForm


// 'use client'

// import type React from 'react'
// import { useState, useEffect, useCallback, useMemo } from 'react'
// import { useForm, useFieldArray } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { format } from 'date-fns'
// import { Plus, Trash2 } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import {
//   type ComboboxItem,
//   CustomComboboxWithApi,
// } from '@/utils/custom-combobox-with-api'
// import { toast } from '@/hooks/use-toast'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import type {
//   Employee,
//   LocationData,
//   CostCenter,
//   IouRecordGetType,
//   AccountsHead,
//   CompanyChartOfAccount,
//   GetDepartment,
//   ResPartner,
// } from '@/utils/type'
// import type { CompanyType } from '@/api/company-api'
// import {
//   getEmployee,
//   getAllCompanies,
//   getAllLocations,
//   getAllCostCenters,
//   getAllCurrency,
//   getAllChartOfAccounts,
//   getAllDepartments,
//   getResPartnersBySearch,
//   getPartnerById,
// } from '@/api/common-shared-api'
// import { getCompanyWiseChartOfAccounts } from '@/api/chart-of-accounts-api'
// import { getLoanData } from '@/api/iou-api'
// import Loader from '@/utils/loader'

// // ─── Zod Schema ───────────────────────────────────────────────────────────────

// const AdjRowSchema = z.object({
//   accountId: z
//     .number({ invalid_type_error: 'Account is required' })
//     .int()
//     .positive('Account is required'),
//   costCenterId: z
//     .number({ invalid_type_error: 'Cost center is required' })
//     .int()
//     .positive('Cost center is required'),
//   departmentId: z
//     .number({ invalid_type_error: 'Unit is required' })
//     .int()
//     .positive('Unit is required'),
//   employeeId: z
//     .number({ invalid_type_error: 'Employee is required' })
//     .int()
//     .positive('Employee is required'),
//   resPartnerId: z.number().int().positive().nullable().optional(),
//   remarks: z.string().optional(),
//   amount: z
//     .number({ invalid_type_error: 'Amount is required' })
//     .positive('Must be greater than 0'),
// })

// const IouAdjFormSchema = z.object({
//   companyId: z
//     .number({ invalid_type_error: 'Company is required' })
//     .int()
//     .positive('Company is required'),
//   locationId: z
//     .number({ invalid_type_error: 'Location is required' })
//     .int()
//     .positive('Location is required'),
//   currency: z.string().min(1, 'Currency is required'),
//   date: z.string().min(1, 'Date is required'),
//   // Receiver employee (optional — selecting auto-fills receiverName)
//   receiverEmployeeId: z.number().int().positive().optional(),
//   // IOU List selection
//   iouId: z
//     .number({ invalid_type_error: 'IOU is required' })
//     .int()
//     .positive('IOU is required'),
//   receiverName: z.string().min(1, 'Receiver name is required'),
//   notes: z.string().optional(),
//   rows: z.array(AdjRowSchema).min(1),
// })

// type IouAdjFormType = z.infer<typeof IouAdjFormSchema>

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const emptyRow = () => ({
//   accountId: undefined as unknown as number,
//   costCenterId: undefined as unknown as number,
//   departmentId: undefined as unknown as number,
//   employeeId: undefined as unknown as number,
//   resPartnerId: null,
//   remarks: '',
//   amount: undefined as unknown as number,
// })

// // ─── Component ────────────────────────────────────────────────────────────────

// const IouAdjustmentForm: React.FC = () => {
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)
//   const [userData] = useAtom(userDataAtom)

//   // ── Data state ──
//   const [employeeData, setEmployeeData] = useState<Employee[]>([])
//   const [companyData, setCompanyData] = useState<CompanyType[]>([])
//   const [locationData, setLocationData] = useState<LocationData[]>([])
//   const [costCenterData, setCostCenterData] = useState<CostCenter[]>([])
//   const [currencyList, setCurrencyList] = useState<{ currencyCode: string }[]>([])
//   const [iouList, setIouList] = useState<IouRecordGetType[]>([])
//   const [chartOfAccounts, setChartOfAccounts] = useState<AccountsHead[]>([])
//   const [companyChartOfAccount, setCompanyChartOfAccount] = useState<
//     CompanyChartOfAccount[]
//   >([])
//   const [departments, setDepartments] = useState<GetDepartment[]>([])
//   const [partners, setPartners] = useState<ResPartner[]>([])
//   const [isDataLoading, setIsDataLoading] = useState(true)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   // ── Per-row partner display values (mirrors CashVoucherDetails' partnerValue pattern) ──
//   // Keyed by row index. Needed because a previously-saved resPartnerId may not be in the
//   // initially-loaded `partners` list (e.g. it was found via search), so we resolve it once
//   // via getPartnerById and cache the {id, name} here for display.
//   const [partnerValues, setPartnerValues] = useState<
//     Record<number, { id: number | string; name: string } | null>
//   >({})

//   // ── Fetch on mount ──
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [
//           empRes,
//           compRes,
//           locRes,
//           ccRes,
//           curRes,
//           iouRes,
//           coaRes,
//           companyCoaRes,
//           deptRes,
//           partnerRes,
//         ] = await Promise.all([
//           getEmployee(token),
//           getAllCompanies(token),
//           getAllLocations(token),
//           getAllCostCenters(token),
//           getAllCurrency(token),
//           getLoanData(token),
//           getAllChartOfAccounts(token),
//           getCompanyWiseChartOfAccounts(token),
//           getAllDepartments(token),
//           getResPartnersBySearch('', token),
//         ])
//         setEmployeeData(empRes.data ?? [])
//         setCompanyData(compRes.data ?? [])
//         setLocationData(locRes.data ?? [])
//         setCostCenterData(ccRes.data ?? [])
//         setCurrencyList(curRes.data ?? [])
//         setIouList(iouRes.data ?? [])
//         setChartOfAccounts(coaRes.data ?? [])
//         setCompanyChartOfAccount(companyCoaRes.data ?? [])
//         setDepartments(deptRes.data ?? [])
//         setPartners(partnerRes.data ?? [])
//       } catch (error) {
//         console.error('Failed to load form data:', error)
//         toast({ title: 'Error', description: 'Failed to load form data.', variant: 'destructive' })
//       } finally {
//         setIsDataLoading(false)
//       }
//     }
//     if (token) fetchData()
//   }, [token])

//   // ── Form ──
//   const form = useForm<IouAdjFormType>({
//     resolver: zodResolver(IouAdjFormSchema),
//     defaultValues: {
//       companyId: undefined,
//       locationId: undefined,
//       currency: 'BDT',
//       date: format(new Date(), 'yyyy-MM-dd'),
//       receiverEmployeeId: undefined,
//       iouId: undefined,
//       receiverName: '',
//       notes: '',
//       rows: [emptyRow()],
//     },
//   })

//   const { fields, append, remove } = useFieldArray({ control: form.control, name: 'rows' })

//   const selectedCompanyId = form.watch('companyId')

//   // Reset location when company changes
//   useEffect(() => {
//     form.setValue('locationId', undefined as unknown as number)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedCompanyId])

//   const filteredLocations = selectedCompanyId
//     ? locationData.filter((loc) => Number(loc.companyId) === Number(selectedCompanyId))
//     : locationData

//   // No filtering on IOU list — show all fetched IOU records
//   const filteredIouList = iouList

//   // ── Company-wise chart of accounts (same pattern as Cash Voucher) ──
//   const companyFilteredAccounts = useMemo(() => {
//     if (!selectedCompanyId || !companyChartOfAccount.length || !chartOfAccounts.length) {
//       return []
//     }
//     const ids = companyChartOfAccount
//       .filter((m) => m.companyId === selectedCompanyId)
//       .map((m) => m.chartOfAccountId)
//     return chartOfAccounts.filter((acc) => ids.includes(acc.accountId) && !acc.isGroup && acc.isActive)
//   }, [selectedCompanyId, companyChartOfAccount, chartOfAccounts])

//   // Departments ("Unit") — company-wise filtered
//   const filteredDepartments = useMemo(() => {
//     if (!selectedCompanyId) return []
//     return departments.filter(
//       (d) => d.isActive && d.companyCode === selectedCompanyId
//     )
//   }, [departments, selectedCompanyId])

//   const isCompanySelected = !!selectedCompanyId

//   // ── Partner search (always enabled, same as Cash Voucher pattern) ──
//   const searchPartners = useCallback(
//     async (query: string): Promise<ComboboxItem[]> => {
//       try {
//         const response = await getResPartnersBySearch(query, token)
//         if (response.error || !response.data) return []
//         return response.data.map((partner) => ({
//           id: partner.id.toString(),
//           name: partner.name || 'Unnamed Partner',
//         }))
//       } catch {
//         return []
//       }
//     },
//     [token]
//   )

//   // ── Resolve display name for each row's selected partner ──
//   // Mirrors CashVoucherDetails: watch each row's resPartnerId, try local `partners`
//   // list first, and only hit the API if it's not found there.
//   const watchedRows = form.watch('rows')

//   useEffect(() => {
//     const loadPartners = async () => {
//       const updates: Record<number, { id: number | string; name: string } | null> = {}

//       for (let index = 0; index < watchedRows.length; index++) {
//         const partnerId = watchedRows[index]?.resPartnerId
//         if (!partnerId) {
//           updates[index] = null
//           continue
//         }
//         const local = partners.find((p) => p.id === Number(partnerId))
//         if (local) {
//           updates[index] = { id: local.id, name: local.name || '' }
//           continue
//         }
//         // Not in the locally loaded list — resolve once via API
//         const fetched = await getPartnerById(Number(partnerId), token)
//         updates[index] = fetched?.data
//           ? { id: fetched.data.id, name: fetched.data.name || '' }
//           : null
//       }

//       setPartnerValues(updates)
//     }

//     loadPartners()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [JSON.stringify(watchedRows?.map((r) => r.resPartnerId)), partners, token])

//   const addRow = () => append(emptyRow())

//   // ── Submit ──
//   const onSubmit = async (data: IouAdjFormType) => {
//     const createdBy = userData?.userId
//     if (!createdBy) {
//       toast({ title: 'Error', description: 'User not found.', variant: 'destructive' })
//       return
//     }

//     setIsSubmitting(true)
//     try {
//       // Each row becomes one adjustment; backend creates the linked journal entry.
//       const payload = {
//         iouId: data.iouId,
//         companyId: data.companyId,
//         locationId: data.locationId,
//         currencyId: 1, // TODO: map data.currency (code) -> currencyId once currency API returns ids here
//         exchangeRate: 1,
//         adjustmentDate: data.date,
//         notes: data.notes,
//         createdBy,
//         rows: data.rows.map((row) => ({
//           accountId: row.accountId,
//           costCenterId: row.costCenterId,
//           departmentId: row.departmentId,
//           employeeId: row.employeeId,
//           resPartnerId: row.resPartnerId ?? null,
//           remarks: row.remarks,
//           amountAdjusted: row.amount,
//           adjustmentType: 'adjustment',
//         })),
//       }

//       // TODO: await createIouAdjustment(payload, token)
//       console.log('IOU Adjustment payload:', payload)

//       toast({ title: 'Success', description: 'IOU Adjustment submitted successfully!' })
//       form.reset({
//         companyId: data.companyId,
//         locationId: data.locationId,
//         currency: data.currency,
//         date: data.date,
//         receiverEmployeeId: undefined,
//         iouId: undefined,
//         receiverName: '',
//         notes: '',
//         rows: [emptyRow()],
//       })
//       setPartnerValues({})
//     } catch (error) {
//       console.error('Failed to submit IOU adjustment:', error)
//       toast({ title: 'Error', description: 'Failed to submit IOU adjustment.', variant: 'destructive' })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   if (isDataLoading) return <Loader />

//   // ─────────────────────────────────────────────────────────────────────────────

//   return (
//     <div className="p-4">
//       <div className="border rounded-lg p-6 bg-slate-50 shadow-sm">
//         <h2 className="text-lg font-semibold mb-4">IOU Adjustment</h2>

//         {!isCompanySelected && (
//           <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
//             ⚠️ Please select a company first to see available accounts and units.
//           </div>
//         )}

//         <Form {...form}>
//           <form className="space-y-4">

//             {/* ══ Master Row: Company | Location | Currency | Date ══ */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

//               {/* Company */}
//               <FormField
//                 control={form.control}
//                 name="companyId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Company Name</FormLabel>
//                     <CustomCombobox
//                       items={companyData.map((c) => ({
//                         id: c.companyId?.toString() ?? '',
//                         name: c.companyName,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: companyData.find((c) => Number(c.companyId) === field.value)?.companyName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => {
//                         field.onChange(val ? Number(val.id) : null)
//                         // reset dependent selections when company changes
//                         form.setValue('iouId', undefined as unknown as number)
//                         form.setValue('receiverName', '')
//                         const currentRows = form.getValues('rows') || []
//                         currentRows.forEach((_, idx) => {
//                           form.setValue(`rows.${idx}.accountId`, undefined as unknown as number)
//                           form.setValue(`rows.${idx}.departmentId`, undefined as unknown as number)
//                         })
//                       }}
//                       placeholder="Select a company"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Location */}
//               <FormField
//                 control={form.control}
//                 name="locationId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Location</FormLabel>
//                     <CustomCombobox
//                       items={filteredLocations.map((loc) => ({
//                         id: loc.locationId.toString(),
//                         name: loc.branchName,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: filteredLocations.find((loc) => Number(loc.locationId) === field.value)?.branchName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => field.onChange(val ? Number(val.id) : null)}
//                       placeholder={filteredLocations.length > 0 ? 'Select a location' : 'No locations'}
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Currency */}
//               <FormField
//                 control={form.control}
//                 name="currency"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Currency</FormLabel>
//                     <CustomCombobox
//                       items={
//                         currencyList.length > 0
//                           ? currencyList.map((c) => ({ id: c.currencyCode, name: c.currencyCode }))
//                           : ['BDT', 'USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD'].map((c) => ({ id: c, name: c }))
//                       }
//                       value={field.value ? { id: field.value, name: field.value } : null}
//                       onChange={(val) => field.onChange(val ? val.id : '')}
//                       placeholder="Select currency"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Date */}
//               <FormField
//                 control={form.control}
//                 name="date"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Date</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         type="date"
//                         value={field.value ?? ''}
//                         onChange={(e) => field.onChange(e.target.value)}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* ══ Receiver Name Row: [Employee dropdown] [Name text] [IOU List] ══ */}
//             {/* Order matches Cash Voucher's payTo field: combobox first, manual text second */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

//               {/* Employee dropdown — selecting fills the name */}
//               <FormField
//                 control={form.control}
//                 name="receiverEmployeeId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Receiver Name</FormLabel>
//                     <CustomCombobox
//                       items={employeeData.map((emp) => ({
//                         id: emp.id.toString(),
//                         name: `${emp.employeeName} (${emp.employeeId})`,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: employeeData.find((emp) => emp.id === field.value)?.employeeName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => {
//                         field.onChange(val ? Number(val.id) : null)
//                         if (val) {
//                           const emp = employeeData.find((e) => e.id === Number(val.id))
//                           if (emp) form.setValue('receiverName', emp.employeeName)
//                         } else {
//                           form.setValue('receiverName', '')
//                         }
//                       }}
//                       placeholder="Select employee"
//                       disabled={!!form.watch('receiverName')?.trim() && !form.watch('receiverEmployeeId')}
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Receiver Name — free text */}
//               <FormField
//                 control={form.control}
//                 name="receiverName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>&nbsp;</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         placeholder="Enter receiver name"
//                         onChange={(e) => {
//                           field.onChange(e.target.value)
//                           // Manual typing overrides the dropdown-selected employee
//                           if (e.target.value) {
//                             form.setValue('receiverEmployeeId', undefined)
//                           }
//                         }}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* IOU List dropdown */}
//               <FormField
//                 control={form.control}
//                 name="iouId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>IOU List</FormLabel>
//                     <CustomCombobox
//                       items={filteredIouList.map((iou) => ({
//                         id: iou.iouId.toString(),
//                         name: `IOU-${iou.iouId}`,
//                       }))}
//                       value={
//                         field.value
//                           ? { id: field.value.toString(), name: `IOU-${field.value}` }
//                           : null
//                       }
//                       onChange={(val) => field.onChange(val ? Number(val.id) : null)}
//                       placeholder="Select IOU"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* ══ Notes ══ */}
//             <FormField
//               control={form.control}
//               name="notes"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Notes</FormLabel>
//                   <FormControl>
//                     <Textarea
//                       {...field}
//                       placeholder="Enter notes (optional)"
//                       className="min-h-[80px] resize-y"
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* ══ Details Table ══ */}
//             <div className="border rounded-md">
//               {/* Table header */}
//               <div className="bg-slate-100 grid grid-cols-[2fr_1.5fr_1.5fr_2fr_2fr_1.5fr_1.5fr_40px] text-xs font-semibold text-muted-foreground border-b rounded-t-md overflow-hidden">
//                 <div className="px-3 py-2 border-r">Account Name</div>
//                 <div className="px-3 py-2 border-r">Cost Center</div>
//                 <div className="px-3 py-2 border-r">Unit</div>
//                 <div className="px-3 py-2 border-r">Employee</div>
//                 <div className="px-3 py-2 border-r">Partner Name</div>
//                 <div className="px-3 py-2 border-r">Remarks</div>
//                 <div className="px-3 py-2 border-r">Amount</div>
//                 <div className="px-3 py-2" />
//               </div>

//               {/* Rows */}
//               <div className="divide-y">
//                 {fields.map((field, index) => (
//                   <div
//                     key={field.id}
//                     className="grid grid-cols-[2fr_1.5fr_1.5fr_2fr_2fr_1.5fr_1.5fr_40px] bg-white items-start"
//                   >
//                     {/* Account Name — company-wise filtered */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.accountId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={companyFilteredAccounts.map((account) => ({
//                               id: account.accountId.toString(),
//                               name: account.name || 'Unnamed Account',
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name:
//                                       companyFilteredAccounts.find(
//                                         (a) => a.accountId === f.value
//                                       )?.name || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder={
//                               !isCompanySelected
//                                 ? 'Select company first'
//                                 : companyFilteredAccounts.length === 0
//                                   ? 'No accounts'
//                                   : 'Select an account'
//                             }
//                             disabled={!isCompanySelected || companyFilteredAccounts.length === 0}
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Cost Center */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.costCenterId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={costCenterData
//                               .filter((cc) => cc.isActive)
//                               .map((cc) => ({
//                                 id: cc.costCenterId.toString(),
//                                 name: cc.costCenterName,
//                               }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name: costCenterData.find((cc) => cc.costCenterId === f.value)?.costCenterName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder="Select a cost center"
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Unit (Department) — company-wise filtered */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.departmentId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={filteredDepartments.map((dept) => ({
//                               id: dept.departmentID.toString(),
//                               name: dept.departmentName || 'Unnamed Department',
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name:
//                                       filteredDepartments.find(
//                                         (d) => d.departmentID === f.value
//                                       )?.departmentName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder={
//                               !isCompanySelected
//                                 ? 'Select company first'
//                                 : filteredDepartments.length === 0
//                                   ? 'No units'
//                                   : 'Select a unit'
//                             }
//                             disabled={!isCompanySelected || filteredDepartments.length === 0}
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Employee */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.employeeId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={employeeData.map((emp) => ({
//                               id: emp.id.toString(),
//                               name: `${emp.employeeName} (${emp.employeeId})`,
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name: employeeData.find((emp) => emp.id === f.value)?.employeeName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder="Select an employee"
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Partner — always enabled, search-as-you-type (mirrors CashVoucherDetails) */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.resPartnerId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomComboboxWithApi
//                             items={partners.map((partner) => ({
//                               id: partner.id.toString(),
//                               name: partner.name || '',
//                             }))}
//                             value={
//                               f.value
//                                 ? (partners.find((p) => p.id === Number(f.value)) ?? {
//                                     id: f.value,
//                                     name: partnerValues[index]?.name || '',
//                                   })
//                                 : null
//                             }
//                             onChange={(item) => f.onChange(item ? Number(item.id) : null)}
//                             placeholder="Select partner"
//                             searchFunction={searchPartners}
//                             fetchByIdFunction={async (id) => {
//                               const numericId =
//                                 typeof id === 'string' && /^\d+$/.test(id) ? parseInt(id, 10) : (id as number)
//                               const partner = await getPartnerById(numericId, token)
//                               return partner?.data
//                                 ? { id: partner.data.id.toString(), name: partner.data.name ?? '' }
//                                 : null
//                             }}
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Remarks */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.remarks`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               placeholder="Enter remarks"
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Amount */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.amount`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               type="number"
//                               step="0.01"
//                               min="0"
//                               placeholder="Amount"
//                               value={
//                                 f.value === undefined || (f.value as unknown) === 0
//                                   ? ''
//                                   : f.value
//                               }
//                               onChange={(e) => {
//                                 const raw = e.target.value
//                                 f.onChange(raw === '' ? undefined : parseFloat(raw))
//                               }}
//                               onWheel={(e) => (e.target as HTMLInputElement).blur()}
//                               onKeyDown={(e) => {
//                                 if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault()
//                               }}
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Delete */}
//                     <div className="flex items-center justify-center h-10">
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="icon"
//                         className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
//                         onClick={() => fields.length > 1 && remove(index)}
//                         disabled={fields.length === 1}
//                       >
//                         <Trash2 className="h-3.5 w-3.5" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Add Another */}
//               <button
//                 type="button"
//                 onClick={addRow}
//                 className="w-full py-2 border-t text-sm text-muted-foreground hover:bg-slate-50 hover:text-foreground flex items-center justify-center gap-2 transition-colors rounded-b-md"
//                 disabled={!isCompanySelected}
//               >
//                 <Plus className="h-4 w-4" />
//                 Add Another
//               </button>
//             </div>

//             {/* ══ Action Buttons ══ */}
//             <div className="flex justify-end space-x-3 pt-2 border-t">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() =>
//                   form.reset({
//                     companyId: form.getValues('companyId'),
//                     locationId: form.getValues('locationId'),
//                     currency: form.getValues('currency'),
//                     date: form.getValues('date'),
//                     iouId: undefined,
//                     receiverName: '',
//                     notes: '',
//                     rows: [emptyRow()],
//                   })
//                 }
//               >
//                 Reset
//               </Button>

//               <Button
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={() => form.handleSubmit(onSubmit)()}
//               >
//                 {isSubmitting ? 'Submitting...' : 'Submit Adjustment'}
//               </Button>
//             </div>

//           </form>
//         </Form>
//       </div>
//     </div>
//   )
// }

// export default IouAdjustmentForm

// 'use client'

// import type React from 'react'
// import { useState, useEffect } from 'react'
// import { useForm, useFieldArray } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { format } from 'date-fns'
// import { Plus, Trash2 } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import { toast } from '@/hooks/use-toast'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import type { Employee, LocationData, CostCenter, IouRecordGetType } from '@/utils/type'
// import type { CompanyType } from '@/api/company-api'
// import {
//   getEmployee,
//   getAllCompanies,
//   getAllLocations,
//   getAllCostCenters,
//   getAllCurrency,
// } from '@/api/common-shared-api'
// import { getLoanData } from '@/api/iou-api'
// import Loader from '@/utils/loader'

// // ─── Zod Schema ───────────────────────────────────────────────────────────────

// const AdjRowSchema = z.object({
//   accountName: z.string().min(1, 'Account name is required'),
//   costCenterId: z
//     .number({ invalid_type_error: 'Cost center is required' })
//     .int()
//     .positive('Cost center is required'),
//   unit: z.string().min(1, 'Unit is required'),
//   employeeId: z
//     .number({ invalid_type_error: 'Employee is required' })
//     .int()
//     .positive('Employee is required'),
//   partnerName: z.string().optional(),
//   remarks: z.string().optional(),
//   amount: z
//     .number({ invalid_type_error: 'Amount is required' })
//     .positive('Must be greater than 0'),
// })

// const IouAdjFormSchema = z.object({
//   companyId: z
//     .number({ invalid_type_error: 'Company is required' })
//     .int()
//     .positive('Company is required'),
//   locationId: z
//     .number({ invalid_type_error: 'Location is required' })
//     .int()
//     .positive('Location is required'),
//   currency: z.string().min(1, 'Currency is required'),
//   date: z.string().min(1, 'Date is required'),
//   // Receiver employee (optional — selecting auto-fills receiverName)
//   receiverEmployeeId: z.number().int().positive().optional(),
//   // IOU List selection
//   iouId: z
//     .number({ invalid_type_error: 'IOU is required' })
//     .int()
//     .positive('IOU is required'),
//   receiverName: z.string().min(1, 'Receiver name is required'),
//   notes: z.string().optional(),
//   rows: z.array(AdjRowSchema).min(1),
// })

// type IouAdjFormType = z.infer<typeof IouAdjFormSchema>

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const emptyRow = () => ({
//   accountName: '',
//   costCenterId: undefined as unknown as number,
//   unit: '',
//   employeeId: undefined as unknown as number,
//   partnerName: '',
//   remarks: '',
//   amount: undefined as unknown as number,
// })

// // ─── Component ────────────────────────────────────────────────────────────────

// const IouAdjustmentForm: React.FC = () => {
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)
//   const [userData] = useAtom(userDataAtom)

//   // ── Data state ──
//   const [employeeData, setEmployeeData] = useState<Employee[]>([])
//   const [companyData, setCompanyData] = useState<CompanyType[]>([])
//   const [locationData, setLocationData] = useState<LocationData[]>([])
//   const [costCenterData, setCostCenterData] = useState<CostCenter[]>([])
//   const [currencyList, setCurrencyList] = useState<{ currencyCode: string }[]>([])
//   const [iouList, setIouList] = useState<IouRecordGetType[]>([])
//   const [isDataLoading, setIsDataLoading] = useState(true)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   // ── Fetch on mount ──
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [empRes, compRes, locRes, ccRes, curRes, iouRes] = await Promise.all([
//           getEmployee(token),
//           getAllCompanies(token),
//           getAllLocations(token),
//           getAllCostCenters(token),
//           getAllCurrency(token),
//           getLoanData(token),
//         ])
//         setEmployeeData(empRes.data ?? [])
//         setCompanyData(compRes.data ?? [])
//         setLocationData(locRes.data ?? [])
//         setCostCenterData(ccRes.data ?? [])
//         setCurrencyList(curRes.data ?? [])
//         setIouList(iouRes.data ?? [])
//       } catch (error) {
//         console.error('Failed to load form data:', error)
//         toast({ title: 'Error', description: 'Failed to load form data.', variant: 'destructive' })
//       } finally {
//         setIsDataLoading(false)
//       }
//     }
//     if (token) fetchData()
//   }, [token])

//   // ── Form ──
//   const form = useForm<IouAdjFormType>({
//     resolver: zodResolver(IouAdjFormSchema),
//     defaultValues: {
//       companyId: undefined,
//       locationId: undefined,
//       currency: 'BDT',
//       date: format(new Date(), 'yyyy-MM-dd'),
//       receiverEmployeeId: undefined,
//       iouId: undefined,
//       receiverName: '',
//       notes: '',
//       rows: [emptyRow()],
//     },
//   })

//   const { fields, append, remove } = useFieldArray({ control: form.control, name: 'rows' })

//   const selectedCompanyId = form.watch('companyId')

//   // Reset location when company changes
//   useEffect(() => {
//     form.setValue('locationId', undefined as unknown as number)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedCompanyId])

//   const filteredLocations = selectedCompanyId
//     ? locationData.filter((loc) => Number(loc.companyId) === Number(selectedCompanyId))
//     : locationData

//   // No filtering on IOU list — show all fetched IOU records
//   const filteredIouList = iouList

//   const addRow = () => append(emptyRow())

//   // ── Submit ──
//   const onSubmit = async (data: IouAdjFormType) => {
//     const createdBy = userData?.userId
//     if (!createdBy) {
//       toast({ title: 'Error', description: 'User not found.', variant: 'destructive' })
//       return
//     }
//     setIsSubmitting(true)
//     try {
//       // TODO: await createIouAdjustment({ ...data, createdBy }, token)
//       console.log('IOU Adjustment payload:', { ...data, createdBy })
//       toast({ title: 'Success', description: 'IOU Adjustment submitted successfully!' })
//       form.reset({
//         companyId: data.companyId,
//         locationId: data.locationId,
//         currency: data.currency,
//         date: data.date,
//         receiverEmployeeId: undefined,
//         iouId: undefined,
//         receiverName: '',
//         notes: '',
//         rows: [emptyRow()],
//       })
//     } catch (error) {
//       console.error('Failed to submit IOU adjustment:', error)
//       toast({ title: 'Error', description: 'Failed to submit IOU adjustment.', variant: 'destructive' })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   if (isDataLoading) return <Loader />

//   // ─────────────────────────────────────────────────────────────────────────────

//   return (
//     <div className="p-4">
//       <div className="border rounded-lg p-6 bg-slate-50 shadow-sm">
//         <h2 className="text-lg font-semibold mb-4">IOU Adjustment</h2>

//         <Form {...form}>
//           <form className="space-y-4">

//             {/* ══ Master Row: Company | Location | Currency | Date ══ */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

//               {/* Company */}
//               <FormField
//                 control={form.control}
//                 name="companyId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Company Name</FormLabel>
//                     <CustomCombobox
//                       items={companyData.map((c) => ({
//                         id: c.companyId?.toString() ?? '',
//                         name: c.companyName,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: companyData.find((c) => Number(c.companyId) === field.value)?.companyName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => {
//                         field.onChange(val ? Number(val.id) : null)
//                         // reset iou selection when company changes
//                         form.setValue('iouId', undefined as unknown as number)
//                         form.setValue('receiverName', '')
//                       }}
//                       placeholder="Select a company"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Location */}
//               <FormField
//                 control={form.control}
//                 name="locationId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Location</FormLabel>
//                     <CustomCombobox
//                       items={filteredLocations.map((loc) => ({
//                         id: loc.locationId.toString(),
//                         name: loc.branchName,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: filteredLocations.find((loc) => Number(loc.locationId) === field.value)?.branchName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => field.onChange(val ? Number(val.id) : null)}
//                       placeholder={filteredLocations.length > 0 ? 'Select a location' : 'No locations'}
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Currency */}
//               <FormField
//                 control={form.control}
//                 name="currency"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Currency</FormLabel>
//                     <CustomCombobox
//                       items={
//                         currencyList.length > 0
//                           ? currencyList.map((c) => ({ id: c.currencyCode, name: c.currencyCode }))
//                           : ['BDT', 'USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD'].map((c) => ({ id: c, name: c }))
//                       }
//                       value={field.value ? { id: field.value, name: field.value } : null}
//                       onChange={(val) => field.onChange(val ? val.id : '')}
//                       placeholder="Select currency"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Date */}
//               <FormField
//                 control={form.control}
//                 name="date"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Date</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         type="date"
//                         value={field.value ?? ''}
//                         onChange={(e) => field.onChange(e.target.value)}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* ══ Receiver Name Row: [Name text] [Employee dropdown] [IOU List] ══ */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

//               {/* Receiver Name — free text */}
//               <FormField
//                 control={form.control}
//                 name="receiverName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Receiver Name</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="Enter receiver name" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Employee dropdown — selecting fills the name */}
//               <FormField
//                 control={form.control}
//                 name="receiverEmployeeId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>&nbsp;</FormLabel>
//                     <CustomCombobox
//                       items={employeeData.map((emp) => ({
//                         id: emp.id.toString(),
//                         name: `${emp.employeeName} (${emp.employeeId})`,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: employeeData.find((emp) => emp.id === field.value)?.employeeName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => {
//                         field.onChange(val ? Number(val.id) : null)
//                         if (val) {
//                           const emp = employeeData.find((e) => e.id === Number(val.id))
//                           if (emp) form.setValue('receiverName', emp.employeeName)
//                         }
//                       }}
//                       placeholder="Select employee"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* IOU List dropdown */}
//               <FormField
//                 control={form.control}
//                 name="iouId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>IOU List</FormLabel>
//                     <CustomCombobox
//                       items={filteredIouList.map((iou) => ({
//                         id: iou.iouId.toString(),
//                         name: `IOU-${iou.iouId}`,
//                       }))}
//                       value={
//                         field.value
//                           ? { id: field.value.toString(), name: `IOU-${field.value}` }
//                           : null
//                       }
//                       onChange={(val) => field.onChange(val ? Number(val.id) : null)}
//                       placeholder="Select IOU"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* ══ Notes ══ */}
//             <FormField
//               control={form.control}
//               name="notes"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Notes</FormLabel>
//                   <FormControl>
//                     <Textarea
//                       {...field}
//                       placeholder="Enter notes (optional)"
//                       className="min-h-[80px] resize-y"
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* ══ Details Table ══ */}
//             <div className="border rounded-md overflow-hidden">
//               {/* Table header */}
//               <div className="bg-slate-100 grid grid-cols-[2fr_1.5fr_1fr_2fr_2fr_1.5fr_1.5fr_40px] text-xs font-semibold text-muted-foreground border-b">
//                 <div className="px-3 py-2 border-r">Account Name</div>
//                 <div className="px-3 py-2 border-r">Cost Center</div>
//                 <div className="px-3 py-2 border-r">Unit</div>
//                 <div className="px-3 py-2 border-r">Employee</div>
//                 <div className="px-3 py-2 border-r">Partner Name</div>
//                 <div className="px-3 py-2 border-r">Remarks</div>
//                 <div className="px-3 py-2 border-r">Amount</div>
//                 <div className="px-3 py-2" />
//               </div>

//               {/* Rows */}
//               <div className="divide-y">
//                 {fields.map((field, index) => (
//                   <div
//                     key={field.id}
//                     className="grid grid-cols-[2fr_1.5fr_1fr_2fr_2fr_1.5fr_1.5fr_40px] bg-white items-start"
//                   >
//                     {/* Account Name */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.accountName`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               placeholder="Account name"
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Cost Center */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.costCenterId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={costCenterData.map((cc) => ({
//                               id: cc.costCenterId.toString(),
//                               name: cc.costCenterName,
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name: costCenterData.find((cc) => cc.costCenterId === f.value)?.costCenterName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder="Select a cost"
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Unit */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.unit`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               placeholder="Unit"
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Employee */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.employeeId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={employeeData.map((emp) => ({
//                               id: emp.id.toString(),
//                               name: `${emp.employeeName} (${emp.employeeId})`,
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name: employeeData.find((emp) => emp.id === f.value)?.employeeName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder="Select an emp"
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Partner Name */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.partnerName`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               placeholder="Partner name"
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Remarks */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.remarks`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               placeholder="Enter remarks"
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Amount */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.amount`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               type="number"
//                               step="0.01"
//                               min="0"
//                               placeholder="Amount"
//                               value={
//                                 f.value === undefined || (f.value as unknown) === 0
//                                   ? ''
//                                   : f.value
//                               }
//                               onChange={(e) => {
//                                 const raw = e.target.value
//                                 f.onChange(raw === '' ? undefined : parseFloat(raw))
//                               }}
//                               onWheel={(e) => (e.target as HTMLInputElement).blur()}
//                               onKeyDown={(e) => {
//                                 if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault()
//                               }}
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Delete */}
//                     <div className="flex items-center justify-center h-10">
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="icon"
//                         className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
//                         onClick={() => fields.length > 1 && remove(index)}
//                         disabled={fields.length === 1}
//                       >
//                         <Trash2 className="h-3.5 w-3.5" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Add Another */}
//               <button
//                 type="button"
//                 onClick={addRow}
//                 className="w-full py-2 border-t text-sm text-muted-foreground hover:bg-slate-50 hover:text-foreground flex items-center justify-center gap-2 transition-colors"
//               >
//                 <Plus className="h-4 w-4" />
//                 Add Another
//               </button>
//             </div>

//             {/* ══ Action Buttons ══ */}
//             <div className="flex justify-end space-x-3 pt-2 border-t">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() =>
//                   form.reset({
//                     companyId: form.getValues('companyId'),
//                     locationId: form.getValues('locationId'),
//                     currency: form.getValues('currency'),
//                     date: form.getValues('date'),
//                     iouId: undefined,
//                     receiverName: '',
//                     notes: '',
//                     rows: [emptyRow()],
//                   })
//                 }
//               >
//                 Reset
//               </Button>

//               <Button
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={() => form.handleSubmit(onSubmit)()}
//               >
//                 {isSubmitting ? 'Submitting...' : 'Submit Adjustment'}
//               </Button>
//             </div>

//           </form>
//         </Form>
//       </div>
//     </div>
//   )
// }

// export default IouAdjustmentForm


// 'use client'

// import type React from 'react'
// import { useState, useEffect } from 'react'
// import { useForm, useFieldArray } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { format } from 'date-fns'
// import { Plus, Trash2 } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import { toast } from '@/hooks/use-toast'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import type { Employee, LocationData, CostCenter, IouRecordGetType } from '@/utils/type'
// import type { CompanyType } from '@/api/company-api'
// import {
//   getEmployee,
//   getAllCompanies,
//   getAllLocations,
//   getAllCostCenters,
//   getAllCurrency,
// } from '@/api/common-shared-api'
// // TODO: replace with your actual iou fetch function
// // import { getIouRecords } from '@/api/iou-api'
// import Loader from '@/utils/loader'

// // ─── Zod Schema ───────────────────────────────────────────────────────────────

// const AdjRowSchema = z.object({
//   accountName: z.string().min(1, 'Account name is required'),
//   costCenterId: z
//     .number({ invalid_type_error: 'Cost center is required' })
//     .int()
//     .positive('Cost center is required'),
//   unit: z.string().min(1, 'Unit is required'),
//   employeeId: z
//     .number({ invalid_type_error: 'Employee is required' })
//     .int()
//     .positive('Employee is required'),
//   partnerName: z.string().optional(),
//   remarks: z.string().optional(),
//   amount: z
//     .number({ invalid_type_error: 'Amount is required' })
//     .positive('Must be greater than 0'),
// })

// const IouAdjFormSchema = z.object({
//   companyId: z
//     .number({ invalid_type_error: 'Company is required' })
//     .int()
//     .positive('Company is required'),
//   locationId: z
//     .number({ invalid_type_error: 'Location is required' })
//     .int()
//     .positive('Location is required'),
//   currency: z.string().min(1, 'Currency is required'),
//   date: z.string().min(1, 'Date is required'),
//   // Receiver employee (optional — selecting auto-fills receiverName)
//   receiverEmployeeId: z.number().int().positive().optional(),
//   // IOU List selection
//   iouId: z
//     .number({ invalid_type_error: 'IOU is required' })
//     .int()
//     .positive('IOU is required'),
//   receiverName: z.string().min(1, 'Receiver name is required'),
//   notes: z.string().optional(),
//   rows: z.array(AdjRowSchema).min(1),
// })

// type IouAdjFormType = z.infer<typeof IouAdjFormSchema>

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const emptyRow = () => ({
//   accountName: '',
//   costCenterId: undefined as unknown as number,
//   unit: '',
//   employeeId: undefined as unknown as number,
//   partnerName: '',
//   remarks: '',
//   amount: undefined as unknown as number,
// })

// // ─── Component ────────────────────────────────────────────────────────────────

// const IouAdjustmentForm: React.FC = () => {
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)
//   const [userData] = useAtom(userDataAtom)

//   // ── Data state ──
//   const [employeeData, setEmployeeData] = useState<Employee[]>([])
//   const [companyData, setCompanyData] = useState<CompanyType[]>([])
//   const [locationData, setLocationData] = useState<LocationData[]>([])
//   const [costCenterData, setCostCenterData] = useState<CostCenter[]>([])
//   const [currencyList, setCurrencyList] = useState<{ currencyCode: string }[]>([])
//   const [iouList, setIouList] = useState<IouRecordGetType[]>([])
//   const [isDataLoading, setIsDataLoading] = useState(true)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   // ── Fetch on mount ──
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [empRes, compRes, locRes, ccRes, curRes] = await Promise.all([
//           getEmployee(token),
//           getAllCompanies(token),
//           getAllLocations(token),
//           getAllCostCenters(token),
//           getAllCurrency(token),
//         ])
//         setEmployeeData(empRes.data ?? [])
//         setCompanyData(compRes.data ?? [])
//         setLocationData(locRes.data ?? [])
//         setCostCenterData(ccRes.data ?? [])
//         setCurrencyList(curRes.data ?? [])

//         // TODO: uncomment when you have the iou fetch function
//         // const iouRes = await getIouRecords(token)
//         // setIouList(iouRes.data ?? [])
//       } catch (error) {
//         console.error('Failed to load form data:', error)
//         toast({ title: 'Error', description: 'Failed to load form data.', variant: 'destructive' })
//       } finally {
//         setIsDataLoading(false)
//       }
//     }
//     if (token) fetchData()
//   }, [token])

//   // ── Form ──
//   const form = useForm<IouAdjFormType>({
//     resolver: zodResolver(IouAdjFormSchema),
//     defaultValues: {
//       companyId: undefined,
//       locationId: undefined,
//       currency: 'BDT',
//       date: format(new Date(), 'yyyy-MM-dd'),
//       receiverEmployeeId: undefined,
//       iouId: undefined,
//       receiverName: '',
//       notes: '',
//       rows: [emptyRow()],
//     },
//   })

//   const { fields, append, remove } = useFieldArray({ control: form.control, name: 'rows' })

//   const selectedCompanyId = form.watch('companyId')

//   // Reset location when company changes
//   useEffect(() => {
//     form.setValue('locationId', undefined as unknown as number)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedCompanyId])

//   const filteredLocations = selectedCompanyId
//     ? locationData.filter((loc) => Number(loc.companyId) === Number(selectedCompanyId))
//     : locationData

//   // Filter IOU list: only active IOUs for selected company
//   const filteredIouList = selectedCompanyId
//     ? iouList.filter(
//         (iou) =>
//           Number(iou.companyId) === Number(selectedCompanyId) &&
//           iou.status === 'active'
//       )
//     : iouList.filter((iou) => iou.status === 'active')

//   const addRow = () => append(emptyRow())

//   // ── Submit ──
//   const onSubmit = async (data: IouAdjFormType) => {
//     const createdBy = userData?.userId
//     if (!createdBy) {
//       toast({ title: 'Error', description: 'User not found.', variant: 'destructive' })
//       return
//     }
//     setIsSubmitting(true)
//     try {
//       // TODO: await createIouAdjustment({ ...data, createdBy }, token)
//       console.log('IOU Adjustment payload:', { ...data, createdBy })
//       toast({ title: 'Success', description: 'IOU Adjustment submitted successfully!' })
//       form.reset({
//         companyId: data.companyId,
//         locationId: data.locationId,
//         currency: data.currency,
//         date: data.date,
//         receiverEmployeeId: undefined,
//         iouId: undefined,
//         receiverName: '',
//         notes: '',
//         rows: [emptyRow()],
//       })
//     } catch (error) {
//       console.error('Failed to submit IOU adjustment:', error)
//       toast({ title: 'Error', description: 'Failed to submit IOU adjustment.', variant: 'destructive' })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   if (isDataLoading) return <Loader />

//   // ─────────────────────────────────────────────────────────────────────────────

//   return (
//     <div className="p-4">
//       <div className="border rounded-lg p-6 bg-slate-50 shadow-sm">
//         <h2 className="text-lg font-semibold mb-4">IOU Adjustment</h2>

//         <Form {...form}>
//           <form className="space-y-4">

//             {/* ══ Master Row: Company | Location | Currency | Date ══ */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

//               {/* Company */}
//               <FormField
//                 control={form.control}
//                 name="companyId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Company Name</FormLabel>
//                     <CustomCombobox
//                       items={companyData.map((c) => ({
//                         id: c.companyId?.toString() ?? '',
//                         name: c.companyName,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: companyData.find((c) => Number(c.companyId) === field.value)?.companyName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => {
//                         field.onChange(val ? Number(val.id) : null)
//                         // reset iou selection when company changes
//                         form.setValue('iouId', undefined as unknown as number)
//                         form.setValue('receiverName', '')
//                       }}
//                       placeholder="Select a company"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Location */}
//               <FormField
//                 control={form.control}
//                 name="locationId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Location</FormLabel>
//                     <CustomCombobox
//                       items={filteredLocations.map((loc) => ({
//                         id: loc.locationId.toString(),
//                         name: loc.branchName,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: filteredLocations.find((loc) => Number(loc.locationId) === field.value)?.branchName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => field.onChange(val ? Number(val.id) : null)}
//                       placeholder={filteredLocations.length > 0 ? 'Select a location' : 'No locations'}
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Currency */}
//               <FormField
//                 control={form.control}
//                 name="currency"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Currency</FormLabel>
//                     <CustomCombobox
//                       items={
//                         currencyList.length > 0
//                           ? currencyList.map((c) => ({ id: c.currencyCode, name: c.currencyCode }))
//                           : ['BDT', 'USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD'].map((c) => ({ id: c, name: c }))
//                       }
//                       value={field.value ? { id: field.value, name: field.value } : null}
//                       onChange={(val) => field.onChange(val ? val.id : '')}
//                       placeholder="Select currency"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Date */}
//               <FormField
//                 control={form.control}
//                 name="date"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Date</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         type="date"
//                         value={field.value ?? ''}
//                         onChange={(e) => field.onChange(e.target.value)}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* ══ Receiver Name Row: [Name text] [Employee dropdown] [IOU List] ══ */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

//               {/* Receiver Name — free text */}
//               <FormField
//                 control={form.control}
//                 name="receiverName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Receiver Name</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="Enter receiver name" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Employee dropdown — selecting fills the name */}
//               <FormField
//                 control={form.control}
//                 name="receiverEmployeeId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>&nbsp;</FormLabel>
//                     <CustomCombobox
//                       items={employeeData.map((emp) => ({
//                         id: emp.id.toString(),
//                         name: `${emp.employeeName} (${emp.employeeId})`,
//                       }))}
//                       value={
//                         field.value
//                           ? {
//                               id: field.value.toString(),
//                               name: employeeData.find((emp) => emp.id === field.value)?.employeeName || '',
//                             }
//                           : null
//                       }
//                       onChange={(val) => {
//                         field.onChange(val ? Number(val.id) : null)
//                         if (val) {
//                           const emp = employeeData.find((e) => e.id === Number(val.id))
//                           if (emp) form.setValue('receiverName', emp.employeeName)
//                         }
//                       }}
//                       placeholder="Select employee"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* IOU List dropdown */}
//               <FormField
//                 control={form.control}
//                 name="iouId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>IOU List</FormLabel>
//                     <CustomCombobox
//                       items={filteredIouList.map((iou) => ({
//                         id: iou.iouId.toString(),
//                         name: `IOU-${iou.iouId}`,
//                       }))}
//                       value={
//                         field.value
//                           ? { id: field.value.toString(), name: `IOU-${field.value}` }
//                           : null
//                       }
//                       onChange={(val) => field.onChange(val ? Number(val.id) : null)}
//                       placeholder="Select IOU"
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* ══ Notes ══ */}
//             <FormField
//               control={form.control}
//               name="notes"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Notes</FormLabel>
//                   <FormControl>
//                     <Textarea
//                       {...field}
//                       placeholder="Enter notes (optional)"
//                       className="min-h-[80px] resize-y"
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* ══ Details Table ══ */}
//             <div className="border rounded-md overflow-hidden">
//               {/* Table header */}
//               <div className="bg-slate-100 grid grid-cols-[2fr_1.5fr_1fr_2fr_2fr_1.5fr_1.5fr_40px] text-xs font-semibold text-muted-foreground border-b">
//                 <div className="px-3 py-2 border-r">Account Name</div>
//                 <div className="px-3 py-2 border-r">Cost Center</div>
//                 <div className="px-3 py-2 border-r">Unit</div>
//                 <div className="px-3 py-2 border-r">Employee</div>
//                 <div className="px-3 py-2 border-r">Partner Name</div>
//                 <div className="px-3 py-2 border-r">Remarks</div>
//                 <div className="px-3 py-2 border-r">Amount</div>
//                 <div className="px-3 py-2" />
//               </div>

//               {/* Rows */}
//               <div className="divide-y">
//                 {fields.map((field, index) => (
//                   <div
//                     key={field.id}
//                     className="grid grid-cols-[2fr_1.5fr_1fr_2fr_2fr_1.5fr_1.5fr_40px] bg-white items-start"
//                   >
//                     {/* Account Name */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.accountName`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               placeholder="Account name"
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Cost Center */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.costCenterId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={costCenterData.map((cc) => ({
//                               id: cc.costCenterId.toString(),
//                               name: cc.costCenterName,
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name: costCenterData.find((cc) => cc.costCenterId === f.value)?.costCenterName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder="Select a cost"
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Unit */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.unit`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               placeholder="Unit"
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Employee */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.employeeId`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <CustomCombobox
//                             items={employeeData.map((emp) => ({
//                               id: emp.id.toString(),
//                               name: `${emp.employeeName} (${emp.employeeId})`,
//                             }))}
//                             value={
//                               f.value
//                                 ? {
//                                     id: f.value.toString(),
//                                     name: employeeData.find((emp) => emp.id === f.value)?.employeeName || '',
//                                   }
//                                 : null
//                             }
//                             onChange={(val) => f.onChange(val ? Number(val.id) : null)}
//                             placeholder="Select an emp"
//                           />
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Partner Name */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.partnerName`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               placeholder="Partner name"
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Remarks */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.remarks`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               placeholder="Enter remarks"
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Amount */}
//                     <FormField
//                       control={form.control}
//                       name={`rows.${index}.amount`}
//                       render={({ field: f }) => (
//                         <FormItem className="border-r">
//                           <FormControl>
//                             <Input
//                               {...f}
//                               type="number"
//                               step="0.01"
//                               min="0"
//                               placeholder="Amount"
//                               value={
//                                 f.value === undefined || (f.value as unknown) === 0
//                                   ? ''
//                                   : f.value
//                               }
//                               onChange={(e) => {
//                                 const raw = e.target.value
//                                 f.onChange(raw === '' ? undefined : parseFloat(raw))
//                               }}
//                               onWheel={(e) => (e.target as HTMLInputElement).blur()}
//                               onKeyDown={(e) => {
//                                 if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault()
//                               }}
//                               className="border-0 rounded-none shadow-none focus-visible:ring-0 h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                             />
//                           </FormControl>
//                           <FormMessage className="px-3 pb-1 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Delete */}
//                     <div className="flex items-center justify-center h-10">
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="icon"
//                         className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
//                         onClick={() => fields.length > 1 && remove(index)}
//                         disabled={fields.length === 1}
//                       >
//                         <Trash2 className="h-3.5 w-3.5" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Add Another */}
//               <button
//                 type="button"
//                 onClick={addRow}
//                 className="w-full py-2 border-t text-sm text-muted-foreground hover:bg-slate-50 hover:text-foreground flex items-center justify-center gap-2 transition-colors"
//               >
//                 <Plus className="h-4 w-4" />
//                 Add Another
//               </button>
//             </div>

//             {/* ══ Action Buttons ══ */}
//             <div className="flex justify-end space-x-3 pt-2 border-t">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() =>
//                   form.reset({
//                     companyId: form.getValues('companyId'),
//                     locationId: form.getValues('locationId'),
//                     currency: form.getValues('currency'),
//                     date: form.getValues('date'),
//                     iouId: undefined,
//                     receiverName: '',
//                     notes: '',
//                     rows: [emptyRow()],
//                   })
//                 }
//               >
//                 Reset
//               </Button>

//               <Button
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={() => form.handleSubmit(onSubmit)()}
//               >
//                 {isSubmitting ? 'Submitting...' : 'Submit Adjustment'}
//               </Button>
//             </div>

//           </form>
//         </Form>
//       </div>
//     </div>
//   )
// }

// export default IouAdjustmentForm


