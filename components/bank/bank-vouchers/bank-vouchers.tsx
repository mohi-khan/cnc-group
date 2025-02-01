'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import type * as z from 'zod'
import { Check, ChevronsUpDown, Plus, Trash } from 'lucide-react'
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
} from '@/utils/type'
import {
  getAllBankAccounts,
  getAllChartOfAccounts,
  getAllCostCenters,
  getAllResPartners,
} from '@/api/bank-vouchers-api'
import {
  createJournalEntryWithDetails,
  getAllVoucher,
} from '@/api/vouchers-api'
import VoucherList from '@/components/voucher-list/voucher-list'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

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

  function handleDelete(id: string) {
    //This function is not used anymore.  Keeping it for potential future use.
  }

  function handleReverse(id: string) {
    //This function is not used anymore. Keeping it for potential future use.
  }

  function handlePost(id: string) {
    //This function is not used anymore. Keeping it for potential future use.
  }

  const columns = [
    { key: 'voucherno' as const, label: 'Voucher No.' },
    { key: 'date' as const, label: 'Check No.' },
    { key: 'notes' as const, label: 'Company Name' },
    { key: 'companyname' as const, label: 'Location' },
    { key: 'currency' as const, label: 'Currency' },
    { key: 'location' as const, label: 'Location' },
    { key: 'bankName' as const, label: 'Bank Name' },
    { key: 'totalamount' as const, label: 'Amount' },
    { key: 'state' as const, label: 'Status' },
  ]

  const linkGenerator = (voucherId: number) =>
    `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.BankVoucher}`

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
                      <FormItem className="flex flex-col">
                      <FormLabel>Company Name</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                            >
                              {field.value
                                  ? companies.find((company) => company.company.companyId === field.value)?.company
                                      .companyName
                                  : "Select company"}
                         
                      
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search company..." />
                              <CommandList>
                                <CommandEmpty>No company found.</CommandEmpty>
                                <CommandGroup>
                                  {companies.map((company) => (
                                    <CommandItem
                                      value={company.company.companyName || ""}
                                      key={company.company.companyId}
                                      onSelect={() => {
                                        form.setValue("journalEntry.companyId", company.company.companyId)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          company.company.companyId === field.value ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      {company.company.companyName}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
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
