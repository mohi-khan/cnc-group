'use client'
import { Fragment, useState, useEffect } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
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
  JournalEntryWithDetails,
  JournalQuery,
  LocationFromLocalstorage,
  User,
  VoucherTypes,
} from '@/utils/type'
import { toast } from '@/hooks/use-toast'
import { getAllVoucher } from '@/api/journal-voucher-api'
import { CURRENCY_ITEMS } from '@/utils/constants'
import { Button } from '@/components/ui/button'
import { CustomCombobox } from '@/utils/custom-combobox'
import { getAllCurrency } from '@/api/exchange-api'

interface JournalVoucherMasterSectionProps {
  form: UseFormReturn<JournalEntryWithDetails>
}

export function ContraVoucherMasterSection({
  form,
}: JournalVoucherMasterSectionProps) {
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

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
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
  }, [])

  async function fetchAllVoucher(company: number[], location: number[]) {
    const voucherQuery: JournalQuery = {
      date: '2024-12-31',
      companyId: company,
      locationId: location,
      voucherType: VoucherTypes.ContraVoucher,
    }
    const response = await getAllVoucher(voucherQuery)
    if (response.error || !response.data) {
      console.error('Error getting Voucher Data:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get Voucher Data',
      })
    } else {
      console.log('voucher', response.data)
    }
  }

  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }
  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
  }

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
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Company Combobox */}
        <FormField
          control={form.control}
          name="journalEntry.companyId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Company</FormLabel>
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
                onChange={(value) => field.onChange(value?.id || null)}
              />
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
                onChange={(value) => field.onChange(value?.id || null)}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Voucher Date Input */}
        <div className="flex flex-col">
          <FormLabel className="mb-2">Voucher Date</FormLabel>
          <FormField
            control={form.control}
            name="journalEntry.date"
            render={({ field }) => (
              <FormControl>
                <Input type="date" {...field} className="h-10" />
              </FormControl>
            )}
          />
          <FormMessage />
        </div>

        {/* Currency Combobox */}
        <div className="flex flex-col">
          <FormLabel className="mb-2">Currency</FormLabel>
          <FormField
            control={form.control}
            name="journalEntry.currencyId"
            render={({ field }) => (
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
            )}
          />

          <FormMessage />
        </div>

        {/* Analysis Tags Input */}
        <div className="flex flex-col">
          <FormLabel className="mb-2">Analysis Tags</FormLabel>
          <FormField
            control={form.control}
            name="journalEntry.journalType"
            render={({ field }) => (
              <FormControl>
                <Input className="h-10" />
              </FormControl>
            )}
          />
          <FormMessage />
        </div>
      </div>

      {/* Notes Textarea */}
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
