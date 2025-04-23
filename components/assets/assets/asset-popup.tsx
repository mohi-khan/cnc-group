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
  
  
} from '@/api/assets.api'
import { type CompanyType } from '@/api/company-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import { getAllCompanies, getAllCostCenters, getAllDepartments, getAllLocations } from '@/api/common-shared-api'

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
        location_id: Number(data.location_id),
        department_id: Number(data.department_id),
        cost_center_id: Number(data.cost_center_id),
        created_by: Number(data.created_by || userId),
        useful_life_years: Number(data.useful_life_years),
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
      const response = await getAllCompanies()

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

      setGetDepartment(response.data ?? [])
      console.log('dept data', response.data)
    } catch (error) {
      console.error('Failed to fetch asset categories:', error)
    }
  }

  const fetchCostCenters = async () => {
    try {
      const response = await getAllCostCenters()

      setGetCostCenter(response.data ?? [])
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
                  <CustomCombobox
                    items={categories.map((category) => ({
                      id: category.category_id.toString(),
                      name: category.category_name || 'Unnamed Category',
                    }))}
                    value={
                      field.value
                        ? {
                            id: field.value.toString(),
                            name:
                              categories.find(
                                (category) =>
                                  category.category_id === field.value
                              )?.category_name || 'Unnamed Category',
                          }
                        : null
                    }
                    onChange={(value: { id: string; name: string } | null) =>
                      field.onChange(
                        value ? Number.parseInt(value.id, 10) : null
                      )
                    }
                    placeholder="Select category"
                  />
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
                  <CustomCombobox
                    items={getDepartment.map((department) => ({
                      id: department.departmentID.toString(),
                      name: department.departmentName || 'Unnamed Department',
                    }))}
                    value={
                      field.value
                        ? {
                            id: field.value.toString(),
                            name:
                              getDepartment.find(
                                (department) =>
                                  department.departmentID === field.value
                              )?.departmentName || 'Unnamed Department',
                          }
                        : null
                    }
                    onChange={(value: { id: string; name: string } | null) =>
                      field.onChange(
                        value ? Number.parseInt(value.id, 10) : null
                      )
                    }
                    placeholder="Select department"
                  />
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
                  <CustomCombobox
                    items={getCostCenter.map((costCenter) => ({
                      id: costCenter.costCenterId.toString(),
                      name: costCenter.costCenterName || 'Unnamed Cost Center',
                    }))}
                    value={
                      field.value
                        ? {
                            id: field.value.toString(),
                            name:
                              getCostCenter.find(
                                (costCenter) =>
                                  costCenter.costCenterId === field.value
                              )?.costCenterName || 'Unnamed Cost Center',
                          }
                        : null
                    }
                    onChange={(value: { id: string; name: string } | null) =>
                      field.onChange(
                        value ? Number.parseInt(value.id, 10) : null
                      )
                    }
                    placeholder="Select cost center"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />{' '}
            <FormField
              control={form.control}
              name="purchase_date"
              render={({ field }) => {
                const dateValue =
                  field.value instanceof Date && !isNaN(field.value.getTime())
                    ? field.value.toISOString().split('T')[0]
                    : ''

                return (
                  <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={dateValue}
                        onChange={(e) => {
                          const selectedDate = new Date(e.target.value)
                          field.onChange(
                            isNaN(selectedDate.getTime()) ? null : selectedDate
                          )
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
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

                  <CustomCombobox
                    items={[
                      { id: 'Straight Line', name: 'Straight Line' },
                      {
                        id: 'Diminishing Balance',
                        name: 'Diminishing Balance',
                      },
                    ]}
                    value={
                      field.value
                        ? {
                            id: field.value,
                            name: field.value,
                          }
                        : null
                    }
                    onChange={(value: { id: string; name: string } | null) =>
                      field.onChange(value ? value.id : null)
                    }
                    placeholder="Select depreciation method"
                  />
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
                  <CustomCombobox
                    items={(getCompany ?? []).map((company) => ({
                      id: company?.companyId?.toString() ?? "",
                      name: company.companyName || 'Unnamed Company',
                    }))}
                    value={
                      field.value
                        ? {
                            id: field.value.toString(),
                            name:
                              getCompany?.find(
                                (company) => company.companyId === field.value
                              )?.companyName || 'Unnamed Company',
                          }
                        : null
                    }
                    onChange={(value: { id: string; name: string } | null) =>
                      field.onChange(
                        value ? Number.parseInt(value.id, 10) : null
                      )
                    }
                    placeholder="Select company"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <CustomCombobox
                    items={getLoaction?.map((location) => ({
                      id: location.locationId.toString(),
                      name: location.branchName || 'Unnamed Location',
                    }))}
                    value={
                      field.value
                        ? {
                            id: field.value.toString(),
                            name:
                              getLoaction?.find(
                                (location) =>
                                  location.locationId === field.value
                              )?.branchName || 'Unnamed Location',
                          }
                        : null
                    }
                    onChange={(value: { id: string; name: string } | null) =>
                      field.onChange(
                        value ? Number.parseInt(value.id, 10) : null
                      )
                    }
                    placeholder="Select location"
                  />
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
;``
