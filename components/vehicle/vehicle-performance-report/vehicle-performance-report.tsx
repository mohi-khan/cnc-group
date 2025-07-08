'use client'

import React, { use, useEffect, useState } from 'react'
import VehiclePerformanceReportHeading from './vehicle-performance-report-Heading'
import { getAllVehicles } from '@/api/vehicle.api'
import { GetAllVehicleType, vehiclePerLitreCost } from '@/utils/type'

import VehiclePerformanceReportList from './vehicle-performance-table-list'
import { usePDF } from 'react-to-pdf'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { getVehiclePer } from '@/api/utility-vehicle-dashboard-api'

const VehiclePerformanceReport = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const router = useRouter()
  const [token] = useAtom(tokenAtom)
  const [vehicles, setVehicles] = useState<GetAllVehicleType[]>([])
  const { toPDF, targetRef } = usePDF({
    filename: 'vehicle_performance_report.pdf',
  })
    const [vehiclePerformanceData, setVehiclePerformanceData] = useState<vehiclePerLitreCost[]>([])

  const generatePdf = () => {
    toPDF()
  }

   const fetchVehiclePerformance = React.useCallback(async () => {
      if (!token) return
      try {
        const response = await getVehiclePer(token, '') // Passing empty string instead of null
        const vehicleData = { data: Array.isArray(response.data) ? response.data : [response.data] } as { data: vehiclePerLitreCost[] }
  
        // Log the data to debug
        console.log("Vehicle Performance Data:", vehicleData)
  
        setVehiclePerformanceData(vehicleData.data)
      } catch (error) {
        console.error("Error fetching vehicle performance data:", error)
        setVehiclePerformanceData([])
      }
    }, [token])
  

  // Fetch all vehicles data
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

    fetchVehiclePerformance() // Fetch performance data for all vehicles
    checkUserData()
    fetchVehicles()
  }, [fetchVehicles, router, fetchVehiclePerformance])

  return (
    <div>
      <VehiclePerformanceReportHeading
        vehicles={vehicles}
        generatePdf={generatePdf}
      />
      <VehiclePerformanceReportList targetRef={targetRef} 
vehiclePerformanceData={vehiclePerformanceData}
      />
    </div>
  )
}

export default VehiclePerformanceReport
