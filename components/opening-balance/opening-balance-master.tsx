

'use client'
import type React from 'react'
import { getAllCurrency, getEmployee } from '@/api/common-shared-api'
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
import type { CurrencyType, Employee, FormStateType } from '@/utils/type'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { HoverCard, HoverCardTrigger } from '@/components/ui/hover-card'
import { Textarea } from '@/components/ui/textarea'

// Define the props for the BankVoucherMaster component
interface BankVoucherMasterProps {
  form: {
    control: any
    getValues: any
    setValue: any
    watch: (field: string) => any
  }
  formState: FormStateType
  setFormState: React.Dispatch<React.SetStateAction<FormStateType>>
  requisition: any
  disableJournalType?: boolean // This will disable ONLY the Type field when coming from invoice
  initialData?: any // Added initialData prop
}

export default function OpeningBalanceMaster({
  form,
  formState,
  setFormState,
  requisition,
  disableJournalType = false,
  initialData, // Added initialData prop
}: BankVoucherMasterProps) {
  //getting userData from jotai atom component
  useInitializeUser()
  const [token] = useAtom(tokenAtom)

  // State to hold the currency data
  const [currency, setCurrency] = useState<CurrencyType[]>([])
  const [employeeData, setEmployeeData] = useState<Employee[]>([])

  // Watch the selected company ID
  const selectedCompanyId = form.watch('journalEntry.companyId')

  
  // Watch journal details reactively
const journalDetails = form.watch("journalDetails") ?? []

// Decide which field to read
const currentField = formState.formType === "Credit" ? "debit" : "credit"


// Determine which field to sum based on formType
const fieldToSum = formState.formType === "Debit" ? "debit" : "credit"

// Watch all amounts for reactivity
const watchedAmounts = journalDetails.map((_: any, index: number) =>
  form.watch(`journalDetails.${index}.${fieldToSum}`)
)

useEffect(() => {
  const totalAmount = journalDetails.reduce(
    (sum: number, detail: any, index: number) => {
      const amount = watchedAmounts[index] || detail[fieldToSum] || 0
      return sum + Number(amount)
    },
    0
  )

  form.setValue("journalEntry.amountTotal", totalAmount)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [watchedAmounts, fieldToSum, form])


  // Filter locations based on selected company
  const filteredLocations = useMemo(() => {
    if (!selectedCompanyId) {
      return [] // Return empty array if no company is selected
    }
    return formState.locations.filter(
      (location) => location.location.companyId === selectedCompanyId
    )
  }, [formState.locations, selectedCompanyId])

  // Function to fetch currency data
  const fetchCurrency = useCallback(async () => {
    const data = await getAllCurrency(token)
    if (data.error || !data.data) {
      console.error('Error getting currency:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get currency',
      })
    } else {
      setCurrency(data.data)
    }
  }, [token])

  const fetchEmployeeData = useCallback(async () => {
    if (!token) return
    const employees = await getEmployee(token)
    if (employees.data) {
      setEmployeeData(employees.data)
    } else {
      setEmployeeData([])
    }
  }, [token])

  useEffect(() => {
    if (
      initialData &&
      formState.selectedBankAccount &&
      !formState.selectedBankAccount
    ) {
      console.log('Initializing bank account from initialData', {
        initialData,
      })

      if (initialData.journalDetails && initialData.journalDetails.length > 0) {
        // Find the detail that has bankaccountid (handle both possible field names)
        const bankDetail = initialData.journalDetails.find(
          (d: { bankaccountid?: number; debit?: number }) =>
            d.bankaccountid || d.bankaccountid
        )

        if (
          bankDetail &&
          (bankDetail.bankaccountid || bankDetail.bankaccountid)
        ) {
          const bankAccountId =
            bankDetail.bankaccountid || bankDetail.bankaccountid
          console.log('Looking for bank account with ID:', bankAccountId)

          setFormState((prev) => ({
            ...prev,
            // Determine formType based on debit/credit of the bank account detail
            formType: bankDetail.debit > 0 ? 'Debit' : 'Credit',
          }))
          console.log('Successfully set bank account from initialData')
        }
      }
    }
  }, [initialData, formState.selectedBankAccount, setFormState])

  useEffect(() => {
    fetchCurrency()
    fetchEmployeeData()
    // When coming from invoice, set the form type to 'Debit' (Receipt)
    if (disableJournalType) {
      setFormState((prev) => ({
        ...prev,
        formType: 'Debit', // This will show "Receipt"
      }))
    }
    // Pre-populate fields if requisition data is available
    if (requisition && Object.keys(requisition).length > 0) {
      // Set company
      if (requisition.companyid) {
        form.setValue('journalEntry.companyId', requisition.companyid)
      }
      // Set amount - but now it will be overridden by detail calculations
      if (requisition.advanceamount) {
        // Update the first detail row if it exists
        const detailsArray = form.getValues('journalDetails') || []
        if (detailsArray.length > 0) {
          const updatedDetails = [...detailsArray]
          updatedDetails[0] = {
            ...updatedDetails[0],
            [formState.formType === 'Credit' ? 'debit' : 'credit']:
              Number.parseFloat(requisition.advanceamount),
          }
          form.setValue('journalDetails', updatedDetails)
        }
      }
      // Set currency
      if (requisition.currency) {
        form.setValue('journalEntry.currencyId', requisition.currency)
      }
    }
  }, [
    requisition,
    fetchCurrency,
    form,
    formState.formType,
    fetchEmployeeData,
    disableJournalType,
    setFormState,
  ])

  return (
    <div>
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
                  onChange={(value) => {
                    const newCompanyId = value
                      ? Number.parseInt(value.id, 10)
                      : null
                    field.onChange(newCompanyId)
                    // Clear location when company changes
                    form.setValue('journalEntry.locationId', null)
                  }}
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
                  items={filteredLocations.map((location) => ({
                    id: location.location.locationId.toString(),
                    name: location.location.address || 'Unnamed Location',
                  }))}
                  value={
                    field.value && selectedCompanyId
                      ? {
                          id: field.value.toString(),
                          name:
                            filteredLocations.find(
                              (l) => l.location.locationId === field.value
                            )?.location.address || '',
                        }
                      : null
                  }
                  onChange={(value) =>
                    field.onChange(value ? Number.parseInt(value.id, 10) : null)
                  }
                  placeholder={
                    selectedCompanyId
                      ? 'Select location'
                      : 'Select company first'
                  }
                  disabled={
                    !selectedCompanyId || filteredLocations.length === 0
                  }
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
                <div className="flex gap-2">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div>
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
                          onChange={(
                            value: { id: string; name: string } | null
                          ) => {
                            const newValue = value
                              ? Number.parseInt(value.id, 10)
                              : null
                            field.onChange(newValue)
                            // Reset exchange rate when currency changes or is cleared
                            if (newValue === null || newValue === 1) {
                              form.setValue('journalEntry.exchangeRate', 1)
                            }
                          }}
                          placeholder="Select currency"
                        />
                      </div>
                    </HoverCardTrigger>
                  </HoverCard>
                  {/* Only show exchange rate field when a non-default currency is selected */}
                  {field.value && field.value !== 1 ? (
                    <FormField
                      control={form.control}
                      name="journalEntry.exchangeRate"
                      render={({ field: exchangeField }) => (
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter exchange rate"
                            value={exchangeField.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value
                              exchangeField.onChange(
                                value === '' ? null : Number(value)
                              )
                            }}
                            className="w-40 ml-5"
                          />
                        </FormControl>
                      )}
                    />
                  ) : null}
                </div>
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
            value={{
              id: String(formState.formType),
              name: formState.formType === 'Credit' ? 'Credit' : 'Debit',
            }}
            onChange={(value) => {
              // Only allow change if not disabled
              if (!disableJournalType) {
                setFormState({
                  ...formState,
                  formType: (value?.id as 'Credit' | 'Debit') || 'Credit',
                })
              }
            }}
            placeholder="Select type"
            disabled={disableJournalType} // ONLY disable the Type field when coming from invoice
          />
        </FormItem>

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
              <FormLabel>Amount (Auto-calculated)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Calculated from details"
                  {...field}
                  value={field.value === undefined ? '' : field.value}
                  disabled={true} // Make it read-only
                  className="bg-gray-100 cursor-not-allowed" // Visual indication it's disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name="journalEntry.payTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receiver Name</FormLabel>
              <div className="flex gap-4">
                
                <div className="flex-1">
                  <CustomCombobox
                    items={employeeData.map((employee) => ({
                      id: employee.id.toString(),
                      name:`${employee.employeeName} (${employee.employeeId})`, // 👈 Show both,
                    }))}
                    value={
                      field.value && !form.watch('journalEntry.payToText')
                        ? {
                            id: field.value,
                            name: field.value,
                          }
                        : null
                    }
                    onChange={(value: { id: string; name: string } | null) => {
                      if (value) {
                        field.onChange(value.name)
                        form.setValue('journalEntry.payTo', value.name)
                        form.setValue('journalEntry.payToText', '') // clear manual input
                      }
                    }}
                    placeholder="Select a receiver name"
                    disabled={!!form.watch('journalEntry.payToText')}
                  />
                </div>
              
                <div className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Enter receiver name"
                      value={form.watch('journalEntry.payToText') || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        form.setValue('journalEntry.payToText', value)
                        form.setValue('journalEntry.payTo', value) // <- ensures value goes to DB
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        /> */}

         <FormField
        control={form.control}
        name="journalEntry.payTo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Receiver Name</FormLabel>
            <div className="flex gap-4">
              {/* Combobox Section */}
              <div className="flex-1">
                <CustomCombobox
                  items={employeeData.map((employee) => ({
                    id: employee.id.toString(),
                    name: `${employee.employeeName} (${employee.employeeId})`,
                  }))}
                  value={
                    field.value && !form.watch('journalEntry.payToText')
                      ? {
                          id: field.value,
                          name: field.value,
                        }
                      : null
                  }
                  onChange={(value: { id: string; name: string } | null) => {
                    if (value) {
                      field.onChange(value.name)
                      form.setValue('journalEntry.payTo', value.name)
                      form.setValue('journalEntry.payToText', '')
                    } else {
                      // Handle clearing the combobox
                      field.onChange('')
                      form.setValue('journalEntry.payTo', '')
                      form.setValue('journalEntry.payToText', '')
                    }
                  }}
                  placeholder="Select a receiver name"
                  disabled={!!form.watch('journalEntry.payToText')?.trim()} // Only disable if manual input has content
                />
              </div>
              {/* Manual Text Input Section */}
              <div className="flex-1">
                <FormControl>
                  <Input
                    placeholder="Enter receiver name"
                    value={form.watch('journalEntry.payToText') || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      form.setValue('journalEntry.payToText', value)
                      form.setValue('journalEntry.payTo', value)
                      if (value) {
                        field.onChange(value)
                      }
                    }}
                    disabled={
                      !!form.watch('journalEntry.payTo') &&
                      !form.watch('journalEntry.payToText')
                    } // Disable if combobox has a value
                  />
                </FormControl>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      </div>
      <FormField
        control={form.control}
        name="journalEntry.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea {...field} rows={3} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}