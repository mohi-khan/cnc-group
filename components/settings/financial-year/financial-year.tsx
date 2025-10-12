'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
// import { Calendar } from '@/components/ui/calendar'  // ❌ removed
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  createFinancialYear,
  type financialYear,
} from '@/api/financial-year.api'
import { toast } from '@/hooks/use-toast'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { createFinancialYearSchema } from '@/utils/type'
import { useRouter } from 'next/navigation'

const FinancialYear = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  // State variables
  const [userId, setUserId] = useState(0)
  const [error, setError] = useState('')
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  useEffect(() => {
    if (userData) {
      setUserId(userData.userId)
    } else {
      setError('User not authenticated. Please log in.')
    }
  }, [userId, userData])

  const form = useForm<financialYear>({
    resolver: zodResolver(createFinancialYearSchema),
    defaultValues: {
      isactive: true,
      createdby: userId,
      yearname: '',
      startdate: undefined,
      enddate: undefined,
    },
  })

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

    if (userId !== 0) {
      form.reset({
        ...form.getValues(),
        createdby: userId,
      })
    }
  }, [userId, form, router])

  async function onSubmit(values: financialYear) {
    try {
      const dataToSubmit = {
        ...values,
        createdby: userId,
      }

      const response = await createFinancialYear(dataToSubmit, token)

      // ✅ Handle backend errors properly
      if (response?.error || !response?.data) {
        let errorMessage = 'Failed to create financial year. Please try again.'

        // Check if backend returned specific overlap error
        if (typeof response?.error === 'string') {
          errorMessage = response.error
        } else if (response?.error?.message) {
          errorMessage = response.error.message
        }

        // ✅ Show clear toast error
        toast({
          title: 'Error',
          description: errorMessage, // e.g. "The specified date range overlaps with an existing financial year"
          variant: 'destructive',
        })
        return
      }

      // ✅ Success
      toast({
        title: 'Success',
        description: 'Financial year created successfully',
      })

      form.reset({
        isactive: true,
        createdby: userId,
        yearname: '',
        startdate: undefined,
        enddate: undefined,
      })
    } catch (error: any) {
      console.error('Unexpected error:', error)

      // ✅ Catch backend-thrown message (if using axios/fetch)
      const backendMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An unexpected error occurred. Please try again.'

      toast({
        title: 'Error',
        description: backendMessage, // will show overlap message if thrown by backend
        variant: 'destructive',
      })
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Financial Year</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="yearname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Financial Year Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. FY 2023-2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startdate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value ? format(field.value, 'yyyy-MM-dd') : ''
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      className="w-[240px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enddate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value ? format(field.value, 'yyyy-MM-dd') : ''
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      className="w-[240px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Save
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
export default FinancialYear
