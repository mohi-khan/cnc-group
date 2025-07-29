'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BoeGet } from '@/utils/type'
import { getAllBillOfExchange } from '@/api/bill-of-exchange-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useCallback, useState, useEffect } from 'react'

// ✅ Corrected Date Formatting Function
const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return 'N/A'
  const parsedDate = typeof date === 'string' ? new Date(date) : date
  if (isNaN(parsedDate.getTime())) return 'Invalid Date'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsedDate)
}

// Helper function to determine the status
const getBoeStatus = (boe: BoeGet): string => {
  const hasSubDate = !!boe.boeSubDate
  const hasRecDate = !!boe.boeRecDate
  const hasNegotiationDate = !!boe.negotiationDate
  const hasMaturityDate = !!boe.maturityDate

  if (hasSubDate && hasRecDate && hasNegotiationDate && hasMaturityDate) {
    return 'Matured'
  } else if (hasSubDate && hasRecDate && hasNegotiationDate) {
    return 'Negotiated'
  } else if (hasSubDate && hasRecDate) {
    return 'Received'
  } else if (hasSubDate) {
    return 'Submitted'
  } else {
    return 'Created'
  }
}

const BillOfExchange = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const [data, setData] = useState<BoeGet[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const result = await getAllBillOfExchange(token)
      const fetchedData = result.data ? result.data : []
      setData(fetchedData)
      console.log('Fetched Bill of Exchange data:', result.data || [])
    } catch (err) {
      console.error('Failed to fetch Bill of Exchange data:', err)
      setError('Failed to load data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchData()
  }, [fetchData, token])

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Bill of Exchange Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-7xl mx-auto mt-5">
      <CardHeader>
        <CardTitle>Bill of Exchange Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className=" border shadow-md">
            <TableHeader className=" bg-slate-200 shadow-md">
              <TableRow>
                <TableHead>BOE No</TableHead>
                <TableHead>BOE Date</TableHead>
                <TableHead>LC Log No</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Received Date</TableHead>
                <TableHead>Negotiation Date</TableHead>
                <TableHead>Maturity Date</TableHead>
                <TableHead className="text-right">USD Amount</TableHead>
                <TableHead className="text-right">BDT Amount</TableHead>
                <TableHead>Status</TableHead>
                {/* New Status Header */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    {' '}
                    {/* Updated colSpan */}
                    No data available.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((boe) => (
                  <TableRow key={boe.boeNo}>
                    <TableCell className="font-medium">{boe.boeNo}</TableCell>
                    <TableCell>{formatDate(boe.boeDate)}</TableCell>
                    <TableCell>{boe.lcLogNo}</TableCell>
                    <TableCell>{formatDate(boe.boeSubDate)}</TableCell>
                    <TableCell>{formatDate(boe.boeRecDate)}</TableCell>
                    <TableCell>{formatDate(boe.negotiationDate)}</TableCell>
                    <TableCell>{formatDate(boe.maturityDate)}</TableCell>
                    <TableCell className="text-right">
                      ${boe.usdAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ৳{boe.bdtAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>{getBoeStatus(boe)}</TableCell>
                    {/* New Status Cell */}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default BillOfExchange
