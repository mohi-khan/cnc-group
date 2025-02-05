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

  // Filter functions for Combobox
  const filteredCompanies =
    companyQuery === ''
      ? companies
      : companies.filter((company) =>
          company.company.companyName
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(companyQuery.toLowerCase().replace(/\s+/g, ''))
        )

  const filteredLocations =
    locationQuery === ''
      ? locations
      : locations.filter((location) =>
          location.location.address
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(locationQuery.toLowerCase().replace(/\s+/g, ''))
        )

  const filteredCurrencies =
    currencyQuery === ''
      ? CURRENCY_ITEMS
      : CURRENCY_ITEMS.filter((currency) =>
          currency.currency
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(currencyQuery.toLowerCase().replace(/\s+/g, ''))
        )

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
                  items={CURRENCY_ITEMS.map((c) => ({
                    id: c.currencyId,
                    name: c.currency,
                  }))}
                  value={
                    field.value
                      ? {
                          id: field.value,
                          name:
                            CURRENCY_ITEMS.find(
                              (c) => c.currencyId === field.value
                            )?.currency || '',
                        }
                      : null
                  }
                  onChange={(value) => field.onChange(value?.id || null)}
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

// 'use client'
// import { UseFormReturn } from 'react-hook-form'
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import {
//   CompanyFromLocalstorage,
//   JournalEntryWithDetails,
//   JournalQuery,
//   LocationFromLocalstorage,
//   User,
//   VoucherTypes,
// } from '@/utils/type'
// import { Check, ChevronsUpDown } from 'lucide-react'
// import React from 'react'
// import { toast } from '@/hooks/use-toast'
// import { getAllVoucher } from '@/api/journal-voucher-api'
// import { CURRENCY_ITEMS } from '@/utils/constants'
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover'
// import { Button } from '@/components/ui/button'
// import { cn } from '@/lib/utils'
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from '@/components/ui/command'

// interface JournalVoucherMasterSectionProps {
//   form: UseFormReturn<JournalEntryWithDetails>
// }

// export function ContraVoucherMasterSection({
//   form,
// }: JournalVoucherMasterSectionProps) {
//   const [companies, setCompanies] = React.useState<CompanyFromLocalstorage[]>(
//     []
//   )
//   const [locations, setLocations] = React.useState<LocationFromLocalstorage[]>(
//     []
//   )
//   const [user, setUser] = React.useState<User | null>(null)
//   const [open, setOpen] = React.useState(false)
//   const { control, setValue, watch } = form
//   const value = watch('journalEntry.companyId')

//   React.useEffect(() => {
//     const userStr = localStorage.getItem('currentUser')
//     if (userStr) {
//       const userData = JSON.parse(userStr)
//       setUser(userData)
//       setCompanies(userData.userCompanies)
//       setLocations(userData.userLocations)
//       console.log('Current user from localStorage:', userData)

//       const companyIds = getCompanyIds(userData.userCompanies)
//       const locationIds = getLocationIds(userData.userLocations)
//       console.log({ companyIds, locationIds })
//       fetchAllVoucher(companyIds, locationIds)
//     } else {
//       console.log('No user data found in localStorage')
//     }
//   }, [])

//   async function fetchAllVoucher(company: number[], location: number[]) {
//     const voucherQuery: JournalQuery = {
//       date: '2024-12-31',
//       companyId: company,
//       locationId: location,
//       voucherType: VoucherTypes.ContraVoucher,
//     }
//     const response = await getAllVoucher(voucherQuery)
//     if (response.error || !response.data) {
//       console.error('Error getting Voucher Data:', response.error)
//       toast({
//         title: 'Error',
//         description: response.error?.message || 'Failed to get Voucher Data',
//       })
//     } else {
//       console.log('voucher', response.data)
//     }
//   }

//   function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
//     return data.map((company) => company.company.companyId)
//   }
//   function getLocationIds(data: LocationFromLocalstorage[]): number[] {
//     return data.map((location) => location.location.locationId)
//   }

//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-2 gap-4">
//         <FormField
//           control={form.control}
//           name="journalEntry.companyId"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Company</FormLabel>
//               <Select
//                 onValueChange={(value) => field.onChange(Number(value))}
//                 value={field.value?.toString() || ''}
//               >
//                 <FormControl>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select company" />
//                   </SelectTrigger>
//                 </FormControl>
//                 <SelectContent>
//                   {companies.map((company) => (
//                     <SelectItem
//                       key={company.company.companyId}
//                       value={company.company.companyId.toString()}
//                     >
//                       {company.company.companyName}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="journalEntry.locationId"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Location</FormLabel>
//               <Select
//                 onValueChange={(value) => field.onChange(Number(value))}
//                 value={field.value?.toString() || ''}
//               >
//                 <FormControl>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select location" />
//                   </SelectTrigger>
//                 </FormControl>
//                 <SelectContent>
//                   {locations.map((location) => (
//                     <SelectItem
//                       key={location.location.locationId}
//                       value={location.location.locationId.toString()}
//                     >
//                       {location.location.address}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//       </div>

//       <div className="grid grid-cols-3 gap-4">
//         <FormField
//           control={form.control}
//           name="journalEntry.date"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Voucher Date</FormLabel>
//               <FormControl>
//                 <Input type="date" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="journalEntry.currencyId"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Currency</FormLabel>
//               <Select
//                 onValueChange={(value) => field.onChange(Number(value))}
//                 value={field.value?.toString() || ''}
//               >
//                 <FormControl>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select Currency" />
//                   </SelectTrigger>
//                 </FormControl>
//                 <SelectContent>
//                   {CURRENCY_ITEMS.map((currency) => (
//                     <SelectItem
//                       key={currency.currencyId}
//                       value={currency.currencyId.toString()}
//                     >
//                       {currency.currency}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="journalEntry.journalType"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Analysis tags</FormLabel>
//               <FormControl>
//                 <Input />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//       </div>

//       <FormField
//         control={form.control}
//         name="journalEntry.notes"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Notes</FormLabel>
//             <FormControl>
//               <Textarea {...field} rows={3} />
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//     </div>
//   )
// }
