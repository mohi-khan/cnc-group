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
  Department,
  GetDepartment,
  ResPartner,
} from '@/utils/type'
import type { UseFormReturn } from 'react-hook-form'

interface CashVoucherDetailsProps {
  form: UseFormReturn<any>
  fields: any[]
  filteredChartOfAccounts: AccountsHead[]
  costCenters: CostCenter[]
  departments: GetDepartment[]
  partners: ResPartner[]
  addDetailRow: () => void
  onSubmit: (values: any, status: 'Draft' | 'Posted') => void
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
}: CashVoucherDetailsProps) {
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
          {fields.map((field, index) => (
            <TableRow key={field.id}>
              <TableCell>
                <FormField
                  control={form.control}
                  name={`journalDetails.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <CustomCombobox
                          items={[
                            { id: 'Payment', name: 'Payment' },
                            { id: 'Receipt', name: 'Receipt' },
                          ]}
                          value={
                            field.value
                              ? { id: field.value, name: field.value }
                              : null
                          }
                          onChange={(value) =>
                            field.onChange(value ? value.id : null)
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
                              department.departmentName || 'Unnamed Department',
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
                        <CustomCombobox
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
                  name={`journalDetails.${index}.${
                    form.watch(`journalDetails.${index}.type`) === 'Payment'
                      ? 'debit'
                      : 'credit'
                  }`}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="text-right">
        <div className="flex justify-end space-x-2 mt-4">
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
