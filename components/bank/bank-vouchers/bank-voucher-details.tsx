'use client'
import { useFieldArray, type UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
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
import type { FormStateType, ResPartner, Employee } from '@/utils/type'
import { useEffect, useState, useCallback } from 'react'
import {
  type ComboboxItem,
  CustomComboboxWithApi,
} from '@/utils/custom-combobox-with-api'
import { getPartnerById, getResPartnersBySearch } from '@/api/common-shared-api'
import { useAtom } from 'jotai'
import { tokenAtom } from '@/utils/user'

export default function BankVoucherDetails({
  form,
  formState,
  requisition,
  partners,
  employees,
  isFromInvoice = false,
  invoicePartnerName = '',
  isEdit = false,
}: {
  form: UseFormReturn<any>
  formState: FormStateType
  requisition: any
  partners: ResPartner[]
  employees: Employee[]
  isFromInvoice?: boolean
  invoicePartnerName?: string
  isEdit?: boolean
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'journalDetails',
  })

  const [token] = useAtom(tokenAtom)

  const [partnerValue, setPartnerValue] = useState<{
    id: number | string
    name: string
  } | null>(null)
  const { watch } = form

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

  useEffect(() => {
    if (!isEdit && fields.length > 0 && fields.length === 1) {
      const totalAmount = form.getValues('journalEntry.amountTotal') || 0
      form.setValue(
        `journalDetails.0.${formState.formType === 'Credit' ? 'debit' : 'credit'}`,
        totalAmount
      )
    }
  }, [fields.length, form, formState.formType, isEdit])

  useEffect(() => {
    if (formState.selectedBankAccount?.id) {
      const currentDetails = form.getValues('journalDetails') || []
      const updatedDetails = currentDetails.map((detail: any) => ({
        ...detail,
        bankaccountid: formState.selectedBankAccount?.id,
      }))
      form.setValue('journalDetails', updatedDetails)
    }
  }, [formState.selectedBankAccount?.id, form])

  const calculateTotalAmount = () => {
    if (!isEdit) return

    const currentDetails = form.getValues('journalDetails') || []

    const totalDebit = currentDetails.reduce((sum: number, detail: any) => {
      return sum + (Number(detail.debit) || 0)
    }, 0)

    const totalCredit = currentDetails.reduce((sum: number, detail: any) => {
      return sum + (Number(detail.credit) || 0)
    }, 0)

    const calculatedAmount = Math.max(totalDebit, totalCredit)

    form.setValue('journalEntry.amountTotal', calculatedAmount, {
      shouldValidate: false,
    })
  }

  // Validation function to check if all required fields are filled
  const validateRequiredFields = useCallback(() => {
    const details = form.getValues('journalDetails') || []

    for (let index = 0; index < details.length; index++) {
      const detail = details[index]
      const selectedAccount = formState.filteredChartOfAccounts.find(
        (account) => account.accountId === detail.accountId
      )

      // Check if partner is required but not filled
      if (
        (selectedAccount?.withholdingTax === true ||
          selectedAccount?.isPartner === true) &&
        !detail.resPartnerId
      ) {
        form.setError(`journalDetails.${index}.resPartnerId`, {
          type: 'manual',
          message: 'Partner is required for this account',
        })
        return false
      }

      // Check if cost center is required but not filled
      if (selectedAccount?.isCostCenter === true && !detail.costCenterId) {
        form.setError(`journalDetails.${index}.costCenterId`, {
          type: 'manual',
          message: 'Cost Center is required for this account',
        })
        return false
      }
    }

    return true
  }, [form, formState.filteredChartOfAccounts])

  // Expose validation function to parent
  useEffect(() => {
    if (form) {
      ;(form as any).validateBankVoucherDetails = validateRequiredFields
    }
  }, [form, validateRequiredFields])

  const selectedCompanyId = form.watch('journalEntry.companyId')
  const isCompanySelected = !!selectedCompanyId

  return (
    <div>
      {!selectedCompanyId && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
          ⚠️ Please select a company first to see available Transaction
        </div>
      )}
      <Table className="border shadow-md">
        <TableHeader className="bg-slate-200 shadow-md">
          <TableRow>
            <TableHead>Account Name</TableHead>
            <TableHead>Cost Center</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Partner Name</TableHead>
            <TableHead>Cheque Number</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, index) => {
            const selectedAccountId = form.watch(
              `journalDetails.${index}.accountId`
            )
            const selectedAccount = formState.filteredChartOfAccounts.find(
              (account) => account.accountId === selectedAccountId
            )
            const isPartnerFieldRequired =
              selectedAccount?.withholdingTax === true
            const isCostCenterFieldRequired =
              selectedAccount?.isCostCenter === true

            return (
              <TableRow key={field.id}>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.accountId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomCombobox
                            items={formState.filteredChartOfAccounts
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
                                      formState.filteredChartOfAccounts.find(
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
                              if (!isFromInvoice) {
                                if (newAccountId) {
                                  const newAccount =
                                    formState.filteredChartOfAccounts.find(
                                      (account) =>
                                        account.accountId === newAccountId
                                    )
                                  if (!newAccount?.withholdingTax) {
                                    form.setValue(
                                      `journalDetails.${index}.resPartnerId`,
                                      null
                                    )
                                  }
                                  if (!newAccount?.isCostCenter) {
                                    form.setValue(
                                      `journalDetails.${index}.costCenterId`,
                                      null
                                    )
                                  }
                                } else {
                                  form.setValue(
                                    `journalDetails.${index}.resPartnerId`,
                                    null
                                  )
                                  form.setValue(
                                    `journalDetails.${index}.costCenterId`,
                                    null
                                  )
                                }
                              }
                            }}
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
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <div>
                            <CustomCombobox
                              items={formState.costCenters
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
                              placeholder={
                                isCostCenterFieldRequired
                                  ? 'Select cost center *'
                                  : 'Select cost center'
                              }
                            />
                            {fieldState.error && (
                              <p className="text-xs text-red-500 mt-1">
                                {fieldState.error.message}
                              </p>
                            )}
                          </div>
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
                            items={formState.departments
                              .filter(
                                (department) =>
                                  department.isActive &&
                                  department.companyCode === selectedCompanyId
                              )
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
                            placeholder={
                              !isCompanySelected
                                ? 'Select company first'
                                : formState.departments.filter(
                                      (d) => d.companyCode === selectedCompanyId
                                    ).length === 0
                                  ? 'No departments for this company'
                                  : 'Select a department'
                            }
                            disabled={
                              !isCompanySelected ||
                              formState.departments.filter(
                                (d) => d.companyCode === selectedCompanyId
                              ).length === 0
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
                    name={`journalDetails.${index}.employeeId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomCombobox
                            items={employees.map((employee) => ({
                              id: employee.id.toString(),
                              name: `${employee.employeeName} (${employee.employeeId})`, // 👈 Show both,
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
                                value ? Number.parseInt(value.id, 10) : null
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
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          {isFromInvoice ? (
                            <Input
                              value={invoicePartnerName}
                              disabled
                              className="bg-gray-100 cursor-not-allowed"
                              placeholder="Partner name from invoice"
                            />
                          ) : (
                            <div>
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
                                onChange={(item) => {
                                  field.onChange(
                                    item ? Number.parseInt(item.id) : null
                                  )
                                }}
                                placeholder={
                                  isPartnerFieldRequired
                                    ? 'Select partner *'
                                    : 'Select partner'
                                }
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
                              {fieldState.error && (
                                <p className="text-xs text-red-500 mt-1">
                                  {fieldState.error.message}
                                </p>
                              )}
                            </div>
                          )}
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
                            value={field.value ?? ''}
                            placeholder="Enter cheque no"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.remarks`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ''}
                            placeholder="Enter remarks"
                          />
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
                            value={field.value === 0 ? '' : field.value}
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(
                                value === '' ? undefined : Number(value)
                              )
                              if (isEdit) {
                                setTimeout(() => calculateTotalAmount(), 0)
                              }
                            }}
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
                    onClick={() => {
                      remove(index)
                      if (isEdit) {
                        setTimeout(() => calculateTotalAmount(), 0)
                      }
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {!isEdit && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-5 bg-transparent"
          onClick={() => {
            const totalAmount = form.getValues('journalEntry.amountTotal') || 0
            const currentDetails = form.getValues('journalDetails') || []
            const currentField =
              formState.formType === 'Credit' ? 'debit' : 'credit'
            const usedAmount = currentDetails.reduce(
              (sum: number, detail: Record<string, number>) =>
                sum + (detail[currentField] || 0),
              0
            )
            const remainingAmount = totalAmount - usedAmount
            append({
              voucherId: 0,
              accountId: 0,
              costCenterId: null,
              departmentId: null,
              employeeId: null,
              debit: formState.formType === 'Credit' ? remainingAmount : 0,
              credit: formState.formType === 'Debit' ? remainingAmount : 0,
              analyticTags: null,
              taxId: null,
              resPartnerId: null,
              notes: '',
              remarks: '',
              createdBy: 0,
              bankaccountid: formState.selectedBankAccount?.id || null,
            })
          }}
        >
          Add Another
        </Button>
      )}
    </div>
  )
}

