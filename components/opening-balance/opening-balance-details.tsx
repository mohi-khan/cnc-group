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
import type { FormStateType, ResPartner } from '@/utils/type'
import { useEffect, useState } from 'react'
import {
  type ComboboxItem,
  CustomComboboxWithApi,
} from '@/utils/custom-combobox-with-api'
import { getPartnerById, getResPartnersBySearch } from '@/api/common-shared-api'
import { useAtom } from 'jotai'
import { tokenAtom } from '@/utils/user'

export default function OpeningBalanceDetails({
  form,
  formState,
  requisition,
  partners,
  isFromInvoice = false,
  invoicePartnerName = '',
  isEdit = false,
}: {
  form: UseFormReturn<any>
  formState: FormStateType
  requisition: any
  partners: ResPartner[]
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

  // Auto-update account 217 amount based on other accounts when editing
  useEffect(() => {
    if (!isEdit) return

    const subscription = watch((value, { name }) => {
      if (
        name?.includes('journalDetails') &&
        (name.includes('debit') || name.includes('credit'))
      ) {
        const details = value.journalDetails || []

        const account217Index = details.findIndex(
          (detail: any) => detail.accountId === 217
        )
        if (account217Index === -1) return

        if (name.includes(`journalDetails.${account217Index}`)) return

        let totalDebit = 0
        let totalCredit = 0

        details.forEach((detail: any, index: number) => {
          if (index !== account217Index && detail.accountId !== 217) {
            totalDebit += Number(detail.debit || 0)
            totalCredit += Number(detail.credit || 0)
          }
        })

        const currentAccount217Debit = Number(
          details[account217Index]?.debit || 0
        )
        const currentAccount217Credit = Number(
          details[account217Index]?.credit || 0
        )

        if (currentAccount217Debit !== totalCredit) {
          form.setValue(
            `journalDetails.${account217Index}.debit`,
            totalCredit,
            { shouldValidate: false }
          )
        }
        if (currentAccount217Credit !== totalDebit) {
          form.setValue(
            `journalDetails.${account217Index}.credit`,
            totalDebit,
            { shouldValidate: false }
          )
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [isEdit, watch, form])

  // Filter out the "Difference between Opening Balance" row (accountId: 217) when editing
  const visibleFields = isEdit
    ? fields.filter((field: any, index: number) => {
        const accountId = form.watch(`journalDetails.${index}.accountId`)
        return accountId !== 217
      })
    : fields

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
            <TableHead>Bank Account</TableHead>
            <TableHead>Account Name</TableHead>
            <TableHead>Cost Center</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Partner Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleFields.map((field, visibleIndex) => {
            const index = fields.findIndex((f: any) => f.id === field.id)

            const selectedBankAccountId = form.watch(
              `journalDetails.${index}.bankaccountid`
            )
            const selectedAccountId = form.watch(
              `journalDetails.${index}.accountId`
            )
            const selectedAccount = formState.filteredChartOfAccounts.find(
              (account) => account.accountId === selectedAccountId
            )
            const isPartnerFieldEnabled =
              selectedAccount?.withholdingTax === true

            const isPartnerDisabled = !!selectedBankAccountId

            return (
              <TableRow key={field.id}>
                {/* Bank Account */}
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.bankaccountid`}
                    render={({ field }) => {
                      const selectedBank = formState.bankAccounts.find(
                        (b) => b.id === field.value
                      )
                      const items = formState.bankAccounts
                        .filter(
                          (acc) =>
                            acc.isActive &&
                            acc.companyId ===
                              form.watch('journalEntry.companyId')
                        )
                        .map((acc) => ({
                          id: acc.id.toString(),
                          name: `${acc.bankName} - ${acc.accountName} (${acc.accountNumber})`,
                        }))

                      return (
                        <FormItem>
                          <FormControl>
                            <CustomCombobox
                              items={items}
                              value={
                                field.value
                                  ? {
                                      id: field.value.toString(),
                                      name: selectedBank
                                        ? `${selectedBank.bankName} - ${selectedBank.accountName} (${selectedBank.accountNumber})`
                                        : '',
                                    }
                                  : null
                              }
                              onChange={(value) => {
                                const selectedId = value
                                  ? Number(value.id)
                                  : null
                                field.onChange(selectedId)

                                if (selectedId) {
                                  const selectedBank =
                                    formState.bankAccounts.find(
                                      (acc) => acc.id === selectedId
                                    )
                                  if (selectedBank?.glAccountId) {
                                    form.setValue(
                                      `journalDetails.${index}.accountId`,
                                      selectedBank.glAccountId
                                    )
                                  }
                                }
                              }}
                              placeholder={
                                form.watch('journalEntry.companyId')
                                  ? 'Select a Bank Account'
                                  : 'Select company first'
                              }
                              disabled={
                                !form.watch('journalEntry.companyId') ||
                                formState.bankAccounts.length === 0
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )
                    }}
                  />
                </TableCell>

                {/* Account Name */}
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
                                } else {
                                  form.setValue(
                                    `journalDetails.${index}.resPartnerId`,
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

                {/* Cost Center */}
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.costCenterId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomCombobox
                            items={formState.costCenters.map((cc) => ({
                              id: cc.costCenterId?.toString(),
                              name:
                                cc.costCenterName ||
                                cc.name ||
                                'Unnamed Cost Center',
                            }))}
                            value={
                              field.value
                                ? {
                                    id: field.value.toString(),
                                    name:
                                      formState.costCenters.find(
                                        (c) => c.costCenterId === field.value
                                      )?.costCenterName ||
                                      formState.costCenters.find(
                                        (c) => c.costCenterId === field.value
                                      )?.name ||
                                      '',
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

                {/* Employee */}
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.employeeId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomCombobox
                            items={formState.employees.map((employee) => ({
                              id: employee.id.toString(),
                              name: `${employee.employeeName} (${employee.employeeId})`, // 👈 Show both,
                            }))}
                            value={
                              field.value
                                ? {
                                    id: field.value.toString(),
                                    name:
                                      formState.employees.find(
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

                {/* Partner */}
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.resPartnerId`}
                    render={({ field }) => (
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
                            <div
                              className={`${isPartnerDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
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
                                disabled={isPartnerDisabled}
                              />
                            </div>
                          )}
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>

                {/* Amount */}
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`journalDetails.${index}.${formState.formType === 'Credit' ? 'credit' : 'debit'}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => {
                              const num = parseFloat(e.target.value)
                              field.onChange(Number.isNaN(num) ? 0 : num)
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>

                {/* Action */}
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
            append({
              voucherId: 0,
              accountId: 0,
              costCenterId: null,
              departmentId: null,
              employeeId: null,
              debit: formState.formType === 'Debit' ? 0 : 0,
              credit: formState.formType === 'Credit' ? 0 : 0,
              analyticTags: null,
              taxId: null,
              resPartnerId: null,
              bankaccountid: null,
              notes: '',
              createdBy: 0,
            })
          }}
        >
          Add Another
        </Button>
      )}
    </div>
  )
}
