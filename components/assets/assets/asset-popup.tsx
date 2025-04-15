'use client'

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
  type AssetCategoryType,
  type CostCenter,
  type CreateAssetData,
  createAssetSchema,
  type GetDepartment,
  type LocationData,
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import {
  createAsset,
  getAllCostCenters,
  getAllDepartments,
} from '@/api/assets.api'
import { type CompanyType, getAllCompany } from '@/api/company-api'
import { getAllLocations } from '@/api/bank-vouchers-api'

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
  const [getCompany, setGetCompany] = useState<CompanyType[] | null>([])
  const [getLoaction, setGetLocation] = useState<LocationData[]>([])
  const [getDepartment, setGetDepartment] = useState<GetDepartment[]>([])
  const [getCostCenter, setGetCostCenter] = useState<CostCenter[]>([])
  const [userId, setUserId] = React.useState<number | null>(null)

  const form = useForm<CreateAssetData>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      asset_name: '',
      category_id: 0,
      purchase_date: new Date(),
      purchase_value: '0.00',
      current_value: '0.00',
      salvage_value: '0.00',
      depreciation_method: 'Straight Line',
      useful_life_years: 0,
      status: 'Active',
      company_id: 0,
      location_id: 0,
      department_id: 0,
      cost_center_id: 0,
      depreciation_rate: '0.00',
      created_by: 0,
    },
  })

  React.useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUserId(userData.userId)
      form.setValue('created_by', userData.userId)
      console.log(
        'Current userId from localStorage in everywhere:',
        userData.userId
      )
    } else {
      console.log('No user data found in localStorage')
    }
  }, [form])

  const onSubmit = async (data: CreateAssetData) => {
    console.log('Form data before submission:', data)
    setIsSubmitting(true)
    try {
      // Ensure numeric fields are properly converted
      const formattedData = {
        ...data,
        asset_name: data.asset_name,
        category_id: Number(data.category_id),
        company_id: Number(data.company_id),
        location_id: data.location_id ? Number(data.location_id) : null,
        department_id: data.department_id ? Number(data.department_id) : null,
        cost_center_id: data.cost_center_id
          ? Number(data.cost_center_id)
          : null,
        created_by: Number(data.created_by || userId),
        useful_life_years: data.useful_life_years
          ? Number(data.useful_life_years)
          : null,
        // Ensure decimal values are properly formatted
        purchase_value: data.purchase_value.toString(),
        current_value: data.current_value?.toString(),
        salvage_value: data.salvage_value?.toString(),
        depreciation_rate: data.depreciation_rate?.toString(),
      }

      console.log('Formatted data for submission:', formattedData)
      await createAsset(formattedData)
      onCategoryAdded()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Failed to create asset:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchCompnay = async () => {
    try {
      const response = await getAllCompany()

      setGetCompany(response.data)
      console.log(
        'fetchAssetCategories category names asset tsx file:',
        response.data
      )
    } catch (error) {
      console.error('Failed to fetch asset categories:', error)
    }
  }
  const fetchLocation = async () => {
    try {
      const response = await getAllLocations()

      setGetLocation(response.data ?? [])
      console.log(
        'fetchAssetCategories category names asset tsx file:',
        response.data
      )
    } catch (error) {
      console.error('Failed to fetch asset categories:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await getAllDepartments()

      setGetDepartment(response.data?? [])
      console.log('dept data', response.data)
    } catch (error) {
      console.error('Failed to fetch asset categories:', error)
    }
  }

  const fetchCostCenters = async () => {
    try {
      const response = await getAllCostCenters()

      setGetCostCenter(response.data?? [])
      console.log('cost center data', response.data)
    } catch (error) {
      console.error('Failed to fetch asset categories:', error)
    }
  }

  useEffect(() => {
    fetchCompnay()
    fetchLocation()
    fetchDepartments()
    fetchCostCenters()
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Asset Items</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="asset_name"
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

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
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
            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getDepartment?.map((department) => (
                        <SelectItem
                          key={department.departmentID}
                          value={department.departmentID.toString()}
                        >
                          {department.departmentName}
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
              name="cost_center_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Center</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Cost Center" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getCostCenter?.map((costCenter) => (
                        <SelectItem
                          key={costCenter.costCenterId}
                          value={costCenter.costCenterId.toString()}
                        >
                          {costCenter.costCenterName}
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
              name="purchase_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value instanceof Date
                          ? field.value.toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchase_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Value</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="0.00"
                      pattern="^\d+(\.\d{1,2})?$"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="current_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Value</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="0.00"
                      pattern="^\d+(\.\d{1,2})?$"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salvage_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salvage Value</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="0.00"
                      pattern="^\d+(\.\d{1,2})?$"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="useful_life_years"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Useful Life (Years)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="depreciation_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depreciation Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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

            <FormField
              control={form.control}
              name="depreciation_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depreciation Rate</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="0.00"
                      pattern="^\d+(\.\d{1,2})?$"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getCompany?.map((company) => (
                        <SelectItem
                          key={company.companyId}
                          value={company.companyId.toString()}
                        >
                          {company.companyName}
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
              name="location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location ID</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select loactions" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getLoaction?.map((location) => (
                        <SelectItem
                          key={location.locationId}
                          value={location.locationId.toString()}
                        >
                          {location.branchName}
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Disposed">Disposed</SelectItem>
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
                {isSubmitting ? 'Adding...' : 'Add Asset'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
``