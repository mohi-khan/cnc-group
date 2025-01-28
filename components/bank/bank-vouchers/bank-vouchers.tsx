'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import type * as z from 'zod'
import { Plus, Trash, Printer, RotateCcw, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ui/combobox'
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
import { useRouter } from 'next/navigation'

import { toast } from '@/hooks/use-toast'
import {
  ChartOfAccount,
  type BankAccount,
  Company,
  type CompanyFromLocalstorage,
  type CostCenter,
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  LocationData,
  type LocationFromLocalstorage,
  type ResPartner,
  type JournalResult,
  type AccountsHead,
  type JournalQuery,
  VoucherTypes,
} from '@/utils/type'
import {
  getAllBankAccounts,
  getAllChartOfAccounts,
  getAllCompanies,
  getAllCostCenters,
  getAllLocations,
  getAllResPartners,
} from '@/api/bank-vouchers-api'
import { userData } from '@/utils/user'
import {
  createJournalEntryWithDetails,
  getAllVoucher,
} from '@/api/vouchers-api'
import Link from 'next/link'

interface User {
  userId: number
  username: string
  roleId: number
  roleName: string
}

type JournalResult = {
  voucherid: number
  voucherno: string
  date: string
  journaltype: string
  state: number
  companyname: string
  location: string
  currency: string
  totalamount: number
  notes: string
}

export default function BankVoucher() {
  const [vouchers, setVouchers] = React.useState<JournalEntryWithDetails[]>([])
  const [vouchergrid, setVoucherGrid] = React.useState<JournalResult[]>([])
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
  const [selectedBankAccount, setSelectedBankAccount] = React.useState<{
    id: number
    glCode: number
  } | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
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

  const getCompanyIds = React.useCallback((data: CompanyFromLocalstorage[]): number[] => {
    return data.map((company) => company.company.companyId)
  }, [])
  const getLocationIds = React.useCallback((data: LocationFromLocalstorage[]): number[] => {
    return data.map((location) => location.location.locationId)
  }, [])

  async function getallVoucher(company: number[], location: number[]) {
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
      setVoucherGrid(Array.isArray(response.data) ? response.data : [])
      console.log('Voucher data:', response.data)
    } catch (error) {
      console.error('Error getting Voucher Data:', error)
      setVoucherGrid([])
      throw error
    }
  }

  React.useEffect(() => {
    const fetchVoucherData = async () => {
      setIsLoading(true)
      try {
        const mycompanies = getCompanyIds(companies)
        const mylocations = getLocationIds(locations)
        await getallVoucher(mycompanies, mylocations)
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

    if (companies.length > 0 && locations.length > 0) {
      fetchVoucherData()
    }
  }, [companies, locations, getCompanyIds, getLocationIds]) // Added getCompanyIds and getLocationIds to dependencies

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

  React.useEffect(() => {
    fetchBankAccounts()
    fetchChartOfAccounts()
    console.log('within use Effect')
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

  function handleDelete(id: string) {
    setVouchers(vouchers.filter((v) => v.journalEntry.voucherNo !== id))
  }

  function handleReverse(id: string) {
    setVouchers(
      vouchers.map((v) =>
        v.journalEntry.voucherNo === id ? { ...v, status: 'Draft' } : v
      )
    )
  }

  function handlePost(id: string) {
    setVouchers(
      vouchers.map((v) =>
        v.journalEntry.voucherNo === id ? { ...v, status: 'Posted' } : v
      )
    )
  }

  return (
    <div className="w-[97%] mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bank Vouchers</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                form.reset()
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Voucher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Voucher</DialogTitle>
              <DialogDescription>
                Enter the details for the bank voucher here. Click save when
                you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) =>
                  onSubmit(values, status)
                )}
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
                          <Combobox
                            options={companies.map((company) => ({
                              value: company.company.companyId.toString(),
                              label:
                                company.company.companyName ||
                                'Unnamed Company',
                            }))}
                            value={field.value?.toString() || ''}
                            onValueChange={(value) =>
                              field.onChange(Number.parseInt(value, 10))
                            }
                            placeholder="Select company"
                            popoverContentClassName="z-[100]"
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
                            popoverContentClassName="z-[50]"
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
                            popoverContentClassName="z-[60]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Combobox
                      options={[
                        { value: 'Credit', label: 'Credit' },
                        { value: 'Debit', label: 'Debit' },
                      ]}
                      value={formType}
                      onValueChange={setFormType}
                      placeholder="Select type"
                      popoverContentClassName="z-[60]"
                    />
                  </FormItem>
                  <FormItem>
                    <FormLabel>Bank Account</FormLabel>
                    <Combobox
                      options={bankAccounts.map((account) => ({
                        value: account.id.toString(),
                        label: account.accountName || 'Unnamed Account',
                      }))}
                      value={selectedBankAccount?.id.toString() || ''}
                      onValueChange={(value) => {
                        const selectedAccount = bankAccounts.find(
                          (account) => account.id.toString() === value
                        )
                        if (selectedAccount) {
                          setSelectedBankAccount({
                            id: selectedAccount.id,
                            glCode: selectedAccount.glAccountId || 0,
                          })
                        }
                      }}
                      placeholder="Select bank account"
                      popoverContentClassName="z-[60]"
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
                                    <Combobox
                                      options={filteredChartOfAccounts.map(
                                        (account) => ({
                                          value: account.accountId.toString(),
                                          label:
                                            account.name || 'Unnamed Account',
                                        })
                                      )}
                                      value={field.value?.toString() || ''}
                                      onValueChange={(value) =>
                                        field.onChange(
                                          Number.parseInt(value, 10)
                                        )
                                      }
                                      placeholder="Select account"
                                      popoverContentClassName="z-[60]"
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
                                        field.onChange(
                                          Number.parseInt(value, 10)
                                        )
                                      }
                                      placeholder="Select cost center"
                                      popoverContentClassName="z-[60]"
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
                                        field.onChange(
                                          Number.parseInt(value, 10)
                                        )
                                      }
                                      placeholder="Select department"
                                      popoverContentClassName="z-[60]"
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
                                        label:
                                          partner.name || 'Unnamed Partner',
                                      }))}
                                      value={field.value?.toString() || ''}
                                      onValueChange={(value) =>
                                        field.onChange(
                                          Number.parseInt(value, 10)
                                        )
                                      }
                                      placeholder="Select partner"
                                      popoverContentClassName="z-[60]"
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
          </DialogContent>
        </Dialog>
      </div>
      <Table className="border shadow md">
        <TableHeader className='bg-slate-200 shadow-md'>
          <TableRow className="border-b">
            <TableHead>Voucher No.</TableHead>
            <TableHead>Check No.</TableHead>
            <TableHead>Company Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Bank Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(vouchergrid) && vouchergrid.length > 0 ? (
            vouchergrid.map((voucher) => (
              <TableRow key={voucher.voucherid} className="border-b">
                <TableCell className="">
                  <Link
                    href={`/bank/bank-vouchers/single-bank-voucher/${voucher.voucherid}`}
                  >
                    {voucher.voucherno}
                  </Link>
                </TableCell>
                <TableCell className="">{voucher.notes}</TableCell>
                <TableCell className="">{voucher.companyname}</TableCell>
                <TableCell className="">{voucher.location}</TableCell>
                <TableCell className="">{voucher.currency}</TableCell>
                <TableCell className="">{voucher.journaltype}</TableCell>
                <TableCell className="">{voucher.date}</TableCell>
                <TableCell className="">{voucher.totalamount}</TableCell>
                <TableCell className="">
                  {voucher.state === 0 ? 'Draft' : 'Posted'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will reverse the voucher status to Draft.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleReverse(voucher.voucherno)}
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-4">
                No bank voucher is available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
