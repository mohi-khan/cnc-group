'use client'

import { useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type {
  JournalEntryWithDetails,
  FormStateType,
  BoeGet,
} from '@/utils/type'
import type React from 'react'
import { useEffect } from 'react'

interface BoeReceiptFormProps {
  selectedBoe: BoeGet | null
  formState: FormStateType
  setFormState: React.Dispatch<React.SetStateAction<FormStateType>>
  validationError: string | null
  amountError: string | null
  onSubmit: (
    values: JournalEntryWithDetails,
    status: 'Draft' | 'Posted'
  ) => Promise<void>
  onClose: () => void
}

const BoeReceiptForm: React.FC<BoeReceiptFormProps> = ({
  selectedBoe,
  formState,
  setFormState,
  validationError,
  amountError,
  onSubmit,
  onClose,
}) => {
  const form = useFormContext<JournalEntryWithDetails>()
  const { control, watch, setValue, getValues } = form

  const watchedAmount = watch('journalEntry.amountTotal')
  const originalBoeAmount = selectedBoe?.usdAmount || 0

  // Update the form's amountTotal when the selectedBoe changes
  useEffect(() => {
    if (selectedBoe) {
      setValue('journalEntry.amountTotal', selectedBoe.usdAmount)
      // Also update the first journalDetail's debit/credit (for partner)
      // and the second journalDetail's debit/credit (for bank)
      const currentDetails = getValues('journalDetails')
      if (currentDetails && currentDetails.length >= 2) {
        // Partner detail (credit for receipt)
        setValue(`journalDetails.0.debit`, 0)
        setValue(`journalDetails.0.credit`, selectedBoe.usdAmount)
        // IMPORTANT: accountId for partner needs to be determined.
        // For now, it's 0. You might need to map selected partner to its GL account.
        setValue(`journalDetails.0.accountId`, 0) // This will be overwritten by user selection
        setValue(`journalDetails.0.resPartnerId`, null) // Will be set by user selection
        setValue(
          `journalDetails.0.notes`,
          `Receipt for BOE ${selectedBoe.boeNo}`
        )

        // Bank detail (debit for receipt)
        setValue(`journalDetails.1.debit`, selectedBoe.usdAmount)
        setValue(`journalDetails.1.credit`, 0)
        setValue(
          `journalDetails.1.notes`,
          `Receipt for BOE ${selectedBoe.boeNo}`
        )
      }
      setValue('journalEntry.notes', selectedBoe.boeNo || '')
      setValue('journalEntry.payTo', selectedBoe.boeNo || '')
      setValue('journalEntry.currencyId', 1) // Assuming USD (ID 1) as per usdAmount
    }
  }, [selectedBoe, setValue, getValues])

  return (
    <form
      onSubmit={form.handleSubmit((values) =>
        onSubmit(values, formState.status)
      )}
      className="space-y-6 p-4"
    >
      {validationError && (
        <div className="text-red-500 text-sm mb-4">{validationError}</div>
      )}
      {amountError && (
        <div className="text-red-500 text-sm mb-4">{amountError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company */}
        <FormField
          control={control}
          name="journalEntry.companyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(Number.parseInt(value))
                }
                value={field.value?.toString() || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {formState.companies.map((company) => (
                    <SelectItem
                      key={company.companyId}
                      value={company.companyId.toString()}
                    >
                      {company.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <FormField
          control={control}
          name="journalEntry.locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(Number.parseInt(value))
                }
                value={field.value?.toString() || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {formState.locations.map((location) => (
                    <SelectItem
                      key={location.locationId}
                      value={location.locationId.toString()}
                    >
                      {location.branchName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bank Account */}
        <FormField
          control={control}
          name="journalDetails.1.bankaccountid" // Assuming the bank account detail is the second one
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Account</FormLabel>
              <Select
                onValueChange={(value) => {
                  const selectedBank = formState.bankAccounts.find(
                    (account) => account.id === Number.parseInt(value)
                  )
                  setFormState((prev) => ({
                    ...prev,
                    selectedBankAccount: selectedBank || null,
                  }))
                  setValue(
                    'journalDetails.1.accountId',
                    selectedBank?.glCode || 0
                  ) // Set GL code for journal detail
                  field.onChange(Number.parseInt(value))
                }}
                value={field.value?.toString() || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bank account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {formState.bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.bankName} - {account.accountNo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Res Partner */}
        <FormField
          control={control}
          name="journalDetails.0.resPartnerId" // Assuming the first journal detail is for the partner
          render={({ field }) => (
            <FormItem>
              <FormLabel>Res Partner</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(Number.parseInt(value))
                  // You might need to set journalDetails.0.accountId based on the selected partner
                  // For now, it remains 0 as there's no direct mapping in provided types.
                }}
                value={field.value?.toString() || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a partner" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {formState.partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id.toString()}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Chart of Account (for Partner's GL Account) */}
        <FormField
          control={control}
          name="journalDetails.0.accountId" // This is the accountId for the partner's detail
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chart of Account (Partner)</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(Number.parseInt(value))
                }
                value={field.value?.toString() || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a GL account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {formState.filteredChartOfAccounts.map((account) => (
                    <SelectItem
                      key={account.accountId}
                      value={account.accountId.toString()}
                    >
                      {/* Changed key and value to accountId */}
                      {account.name} ({account.code}){' '}
                      {/* Displaying code as GL code */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={control}
          name="journalEntry.amountTotal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (USD)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value)
                    if (!isNaN(value)) {
                      setValue('journalEntry.amountTotal', value)
                      // Update the journal details' debit/credit as well
                      setValue('journalDetails.0.credit', value) // Partner is credited
                      setValue('journalDetails.0.debit', 0)
                      setValue('journalDetails.1.debit', value) // Bank is debited
                      setValue('journalDetails.1.credit', 0)
                    } else {
                      setValue('journalEntry.amountTotal', 0)
                      setValue('journalDetails.0.credit', 0)
                      setValue('journalDetails.1.debit', 0)
                    }
                  }}
                  value={field.value}
                  max={originalBoeAmount} // Set max value
                />
              </FormControl>
              <FormMessage />
              {amountError && (
                <p className="text-red-500 text-sm">{amountError}</p>
              )}
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={control}
          name="journalEntry.date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value || ''} // Ensure value is a string for date input
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Exchange Rate */}
        <FormField
          control={control}
          name="journalEntry.exchangeRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exchange Rate</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.0001"
                  {...field}
                  onChange={(e) =>
                    field.onChange(Number.parseFloat(e.target.value))
                  }
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={control}
          name="journalEntry.notes"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add notes for the receipt"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Receipt</Button>
      </div>
    </form>
  )
}

export default BoeReceiptForm
