'use client'

import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createVehicleFuelConsumption } from '@/api/vehicle-fuel-consumption-api'
import {
  createVehicleFuelConsumptionSchema,
  createVehicleFuelConsumptionType,
  GetAllVehicleType,
} from '@/utils/type'
import { CustomCombobox } from '@/utils/custom-combobox'

interface VehicleFuelConsumptionPopUpProps {
  isOpen: boolean
  onClose: () => void
  refreshFuelData: () => Promise<void>
  vehicleId: string | null
  vehicles: GetAllVehicleType[] // Add this line
  loading: boolean
}

const VehicleFuelConsumptionPopUp: React.FC<
  VehicleFuelConsumptionPopUpProps
> = ({ isOpen, onClose, refreshFuelData, loading, vehicles }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<createVehicleFuelConsumptionType>({
    resolver: zodResolver(createVehicleFuelConsumptionSchema),
    defaultValues: {
      vehicleId: 0,
      octConsumption: 0,
      gasConsumption: 0,
      totalConsumption: 0,
      kmrsPerLitr: 0,
      transDate: new Date(),
      createdBy: 84,
    },
  })

  const handleFormSubmit = async (data: createVehicleFuelConsumptionType) => {
    try {
      await createVehicleFuelConsumption(data)
      reset()
      onClose()
      refreshFuelData()
    } catch (error) {
      console.error('Error submitting fuel consumption:', error)
      alert('Failed to submit fuel consumption. Please try again later.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fuel Consumption</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Vehicle Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle
            </label>
            {/* <select
              {...register('vehicleId', {
                required: 'Vehicle is required',
                setValueAs: (value) => Number(value) || 0, // Convert to number
              })}
              className="mt-1 w-full border border-gray-300 rounded p-2"
            >
              <option value="">Select a vehicle</option>
              {loading ? (
                <option disabled>Loading vehicles...</option>
              ) : (
                vehicles.map((vehicle) => (
                  <option key={vehicle.vehicleNo} value={vehicle.vehicleNo}>
                    {vehicle.vehicleDescription}
                  </option>
                ))
              )}
            </select> */}
            <Controller
              control={control}
              name="vehicleId"
              rules={{ required: 'Vehicle is required' }}
              render={({ field }) => (
                <CustomCombobox
                  items={vehicles.map((vehicle) => ({
                    id: vehicle.vehicleNo.toString(),
                    name: vehicle.vehicleDescription || 'Unnamed Vehicle',
                  }))}
                  value={
                    
                    field.value
                      ? {
                          id: field.value.toString(),
                          name:
                            vehicles.find(
                              (v) =>
                                v.vehicleNo.toString() ===
                                field.value.toString()
                            )?.vehicleDescription || '',
                        }
                      : null
                  }
                  onChange={(value) => field.onChange(value ? value.id : null)}
                  placeholder={
                    loading ? 'Loading vehicles...' : 'Select a vehicle'
                  }
                  disabled={loading}
                />
              )}
            />

            {errors.vehicleId && (
              <p className="text-red-500 text-sm">{errors.vehicleId.message}</p>
            )}
          </div>

          {/* Fuel Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Octane Consumption
            </label>
            <Input
              type="number"
              step="0.1"
              {...register('octConsumption', { valueAsNumber: true })} // Convert to number
              className="mt-1 w-full"
            />
            {errors.octConsumption && (
              <p className="text-red-500 text-sm">
                {errors.octConsumption.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gas Consumption
            </label>
            <Input
              type="number"
              step="0.1"
              {...register('gasConsumption', { valueAsNumber: true })} // Convert to number
              className="mt-1 w-full"
            />
            {errors.gasConsumption && (
              <p className="text-red-500 text-sm">
                {errors.gasConsumption.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Total Consumption
            </label>
            <Input
              type="number"
              step="0.1"
              {...register('totalConsumption', { valueAsNumber: true })} // Convert to number
              className="mt-1 w-full"
            />
            {errors.totalConsumption && (
              <p className="text-red-500 text-sm">
                {errors.totalConsumption.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Kilometers per Liter
            </label>
            <Input
              type="number"
              step="0.1"
              {...register('kmrsPerLitr', { valueAsNumber: true })} // Convert to number
              className="mt-1 w-full"
            />
            {errors.kmrsPerLitr && (
              <p className="text-red-500 text-sm">
                {errors.kmrsPerLitr.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Transaction Date
            </label>
            <Input
              type="date"
              {...register('transDate')}
              className="mt-1 w-full"
            />
            {errors.transDate && (
              <p className="text-red-500 text-sm">{errors.transDate.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end mt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              className="mr-4"
            >
              Close
            </Button>
            <Button type="submit" variant="default" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default VehicleFuelConsumptionPopUp
