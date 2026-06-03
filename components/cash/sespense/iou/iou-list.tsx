'use client'

import type React from 'react'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { ArrowUpDown, Search, Settings } from 'lucide-react'
import type { Employee, IouRecordGetType, LocationData } from '@/utils/type'
import {
  IouRecordCreateSchema,
  type IouRecordCreateType,
} from '@/utils/type'
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
import { postIouRecord, deleteIouRecord, createIou } from '@/api/iou-api'
import { CustomCombobox } from '@/utils/custom-combobox'

interface LoanListProps {
  loanAllData: IouRecordGetType[]
  isLoading: boolean
  employeeData: Employee[]
  getCompany: CompanyType[]
  getLoaction: LocationData[]
  fetchLoanData: () => Promise<void>
}

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

  const [sortConfig, setSortConfig] = useState<{
    key: keyof IouRecordGetType
    direction: 'asc' | 'desc'
  }>({ key: 'dateIssued', direction: 'desc' })

  const [currentPage, setCurrentPage] = useState(1)
  const [popupIouId, setPopupIouId] = useState<number | null>(null)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)

  // ✅ Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    ALL_COLUMNS.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  )

  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const displayColumns = ALL_COLUMNS.filter((col) => visibleColumns[col.key])

  // ✅ userId set করা
  useEffect(() => {
    if (userData) {
      setUserId(userData.userId)
    }
  }, [userData])

  // ✅ Form setup
  const initialDateIssued = getLastDateIssued()

  const form = useForm<IouRecordCreateType>({
    resolver: zodResolver(IouRecordCreateSchema),
    defaultValues: {
      amount: 0,
      adjustedAmount: 0,
      employeeId: 0,
      companyId: getCompany.length > 0 ? getCompany[0].companyId : undefined,
      locationId: getLoaction.length > 0 ? getLoaction[0].locationId : undefined,
      dateIssued: initialDateIssued,
      dueDate: getDueDateFrom(initialDateIssued),
      status: 'active',
      notes: '',
      createdBy: userData?.userId,
    },
  })

  const { watch, setValue } = form
  const dateIssued = watch('dateIssued')

  // ✅ dateIssued বদলালে dueDate আপডেট
  useEffect(() => {
    if (dateIssued) {
      const issued = new Date(dateIssued)
      setValue('dueDate', getDueDateFrom(issued))
    }
  }, [dateIssued, setValue])

  // ✅ Form খোলার সময় last saved date দিয়ে reset
  useEffect(() => {
    const lastDate = getLastDateIssued()
    setValue('dateIssued', lastDate)
    setValue('dueDate', getDueDateFrom(lastDate))
  }, [setValue])

  useEffect(() => {
    if (userId !== null) {
      form.setValue('createdBy', userId)
    }
  }, [userId, form])

  const selectedCompanyId = form.watch('companyId')

  const filteredLocations = selectedCompanyId
    ? getLoaction.filter(
        (location) => Number(location.companyId) === Number(selectedCompanyId)
      )
    : getLoaction

  // ✅ Form submit
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
      fetchLoanData()
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

  // ✅ Post IOU
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

  // ✅ Delete IOU
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

  return (
    <div className="p-1">


      {/* ✅ Flat Form - always visible, header এর নিচে */}
      <div className="mb-6 border rounded-lg p-6 bg-slate-50 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Add New IOU</h2>
          <Form {...form}>
            <form
              onSubmit={(e) => form.handleSubmit(onSubmit)(e)}
              className="space-y-4"
            >
              {/* Row 1: Amount + Employee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          onWheel={(e) =>
                                (e.target as HTMLInputElement).blur()
                              }
                              onKeyDown={(e) => {
                                if (
                                  e.key === 'ArrowUp' ||
                                  e.key === 'ArrowDown'
                                ) {
                                  e.preventDefault()
                                }
                              }}
                              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" // 👈 Add this
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
                          name: `${employee.employeeName} (${employee.employeeId}) (${employee.employeeType})`,
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
              </div>

              {/* Row 2: Company + Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              {/* Row 3: Date Issued + Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            field.value
                              ? format(new Date(field.value), 'yyyy-MM-dd')
                              : ''
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
                            field.value
                              ? format(new Date(field.value), 'yyyy-MM-dd')
                              : ''
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
              </div>

              {/* Row 4: Notes */}
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

              {/* Buttons */}
              <div className="flex justify-end space-x-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Reset
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
        </div>

      {/* ✅ Table header row: IOU List + items per page + search + columns */}
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

        {/* Search Bar */}
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

        {/* Columns button */}
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

      {/* ✅ Table */}
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

                    {/* ✅ Action Column */}
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
                  if (idx === 0) {
                    return (
                      <TableCell key={col.key} className="text-right">
                        Grand Total:
                      </TableCell>
                    )
                  }
                  if (col.key === 'amount') {
                    return (
                      <TableCell key={col.key}>
                        {formatIndianNumber(grandTotalAmount)}
                      </TableCell>
                    )
                  }
                  if (col.key === 'adjustedAmount') {
                    return (
                      <TableCell key={col.key}>
                        {formatIndianNumber(grandTotalAdjusted)}
                      </TableCell>
                    )
                  }
                  return <TableCell key={col.key} />
                })}
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {/* ✅ Pagination - table এর নিচে */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                } else if (index === currentPage - 3 || index === currentPage + 3) {
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* ✅ Adjustment Popup */}
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


