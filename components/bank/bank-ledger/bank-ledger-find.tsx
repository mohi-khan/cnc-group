'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

interface BankLedgerFindProps {
  onSearch: (fromDate: Date, toDate: Date) => void
}

export default function BankLedgerFind({ onSearch }: BankLedgerFindProps) {
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()

  const handleSearch = () => {
    if (!fromDate || !toDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both dates",
      })
      return
    }

    if (toDate < fromDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "To Date must be greater than From Date",
      })
      return
    }

    onSearch(fromDate, toDate)
  }

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">From Date:</span>
        <input
          type="date"
          value={fromDate ? fromDate.toISOString().split('T')[0] : ''}
          onChange={(e) => setFromDate(e.target.value ? new Date(e.target.value) : undefined)}
          className="px-3 py-2 border rounded-md"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">To Date:</span>
        <input
          type="date"
          value={toDate ? toDate.toISOString().split('T')[0] : ''}
          onChange={(e) => setToDate(e.target.value ? new Date(e.target.value) : undefined)}
          className="px-3 py-2 border rounded-md"
        />
      </div>
      <Button onClick={handleSearch}>Show</Button>
    </div>
  )
}

