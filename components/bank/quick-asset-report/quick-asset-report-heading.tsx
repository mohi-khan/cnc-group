'use client'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

import type { CompanyType } from '@/api/company-api'

interface QuickAssetReportHeadingProps {
  startDate: string
  endDate: string
  selectedCompanyIds: string[]
  companies: CompanyType[]
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onCompanyIdsChange: (ids: string[]) => void
  onRefresh: () => void
}

const QuickAssetReportHeading = ({
  startDate,
  endDate,
  selectedCompanyIds,
  companies,
  onStartDateChange,
  onEndDateChange,
  onCompanyIdsChange,
  onRefresh,
}: QuickAssetReportHeadingProps) => {
  const handleCompanySelect = (companyId: string) => {
    if (!selectedCompanyIds.includes(companyId)) {
      onCompanyIdsChange([...selectedCompanyIds, companyId])
    }
  }

  const handleCompanyRemove = (companyId: string) => {
    onCompanyIdsChange(selectedCompanyIds.filter((id) => id !== companyId))
  }

  const handleClearAll = () => {
    onCompanyIdsChange([])
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Quick Asset Report
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <Label
            htmlFor="startDate"
            className="text-sm font-medium text-gray-700"
          >
            Start Date
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="endDate"
            className="text-sm font-medium text-gray-700"
          >
            End Date
          </Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Filter by Company
          </Label>
          <Select onValueChange={handleCompanySelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select company..." />
            </SelectTrigger>
            <SelectContent>
              {companies
                .filter(
                  (company) =>
                    !selectedCompanyIds.includes(
                      company.companyId?.toString() || ''
                    )
                )
                .map((company) => (
                  <SelectItem
                    key={company.companyId}
                    value={company.companyId?.toString() || ''}
                  >
                    {company.companyName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* <div className="space-y-2">
          <Button onClick={onRefresh} className="w-full">
            Refresh Data
          </Button>
        </div> */}
      </div>

      {selectedCompanyIds.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              Selected Companies ({selectedCompanyIds.length})
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-xs bg-transparent"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCompanyIds.map((companyId) => {
              const company = companies.find(
                (c) => c.companyId?.toString() === companyId
              )
              return (
                <div
                  key={companyId}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                >
                  <span>{company?.companyName || `Company ${companyId}`}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCompanyRemove(companyId)}
                    className="h-4 w-4 p-0 hover:bg-blue-200"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default QuickAssetReportHeading
