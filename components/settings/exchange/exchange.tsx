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
import { Plus, Edit2, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  createExchange,
  editExchange,
  getAllExchange,
} from '@/api/exchange-api'

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
      setExchanges([...exchanges, ...result.data])
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
      console.error('Error updating exchange:', result.error)
      toast({
        title: 'Error',
        description: result.error?.message || 'Failed to update exchange',
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
    <div className="container mx-auto p-4">
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
              <TableCell>{exchange.baseCurrency}</TableCell>
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
                  <Button
                    onClick={() =>
                      handleUpdate(exchange.exchangeDate, exchange.baseCurrency)
                    }
                    size="sm"
                    variant="ghost"
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                ) : (
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
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Popup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
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
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number.parseInt(e.target.value))
                      }
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              Save
            </Button>
          </form>
        </Form>
      </Popup>
    </div>
  )
}
