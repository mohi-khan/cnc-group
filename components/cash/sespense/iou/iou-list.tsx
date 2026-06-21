'use client'

import type React from 'react'
import { useState, useMemo, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
  TableHead as TableHeadCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Search, Settings, Plus, Trash2 } from 'lucide-react'
import type { Employee, IouRecordGetType, LocationData } from '@/utils/type'
import Loader from '@/utils/loader'
import IouAdjPopUp from './iou-adj-popup'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { CompanyType } from '@/api/company-api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
import { formatIndianNumber } from '@/utils/Formatindiannumber'
import { toast } from '@/hooks/use-toast'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { postIouRecord, deleteIouRecord, createIouBulk } from '@/api/iou-api'
import { CustomCombobox } from '@/utils/custom-combobox'

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface LoanListProps {
  loanAllData: IouRecordGetType[]
  isLoading: boolean
  employeeData: Employee[]
  getCompany: CompanyType[]
  getLoaction: LocationData[]
  fetchLoanData: () => Promise<void>
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_COLUMNS = [
  { key: 'dateIssued', label: 'Issued Date' },
  { key: 'iouId', label: 'IOU Id' },
  { key: 'employeeId', label: 'Employee Name' },
  { key: 'companyId', label: 'Company Name' },
  { key: 'locationId', label: 'Location Name' },
  { key: 'amount', label: 'Amount' },
  { key: 'adjustedAmount', label: 'Adjusted Amount' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'notes', label: 'Notes' },
  { key: 'status', label: 'Status' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLastDateIssued = (): string => {
  if (typeof window === 'undefined') return format(new Date(), 'yyyy-MM-dd')
  const saved = localStorage.getItem('iou_last_date_issued')
  if (saved) return saved
  return format(new Date(), 'yyyy-MM-dd')
}

const getDueDateFrom = (dateStr: string): string => {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + 7)
  return format(d, 'yyyy-MM-dd')
}

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const RowSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount is required' })
    .positive('Must be greater than 0'),
  employeeId: z
    .number({ invalid_type_error: 'Employee is required' })
    .int()
    .positive('Employee is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
})

const MultiIouFormSchema = z.object({
  companyId: z
    .number({ invalid_type_error: 'Company is required' })
    .int()
    .positive('Company is required'),
  locationId: z
    .number({ invalid_type_error: 'Location is required' })
    .int()
    .positive('Location is required'),
  dateIssued: z.string().min(1, 'Date issued is required'),
  rows: z.array(RowSchema).min(1),
})

type MultiIouFormType = z.infer<typeof MultiIouFormSchema>

// ─── Component ────────────────────────────────────────────────────────────────

const IouList: React.FC<LoanListProps> = ({
  loanAllData,
  isLoading,
  employeeData,
  getCompany,
  getLoaction,
  fetchLoanData,
}) => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const [userData] = useAtom(userDataAtom)

  // ── Table state ──
  const [sortConfig, setSortConfig] = useState<{
    key: keyof IouRecordGetType
    direction: 'asc' | 'desc'
  }>({ key: 'dateIssued', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [popupIouId, setPopupIouId] = useState<number | null>(null)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    ALL_COLUMNS.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  )

  // ── Form state ──
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'draft' | 'active'>('active')

  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }))
  }
  const displayColumns = ALL_COLUMNS.filter((col) => visibleColumns[col.key])

  // ── Form setup ──
  const initialDateIssued = getLastDateIssued()

  const form = useForm<MultiIouFormType>({
    resolver: zodResolver(MultiIouFormSchema),
    defaultValues: {
      companyId: undefined,
      locationId: undefined,
      dateIssued: initialDateIssued,
      rows: [
        {
          amount: undefined as unknown as number,
          employeeId: undefined as unknown as number,
          dueDate: getDueDateFrom(initialDateIssued),
          notes: '',
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rows',
  })

  const dateIssued = form.watch('dateIssued')
  const selectedCompanyId = form.watch('companyId')

  // dateIssued বদলালে → সব rows এর dueDate আপডেট
  useEffect(() => {
    if (dateIssued) {
      const newDue = getDueDateFrom(dateIssued)
      fields.forEach((_, idx) => {
        form.setValue(`rows.${idx}.dueDate`, newDue)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateIssued])

  // Company বদলালে → locationId reset
  useEffect(() => {
    form.setValue('locationId', undefined as unknown as number)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyId])

  const filteredLocations = selectedCompanyId
    ? getLoaction.filter(
        (loc) => Number(loc.companyId) === Number(selectedCompanyId)
      )
    : getLoaction

  const addRow = () => {
    append({
      amount: undefined as unknown as number,
      employeeId: undefined as unknown as number,
      dueDate: getDueDateFrom(form.getValues('dateIssued')),
      notes: '',
    })
  }

  // ── Bulk submit ──
  const onSubmit = async (
    data: MultiIouFormType,
    status: 'draft' | 'active'
  ) => {
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
      // একটাই API call — backend এ transaction দিয়ে সব insert হবে
      await createIouBulk(
        {
          companyId: data.companyId,
          locationId: data.locationId,
          dateIssued: new Date(data.dateIssued),
          status,
          createdBy,
          rows: data.rows.map((row) => ({
            amount: row.amount,
            employeeId: row.employeeId,
            dueDate: new Date(row.dueDate),
            notes: row.notes,
          })),
        },
        token
      )

      // Save last used date
      localStorage.setItem('iou_last_date_issued', data.dateIssued)

      toast({
        title: 'Success',
        description: `${data.rows.length} IOU(s) ${
          status === 'draft' ? 'saved as draft' : 'posted'
        } successfully!`,
      })

      fetchLoanData()

      // Rows reset, common fields রেখে দাও
      form.reset({
        companyId: data.companyId,
        locationId: data.locationId,
        dateIssued: data.dateIssued,
        rows: [
          {
            amount: undefined as unknown as number,
            employeeId: undefined as unknown as number,
            dueDate: getDueDateFrom(data.dateIssued),
            notes: '',
          },
        ],
      })
    } catch (error) {
      console.error('Failed to create IOU(s):', error)
      toast({
        title: 'Error',
        description: 'Failed to create IOU(s). All records were rolled back.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Table actions ──
  const handlePostIou = async (iouId: number) => {
    try {
      await postIouRecord(iouId, token)
      toast({ title: 'Success', description: 'IOU posted successfully!' })
      fetchLoanData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post IOU.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteIou = async (iouId: number) => {
    try {
      await deleteIouRecord(iouId, token)
      toast({ title: 'Success', description: 'IOU deleted successfully!' })
      fetchLoanData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete IOU.',
        variant: 'destructive',
      })
    }
  }

  // ── Lookup helpers ──
  const getEmployeeName = (employeeId: number) => {
    const employee = employeeData.find((emp) => emp.id === employeeId)
    return employee
      ? `${employee.employeeName} (${employee.employeeId})`
      : 'Unknown Employee'
  }
  const getCompanyName = (companyId: number) => {
    const company = getCompany.find((comp) => comp.companyId === companyId)
    return company ? company.companyName : 'Unknown Company'
  }
  const getLocationName = (locationId: number) => {
    const location = getLoaction.find((loc) => loc.locationId === locationId)
    return location ? location.branchName : 'Unknown Location'
  }

  // ── Filter / Sort / Paginate ──
  const filteredLoanData = useMemo(() => {
    if (!searchQuery.trim()) return loanAllData
    const lower = searchQuery.toLowerCase()
    return loanAllData.filter((loan) => {
      const employee = employeeData.find((emp) => emp.id === loan.employeeId)
      const employeeName = (employee?.employeeName || '').toLowerCase()
      const employeeId = String(employee?.employeeId || '').toLowerCase()
      const iouId = String(loan.iouId || '').toLowerCase()
      return (
        employeeName.includes(lower) ||
        employeeId.includes(lower) ||
        iouId.includes(lower)
      )
    })
  }, [loanAllData, employeeData, searchQuery])

  const sortedLoanData = useMemo(() => {
    const sorted = [...filteredLoanData]
    sorted.sort((a, b) => {
      if (a[sortConfig.key] !== undefined && b[sortConfig.key] !== undefined) {
        if ((a[sortConfig.key] ?? 0) < (b[sortConfig.key] ?? 0))
          return sortConfig.direction === 'asc' ? -1 : 1
        if ((a[sortConfig.key] ?? 0) > (b[sortConfig.key] ?? 0))
          return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
    return sorted
  }, [filteredLoanData, sortConfig])

  const totalPages = Math.ceil(filteredLoanData.length / itemsPerPage)

  const paginatedLoanData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedLoanData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedLoanData, currentPage, itemsPerPage])

  const handleButtonClick = (loan: IouRecordGetType) =>
    setPopupIouId(loan.iouId)
  const closePopup = () => setPopupIouId(null)

  const requestSort = (key: keyof IouRecordGetType) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }))
  }

  const grandTotalAmount = filteredLoanData.reduce(
    (total, loan) => total + (loan.amount || 0),
    0
  )
  const grandTotalAdjusted = filteredLoanData.reduce(
    (total, loan) => total + (loan.adjustedAmount || 0),
    0
  )

  const renderCell = (loan: IouRecordGetType, key: string) => {
    switch (key) {
      case 'dateIssued':
        return isNaN(new Date(loan.dateIssued).getTime())
          ? 'Invalid Date'
          : new Date(loan.dateIssued).toLocaleDateString()
      case 'iouId':
        return loan.iouId
      case 'employeeId':
        return getEmployeeName(loan.employeeId)
      case 'companyId':
        return getCompanyName(loan.companyId)
      case 'locationId':
        return getLocationName(loan.locationId)
      case 'amount':
        return loan.amount !== loan.adjustedAmount
          ? formatIndianNumber(loan.amount)
          : ''
      case 'adjustedAmount':
        return loan.amount !== loan.adjustedAmount
          ? formatIndianNumber(loan.adjustedAmount)
          : ''
      case 'dueDate':
        return isNaN(new Date(loan.dueDate).getTime())
          ? 'Invalid Date'
          : new Date(loan.dueDate).toLocaleDateString()
      case 'notes':
        return loan.notes
      case 'status':
        return (
          <span
            className={
              loan.status === 'draft'
                ? 'px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700'
                : 'px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700'
            }
          >
            {loan.status === 'draft' ? 'Draft' : 'Active'}
          </span>
        )
      default:
        return null
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-1">
      {/* ══════════════════════════════════════════════════
          MULTI-ROW IOU FORM (Bulk)
      ══════════════════════════════════════════════════ */}
      <div className="mb-6 border rounded-lg p-6 bg-slate-50 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Add New IOU</h2>

        <Form {...form}>
          <form className="space-y-4">
            {/* ── Common Fields ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Company */}
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <CustomCombobox
                      items={getCompany.map((c) => ({
                        id: c.companyId?.toString() ?? '',
                        name: c.companyName,
                      }))}
                      value={
                        field.value
                          ? {
                              id: field.value.toString(),
                              name:
                                getCompany.find(
                                  (c) => Number(c.companyId) === field.value
                                )?.companyName || 'Select company',
                            }
                          : null
                      }
                      onChange={(val) =>
                        field.onChange(val ? Number(val.id) : null)
                      }
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
                                )?.branchName || 'Select location',
                            }
                          : null
                      }
                      onChange={(val) =>
                        field.onChange(val ? Number(val.id) : null)
                      }
                      placeholder={
                        filteredLocations.length > 0
                          ? 'Select a location'
                          : 'No locations for this company'
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Issued */}
              <FormField
                control={form.control}
                name="dateIssued"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Date Issued{' '}
                      <span className="text-xs text-muted-foreground font-normal">
                        (last used date)
                      </span>
                    </FormLabel>
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

            {/* ── Rows Section ── */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground font-medium">
                  IOU Rows ({fields.length})
                </p>
              </div>

              {/* Column headers — desktop only */}
              <div className="hidden md:grid grid-cols-[2fr_2fr_1.5fr_2fr_40px] gap-3 text-xs font-semibold text-muted-foreground px-1 mb-1">
                <span>Amount *</span>
                <span>Employee *</span>
                <span>Due Date *</span>
                <span>Notes</span>
                <span />
              </div>

              {/* Dynamic rows */}
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1.5fr_2fr_40px] gap-3 items-start bg-white border rounded-md p-3 shadow-sm"
                  >
                    {/* Amount */}
                    <FormField
                      control={form.control}
                      name={`rows.${index}.amount`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="md:hidden text-xs">
                            Amount *
                          </FormLabel>
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
                              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Employee */}
                    <FormField
                      control={form.control}
                      name={`rows.${index}.employeeId`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="md:hidden text-xs">
                            Employee *
                          </FormLabel>
                          <CustomCombobox
                            items={employeeData.map((emp) => ({
                              id: emp.id.toString(),
                              name: `${emp.employeeName} (${emp.employeeId}) (${emp.employeeType})`,
                            }))}
                            value={
                              f.value
                                ? {
                                    id: f.value.toString(),
                                    name:
                                      employeeData.find(
                                        (emp) => emp.id === f.value
                                      )?.employeeName || 'Select employee',
                                  }
                                : null
                            }
                            onChange={(val) =>
                              f.onChange(val ? Number(val.id) : null)
                            }
                            placeholder="Select employee"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Due Date */}
                    <FormField
                      control={form.control}
                      name={`rows.${index}.dueDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="md:hidden text-xs">
                            Due Date *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...f}
                              type="date"
                              value={f.value ?? ''}
                              onChange={(e) => f.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name={`rows.${index}.notes`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="md:hidden text-xs">
                            Notes
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...f}
                              placeholder="Notes (optional)"
                              className="min-h-[38px] h-[38px] resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Delete row */}
                    <div className="flex items-center justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => fields.length > 1 && remove(index)}
                        disabled={fields.length === 1}
                        title="Remove row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add another row — dashed */}
              <button
                type="button"
                onClick={addRow}
                className="w-full mt-3 py-2 border-2 border-dashed border-slate-300 rounded-md text-sm text-muted-foreground hover:border-slate-400 hover:text-foreground flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Another Row
              </button>
            </div>

            {/* ── Action Buttons ── */}
            <div className="flex justify-end space-x-3 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  form.reset({
                    companyId: form.getValues('companyId'),
                    locationId: form.getValues('locationId'),
                    dateIssued: form.getValues('dateIssued'),
                    rows: [
                      {
                        amount: undefined as unknown as number,
                        employeeId: undefined as unknown as number,
                        dueDate: getDueDateFrom(form.getValues('dateIssued')),
                        notes: '',
                      },
                    ],
                  })
                }
              >
                Reset Rows
              </Button>

              {/* Save as Draft */}
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => {
                  setSubmitStatus('draft')
                  form.handleSubmit((data) => onSubmit(data, 'draft'))()
                }}
              >
                {isSubmitting && submitStatus === 'draft'
                  ? 'Saving...'
                  : `Save${fields.length > 1 ? ` ${fields.length}` : ''} as Draft`}
              </Button>

              {/* Post */}
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setSubmitStatus('active')
                  form.handleSubmit((data) => onSubmit(data, 'active'))()
                }}
              >
                {isSubmitting && submitStatus === 'active'
                  ? 'Posting...'
                  : `Post${fields.length > 1 ? ` ${fields.length} IOUs` : ''}`}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* ══════════════════════════════════════════════════
          TABLE CONTROLS
      ══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-3 flex-wrap mb-2">
        <h1 className="text-2xl font-bold">IOU List</h1>

        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => {
            setItemsPerPage(Number(value))
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Employee Name, ID or IOU ID"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9 pr-4 py-2 border rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Toggle Columns</h4>
              <div className="space-y-2">
                {ALL_COLUMNS.map((col) => (
                  <div key={col.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`col-${col.key}`}
                      checked={visibleColumns[col.key]}
                      onCheckedChange={() => toggleColumnVisibility(col.key)}
                    />
                    <Label
                      htmlFor={`col-${col.key}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {col.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* ══════════════════════════════════════════════════
          TABLE
      ══════════════════════════════════════════════════ */}
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full h-[500px] overflow-auto border shadow-md">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 bg-slate-200 z-20 text-center">
              <TableRow>
                {displayColumns.map((col) => (
                  <TableHeadCell key={col.key}>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        requestSort(col.key as keyof IouRecordGetType)
                      }
                    >
                      {col.label} <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHeadCell>
                ))}
                <TableHeadCell>Action</TableHeadCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedLoanData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={displayColumns.length + 1}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No records found
                    {searchQuery ? ` matching "${searchQuery}"` : ''}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLoanData.map((loan) => (
                  <TableRow className="text-center" key={loan.iouId}>
                    {displayColumns.map((col) => (
                      <TableCell key={col.key}>
                        {renderCell(loan, col.key)}
                      </TableCell>
                    ))}
                    <TableCell className="flex gap-2 justify-center">
                      {loan.status === 'draft' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePostIou(loan.iouId)}
                          >
                            Post
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteIou(loan.iouId)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                      {loan.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleButtonClick(loan)}
                        >
                          Adjustment
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}

              {/* Grand Total */}
              <TableRow className="bg-slate-100 font-bold sticky bottom-0 z-10">
                {displayColumns.map((col, idx) => {
                  if (idx === 0)
                    return (
                      <TableCell key={col.key} className="text-right">
                        Grand Total:
                      </TableCell>
                    )
                  if (col.key === 'amount')
                    return (
                      <TableCell key={col.key}>
                        {formatIndianNumber(grandTotalAmount)}
                      </TableCell>
                    )
                  if (col.key === 'adjustedAmount')
                    return (
                      <TableCell key={col.key}>
                        {formatIndianNumber(grandTotalAdjusted)}
                      </TableCell>
                    )
                  return <TableCell key={col.key} />
                })}
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          PAGINATION
      ══════════════════════════════════════════════════ */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => {
                if (
                  index === 0 ||
                  index === totalPages - 1 ||
                  (index >= currentPage - 2 && index <= currentPage + 2)
                ) {
                  return (
                    <PaginationItem key={`page-${index}`}>
                      <PaginationLink
                        onClick={() => setCurrentPage(index + 1)}
                        isActive={currentPage === index + 1}
                        className="cursor-pointer"
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (
                  index === currentPage - 3 ||
                  index === currentPage + 3
                ) {
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationLink>...</PaginationLink>
                    </PaginationItem>
                  )
                }
                return null
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          ADJUSTMENT POPUP
      ══════════════════════════════════════════════════ */}
      {popupIouId && (
        <IouAdjPopUp
          fetchLoanData={fetchLoanData}
          iouId={popupIouId}
          isOpen={!!popupIouId}
          onOpenChange={closePopup}
        />
      )}
    </div>
  )
}

export default IouList

