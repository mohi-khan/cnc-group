import React from 'react'
import { Button } from '@/components/ui/button'
import { File, FileText, Search } from 'lucide-react'

interface Props {
  date: string
  onDateChange: (newDate: string) => void
  generatePdf: () => void
  generateExcel: () => void
  employeeSearch?: string
  onEmployeeSearchChange?: (value: string) => void
}

const IouReportHeading: React.FC<Props> = ({
  date,
  onDateChange,
  generatePdf,
  generateExcel,
  employeeSearch = '',
  onEmployeeSearchChange,
}) => {
  return (
    <div className="flex flex-col items-center justify-center mb-6 w-full">
      <div className="flex items-center justify-between w-full mb-4">
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
            <File className="h-4 w-4" />
            <span className="font-medium">Excel</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="dateInput" className="font-medium">
            Date
          </label>
          <input
            id="dateInput"
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="border rounded px-3 py-2 text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="w-[100px]" />
      </div>

      <h2 className="text-xl font-semibold">
        IOU Report for : <span className="text-blue-600">{date}</span>
      </h2>

      <div className="flex items-center gap-2 mt-3 self-start">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search employee..."
            value={employeeSearch}
            onChange={(e) => onEmployeeSearchChange?.(e.target.value)}
            className="border rounded pl-9 pr-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
          />
        </div>
      </div>
    </div>
  )
}

export default IouReportHeading

