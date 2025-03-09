'use client'
import React, { useEffect, useState } from 'react'
import VehicleFuelConsumptionList from './vehicle-fuel-consumption-list'
import VehicleFuelConsumptionPopUp from './vehicle-fuel-consumption-popup'
import { getAllVehicleFuelConsumpiton } from '@/api/vehicle-fuel-consumption-api'
import { GetAllVehicleType, GetVehicleConsumptionType } from '@/utils/type'
import { getAllVehicles } from '@/api/vehicle'
// Define the type for vehicle data
export interface Vehicle {
  id: number
  name: string
}

const VehicleFuelConsumption = () => {
  const [vehicleFuel, setVehicleFuel] = useState<GetVehicleConsumptionType[]>(
    []
  )
    const [isOpen, setIsOpen] = useState(false)
      const [vehicles, setVehicles] = useState<GetAllVehicleType[]>([])
      const [loading, setLoading] = useState<boolean>(true)

  const handleAddVehicle = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }
  // Fetch all vehicle fuel consumption
  const fetchVehicleFuelConsumptionData = async () => {
    try {
      const vehicleData = await getAllVehicleFuelConsumpiton()
      setVehicleFuel(vehicleData.data || [])
      console.log(
        'Show The Vehicle Fuel Consumption All Data :',
        vehicleData.data
      )
    } catch (error) {
      console.error('Failed to fetch Vehicle Fuel Consumption:', error)
    }
  }

  useEffect(() => {
    fetchVehicleFuelConsumptionData()
    fetchVehicles()
  }, [])
    
    
   
        // Fetch the vehicle data from API
        const fetchVehicles = async () => {
          try {
            const response = await getAllVehicles()
            const data: GetAllVehicleType[] = response.data ?? []
            setVehicles(data)
            setLoading(false)
          } catch (error) {
            console.error('Failed to fetch vehicles:', error)
            setLoading(false)
          }
        }
    
       
  return (
    <div>
      <VehicleFuelConsumptionList
        vehicleFuel={vehicleFuel}
        onAddVehicle={handleAddVehicle}
        vehicles={vehicles}
      />
      <VehicleFuelConsumptionPopUp
        vehicles={vehicles}
        loading={loading}
        isOpen={isOpen}
        onClose={handleClose}
        refreshFuelData={fetchVehicleFuelConsumptionData}
        vehicleId={null} // Replace with the appropriate vehicleId if available
      />
    </div>
  )
}

export default VehicleFuelConsumption


