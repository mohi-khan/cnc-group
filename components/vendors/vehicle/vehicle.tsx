'use client'
import React, { useEffect, useState } from 'react'

import VehiclePopUp from './vehicle-popup'
import { getAllVehicles } from '@/api/vehicle'
import { CostCenter, GetAllVehicleType, GetAssetData } from '@/utils/type'
import { VehicleList } from './vehicle-list'
import { toast } from '@/hooks/use-toast'
import { getAllCostCenters } from '@/api/cost-center-summary-api'
import { getAssets } from '@/api/assets.api'

const Vehicle = () => {
  const [vehicles, setVehicles] = useState<GetAllVehicleType[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [asset, setAsset] = useState<GetAssetData[]>([])

  const handleAddVehicle = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  // Fetch all cost centers
  async function fetchgetAllCostCenters() {
    try {
      const response = await getAllCostCenters()
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
  const fetchVehicles = async () => {
    try {
      const vehicleData = await getAllVehicles()
      setVehicles(vehicleData.data || [])
      console.log('Show The Vehicle All Data :', vehicleData.data)
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    }
  }

  // Fetch all assets
  const fetchAssets = async () => {
    try {
      const assetData = await getAssets()
      setAsset(assetData.data || [])
      console.log('Show The Assets All Data :', assetData.data)
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    }
  }

  useEffect(() => {
    fetchgetAllCostCenters()
    fetchVehicles()
    fetchAssets()
  }, [])

  return (
    <div>
      <VehicleList
        AllVehicles={vehicles}
        onAddVehicle={handleAddVehicle}
        costCenters={costCenters}
        asset={asset}
      />
      <VehiclePopUp
        isOpen={isOpen}
        onClose={handleClose}
        refreshVehicles={fetchVehicles} // Pass fetchVehicles as a prop
        costCenters={costCenters}
        asset={asset}
      />
    </div>
  )
}

export default Vehicle
