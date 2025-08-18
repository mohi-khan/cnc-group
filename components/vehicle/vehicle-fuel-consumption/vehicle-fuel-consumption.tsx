'use client'
import React, { useEffect, useState, useCallback } from 'react'
import VehicleFuelConsumptionList from './vehicle-fuel-consumption-list'
import VehicleFuelConsumptionPopUp from './vehicle-fuel-consumption-popup'
import { getAllVehicleFuelConsumpiton } from '@/api/vehicle-fuel-consumption-api'
import { GetAllVehicleType, GetVehicleConsumptionType } from '@/utils/type'
import { getAllVehicles } from '@/api/vehicle.api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
// Define the type for vehicle data
export interface Vehicle {
  id: number
  name: string
}

const VehicleFuelConsumption = () => {
  //getting userData from jotai atom component
  useInitializeUser()

  const [token] = useAtom(tokenAtom)
  const router = useRouter()
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
  const fetchVehicleFuelConsumptionData = React.useCallback(async () => {
    if (!token) return
    const vehicleData = await getAllVehicleFuelConsumpiton(token)
    if (vehicleData?.error?.status === 401) {
      router.push('/unauthorized-access')
      
      return
    } else if (vehicleData.error || !vehicleData.data) {
      console.error(
        'Error fetching vehicle fuel consumption:',
        vehicleData.error
      )
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          vehicleData.error?.message ||
          'Failed to fetch vehicle fuel consumption',
      })
    } else {
      setVehicleFuel(vehicleData.data)
    }
  }, [token, router])

 

  // Fetch the vehicle data from API
  const fetchVehicles = React.useCallback(async () => {
    if (!token) return
    const response = await getAllVehicles(token)
    const data: GetAllVehicleType[] = response.data ?? []
    setVehicles(data)
    setLoading(false)
  }, [token])


   useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        
        router.push('/')
        return
      }
      
    }

checkUserData()
     fetchVehicleFuelConsumptionData()
     fetchVehicles()
   }, [fetchVehicleFuelConsumptionData, fetchVehicles, router])

  return (
    <div>
      <VehicleFuelConsumptionList
        vehicleFuel={vehicleFuel}
        onAddVehicle={handleAddVehicle}
        vehicles={vehicles}
        token={token}
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
