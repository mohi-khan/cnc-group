'use client'

import React, { useEffect, useState, useMemo, Fragment, useCallback } from 'react'
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
  JournalEntryWithDetails,
  BankAccount,
  AccountsHead,
} from '@/utils/type'
import { toast } from '@/hooks/use-toast'
import { CustomCombobox } from '@/utils/custom-combobox'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import {
  getAllBankAccounts,
  getAllChartOfAccounts,
} from '@/api/common-shared-api'

interface ContraVoucherDetailsSectionProps {
  form: UseFormReturn<JournalEntryWithDetails>
  onRemoveEntry: (index: number) => void
}

export function ContraVoucherDetailsSection({
  form,
  onRemoveEntry,
}: ContraVoucherDetailsSectionProps) {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  // State variables
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [chartOfAccounts, setChartOfAccounts] = useState<AccountsHead[]>([])
  const [disabledStates, setDisabledStates] = useState<
    Record<number, { bank: boolean; account: boolean }>
  >({})
  const [userId, setUserId] = useState<number>()

  React.useEffect(() => {
    if (userData) {
      setUserId(userData.userId)
      console.log(
        'Current userId from localStorage in everywhere:',
        userData.userId
      )
    } else {
      console.log('No user data found in localStorage')
    }
  }, [userData])

  const entries = form.watch('journalDetails')

  // Initialize with one entry if empty
  useEffect(() => {
    if (entries.length === 0) {
      const defaultEntry = {
        bankaccountid: 0,
        accountId: 0,
        debit: 0,
        credit: 0,
        notes: '',
        createdBy: 0,
        analyticTags: null,
        taxId: null,
      }

      form.setValue('journalDetails', [defaultEntry])
    }
  }, [entries.length, form])

  const fetchChartOfAccounts = useCallback(async () => {
    const response = await getAllChartOfAccounts(token)
    if (response.error || !response.data) {
      toast({
        title: 'Error',
        description:
          response.error?.message || 'Failed to fetch Chart of Accounts',
      })
    } else {
      setChartOfAccounts(response.data)
    }
  },[token])

  const fetchBankAccounts = useCallback(async () => {
  const response = await getAllBankAccounts(token);
  if (response.error || !response.data) {
    toast({
      title: 'Error',
      description: response.error?.message || 'Failed to fetch Bank Accounts',
    });
  } else {
    setAccounts(response.data);
  }
}, [token]);

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
  }, [fetchBankAccounts,fetchChartOfAccounts]) // Added fetchBankAccounts to dependencies

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

  const handleNumberInput = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const sanitizedValue = value.replace(/[^\d.]/g, '')

    // Ensure only one decimal point
    const parts = sanitizedValue.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }

    return sanitizedValue
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

  const addEntry = () => {
    const currentEntries = [...entries]
    const firstEntry = currentEntries[0]

    let newEntry = {
      bankaccountid: 0,
      accountId: 0,
      debit: 0,
      credit: 0,
      notes: '',
      createdBy: userData?.userId,
      analyticTags: null,
      taxId: null,
    }

    if (firstEntry && firstEntry.debit > 0) {
      let totalUsedCredit = currentEntries.reduce((sum, entry, index) => {
        return index === 0 ? sum : sum + entry.credit
      }, 0)
      newEntry.credit = firstEntry.debit - totalUsedCredit
    }

    form.setValue('journalDetails', [...entries, {...newEntry, createdBy: userData?.userId || 0}])
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

  const handleRemoveEntry = (index: number) => {
    if (entries.length > 2) {
      onRemoveEntry(index)
    }
  }
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
              <FormItem className="flex flex-col">
                <CustomCombobox
                  // Map each account to an object with id and name.
                  items={accounts.map((account) => ({
                    id: account.id,
                    name: `${account.accountName} - ${account.accountNumber}`,
                  }))}
                  // When a value is selected, find the corresponding account and set the field’s value.
                  value={
                    field.value
                      ? {
                          id: field.value,
                          name:
                            accounts.find(
                              (account) =>
                                Number(account.id) === Number(field.value)
                            )?.accountName +
                              ' - ' +
                              accounts.find(
                                (account) =>
                                  Number(account.id) === Number(field.value)
                              )?.accountNumber || '',
                        }
                      : null
                  }
                  // When an item is selected, update both the form field and perform additional logic.
                  onChange={(selectedItem) => {
                    const selectedId = selectedItem?.id || null
                    field.onChange(selectedId)
                    // Only trigger the bank account change if a valid account is selected.
                    if (selectedId !== null) {
                      handleBankAccountChange(index, selectedId)
                    }
                  }}
                  // Disable the combobox based on your external disabled state.
                  disabled={disabledStates[index]?.bank}
                />

                <FormMessage />
              </FormItem>
            )}
          />

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
                  // When an item is selected, update the field and trigger your account change handler.
                  onChange={(selectedItem) => {
                    const value = selectedItem?.id || null
                    field.onChange(Number(value))
                    handleAccountNameChange(index, Number(value))
                  }}
                  // Use the same disabled condition as before.
                  disabled={disabledStates[index]?.account}
                />

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
                    value={field.value === 0 ? '' : field.value}
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
                    value={field.value === 0 ? '' : field.value}
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

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveEntry(index)}
            disabled={entries.length <= 2}
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
          <p>Total Debit: {totals.debit.toFixed(2)}</p>
          <p>Total Credit: {totals.credit.toFixed(2)}</p>
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
