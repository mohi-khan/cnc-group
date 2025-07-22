'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { getUtilityBills } from '@/api/utility-report-api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GetElectricityMeterType } from '@/utils/type'

interface UtilityReportFindProps {
  onSearch: (fromDate: string, toDate: string, meterNo: string) => void
}

export default function UtilityReportFind({
  onSearch,
}: UtilityReportFindProps) {
  // Getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [meterNo, setMeterNo] = useState<string>('')

  const [meters, setMeters] = useState<GetElectricityMeterType[]>([])

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
  }, [router])

  const fetchUtilityBills = useCallback(async () => {
    if (!token) return
    const fetchedBills = await getUtilityBills(token)
    if (fetchedBills.error || !fetchedBills.data) {
      console.error('Error getting utility bills:', fetchedBills.error)
      toast({
        title: 'Error',
        description:
          fetchedBills.error?.message || 'Failed to get utility bills',
      })
    } else {
      if (Array.isArray(fetchedBills.data)) {
        setMeters(fetchedBills.data)
      } else {
        console.error('Fetched data is not an array:', fetchedBills.data)
        toast({
          title: 'Error',
          description: 'Invalid data format received for utility bills',
        })
      }
      
        '🚀 ~ fetchUtilityBills ~ fetchedBills.data:',
        fetchedBills.data
      )
    }
  }, [token])

  useEffect(() => {
    fetchUtilityBills()
  }, [fetchUtilityBills])

  const handleSearch = () => {
    if (!fromDate || !toDate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select both dates',
      })
      return
    }

    if (new Date(toDate) < new Date(fromDate)) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'To Date must be greater than From Date',
      })
      return
    }

    if (!meterNo.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a meter number',
      })
      return
    }

    onSearch(fromDate, toDate, meterNo.trim())
  }

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Label htmlFor="fromDate" className="text-sm font-medium">
          From Date:
        </Label>
        <Input
          id="fromDate"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="w-auto"
        />
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="toDate" className="text-sm font-medium">
          To Date:
        </Label>
        <Input
          id="toDate"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="w-auto"
        />
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="meterNo" className="text-sm font-medium">
          Meter No:
        </Label>
        <Select value={meterNo} onValueChange={setMeterNo}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select meter" />
          </SelectTrigger>
          <SelectContent>
            {meters.map((meter) => (
              <SelectItem key={meter.meterid} value={String(meter.meterid)}>
                {meter.meterid}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSearch}>Show</Button>
    </div>
  )
}
