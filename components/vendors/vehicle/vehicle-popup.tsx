


'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createVehicleSchema, CreateVehicleType } from '@/utils/type'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface VehicleFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateVehicleType) => void
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateVehicleType>({
    resolver: zodResolver(createVehicleSchema),
  })

  const handleFormSubmit = (data: CreateVehicleType) => {
    // Ensure number fields are converted to numbers
    const formattedData = {
      ...data,
      costCenterId: Number(data.costCenterId),
      assetId: Number(data.assetId),
    }
    onSubmit(formattedData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
       
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Vehicle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cost Center ID
            </label>
            <Input
              type="number"
              {...register('costCenterId')}
              className="mt-1 w-full"
            />
            {errors.costCenterId && (
              <p className="text-red-500 text-sm">
                {errors.costCenterId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle Description
            </label>
            <Input
              type="text"
              {...register('vehicleDescription')}
              className="mt-1 w-full"
            />
            {errors.vehicleDescription && (
              <p className="text-red-500 text-sm">
                {errors.vehicleDescription.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Purchase Date
            </label>
            <Input
              type="date"
              {...register('purchaseDate')}
              className="mt-1 w-full"
            />
            {errors.purchaseDate && (
              <p className="text-red-500 text-sm">
                {errors.purchaseDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Asset ID
            </label>
            <Input
              type="number"
              {...register('assetId')}
              className="mt-1 w-full"
            />
            {errors.assetId && (
              <p className="text-red-500 text-sm">{errors.assetId.message}</p>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="secondary" onClick={onClose} className="mr-4">
              Close
            </Button>
            <Button type="submit" variant="default">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default VehicleFormModal
