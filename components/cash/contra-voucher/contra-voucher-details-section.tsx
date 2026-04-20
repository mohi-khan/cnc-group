'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
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
import { getAccountClosingBalance } from '@/api/chart-of-accounts-api'
import { formatIndianNumber } from '@/utils/Formatindiannumber'

interface ContraVoucherDetailsSectionProps {
  form: UseFormReturn<JournalEntryWithDetails>
  onRemoveEntry: (index: number) => void
  isEdit?: boolean
}

export function ContraVoucherDetailsSection({
  form,
  onRemoveEntry,
  isEdit = false,
}: ContraVoucherDetailsSectionProps) {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [chartOfAccounts, setChartOfAccounts] = useState<AccountsHead[]>([])
  const [cashCoa, setCashCoa] = React.useState<AccountsHead[]>([])
  const [disabledStates, setDisabledStates] = useState<
    Record<number, { bank: boolean; account: boolean }>
  >({})
  const [userId, setUserId] = useState<number>()

  // Closing balance state: keyed by row index
  const [accountBalances, setAccountBalances] = useState<Record<number, number>>({})

  const selectedCompanyId = form.watch('journalEntry.companyId')

  const filteredBankAccounts = useMemo(() => {
    if (!selectedCompanyId) return []
    return accounts.filter(
      (account) => account.isActive && account.companyId === selectedCompanyId
    )
  }, [accounts, selectedCompanyId])

  React.useEffect(() => {
    if (userData) setUserId(userData.userId)
  }, [userData])

  const entries = form.watch('journalDetails')

  useEffect(() => {
    if (selectedCompanyId) {
      const currentEntries = form.getValues('journalDetails')
      const updatedEntries = currentEntries.map((entry) => ({
        ...entry,
        bankaccountid: 0,
      }))
      form.setValue('journalDetails', updatedEntries)

      setDisabledStates((prev) => {
        const newStates = { ...prev }
        Object.keys(newStates).forEach((key) => {
          newStates[Number(key)] = { ...newStates[Number(key)], bank: false }
        })
        return newStates
      })

      // Clear all balances when company changes
      setAccountBalances({})
    }
  }, [selectedCompanyId, form])

  useEffect(() => {
    if (entries.length === 0) {
      form.setValue('journalDetails', [
        {
          bankaccountid: 0,
          accountId: 0,
          debit: 0,
          credit: 0,
          notes: '',
          createdBy: 0,
          analyticTags: null,
          taxId: null,
        },
      ])
    }
  }, [entries.length, form])

  const fetchChartOfAccounts = useCallback(async () => {
    const response = await getAllChartOfAccounts(token)
    if (response.error || !response.data) {
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to fetch Chart of Accounts',
      })
    } else {
      setChartOfAccounts(response.data)
    }
  }, [token])

  React.useEffect(() => {
    const isCashCoa = chartOfAccounts?.filter((account) => account.isCash === true)
    setCashCoa(isCashCoa || [])
  }, [chartOfAccounts])

  const fetchBankAccounts = useCallback(async () => {
    const response = await getAllBankAccounts(token)
    if (response.error || !response.data) {
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to fetch Bank Accounts',
      })
    } else {
      setAccounts(response.data)
    }
  }, [token])

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
  }, [fetchBankAccounts, fetchChartOfAccounts])

  // Fetch and store the closing balance for a given account + row index
  const fetchClosingBalance = async (accountId: number, index: number) => {
    if (!accountId || !selectedCompanyId) return
    try {
      const response = await getAccountClosingBalance(
        accountId,
        selectedCompanyId,
        token
      )
      if (response?.data?.balance !== undefined) {
        setAccountBalances((prev) => ({
          ...prev,
          [index]: response.data!.balance,
        }))
      }
    } catch (err) {
      console.error('[fetchClosingBalance] API call threw an error:', err)
    }
  }

  const updateDisabledStates = (
    index: number,
    field: 'bank' | 'account',
    value: boolean
  ) => {
    setDisabledStates((prev) => ({
      ...prev,
      [index]: { ...prev[index], [field]: value },
    }))
  }

  const handleBankAccountChange = (index: number, bankAccountId: number) => {
    const selectedBank = filteredBankAccounts.find(
      (account) => account.id === bankAccountId
    )
    const glAccountId = selectedBank?.glAccountId

    if (glAccountId && glAccountIdToChartName[glAccountId]) {
      const { id } = glAccountIdToChartName[glAccountId]
      form.setValue(`journalDetails.${index}.accountId`, id)
      updateDisabledStates(index, 'account', true)
      // Fetch closing balance for the auto-set GL account
      fetchClosingBalance(id, index)
    } else {
      updateDisabledStates(index, 'account', false)
      // Clear balance if no GL account linked
      setAccountBalances((prev) => {
        const updated = { ...prev }
        delete updated[index]
        return updated
      })
    }
  }

  const handleAccountNameChange = (index: number, accountId: number) => {
    const accountName = chartOfAccounts.find(
      (account) => account.accountId === accountId
    )?.name
    form.setValue(`journalDetails.${index}.accountId`, accountId)

    if (accountId) {
      fetchClosingBalance(accountId, index)
    } else {
      setAccountBalances((prev) => {
        const updated = { ...prev }
        delete updated[index]
        return updated
      })
    }

    if (accountName?.toLowerCase() === 'cash in hand') {
      updateDisabledStates(index, 'bank', true)
    } else {
      updateDisabledStates(index, 'bank', false)
    }
  }

  /**
   * Core formula:
   *   remaining = totalDebits - totalCredits (across ALL rows)
   *
   * positive → debits exceed credits → new row pre-fills credit
   * negative → credits exceed debits → new row pre-fills debit
   */
  const getRemainingBalance = (currentEntries: typeof entries) => {
    const totalDebits = currentEntries.reduce((sum, e) => sum + (e.debit || 0), 0)
    const totalCredits = currentEntries.reduce((sum, e) => sum + (e.credit || 0), 0)
    return Number((totalDebits - totalCredits).toFixed(2))
  }

  const handleDebitChange = (index: number, value: string) => {
    const updatedEntries = entries.map((e) => ({ ...e }))
    updatedEntries[index].debit = value === '' ? 0 : Number(value)
    // A row is either debit OR credit
    updatedEntries[index].credit = 0

    updatedEntries.forEach((entry, i) => {
      form.setValue(`journalDetails.${i}.debit`, entry.debit)
      form.setValue(`journalDetails.${i}.credit`, entry.credit)
    })
    form.setValue('journalDetails', updatedEntries)
  }

  const handleCreditChange = (index: number, value: string) => {
    const updatedEntries = entries.map((e) => ({ ...e }))
    updatedEntries[index].credit = value === '' ? 0 : Number(value)
    // A row is either debit OR credit
    updatedEntries[index].debit = 0

    updatedEntries.forEach((entry, i) => {
      form.setValue(`journalDetails.${i}.debit`, entry.debit)
      form.setValue(`journalDetails.${i}.credit`, entry.credit)
    })
    form.setValue('journalDetails', updatedEntries)
  }

  const addEntry = () => {
    const currentEntries = entries.map((e) => ({ ...e }))

    // remaining > 0 → debits exceed credits → pre-fill credit
    // remaining < 0 → credits exceed debits → pre-fill debit
    const remaining = getRemainingBalance(currentEntries)

    const newEntry = {
      bankaccountid: 0,
      accountId: cashCoa[0]?.accountId || 0,
      debit: remaining < 0 ? Math.abs(remaining) : 0,
      credit: remaining > 0 ? remaining : 0,
      notes: '',
      createdBy: userData?.userId || 0,
      analyticTags: null,
      taxId: null,
    }

    const newEntries = [...currentEntries, newEntry]
    form.setValue('journalDetails', newEntries)

    const newIndex = newEntries.length - 1
    form.setValue(`journalDetails.${newIndex}.debit`, newEntry.debit)
    form.setValue(`journalDetails.${newIndex}.credit`, newEntry.credit)

    // Fetch balance for the pre-set cashCoa account on new row
    if (cashCoa[0]?.accountId) {
      fetchClosingBalance(cashCoa[0].accountId, newIndex)
    }

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

  const handleRemoveEntry = (index: number) => {
    if (entries.length > 2) {
      onRemoveEntry(index)
      // Clean up balance for removed row
      setAccountBalances((prev) => {
        const updated = { ...prev }
        delete updated[index]
        return updated
      })
    }
  }

  return (
    <div className="space-y-4 border pb-4 mb-4 rounded-md shadow-md">
      <div className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,auto] gap-2 items-center text-sm font-medium border-b p-4 bg-slate-200 shadow-md">
        <div>Bank Account</div>
        <div>Account Name</div>
        <div>Debit</div>
        <div>Credit</div>
        <div>Notes</div>
        <div>Action</div>
      </div>

      {entries.map((entry, index) => {
        // Derived flag for whether a closing balance exists for this row
        const hasBalance = accountBalances[index] !== undefined

        return (
          <div
            key={index}
            className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,auto] gap-2 items-center px-4"
          >
            <FormField
              control={form.control}
              name={`journalDetails.${index}.bankaccountid`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <CustomCombobox
                    items={filteredBankAccounts.map((account) => ({
                      id: account.id,
                      name: `${account.bankName}-${account.accountName} - ${account.accountNumber}`,
                    }))}
                    value={
                      field.value && selectedCompanyId
                        ? {
                            id: field.value,
                            name:
                              (() => {
                                const found = filteredBankAccounts.find(
                                  (account) => Number(account.id) === Number(field.value)
                                )
                                return found
                                  ? `${found.bankName}-${found.accountName} - ${found.accountNumber}`
                                  : ''
                              })(),
                          }
                        : null
                    }
                    onChange={(selectedItem) => {
                      const selectedId = selectedItem?.id || null
                      field.onChange(selectedId)
                      if (selectedId !== null) {
                        handleBankAccountChange(index, selectedId)
                      }
                    }}
                    placeholder={
                      selectedCompanyId ? 'Select a Bank Account' : 'Select company first'
                    }
                    disabled={
                      !selectedCompanyId ||
                      filteredBankAccounts.length === 0 ||
                      disabledStates[index]?.bank
                    }
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
                  <div className="flex flex-col">
                    <CustomCombobox
                      items={chartOfAccounts
                        .filter((account) => account.isActive)
                        .map((account) => ({
                          id: account.accountId,
                          name: account.name,
                        }))}
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
                      onChange={(selectedItem) => {
                        const value = selectedItem?.id || null
                        field.onChange(Number(value))
                        handleAccountNameChange(index, Number(value))
                      }}
                      placeholder="Select an Account"
                      disabled={disabledStates[index]?.account}
                    />

                    {/* Balance row — always reserves space */}
                    <div className="min-h-[18px] px-1 mt-0.5">
                      {hasBalance && (
                        <p className="flex items-center gap-1">
                          <span className="text-[10px] text-black font-bold">
                            Balance:
                          </span>
                          <span
                            className={`text-[11px] font-semibold tabular-nums ${
                              accountBalances[index] > 0
                                ? 'text-emerald-600'
                                : accountBalances[index] < 0
                                  ? 'text-red-500'
                                  : 'text-slate-400'
                            }`}
                          >
                            {formatIndianNumber(accountBalances[index] || 0)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
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
                      onWheel={(e) =>
                        (e.target as HTMLInputElement).blur()
                      }
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                      onWheel={(e) =>
                        (e.target as HTMLInputElement).blur()
                      }
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
              variant="outline"
              size="icon"
              onClick={() => handleRemoveEntry(index)}
              disabled={entries.length <= 2}
            >
              <Trash2 className="w-10 h-10" />
            </Button>
          </div>
        )
      })}

      {!isEdit && (
        <Button type="button" className="mx-4" variant="outline" onClick={addEntry}>
          Add Another
        </Button>
      )}

      <div className="mt-4 flex justify-between gap-2 items-center px-4">
        <div>
          <p>Total Debit: {totals.debit.toFixed(2)}</p>
          <p>Total Credit: {totals.credit.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}



// 'use client'

// import React, { useEffect, useState, useMemo, useCallback } from 'react'
// import type { UseFormReturn } from 'react-hook-form'
// import { Button } from '@/components/ui/button'
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { Trash2 } from 'lucide-react'
// import type {
//   JournalEntryWithDetails,
//   BankAccount,
//   AccountsHead,
// } from '@/utils/type'
// import { toast } from '@/hooks/use-toast'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import {
//   getAllBankAccounts,
//   getAllChartOfAccounts,
// } from '@/api/common-shared-api'

// interface ContraVoucherDetailsSectionProps {
//   form: UseFormReturn<JournalEntryWithDetails>
//   onRemoveEntry: (index: number) => void
//   isEdit?: boolean
// }

// export function ContraVoucherDetailsSection({
//   form,
//   onRemoveEntry,
//   isEdit = false,
// }: ContraVoucherDetailsSectionProps) {
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)

//   const [accounts, setAccounts] = useState<BankAccount[]>([])
//   const [chartOfAccounts, setChartOfAccounts] = useState<AccountsHead[]>([])
//   const [cashCoa, setCashCoa] = React.useState<AccountsHead[]>([])
//   const [disabledStates, setDisabledStates] = useState<
//     Record<number, { bank: boolean; account: boolean }>
//   >({})
//   const [userId, setUserId] = useState<number>()

//   const selectedCompanyId = form.watch('journalEntry.companyId')

//   const filteredBankAccounts = useMemo(() => {
//     if (!selectedCompanyId) return []
//     return accounts.filter(
//       (account) => account.isActive && account.companyId === selectedCompanyId
//     )
//   }, [accounts, selectedCompanyId])

//   React.useEffect(() => {
//     if (userData) setUserId(userData.userId)
//   }, [userData])

//   const entries = form.watch('journalDetails')

//   useEffect(() => {
//     if (selectedCompanyId) {
//       const currentEntries = form.getValues('journalDetails')
//       const updatedEntries = currentEntries.map((entry) => ({
//         ...entry,
//         bankaccountid: 0,
//       }))
//       form.setValue('journalDetails', updatedEntries)

//       setDisabledStates((prev) => {
//         const newStates = { ...prev }
//         Object.keys(newStates).forEach((key) => {
//           newStates[Number(key)] = { ...newStates[Number(key)], bank: false }
//         })
//         return newStates
//       })
//     }
//   }, [selectedCompanyId, form])

//   useEffect(() => {
//     if (entries.length === 0) {
//       form.setValue('journalDetails', [
//         {
//           bankaccountid: 0,
//           accountId: 0,
//           debit: 0,
//           credit: 0,
//           notes: '',
//           createdBy: 0,
//           analyticTags: null,
//           taxId: null,
//         },
//       ])
//     }
//   }, [entries.length, form])

//   const fetchChartOfAccounts = useCallback(async () => {
//     const response = await getAllChartOfAccounts(token)
//     if (response.error || !response.data) {
//       toast({
//         title: 'Error',
//         description: response.error?.message || 'Failed to fetch Chart of Accounts',
//       })
//     } else {
//       setChartOfAccounts(response.data)
//     }
//   }, [token])

//   React.useEffect(() => {
//     const isCashCoa = chartOfAccounts?.filter((account) => account.isCash === true)
//     setCashCoa(isCashCoa || [])
//   }, [chartOfAccounts])

//   const fetchBankAccounts = useCallback(async () => {
//     const response = await getAllBankAccounts(token)
//     if (response.error || !response.data) {
//       toast({
//         title: 'Error',
//         description: response.error?.message || 'Failed to fetch Bank Accounts',
//       })
//     } else {
//       setAccounts(response.data)
//     }
//   }, [token])

//   const glAccountIdToChartName = useMemo(() => {
//     const map: Record<number, { name: string; id: number }> = {}
//     chartOfAccounts.forEach((account) => {
//       map[account.accountId] = { name: account.name, id: account.accountId }
//     })
//     return map
//   }, [chartOfAccounts])

//   useEffect(() => {
//     fetchChartOfAccounts()
//     fetchBankAccounts()
//   }, [fetchBankAccounts, fetchChartOfAccounts])

//   const updateDisabledStates = (
//     index: number,
//     field: 'bank' | 'account',
//     value: boolean
//   ) => {
//     setDisabledStates((prev) => ({
//       ...prev,
//       [index]: { ...prev[index], [field]: value },
//     }))
//   }

//   const handleBankAccountChange = (index: number, bankAccountId: number) => {
//     const selectedBank = filteredBankAccounts.find(
//       (account) => account.id === bankAccountId
//     )
//     const glAccountId = selectedBank?.glAccountId

//     if (glAccountId && glAccountIdToChartName[glAccountId]) {
//       const { id } = glAccountIdToChartName[glAccountId]
//       form.setValue(`journalDetails.${index}.accountId`, id)
//       updateDisabledStates(index, 'account', true)
//     } else {
//       updateDisabledStates(index, 'account', false)
//     }
//   }

//   const handleAccountNameChange = (index: number, accountId: number) => {
//     const accountName = chartOfAccounts.find(
//       (account) => account.accountId === accountId
//     )?.name
//     form.setValue(`journalDetails.${index}.accountId`, accountId)
//     if (accountName?.toLowerCase() === 'cash in hand') {
//       updateDisabledStates(index, 'bank', true)
//     } else {
//       updateDisabledStates(index, 'bank', false)
//     }
//   }

//   /**
//    * Core formula:
//    *   remaining = totalDebits - totalCredits (across ALL rows)
//    *
//    * positive → debits exceed credits → new row pre-fills credit
//    * negative → credits exceed debits → new row pre-fills debit
//    */
//   const getRemainingBalance = (currentEntries: typeof entries) => {
//     const totalDebits = currentEntries.reduce((sum, e) => sum + (e.debit || 0), 0)
//     const totalCredits = currentEntries.reduce((sum, e) => sum + (e.credit || 0), 0)
//     return Number((totalDebits - totalCredits).toFixed(2))
//   }

//   const handleDebitChange = (index: number, value: string) => {
//     const updatedEntries = entries.map((e) => ({ ...e }))
//     updatedEntries[index].debit = value === '' ? 0 : Number(value)
//     // A row is either debit OR credit
//     updatedEntries[index].credit = 0

//     updatedEntries.forEach((entry, i) => {
//       form.setValue(`journalDetails.${i}.debit`, entry.debit)
//       form.setValue(`journalDetails.${i}.credit`, entry.credit)
//     })
//     form.setValue('journalDetails', updatedEntries)
//   }

//   const handleCreditChange = (index: number, value: string) => {
//     const updatedEntries = entries.map((e) => ({ ...e }))
//     updatedEntries[index].credit = value === '' ? 0 : Number(value)
//     // A row is either debit OR credit
//     updatedEntries[index].debit = 0

//     updatedEntries.forEach((entry, i) => {
//       form.setValue(`journalDetails.${i}.debit`, entry.debit)
//       form.setValue(`journalDetails.${i}.credit`, entry.credit)
//     })
//     form.setValue('journalDetails', updatedEntries)
//   }

//   const addEntry = () => {
//     const currentEntries = entries.map((e) => ({ ...e }))

//     // remaining > 0 → debits exceed credits → pre-fill credit
//     // remaining < 0 → credits exceed debits → pre-fill debit
//     const remaining = getRemainingBalance(currentEntries)

//     const newEntry = {
//       bankaccountid: 0,
//       accountId: cashCoa[0]?.accountId || 0,
//       debit: remaining < 0 ? Math.abs(remaining) : 0,
//       credit: remaining > 0 ? remaining : 0,
//       notes: '',
//       createdBy: userData?.userId || 0,
//       analyticTags: null,
//       taxId: null,
//     }

//     const newEntries = [...currentEntries, newEntry]
//     form.setValue('journalDetails', newEntries)

//     const newIndex = newEntries.length - 1
//     form.setValue(`journalDetails.${newIndex}.debit`, newEntry.debit)
//     form.setValue(`journalDetails.${newIndex}.credit`, newEntry.credit)

//     setDisabledStates((prev) => ({
//       ...prev,
//       [entries.length]: { bank: false, account: false },
//     }))
//   }

//   const calculateTotals = () => {
//     return entries.reduce(
//       (totals, entry) => {
//         totals.debit += entry.debit
//         totals.credit += entry.credit
//         return totals
//       },
//       { debit: 0, credit: 0 }
//     )
//   }

//   const totals = calculateTotals()

//   const handleRemoveEntry = (index: number) => {
//     if (entries.length > 2) onRemoveEntry(index)
//   }

//   return (
//     <div className="space-y-4 border pb-4 mb-4 rounded-md shadow-md">
//       <div className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,auto] gap-2 items-center text-sm font-medium border-b p-4 bg-slate-200 shadow-md">
//         <div>Bank Account</div>
//         <div>Account Name</div>
//         <div>Debit</div>
//         <div>Credit</div>
//         <div>Notes</div>
//         <div>Action</div>
//       </div>

//       {entries.map((entry, index) => (
//         <div
//           key={index}
//           className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,auto] gap-2 items-center px-4"
//         >
//           <FormField
//             control={form.control}
//             name={`journalDetails.${index}.bankaccountid`}
//             render={({ field }) => (
//               <FormItem className="flex flex-col">
//                 <CustomCombobox
//                   items={filteredBankAccounts.map((account) => ({
//                     id: account.id,
//                     name: `${account.bankName}-${account.accountName} - ${account.accountNumber}`,
//                   }))}
//                   value={
//                     field.value && selectedCompanyId
//                       ? {
//                           id: field.value,
//                           name:
//                             (() => {
//                               const found = filteredBankAccounts.find(
//                                 (account) => Number(account.id) === Number(field.value)
//                               )
//                               return found
//                                 ? `${found.bankName}-${found.accountName} - ${found.accountNumber}`
//                                 : ''
//                             })(),
//                         }
//                       : null
//                   }
//                   onChange={(selectedItem) => {
//                     const selectedId = selectedItem?.id || null
//                     field.onChange(selectedId)
//                     if (selectedId !== null) {
//                       handleBankAccountChange(index, selectedId)
//                     }
//                   }}
//                   placeholder={
//                     selectedCompanyId ? 'Select a Bank Account' : 'Select company first'
//                   }
//                   disabled={
//                     !selectedCompanyId ||
//                     filteredBankAccounts.length === 0 ||
//                     disabledStates[index]?.bank
//                   }
//                 />
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name={`journalDetails.${index}.accountId`}
//             render={({ field }) => (
//               <FormItem>
//                 <CustomCombobox
//                   items={chartOfAccounts
//                     .filter((account) => account.isActive)
//                     .map((account) => ({
//                       id: account.accountId,
//                       name: account.name,
//                     }))}
//                   value={
//                     field.value
//                       ? {
//                           id: field.value,
//                           name:
//                             chartOfAccounts.find(
//                               (account) => account.accountId === field.value
//                             )?.name || '',
//                         }
//                       : null
//                   }
//                   onChange={(selectedItem) => {
//                     const value = selectedItem?.id || null
//                     field.onChange(Number(value))
//                     handleAccountNameChange(index, Number(value))
//                   }}
//                   placeholder="Select an Account"
//                   disabled={disabledStates[index]?.account}
//                 />
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name={`journalDetails.${index}.debit`}
//             render={({ field }) => (
//               <FormItem>
//                 <FormControl>
//                   <Input
//                     type="number"
//                     {...field}
//                     value={field.value === 0 ? '' : field.value}
//                     onChange={(e) => handleDebitChange(index, e.target.value)}
//                      onWheel={(e) =>
//                                 (e.target as HTMLInputElement).blur()
//                               }
//                               className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" // 👈 Add this
//                   />
                  
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name={`journalDetails.${index}.credit`}
//             render={({ field }) => (
//               <FormItem>
//                 <FormControl>
//                   <Input
//                     type="number"
//                     {...field}
//                     value={field.value === 0 ? '' : field.value}
//                     onChange={(e) => handleCreditChange(index, e.target.value)}
//                      onWheel={(e) =>
//                                 (e.target as HTMLInputElement).blur()
//                               }
//                               className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" // 👈 Add this
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name={`journalDetails.${index}.notes`}
//             render={({ field }) => (
//               <FormItem>
//                 <FormControl>
//                   <Input {...field} value={field.value || ''} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <Button
//             type="button"
//             variant="outline"
//             size="icon"
//             onClick={() => handleRemoveEntry(index)}
//             disabled={entries.length <= 2}
//           >
//             <Trash2 className="w-10 h-10" />
//           </Button>
//         </div>
//       ))}

//       {!isEdit && (
//         <Button type="button" className="mx-4" variant="outline" onClick={addEntry}>
//           Add Another
//         </Button>
//       )}

//       <div className="mt-4 flex justify-between gap-2 items-center px-4">
//         <div>
//           <p>Total Debit: {totals.debit.toFixed(2)}</p>
//           <p>Total Credit: {totals.credit.toFixed(2)}</p>
//         </div>
//       </div>
//     </div>
//   )
// }

