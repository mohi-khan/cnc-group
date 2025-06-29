'use client'

import React, { use, useEffect, useState } from 'react'
import VehiclePerformanceReportHeading from './vehicle-performance-report-Heading'
import { getAllVehicles } from '@/api/vehicle.api'
import { GetAllVehicleType } from '@/utils/type'

import VehiclePerformanceReportList from './vehicle-performance-table-list'
import { usePDF } from 'react-to-pdf'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const VehiclePerformanceReport = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const router = useRouter()
  const [token] = useAtom(tokenAtom)
  const [vehicles, setVehicles] = useState<GetAllVehicleType[]>([])
  const { toPDF, targetRef } = usePDF({
    filename: 'vehicle_performance_report.pdf',
  })

  const generatePdf = () => {
    toPDF()
  }

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

    checkUserData()
    fetchVehicles()
  }, [fetchVehicles, router])

  return (
    <div>
      <VehiclePerformanceReportHeading
        vehicles={vehicles}
        generatePdf={generatePdf}
      />
      <VehiclePerformanceReportList targetRef={targetRef} />
    </div>
  )
}

export default VehiclePerformanceReport
