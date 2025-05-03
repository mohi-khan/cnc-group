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
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const Vehicle = () => {
  //getting userData from jotai atom component
  useInitializeUser()

  const [token] = useAtom(tokenAtom)
  const router = useRouter()

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

  // Fetch all cost centers
  async function fetchgetAllCostCenters() {
    try {
      const response = await getAllCostCenters(token)
      if (!response.data) throw new Error('No data received')
      setCostCenters(response.data)
    } catch (error) {
      console.error('Error getting cost centers:', error)
      toast({
        title: 'Error',
        description: 'Failed to load cost centers',
      })
      setCostCenters([])
    }
  }

  // Fetch all vehicles
  const fetchVehicles = React.useCallback(async () => {
    const vehicleData = await getAllVehicles(token)
    console.log(vehicleData?.error?.message === 'Unauthorized access')
    if (vehicleData?.error?.status === 401) {
      router.push('/unauthorized-access')
      console.log('Unauthorized access')
      return
    } else if (vehicleData.error || !vehicleData.data) {
      console.error('Error fetching chart of accounts:', vehicleData.error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          vehicleData.error?.message || 'Failed to fetch chart of accounts',
      })
    } else {
      setVehicles(vehicleData.data)
    }
  }, [token, router])

  // Fetch all assets
  const fetchAssets = async () => {
    try {
      const assetData = await getAssets(token)
      setAsset(assetData.data || [])
      console.log('Show The Assets All Data :', assetData.data)
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    }
  }

  const fetchEmployeeData = async () => {
    try {
      const employees = await getEmployee(token)
      if (employees.data) {
        setEmployeeData(employees.data)
      } else {
        setEmployeeData([])
      }
      console.log('Show The Employee Data :', employees.data)
    } catch (error) {
      console.error('Failed to fetch Employee Data :', error)
    }
  }

  useEffect(() => {
    fetchgetAllCostCenters()
    fetchVehicles()
    fetchAssets()
    fetchEmployeeData()
  }, [])

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
