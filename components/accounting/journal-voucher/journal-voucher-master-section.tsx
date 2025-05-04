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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CompanyFromLocalstorage,
  CurrencyType,
  JournalEntryWithDetails,
  JournalQuery,
  JournalResult,
  LocationFromLocalstorage,
  User,
  VoucherTypes,
} from '@/utils/type'
import React, { useEffect, useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { getAllVoucher } from '@/api/journal-voucher-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import { getAllCurrency } from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

interface JournalVoucherMasterSectionProps {
  form: UseFormReturn<JournalEntryWithDetails>
}

export function JournalVoucherMasterSection({
  form,
}: JournalVoucherMasterSectionProps) {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  // State variables
  const [companies, setCompanies] = React.useState<CompanyFromLocalstorage[]>(
    []
  )
  const [locations, setLocations] = React.useState<LocationFromLocalstorage[]>(
    []
  )
  const [user, setUser] = React.useState<User | null>(null)
  const [currency, setCurrency] = useState<CurrencyType[]>([])

  // Fetching user data from localStorage and setting it to state
  React.useEffect(() => {
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
  }, [userData])

  // Fetching all vouchers based on company and location IDs
  async function fetchAllVoucher(company: number[], location: number[]) {
    const voucherQuery: JournalQuery = {
      date: '2024-12-18',
      companyId: company,
      locationId: location,
      voucherType: VoucherTypes.JournalVoucher,
    }
    if (!token) return
    const response = await getAllVoucher(voucherQuery, token)
    if (response?.error?.status === 401) {
      router.push('/unauthorized-access')
      console.log('Unauthorized access')
      return
    }
    // Check for errors in the response. if no errors, set the voucher grid data
    else if (response.error || !response.data) {
      console.error('Error getting Voucher Data:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get Voucher Data',
      })
    } else {
      console.log('voucher', response.data)
      // setVoucherGrid(response.data)
    }
  }

  // Function to extract company IDs from localStorage data
  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }
  // Function to extract location IDs from localStorage data
  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
  }

  // Function to fetch currency data
  const fetchCurrency = async () => {
    if (!token) return
    const data = await getAllCurrency(token)
    if (data?.error?.status === 401) {
      router.push('/unauthorized-access')
      console.log('Unauthorized access')
      return
    } else if (data.error || !data.data) {
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

  // React.useEffect(() => {
  //   const mycompanies = getCompanyIds(companies)
  //   const mylocations = getLocationIds(locations)
  //   console.log(mycompanies, mylocations)
  //   fetchAllVoucher(mycompanies, mylocations)
  // }, [companies, locations])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
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
        <FormField
          control={form.control}
          name="journalEntry.date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2">Voucher Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} className="h-10" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col pt-3">
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

        <FormField
          control={form.control}
          name="journalEntry.journalType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2">Analysis tags</FormLabel>
              <FormControl>
                <Input />
              </FormControl>
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
