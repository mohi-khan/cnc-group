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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  // Add other user properties as needed
}

export default function BankVoucher() {
  const [vouchers, setVouchers] = React.useState<JournalEntryWithDetails[]>([])
  const [vouchergrid, setVoucherGrid] = React.useState<JournalResult[]>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [amountMismatch, setAmountMismatch] = React.useState(false)
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
  const [partners, setPartners] = React.useState<ResPartner[]>([]) // Updated type
  const [formType, setFormType] = React.useState('Credit')
  const [status, setStatus] = React.useState<'Draft' | 'Posted'>('Draft')
  const [selectedBankAccount, setSelectedBankAccount] = React.useState<{
    id: number
    glCode: number
  } | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUser(userData)
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
      console.log('Current user from localStorage:', userData)

      // Check if 'Bank Voucher' is in the voucherTypes array
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

  // For Getting All The Vouchers

  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }
  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
  }

  async function getallVoucher(company: number[], location: number[]) {
    const voucherQuery: JournalQuery = {
      date: '2024-12-18',
      companyId: company,
      locationId: location,
      voucherType: VoucherTypes.BankVoucher,
    }
    const response = await getAllVoucher(voucherQuery)
    if (response.error) {
      // Only show error toast if it's not a 404 error
      if (response.error.status !== 404) {
        console.error('Error getting Voucher Data:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to get Voucher Data',
        })
      }
    } else if (response.data) {
      setVoucherGrid(response.data as JournalResult[])
    }
  }

  React.useEffect(() => {
    const mycompanies = getCompanyIds(companies)
    const mylocations = getLocationIds(locations)
    getallVoucher(mycompanies, mylocations)
  }, [companies, locations])

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
    // fetchCompanies()
    // fetchAllLocations()
    fetchBankAccounts()
    fetchChartOfAccounts()
    console.log('within use Effect')
    fetchCostCenters()
    fetchResPartners()
  }, [])
  //Run When Type is Changed
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
    console.log('Before Any edit' + values)
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      console.log('Current userId from localStorage:', userData.userId)
      setUser(userData)
    }
    // To update the missing fields on the list
    const updatedValues = {
      ...values,
      journalEntry: {
        ...values.journalEntry,
        status: status === 'Draft' ? 0 : 1,
        journalType: 'Bank Voucher',
        createdBy: user?.userId || 0,
      },
      journalDetails: values.journalDetails.map((detail) => ({
        ...detail,
        createdBy: user?.userId || 0,
      })),
    }
    console.log('After Adding created by' + updatedValues)
    /// To add new row for Bank Transaction on JournalDetails
    const updateValueswithBank = {
      ...updatedValues,
      journalDetails: [
        ...updatedValues.journalDetails, // Spread existing journalDetails
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
          notes: updatedValues.journalEntry.notes,
          createdBy: user?.userId || 0,
        },
      ],
    }

    console.log(
      'Submitted values:',
      JSON.stringify(updateValueswithBank, null, 2)
    )
    const response = await createJournalEntryWithDetails(updateValueswithBank) // Calling API to Enter at Generate
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
    const totalItemsAmount = values.journalDetails.reduce(
      (sum, item) => sum + item.credit,
      0
    )
    if (totalItemsAmount !== values.journalEntry.amountTotal) {
      toast({
        title: 'Error',
        description:
          'The sum of journal voucher amounts does not match the journal entry amount',
      })
      return
    }
    //   setVouchers(vouchers);

    /* setVouchers([...vouchers, { ...values, journalEntry.date: Date.now().toString(), status }])
    setIsDialogOpen(false)*/
    form.reset()
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

  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.startsWith('items')) {
        if (!value.journalDetails) {
          return
        } else {
          const totalItemsAmount =
            value.journalDetails?.reduce(
              (sum, item) => sum + (item?.credit || 0),
              0
            ) || 0
          setAmountMismatch(
            totalItemsAmount !== value.journalEntry?.amountTotal
          )
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bank Vouchers</h1>
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
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number.parseInt(value, 10))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companies.map((company, index) => (
                              <SelectItem
                                key={
                                  company?.company.companyId ||
                                  `default-company-${index}`
                                }
                                value={
                                  company?.company.companyId?.toString() ||
                                  `company-${index}`
                                }
                              >
                                {company?.company.companyName ||
                                  'Unnamed Company'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number.parseInt(value, 10))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map((location, index) => (
                              <SelectItem
                                key={
                                  location?.location.locationId ||
                                  `default-location-${index}`
                                }
                                value={
                                  location?.location.locationId?.toString() ||
                                  `location-${index}`
                                }
                              >
                                {location?.location.address ||
                                  'Unnamed Location'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number.parseInt(value, 10))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">USD</SelectItem>
                            <SelectItem value="2">EUR</SelectItem>
                            <SelectItem value="3">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={setFormType}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Credit">Credit</SelectItem>
                        <SelectItem value="Debit">Debit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <FormLabel>Bank Account</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const selectedAccount = bankAccounts.find(
                          (account) => account.id.toString() === value
                        )
                        if (selectedAccount) {
                          setSelectedBankAccount({
                            id: selectedAccount.id,
                            glCode: selectedAccount.glAccountId || 0,
                          })
                          // field.onChange(value); // Update the form field
                        }
                      }}
                      ///value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bank account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bankAccounts.map((account, index) => (
                          <SelectItem
                            key={account?.id || `default-bank-${index}`}
                            value={account?.id?.toString() || `bank-${index}`}
                          >
                            {account?.accountName || 'Unnamed Account'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </div>
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
                  {/* this is journal entry amount  */}
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
                                  <Select
                                    onValueChange={(value) =>
                                      field.onChange(Number.parseInt(value, 10))
                                    }
                                    value={field.value?.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select account" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {filteredChartOfAccounts.map(
                                        (account, index) => (
                                          <SelectItem
                                            key={
                                              account.accountId ||
                                              `default-chart-${index}`
                                            }
                                            value={
                                              account.accountId.toString() ||
                                              `chart-${index}`
                                            }
                                          >
                                            {account.name || 'Unnamed Account'}
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>
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
                                  <Select
                                    onValueChange={(value) =>
                                      field.onChange(Number.parseInt(value, 10))
                                    }
                                    value={field.value?.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select cost center" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {costCenters.map((center, index) => (
                                        <SelectItem
                                          key={
                                            center?.costCenterId ||
                                            `default-cost-${index}`
                                          }
                                          value={
                                            center?.costCenterId?.toString() ||
                                            `cost-${index}`
                                          }
                                        >
                                          {center?.costCenterName ||
                                            'Unnamed Cost Center'}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
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
                                  <Select
                                    onValueChange={(value) =>
                                      field.onChange(Number.parseInt(value, 10))
                                    }
                                    value={field.value?.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="1">
                                        Department 1
                                      </SelectItem>
                                      <SelectItem value="2">
                                        Department 2
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
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
                                  <Select
                                    onValueChange={(value) =>
                                      field.onChange(Number.parseInt(value, 10))
                                    }
                                    value={field.value?.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select partner" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {partners.map((partner, index) => (
                                        <SelectItem
                                          key={
                                            partner?.id ||
                                            `default-partner-${index}`
                                          }
                                          value={
                                            partner?.id?.toString() ||
                                            `partner-${index}`
                                          }
                                        >
                                          {partner?.name || 'Unnamed Partner'}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
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
                {amountMismatch && (
                  <p className="text-red-500">
                    The sum of journal voucher amounts does not match the
                    journal entry amount.
                  </p>
                )}
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
      <Table className="border">
        <TableHeader>
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
          {vouchergrid.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-4">
                No bank voucher is available
              </TableCell>
            </TableRow>
          ) : (
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
                <TableCell className="">{voucher.bankaccount}</TableCell>
                <TableCell className="">
                  {voucher.date.toString() || 'N/A'}
                </TableCell>
                <TableCell className="">{voucher.totalamount}</TableCell>
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
                    {/* <Button variant="outline" size="icon">
                      <Printer className="h-4 w-4" />
                    </Button> */}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
