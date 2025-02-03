'use client'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CustomCombobox } from '@/utils/custom-combobox'
import type {
  CompanyFromLocalstorage,
  LocationFromLocalstorage,
} from '@/utils/type'

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
      <FormField
        control={form.control}
        name="journalEntry.currencyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Currency</FormLabel>
            <FormControl>
              <CustomCombobox
                items={[
                  { id: '1', name: 'BDT' },
                  { id: '2', name: 'USD' },
                  { id: '3', name: 'EUR' },
                ]}
                value={
                  field.value
                    ? {
                        id: field.value.toString(),
                        name: ['BDT', 'USD', 'EUR'][field.value - 1] || '',
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
    </div>
  )
}
