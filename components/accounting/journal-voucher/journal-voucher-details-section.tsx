import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
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
import { CustomCombobox } from '@/utils/custom-combobox'

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
      const filteredCoa = response.data?.filter((account) => {
        return account.isGroup === false
      })
      setChartOfAccounts(filteredCoa)
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
          costCenterId: null,
          departmentId: null,
          debit: 0,
          credit: 0,
          notes: '',
          createdBy: 60,
          analyticTags: null,
          taxId: null,
        },
        {
          accountId: 0,
          costCenterId: null,
          departmentId: null,
          debit: 0,
          credit: 0,
          notes: '',
          createdBy: 60,
          analyticTags: null,
          taxId: null,
        },
      ])
    }
  }, [entries.length, form])

  const addEntry = () => {
    form.setValue('journalDetails', [
      ...entries,
      {
        accountId: 0,
        costCenterId: null,
        departmentId: null,
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
    <div>
      <div className="space-y-4 border pb-4 mb-4 rounded-md shadow-md">
        <div className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-2 items-center text-sm font-medium border-b p-4 bg-slate-200 shadow-md">
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
            className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-2 items-center px-4"
          >
            <FormField
              control={form.control}
              name={`journalDetails.${index}.accountId`}
              render={({ field }) => (
                <FormItem>
                  <CustomCombobox
                    // Convert each chart-of-accounts entry into an object with id and name.
                    items={chartOfAccounts.map((account) => ({
                      id: account.accountId,
                      name: account.name,
                    }))}
                    // Set the current value by finding the matching account.
                    value={
                      field.value
                        ? {
                            id: field.value,
                            name:
                              chartOfAccounts.find(
                                (account) => account.accountId === field.value
                              )?.name || '',
                          }
                        : null
                    }
                    onChange={(selectedItem) =>
                      field.onChange(selectedItem?.id || null)
                    }
                  />

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`journalDetails.${index}.costCenterId`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
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
                        field.onChange(
                          value ? Number.parseInt(value.id, 10) : null
                        )
                      }
                      placeholder="Select cost center"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`journalDetails.${index}.departmentId`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CustomCombobox
                      items={departments.map((department) => ({
                        id: department.departmentID.toString(),
                        name: department.departmentName || 'Unnamed Department',
                      }))}
                      value={
                        field.value
                          ? {
                              id: field.value.toString(),
                              name:
                                departments.find(
                                  (d) => d.departmentID === field.value
                                )?.departmentName || '',
                            }
                          : null
                      }
                      onChange={(value) =>
                        field.onChange(
                          value ? Number.parseInt(value.id, 10) : null
                        )
                      }
                    />
                  </FormControl>
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
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border rounded-md">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveEntry(index)}
                disabled={entries.length <= 2}
              >
                <Trash2 className="w-10 h-10" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" onClick={addEntry}>
        Add Another Line
      </Button>

      <div className="flex justify-between items-center pt-4">
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
