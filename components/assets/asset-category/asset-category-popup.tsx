import React, { useCallback, useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AccountsHead,
  CreateAssetCategoryData,
  createAssetCategorySchema,
  User,
} from '@/utils/type'
import {
  createAssetCategory,

} from '@/api/asset-category-api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { getAllChartOfAccounts } from '@/api/common-shared-api'

interface AssetCategoryPopupProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCategoryAdded: () => void
}

export const AssetCategoryPopup: React.FC<AssetCategoryPopupProps> = ({
  isOpen,
  onOpenChange,
  onCategoryAdded,
}) => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)

  // State variables
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [chartOfAccounts, setChartOfAccounts] = useState<AccountsHead[]>([])
  const [userId, setUserId] = useState<number>(0)

  React.useEffect(() => {
    if (userData) {
      setUserId(userData.userId)
      console.log('Current user from localStorage:', userData)
    } else {
      console.log('No user data found in localStorage')
    }
  }, [userData])

  const form = useForm<CreateAssetCategoryData>({
    resolver: zodResolver(createAssetCategorySchema),
    defaultValues: {
      category_name: '',
      depreciation_rate: '',
      account_code: undefined,
      depreciation_account_code: undefined,
      created_by: userId,
    },
  })

  useEffect(() => {
    if (userId !== null) {
      // Update the form's default values when userId is available
      form.setValue('created_by', userId)
    }
  }, [userId, form])

  const fetchChartOfAccounts = useCallback(async () => {
    const response = await getAllChartOfAccounts()
    console.log('Fetched chart of accounts:', response.data)

    if (response.error || !response.data) {
      console.error('Error getting chart of accounts:', response.error)
      toast({
        title: 'Error',
        description:
          response.error?.message || 'Failed to get chart of accounts',
      })
    } else {
      setChartOfAccounts(response.data)
      console.log('coa', chartOfAccounts)
    }
  }, [chartOfAccounts])

  const onSubmit: (data: CreateAssetCategoryData) => Promise<void> = async (
    data
  ) => {
    console.log('Form submitted:', data)
    setIsSubmitting(true)
    try {
      await createAssetCategory(data)
      onCategoryAdded()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Failed to create asset category:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    fetchChartOfAccounts()
  }, [fetchChartOfAccounts])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Asset Category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category_name"
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
              name="depreciation_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depreciation Rate</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="e.g., 10.5" />
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
                    <SelectContent>
                      {chartOfAccounts.map((account) => (
                        <SelectItem
                          key={account.accountId}
                          value={account.accountId.toString()}
                        >
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
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
                    <SelectContent>
                      {chartOfAccounts.map((account) => (
                        <SelectItem
                          key={account.accountId}
                          value={account.accountId.toString()}
                        >
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
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
                {isSubmitting ? 'Adding...' : 'Add Category'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
