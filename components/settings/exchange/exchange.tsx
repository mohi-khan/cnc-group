'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CurrencyType, exchangeSchema, type ExchangeType } from '@/utils/type'
import { Popup } from '@/utils/popup'
import { Plus, Edit2, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createExchange, editExchange } from '@/api/exchange-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import { getAllCurrency, getAllExchange } from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

export default function ExchangePage() {
  //getting userData from jotai atom component
  useInitializeUser()

  const [token] = useAtom(tokenAtom)
  const router = useRouter()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [exchanges, setExchanges] = useState<ExchangeType[]>([])
  const [currency, setCurrency] = useState<CurrencyType[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRate, setEditRate] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<ExchangeType>({
    resolver: zodResolver(exchangeSchema),
    defaultValues: {
      exchangeDate: new Date(),
      baseCurrency: 0,
      rate: 0,
    },
  })

  useEffect(() => {
    if (!isPopupOpen) {
      form.reset()
    }
  }, [isPopupOpen, form])

  const fetchExchanges = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    const data = await getAllExchange(token)
    if (data?.error?.status === 401) {
      router.push('/unauthorized-access')
      console.log('Unauthorized access')
      return
    } else if (data.error || !data.data) {
      console.error('Error getting exchanges:', data.error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: data.error?.message || 'Failed to get exchanges',
      })
    } else {
      setExchanges(data.data)
    }
    setIsLoading(false)
  }, [token, router, toast])

  // Fetch all currency
  const fetchCurrency = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    const data = await getAllCurrency(token)
    if (data.error || !data.data) {
      console.error('Error getting currency:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get currency',
      })
    } else {
      setCurrency(data.data)
      console.log('🚀 ~ fetchCurrency ~ data.data:', data.data)
    }
    setIsLoading(false)
  }, [token,toast])

  async function onSubmit(data: ExchangeType) {
    setIsLoading(true)
    const result = await createExchange(data, token)
    if (result.error || !result.data) {
      console.error('Error creating exchange:', result.error)
      toast({
        title: 'Error',
        description: result.error?.message || 'Failed to create exchange',
      })
    } else {
      fetchExchanges()
      setIsPopupOpen(false)
      form.reset()
      toast({
        title: 'Success',
        description: 'Exchange created successfully',
      })
    }
    setIsLoading(false)
  }

  function handleEdit(
    exchangeDate: string,
    baseCurrency: number,
    currentRate: number
  ) {
    setEditingId(`${exchangeDate}-${baseCurrency}`)
    setEditRate(currentRate.toString())
  }

  async function handleUpdate(exchangeDate: string, baseCurrency: number) {
    if (!token) return
    setIsLoading(true)
    const formattedDate = new Date(exchangeDate).toISOString().split('T')[0]
    const rate = parseFloat(editRate)

    if (isNaN(rate)) {
      toast({
        title: 'Error',
        description: 'Rate must be a valid number.',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    const result = await editExchange(formattedDate, baseCurrency, rate, token)

    if (result.error || !result.data) {
      toast({
        title: 'Error',
        description: result.error?.message || 'Failed to update exchange',
        variant: 'destructive',
      })
    } else {
      fetchExchanges()
      setEditingId(null)
      toast({
        title: 'Success',
        description: 'Exchange updated successfully',
      })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchExchanges()
    fetchCurrency()
  }, [fetchCurrency, fetchExchanges])

  return (
    <div className="w-[98%] mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exchange</h1>
        <Button onClick={() => setIsPopupOpen(true)} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      <Table className="shadow-md border">
        <TableHeader className="border shadow-md bg-slate-200">
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exchanges.map((exchange) => (
            <TableRow key={`${exchange.exchangeDate}-${exchange.baseCurrency}`}>
              <TableCell>
                {new Date(exchange.exchangeDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {currency.find((c) => c.currencyId === exchange.baseCurrency)
                  ?.currencyCode || exchange.baseCurrency}
              </TableCell>
              <TableCell>
                {editingId ===
                `${exchange.exchangeDate}-${exchange.baseCurrency}` ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editRate}
                    onChange={(e) => setEditRate(e.target.value)}
                    className="w-24"
                  />
                ) : (
                  exchange.rate
                )}
              </TableCell>
              <TableCell>
                {editingId ===
                `${exchange.exchangeDate}-${exchange.baseCurrency}` ? (
                  <div className="border border-black rounded-md w-fit">
                    <Button
                      onClick={() =>
                        handleUpdate(
                          exchange.exchangeDate.toString(),
                          exchange.baseCurrency
                        )
                      }
                      size="sm"
                      variant="ghost"
                      disabled={isLoading}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border border-black rounded-md w-fit">
                    <Button
                      onClick={() =>
                        handleEdit(
                          exchange.exchangeDate.toString(),
                          exchange.baseCurrency,
                          exchange.rate
                        )
                      }
                      size="sm"
                      variant="ghost"
                      disabled={isLoading}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Popup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false)
          form.reset()
        }}
        title="Create Exchange"
        size="max-w-md"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="exchangeDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value instanceof Date
                          ? field.value.toISOString().split('T')[0]
                          : field.value
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baseCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <CustomCombobox
                      items={currency
                        .filter((curr) => curr.baseCurrency)
                        .map((curr) => ({
                          id: curr.currencyId.toString(),
                          name: curr.currencyCode || 'Unnamed Currency',
                        }))}
                      value={
                        field.value
                          ? {
                              id: field.value.toString(),
                              name:
                                currency.find(
                                  (c) =>
                                    c.currencyId === field.value &&
                                    c.baseCurrency
                                )?.currencyCode || '',
                            }
                          : null
                      }
                      onChange={(value) =>
                        field.onChange(
                          value ? Number.parseInt(value.id, 10) : null
                        )
                      }
                      placeholder="Select a currency"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
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
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting || isLoading}
            >
              {form.formState.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </Form>
      </Popup>
    </div>
  )
}
