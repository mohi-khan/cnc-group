'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { PlusIcon, ArrowUpDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { createDepartment, getAllDepartments } from '@/api/department-api'
import {
  type Department,
  departmentsArraySchema,
  departmentSchema,
  GetDepartment,
} from '@/utils/type'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { CompanyType, getAllCompany } from '@/api/company-api'
import { CustomCombobox } from '@/utils/custom-combobox'

type SortColumn =
  | 'departmentName'
  | 'budget'
  | 'currencyCode'
  | 'isActive'
  | 'startDate'
  | 'endDate'
  | 'actual'
type SortDirection = 'asc' | 'desc'

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<GetDepartment[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [userId, setUserId] = React.useState<number | undefined>()
  const [company, setCompany] = useState<CompanyType[]>([])
  const { toast } = useToast()
  const [sortColumn, setSortColumn] = useState<SortColumn>('departmentName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const form = useForm<z.infer<typeof departmentSchema>>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      departmentName: '',
      budget: 0,
      companyCode: 0,
      isActive: true,
      actual: 0,
      startDate: undefined,
      endDate: undefined,
    },
  })

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true)
    const data = await getAllDepartments()
    if (data.error || !data.data) {
      console.error('Error getting departments:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get departments',
      })
    } else {
      setDepartments(data.data)
    }
    setIsLoading(false)
  }, [toast])

  useEffect(() => {
    fetchDepartments()
    fetchCompany()
  }, [fetchDepartments])

  const fetchCompany = async () => {
    const response = await getAllCompany()
    if (response.data) {
      setCompany(response.data)
    } else {
      setCompany([])
    }
    console.log('this is company is fetch by department components', response)
  }
  React.useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUserId(userData?.userId)
      console.log('Current userId from localStorage:', userData.userId)
    } else {
      console.log('No user data found in localStorage')
    }
  }, [])

  const onSubmit = async (values: z.infer<typeof departmentSchema>) => {
    setIsLoading(true)
    setFeedback(null)

    const newDepartment = {
      ...values,
      createdBy: userId,
      startDate: values.startDate ? new Date(values.startDate) : undefined,
      endDate: values.endDate ? new Date(values.endDate) : undefined,
    }

    try {
      const departmentSchema = departmentsArraySchema.element
      departmentSchema.parse(newDepartment)

      if (!userId) {
        throw new Error('User ID is required to create a department')
      }

      if (!values.departmentName || !values.companyCode) {
        throw new Error('Department name and company code are required')
      }

      const response = await createDepartment({
        departmentName: values.departmentName,
        createdBy: userId,
        budget: values.budget || 0,
        companyCode: values.companyCode,
        isActive: values.isActive,
        startDate: values.startDate ? new Date(values.startDate) : undefined,
        endDate: values.endDate ? new Date(values.endDate) : undefined,
        actual: values.actual || 0,
      })

      if (response.error || !response.data) {
        throw new Error(
          response.error?.message || 'Failed to create department'
        )
      }

      console.log('Department created successfully:', response.data)
      toast({
        title: 'Success',
        description: 'Department created successfully',
      })
      form.reset()
      await fetchDepartments()
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Invalid form data. Please check your inputs.',
      })
    } finally {
      setIsLoading(false)
    }
  }
  const sortedDepartments = useMemo(() => {
    const sorted = [...departments]
    sorted.sort((a, b) => {
      if (sortColumn === 'budget' || sortColumn === 'actual') {
        return sortDirection === 'asc'
          ? Number(a[sortColumn]) - Number(b[sortColumn])
          : Number(b[sortColumn]) - Number(a[sortColumn])
      }
      if (sortColumn === 'startDate' || sortColumn === 'endDate') {
        const dateA = a[sortColumn] ? new Date(a[sortColumn]).getTime() : 0
        const dateB = b[sortColumn] ? new Date(b[sortColumn]).getTime() : 0
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
      }
      return sortDirection === 'asc'
        ? String(a[sortColumn as keyof typeof a]).localeCompare(
            String(b[sortColumn as keyof typeof b])
          )
        : String(b[sortColumn as keyof typeof b]).localeCompare(
            String(a[sortColumn as keyof typeof a])
          )
    })
    return sorted
  }, [departments, sortColumn, sortDirection])

  const paginatedDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedDepartments.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedDepartments, currentPage])

  const totalPages = Math.ceil(departments.length / itemsPerPage)

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const SortableTableHead: React.FC<{
    column: SortColumn
    children: React.ReactNode
  }> = ({ column, children }) => {
    const isActive = column === sortColumn
    return (
      <TableHead
        onClick={() => handleSort(column)}
        className="cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-1">
          <span>{children}</span>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableHead>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Department
        </Button>
      </div>
      {feedback && (
        <Alert
          variant={feedback.type === 'success' ? 'default' : 'destructive'}
          className="mb-6"
        >
          <AlertTitle>
            {feedback.type === 'success' ? 'Success' : 'Error'}
          </AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <div>Loading departments...</div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="border shadow-md">
            <TableHeader className="bg-slate-200">
              <TableRow>
                <SortableTableHead column="departmentName">
                  Name
                </SortableTableHead>
                <SortableTableHead column="budget">Budget</SortableTableHead>
                <SortableTableHead column="currencyCode">
                  Company Name
                </SortableTableHead>
                <SortableTableHead column="isActive">Active</SortableTableHead>
                <SortableTableHead column="startDate">
                  Start Date
                </SortableTableHead>
                <SortableTableHead column="endDate">End Date</SortableTableHead>
                <SortableTableHead column="actual">Actual</SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDepartments.map((department, index) => (
                <TableRow key={index}>
                  <TableCell>{department.departmentName}</TableCell>
                  <TableCell>{department.budget}</TableCell>
                  <TableCell>
                    {company.find((c) => c.companyId === department.companyCode)
                      ?.companyName || 'Unknown Company'}
                  </TableCell>
                  <TableCell>{department.isActive ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    {department.startDate instanceof Date
                      ? department.startDate.toLocaleDateString()
                      : department.startDate
                        ? new Date(department.startDate).toLocaleDateString()
                        : '-'}
                  </TableCell>
                  <TableCell>
                    {department.endDate instanceof Date
                      ? department.endDate.toLocaleDateString()
                      : department.endDate
                        ? new Date(department.endDate).toLocaleDateString()
                        : '-'}
                  </TableCell>
                  <TableCell>{department.actual}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className={
                      currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={() => setCurrentPage(index + 1)}
                      isActive={currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[525px] h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                console.log('Form Data:', form.getValues())
                console.log('Submit button clicked')
                form.handleSubmit(onSubmit)(e)
              }}
              className="space-y-2"
            >
              <FormField
                control={form.control}
                name="departmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyCode"
                render={({ field }) => (
                  <FormControl>
                    <CustomCombobox
                      items={company.map((company) => ({
                        id: company.companyId.toString(),
                        name: company.companyName || 'Unnamed Company',
                      }))}
                      value={
                        field.value
                          ? {
                              id: field.value.toString(),
                              name:
                                company.find((c) => c.companyId === field.value)
                                  ?.companyName || '',
                            }
                          : null
                      }
                      onChange={(value) =>
                        field.onChange(
                          value ? Number.parseInt(value.id, 10) : null
                        )
                      }
                      placeholder="Select company"
                    />
                  </FormControl>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Is this department currently active?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? new Date(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? new Date(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="actual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  onClick={() => console.log('Add Department button clicked')}
                >
                  {isLoading ? 'Saving...' : 'Add Department'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}


