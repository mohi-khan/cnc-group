'use client'

import { useState, useEffect } from 'react'
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
import { exchangeSchema, type ExchangeType } from '@/utils/type'
import { Popup } from '@/utils/popup'
import { Plus, Edit2, Save, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  createExchange,
  editExchange,
  getAllExchange,
} from '@/api/exchange-api'
import { CustomCombobox } from '@/utils/custom-combobox'

export default function ExchangePage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [exchanges, setExchanges] = useState<ExchangeType[]>([])
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
    fetchExchanges()
  }, [])

  useEffect(() => {
    if (!isPopupOpen) {
      form.reset()
    }
  }, [isPopupOpen, form])

  const fetchExchanges = async () => {
    setIsLoading(true)
    const data = await getAllExchange()
    if (data.error || !data.data) {
      console.error('Error getting exchanges:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get exchanges',
      })
    } else {
      setExchanges(data.data)
      console.log('🚀 ~ fetchExchanges ~ data.data:', data.data)
    }
    setIsLoading(false)
  }

  async function onSubmit(data: ExchangeType) {
    setIsLoading(true)
    const result = await createExchange(data)
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
    setIsLoading(true)
    const result = await editExchange(exchangeDate, baseCurrency)
    if (result.error || !result.data) {
      toast({
        title: 'Error',
        description: result.error?.message || 'Failed to update exchange',
        variant: 'destructive',
      })
    } else {
      setExchanges(result.data)
      setEditingId(null)
      toast({
        title: 'Success',
        description: 'Exchange updated successfully',
      })
    }
    setIsLoading(false)
  }

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
              <TableCell>{exchange.baseCurrency == 1 && 'BDT'}</TableCell>
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
                          exchange.exchangeDate,
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
                          exchange.exchangeDate,
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
                      items={[
                        { id: '1', name: 'BDT' },
                        { id: '2', name: 'USD' },
                        { id: '3', name: 'EUR' },
                        { id: '4', name: 'GBP' },
                      ]}
                      value={
                        field.value
                          ? {
                              id: field.value.toString(),
                              name: ['BDT', 'USD', 'EUR', 'GBP'][
                                field.value - 1
                              ],
                            }
                          : null
                      }
                      onChange={(value) =>
                        field.onChange(
                          value ? Number.parseInt(value.id, 10) : null
                        )
                      }
                      placeholder="Select currency"
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
