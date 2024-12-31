import React, { useEffect } from 'react'
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
  const [accounts, setAccounts] = React.useState<BankAccount[]>([])
  const [chartOfAccounts, setChartOfAccounts] = React.useState<
    ChartOfAccount[]
  >([])
  const [userId, setUserId] = React.useState<number | undefined>()

  const entries = form.watch('journalDetails')

  async function fetchChartOfAccounts() {
    const response = await getAllChartOfAccounts()
    if (response.error || !response.data) {
      toast({
        title: 'Error',
        description:
          response.error?.message || 'Failed to get Chart Of accounts',
      })
    } else {
      setChartOfAccounts(response.data)
    }
  }

  async function fetchBankAccounts() {
    const response = await getAllBankAccounts()
    if (response.error || !response.data) {
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get Bank accounts',
      })
    } else {
      setAccounts(response.data)
    }
  }

  const glAccountIdToChartName = React.useMemo(() => {
    const map: Record<number, { name: string; id: number }> = {}
    chartOfAccounts.forEach((account) => {
      map[account.accountId] = { name: account.name, id: account.accountId }
    })
    return map
  }, [chartOfAccounts])

  React.useEffect(() => {
    fetchChartOfAccounts()
    fetchBankAccounts()

    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUserId(userData?.userId)
    }
  }, [])

  const handleBankAccountChange = (index: number, bankAccountId: number) => {
    const selectedBank = accounts.find(
      (account) => account.id === bankAccountId
    )
    const glAccountId = selectedBank?.glAccountId

    if (glAccountId && glAccountIdToChartName[glAccountId]) {
      const { id } = glAccountIdToChartName[glAccountId]
      const updatedEntries = [...entries]
      updatedEntries[index].accountId = id
      form.setValue('journalDetails', updatedEntries)
    }
  }

  const handleAccountNameChange = (index: number, accountId: number) => {
    const accountName = chartOfAccounts.find(
      (account) => account.accountId === accountId
    )?.name
    const updatedEntries = [...entries]
    updatedEntries[index].accountId = accountId

    // If the account name is "Cash in Hand" (case-insensitive), disable bank account selection
    updatedEntries[index].isBankAccountDisabled =
      accountName?.toLowerCase() === 'cash in hand'

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
        createdBy: userId,
        analyticTags: null,
        taxId: null,
        isBankAccountDisabled: false,
      },
    ])
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
          className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-2 items-center"
        >
          {/* Bank Account Dropdown */}
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
                  disabled={entry.isBankAccountDisabled}
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
                        {account.accountName}-{account.accountNumber} -{' '}
                        {account.bankName}-{account.branchName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Account Name Dropdown */}
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

          {/* Debit Field */}
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

          {/* Credit Field */}
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

          {/* Notes Field */}
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

          {/* Remove Entry Button */}
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
        Add Another Note
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
