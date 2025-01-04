'use client'
import React, { useEffect, useState, useMemo } from 'react'
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
  JournalEntryWithDetails,
  BankAccount,
} from '@/utils/type'
import { toast } from '@/hooks/use-toast'
import {
  getAllChartOfAccounts,
  getAllBankAccounts,
} from '@/api/contra-voucher-api'

interface JournalVoucherDetailsSectionProps {
  form: UseFormReturn<JournalEntryWithDetails>
  onAddEntry: () => void
  onRemoveEntry: (index: number) => void
}

export function ContraVoucherDetailsSection({
  form,
  onAddEntry,
  onRemoveEntry,
}: JournalVoucherDetailsSectionProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([])
  const [disabledStates, setDisabledStates] = useState<
    Record<number, { bank: boolean; account: boolean }>
  >({})

  const entries = form.watch('journalDetails')

  const fetchChartOfAccounts = async () => {
    const response = await getAllChartOfAccounts()
    if (response.error || !response.data) {
      toast({
        title: 'Error',
        description:
          response.error?.message || 'Failed to fetch Chart of Accounts',
      })
    } else {
      setChartOfAccounts(response.data)
    }
  }

  const fetchBankAccounts = async () => {
    const response = await getAllBankAccounts()
    if (response.error || !response.data) {
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to fetch Bank Accounts',
      })
    } else {
      setAccounts(response.data)
    }
  }

  const glAccountIdToChartName = useMemo(() => {
    const map: Record<number, { name: string; id: number }> = {}
    chartOfAccounts.forEach((account) => {
      map[account.accountId] = { name: account.name, id: account.accountId }
    })
    return map
  }, [chartOfAccounts])

  useEffect(() => {
    fetchChartOfAccounts()
    fetchBankAccounts()
  }, [])

  const updateDisabledStates = (
    index: number,
    field: 'bank' | 'account',
    value: boolean
  ) => {
    setDisabledStates((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value,
      },
    }))
  }

  const handleBankAccountChange = (index: number, bankAccountId: number) => {
    const selectedBank = accounts.find(
      (account) => account.id === bankAccountId
    )
    const glAccountId = selectedBank?.glAccountId

    if (glAccountId && glAccountIdToChartName[glAccountId]) {
      const { id } = glAccountIdToChartName[glAccountId]
      form.setValue(`journalDetails.${index}.accountId`, id)
      updateDisabledStates(index, 'account', true)
    } else {
      updateDisabledStates(index, 'account', false)
    }
  }

  const handleAccountNameChange = (index: number, accountId: number) => {
    const accountName = chartOfAccounts.find(
      (account) => account.accountId === accountId
    )?.name
    form.setValue(`journalDetails.${index}.accountId`, accountId)

    if (accountName?.toLowerCase() === 'cash in hand') {
      updateDisabledStates(index, 'bank', true)
    } else {
      updateDisabledStates(index, 'bank', false)
    }
  }

  const addEntry = () => {
    form.setValue('journalDetails', [
      ...entries,
      {
        bankaccountid: 0,
        accountId: 0,
        debit: 0,
        credit: 0,
        notes: '',
        createdBy: 70,
        analyticTags: null,
        taxId: null,
      },
    ])
    setDisabledStates((prev) => ({
      ...prev,
      [entries.length]: { bank: false, account: false },
    }))
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
        <div>Bank Account</div>
        <div>Account Name</div>
        <div>Debit</div>
        <div>Credit</div>
        <div>Notes</div>
        <div>Action</div>
      </div>

      {entries.map((entry, index) => (
        <div
          key={index}
          className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-2 items-center text-sm font-medium"
        >
          <FormField
            control={form.control}
            name={`journalDetails.${index}.bankaccountid`}
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={(value) => {
                    field.onChange(Number(value))
                    handleBankAccountChange(index, Number(value))
                  }}
                  value={field.value?.toString()}
                  disabled={disabledStates[index]?.bank}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem
                        key={account.id}
                        value={account.id.toString()}
                      >
                        {account.accountName}-{account.accountNumber}
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
            name={`journalDetails.${index}.accountId`}
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={(value) => {
                    field.onChange(Number(value))
                    handleAccountNameChange(index, Number(value))
                  }}
                  value={field.value?.toString()}
                  disabled={disabledStates[index]?.account}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
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
            name={`journalDetails.${index}.debit`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="number" {...field} />
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
                  <Input type="number" {...field} />
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
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addEntry}>
        Add Another Entry
      </Button>

      <div className="mt-4 flex justify-between">
        <div>
          <p>Total Debit: {totals.debit}</p>
          <p>Total Credit: {totals.credit}</p>
        </div>
        <div>
          {isBalanced ? (
            <p className="text-green-500">Voucher is Balanced</p>
          ) : (
            <p className="text-red-500">Voucher is Not Balanced</p>
          )}
        </div>
      </div>
    </div>
  )
}
