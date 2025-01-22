'use client'

import React, { useEffect, useState } from 'react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Check, Printer, RotateCcw, Trash, ChevronsUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  createJournalEntryWithDetails,
  getAllChartOfAccounts,
  getAllResPartners,
  getAllVoucher,
  getAllVoucherById,
} from '@/api/vouchers-api'
import { toast } from '@/hooks/use-toast'
import {
  type AccountsHead,
  ChartOfAccount,
  Company,
  type CompanyFromLocalstorage,
  type CostCenter,
  DetailRow,
  type FormData,
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  type JournalQuery,
  type JournalResult,
  Location,
  type LocationFromLocalstorage,
  type ResPartner,
  type User,
  type Voucher,
  VoucherTypes,
} from '@/utils/type'
import { getAllCostCenters } from '@/api/cost-centers-api'
import { Checkbox } from '@/components/ui/checkbox'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { cn } from '@/lib/utils'
import { Combobox } from '@/components/ui/combobox'

export default function CashVoucher() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [companies, setCompanies] = React.useState<CompanyFromLocalstorage[]>(
    []
  )
  const [locations, setLocations] = React.useState<LocationFromLocalstorage[]>(
    []
  )
  const [vouchers, setVouchers] = React.useState<JournalEntryWithDetails[]>([])
  const [voucherList, setVoucherList] = useState<Voucher[]>([])
  const [formData, setFormData] = useState<FormData>({
    date: '',
    company: '',
    location: '',
    currency: '',
  })
  const [cashBalance, setCashBalance] = useState(120000) // Initial cash balance
  const [isLoading, setIsLoading] = useState(true)
  const [vouchergrid, setVoucherGrid] = React.useState<JournalResult[]>([])
  const [chartOfAccounts, setChartOfAccounts] = React.useState<AccountsHead[]>(
    []
  )
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([])
  const [partners, setPartners] = React.useState<ResPartner[]>([])
  const [formType, setFormType] = React.useState('Payment')
  const [filteredChartOfAccounts, setFilteredChartOfAccounts] = React.useState<
    AccountsHead[]
  >([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const [isLoadingLocations, setIsLoadingLocations] = useState(true)
  const [isLoadingPartners, setIsLoadingPartners] = useState(true)
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)
  const [isLoadingCostCenters, setIsLoadingCostCenters] = useState(true)
  const [openComboboxes, setOpenComboboxes] = React.useState<{
    [key: string]: boolean
  }>({})

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    setIsLoadingCompanies(true)
    setIsLoadingLocations(true)
    try {
      if (userStr) {
        const userData = JSON.parse(userStr)
        setUser(userData)
        setCompanies(userData.userCompanies || [])
        setLocations(userData.userLocations || [])
        if (!userData.voucherTypes.includes('Cash Voucher')) {
          router.push('/unauthorized-access')
        }
      } else {
        router.push('/unauthorized-access')
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load user data',
      })
    } finally {
      setIsLoadingCompanies(false)
      setIsLoadingLocations(false)
      setIsLoading(false)
    }
  }, [])
  // For Getting All The Vouchers

  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }
  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
  }

  async function getallVoucher(company: number[], location: number[]) {
    try {
      console.log(new Date().toISOString().split('T')[0])
      const voucherQuery: JournalQuery = {
        date: new Date().toISOString().split('T')[0],
        companyId: company,
        locationId: location,
        voucherType: VoucherTypes.CashVoucher,
      }
      const response = await getAllVoucher(voucherQuery)
      if (!response.data) {
        throw new Error('No data received from server')
      }
      setVoucherGrid(response.data as JournalResult[])
      console.log('Voucher data:', response.data)
    } catch (error) {
      console.error('Error getting Voucher Data:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to get Voucher Data',
      })
      // Initialize with empty array instead of undefined
      setVoucherGrid([])
    }
  }
  React.useEffect(() => {
    const mycompanies = getCompanyIds(companies)
    const mylocations = getLocationIds(locations)
    getallVoucher(mycompanies, mylocations)
  }, [companies, locations])
  React.useEffect(() => {
    const accounttype = formType == 'Debit' ? 'Expenses' : 'Income'
    console.log(accounttype)
    const filteredCoa = chartOfAccounts?.filter((account) => {
      return account.isGroup == false && account.accountType == accounttype
    })
    setFilteredChartOfAccounts(filteredCoa)
    console.log('🚀 ~ React.useEffect ~ filteredCoa:', filteredCoa)
  }, [formType, chartOfAccounts])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === 'company') {
      // Reset location when company changes
      setFormData((prev) => ({ ...prev, location: '' }))
      // Find the selected company and update locations
      const selectedCompany = companies.find(
        (c: any) => c.companyName === value
      )
      if (selectedCompany) {
        setLocations(
          locations.filter(
            (l) => l.location.companyId === selectedCompany.company.companyId
          )
        )
      }
    }
  }

  useEffect(() => {
    fetchChartOfAccounts()
    fetchgetAllCostCenters()
    fetchgetResPartner()
  }, [])

  //chart of accounts

  async function fetchChartOfAccounts() {
    setIsLoadingAccounts(true)
    try {
      const response = await getAllChartOfAccounts()
      if (!response.data) {
        throw new Error('No data received')
      }
      setChartOfAccounts(response.data)
    } catch (error) {
      console.error('Error getting chart of accounts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load chart of accounts',
      })
      setChartOfAccounts([])
    } finally {
      setIsLoadingAccounts(false)
    }
  }
  //res partner
  async function fetchgetAllCostCenters() {
    setIsLoadingCostCenters(true)
    try {
      const response = await getAllCostCenters()
      if (!response.data) {
        throw new Error('No data received')
      }
      setCostCenters(response.data)
    } catch (error) {
      console.error('Error getting cost centers:', error)
      toast({
        title: 'Error',
        description: 'Failed to load cost centers',
      })
      setCostCenters([])
    } finally {
      setIsLoadingCostCenters(false)
    }
  }

  //res partner
  async function fetchgetResPartner() {
    setIsLoadingPartners(true)
    try {
      const response = await getAllResPartners()
      if (!response.data) {
        throw new Error('No data received')
      }
      setPartners(response.data)
    } catch (error) {
      console.error('Error getting partners:', error)
      toast({
        title: 'Error',
        description: 'Failed to load partners',
      })
      setPartners([])
    } finally {
      setIsLoadingPartners(false)
    }
  }

  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: {
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
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
  const onSubmit = async (
    values: z.infer<typeof JournalEntryWithDetailsSchema>,
    status: 'Draft' | 'Posted'
  ) => {
    console.log('Before Any edit' + values)
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      console.log('Current userId from localStorage:', userData.userId)
      setUser(userData)
    }
    // To update the missing fields on the list
    const totalAmount = values.journalDetails.reduce(
      (sum, detail) => sum + (detail.debit || detail.credit || 0),
      0
    )
    // To Update the total Amount
    const updatedValues = {
      ...values,
      journalEntry: {
        ...values.journalEntry,
        status: status === 'Draft' ? 0 : 1,
        journalType: 'Cash Voucher',
        amountTotal: totalAmount,
        createdBy: user?.userId || 0,
      },
      journalDetails: values.journalDetails.map((detail) => ({
        ...detail,
        createdBy: user?.userId || 0,
      })),
    }
    console.log('After Adding created by' + updatedValues)
    /// To add new row for Bank Transaction on JournalDetails
    const updateValueswithCash = {
      ...updatedValues,
      journalDetails: [
        ...updatedValues.journalDetails, // Spread existing journalDetails
        {
          accountId: 1,
          costCenterId: null,
          departmentId: null,
          debit:
            formType === 'Receipt' ? updatedValues.journalEntry.amountTotal : 0,
          credit:
            formType === 'Payment' ? updatedValues.journalEntry.amountTotal : 0,
          analyticTags: null,
          taxId: null,
          resPartnerId: null,
          bankaccountid: null,
          notes: updatedValues.journalEntry.notes,
          createdBy: user?.userId || 0,
        },
      ],
    }

    console.log(
      'Submitted values:',
      JSON.stringify(updateValueswithCash, null, 2)
    )
    const response = await createJournalEntryWithDetails(updateValueswithCash) // Calling API to Enter at Generate
    if (response.error || !response.data) {
      console.error('Error creating Journal', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Error creating Journal',
      })
    } else {
      console.log('Voucher is created successfully', response.data)
      toast({
        title: 'Success',
        description: 'Voucher is created successfully',
      })
    }
  }
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'journalDetails',
  })

  const addDetailRow = () => {
    append({
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
    })
  }

  const handleDelete = (voucherNo: string) => {
    setVoucherList(voucherList.filter((v) => v.voucherNo !== voucherNo))
  }

  const handleReverse = (voucherNo: string) => {
    setVoucherList(
      voucherList.map((v) =>
        v.voucherNo === voucherNo ? { ...v, status: 'Draft' } : v
      )
    )
  }

  const handlePost = (voucherNo: string) => {
    setVoucherList(
      voucherList.map((v) =>
        v.voucherNo === voucherNo ? { ...v, status: 'Posted' } : v
      )
    )
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <div className="w-full my-10 p-6">
        <h1 className="text-xl font-semibold mb-6">Cash Voucher</h1>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="journalEntry.companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Combobox
                        options={companies.map((company) => ({
                          value: company.company.companyId.toString(),
                          label:
                            company.company.companyName || 'Unnamed Company',
                        }))}
                        value={field.value?.toString() || ''}
                        onValueChange={(value) =>
                          field.onChange(Number.parseInt(value, 10))
                        }
                        placeholder="Select company"
                        loading={isLoadingCompanies}
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
                      <Combobox
                        options={locations.map((location) => ({
                          value: location.location.locationId.toString(),
                          label:
                            location.location.address || 'Unnamed Location',
                        }))}
                        value={field.value?.toString() || ''}
                        onValueChange={(value) =>
                          field.onChange(Number.parseInt(value, 10))
                        }
                        placeholder="Select location"
                        loading={isLoadingLocations}
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
                      <Combobox
                        options={[
                          { value: '1', label: 'USD' },
                          { value: '2', label: 'EUR' },
                          { value: '3', label: 'GBP' },
                        ]}
                        value={field.value?.toString() || ''}
                        onValueChange={(value) =>
                          field.onChange(Number.parseInt(value, 10))
                        }
                        placeholder="Select currency"
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

            <div className="mb-6">
              <Table className="border">
                <TableHeader className="border">
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Cost Center</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Partner Name</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Amount</TableHead>
                    {/* <TableHead>Actions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Combobox
                          options={[
                            { value: 'Payment', label: 'Payment' },
                            { value: 'Receipt', label: 'Receipt' },
                          ]}
                          value={formType}
                          onValueChange={setFormType}
                          placeholder="Select type"
                        />
                      </TableCell>

                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`journalDetails.${index}.accountId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Combobox
                                  options={filteredChartOfAccounts.map(
                                    (account) => ({
                                      value: account.accountId.toString(),
                                      label: account.name || 'Unnamed Account',
                                    })
                                  )}
                                  value={field.value?.toString() || ''}
                                  onValueChange={(value) =>
                                    field.onChange(Number.parseInt(value, 10))
                                  }
                                  placeholder="Select account"
                                  loading={isLoadingAccounts}
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
                                <Combobox
                                  options={costCenters.map((center) => ({
                                    value: center.costCenterId.toString(),
                                    label:
                                      center.costCenterName ||
                                      'Unnamed Cost Center',
                                  }))}
                                  value={field.value?.toString() || ''}
                                  onValueChange={(value) =>
                                    field.onChange(Number.parseInt(value, 10))
                                  }
                                  placeholder="Select cost center"
                                  loading={isLoadingCostCenters}
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
                                <Combobox
                                  options={[
                                    { value: '1', label: 'Department 1' },
                                    { value: '2', label: 'Department 2' },
                                  ]}
                                  value={field.value?.toString() || ''}
                                  onValueChange={(value) =>
                                    field.onChange(Number.parseInt(value, 10))
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
                                <Combobox
                                  options={partners.map((partner) => ({
                                    value: partner.id.toString(),
                                    label: partner.name || 'Unnamed Partner',
                                  }))}
                                  value={field.value?.toString() || ''}
                                  onValueChange={(value) =>
                                    field.onChange(Number.parseInt(value, 10))
                                  }
                                  placeholder="Select partner"
                                  loading={isLoadingPartners}
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
                          name={`journalDetails.${index}.${formType === 'Payment' ? 'debit' : 'credit'}`}
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
                      //console.log('Posted:', values)
                      onSubmit(values, 'Posted')
                    }}
                  >
                    Save as Post
                  </Button>
                  <Button type="button" onClick={addDetailRow} className="">
                    Add Another
                  </Button>
                </div>
              </div>
            </div>
            {/* List Section */}
            <div className="mb-6">
              <Table className="border">
                <TableHeader className="border">
                  <TableRow>
                    <TableHead>Voucher No</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date </TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>debit</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchergrid.map((voucher) => (
                    <TableRow key={voucher.voucherid}>
                      <Link
                        href={`/cash/cash-voucher/receipt-preview/${voucher.voucherid}`}
                      >
                        <TableCell>{voucher.voucherno}</TableCell>
                      </Link>
                      <TableCell>{voucher.companyname}</TableCell>
                      <TableCell>{voucher.currency}</TableCell>
                      <TableCell>{voucher.location}</TableCell>
                      <TableCell className="">
                        {voucher.date.toString() || 'N/A'}
                      </TableCell>
                      <TableCell>{voucher.notes}</TableCell>
                      <TableCell>{voucher.debit}</TableCell>
                      <TableCell>{voucher.totalamount}</TableCell>
                      <TableCell className="">
                        {voucher.state === 0 ? 'Draft' : 'Post'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will reverse the voucher status to Draft.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleReverse(voucher.voucherno)
                                  }
                                >
                                  Reverse
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePost(voucher.voucherno)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
