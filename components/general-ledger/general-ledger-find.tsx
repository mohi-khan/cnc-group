'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartOfAccount } from '@/utils/type'
import { getAllCoa } from '@/api/general-ledger-api'

interface GeneralLedgerFindProps {
  onSearch: (accountcode: number, fromdate: string, todate: string) => void
}

export default function GeneralLedgerFind({ onSearch }: GeneralLedgerFindProps) {
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [selectedAccountCode, setSelectedAccountCode] = useState<string>('')  // Changed to string
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([])

  async function fetchChartOfAccounts() {
    const fetchedAccounts = await getAllCoa()
    if (fetchedAccounts.error || !fetchedAccounts.data) {
      console.error('Error getting chart of accounts:', fetchedAccounts.error)
      toast({
        title: 'Error',
        description:
          fetchedAccounts.error?.message || 'Failed to get chart of accounts',
      })
    } else {
      setAccounts(fetchedAccounts.data)
    }
  }

  useEffect(() => {
    fetchChartOfAccounts()
  }, [])

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

    if (!selectedAccountCode) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an account',
      })
      return
    }

    // Convert selectedAccountCode back to number when passing to onSearch
    onSearch(Number(selectedAccountCode), fromDate, toDate)
  }

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">From Date:</span>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="px-3 py-2 border rounded-md"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">To Date:</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="px-3 py-2 border rounded-md"
        />
      </div>
      <Select
        value={selectedAccountCode}
        onValueChange={setSelectedAccountCode}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select account" />
        </SelectTrigger>
        <SelectContent>
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <SelectItem
                key={account.accountId}
                value={account.accountId.toString()}  // Convert number to string
              >
                {account.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="default" disabled>
              No accounts available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      <Button onClick={handleSearch}>Show</Button>
    </div>
  )
}