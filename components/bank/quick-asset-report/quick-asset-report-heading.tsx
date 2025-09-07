


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
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Quick Asset Report
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
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
          <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
            End Date
          </Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>

        
      </div>
    </div>
  )
}

export default QuickAssetReportHeading
