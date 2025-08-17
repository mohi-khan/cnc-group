'use client'
import React from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon, FileText } from 'lucide-react'
import { GetAllVehicleType } from '@/utils/type'
import { CustomCombobox } from '@/utils/custom-combobox'

interface VehiclePerformanceReportHeadingProps {
  vehicles: GetAllVehicleType[]
  generatePdf: () => void
  onVehicleChange?: (vehicleId: string) => void
  selectedVehicleId?: string
  generateExcel: () => void
  onDateChange?: (start: string, end: string) => void
}

const VehiclePerformanceReportHeading: React.FC<
  VehiclePerformanceReportHeadingProps
> = ({
  vehicles,
  generatePdf,
  onVehicleChange,
  selectedVehicleId: propSelectedVehicleId,
  generateExcel,
  onDateChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isShowData, setIsShowData] = useState<boolean>(false)

  useEffect(() => {
    if (startDate && endDate && propSelectedVehicleId) {
      setIsShowData(true)
    }
  }, [startDate, endDate, propSelectedVehicleId])

  useEffect(() => {
    if (startDate && endDate && onDateChange) {
      onDateChange(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      )
    }
  }, [startDate, endDate, onDateChange])

  return (
    <div className="mt-4">
      <div className="p-4 border-b w-full">
        <div className="flex items-center justify-between">
          {/* PDF Button */}
          <div>
            <Button
              onClick={generatePdf}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">PDF</span>
            </Button>
          </div>

          {/* Date & Vehicle */}
          <div className="flex items-center gap-4">
            <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[230px] h-10 justify-start text-left truncate"
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
                  <input
                    type="date"
                    value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      setStartDate(new Date(e.target.value))
                    }}
                    className="w-full p-2 border rounded"
                  />

                  <input
                    type="date"
                    value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      setEndDate(new Date(e.target.value))
                    }}
                    className="w-full p-2 border rounded"
                  />

                  {/* Apply Button */}
                  <Button
                    onClick={() => setIsDropdownOpen(false)}
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Vehicle Combobox */}
            <CustomCombobox
              items={vehicles.map((vehicle) => ({
                id: vehicle.vehicleNo.toString(),
                name: vehicle.description || 'Unnamed Vehicle',
              }))}
              value={
                propSelectedVehicleId
                  ? {
                      id: propSelectedVehicleId,
                      name:
                        vehicles.find(
                          (vehicle) =>
                            vehicle.vehicleNo.toString() ===
                            propSelectedVehicleId
                        )?.description || 'Unnamed Vehicle',
                    }
                  : null
              }
              onChange={(value: { id: string; name: string } | null) => {
                if (onVehicleChange) {
                  onVehicleChange(value ? value.id : '')
                }
              }}
              placeholder="Select a Vehicle"
            />
          </div>

          {/* Excel Button */}
          <div>
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
        </div>
      </div>

      {/* Show Selected Data */}
      {isShowData && propSelectedVehicleId && startDate && endDate && (
        <div className="mt-4">
          <div className="flex justify-between items-center mx-4">
            <div className="flex items-center space-x-2">
              <span className="font-bold">Vehicle Name:</span>
              <span>
                {vehicles.find(
                  (v) => v.vehicleNo.toString() === propSelectedVehicleId
                )?.description || 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold">Current User:</span>
              <span>
                {vehicles.find(
                  (v) => v.vehicleNo.toString() === propSelectedVehicleId
                )?.employeeName || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VehiclePerformanceReportHeading
