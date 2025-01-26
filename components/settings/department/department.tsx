'use client'

import React, { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
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

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [userId, setUserId] = React.useState<number | undefined>()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof departmentSchema>>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      departmentName: '',
      budget: 0,
      currencyCode: 1,
      isActive: true,
      actual: 0,
      startDate: null,
      endDate: null,
    },
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
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
      startDate: values.startDate ? new Date(values.startDate) : null,
      endDate: values.endDate ? new Date(values.endDate) : null,
    }

    try {
      const departmentSchema = departmentsArraySchema.element
      departmentSchema.parse(newDepartment)
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors)
        toast({
          title: 'Error',
          description: 'Invalid form data. Please check your inputs.',
        })
        setIsLoading(false)
        return
      }
    }

    const response = await createDepartment(newDepartment)
    if (response.error || !response.data) {
      console.error('Error creating department:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to create department',
      })
    } else {
      console.log('Department created successfully')
      toast({
        title: 'Success',
        description: 'Department created successfully',
      })
      form.reset()
      await fetchDepartments()
    }

    setIsAddDialogOpen(false)
    setIsLoading(false)
  }

  // console.log('Form state errors:', form.formState.errors)
  // console.log('Form values:', form.getValues())

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Currency Code</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department, index) => (
                <TableRow key={index}>
                  <TableCell>{department.departmentName}</TableCell>
                  <TableCell>{department.budget}</TableCell>
                  <TableCell>
                    {department.currencyCode === 1
                      ? 'BDT'
                      : department.currencyCode === 2
                        ? 'USD'
                        : 'EUR'}
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
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[525px] h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
                name="currencyCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency Code</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency code" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">BDT</SelectItem>
                        <SelectItem value="2">USD</SelectItem>
                        <SelectItem value="3">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
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
                <Button type="submit" disabled={isLoading}>
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
