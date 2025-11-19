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
  Employee,
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
import { getPartnerById, getResPartnersBySearch } from '@/api/common-shared-api'
import { useEffect, useCallback, useState } from 'react'
import { useFieldArray } from 'react-hook-form'
import { Trash } from 'lucide-react'

interface CashVoucherDetailsProps {
  form: UseFormReturn<any>
  filteredChartOfAccounts: AccountsHead[]
  costCenters: CostCenter[]
  departments: GetDepartment[]
  employees: Employee[]
  partners: ResPartner[]
  onSubmit: (values: any, status: 'Draft' | 'Posted') => void
  onVoucherTypeChange?: (voucherType: string) => void
  isEdit?: boolean
}

export default function CashVoucherDetails({
  form,
  filteredChartOfAccounts,
  costCenters,
  departments,
  employees,
  partners,
  onSubmit,
  onVoucherTypeChange,
  isEdit = false,
}: CashVoucherDetailsProps) {
  const [token] = useAtom(tokenAtom)
  const [partnerValue, setPartnerValue] = useState<{
    id: number | string
    name: string
  } | null>(null)
  const { watch } = form

  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: 'journalDetails',
  })

  const searchPartners = async (query: string): Promise<ComboboxItem[]> => {
    try {
      const response = await getResPartnersBySearch(query, token)
      if (response.error || !response.data) return []
      return response.data.map((partner) => ({
        id: partner.id.toString(),
        name: partner.name || 'Unnamed Partner',
      }))
    } catch {
      return []
    }
  }

  const watchedPartnerId = watch('journalDetails.0.resPartnerId')

  useEffect(() => {
    const loadPartner = async () => {
      if (!watchedPartnerId) {
        setPartnerValue(null)
        return
      }

      const local = partners.find((p) => p.id === Number(watchedPartnerId))
      if (local) {
        setPartnerValue(local)
        return
      }

      const partner = await getPartnerById(Number(watchedPartnerId), token)
      if (partner?.data) {
        setPartnerValue({ id: partner.data.id, name: partner.data.name || '' })
      }
    }

    loadPartner()
  }, [watchedPartnerId, partners, token])

  const determineVoucherType = useCallback((): string => {
    const currentDetails = form.getValues('journalDetails') || []
    const types = currentDetails
      .map((detail: any) => detail.type)
      .filter(Boolean)
    if (types.length === 0) return 'Unknown'
    const hasPayment = types.includes('Payment')
    const hasReceipt = types.includes('Receipt')
    if (hasPayment && !hasReceipt) return 'Payment'
    if (hasReceipt && !hasPayment) return 'Receipt'
    return 'Unknown'
  }, [form])

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && name.includes('journalDetails') && name.includes('type')) {
        const voucherType = determineVoucherType()
        onVoucherTypeChange?.(voucherType)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, onVoucherTypeChange, determineVoucherType])

  const typeOptions = [
    { id: 'Payment', name: 'Payment' },
    { id: 'Receipt', name: 'Receipt' },
  ]

  const selectedCompanyId = form.watch('journalEntry.companyId')
  const isCompanySelected = !!selectedCompanyId

  return (
    <div className="mb-6">
      {!isCompanySelected && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
          ⚠️ Please select a company first to see available chart of accounts
        </div>
      )}

      <Table className="border shadow-md">
        <TableHeader className="bg-slate-200 shadow-md">
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Account Name</TableHead>
            <TableHead>Cost Center</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Partner Name</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {fields.map((field, index) => {
            const currentType =
              form.watch(`journalDetails.${index}.type`) || 'Receipt'
            const selectedAccountId = form.watch(
              `journalDetails.${index}.accountId`
            )
            const selectedAccount = filteredChartOfAccounts.find(
              (account) => account.accountId === selectedAccountId
            )
            const isPartnerFieldEnabled =
              selectedAccount?.withholdingTax === true

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
                            items={filteredChartOfAccounts
                              .filter((account) => account.isActive)
                              .map((account) => ({
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
                              const newAccountId = value
                                ? Number.parseInt(value.id, 10)
                                : null
                              field.onChange(newAccountId)
                              if (newAccountId) {
                                const newAccount = filteredChartOfAccounts.find(
                                  (account) =>
                                    account.accountId === newAccountId
                                )
                                if (!newAccount?.withholdingTax) {
                                  form.setValue(
                                    `journalDetails.${index}.resPartnerId`,
                                    null
                                  )
                                }
                              } else {
                                form.setValue(
                                  `journalDetails.${index}.resPartnerId`,
                                  null
                                )
                              }
                            }}
                            placeholder={
                              !isCompanySelected
                                ? 'Select company first'
                                : filteredChartOfAccounts.length === 0
                                  ? 'No accounts for this company'
                                  : 'Select an account'
                            }
                            disabled={
                              !isCompanySelected ||
                              filteredChartOfAccounts.length === 0
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
                    name={`journalDetails.${index}.costCenterId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomCombobox
                            items={costCenters
                              .filter((center) => center.isActive)
                              .map((center) => ({
                                id: center.costCenterId.toString(),
                                name:
                                  center.costCenterName ||
                                  'Unnamed Cost Center',
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
                            placeholder="Select a cost center"
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
                            items={departments
                              .filter((department) => department.isActive)
                              .map((department) => ({
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
                            placeholder="Select a department"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>

                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.employeeId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomCombobox
                            items={employees.map((employee) => ({
                              id: employee.id.toString(),
                              name: employee.employeeName || 'Unnamed Employee',
                            }))}
                            value={
                              field.value
                                ? {
                                    id: field.value.toString(),
                                    name:
                                      employees.find(
                                        (e) => e.id === field.value
                                      )?.employeeName || '',
                                  }
                                : null
                            }
                            onChange={(value) =>
                              field.onChange(
                                value ? Number.parseInt(value.id , 10) : null
                              )
                            }
                            placeholder="Select an employee"
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
                          <div
                            className={`${!isPartnerFieldEnabled ? 'cursor-not-allowed opacity-40' : ''}`}
                          >
                            <CustomComboboxWithApi
                              items={partners.map((partner) => ({
                                id: partner.id.toString(),
                                name: partner.name || '',
                              }))}
                              value={
                                field.value
                                  ? (partners.find(
                                      (p) => p.id === Number(field.value)
                                    ) ?? {
                                      id: field.value,
                                      name: partnerValue?.name || '',
                                    })
                                  : null
                              }
                              onChange={(item) =>
                                field.onChange(
                                  item ? Number.parseInt(item.id) : null
                                )
                              }
                              placeholder="Select partner"
                              searchFunction={searchPartners}
                              fetchByIdFunction={async (id) => {
                                const numericId: number =
                                  typeof id === 'string' && /^\d+$/.test(id)
                                    ? parseInt(id, 10)
                                    : (id as number)
                                const partner = await getPartnerById(
                                  numericId,
                                  token
                                )
                                return partner?.data
                                  ? {
                                      id: partner.data.id.toString(),
                                      name: partner.data.name ?? '',
                                    }
                                  : null
                              }}
                            />
                          </div>
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
                            value={field.value === 0 ? '' : field.value}
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

                <TableCell>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => remove(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className="text-right">
        <div className="flex justify-between">
          <div className="mt-4">
            {!isEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const lastType =
                    fields.length > 0
                      ? form.getValues(
                          `journalDetails.${fields.length - 1}.type`
                        )
                      : 'Receipt'
                  append({
                    type: lastType,
                    accountId: null,
                    costCenterId: null,
                    departmentId: null,
                    employeeId: null,
                    resPartnerId: null,
                    notes: '',
                    debit: lastType === 'Payment' ? 0 : 0,
                    credit: lastType === 'Receipt' ? 0 : 0,
                  })
                }}
                disabled={!isCompanySelected}
              >
                Add Another
              </Button>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSubmit(form.getValues(), 'Draft')}
              disabled={!isCompanySelected}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onSubmit(form.getValues(), 'Posted')}
              disabled={!isCompanySelected}
            >
              Save as Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

