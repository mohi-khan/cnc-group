'use client'
import React, { useCallback, useEffect, useState } from 'react'

import VehiclePopUp from './vehicle-popup'
import { getAllVehicles } from '@/api/vehicle.api'
import {
  CostCenter,
  Employee,
  GetAllVehicleType,
  GetAssetData,
} from '@/utils/type'
import { VehicleList } from './vehicle-list'
import { toast } from '@/hooks/use-toast'

import {
  getAllCostCenters,
  getAssets,
  getEmployee,
} from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const Vehicle = () => {
  //getting userData from jotai atom component
  useInitializeUser()

  const [token] = useAtom(tokenAtom)
  const router = useRouter()
  const [userData] = useAtom(userDataAtom)

  const [vehicles, setVehicles] = useState<GetAllVehicleType[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [asset, setAsset] = useState<GetAssetData[]>([])
  const [employeeData, setEmployeeData] = useState<Employee[]>([])

  const handleAddVehicle = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }
  
 // Fetch all vehicles
  const fetchVehicles = useCallback(async () => {
    if (!token) return
    const vehicleData = await getAllVehicles(token)
    console.log(vehicleData?.error?.message === 'Unauthorized access')
    if (vehicleData?.error?.status === 401) {
      router.push('/unauthorized-access')
      console.log('Unauthorized access')
      return
    } else if (vehicleData.error || !vehicleData.data) {
      console.error('Error vehicle:', vehicleData.error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: vehicleData.error?.message || 'Failed to fetch Vehicles',
      })
    } else {
      setVehicles(vehicleData.data)
    }
  }, [token, router])

  // Fetch all cost centers
  const fetchgetAllCostCenters = useCallback(async () => {
    if (!token) return
    const response = await getAllCostCenters(token)
    if (!response.data) {
      toast({
        title: 'Error',
        description: 'Failed to load cost centers',
      })
      setCostCenters([])
      return
    }
    setCostCenters(response.data)
  }, [token])

 

  // Fetch all assets
  const fetchAssets = useCallback(async () => {
    if (!token) return
    const assetData = await getAssets(token)
    setAsset(assetData.data || [])
    console.log('Show The Assets All Data :', assetData.data)
  }, [token])

  const fetchEmployeeData = React.useCallback(async () => {
    if (!token) return
    const employees = await getEmployee(token)
    if (employees.data) {
      setEmployeeData(employees.data)
    } else {
      setEmployeeData([])
    }
    console.log('Show The Employee Data :', employees.data)
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
    fetchgetAllCostCenters()
    fetchVehicles()
    fetchAssets()
    fetchEmployeeData()
  }, [fetchgetAllCostCenters, fetchVehicles, fetchAssets, fetchEmployeeData, router])

  return (
    <div>
      <VehicleList
        AllVehicles={vehicles}
        onAddVehicle={handleAddVehicle}
        costCenters={costCenters}
        asset={asset}
        employeeData={employeeData}
        refreshVehicles={fetchVehicles}
      />
      <VehiclePopUp
        isOpen={isOpen}
        onClose={handleClose}
        refreshVehicles={fetchVehicles} // Pass fetchVehicles as a prop
        costCenters={costCenters}
        asset={asset}
        employeeData={employeeData}
      />
    </div>
  )
}

export default Vehicle
