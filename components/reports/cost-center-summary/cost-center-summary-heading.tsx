'use client'
import React, { useEffect, useState, useCallback } from 'react'
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
import { CalendarIcon, FileText } from 'lucide-react'

import {
  Company,
  CompanyFromLocalstorage,
  CostCenter,
  User,
} from '@/utils/type'
import { getAllCompanies, getAllCostCenters } from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

interface CostCenterSummaryHeadingProps {
  generatePdf: () => void
  generateExcel: () => void
  onFilterChange: (
    startDate: Date | undefined,
    endDate: Date | undefined,
    costCenterIds: string,
    companyId: string
  ) => void
}

const CostCenterSummaryHeading = ({
  generatePdf,
  generateExcel,
  onFilterChange,
}: CostCenterSummaryHeadingProps) => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  // State variables
  const [startDate, setStartDate] = useState<Date>(
    subMonths(new Date(), 1) // Previous month's today
  )
  const [endDate, setEndDate] = useState<Date>(new Date()) // Today's date
  const [isStartPopoverOpen, setIsStartPopoverOpen] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [selectedCostCenterIds, setSelectedCostCenterIds] = useState<string[]>(
    []
  )
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [costCenterData, setCostCenterData] = useState<CostCenter[]>([])

  // getting userData from local storage
  useEffect(() => {
    if (userData) {
      setUser(userData)
      setCompanies(userData.userCompanies)
    } else {
      console.log('No user data found in localStorage')
    }
  }, [userData])

  // Fetch all cost center data
  const fetchAllCostCenter = useCallback(async () => {
    if (!token) return
    const respons = await getAllCostCenters(token)
    setCostCenterData(respons.data || [])
    console.log('This is all cost center data: ', respons.data || [])
  }, [token])
  useEffect(() => {
    fetchAllCostCenter()
  }, [fetchAllCostCenter])

  useEffect(() => {
    onFilterChange(
      startDate,
      endDate,
      selectedCompanyId,
      selectedCostCenterIds.join(',')
    )
  }, [
    startDate,
    endDate,
    selectedCompanyId,
    selectedCostCenterIds,
    onFilterChange,
  ])

  const handleCostCenterSelect = (costCenterId: string) => {
    setSelectedCostCenterIds((prev) => {
      if (prev.includes(costCenterId)) {
        return prev.filter((id) => id !== costCenterId)
      } else {
        return [...prev, costCenterId]
      }
    })
  }

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

          {/* selected company start here */}
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

          {/* selected cost center start here */}
          <Select
            value={selectedCostCenterIds.join(',')}
            onValueChange={(value) => handleCostCenterSelect(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select cost centers">
                {selectedCostCenterIds.length > 0
                  ? `${selectedCostCenterIds.length} selected`
                  : 'Select cost centers'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {costCenterData?.map((costCenter) => (
                <SelectItem
                  key={costCenter.costCenterId}
                  value={costCenter.costCenterId.toString()}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCostCenterIds.includes(
                        costCenter.costCenterId.toString()
                      )}
                      onChange={() =>
                        handleCostCenterSelect(
                          costCenter.costCenterId.toString()
                        )
                      }
                      className="mr-2"
                    />
                    {costCenter.costCenterName}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* selected cost center End here */}
        </div>

        <div className="w-[100px]" />
      </div>
    </div>
  )
}

export default CostCenterSummaryHeading
