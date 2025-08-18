'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CostCenter,
  createVehicleSchema,
  CreateVehicleType,
  Employee,
  GetAssetData,
} from '@/utils/type'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createVehicle } from '@/api/vehicle.api'
import { CustomCombobox } from '@/utils/custom-combobox'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { CompanyType } from '@/api/company-api'

interface VehicleFormModalProps {
  isOpen: boolean
  onClose: () => void
  refreshVehicles: () => Promise<void>
  costCenters: CostCenter[]
  asset: GetAssetData[]
  employeeData: { id: number; employeeName: string }[]
  CompanyData: CompanyType[]
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  refreshVehicles,
  costCenters,
  asset,
  employeeData,
  CompanyData,
}) => {
  useInitializeUser()

  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<CreateVehicleType>({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: {
      costCenterId: 0,
      vehicleDescription: '',
      purchaseDate: new Date(),
      assetId: 0,
      employeeid: 0,
      driverid: 0,
      companyid: 0,
      createdBy: userData?.userId || 0,
    },
  })

  const handleFormSubmit = async (data: CreateVehicleType) => {
    console.log('Form Data Submitted:', data) // 👈 log form data
    const formattedData = {
      ...data,
      costCenterId: Number(data.costCenterId),
      assetId: Number(data.assetId),
      employeeid: Number(data.employeeid),
      createdBy: userData?.userId || 0,
    }

    try {
      await createVehicle(formattedData, token)
      reset()
      onClose()
      refreshVehicles()
    } catch (error) {
      console.error('Error creating vehicle:', error)
      alert('Failed to create vehicle. Please try again later.')
    }
  }

  const watch = (fieldName: string) => {
    const values = control._formValues || {}
    return values[fieldName]
  }

  //
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Vehicle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cost Center
            </label>

            <Controller
              control={control}
              name="costCenterId"
              render={({ field }) => (
                <CustomCombobox
                  items={costCenters.map((center) => ({
                    id: center.costCenterId.toString(),
                    name: center.costCenterName || 'Unnamed Cost Center',
                  }))}
                  value={
                    field.value
                      ? {
                          id: field.value.toString(),
                          name:
                            costCenters.find(
                              (c) => c.costCenterId === field.value
                            )?.costCenterName || '',
                        }
                      : null
                  }
                  onChange={(value) =>
                    field.onChange(value ? Number.parseInt(value.id, 10) : null)
                  }
                  placeholder="Select cost center"
                />
              )}
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
              {...register('purchaseDate', {
                required: 'Purchase Date is required',
              })}
              className="mt-1 w-full"
            />
            {errors.purchaseDate && (
              <p className="text-red-500 text-sm">
                {errors.purchaseDate.message}
              </p>
            )}
            {!errors.purchaseDate && !watch('purchaseDate') && (
              <p className="text-red-500 text-sm">
                Please select a purchase date to submit the form
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Asset Name
            </label>

            <Controller
              control={control}
              name="assetId"
              render={({ field }) => (
                <CustomCombobox
                  items={asset.map((a) => ({
                    id: a.id.toString(),
                    name: a.name || 'Unnamed Asset',
                  }))}
                  value={
                    field.value
                      ? {
                          id: field.value.toString(),
                          name:
                            asset.find(
                              (a) => Number(a.id) === Number(field.value)
                            )?.name || '',
                        }
                      : null
                  }
                  onChange={(value) =>
                    field.onChange(value ? Number(value.id) : null)
                  }
                  placeholder="Select Asset"
                />
              )}
            />

            {errors.assetId && (
              <p className="text-red-500 text-sm">{errors.assetId.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Employee Name
            </label>

            <Controller
              control={control}
              name="employeeid"
              render={({ field }) => (
                <CustomCombobox
                  items={employeeData.map(
                    (a: { id: number; employeeName: string }) => ({
                      id: a.id.toString(),
                      name: a.employeeName || 'Unnamed Employee',
                    })
                  )}
                  value={
                    field.value
                      ? {
                          id: field.value.toString(),
                          name:
                            employeeData.find(
                              (a: { id: number; employeeName: string }) =>
                                Number(a.id) === Number(field.value)
                            )?.employeeName || '',
                        }
                      : null
                  }
                  onChange={(value: { id: string; name: string } | null) =>
                    field.onChange(value ? Number(value.id) : null)
                  }
                  placeholder="Select Employee"
                />
              )}
            />

            {errors.employeeid && (
              <p className="text-red-500 text-sm">
                {errors.employeeid.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Driver Name
            </label>

            <Controller
              control={control}
              name="driverid"
              render={({ field }) => (
                <CustomCombobox
                  items={employeeData.map(
                    (a: { id: number; employeeName: string }) => ({
                      id: a.id.toString(),
                      name: a.employeeName || 'Unnamed Driver',
                    })
                  )}
                  value={
                    field.value
                      ? {
                          id: field.value.toString(),
                          name:
                            employeeData.find(
                              (a: { id: number; employeeName: string }) =>
                                Number(a.id) === Number(field.value)
                            )?.employeeName || '',
                        }
                      : null
                  }
                  onChange={(value: { id: string; name: string } | null) =>
                    field.onChange(value ? Number(value.id) : null)
                  }
                  placeholder="Select Driver"
                />
              )}
            />

            {errors.driverid && (
              <p className="text-red-500 text-sm">{errors.driverid.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Company Name
            </label>

            <Controller
              control={control}
              name="companyid"
              render={({ field }) => (
                <CustomCombobox
                  items={CompanyData?.map((company) => ({
                    id: (company.companyId ?? '').toString(),
                    name: company.companyName || 'Unnamed Company',
                  }))}
                  value={
                    field.value
                      ? {
                          id: field.value.toString(),
                          name:
                            CompanyData?.find(
                              (company) => company.companyId === field.value
                            )?.companyName || 'Unnamed Company',
                        }
                      : null
                  }
                  onChange={(value: { id: string; name: string } | null) =>
                    field.onChange(value ? Number.parseInt(value.id, 10) : null)
                  }
                  placeholder="Select company"
                />
              )}
            />

            {errors.driverid && (
              <p className="text-red-500 text-sm">{errors.driverid.message}</p>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              className="mr-4"
            >
              Close
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting || !watch('purchaseDate')}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default VehicleFormModal
