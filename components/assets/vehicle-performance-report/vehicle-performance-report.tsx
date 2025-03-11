'use client'

import React, { use, useEffect, useState } from 'react'
import VehiclePerformanceReportHeading from './vehicle-performance-report-Heading'
import { getAllVehicles } from '@/api/vehicle.api'
import { GetAllVehicleType } from '@/utils/type'

import VehiclePerformanceReportList from './vehicle-performance-table-list'
import { usePDF } from 'react-to-pdf'

const VehiclePerformanceReport = () => {
  const [vehicles, setVehicles] = useState<GetAllVehicleType[]>([])
  const { toPDF, targetRef } = usePDF({ filename: 'vehicle_performance_report.pdf' })
  

  const generatePdf = () => {
    toPDF()
  }



  // Fetch all vehicles data
  const fetchVehicles = async () => {
    const vehicleData = await getAllVehicles()
    setVehicles(vehicleData.data || [])
    console.log('Show The Vehicle All Data :', vehicleData.data)
  }

  

  useEffect(() => {
    fetchVehicles()
  
  }, [])

  return (
    <div>
      <VehiclePerformanceReportHeading vehicles={vehicles}
       generatePdf={generatePdf}
      />
      <VehiclePerformanceReportList 
      targetRef={targetRef}
      />
    </div>
  )
}

export default VehiclePerformanceReport
