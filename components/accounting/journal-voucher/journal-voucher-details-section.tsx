import type { UseFormReturn } from 'react-hook-form'
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
import type {
  CostCenter,
  JournalEntryWithDetails,
  AccountsHead,
  GetDepartment,
} from '@/utils/type'
import React, { useEffect, useRef } from 'react'
import { toast } from '@/hooks/use-toast'
import {
  getAllChartOfAccounts,
  getAllCostCenters,
  getAllDepartments,
} from '@/api/journal-voucher-api'

interface JournalVoucherDetailsSectionProps {
  form: UseFormReturn<JournalEntryWithDetails>
  onAddEntry: () => void
  onRemoveEntry: (index: number) => void
}

export function JournalVoucherDetailsSection({
  form,
  onRemoveEntry,
}: JournalVoucherDetailsSectionProps) {
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([])
  const [chartOfAccounts, setChartOfAccounts] = React.useState<AccountsHead[]>(
    []
  )
  const [departments, setDepartments] = React.useState<GetDepartment[]>([])
  const newRowRef = useRef<HTMLButtonElement>(null)
  const entries = form.watch('journalDetails')

  async function fetchChartOfAccounts() {
    const response = await getAllChartOfAccounts()
    if (response.error || !response.data) {
      console.error('Error getting Chart Of accounts:', response.error)
      toast({
        title: 'Error',
        description:
          response.error?.message || 'Failed to get Chart Of accounts',
      })
    } else {
      setChartOfAccounts(response.data)
    }
  }

  const fetchCostCenters = async () => {
    const data = await getAllCostCenters()
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

  async function fetchDepartments() {
    const response = await getAllDepartments()
    if (response.error || !response.data) {
      console.error('Error getting departments:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get departments',
      })
    } else {
      setDepartments(response.data)
    }
  }

  useEffect(() => {
    fetchChartOfAccounts()
    fetchCostCenters()
    fetchDepartments()
  }, [])

  useEffect(() => {
    // Initialize with two rows
    if (entries.length === 0) {
      form.setValue('journalDetails', [
        {
          accountId: 0,
          costCenterId: 0,
          departmentId: 0,
          debit: 0,
          credit: 0,
          notes: '',
          createdBy: 60,
          analyticTags: null,
          taxId: null,
        },
        {
          accountId: 0,
          costCenterId: 0,
          departmentId: 0,
          debit: 0,
          credit: 0,
          notes: '',
          createdBy: 60,
          analyticTags: null,
          taxId: null,
        },
      ])
    }
  }, [])

  const addEntry = () => {
    form.setValue('journalDetails', [
      ...entries,
      {
        accountId: 0,
        costCenterId: 0,
        departmentId: 0,
        debit: 0,
        credit: 0,
        notes: '',
        createdBy: 60,
        analyticTags: null,
        taxId: null,
      },
    ])
    // Focus on the first input of the new row after a short delay
    setTimeout(() => {
      newRowRef.current?.focus()
    }, 0)
  }

  const handleDebitChange = (index: number, value: number) => {
    const updatedEntries = [...entries]
    updatedEntries[index].debit = value
    updatedEntries[index].credit = 0
    form.setValue('journalDetails', updatedEntries)
  }

  const handleCreditChange = (index: number, value: number) => {
    const updatedEntries = [...entries]
    updatedEntries[index].credit = value
    updatedEntries[index].debit = 0
    form.setValue('journalDetails', updatedEntries)
  }

  const calculateTotals = () => {
    return entries.reduce(
      (totals, entry) => {
        totals.debit += entry.debit
        totals.credit += entry.credit
        return totals
      },
      { debit: 0, credit: 0 }
    )
  }

  const totals = calculateTotals()
  const isBalanced = totals.debit === totals.credit

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
                    <SelectTrigger
                      ref={index === entries.length - 1 ? newRowRef : null}
                    >
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {chartOfAccounts
                      ?.filter((coa) => !coa.isGroup)
                      .map((coa) => (
                        <SelectItem
                          key={coa.accountId}
                          value={coa.accountId.toString()}
                        >
                          {coa.name} ({coa.code})
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
                    {costCenters.map((center) => (
                      <SelectItem
                        key={center.costCenterId}
                        value={center?.costCenterId?.toString()}
                      >
                        {center.costCenterName}
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
                    {departments?.map((department) => (
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
            name={`journalDetails.${index}.debit`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      handleDebitChange(index, Number(e.target.value))
                    }
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
                    onChange={(e) =>
                      handleCreditChange(index, Number(e.target.value))
                    }
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
            disabled={entries.length <= 2}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addEntry}>
        Add Another Line
      </Button>

      <div className="flex justify-between items-center">
        <div>
          <p>Total Debit: {totals.debit}</p>
          <p>Total Credit: {totals.credit}</p>
        </div>
        <div>
          {!isBalanced && (
            <p className="text-red-500">
              Debit and Credit totals must be equal to post/draft the voucher.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
