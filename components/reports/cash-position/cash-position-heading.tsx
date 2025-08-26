
'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { CompanyFromLocalstorage, User } from '@/utils/type'
import { useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'

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
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)

  const [startDate, setStartDate] = useState<Date>()
  const [user, setUser] = useState<User | null>(null)
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('')

  useEffect(() => {
    if (userData) {
      setUser(userData)
      setCompanies(userData.userCompanies)
    }
  }, [userData])

  useEffect(() => {
    onFilterChange(startDate, undefined, selectedCompanyName)
  }, [startDate, selectedCompanyName, onFilterChange])

  return (
    <div>
      <div className="flex items-center justify-between gap-4 p-4 border-b w-full">
        {/* Export Buttons */}
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

        {/* Date + Company Filter */}
        <div className="flex items-center gap-4 flex-1 justify-center">
          {/* Normal Date Picker */}
          <input
            type="date"
            className="border rounded-md px-3 py-2 w-[220px]"
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
            onChange={(e) =>
              setStartDate(e.target.value ? new Date(e.target.value) : undefined)
            }
          />

          {/* Company Dropdown */}
          <Select
            value={selectedCompanyName}
            onValueChange={(value) => setSelectedCompanyName(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem
                  key={company.company.companyId}
                  value={company.company.companyName}
                >
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
