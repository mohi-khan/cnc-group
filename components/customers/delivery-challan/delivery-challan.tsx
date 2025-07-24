'use client'

import {
  getDeliveryChallan,
  updateDeliveryChallan,
} from '@/api/delivery-challan-api'
import { toast } from '@/hooks/use-toast'
import type { GetDeliveryChallan } from '@/utils/type'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarDays } from 'lucide-react'
import Loader from '@/utils/loader'

const DeliveryChallan = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const router = useRouter()
  const [delivery, setDelivery] = useState<GetDeliveryChallan[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<GetDeliveryChallan | null>(
    null
  )
  const [exchangeRate, setExchangeRate] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  const fetchExchanges = useCallback(async () => {
    if (!token) return
    setLoading(true)
    const data = await getDeliveryChallan(token)
    if (data?.error?.status === 401) {
      router.push('/unauthorized-access')
      return
    } else if (data.error || !data.data) {
      console.error('Error getting delivery challan:', data.error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: data.error?.message || 'Failed to get delivery challan',
      })
    } else {
      setDelivery(data.data)
    }
    setLoading(false)
  }, [router, token])

  useEffect(() => {
    fetchExchanges()
  }, [fetchExchanges])

  const handlePostClick = (item: GetDeliveryChallan) => {
    setSelectedItem(item)
    setExchangeRate('')
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
    setExchangeRate('')
    setIsPosting(false)
  }

  const handlePost = async () => {
    if (!selectedItem || !token || !exchangeRate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid exchange rate',
      })
      return
    }

    const rate = Number.parseFloat(exchangeRate)
    if (isNaN(rate) || rate <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid positive number for exchange rate',
      })
      return
    }

    setIsPosting(true)
    try {
      const result = await updateDeliveryChallan(token, selectedItem.id, rate)

      if (result?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (result.error) {
        console.error('Error updating delivery challan:', result.error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            result.error?.message || 'Failed to update delivery challan',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Delivery challan updated successfully',
        })
        handleModalClose()
        // Refresh the data
        fetchExchanges()
      }
    } catch (error) {
      console.error('Error updating delivery challan:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      })
    } finally {
      setIsPosting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    // Currency symbol mapping
    const currencySymbols: { [key: string]: string } = {
      USD: '$',
      BDT: '৳',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      INR: '₹',
      CNY: '¥',
    }

    const symbol = currencySymbols[currency.toUpperCase()] || currency

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(amount)
      .replace(/^/, `${symbol} `)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Delivery Challan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 w-full bg-muted animate-pulse rounded"
                />
              ))}
            </div>
            <div className="text-center mt-4">
              <Loader />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Delivery Challan
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {delivery.length} {delivery.length === 1 ? 'record' : 'records'}{' '}
            found
          </p>
        </CardHeader>
        <CardContent>
          {delivery.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No delivery challans found
              </h3>
              <p className="text-muted-foreground">
                There are no delivery challans to display at the moment.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        Company Name
                      </div>
                    </TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        Partner Name
                      </div>
                    </TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {delivery.map((item, index) => (
                    <TableRow key={`delivery-${index}-${item.id}`}>
                      <TableCell className="font-medium">
                        {item.companyName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.currencyName}</Badge>
                      </TableCell>
                      <TableCell>{item.res_partnerName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.division}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(item.orderDate)}</TableCell>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatAmount(item.amount, item.currencyName)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          onClick={() => handlePostClick(item)}
                          className="h-8 px-3"
                        >
                          Post
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Exchange Rate</DialogTitle>
            <DialogDescription>
              Enter the exchange rate for {selectedItem?.companyName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exchangeRate" className="text-right">
                Exchange Rate
              </Label>
              <Input
                id="exchangeRate"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter exchange rate"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleModalClose}
              disabled={isPosting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePost}
              disabled={isPosting || !exchangeRate}
            >
              {isPosting ? 'Posting...' : 'Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DeliveryChallan
