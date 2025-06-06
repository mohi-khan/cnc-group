'use client'
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
import { Button } from '@/components/ui/button'
import { CalendarIcon, FileText } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Company, CompanyFromLocalstorage, User } from '@/utils/type'
import { useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { getAllCompanies } from '@/api/common-shared-api'

interface CashPositonHeadingProps {
  generatePdf: () => void
  generateExcel: () => void
  onFilterChange: (
    startDate: Date | undefined,
    endDate: Date | undefined,
    selectedCompanyName: string
  ) => void
}

const CashPositonHeading = ({
  generatePdf,
  generateExcel,
  onFilterChange,
}: CashPositonHeadingProps) => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)

  // State variables
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isStartPopoverOpen, setIsStartPopoverOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  // Now store the selected company name instead of companyId
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('')

  // getting userData from local storage
  useEffect(() => {
    if (userData) {
      setUser(userData)
      setCompanies(userData.userCompanies)
    } else {
      console.log('No user data found in localStorage')
    }
  }, [userData])

  // Whenever the start date, end date, or selected company name changes, pass the new filters upward.
  useEffect(() => {
    onFilterChange(startDate, endDate, selectedCompanyName)
  }, [startDate, endDate, selectedCompanyName, onFilterChange])

  return (
    <div>
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
        <div className="flex items-center gap-4 flex-1 justify-center">
          <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[230px] h-10 justify-start text-left truncate"
                onClick={() => setIsDropdownOpen(true)}
              >
                <CalendarIcon className="mr-2 h-5 w-5" />
                {startDate && endDate
                  ? `${format(startDate, 'dd/MM/yyyy')} - ${format(
                      endDate,
                      'dd/MM/yyyy'
                    )}`
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
                          setStartDate(date)
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
                          setEndDate(date)
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
            value={selectedCompanyName}
            onValueChange={(value) => setSelectedCompanyName(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                // Use companyName as the select value for filtering
                <SelectItem key={company.company.companyId} value={company.company.companyName}>
                  {company.company.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export default CashPositonHeading
