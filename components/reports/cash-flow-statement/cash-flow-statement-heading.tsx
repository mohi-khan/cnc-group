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
import { format, subMonths } from 'date-fns'
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
              {/* Start Date Picker */}
              <div className="flex items-center gap-2">
                <span className="font-medium">Start Date:</span>
                <Popover
                  open={isStartPopoverOpen}
                  onOpenChange={setIsStartPopoverOpen}
                >
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
                        if (date) setStartDate(date)
                        setIsStartPopoverOpen(false)
                      }}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date Picker */}
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
                        if (date) setEndDate(date)
                        if (startDate && date) {
                          setIsDropdownOpen(false)
                        }
                      }}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
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
