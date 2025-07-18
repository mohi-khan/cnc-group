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
import React, { useCallback, useEffect, useRef } from 'react'
import { toast } from '@/hooks/use-toast'

import { CustomCombobox } from '@/utils/custom-combobox'
import {
  getAllChartOfAccounts,
  getAllCostCenters,
  getAllDepartments,
} from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

// Define the props for the JournalVoucherDetailsSection component
interface JournalVoucherDetailsSectionProps {
  form: UseFormReturn<JournalEntryWithDetails>
  onAddEntry: () => void
  onRemoveEntry: (index: number) => void
}

export function JournalVoucherDetailsSection({
  form,
  onRemoveEntry,
}: JournalVoucherDetailsSectionProps) {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  //state variables
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([])
  const [chartOfAccounts, setChartOfAccounts] = React.useState<AccountsHead[]>(
    []
  )
  const [departments, setDepartments] = React.useState<GetDepartment[]>([])
  const newRowRef = useRef<HTMLButtonElement>(null)
  const entries = form.watch('journalDetails')

  // Fetching chart of accounts data
  const fetchChartOfAccounts = useCallback(async () => {
    const response = await getAllChartOfAccounts(token)
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
  }, [token])

  // Fetching cost centers data
  const fetchCostCenters = useCallback(async () => {
    const data = await getAllCostCenters(token)
    if (data.error || !data.data) {
      console.error('Error getting cost centers:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get cost centers',
      })
    } else {
      setCostCenters(data.data)
    }
  }, [token])

  // Fetching departments data
  const fetchDepartments = useCallback(async() => {
    const response = await getAllDepartments(token)
    if (response.error || !response.data) {
      console.error('Error getting departments:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get departments',
      })
    } else {
      setDepartments(response.data)
    }
  }, [token])

  useEffect(() => {
    fetchChartOfAccounts()
    fetchCostCenters()
    fetchDepartments()
  }, [fetchChartOfAccounts, fetchCostCenters, fetchDepartments])

  useEffect(() => {
    // to initialize with two rows
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

  // Function to add a new entry to the journal details
  const addEntry = () => {
    const currentEntries = [...entries]
    const firstEntry = currentEntries[0]

    let newEntry = {
      // bankaccountid: 0,
      accountId: 0,
      debit: 0,
      credit: 0,
      notes: '',
      createdBy: 0,
      analyticTags: null,
      taxId: null,
    }

    if (firstEntry && firstEntry.debit > 0) {
      let totalUsedCredit = currentEntries.reduce((sum, entry, index) => {
        return index === 0 ? sum : sum + entry.credit
      }, 0)
      newEntry.credit = firstEntry.debit - totalUsedCredit
    }

    form.setValue('journalDetails', [...entries, newEntry])
  }

  const handleDebitChange = (index: number, value: string) => {
    const updatedEntries = [...entries]
    updatedEntries[index].debit = value === '' ? 0 : Number(value)
    updatedEntries[index].credit = 0

    if (index === 0) {
      const debitValue = value === '' ? 0 : Number(value)
      let remainingCredit = debitValue

      // Start from index 1 and distribute remaining amount
      for (let i = 1; i < updatedEntries.length; i++) {
        if (i === updatedEntries.length - 1) {
          // Last entry gets remaining amount
          updatedEntries[i].credit = Number(remainingCredit.toFixed(2))
        } else {
          // Use existing credit value if available, otherwise use remaining credit
          const existingCredit = updatedEntries[i].credit || 0
          updatedEntries[i].credit = existingCredit || Number(remainingCredit.toFixed(2))
        }
        updatedEntries[i].debit = 0
        remainingCredit -= updatedEntries[i].credit
        form.setValue(`journalDetails.${i}.credit`, updatedEntries[i].credit)
        form.setValue(`journalDetails.${i}.debit`, updatedEntries[i].debit)
      }
    }

    form.setValue('journalDetails', updatedEntries)
  }

  const handleCreditChange = (index: number, value: string) => {
    const updatedEntries = [...entries]
    updatedEntries[index].credit = value === '' ? 0 : Number(value)
    updatedEntries[index].debit = 0

    if (index > 0) {
      const firstEntryDebit = updatedEntries[0].debit
      let usedCredit = 0

      // Calculate used credit from entries 1 to current index
      for (let i = 1; i <= index; i++) {
        usedCredit += updatedEntries[i].credit
      }

      // Distribute remaining amount to next entries if any
      const remainingCredit = firstEntryDebit - usedCredit
      for (let i = index + 1; i < updatedEntries.length; i++) {
        if (i === updatedEntries.length - 1) {
          updatedEntries[i].credit = Number(remainingCredit.toFixed(2))
        } else {
          updatedEntries[i].credit = 0
        }
        updatedEntries[i].debit = 0
        form.setValue(`journalDetails.${i}.credit`, updatedEntries[i].credit)
        form.setValue(`journalDetails.${i}.debit`, updatedEntries[i].debit)
      }
    }

    form.setValue('journalDetails', updatedEntries)
  }

  // Function to calculate the total debit and credit values
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
          <div>Unit</div>
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
                    items={chartOfAccounts.filter((account) => account.isActive).map((account) => ({
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
                    placeholder="Select an account"
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
                      items={costCenters.filter((center) => center.isActive).map((center) => ({
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
                      items={departments.filter((department) => department.isActive).map((department) => ({
                        id: department.departmentID.toString(),
                        name: department.departmentName || 'Unnamed Unit',
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
                      placeholder="Select unit"
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
                      onChange={(e) => handleDebitChange(index, e.target.value)}
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
                      onChange={(e) => handleCreditChange(index, e.target.value)}
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
