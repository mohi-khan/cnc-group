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
 import { format, parseISO, subMonths } from 'date-fns'
import { CalendarIcon, File, FileText } from 'lucide-react'
import type { CompanyFromLocalstorage, User } from '@/utils/type'
import { useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'

interface CashFlowStatementHeadingProps {
  generatePdf: () => void
  generateExcel: () => void
  onFilterChange: (
    startDate: Date | undefined,
    endDate: Date | undefined,
    companyId: string
  ) => void
}

export default function TrialBalanceHeading({
  generatePdf,
  generateExcel,
  onFilterChange,
}: CashFlowStatementHeadingProps) {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)

  // State variables
  const [startDate, setStartDate] = useState<Date>(
    subMonths(new Date(), 1) // Previous month's today
  )
  const [endDate, setEndDate] = useState<Date>(new Date()) // Today's date
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isStartPopoverOpen, setIsStartPopoverOpen] = useState(false)
 

  // getting userData from local storage
  useEffect(() => {
    if (userData) {
      setUser(userData)
      setCompanies(userData.userCompanies)
    } else {
    }
  }, [userData])

  useEffect(() => {
    onFilterChange(startDate, endDate, selectedCompanyId)
  }, [startDate, endDate, selectedCompanyId, onFilterChange])

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = e.target.value ? parseISO(e.target.value) : undefined
      if (date) setStartDate(date)
  }
  
   const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = e.target.value ? parseISO(e.target.value) : undefined
      if (date) {
        setEndDate(date)
        // Close the main date popover after selecting or typing end date
        setIsDropdownOpen(false)
      }
    }

  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b w-full">
      <div className="flex items-center gap-2">
        <Button
          onClick={generatePdf}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
        >
          <FileText className="h-4 w-4" />
          <span className="font-medium">PDF</span>
        </Button>
        <Button
          onClick={generateExcel}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
        >
          <File />
          <span className="font-medium">Excel</span>
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-1 justify-center">
        <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[230px] h-10 justify-start text-left truncate bg-transparent"
              onClick={() => setIsDropdownOpen(true)}
            >
              <CalendarIcon className="mr-2 h-5 w-5" />
              {startDate && endDate
                ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
                : 'Select Date Range'}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-4" align="start">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Start Date:</span>
                <input
                  type="date"
                  value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                  onChange={handleStartDateChange}
                  className="border rounded-md px-2 py-1 w-[180px] h-10"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">End Date:</span>
                <input
                  type="date"
                  value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                  onChange={handleEndDateChange}
                  className="border rounded-md px-2 py-1 w-[180px] h-10"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Select
          value={selectedCompanyId}
          onValueChange={(value) => setSelectedCompanyId(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem
                key={company.company.companyId}
                value={company.company.companyId?.toString() ?? ''}
              >
                {company.company.companyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[100px]" />
    </div>
  )
}
