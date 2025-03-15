'use client'
import React, { useEffect, useState } from 'react'
import VehicleSummaryHeading from './vehicle-summary-heading'
import VehicleSummaryTableList from './vehicle-summary-table-list'
import { GetAllVehicleType, VehicleSummaryType } from '@/utils/type'
import { getAllVehicles } from '@/api/vehicle.api'
import { getVehicleSummery } from '@/api/vehicle-summary-api'
import { toast } from '@/hooks/use-toast'

const VehicleSummary = () => {
  const [vehicles, setVehicles] = useState<GetAllVehicleType[]>([])
  const [token, setToken] = useState<string | null>(null)
  const [vehicleSummary, setVehicleSummary] = useState<VehicleSummaryType[]>([])
  // Retrieve token from localStorage safely
  useEffect(() => {
    const mainToken = localStorage.getItem('authToken')
    if (mainToken) {
      setToken(`Bearer ${mainToken}`)
      console.log('🚀 ~ create budget token:', mainToken)
    }
  }, [])

  // Fetch all vehicles
  const fetchVehicles = async () => {
    try {
      const vehicleData = await getAllVehicles()
      setVehicles(vehicleData.data || [])
      console.log('Show The Vehicle All Data :', vehicleData.data)
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    }
  }

  async function fetchGetVehicleSummary(token: string) {
    try {
      const response = await getVehicleSummery({
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        vehicleNo: 1,
        token,
      })
      if (!response.data) throw new Error('No data received')
      setVehicleSummary(response.data)
      console.log('Vehicle Summary data : ', response.data)
    } catch (error) {
      console.error('Error getting Vehicle Summary:', error)
      toast({
        title: 'Error',
        description: 'Failed to load Vehicle Summary',
      })
      setVehicleSummary([])
    }
  }

  useEffect(() => {
    if (token) {
      fetchGetVehicleSummary(token)
      fetchVehicles()
    }
  }, [token])

  return (
    <div>
      <VehicleSummaryHeading vehicles={vehicles} />
      <VehicleSummaryTableList />
    </div>
  )
}

export default VehicleSummary
