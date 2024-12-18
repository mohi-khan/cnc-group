'use client'

import React, { useState, useRef, useEffect } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

const createDepartmentSchema = z.object({
  departmentName: z.string().min(1, "Department name is required"),
  budget: z.string().optional(),
  currencyCode: z.number().optional(),
  isActive: z.boolean().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  actual: z.string().optional(),
});

type Department = z.infer<typeof createDepartmentSchema>

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const { toast } = useToast()

  const formRef = useRef<HTMLFormElement>(null)

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

  const DepartmentForm = () => {
    const [currencyCode, setCurrencyCode] = useState<number>(0)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsLoading(true)
      setFeedback(null)

      const formData = new FormData(formRef.current!)
      const newDepartment = {
        departmentName: formData.get('name') as string,
        budget: formData.get('budget') as string,
        currencyCode: currencyCode,
        isActive: formData.get('active') === 'on',
        startDate: formData.get('startDate') ? new Date(formData.get('startDate') as string) : undefined,
        endDate: formData.get('endDate') ? new Date(formData.get('endDate') as string) : undefined,
        actual: formData.get('actual') as string,
      }

      try {
        createDepartmentSchema.parse(newDepartment)
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
        setDepartments((prevDepartments) => [...prevDepartments, response.data])
      }

      setIsAddDialogOpen(false)
      setFeedback({
        type: 'success',
        message: 'Department created successfully',
      })
      setIsLoading(false)
    }

    return (
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="department-name" className="text-right">
            Department Name
          </Label>
          <Input
            id="department-name"
            name="name"
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="budget" className="text-right">
            Budget
          </Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="currency-code" className="text-right">
            Currency Code
          </Label>
          <Select
            name="currencyCode"
            onValueChange={(value) => setCurrencyCode(Number(value))}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select currency code" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">BDT</SelectItem>
              <SelectItem value="2">USD</SelectItem>
              <SelectItem value="3">EUR</SelectItem>
              <SelectItem value="4">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="active" className="text-right">
            Active
          </Label>
          <Switch id="active" name="active" defaultChecked={true} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="start-date" className="text-right">
            Start Date
          </Label>
          <Input
            id="start-date"
            name="startDate"
            type="date"
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="end-date" className="text-right">
            End Date
          </Label>
          <Input
            id="end-date"
            name="endDate"
            type="date"
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="actual" className="text-right">
            Actual
          </Label>
          <Input
            id="actual"
            name="actual"
            type="number"
            className="col-span-3"
          />
        </div>
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
                  <TableCell>{department.currencyCode}</TableCell>
                  <TableCell>{department.isActive ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{department.startDate?.toLocaleDateString()}</TableCell>
                  <TableCell>{department.endDate?.toLocaleDateString()}</TableCell>
                  <TableCell>{department.actual}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
          </DialogHeader>
          <DepartmentForm />
        </DialogContent>
      </Dialog>
    </div>
  )
}

