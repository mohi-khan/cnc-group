'use client'

import { getDeliveryChallan } from '@/api/delivery-challan-api'
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
import { CalendarDays, Building2, User } from 'lucide-react'

const DeliveryChallan = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [delivery, setDelivery] = useState<GetDeliveryChallan[]>([])
  const [loading, setLoading] = useState(true)

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
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
              <p className="text-sm text-muted-foreground">
                Loading delivery challans...
              </p>
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
                        <Building2 className="h-4 w-4" />
                        Company Name
                      </div>
                    </TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Partner Name
                      </div>
                    </TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DeliveryChallan
