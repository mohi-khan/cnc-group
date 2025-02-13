'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CostCenter,
  createVehicleSchema,
  CreateVehicleType,
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
import { createVehicle } from '@/api/vehicle'

interface VehicleFormModalProps {
  isOpen: boolean
  onClose: () => void
  refreshVehicles: () => Promise<void>
  costCenters: CostCenter[]
  asset: GetAssetData[]
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  refreshVehicles,
  costCenters,
  asset,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateVehicleType>({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: {
      costCenterId: 0,
      vehicleDescription: '',
      purchaseDate: new Date(),
      assetId: 0,
    },
  })

  const handleFormSubmit = async (data: CreateVehicleType) => {
    const formattedData = {
      ...data,
      costCenterId: Number(data.costCenterId),
      assetId: Number(data.assetId),
    }

    try {
      await createVehicle(formattedData)
      reset()
      onClose()
      refreshVehicles()
    } catch (error) {
      console.error('Error creating vehicle:', error)
      alert('Failed to create vehicle. Please try again later.')
    }
  }

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
            <select
              {...register('costCenterId', { valueAsNumber: true })}
              className="mt-1 w-full border rounded p-2"
            >
              <option value="">Select Cost Center</option>
              {costCenters.map((center) => (
                <option key={center.costCenterId} value={center.costCenterId}>
                  {center.costCenterName}
                </option>
              ))}
            </select>

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
              Asset Name
            </label>
            <select
              {...register('assetId', { valueAsNumber: true })}
              className="mt-1 w-full border rounded p-2"
            >
              <option value="">Select Asset</option>
              {asset.map((a) => (
                <option key={a.id} value={Number(a.id)}>
                  {a.name}
                </option>
              ))}
            </select>

            {errors.assetId && (
              <p className="text-red-500 text-sm">{errors.assetId.message}</p>
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
            <Button type="submit" variant="default" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default VehicleFormModal

// 'use client'

// import React from 'react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import {
//   CostCenter,
//   createVehicleSchema,
//   CreateVehicleType,
//   GetAssetData,
// } from '@/utils/type'
// import { Button } from '@/components/ui/button'
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import { createVehicle } from '@/api/vehicle'
// import { CustomCombobox } from '@/utils/custom-combobox'

// interface VehicleFormModalProps {
//   isOpen: boolean
//   onClose: () => void
//   refreshVehicles: () => Promise<void>
//   costCenters: CostCenter[]
//   asset: GetAssetData[]
// }

// const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
//   isOpen,
//   onClose,
//   refreshVehicles,
//   costCenters,
//   asset,
// }) => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     reset,
//     control,
//   } = useForm<CreateVehicleType>({
//     resolver: zodResolver(createVehicleSchema),
//     defaultValues: {
//       costCenterId: 0,
//       vehicleDescription: '',
//       purchaseDate: new Date(),
//       assetId: 0,
//     },
//   })

//   const handleFormSubmit = async (data: CreateVehicleType) => {
//     const formattedData = {
//       ...data,
//       costCenterId: Number(data.costCenterId),
//       assetId: Number(data.assetId),
//     }

//     try {
//       await createVehicle(formattedData)
//       reset()
//       onClose()
//       refreshVehicles()
//     } catch (error) {
//       console.error('Error creating vehicle:', error)
//       alert('Failed to create vehicle. Please try again later.')
//     }
//   }

//   const { watch } = useForm<CreateVehicleType>({
//     resolver: zodResolver(createVehicleSchema),
//     defaultValues: {
//       costCenterId: 0,
//       vehicleDescription: '',
//       purchaseDate: new Date(),
//       assetId: 0,
//     },
//   })

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogTrigger asChild></DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Create Vehicle</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Cost Center
//             </label>
//             <CustomCombobox
//               items={costCenters.map((center) => ({
//                 id: center.costCenterId.toString(),
//                 name: center.costCenterName || 'Unnamed Cost Center',
//               }))}
//               value={
//                 watch('costCenterId')
//                   ? {
//                       id: watch('costCenterId')?.toString() || '',
//                       name:
//                         costCenters.find(
//                           (c) => c.costCenterId === watch('costCenterId')
//                         )?.costCenterName || '',
//                     }
//                   : null
//               }
//               onChange={(value) =>
//                 register('costCenterId').onChange({
//                   target: { value: value ? Number.parseInt(value.id, 10) : '' },
//                 })
//               }
//               placeholder="Select Cost Center"
//             />
//             {errors.costCenterId && (
//               <p className="text-red-500 text-sm">
//                 {errors.costCenterId.message}
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Vehicle Description
//             </label>
//             <Input
//               type="text"
//               {...register('vehicleDescription')}
//               className="mt-1 w-full"
//             />
//             {errors.vehicleDescription && (
//               <p className="text-red-500 text-sm">
//                 {errors.vehicleDescription.message}
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Purchase Date
//             </label>
//             <Input
//               type="date"
//               {...register('purchaseDate')}
//               className="mt-1 w-full"
//             />
//             {errors.purchaseDate && (
//               <p className="text-red-500 text-sm">
//                 {errors.purchaseDate.message}
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Asset
//             </label>
//             <CustomCombobox
//               items={asset.map((a) => ({
//                 id: a.id.toString(),
//                 name: a.name || 'Unnamed Asset',
//               }))}
//               value={
//                 watch('assetId')
//                   ? {
//                       id: watch('assetId')?.toString() || '',
//                       name:
//                         asset.find(
//                           (a) => a.id === BigInt(watch('assetId') || 0)
//                         )?.name || '',
//                     }
//                   : null
//               }
//               onChange={(value) =>
//                 register('assetId').onChange({
//                   target: { value: value ? Number.parseInt(value.id, 10) : '' },
//                 })
//               }
//               placeholder="Select Asset"
//             />
//             {errors.assetId && (
//               <p className="text-red-500 text-sm">{errors.assetId.message}</p>
//             )}
//           </div>

//           <div className="flex justify-end mt-4">
//             <Button
//               variant="secondary"
//               type="button"
//               onClick={onClose}
//               className="mr-4"
//             >
//               Close
//             </Button>
//             <Button type="submit" variant="default" disabled={isSubmitting}>
//               {isSubmitting ? 'Submitting...' : 'Submit'}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }

// export default VehicleFormModal
