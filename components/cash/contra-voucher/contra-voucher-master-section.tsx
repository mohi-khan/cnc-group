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
  JournalEntryWithDetails,
  JournalQuery,
  LocationFromLocalstorage,
  User,
  VoucherTypes,
} from '@/utils/type'
import { Check, ChevronsUpDown } from 'lucide-react'
import React from 'react'
import { toast } from '@/hooks/use-toast'
import { getAllVoucher } from '@/api/journal-voucher-api'
import { CURRENCY_ITEMS } from '@/utils/constants'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

interface JournalVoucherMasterSectionProps {
  form: UseFormReturn<JournalEntryWithDetails>
}

export function ContraVoucherMasterSection({
  form,
}: JournalVoucherMasterSectionProps) {
  const [companies, setCompanies] = React.useState<CompanyFromLocalstorage[]>(
    []
  )
  const [locations, setLocations] = React.useState<LocationFromLocalstorage[]>(
    []
  )
  const [user, setUser] = React.useState<User | null>(null)
  const [open, setOpen] = React.useState(false)
  const { control, setValue, watch } = form
  const value = watch('journalEntry.companyId')

  React.useEffect(() => {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="journalEntry.companyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString() || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem
                      key={company.company.companyId}
                      value={company.company.companyId.toString()}
                    >
                      {company.company.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="journalEntry.companyId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fruit</FormLabel>

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                  >
                    {field.value
                      ? companies.find(
                          (company) =>
                            company.company.companyId.toString() ===
                            field.value?.toString()
                        )?.company.companyName
                      : 'Select framework...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search framework..." />
                    <CommandList>
                      <CommandEmpty>No framework found.</CommandEmpty>
                      <CommandGroup>
                        {companies?.map((company) => (
                          <CommandItem
                            key={company.company.companyId}
                            value={company.company.companyId.toString()}
                            onSelect={(currentValue) => {
                              field.onChange(
                                currentValue === field.value?.toString()
                                  ? ''
                                  : currentValue
                              )
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                field.value?.toString() ===
                                  company.company.companyId.toString()
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {company.company.companyName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString() || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem
                      key={location.location.locationId}
                      value={location.location.locationId.toString()}
                    >
                      {location.location.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <FormLabel>Voucher Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString() || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CURRENCY_ITEMS.map((currency) => (
                    <SelectItem
                      key={currency.currencyId}
                      value={currency.currencyId.toString()}
                    >
                      {currency.currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="journalEntry.journalType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Analysis tags</FormLabel>
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
