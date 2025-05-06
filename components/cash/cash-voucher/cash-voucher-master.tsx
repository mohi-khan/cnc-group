'use client'

import { getAllCurrency } from '@/api/common-shared-api'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { HoverCard, HoverCardTrigger } from '@/components/ui/hover-card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { CustomCombobox } from '@/utils/custom-combobox'
import type {
  CompanyFromLocalstorage,
  CurrencyType,
  LocationFromLocalstorage,
} from '@/utils/type'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

// Defines the props for the CashVoucherMaster component
interface CashVoucherMasterProps {
  form: any
  companies: CompanyFromLocalstorage[]
  locations: LocationFromLocalstorage[]
}

export default function CashVoucherMaster({
  form,
  companies,
  locations,
}: CashVoucherMasterProps) {
  //getting userData from jotai atom component
  useInitializeUser()
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  // State to hold the currency data
  const [currency, setCurrency] = useState<CurrencyType[]>([])

  // Function to fetch currency data
  const fetchCurrency = useCallback(async () => {
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
  }, [token, router])

  useEffect(() => {
    fetchCurrency()
  }, [fetchCurrency])

  return (
    <div className="grid grid-cols-4 gap-4">
      <FormField
        control={form.control}
        name="journalEntry.companyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Name</FormLabel>
            <FormControl>
              <CustomCombobox
                items={companies.map((company) => ({
                  id: company.company.companyId.toString(),
                  name: company.company.companyName || 'Unnamed Company',
                }))}
                value={
                  field.value
                    ? {
                        id: field.value.toString(),
                        name:
                          companies.find(
                            (c) => c.company.companyId === field.value
                          )?.company.companyName || '',
                      }
                    : null
                }
                onChange={(value) =>
                  field.onChange(value ? Number.parseInt(value.id, 10) : null)
                }
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
                items={locations.map((location) => ({
                  id: location.location.locationId.toString(),
                  name: location.location.address || 'Unnamed Location',
                }))}
                value={
                  field.value
                    ? {
                        id: field.value.toString(),
                        name:
                          locations.find(
                            (l) => l.location.locationId === field.value
                          )?.location.address || '',
                      }
                    : null
                }
                onChange={(value) =>
                  field.onChange(value ? Number.parseInt(value.id, 10) : null)
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex flex-col mt-2 ml-10">
           <FormLabel className="mb-2">Currency</FormLabel>
           <FormField
             control={form.control}
             name="journalEntry.currencyId"
             render={({ field }) => (
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
                           ) =>
                             field.onChange(
                               value ? Number.parseInt(value.id, 10) : null
                             )
                           }
                           placeholder="Select currency"
                         />
                       </div>
                     </HoverCardTrigger>
                   </HoverCard>
                   {field.value && field.value !== 1 && (
                     <FormField
                       control={form.control}
                       name="journalEntry.exchangeRate"
                       render={({ field: exchangeField }) => (
                         <FormControl>
                           <Input
                             type="number"
                             placeholder="Exchange Rate"
                             value={exchangeField.value ?? ''}
                             onChange={(e) => exchangeField.onChange(Number(e.target.value))}
                             className="w-32"
                           />
                         </FormControl>
                       )}
                     />
                   )}
                 </div>
               </FormControl>
             )}
           />
           <FormMessage />
         </div>      <FormField
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
        name="journalEntry.payTo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pay To</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder="Enter payee name"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="col-span-4">
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
    </div>
  )
}
