'use client'

import { useFieldArray, type UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash } from 'lucide-react'
import { CustomCombobox } from '@/utils/custom-combobox'

interface FormState {
  filteredChartOfAccounts: { accountId: number; name: string }[]
  costCenters: { costCenterId: number; costCenterName: string }[]
  departments: { departmentID: number; departmentName: string }[]
  partners: { id: number; name: string }[]
  formType: 'Credit' | 'Debit'
}

export default function BankVoucherDetails({
  form,
  formState,
}: {
  form: UseFormReturn<any>
  formState: FormState
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'journalDetails',
  })

  return (
    <div>
      <Table className="border shadow-md">
        <TableHeader className="bg-slate-200 shadow-md">
          <TableRow>
            <TableHead>Account Name</TableHead>
            <TableHead>Cost Center</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Partner Name</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, index) => (
            <TableRow key={field.id}>
              <TableCell>
                <FormField
                  control={form.control}
                  name={`journalDetails.${index}.accountId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <CustomCombobox
                          items={formState.filteredChartOfAccounts.map(
                            (account) => ({
                              id: account.accountId.toString(),
                              name: account.name || 'Unnamed Account',
                            })
                          )}
                          value={
                            field.value
                              ? {
                                  id: field.value.toString(),
                                  name:
                                    formState.filteredChartOfAccounts.find(
                                      (a) => a.accountId === field.value
                                    )?.name || '',
                                }
                              : null
                          }
                          onChange={(value) =>
                            field.onChange(
                              value ? Number.parseInt(value.id, 10) : null
                            )
                          }
                          placeholder="Select account"
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
                          items={formState.costCenters.map((center) => ({
                            id: center.costCenterId.toString(),
                            name:
                              center.costCenterName || 'Unnamed Cost Center',
                          }))}
                          value={
                            field.value
                              ? {
                                  id: field.value.toString(),
                                  name:
                                    formState.costCenters.find(
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
                          placeholder="Select cost center"
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
                          items={formState.departments.map((department) => ({
                            id: department.departmentID.toString(),
                            name:
                              department.departmentName || 'Unnamed Department',
                          }))}
                          value={
                            field.value
                              ? {
                                  id: field.value.toString(),
                                  name:
                                    formState.departments.find(
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
                          placeholder="Select department"
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
                        <CustomCombobox
                          items={formState.partners.map((partner) => ({
                            id: partner.id.toString(),
                            name: partner.name || 'Unnamed Partner',
                          }))}
                          value={
                            field.value
                              ? {
                                  id: field.value.toString(),
                                  name:
                                    formState.partners.find(
                                      (p) => p.id === field.value
                                    )?.name || '',
                                }
                              : null
                          }
                          onChange={(value) =>
                            field.onChange(
                              value ? Number.parseInt(value.id, 10) : null
                            )
                          }
                          placeholder="Select partner"
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
                        <Input {...field} placeholder="Enter remarks" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TableCell>
             
              <TableCell>
                <FormField
                  control={form.control}
                  name={`journalDetails.${index}.${formState.formType === 'Credit' ? 'debit' : 'credit'}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number.parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-5"
        onClick={() =>
          append({
            voucherId: 0,
            accountId: 0,
            costCenterId: null,
            departmentId: null,
            debit: 0,
            credit: 0,
            analyticTags: null,
            taxId: null,
            resPartnerId: null,
            notes: '',
            // payTo: '',
            createdBy: 0,
          })
        }
      >
        Add Another
      </Button>
    </div>
  )
}
