// import React from 'react'

// const LoanPopUp = () => {
//   return <div>LoanPopUp</div>
// }

// export default LoanPopUp
'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { CalendarIcon, ChevronsUpDown } from 'lucide-react'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ExpenseFormData {
  amount: string
  note: string
  employeeName: string
  dueDate: Date | undefined
}

const employees = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Bob Johnson' },
  { id: '4', name: 'Alice Williams' },
  { id: '5', name: 'Charlie Brown' },
]

export default function ExpenseForm() {
  const [date, setDate] = useState<Date>()
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormData>()

  const onSubmit = (data: ExpenseFormData) => {
    console.log(data)
    // Here you would typically send the data to your backend
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Expense Form</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="Enter amount"
              {...register('amount', { required: 'Amount is required' })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Enter note"
              {...register('note')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeName">Employee Name</Label>
            <Controller
              name="employeeName"
              control={control}
              rules={{ required: 'Employee name is required' }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.name}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.employeeName && (
              <p className="text-sm text-red-500">
                {errors.employeeName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Submit Expense
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
