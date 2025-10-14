'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { CalendarIcon, FileText, Loader2 } from 'lucide-react'
import type { CompanyFromLocalstorage, User } from '@/utils/type'
import { useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { format, parseISO, subMonths } from 'date-fns'

interface TrialBalanceHeadingProps {
  generatePdf: () => void
  generateExcel: () => void
  onFilterChange: (
    startDate: Date | undefined,
    endDate: Date | undefined,
    companyId: string,
    companyName: string
  ) => void
  isGeneratingPdf?: boolean
}

export default function TrialBalanceHeading({
  generatePdf,
  generateExcel,
  onFilterChange,
  isGeneratingPdf = false,
}: TrialBalanceHeadingProps) {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)

  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (userData) {
      setUser(userData)
      setCompanies(userData.userCompanies)
    }
  }, [userData])

  useEffect(() => {
    const selectedCompany = companies.find(
      (company) => company.company.companyId?.toString() === selectedCompanyId
    )
    const companyName = selectedCompany?.company.companyName || ''
    onFilterChange(startDate, endDate, selectedCompanyId, companyName)
  }, [startDate, endDate, selectedCompanyId, onFilterChange, companies])

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
      {/* === PDF & Excel Buttons === */}
      <div className="flex items-center gap-2">
        <Button
          onClick={generatePdf}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
          disabled={isGeneratingPdf}
        >
          {isGeneratingPdf ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          <span className="font-medium">
            {isGeneratingPdf ? 'Generating...' : 'PDF'}
          </span>
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
              d="M14.5 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.7893 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7.5L14.5 2Z"
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

      {/* === Date Range & Company Selector === */}
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






