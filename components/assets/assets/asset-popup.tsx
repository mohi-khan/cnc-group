'use client'

import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import {
  type AssetCategoryType,
  AssetType,
  CreateAssetCategoryData,
  createAssetSchema,
} from '@/utils/type'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { createAsset } from '@/api/assets.api'

type CreateAssetData = z.infer<typeof createAssetSchema>
interface AssetPopupProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCategoryAdded: () => void
  categories: AssetCategoryType[]
}

export const AssetPopUp: React.FC<AssetPopupProps> = ({
  isOpen,
  onOpenChange,
  onCategoryAdded,
  categories,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<CreateAssetData>({
    resolver: zodResolver(createAssetSchema), // Assuming `createAssetSchema` is defined with Zod
    defaultValues: {
      name: '',
      type: 0,
      purchaseDate: '',
      purchaseValue: '',
      currentValue: '',
      salvageValue: '',
      usefulLifeYears: 0,
      depreciationMethod: 'Straight Line',
    },
  })

  const onSubmit = async (data: CreateAssetData) => {
    console.log('onSubmit called with data:', data) // Debugging log
    setIsSubmitting(true)
    try {
      await createAsset(data)
      console.log('Asset created successfully') // Debugging log
      onCategoryAdded()
      onOpenChange(false) // Close the dialog after successful submission
      form.reset() // Reset the form
    } catch (error) {
      console.error('Failed to create asset category:', error)
    } finally {
      setIsSubmitting(false)
      console.log('setIsSubmitting set to false') // Debugging log
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto flex flex-col  ">
        <DialogHeader>
          <DialogTitle>Add Asset Items</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Asset Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter asset name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Category Name Field */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? field.value.toString() : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.category_id}
                          value={category.category_id.toString()}
                        >
                          {category.category_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Purchase Date Field */}
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" placeholder="YYYY-MM-DD" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Purchase Value Field */}
            <FormField
              control={form.control}
              name="purchaseValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Value</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter purchase value"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Current Value Field */}
            <FormField
              control={form.control}
              name="currentValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Value</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter current value"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Salvage Value Field */}
            <FormField
              control={form.control}
              name="salvageValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salvage Value</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter salvage value"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Useful Life Years Field */}
            <FormField
              control={form.control}
              name="usefulLifeYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Useful Life (Years)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter useful life in years"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Depreciation Method Field */}
            <FormField
              control={form.control}
              name="depreciationMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depreciation Method</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select depreciation method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Straight Line">
                        Straight Line
                      </SelectItem>
                      <SelectItem value="Diminishing Balance">
                        Diminishing Balance
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Form Actions */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Asset'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
