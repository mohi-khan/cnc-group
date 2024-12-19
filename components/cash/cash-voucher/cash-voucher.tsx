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
import { Textarea } from '@/components/ui/textarea'
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
import { Check, Printer, RotateCcw, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  createJournalEntryWithDetails,
  getAllChartOfAccounts,
  getAllResPartners,
} from '@/api/vouchers-api'
import { toast } from '@/hooks/use-toast'
import {
  AccountsHead,
  ChartOfAccount,
  Company,
  CompanyFromLocalstorage,
  CostCenter,
  DetailRow,
  FormData,
  JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  Location,
  LocationFromLocalstorage,
  ResPartner,
  User,
  Voucher,
} from '@/utils/type'
import { getAllCostCenters } from '@/api/cost-centers-api'
import { Checkbox } from '@/components/ui/checkbox'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod';

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
  const [chartOfAccounts, setChartOfAccounts] = React.useState<AccountsHead[]>(
    []
  )
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([])
  const [partners, setPartners] = React.useState<ResPartner[]>([])
  const [formType, setFormType] = React.useState('Payment')
  const [filteredChartOfAccounts, setFilteredChartOfAccounts] = React.useState<
    AccountsHead[]
  >([])

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUser(userData)
      console.log('User companies', userData.userCompanies)
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
      console.log('Current user from localStorage:', companies)
      console.log('Current user from localStorage:', locations)
      if (!userData.voucherTypes.includes('Cash Voucher')) {
        console.log('User does not have access to Cash Voucher')
        router.push('/unauthorized-access')
      }
    } else {
      console.log('No user data found in localStorage')
      router.push('/unauthorized-access')
    }
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    console.log(formType)
    console.log('fdg', chartOfAccounts)
    const filteredCoa = chartOfAccounts?.filter((account) => {
      if (account.isGroup == true) {
        if (formType == 'Receipt') {
          return account.type == 'Income'
        } else if (formType == 'Payment') {
          return account.type == 'Expenses'
        }
      } else {
        return false
      }
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
    const response = await getAllChartOfAccounts()
    //   console.log('Fetched Chart Of accounts:', response.data)

    if (response.error || !response.data) {
      console.error('Error getting ChartOf bank account:', response.error)
      toast({
        title: 'Error',
        description:
          response.error?.message || 'Failed to get ChartOf bank accounts',
      })
    } else {
      setChartOfAccounts(response.data)
      console.log('data', response.data)
    }
  }
  //res partner
  async function fetchgetAllCostCenters() {
    const response = await getAllCostCenters()
    // console.log('Fetched cost center data:', response.data)

    if (response.error || !response.data) {
      console.error('Error getting  cost center:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get  cost center',
      })
    } else {
      setCostCenters(response.data)
      console.log('data', response.data)
    }
  }

  //res partner
  async function fetchgetResPartner() {
    const response = await getAllResPartners()
    //console.log('Fetched Res partner data:', response.data)

    if (response.error || !response.data) {
      console.error('Error getting  Res partner:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get  Res partner',
      })
    } else {
      setPartners(response.data)
      console.log('data', response.data)
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

        <Form
          {...form}
          onSubmit={form.handleSubmit((data) => {
            
          })}
        >
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="journalEntry.companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(parseInt(value, 10))
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
                            {company?.company.companyName || 'Unnamed Company'}
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
                        field.onChange(parseInt(value, 10))
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
                            {location?.location.address || 'Unnamed Location'}
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
                        field.onChange(parseInt(value, 10))
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <div>
                          <Select onValueChange={setFormType}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Payment">Payment</SelectItem>
                              <SelectItem value="Receipt">Receipt</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>

                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`journalDetails.${index}.accountId`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={(value) =>
                                  field.onChange(parseInt(value, 10))
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
                                  field.onChange(parseInt(value, 10))
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
                                  field.onChange(parseInt(value, 10))
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
                                  field.onChange(parseInt(value, 10))
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
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const values = form.getValues()
                              console.log('Draft:', values)
                              //  onSubmit(values, 'Draft');
                            }}
                          >
                            Save as Draft
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const values = form.getValues()
                              console.log('Posted:', values)
                              // onSubmit(values, 'Posted');
                            }}
                          >
                            Save as Post
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-right">
                <Button type="button" onClick={addDetailRow} className="mt-4">
                  Add Another
                </Button>
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
                    <TableHead>Type</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Cost Center</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Partner Name</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voucherList.map((voucher) => (
                    <TableRow key={voucher.voucherNo}>
                      <TableCell>{voucher.voucherNo}</TableCell>
                      <TableCell>{voucher.companyName}</TableCell>
                      <TableCell>{voucher.currency}</TableCell>
                      <TableCell>{voucher.location}</TableCell>
                      <TableCell>{voucher.type}</TableCell>
                      <TableCell>{voucher.accountName}</TableCell>
                      <TableCell>{voucher.costCenter}</TableCell>
                      <TableCell>{voucher.department}</TableCell>
                      <TableCell>{voucher.partnerName}</TableCell>
                      <TableCell>{voucher.remarks}</TableCell>
                      <TableCell>{voucher.totalAmount}</TableCell>
                      <TableCell>{voucher.status}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the voucher.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDelete(voucher.voucherNo)
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                                    handleReverse(voucher.voucherNo)
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
                            onClick={() => handlePost(voucher.voucherNo)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Link
                              href={
                                voucher.type.toLowerCase() === 'Payment'
                                  ? '/cash/cash-voucher/payment-preview'
                                  : '/cash/cash-voucher/receipt-preview'
                              }
                            >
                              <Printer className="h-4 w-4" />
                            </Link>
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

