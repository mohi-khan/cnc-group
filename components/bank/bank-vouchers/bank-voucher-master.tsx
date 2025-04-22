import { getAllCurrency } from '@/api/exchange-api'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { CustomCombobox } from '@/utils/custom-combobox'
import { CurrencyType, FormStateType } from '@/utils/type'
import { useEffect, useState } from 'react'

// Define the props for the BankVoucherMaster component
interface BankVoucherMasterProps {
  form: {
    control: any
  }
  formState: FormStateType
  setFormState: React.Dispatch<React.SetStateAction<FormStateType>>
}

export default function BankVoucherMaster({
  form,
  formState,
  setFormState,
}: BankVoucherMasterProps) {
  // State to hold the currency data
  const [currency, setCurrency] = useState<CurrencyType[]>([])

  // Function to fetch currency data
  const fetchCurrency = async () => {
    const data = await getAllCurrency()
    if (data.error || !data.data) {
      console.error('Error getting currency:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get currency',
      })
    } else {
      setCurrency(data.data)
      console.log('🚀 ~ fetchCurrency ~ data.data:', data.data)
    }
  }

  useEffect(() => {
    fetchCurrency()
  }, [])

  return (
    <div className="grid grid-cols-3 gap-4">
      <FormField
        control={form.control}
        name="journalEntry.companyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Name</FormLabel>
            <FormControl>
              <CustomCombobox
                items={formState.companies.map((company) => ({
                  id: company.company.companyId.toString(),
                  name: company.company.companyName || 'Unnamed Company',
                }))}
                value={
                  field.value
                    ? {
                        id: field.value.toString(),
                        name:
                          formState.companies.find(
                            (c) => c.company.companyId === field.value
                          )?.company.companyName || '',
                      }
                    : null
                }
                onChange={(value) =>
                  field.onChange(value ? Number.parseInt(value.id, 10) : null)
                }
                placeholder="Select company"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="journalEntry.locationId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <CustomCombobox
                items={formState.locations.map((location) => ({
                  id: location.location.locationId.toString(),
                  name: location.location.address || 'Unnamed Location',
                }))}
                value={
                  field.value
                    ? {
                        id: field.value.toString(),
                        name:
                          formState.locations.find(
                            (l) => l.location.locationId === field.value
                          )?.location.address || '',
                      }
                    : null
                }
                onChange={(value) =>
                  field.onChange(value ? Number.parseInt(value.id, 10) : null)
                }
                placeholder="Select location"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="journalEntry.currencyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Currency</FormLabel>
            <FormControl>
              <CustomCombobox
                items={currency.map((curr: CurrencyType) => ({
                  id: curr.currencyId.toString(),
                  name: curr.currencyCode || 'Unnamed Currency',
                }))}
                value={
                  field.value
                    ? {
                        id: field.value.toString(),
                        name:
                          currency.find(
                            (curr: CurrencyType) =>
                              curr.currencyId === field.value
                          )?.currencyCode || 'Unnamed Currency',
                      }
                    : null
                }
                onChange={(value: { id: string; name: string } | null) =>
                  field.onChange(value ? Number.parseInt(value.id, 10) : null)
                }
                placeholder="Select currency"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormItem>
        <FormLabel>Type</FormLabel>
        <CustomCombobox
          items={[
            { id: 'Credit', name: 'Credit' },
            { id: 'Debit', name: 'Debit' },
          ]}
          value={{ id: String(formState.formType), name: String(formState.formType) }}
          onChange={(value) =>
            setFormState({ ...formState, formType: (value?.id as 'Credit' | 'Debit') || 'Credit' })
          }
          placeholder="Select type"
        />
      </FormItem>
      <FormItem>
        <FormLabel>Bank Account Details</FormLabel>
        <CustomCombobox
          items={formState.bankAccounts.map((account) => ({
            id: account.id.toString(),
            name:
              `${account.bankName} - ${account.accountName} - ${account.accountNumber}` ||
              'Unnamed Account',
          }))}
          value={
            formState.selectedBankAccount
              ? {
                  id: formState.selectedBankAccount.id.toString(),
                  name:
                    formState.bankAccounts.find(
                      (a) =>
                        formState.selectedBankAccount &&
                        a.id === formState.selectedBankAccount.id
                    )?.accountName || '',
                }
              : null
          }
          onChange={(value) => {
            if (!value) {
              setFormState({ ...formState, selectedBankAccount: null })
              return
            }
            const selectedAccount = formState.bankAccounts.find(
              (account) => account.id.toString() === value.id
            )
            if (selectedAccount) {
              setFormState({
                ...formState,
                selectedBankAccount: {
                  id: selectedAccount.id,
                  glCode: selectedAccount.glAccountId || 0,
                },
              })
            } else {
              setFormState({ ...formState, selectedBankAccount: null })
            }
          }}
          placeholder="Select bank account"
        />
        <FormMessage />
      </FormItem>
      <FormField
        control={form.control}
        name="journalEntry.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Check Number</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter check number"
                {...field}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="journalEntry.date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="journalEntry.amountTotal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter amount"
                {...field}
                onChange={(e) =>
                  field.onChange(Number.parseFloat(e.target.value))
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
              control={form.control}
              name="journalEntry.payTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pay To</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} placeholder="Enter payee name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
    </div>
  )
}
