import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
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
import { Trash2 } from 'lucide-react'
import {
  ChartOfAccount,
  CostCenter,
  JournalEntryWithDetails,
} from '@/utils/type'
import React from 'react'
import { toast } from '@/hooks/use-toast'
import {
  getAllChartOfAccounts,
  getAllCostCenters,
} from '@/api/journal-voucher-api'

interface JournalVoucherDetailsSectionProps {
  form: UseFormReturn<JournalEntryWithDetails>
  onAddEntry: () => void
  onRemoveEntry: (index: number) => void
}

export function JournalVoucherDetailsSection({
  form,
  onAddEntry,
  onRemoveEntry,
}: JournalVoucherDetailsSectionProps) {
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([])
  const [chartOfAccounts, setChartOfAccounts] = React.useState<
    ChartOfAccount[]
  >([])
  const entries = form.watch('journalDetails')

  async function fetchChartOfAccounts() {
    const response = await getAllChartOfAccounts()
    console.log('Fetched Chart Of accounts:', response.data)

    if (response.error || !response.data) {
      console.error('Error getting ChartOf bank account:', response.error)
      toast({
        title: 'Error',
        description:
          response.error?.message || 'Failed to get ChartOf bank accounts',
      })
    } else {
      setChartOfAccounts(response.data)
      //   setFilteredChartOfAccounts(response.data)
    }
  }

  const fetchCostCenters = async () => {
    const data = await getAllCostCenters()
    console.log('🚀 ~ fetchCostCenters ~ data:', data.data)
    if (data.error || !data.data) {
      console.error('Error getting cost centers:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get cost centers',
      })
    } else {
      setCostCenters(data.data)
    }
  }

  React.useEffect(() => {
    fetchChartOfAccounts()
    console.log('within use Effect')
    fetchCostCenters()
  }, [])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-2 items-center text-sm font-medium">
        <div>Account Name</div>
        <div>Cost Center</div>
        <div>Department</div>
        <div>Debit</div>
        <div>Credit</div>
        <div>Notes</div>
        <div>Action</div>
      </div>

      {entries.map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-2 items-center"
        >
          <FormField
            control={form.control}
            name={`journalDetails.${index}.accountId`}
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Account 1</SelectItem>
                    <SelectItem value="2">Account 2</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`journalDetails.${index}.costCenterId`}
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value ? Number(value) : null)
                  }
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">CC 1</SelectItem>
                    <SelectItem value="2">CC 2</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`journalDetails.${index}.departmentId`}
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value ? Number(value) : null)
                  }
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Dept 1</SelectItem>
                    <SelectItem value="2">Dept 2</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`journalDetails.${index}.debit`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`journalDetails.${index}.credit`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`journalDetails.${index}.notes`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemoveEntry(index)}
            disabled={entries.length === 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={onAddEntry}>
        Add Another Line
      </Button>
    </div>
  )
}
