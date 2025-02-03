'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import type * as z from 'zod'
import { Plus, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CustomCombobox } from '@/utils/custom-combobox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRouter } from 'next/navigation'

import { toast } from '@/hooks/use-toast'
import {
  type BankAccount,
  type CompanyFromLocalstorage,
  type CostCenter,
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  type LocationFromLocalstorage,
  type ResPartner,
  type JournalResult,
  type AccountsHead,
  type JournalQuery,
  VoucherTypes,
  type Department,
} from '@/utils/type'
import {
  getAllBankAccounts,
  getAllChartOfAccounts,
  getAllCostCenters,
  getAllDepartments,
  getAllResPartners,
} from '@/api/bank-vouchers-api'
import {
  createJournalEntryWithDetails,
  getAllVoucher,
} from '@/api/vouchers-api'
import VoucherList from '@/components/voucher-list/voucher-list'
import { Popup } from '@/utils/popup'

interface User {
  userId: number
  username: string
  roleId: number
  roleName: string
}

export default function BankVoucher() {
  const [voucherGrid, setVoucherGrid] = React.useState<JournalResult[]>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [user, setUser] = React.useState<User | null>(null)
  const [companies, setCompanies] = React.useState<CompanyFromLocalstorage[]>(
    []
  )
  const [locations, setLocations] = React.useState<LocationFromLocalstorage[]>(
    []
  )
  const [bankAccounts, setBankAccounts] = React.useState<BankAccount[]>([])
  const [chartOfAccounts, setChartOfAccounts] = React.useState<AccountsHead[]>(
    []
  )
  const [filteredChartOfAccounts, setFilteredChartOfAccounts] = React.useState<
    AccountsHead[]
  >([])
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([])
  const [partners, setPartners] = React.useState<ResPartner[]>([])
  const [formType, setFormType] = React.useState('Credit')
  const [status, setStatus] = React.useState<'Draft' | 'Posted'>('Draft')
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [selectedBankAccount, setSelectedBankAccount] = React.useState<{
    id: number
    glCode: number
  } | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [dataLoaded, setDataLoaded] = React.useState(false) // Added dataLoaded state
  const router = useRouter()

  React.useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUser(userData)
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
      console.log('Current user from localStorage:', userData)

      if (!userData.voucherTypes.includes('Bank Voucher')) {
        console.log('User does not have access to Bank Voucher')
        router.push('/unauthorized-access')
      }
    } else {
      console.log('No user data found in localStorage')
      router.push('/unauthorized-access')
    }
  }, [router])

  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: {
      journalEntry: {
        date: '',
        journalType: '',
        companyId: 0,
        locationId: 0,
        currencyId: 0,
        amountTotal: 0,
        notes: '',
        createdBy: 0,
      },
      journalDetails: [
        {
          accountId: 0,
          costCenterId: null,
          departmentId: null,
          debit: 0,
          credit: 0,
          analyticTags: null,
          taxId: null,
          resPartnerId: null,
          notes: '',
          createdBy: 0,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'journalDetails',
  })

  const getCompanyIds = React.useCallback(
    (data: CompanyFromLocalstorage[]): number[] => {
      return data.map((company) => company.company.companyId)
    },
    []
  )
  const getLocationIds = React.useCallback(
    (data: LocationFromLocalstorage[]): number[] => {
      return data.map((location) => location.location.locationId)
    },
    []
  )

  async function getallVoucher(company: number[], location: number[]) {
    let localVoucherGrid: JournalResult[] = []
    try {
      const voucherQuery: JournalQuery = {
        date: new Date().toISOString().split('T')[0],
        companyId: company,
        locationId: location,
        voucherType: VoucherTypes.BankVoucher,
      }
      const response = await getAllVoucher(voucherQuery)
      if (!response.data) {
        throw new Error('No data received from server')
      }
      localVoucherGrid = Array.isArray(response.data) ? response.data : []
      console.log('Voucher data:', localVoucherGrid)
    } catch (error) {
      console.error('Error getting Voucher Data:', error)
      throw error
    }
    setVoucherGrid(localVoucherGrid)
  }

  React.useEffect(() => {
    const fetchVoucherData = async () => {
      if (companies.length > 0 && locations.length > 0 && !dataLoaded) {
        // Added condition to check dataLoaded
        setIsLoading(true)
        try {
          const mycompanies = getCompanyIds(companies)
          const mylocations = getLocationIds(locations)
          await getallVoucher(mycompanies, mylocations)
          setDataLoaded(true)
        } catch (error) {
          console.error('Error fetching voucher data:', error)
          toast({
            title: 'Error',
            description: 'Failed to load voucher data. Please try again.',
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchVoucherData()
  }, [
    companies,
    locations,
    getCompanyIds,
    getLocationIds,
    getallVoucher,
    dataLoaded,
  ]) // Added dataLoaded to dependencies

  async function fetchBankAccounts() {
    const response = await getAllBankAccounts()
    console.log('Fetched bank accounts:', response.data)
    if (response.error || !response.data) {
      console.error('Error getting bank account:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get bank accounts',
      })
    } else {
      setBankAccounts(response.data)
    }
  }

  async function fetchChartOfAccounts() {
    const response = await getAllChartOfAccounts()
    console.log('Fetched Chart Of accounts:', response.data)

    if (response.error || !response.data) {
      console.error('Error getting ChartOf bank account:', response.error)
      toast({
        title: 'Error',
        description:
          response.error?.message || 'Failed to get ChartOf bank accounts',
      })
    } else {
      setChartOfAccounts(response.data)
      setFilteredChartOfAccounts(response.data)
    }
  }

  const fetchCostCenters = async () => {
    const data = await getAllCostCenters()
    console.log('🚀 ~ fetchCostCenters ~ data:', data.data)
    if (data.error || !data.data) {
      console.error('Error getting cost centers:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get cost centers',
      })
    } else {
      setCostCenters(data.data)
    }
  }

  const fetchResPartners = async () => {
    const data = await getAllResPartners()
    console.log('🚀 ~ fetchrespartners ~ data:', data.data)
    if (data.error || !data.data) {
      console.error('Error getting res partners:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get partners',
      })
    } else {
      setPartners(data.data)
    }
  }

  async function fetchDepartments() {
    setIsLoading(true)
    const data = await getAllDepartments()
    if (data.error || !data.data) {
      console.error('Error getting res partners:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get partners',
      })
    } else {
      setDepartments(data.data)
    }
  }

  React.useEffect(() => {
    fetchBankAccounts()
    fetchChartOfAccounts()
    fetchDepartments()
    fetchCostCenters()
    fetchResPartners()
  }, [])

  React.useEffect(() => {
    console.log(formType)
    const accounttype = formType == 'Debit' ? 'Expenses' : 'Income'
    console.log(accounttype)
    const filteredCoa = chartOfAccounts?.filter((account) => {
      return account.isGroup == false && account.accountType == accounttype
    })
    console.log('COA', chartOfAccounts)
    setFilteredChartOfAccounts(filteredCoa)
    console.log('🚀 ~ React.useEffect ~ filteredCoa:', filteredCoa)
  }, [formType, chartOfAccounts])

  const onSubmit = async (
    values: z.infer<typeof JournalEntryWithDetailsSchema>,
    status: 'Draft' | 'Posted'
  ) => {
    console.log('Before Any edit', values)
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      console.log('Current userId from localStorage:', userData.userId)
      setUser(userData)
    }
    const totalAmount = values.journalDetails.reduce(
      (sum, detail) => sum + (detail.debit || detail.credit || 0),
      0
    )
    const updatedValues = {
      ...values,
      journalEntry: {
        ...values.journalEntry,
        state: status === 'Draft' ? 0 : 1,
        notes: values.journalEntry.notes || '',
        journalType: 'Bank Voucher',
        amountTotal: totalAmount,
        createdBy: user?.userId || 0,
      },
      journalDetails: values.journalDetails.map((detail) => ({
        ...detail,
        notes: detail.notes || '',
        createdBy: user?.userId || 0,
      })),
    }
    console.log('After Adding created by', updatedValues)
    const updateValueswithBank = {
      ...updatedValues,
      journalDetails: [
        ...updatedValues.journalDetails,
        {
          accountId: selectedBankAccount?.glCode || 0,
          costCenterId: null,
          departmentId: null,
          debit:
            formType === 'Debit' ? updatedValues.journalEntry.amountTotal : 0,
          credit:
            formType === 'Credit' ? updatedValues.journalEntry.amountTotal : 0,
          analyticTags: null,
          taxId: null,
          resPartnerId: null,
          bankaccountid: selectedBankAccount?.id,
          notes: updatedValues.journalEntry.notes || '',
          createdBy: user?.userId || 0,
        },
      ],
    }

    console.log(
      'Submitted values:',
      JSON.stringify(updateValueswithBank, null, 2)
    )
    const response = await createJournalEntryWithDetails(updateValueswithBank)
    if (response.error || !response.data) {
      toast({
        title: 'Error',
        description: response.error?.message || 'Error creating Journal',
      })
    } else {
      setDataLoaded(false) // Reset dataLoaded to trigger a refresh
      const mycompanies = getCompanyIds(companies)
      const mylocations = getLocationIds(locations)
      getallVoucher(mycompanies, mylocations)
      console.log('Voucher is created successfully', response.data)
      toast({
        title: 'Success',
        description: 'Voucher is created successfully',
      })
    }
  }

  const columns = [
    { key: 'voucherno' as const, label: 'Voucher No.' },
    { key: 'date' as const, label: 'Check No.' },
    { key: 'companyname' as const, label: 'Company Name' },
    { key: 'location' as const, label: 'Location' },
    { key: 'currency' as const, label: 'Currency' },
    { key: 'bank' as const, label: 'Bank Name' },
    { key: 'totalamount' as const, label: 'Amount' },
    { key: 'state' as const, label: 'Status' },
  ]

  const linkGenerator = (voucherId: number) =>
    `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.BankVoucher}`

  return (
    <div className="w-[97%] mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bank Vouchers</h1>
        <Button
          onClick={() => {
            form.reset()
            setIsDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Voucher
        </Button>
        <Popup
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Add New Voucher"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Enter the details for the bank voucher here. Click save when you're
            done.
          </p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => onSubmit(values, status))}
              className="space-y-8"
            >
              <div className="grid grid-cols-3 gap-4">
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
                            name:
                              company.company.companyName || 'Unnamed Company',
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
                            field.onChange(
                              value ? Number.parseInt(value.id, 10) : null
                            )
                          }
                          placeholder="Select company"
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
                            name:
                              location.location.address || 'Unnamed Location',
                          }))}
                          value={
                            field.value
                              ? {
                                  id: field.value.toString(),
                                  name:
                                    locations.find(
                                      (l) =>
                                        l.location.locationId === field.value
                                    )?.location.address || '',
                                }
                              : null
                          }
                          onChange={(value) =>
                            field.onChange(
                              value ? Number.parseInt(value.id, 10) : null
                            )
                          }
                          placeholder="Select location"
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
                            { id: '4', name: 'GBP' },
                          ]}
                          value={
                            field.value
                              ? {
                                  id: field.value.toString(),
                                  name: ['BDT', 'USD', 'EUR', 'GBP'][
                                    field.value - 1
                                  ],
                                }
                              : null
                          }
                          onChange={(value) =>
                            field.onChange(
                              value ? Number.parseInt(value.id, 10) : null
                            )
                          }
                          placeholder="Select currency"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <CustomCombobox
                    items={[
                      { id: 'Credit', name: 'Credit' },
                      { id: 'Debit', name: 'Debit' },
                    ]}
                    value={{ id: formType, name: formType }}
                    onChange={(value) => setFormType(value.id)}
                    placeholder="Select type"
                  />
                </FormItem>
                <FormItem>
                  <FormLabel>Bank Account</FormLabel>
                  <CustomCombobox
                    items={bankAccounts.map((account) => ({
                      id: account.id.toString(),
                      name: account.accountName || 'Unnamed Account',
                    }))}
                    value={
                      selectedBankAccount
                        ? {
                            id: selectedBankAccount.id.toString(),
                            name:
                              bankAccounts.find(
                                (a) => a.id === selectedBankAccount.id
                              )?.accountName || '',
                          }
                        : null
                    }
                    onChange={(value) => {
                      const selectedAccount = bankAccounts.find(
                        (account) => account.id.toString() === value.id
                      )
                      if (selectedAccount) {
                        setSelectedBankAccount({
                          id: selectedAccount.id,
                          glCode: selectedAccount.glAccountId || 0,
                        })
                      } else {
                        setSelectedBankAccount(null)
                      }
                    }}
                    placeholder="Select bank account"
                  />
                  <FormMessage />
                </FormItem>
                <FormField
                  control={form.control}
                  name="journalEntry.notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter check number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
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
                          placeholder="mm/dd/yyyy"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="journalEntry.amountTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <Table className="border">
                  <TableHeader>
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
                                    items={filteredChartOfAccounts.map(
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
                                              filteredChartOfAccounts.find(
                                                (a) =>
                                                  a.accountId === field.value
                                              )?.name || '',
                                          }
                                        : null
                                    }
                                    onChange={(value) =>
                                      field.onChange(
                                        value
                                          ? Number.parseInt(value.id, 10)
                                          : null
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
                                    items={costCenters.map((center) => ({
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
                                                (c) =>
                                                  c.costCenterId === field.value
                                              )?.costCenterName || '',
                                          }
                                        : null
                                    }
                                    onChange={(value) =>
                                      field.onChange(
                                        value
                                          ? Number.parseInt(value.id, 10)
                                          : null
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
                                                (d) =>
                                                  d.departmentID === field.value
                                              )?.departmentName || '',
                                          }
                                        : null
                                    }
                                    onChange={(value) =>
                                      field.onChange(
                                        value
                                          ? Number.parseInt(value.id, 10)
                                          : null
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
                                              partners.find(
                                                (p) => p.id === field.value
                                              )?.name || '',
                                          }
                                        : null
                                    }
                                    onChange={(value) =>
                                      field.onChange(
                                        value
                                          ? Number.parseInt(value.id, 10)
                                          : null
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
                                  <Input
                                    {...field}
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
                            name={`journalDetails.${index}.${formType === 'Credit' ? 'debit' : 'credit'}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Enter amount"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        Number.parseFloat(e.target.value)
                                      )
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
                  className="mt-2"
                  onClick={() =>
                    append({
                      voucherId: 0,
                      accountId: 0,
                      costCenterId: 0,
                      departmentId: null,
                      debit: 0,
                      credit: 0,
                      analyticTags: null,
                      taxId: null,
                      resPartnerId: null,
                      notes: '',
                      createdBy: 0,
                    })
                  }
                >
                  Add Another
                </Button>
              </div>
              <div className="flex justify-end space-x-2">
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
              </div>
            </form>
          </Form>
        </Popup>
      </div>

      <VoucherList
        vouchers={voucherGrid}
        columns={columns}
        isLoading={isLoading}
        linkGenerator={linkGenerator}
        itemsPerPage={10}
      />
    </div>
  )
}
