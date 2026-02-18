
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
    if (entries.length > 2) onRemoveEntry(index)
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

      {entries.map((entry, index) => (
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
            variant="outline"
            size="icon"
            onClick={() => handleRemoveEntry(index)}
            disabled={entries.length <= 2}
          >
            <Trash2 className="w-10 h-10" />
          </Button>
        </div>
      ))}

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

//   // ─── Auto-balance: adjusts debit rows to match total credits ─────────────────
//   const autoBalanceDebits = (updatedEntries: typeof entries) => {
//     let totalCredits = 0
//     for (let i = 0; i < updatedEntries.length; i++) {
//       totalCredits += updatedEntries[i].credit
//     }

//     let totalDebits = 0
//     const debitIndices: number[] = []
//     for (let i = 0; i < updatedEntries.length; i++) {
//       if (updatedEntries[i].debit > 0) {
//         totalDebits += updatedEntries[i].debit
//         debitIndices.push(i)
//       }
//     }

//     if (totalCredits > totalDebits && debitIndices.length > 0) {
//       const difference = totalCredits - totalDebits
//       const firstDebitIndex = debitIndices[0]
//       updatedEntries[firstDebitIndex].debit = Number(
//         (updatedEntries[firstDebitIndex].debit + difference).toFixed(2)
//       )
//       form.setValue(
//         `journalDetails.${firstDebitIndex}.debit`,
//         updatedEntries[firstDebitIndex].debit
//       )
//     }
//   }

//   const handleDebitChange = (index: number, value: string) => {
//     const updatedEntries = [...entries]
//     updatedEntries[index].debit = value === '' ? 0 : Number(value)
//     updatedEntries[index].credit = 0

//     const debitValue = value === '' ? 0 : Number(value)

//     let lastCreditIndex = -1
//     for (let i = index + 1; i < updatedEntries.length; i++) {
//       if (updatedEntries[i].debit > 0) break
//       lastCreditIndex = i
//     }

//     if (lastCreditIndex !== -1) {
//       let otherCredits = 0
//       for (let i = index + 1; i < lastCreditIndex; i++) {
//         otherCredits += updatedEntries[i].credit
//       }
//       updatedEntries[lastCreditIndex].credit = Number(
//         (debitValue - otherCredits).toFixed(2)
//       )
//       form.setValue(
//         `journalDetails.${lastCreditIndex}.credit`,
//         updatedEntries[lastCreditIndex].credit
//       )
//     }

//     form.setValue(`journalDetails.${index}.debit`, updatedEntries[index].debit)
//     form.setValue(`journalDetails.${index}.credit`, updatedEntries[index].credit)
//     form.setValue('journalDetails', updatedEntries)
//   }

//   const handleCreditChange = (index: number, value: string) => {
//     const updatedEntries = [...entries]
//     const oldCredit = updatedEntries[index].credit
//     updatedEntries[index].credit = value === '' ? 0 : Number(value)
//     updatedEntries[index].debit = 0

//     const difference = oldCredit - updatedEntries[index].credit

//     // Find next credit row and redistribute the difference
//     for (let i = index + 1; i < updatedEntries.length; i++) {
//       if (updatedEntries[i].debit > 0) break
//       if (updatedEntries[i].debit === 0) {
//         updatedEntries[i].credit = Number(
//           (updatedEntries[i].credit + difference).toFixed(2)
//         )
//         form.setValue(`journalDetails.${i}.credit`, updatedEntries[i].credit)
//         break
//       }
//     }

//     // ✅ Auto-balance debits to match total credits (same as journal voucher)
//     autoBalanceDebits(updatedEntries)

//     for (let i = 0; i < updatedEntries.length; i++) {
//       form.setValue(`journalDetails.${i}.debit`, updatedEntries[i].debit)
//       form.setValue(`journalDetails.${i}.credit`, updatedEntries[i].credit)
//     }

//     form.setValue('journalDetails', updatedEntries)
//   }

//   const addEntry = () => {
//     const currentEntries = [...entries]

//     let lastDebitIndex = -1
//     let lastDebitValue = 0
//     for (let i = currentEntries.length - 1; i >= 0; i--) {
//       if (currentEntries[i].debit > 0) {
//         lastDebitIndex = i
//         lastDebitValue = currentEntries[i].debit
//         break
//       }
//     }

//     let remainingCredit = 0
//     if (lastDebitIndex !== -1) {
//       let totalCreditsAfterLastDebit = 0
//       for (let i = lastDebitIndex + 1; i < currentEntries.length; i++) {
//         if (currentEntries[i].debit === 0) {
//           totalCreditsAfterLastDebit += currentEntries[i].credit
//         }
//       }
//       remainingCredit = lastDebitValue - totalCreditsAfterLastDebit
//     }

//     const newEntry = {
//       bankaccountid: 0,
//       accountId: cashCoa[0]?.accountId || 0,
//       debit: 0,
//       credit: Number(remainingCredit.toFixed(2)),
//       notes: '',
//       createdBy: userData?.userId || 0,
//       analyticTags: null,
//       taxId: null,
//     }

//     const newEntries = [...currentEntries, newEntry]
//     form.setValue('journalDetails', newEntries)

//     const newIndex = newEntries.length - 1
//     form.setValue(`journalDetails.${newIndex}.credit`, Number(remainingCredit.toFixed(2)))
//     form.setValue(`journalDetails.${newIndex}.debit`, 0)

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

