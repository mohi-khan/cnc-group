'use client'

import React, { useCallback, useEffect, useState } from 'react'
import VehicleSummaryHeading from './vehicle-summary-heading'
import VehicleSummaryTableList from './vehicle-summary-table-list'
import { GetAllVehicleType, VehicleSummaryType } from '@/utils/type'
import { getAllVehicles } from '@/api/vehicle.api'
import { getVehicleSummary } from '@/api/vehicle-summary-api'
import { toast } from '@/hooks/use-toast'
import { usePDF } from 'react-to-pdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const VehicleSummary = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const router = useRouter()

  const [token] = useAtom(tokenAtom)
  const [vehicles, setVehicles] = useState<GetAllVehicleType[]>([])
  // const [token, setToken] = useState<string | null>(null)
  const [vehicleSummary, setVehicleSummary] = useState<VehicleSummaryType[]>([])
  const [startDate, setStartDate] = useState<Date>(new Date('2023-01-01')) // Default start date
  const [endDate, setEndDate] = useState<Date>(new Date('2025-12-31')) // Default end date
  const [selectedVehicleNo, setSelectedVehicleNo] = useState<number>(1) // Default vehicle number

  const { toPDF, targetRef } = usePDF({ filename: 'vehicle_summary.pdf' })

  // Retrieve token from localStorage safely
  // useEffect(() => {
  //   const mainToken = localStorage.getItem('authToken')
  //   if (mainToken) {
  //     setToken(`Bearer ${mainToken}`)
  //     console.log('🚀 ~ vehicle summary token:', mainToken)
  //   }
  // }, [])

  // Fetch all vehicles
  const fetchVehicles = useCallback(async () => {
    const vehicleData = await getAllVehicles(token)
    setVehicles(vehicleData.data || [])
    console.log('Show The Vehicle All Data:', vehicleData.data)
  }, [token])
  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])
  // Fetch Vehicle Summary Data
  const fetchGetVehicleSummary = useCallback(
    async ({
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
      const response = await getVehicleSummary({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        vehicleNo,
        token,
      })
      if (!response.data) throw new Error('No data received')

      setVehicleSummary(response.data)
      console.log('✅ Vehicle Summary data:', response.data)
    },
    []
  )

  // Fetch data when token is available
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
    if (token) {
      fetchGetVehicleSummary({
        token,
        startDate,
        endDate,
        vehicleNo: selectedVehicleNo,
      })
      fetchVehicles()
    }
  }, [
    token,
    selectedVehicleNo,
    startDate,
    endDate,
    fetchGetVehicleSummary,
    fetchVehicles,
    router,
  ])

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
