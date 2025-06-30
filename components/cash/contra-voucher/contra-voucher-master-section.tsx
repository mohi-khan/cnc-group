'use client'
import { Fragment, useState, useEffect, useCallback } from 'react'

import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  CompanyFromLocalstorage,
  CurrencyType,
  ExchangeType,
  JournalEntryWithDetails,
  JournalQuery,
  LocationFromLocalstorage,
  User,
  VoucherTypes,
} from '@/utils/type'
import { toast } from '@/hooks/use-toast'
import { getAllVoucher } from '@/api/journal-voucher-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { getAllCurrency, getAllExchange } from '@/api/common-shared-api'
import { useRouter } from 'next/navigation'
import {
  HoverCard,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

interface JournalVoucherMasterSectionProps {
  form: UseFormReturn<JournalEntryWithDetails>
}

export function ContraVoucherMasterSection({
  form,
}: JournalVoucherMasterSectionProps) {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [companyQuery, setCompanyQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [currencyQuery, setCurrencyQuery] = useState('')
  const { control, setValue, watch } = form
  const value = watch('journalEntry.companyId')
  const [currency, setCurrency] = useState<CurrencyType[]>([])
  // const [isLoading, setIsLoading] = useState(false)
  const [exchanges, setExchanges] = useState<ExchangeType[]>([])

  const fetchAllVoucher = useCallback(
    async (company: number[], location: number[]) => {
      const voucherQuery: JournalQuery = {
        date: '2024-12-31',
        companyId: company,
        locationId: location,
        voucherType: VoucherTypes.ContraVoucher,
      }
      const response = await getAllVoucher(voucherQuery, token)
      if (response.error || !response.data) {
        console.error('Error getting Voucher Data:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to get Voucher Data',
        })
      } else {
        console.log('voucher', response.data)
      }
    },
    [token]
  )

  useEffect(() => {
    if (userData) {
      setUser(userData)
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
      console.log('Current user from localStorage:', userData)

      const companyIds = getCompanyIds(userData.userCompanies)
      const locationIds = getLocationIds(userData.userLocations)
      console.log({ companyIds, locationIds })
      fetchAllVoucher(companyIds, locationIds)
    } else {
      console.log('No user data found in localStorage')
    }
  }, [fetchAllVoucher, userData])

  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }
  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
  }

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
      console.log('🚀 ~ fetchCurrency ~ data.data:', data.data)
    }
  }, [token])

  const fetchExchanges = useCallback(async () => {
    const data = await getAllExchange(token)
    if (data.error || !data.data) {
      console.error('Error getting exchanges:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get exchanges',
      })
    } else {
      setExchanges(data.data)
      console.log('🚀 ~ fetchExchanges ~ data.data:', data.data)
    }
  }, [token])
  useEffect(() => {
    fetchCurrency()
    fetchExchanges()
  }, [fetchCurrency, fetchExchanges])

  console.log('Form state errors:', form.formState.errors)
  // console.log('Form values:', form.getValues())
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Company Combobox */}
        <FormField
          control={form.control}
          name="journalEntry.companyId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Company</FormLabel>
              <FormControl>
                <CustomCombobox
                  items={companies.map((c) => ({
                    id: c.company.companyId,
                    name: c.company.companyName,
                  }))}
                  value={
                    field.value
                      ? {
                          id: field.value,
                          name:
                            companies.find(
                              (c) => c.company.companyId === field.value
                            )?.company.companyName || '',
                        }
                      : null
                  }
                  placeholder="Select company"
                  onChange={(value) => field.onChange(value?.id || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location Combobox */}
        <FormField
          control={form.control}
          name="journalEntry.locationId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Location</FormLabel>
              <FormControl>
                <CustomCombobox
                  items={locations.map((c) => ({
                    id: c.location.locationId,
                    name: c.location.address,
                  }))}
                  value={
                    field.value
                      ? {
                          id: field.value,
                          name:
                            locations.find(
                              (c) => c.location.locationId === field.value
                            )?.location.address || '',
                        }
                      : null
                  }
                  placeholder="Select location"
                  onChange={(value) => field.onChange(value?.id || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Voucher Date Input */}
        <FormField
          control={form.control}
          name="journalEntry.date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voucher Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} className="h-10" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Currency Combobox */}

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
      </div>

      {/* Notes Textarea */}
      <FormField
        control={form.control}
        name="journalEntry.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea placeholder='Write notes here' {...field} rows={3} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
