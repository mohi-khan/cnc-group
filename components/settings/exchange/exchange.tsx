'use client'

import { useState } from 'react'
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

export default function ExchangePage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [exchanges, setExchanges] = useState<ExchangeType[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRate, setEditRate] = useState<string>('')

  const form = useForm<ExchangeType>({
    resolver: zodResolver(exchangeSchema),
    defaultValues: {
      exchangeDate: new Date(),
      baseCurrency: 0,
      rate: 0,
    },
  })

  function onSubmit(data: ExchangeType) {
    setExchanges([...exchanges, { ...data, id: Date.now() }])
    setIsPopupOpen(false)
    form.reset()
  }

  function handleEdit(id: number, currentRate: number) {
    setEditingId(id)
    setEditRate(currentRate.toString())
  }

  function handleUpdate(id: number) {
    setExchanges(
      exchanges.map((exchange) =>
        exchange.id === id
          ? { ...exchange, rate: Number.parseFloat(editRate) }
          : exchange
      )
    )
    setEditingId(null)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exchange</h1>
        <Button onClick={() => setIsPopupOpen(true)}>
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
            <TableRow key={exchange.id}>
              <TableCell>
                {exchange.exchangeDate.toLocaleDateString()}
              </TableCell>
              <TableCell>{exchange.baseCurrency}</TableCell>
              <TableCell>
                {editingId === exchange.id ? (
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
                {editingId === exchange.id ? (
                  <div className="border rounded-md border-black w-fit">
                    <Button
                      onClick={() => handleUpdate(exchange.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-md border-black w-fit">
                    <Button
                      onClick={() => handleEdit(exchange.id, exchange.rate)}
                      size="sm"
                      variant="ghost"
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
            <Button type="submit" className="w-full">
              Save
            </Button>
          </form>
        </Form>
      </Popup>
    </div>
  )
}
