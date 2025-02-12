'use client'
import React, { useEffect, useState } from 'react'

import VehiclePopUp from './vehicle-popup'
import { getAllVehicles } from '@/api/vehicle';
import { CreateVehicleType, GetAllVehicleType } from '@/utils/type';
import { VehicleList } from './vehicle-list';

const Vehicle = () => {
    const [vehicles, setVehicles] = useState<GetAllVehicleType[]>([]);
    const [isOpen, setIsOpen] = useState(false);

// Fetch all assets
const fetchAssets = async () => {
    const assetdata = await getAllVehicles();
    setVehicles(assetdata.data || []);
    console.log('Show The Vehicle All Data :', assetdata.data);
  };

  useEffect(() => {
    fetchAssets();
  }, []);
  const handleAddVehicle = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (data: CreateVehicleType) => {

    
   
    handleClose();
  };

  return (
    <div>
        <VehicleList
        AllVehicles={vehicles}
        onAddVehicle={handleAddVehicle}
         />
        <VehiclePopUp 
          isOpen={isOpen}
          onClose={handleClose}
          onSubmit={handleSubmit}
        />
    </div>
  )
  
}

export default Vehicle