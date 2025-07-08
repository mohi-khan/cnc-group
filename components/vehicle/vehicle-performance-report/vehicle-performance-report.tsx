'use client'

import React, { use, useEffect, useState } from 'react'
import VehiclePerformanceReportHeading from './vehicle-performance-report-Heading'
import { getAllVehicles } from '@/api/vehicle.api'
import { CostBreakdown, GetAllVehicleType, vehiclePerLitreCost } from '@/utils/type'
import VehiclePerformanceReportList from './vehicle-performance-table-list'
import { usePDF } from 'react-to-pdf'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { getVehiclePer } from '@/api/utility-vehicle-dashboard-api'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const VehiclePerformanceReport = () => {
  useInitializeUser()
  const router = useRouter()
  const [token] = useAtom(tokenAtom)
  const [vehicles, setVehicles] = useState<GetAllVehicleType[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const { toPDF, targetRef } = usePDF({
    filename: 'vehicle_performance_report.pdf',
  })
  const [vehiclePerformanceData, setVehiclePerformanceData] = useState<vehiclePerLitreCost[]>([])

  const generatePdf = () => {
    toPDF()
  }

  const exportToExcel = (data: vehiclePerLitreCost[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicle Performance')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  const flattenData = (data: vehiclePerLitreCost[]): CostBreakdown[] => {
    return data.map((item) => {
      const flattenedData: any = {
        year: item.year.toString(),
        month: item.month.toString(),
        gasConsumption: item.gasConsumption.toString(),
        octaneConsumption: item.octaneConsumption.toString(),
        kmrsperlitre: item.kmrsperlitre.toString()
      }

      if (item.costBreakdown) {
        Object.entries(item.costBreakdown).forEach(([key, value]) => {
          flattenedData[key] = value
        })
      }

      return flattenedData
    })
  }

  const generateExcel = () => {
    exportToExcel(vehiclePerformanceData, 'vehicle_performance_report')
  }

  const fetchVehiclePerformance = React.useCallback(async (vehicleId: string, start: string, end: string) => {
    if (!token || !vehicleId) return
    try {
      const response = await getVehiclePer(token, vehicleId)
      const vehicleData = { data: Array.isArray(response.data) ? response.data : [response.data] } as { data: vehiclePerLitreCost[] }
      console.log("Vehicle Performance Data:", vehicleData)
      
      // Filter data based on start and end dates
      const filteredData = vehicleData.data.filter(item => {
        const itemDate = new Date(item.year, item.month - 1);
        const startDateTime = new Date(start);
        const endDateTime = new Date(end);
        return itemDate >= startDateTime && itemDate <= endDateTime;
      });
      
      setVehiclePerformanceData(filteredData)
    } catch (error) {
      console.error("Error fetching vehicle performance data:", error)
      setVehiclePerformanceData([])
    }
  }, [token])

  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId)
    fetchVehiclePerformance(vehicleId, startDate, endDate)
  }

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
    if (selectedVehicleId) {
      fetchVehiclePerformance(selectedVehicleId, start, end)
    }
  }

  const fetchVehicles = React.useCallback(async () => {
    const vehicleData = await getAllVehicles(token)
    setVehicles(vehicleData.data || [])
    console.log('Show The Vehicle All Data :', vehicleData.data)
  }, [token])

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        console.log('No user data or token found in localStorage')
        router.push('/')
        return
      }
    }

    checkUserData()
    fetchVehicles()
  }, [fetchVehicles, router])

  return (
    <div>
      <VehiclePerformanceReportHeading
        vehicles={vehicles}
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        onVehicleChange={handleVehicleChange}
        selectedVehicleId={selectedVehicleId}
        onDateChange={handleDateChange}
        
      />
      <VehiclePerformanceReportList 
        targetRef={targetRef} 
        vehiclePerformanceData={vehiclePerformanceData}
      />
    </div>
  )
}

export default VehiclePerformanceReport
