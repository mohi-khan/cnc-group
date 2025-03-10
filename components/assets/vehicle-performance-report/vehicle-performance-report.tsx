'use client'

import React, { use, useEffect, useState } from 'react'
import VehiclePerformanceReportHeading from './vehicle-performance-report-Heading'
import { getAllVehicles } from '@/api/vehicle.api'
import { Employee, GetAllVehicleType } from '@/utils/type'
import { getEmployee } from '@/api/iou-api'
import VehiclePerformanceReportList from './vehicle-performance-table-list'

const VehiclePerformanceReport = () => {
  const [vehicles, setVehicles] = useState<GetAllVehicleType[]>([])
  const [employeeData, setEmployeeData] = useState<Employee[]>([])

  // Fetch all vehicles data
  const fetchVehicles = async () => {
    const vehicleData = await getAllVehicles()
    setVehicles(vehicleData.data || [])
    console.log('Show The Vehicle All Data :', vehicleData.data)
  }

  const fetchEmployeeData = async () => {
    const employees = await getEmployee()
    if (employees.data) {
      setEmployeeData(employees.data)
    } else {
      setEmployeeData([])
    }
    console.log('Show The Employee Data report :', employees.data)
  }

  useEffect(() => {
    fetchVehicles()
    fetchEmployeeData()
  }, [])

  return (
    <div>
      <VehiclePerformanceReportHeading vehicles={vehicles} />
      <VehiclePerformanceReportList />
    </div>
  )
}

export default VehiclePerformanceReport
