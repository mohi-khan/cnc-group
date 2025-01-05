'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon, FileText } from 'lucide-react'
import { getAllBankAccounts } from '@/api/bank-accounts-api'
import { toast } from '@/hooks/use-toast'
import { BankAccount } from '@/utils/type'

export default function TrialBalanceHeading() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  async function fetchBankAccounts() {
    const fetchedAccounts = await getAllBankAccounts()
    if (fetchedAccounts.error || !fetchedAccounts.data) {
      console.error('Error getting bank account:', fetchedAccounts.error)
      toast({
        title: 'Error',
        description:
          fetchedAccounts.error?.message || 'Failed to get bank accounts',
      })
    } else {
      setAccounts(fetchedAccounts.data)
      if (fetchedAccounts.data.length > 0) {
        setSelectedAccountId(fetchedAccounts.data[0].id.toString())
      }
    }
  }

  useEffect(() => {
    fetchBankAccounts()
  }, [])

  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b w-full">
      {/* Export Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
        >
          <FileText className="h-4 w-4" />
          <span className="font-medium">PDF</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.5 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7.5L14.5 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2V8H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 13H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 17H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 9H8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-medium">Excel</span>
        </Button>
      </div>

      {/* Date and Company Selection */}
      <div className="flex items-center gap-4 flex-1 justify-center">
        {/* Date Select Box */}
        <Popover
          open={isDropdownOpen}
          onOpenChange={(open) => setIsDropdownOpen(open)}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[230px] h-10 justify-start text-left truncate"
            >
              <CalendarIcon className="mr-2 h-5 w-5" />
              {startDate && endDate
                ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
                : 'Select Date Range'}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-4" align="start">
            <div className="flex flex-col gap-4">
              {/* Start Date Field */}
              <div className="flex items-center gap-2">
                <span className="font-medium">Start Date:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-[180px] h-10 justify-start text-left truncate ${
                        !startDate ? 'text-muted-foreground' : ''
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {startDate
                        ? format(startDate, 'dd/MM/yyyy')
                        : 'Select Start Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date)
                        setIsDropdownOpen(false) // Close the popover when a date is selected
                      }}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date Field */}
              <div className="flex items-center gap-2">
                <span className="font-medium">End Date:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-[180px] h-10 justify-start text-left truncate ${
                        !endDate ? 'text-muted-foreground' : ''
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {endDate
                        ? format(endDate, 'dd/MM/yyyy')
                        : 'Select End Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date)
                        setIsDropdownOpen(false) // Close the popover when a date is selected
                      }}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Company Selection */}
        <Select
          value={selectedAccountId}
          onValueChange={(value) => setSelectedAccountId(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a bank account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id.toString()}>
                {account.accountName}-{account.accountNumber}-{account.bankName}
                -{account.branchName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty div for flex spacing */}
      <div className="w-[100px]" />
    </div>
  )
}
