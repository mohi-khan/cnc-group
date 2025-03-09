'use client'
import React from 'react'

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
import { CalendarIcon } from 'lucide-react'

const VehiclePerformanceReportHeading = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  return (
    <div className="mt-4">
      <div className="flex items-center gap-4 flex-1 justify-center">
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
                        setIsDropdownOpen(false)
                      }}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>

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
                        setIsDropdownOpen(false)
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
            <SelectValue placeholder="Select a Vehicle" />
          </SelectTrigger>
          <SelectContent>
            {/* {companies.map((company) => (
              <SelectItem
                key={company.companyId}
                value={company.companyId.toString()}
              >
                {company.companyName}
              </SelectItem>
            ))} */}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default VehiclePerformanceReportHeading
