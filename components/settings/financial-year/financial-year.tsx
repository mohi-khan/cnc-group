'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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

const FinancialYear = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  console.log('🚀 ~ FinancialYear ~ token:', token)

  // State variables
  const [userId, setUserId] = useState(0)
  const [error, setError] = useState('')
  useEffect(() => {
    if (userData) {
      console.log('Current user from localStorage:', userId)
      setUserId(userData.userId)
    } else {
      console.log('No user data found in localStorage')
      setError('User not authenticated. Please log in.')
    }
  }, [userId, userData])

  const form = useForm<financialYear>({
    resolver: zodResolver(createFinancialYearSchema),
    defaultValues: {
      isactive: true,
      createdby: userId,
      yearname: '',
    },
  })

  useEffect(() => {
    if (userId !== 0) {
      form.setValue('createdby', userId)
      console.log('Updated form createdby with userId:', userId)
    }
  }, [userId, form])

  async function onSubmit(values: financialYear) {
    try {
      // Ensure createdby is set to userId
      const dataToSubmit = {
        ...values,
        createdby: userId,
      }
      console.log('Form data submitted:', dataToSubmit)
      const response = await createFinancialYear(dataToSubmit, token)

      if (response.error || !response.data) {
        console.error('Error creating Financial year:', response.error)
        toast({
          title: 'Error',
          description: 'Failed to create financial year. Please try again.',
          variant: 'destructive',
        })
      } else {
        console.log('Financial year created successfully')
        toast({
          title: 'Success',
          description: 'Financial year created successfully',
        })
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    }
  }

  //console.log(form.getValues())
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-[240px] pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-[240px] pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
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
