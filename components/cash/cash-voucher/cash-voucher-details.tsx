'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { FormField, FormItem, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CustomCombobox } from '@/utils/custom-combobox'
import type {
  AccountsHead,
  CostCenter,
  GetDepartment,
  ResPartner,
} from '@/utils/type'
import type { UseFormReturn } from 'react-hook-form'
import {
  type ComboboxItem,
  CustomComboboxWithApi,
} from '@/utils/custom-combobox-with-api'
import { useAtom } from 'jotai'
import { tokenAtom } from '@/utils/user'
import { getResPartnersBySearch } from '@/api/common-shared-api'
import { useEffect } from 'react'
import { useCallback } from 'react'

// Defines the props for the CashVoucherDetails component
interface CashVoucherDetailsProps {
  form: UseFormReturn<any>
  fields: any[]
  filteredChartOfAccounts: AccountsHead[]
  costCenters: CostCenter[]
  departments: GetDepartment[]
  partners: ResPartner[]
  addDetailRow: () => void
  onSubmit: (values: any, status: 'Draft' | 'Posted') => void
  onVoucherTypeChange?: (voucherType: string) => void
}

export default function CashVoucherDetails({
  form,
  fields,
  filteredChartOfAccounts,
  costCenters,
  departments,
  partners,
  addDetailRow,
  onSubmit,
  onVoucherTypeChange,
}: CashVoucherDetailsProps) {
  const [token] = useAtom(tokenAtom)

  const searchPartners = async (query: string): Promise<ComboboxItem[]> => {
    try {
      const response = await getResPartnersBySearch(query, token)
      if (response.error || !response.data) {
        console.error('Error fetching partners:', response.error)
        return []
      }

      return response.data.map((partner) => ({
        id: partner.id.toString(),
        name: partner.name || 'Unnamed Partner',
      }))
    } catch (error) {
      console.error('Error fetching partners:', error)
      return []
    }
  }

  // Function to determine voucher type based on current detail types

  const determineVoucherType = useCallback((): string => {
    const currentDetails = form.getValues('journalDetails') || []
    const types = currentDetails
      .map((detail: any) => detail.type)
      .filter(Boolean)

    if (types.length === 0) return 'Unknown'

    const hasPayment = types.includes('Payment')
    const hasReceipt = types.includes('Receipt')

    // if (hasPayment && hasReceipt) return "Mixed"
    if (hasPayment && !hasReceipt) return 'Payment'
    if (hasReceipt && !hasPayment) return 'Receipt'

    return 'Unknown'
  }, [form])

  // Watch for changes in detail types and notify parent
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && name.includes('journalDetails') && name.includes('type')) {
        const voucherType = determineVoucherType()
        onVoucherTypeChange?.(voucherType)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, onVoucherTypeChange, determineVoucherType])

  // Type options - always show both Payment and Receipt
  const typeOptions = [
    { id: 'Payment', name: 'Payment' },
    { id: 'Receipt', name: 'Receipt' },
  ]

  return (
    <div className="mb-6">
      <Table className="border shadow-md">
        <TableHeader className="bg-slate-200 shadow-md">
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Account Name</TableHead>
            <TableHead>Cost Center</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Partner Name</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, index) => {
            const currentType =
              form.watch(`journalDetails.${index}.type`) || 'Receipt'

            return (
              <TableRow key={field.id}>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomCombobox
                            items={typeOptions}
                            value={
                              field.value
                                ? { id: field.value, name: field.value }
                                : { id: 'Receipt', name: 'Receipt' }
                            }
                            onChange={(value) => {
                              const newType = value ? value.id : 'Receipt'
                              field.onChange(newType)

                              // Reset the amount fields when type changes
                              if (newType === 'Payment') {
                                form.setValue(
                                  `journalDetails.${index}.credit`,
                                  0
                                )
                              } else {
                                form.setValue(
                                  `journalDetails.${index}.debit`,
                                  0
                                )
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.accountId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomCombobox
                            items={filteredChartOfAccounts.map((account) => ({
                              id: account.accountId.toString(),
                              name: account.name || 'Unnamed Account',
                            }))}
                            value={
                              field.value
                                ? {
                                    id: field.value.toString(),
                                    name:
                                      filteredChartOfAccounts.find(
                                        (a) => a.accountId === field.value
                                      )?.name || '',
                                  }
                                : null
                            }
                            onChange={(value) => {
                              field.onChange(
                                value ? Number.parseInt(value.id, 10) : null
                              )
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.costCenterId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomCombobox
                            items={costCenters.map((center) => ({
                              id: center.costCenterId.toString(),
                              name:
                                center.costCenterName || 'Unnamed Cost Center',
                            }))}
                            value={
                              field.value
                                ? {
                                    id: field.value.toString(),
                                    name:
                                      costCenters.find(
                                        (c) => c.costCenterId === field.value
                                      )?.costCenterName || '',
                                  }
                                : null
                            }
                            onChange={(value) =>
                              field.onChange(
                                value ? Number.parseInt(value.id, 10) : null
                              )
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.departmentId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomCombobox
                            items={departments.map((department) => ({
                              id: department.departmentID.toString(),
                              name:
                                department.departmentName ||
                                'Unnamed Department',
                            }))}
                            value={
                              field.value
                                ? {
                                    id: field.value.toString(),
                                    name:
                                      departments.find(
                                        (d) => d.departmentID === field.value
                                      )?.departmentName || '',
                                  }
                                : null
                            }
                            onChange={(value) =>
                              field.onChange(
                                value ? Number.parseInt(value.id, 10) : null
                              )
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.resPartnerId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomComboboxWithApi
                            items={partners.map((partner) => ({
                              id: partner.id.toString(),
                              name: partner.name || 'Unnamed Partner',
                            }))}
                            value={
                              field.value
                                ? {
                                    id: field.value.toString(),
                                    name:
                                      partners.find((p) => p.id === field.value)
                                        ?.name || '',
                                  }
                                : null
                            }
                            onChange={(value) =>
                              field.onChange(
                                value ? Number.parseInt(value.id, 10) : null
                              )
                            }
                            searchFunction={searchPartners}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter remarks"
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.${currentType === 'Payment' ? 'debit' : 'credit'}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={`Enter ${currentType === 'Payment' ? 'payment' : 'receipt'} amount`}
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                Number.parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <div className="text-right">
        <div className="flex justify-end space-x-2 mt-4 ">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const values = form.getValues()
              onSubmit(values, 'Draft')
            }}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const values = form.getValues()
              onSubmit(values, 'Posted')
            }}
          >
            Save as Post
          </Button>
          <Button type="button" onClick={addDetailRow}>
            Add Another
          </Button>
        </div>
      </div>
    </div>
  )
}
