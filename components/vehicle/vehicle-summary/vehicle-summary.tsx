'use client'

import React, { useEffect, useState } from 'react'
import VehicleSummaryHeading from './vehicle-summary-heading'
import VehicleSummaryTableList from './vehicle-summary-table-list'
import { GetAllVehicleType, VehicleSummaryType } from '@/utils/type'
import { getAllVehicles } from '@/api/vehicle.api'
import { getVehicleSummary } from '@/api/vehicle-summary-api'
import { toast } from '@/hooks/use-toast'
import { usePDF } from 'react-to-pdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const VehicleSummary = () => {
  const [vehicles, setVehicles] = useState<GetAllVehicleType[]>([])
  const [token, setToken] = useState<string | null>(null)
  const [vehicleSummary, setVehicleSummary] = useState<VehicleSummaryType[]>([])
  const [startDate, setStartDate] = useState<Date>(new Date('2023-01-01')) // Default start date
  const [endDate, setEndDate] = useState<Date>(new Date('2025-12-31')) // Default end date
  const [selectedVehicleNo, setSelectedVehicleNo] = useState<number>(1) // Default vehicle number

  const { toPDF, targetRef } = usePDF({ filename: 'vehicle_summary.pdf' })

  // Retrieve token from localStorage safely
  useEffect(() => {
    const mainToken = localStorage.getItem('authToken')
    if (mainToken) {
      setToken(`Bearer ${mainToken}`)
      console.log('🚀 ~ vehicle summary token:', mainToken)
    }
  }, [])

  // Fetch all vehicles
  const fetchVehicles = async () => {
    try {
      const vehicleData = await getAllVehicles()
      setVehicles(vehicleData.data || [])
      console.log('Show The Vehicle All Data:', vehicleData.data)
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    }
  }

  // Fetch Vehicle Summary Data
  const fetchGetVehicleSummary = async ({
    token,
    startDate,
    endDate,
    vehicleNo,
  }: {
    token: string
    startDate: Date
    endDate: Date
    vehicleNo: number
  }) => {
    try {
      const response = await getVehicleSummary({ 
        startDate: startDate.toISOString().split('T')[0], 
        endDate: endDate.toISOString().split('T')[0], 
        vehicleNo, 
        token 
      })
      if (!response.data) throw new Error('No data received')

      setVehicleSummary(response.data)
      console.log('✅ Vehicle Summary data:', response.data)
    } catch (error) {
      console.error('❌ Error getting Vehicle Summary:', error)
      toast({
        title: 'Error',
        description: 'Failed to load Vehicle Summary',
      })
      setVehicleSummary([])
    }
  }

  // Fetch data when token is available
  useEffect(() => {
    if (token) {
      fetchGetVehicleSummary({ token, startDate, endDate, vehicleNo: selectedVehicleNo })
      fetchVehicles()
    }
  }, [token, selectedVehicleNo, startDate, endDate])

  // Generate PDF
  const generatePdf = () => {
    toPDF()
  }

  // Generate Excel
  const generateExcel = () => {
    if (!vehicleSummary || vehicleSummary.length === 0) {
      toast({
        title: 'Warning',
        description: 'No data available to export',
      })
      return
    }
    exportToExcel(vehicleSummary, 'vehicle-summary')
  }

  // Export to Excel Function
  const exportToExcel = (data: VehicleSummaryType[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'vehicle_summary')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  // Flatten Data for Excel
  const flattenData = (data: VehicleSummaryType[]): any[] => {
    return data.map((item) => ({
      VehicleName: item.vehicleNo,
      Total_Octane_Consumption: item.total_oct_consumption || 0,
      Total_Gas_Consumption: item.total_gas_consumption || 0,
      Total_KM: item.total_km || 0,
    }))
  }

  return (
    <div>
      <VehicleSummaryHeading
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        vehicles={vehicles}
        startDate={startDate}
        endDate={endDate}
        selectedVehicleNo={selectedVehicleNo}
      />
      <VehicleSummaryTableList
        targetRef={targetRef}
        vehicles={vehicles}
        vehicleSummary={
          vehicleSummary as unknown as {
            month: number
            year: number
            pivotData: VehicleSummaryType[][]
          }[]
        }
      />
    </div>
  )
}

export default VehicleSummary
