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
import { Textarea } from '@/components/ui/textarea'
import type {
  JournalEntryWithDetails,
  FormStateType,
  BoeGet,
} from '@/utils/type'
import type React from 'react'
import { useEffect, useCallback, useState } from 'react' // Import useCallback
import { useAtom } from 'jotai' // Import useAtom to get token
import { tokenAtom } from '@/utils/user' // Import tokenAtom
import { getPartnerById, getResPartnersBySearch } from '@/api/common-shared-api' // Import API function
import { CustomCombobox } from '@/utils/custom-combobox'
import { CustomComboboxWithApi } from '@/utils/custom-combobox-with-api'
import { getSettings } from '@/api/shared-api'

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
  const [token] = useAtom(tokenAtom) // Get token for API calls
  const [accountId,setAccountId]=useState<number>(0)
  const [partnerValue, setPartnerValue] = useState<{ id: number|string, name: string } | null>(null)
 // const accountId=  getSettings(token,'Secured BOE')
  // Define the search function for partners
  const searchPartners = useCallback(
    async (query: string) => {
      if (!token) return []
      try {
      
        const response = await getResPartnersBySearch(query, token)
        if (response.data) {
          return response.data.map((p) => ({
            id: p.id.toString(),
            name: p.name || 'Unnamed Partner',
          }))
          
        }
      } catch (error) {
        console.error('Failed to search partners:', error)
      }
      return []
    },
    [token]
  )
    const loadAccountId = async () => {
  try {
    const settings = await getSettings(token, 'Secured BOE');
    if (settings.data) 
      setAccountId(settings.data);

    // If you want to log immediately, log from settings instead:
    console.log('Account Id',settings.data);
  } catch (err) {
    console.error('Failed to load account ID', err);
  }
}
  // Update the form's amountTotal and related details when the selectedBoe changes
 useEffect(() => {
  const init = async () => {
    const settings = await getSettings(token, 'Secured BOE');
    const accId = settings?.data ?? 0;
    setAccountId(accId);

    if (selectedBoe) {
      setValue('journalEntry.amountTotal', selectedBoe.usdAmount);
      const currentDetails = getValues('journalDetails');
      if (currentDetails && currentDetails.length >= 2) {
        setValue(`journalDetails.0.debit`, 0);
        setValue(`journalDetails.0.credit`, selectedBoe.usdAmount);
        setValue(`journalDetails.0.notes`, `Receipt for BOE ${selectedBoe.boeNo}`);
        setValue('journalDetails.0.accountId', accId); // use accId here

        setValue(`journalDetails.1.debit`, selectedBoe.usdAmount);
        setValue(`journalDetails.1.credit`, 0);
        setValue(`journalDetails.1.notes`, `Receipt for BOE ${selectedBoe.boeNo}`);
      }
      setValue('journalEntry.notes', selectedBoe.boeNo || '');
      setValue('journalEntry.payTo', selectedBoe.boeNo || '');
      setValue('journalEntry.currencyId', 1);
    }
  };
  
  init();
}, [selectedBoe, setValue, getValues, token]);
const watchedPartnerId = watch("journalDetails.0.resPartnerId");

useEffect(() => {
  const loadPartner = async () => {
    if (!watchedPartnerId) {
      setPartnerValue(null)
      return
    }

    // Check local list first
    const local = formState.partners.find((p) => p.id === Number(watchedPartnerId))
    if (local) {
      setPartnerValue(local)
      return
    }

    // Fetch from API if not found locally
    const partner = await getPartnerById(Number(watchedPartnerId), token)
    if (partner?.data) {
      setPartnerValue({ id: partner.data.id, name: partner.data.name || '' })
    }
  }

  loadPartner()
}, [watchedPartnerId, formState.partners, token])


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
              <FormControl>
                <CustomCombobox
                  items={formState.companies.map((company) => ({
                    id: company.companyId.toString(),
                    name: company.companyName,
                  }))}
                  value={
                    field.value
                      ? {
                          id: field.value.toString(),
                          name:
                            formState.companies.find(
                              (c) => c.companyId === field.value
                            )?.companyName || 'Unnamed Company',
                        }
                      : null
                  }
                  onChange={(item) =>
                    field.onChange(item ? Number.parseInt(item.id) : null)
                  }
                  placeholder="Select a company"
                />
              </FormControl>
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
              <FormControl>
                <CustomCombobox
                  items={formState.locations.map((location) => ({
                    id: location.locationId.toString(),
                    name: location.branchName,
                  }))}
                  value={
                    field.value
                      ? {
                          id: field.value.toString(),
                          name:
                            formState.locations.find(
                              (l) => l.locationId === field.value
                            )?.branchName || 'Unnamed Location',
                        }
                      : null
                  }
                  onChange={(item) =>
                    field.onChange(item ? Number.parseInt(item.id) : null)
                  }
                  placeholder="Select a location"
                />
              </FormControl>
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
              <FormControl>
                <CustomCombobox
                  items={formState.bankAccounts.map((account) => ({
                    id: account.id.toString(),
                    name: `${account.bankName} - ${account.accountNumber}`,
                  }))}
                  value={
                    field.value
                      ? {
                          id: field.value.toString(),
                          name:
                            formState.bankAccounts.find(
                              (a) => a.id === field.value
                            )?.bankName +
                              ' - ' +
                              formState.bankAccounts.find(
                                (a) => a.id === field.value
                              )?.accountNumber || 'Unnamed Bank Account',
                        }
                      : null
                  }
                  onChange={(item) => {
                    const selectedBank = formState.bankAccounts.find(
                      (account) =>
                        account.id === Number.parseInt(item?.id || '0')
                    )
                    setFormState((prev) => ({
                      ...prev,
                      selectedBankAccount: selectedBank || null,
                    }))
                    setValue(
                      'journalDetails.1.accountId',
                      selectedBank?.glCode || 0
                    ) // Set GL code for journal detail
                    field.onChange(item ? Number.parseInt(item.id) : null)
                  }}
                  placeholder="Select a bank account"
                />
              </FormControl>
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
              <FormControl>
                <CustomComboboxWithApi
                  items={formState.partners.map((partner) => ({
                    id: partner.id.toString(),
                    name: partner.name || '',
                  }))}
                   value={
    field.value
      ? formState.partners.find((p) => p.id === Number(field.value)) ?? { id: field.value, name: partnerValue?.name }
      : null
  } 
                  onChange={(item) =>{
                   /// console.log('On Change',item)
                    field.onChange(item ? Number.parseInt(item.id) : null)}
                  }
                  placeholder="Select partner"
                  searchFunction={searchPartners}
                   fetchByIdFunction={async (id) => {
                     const numericId:number = typeof id === "string" && /^\d+$/.test(id) 
    ? parseInt(id, 10) 
    : (id as number);
                    console.log(id)
                    const partner = await getPartnerById(numericId,token) // <- implement API
                    console.log(partner.data)
                     return partner?.data
    ? {
        id: partner.data.id.toString(),
        name: partner.data.name ?? '',
      }
    : null;
  }}
                  // disabled={!isPartnerFieldEnabled} // Removed as 'isPartnerFieldEnabled' is not defined
                />
              </FormControl>
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
