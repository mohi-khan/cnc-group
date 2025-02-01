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
      <Combobox
        value={
          companies.find(
            (company) => company.company.companyId === field.value
          ) || null
        }
        onChange={(company) => {
          if (company) {
            field.onChange(company.company.companyId)
          }
        }}
      >
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              displayValue={(company: CompanyFromLocalstorage) =>
                company?.company.companyName || ''
              }
              onChange={(event) => setCompanyQuery(event.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setCompanyQuery('')}
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {filteredCompanies.length === 0 && companyQuery !== '' ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredCompanies.map((company) => (
                  <Combobox.Option
                    key={company.company.companyId}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-teal-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={company}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {company.company.companyName}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-teal-600'
                            }`}
                          >
                            <CheckIcon
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
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
      <Combobox
        value={
          locations.find(
            (location) =>
              location.location.locationId === field.value
          ) || null
        }
        onChange={(location) => {
          if (location) {
            field.onChange(location.location.locationId)
          }
        }}
      >
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              displayValue={(location: LocationFromLocalstorage) =>
                location?.location.address || ''
              }
              onChange={(event) => setLocationQuery(event.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setLocationQuery('')}
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {filteredLocations.length === 0 && locationQuery !== '' ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredLocations.map((location) => (
                  <Combobox.Option
                    key={location.location.locationId}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-teal-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={location}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {location.location.address}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-teal-600'
                            }`}
                          >
                            <CheckIcon
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
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
      <Combobox
        value={
          CURRENCY_ITEMS.find(
            (currency) => currency.currencyId === field.value
          ) || null
        }
        onChange={(currency) => {
          if (currency) {
            field.onChange(currency.currencyId)
          }
        }}
      >
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className="w-full h-10 border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              displayValue={(currency: (typeof CURRENCY_ITEMS)[0]) =>
                currency?.currency || ''
              }
              onChange={(event) => setCurrencyQuery(event.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setCurrencyQuery('')}
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {filteredCurrencies.length === 0 && currencyQuery !== '' ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredCurrencies.map((currency) => (
                  <Combobox.Option
                    key={currency.currencyId}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-teal-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={currency}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {currency.currency}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-teal-600'
                            }`}
                          >
                            <CheckIcon
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
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
                <Input  className="h-10" />
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
