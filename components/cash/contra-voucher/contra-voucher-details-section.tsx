'use client'

import React, { useEffect, useState, useMemo, Fragment } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
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
import { Trash2 } from 'lucide-react'
import type {
  ChartOfAccount,
  JournalEntryWithDetails,
  BankAccount,
} from '@/utils/type'
import { toast } from '@/hooks/use-toast'
import {
  getAllChartOfAccounts,
  getAllBankAccounts,
} from '@/api/contra-voucher-api'
import { Combobox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

interface ContraVoucherDetailsSectionProps {
  form: UseFormReturn<JournalEntryWithDetails>
  onRemoveEntry: (index: number) => void
}

export function ContraVoucherDetailsSection({
  form,
  onRemoveEntry,
}: ContraVoucherDetailsSectionProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([])
  const [accountQuery, setAccountQuery] = useState('')
  const [disabledStates, setDisabledStates] = useState<
    Record<number, { bank: boolean; account: boolean }>
  >({})
  const [userId, setUserId] = useState<number>()

  const filteredAccounts =
    accountQuery === ''
      ? accounts
      : accounts.filter(
          (account) =>
            account.accountName
              .toLowerCase()
              .includes(accountQuery.toLowerCase()) ||
            account.accountNumber
              .toLowerCase()
              .includes(accountQuery.toLowerCase())
        )

  React.useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUserId(userData.userId)
      console.log(
        'Current userId from localStorage in everywhere:',
        userData.userId
      )
    } else {
      console.log('No user data found in localStorage')
    }
  }, [])

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
  }, []) // Added fetchBankAccounts to dependencies

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
    form.setValue('journalDetails', updatedEntries)
  }

  const handleCreditChange = (index: number, value: string) => {
    const updatedEntries = [...entries]
    updatedEntries[index].credit = value === '' ? 0 : Number(value)
    updatedEntries[index].debit = 0
    form.setValue('journalDetails', updatedEntries)
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
        createdBy: userId ?? 0,
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
          {/* <FormField
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
                        {account.accountName}-
                        <span className="font-bold">
                          {account.accountNumber}{' '}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name={`journalDetails.${index}.bankaccountid`}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <Combobox
                  value={
                    accounts.find(
                      (account) => Number(account.id) === Number(field.value)
                    ) || null
                  }
                  onChange={(account) => {
                    if (account) {
                      field.onChange(account.id) // Ensure type consistency
                      handleBankAccountChange(index, account.id)
                    }
                  }}
                  disabled={disabledStates[index]?.bank}
                >
                  <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none">
                      <Combobox.Input
                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                        // Adjust displayValue as needed.
                        displayValue={(account: {
                          accountName: string
                          accountNumber: string
                        }) =>
                          account
                            ? `${account.accountName} - ${account.accountNumber}`
                            : ''
                        }
                        onChange={(event) =>
                          setAccountQuery(event.target.value)
                        }
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                      afterLeave={() => setAccountQuery('')}
                    >
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                        {filteredAccounts.length === 0 &&
                        accountQuery !== '' ? (
                          <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                            Nothing found.
                          </div>
                        ) : (
                          filteredAccounts.map((account) => (
                            <Combobox.Option
                              key={account.id}
                              value={account}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? 'bg-teal-600 text-white'
                                    : 'text-gray-900'
                                }`
                              }
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? 'font-medium' : 'font-normal'
                                    }`}
                                  >
                                    {account.accountName} -{' '}
                                    <span className="font-bold">
                                      {account.accountNumber}
                                    </span>
                                  </span>
                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active ? 'text-white' : 'text-teal-600'
                                      }`}
                                    >
                                      <CheckIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </Transition>
                  </div>
                </Combobox>
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
