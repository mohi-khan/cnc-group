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
import { Checkbox } from '@/components/ui/checkbox'
import { useEffect, useState } from 'react'
import { CompanyType, getAllCompany } from '@/api/company-api'
import { getAllCostCenters } from '@/api/cost-center-summary-api'
import { createMeterEntry, getAllCoa } from '@/api/meter-entry-api'
import { toast } from '@/hooks/use-toast'
import {
  AccountsHead,
  ChartOfAccount,
  CostCenter,
  CreateElectricityMeterSchema,
  CreateElectricityMeterType,
} from '@/utils/type'


interface MeterEntryPopUpProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCategoryAdded: () => void
}

const MeterEntryPopUp: React.FC<MeterEntryPopUpProps> = ({
  isOpen,
  onOpenChange,
  onCategoryAdded,
}) => {
  const [getCompany, setGetCompany] = useState<CompanyType[]>([])
  const [getCostCenters, setGetCostCenters] = useState<CostCenter[]>([])
  const [getChartOfAccounts, setGetChartOfAccounts] = useState<
    AccountsHead[]
  >([])

  const form = useForm<CreateElectricityMeterType>({
    resolver: zodResolver(CreateElectricityMeterSchema),
    defaultValues: {
      idelectricityMeterId: 0, // Added field
      electricityMeterName: '',
      companyId: 0,
      meterType: 0,
      costCenterId: 0,
      meterDescription: '',
      provAccountId: 0,
      accountId: 0,
    },
  })

  useEffect(() => {
    const fetchCompany = async () => {
      const response = await getAllCompany()
      setGetCompany(response.data ?? [])
    }

    const fetchCostCenters = async () => {
      const response = await getAllCostCenters()
      setGetCostCenters(response.data ?? [])
    }

    const fetchChartOfAccounts = async () => {
      const response = await getAllCoa()
      setGetChartOfAccounts(response.data ?? [])
    }

    fetchCompany()
    fetchCostCenters()
    fetchChartOfAccounts()
  }, [])

  const onSubmit = async (data: CreateElectricityMeterType) => {
    console.log('Form Data:', data) // Debugging data before submission

    try {
      const response = await createMeterEntry(data)
      if (response.data) {
        toast({
          title: 'Success',
          description: 'Meter entry created successfully',
        })
        onCategoryAdded()
        onOpenChange(false)
        form.reset()
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to create meter entry',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Meter Entry Input</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* New Field: Electricity Meter ID */}
            <FormField
              control={form.control}
              name="idelectricityMeterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Electricity Meter ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter Electricity Meter ID"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="electricityMeterName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meter Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter meter name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyId"
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
              name="meterType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meter Type</FormLabel>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="prepaid"
                        checked={field.value === 0}
                        onCheckedChange={(checked) =>
                          checked ? field.onChange(0) : field.onChange(null)
                        }
                      />
                      <label htmlFor="prepaid">Pre-paid</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="postpaid"
                        checked={field.value === 1}
                        onCheckedChange={(checked) =>
                          checked ? field.onChange(1) : field.onChange(null)
                        }
                      />
                      <label htmlFor="postpaid">Post-paid</label>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="costCenterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Center</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cost center" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getCostCenters.map((category) => (
                        <SelectItem
                          key={category.costCenterId}
                          value={category.costCenterId.toString()}
                        >
                          {category.costCenterName}
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
              name="meterDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter Description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provision Account Name</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provision account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getChartOfAccounts.map((account) => (
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
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Account Name</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select expense account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getChartOfAccounts.map((account) => (
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Adding...' : 'Add Meter Entry'}
              </Button>
            </div>

            {/* Debug: Show validation errors if any */}
            {Object.keys(form.formState.errors).length > 0 && (
              <pre className="text-red-500">
                {JSON.stringify(form.formState.errors, null, 2)}
              </pre>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default MeterEntryPopUp
