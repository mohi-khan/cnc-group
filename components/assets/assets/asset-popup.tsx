'use client'

import { z } from 'zod'

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

import { AssetType, createAssetSchema } from '@/utils/type'

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

// const FormSchema = z.object({
//   username: z.string().min(2, {
//     message: 'Username must be at least 2 characters.',
//   }),
//   email: z.string().email({
//     message: 'Please enter a valid email address.',
//   }),
//   password: z.string().min(8, {
//     message: 'Password must be at least 8 characters.',
//   }),
//   firstName: z.string().min(1, {
//     message: 'First name is required.',
//   }),
//   lastName: z.string().min(1, {
//     message: 'Last name is required.',
//   }),
//   age: z.number().min(18, {
//     message: 'You must be at least 18 years old.',
//   }),
//   occupation: z.string().min(1, {
//     message: 'Occupation is required.',
//   }),
// })
type CreateAssetData = z.infer<typeof createAssetSchema>
interface AssetPopupProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCategoryAdded: () => void
}

export const AssetPopUp: React.FC<AssetPopupProps> = ({
  isOpen,
  onOpenChange,
  onCategoryAdded,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<AssetType>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      name: '',
      purchaseDate: '',
      purchaseValue: '',
      salvageValue: '',
      usefulLife: '',
      depreciationMethod: '',
    },
  })

  const onSubmit = async (data: CreateAssetData) => {
    setIsSubmitting(true)
    try {
      await createAsset(data)
      onCategoryAdded()
      onOpenChange(false) // Close the dialog after successful submission
      form.reset() // Reset the form
    } catch (error) {
      console.error('Failed to create asset category:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Asset Items</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depreciation Rate</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" placeholder="YY-MM-DD" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Code</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent></SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="depreciation_account_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depreciation Account Code</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a depreciation account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent></SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
