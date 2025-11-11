'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Plus, Edit, ArrowUpDown, Search } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createBankAccount,
  editBankAccount,
} from '../../../api/bank-accounts-api'
import { useToast } from '@/hooks/use-toast'
import { BANGLADESH_BANKS } from '@/utils/constants'
import {
  createBankAccountSchema,
  type CurrencyType,
  type AccountsHead,
  type BankAccount,
  type CreateBankAccount,
  type LcInfoByCostIsActive,
  BankAccountUpdate,
  BankAccountCreate,
  cleanBankAccountData,
} from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import {
  getAllBankAccounts,
  getAllChartOfAccounts,
  getAllCompanies,
  getAllCurrency,
} from '@/api/common-shared-api'
import { useRouter } from 'next/navigation'
import { CustomCombobox } from '@/utils/custom-combobox'
import type { CompanyData } from '@/api/create-user-api'
import { getLcInfoByCostIsActive } from '@/api/import-lc-api'

type SortColumn =
  | 'accountName'
  | 'accountNumber'
  | 'bankName'
  | 'currencyId'
  | 'accountType'
  | 'openingBalance'
  | 'isActive'
  | 'companyId'

type SortDirection = 'asc' | 'desc'

const AccountTypes = [
  'DEPOSIT AWAITING FOR DISPOSAL',
  'SPECIAL NOTICE DEPOSIT ( 7 DAYS)',
  'Fund Buildup Account',
  'MARGIN AGAINST ACCEPTANCE',
  'USD RETENTION QUOTA',
  'Current',
  'OD Against Non-Cash Security',
  'Fixed',
  'Loan Account',
] as const

type AccountType = (typeof AccountTypes)[number]

export default function BankAccounts() {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  // State variables
  const [accounts, setAccounts] = React.useState<BankAccount[]>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingAccount, setEditingAccount] =
    React.useState<BankAccount | null>(null)
  const [userId, setUserId] = React.useState<number | undefined>()
  const { toast } = useToast()
  const [glAccounts, setGlAccounts] = React.useState<AccountsHead[]>([])
  const [sortColumn, setSortColumn] = React.useState<SortColumn>('accountName')
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [currency, setCurrency] = React.useState<CurrencyType[]>([])
  const [companies, setCompanies] = React.useState<CompanyData[]>([])
  const [searchTerm, setSearchTerm] = React.useState('')
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const [lcInfo, setLcInfo] = React.useState<LcInfoByCostIsActive[]>()

  // Reset to page 1 when search term changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  React.useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')
      if (!storedUserData || !storedToken) {
        router.push('/')
        return
      }
    }
    checkUserData()
    if (userData) {
      setUserId(userData?.userId)
    } else {
    }
  }, [userData, router])

  const form = useForm<CreateBankAccount>({
    resolver: zodResolver(createBankAccountSchema),
    defaultValues: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      currencyId: '',
      accountType: 'DEPOSIT AWAITING FOR DISPOSAL',
      openingBalance: '',
      isActive: true,
      isReconcilable: true,
      createdBy: userId,
      glAccountId: 0,
      LcNumber: '',
    },
  })

  const bankAccounts = glAccounts.filter((acc: any) => acc.isBank == 1)
  console.log('chart of accounts:', bankAccounts)

  // get all currency api
  const fetchCurrency = React.useCallback(async () => {
    if (!token) return
    const fetchedCurrency = await getAllCurrency(token)
    if (fetchedCurrency.error || !fetchedCurrency.data) {
      console.error('Error getting currency:', fetchedCurrency.error)
      toast({
        title: 'Error',
        description: fetchedCurrency.error?.message || 'Failed to get currency',
      })
    } else {
      setCurrency(fetchedCurrency.data)
    }
  }, [token, toast])

  const fetchLcInfoByCostIsActive = React.useCallback(async () => {
    if (!token) return
    const fetchedLcInfo = await getLcInfoByCostIsActive(token)
    if (fetchedLcInfo.error || !fetchedLcInfo.data) {
      console.error('Error getting LC Info:', fetchedLcInfo.error)
      toast({
        title: 'Error',
        description:
          fetchedLcInfo.error?.message || 'Failed to get active LC information',
      })
    } else {
      setLcInfo(fetchedLcInfo.data)
      console.log('lc infor: ', fetchedLcInfo.data)
    }
  }, [token, toast])

  const fetchBankAccounts = React.useCallback(async () => {
    if (!token) return
    const fetchedAccounts = await getAllBankAccounts(token)
    if (fetchedAccounts?.error?.status === 401) {
      router.push('/unauthorized-access')
      return
    } else if (fetchedAccounts.error || !fetchedAccounts.data) {
      console.error('Error getting bank account:', fetchedAccounts.error)
      toast({
        title: 'Error',
        description:
          fetchedAccounts.error?.message || 'Failed to get bank accounts',
      })
    } else {
      setAccounts(fetchedAccounts.data)
    }
  }, [toast, router, token])

  const fetchGlAccounts = React.useCallback(async () => {
    if (!token) return
    const fetchedGlAccounts = await getAllChartOfAccounts(token)
    if (fetchedGlAccounts?.error?.status === 401) {
      router.push('/unauthorized-access')
      return
    } else if (fetchedGlAccounts.error || !fetchedGlAccounts.data) {
      console.error('Error getting gl bank account:', fetchedGlAccounts.error)
      toast({
        title: 'Error',
        description:
          fetchedGlAccounts.error?.message || 'Failed to get gl bank accounts',
      })
    } else {
      setGlAccounts(fetchedGlAccounts.data)
    }
  }, [toast, router, token])

  //fetch company name
  const fetchAllCompanies = React.useCallback(async () => {
    if (!token) return
    const fetchedCompanies = await getAllCompanies(token)
    if (fetchedCompanies?.error?.status === 401) {
      router.push('/unauthorized-access')
      return
    } else if (fetchedCompanies.error || !fetchedCompanies.data) {
      console.error('Error getting company:', fetchedCompanies.error)
      toast({
        title: 'Error',
        description: fetchedCompanies.error?.message || 'Failed to get company',
      })
    } else {
      setCompanies(
        (fetchedCompanies.data ?? [])
          .filter(
            (c: any) =>
              typeof c.companyId === 'number' &&
              typeof c.companyName === 'string'
          )
          .map((c: any) => ({
            companyId: c.companyId ?? 0,
            companyName: c.companyName,
          }))
      )
    }
  }, [token, router, toast])

  React.useEffect(() => {
    fetchGlAccounts()
    fetchBankAccounts()
    fetchCurrency()
    fetchAllCompanies()
    fetchLcInfoByCostIsActive()
  }, [
    fetchBankAccounts,
    fetchGlAccounts,
    fetchCurrency,
    fetchAllCompanies,
    fetchLcInfoByCostIsActive,
  ])

  // React.useEffect(() => {
  //   if (editingAccount) {
  //     form.reset({
  //       ...editingAccount,
  //       openingBalance: Number(editingAccount.openingBalance).toString(),
  //       updatedBy: userId,
  //       glAccountId: Number(editingAccount.glAccountId) || 0,
  //     })
  //   } else {
  //     form.reset({
  //       accountName: '',
  //       accountNumber: '',
  //       bankName: '',
  //       currencyId: '',
  //       accountType: 'DEPOSIT AWAITING FOR DISPOSAL',
  //       openingBalance: '',
  //       isActive: true,
  //       isReconcilable: true,
  //       createdBy: userId,
  //       glAccountId: 0,
  //       noOfInstallments: 0,
  //     })
  //   }
  // }, [editingAccount, form, userId])
  React.useEffect(() => {
    if (editingAccount) {
      form.reset({
        ...editingAccount,
        openingBalance: Number(editingAccount.openingBalance).toString(),
        updatedBy: userId,
        glAccountId: Number(editingAccount.glAccountId) || undefined,
        branchName: editingAccount.branchName || '',
        ifscCode: editingAccount.ifscCode || '',
        swiftCode: editingAccount.swiftCode || '',
        assetDetails: editingAccount.assetDetails || '',
        bankCode: editingAccount.bankCode || '',
        integrationId: editingAccount.integrationId || '',
        notes: editingAccount.notes || '',
        limit: editingAccount.limit || undefined,
        rate: editingAccount.rate || undefined,
        loanType: editingAccount.loanType || undefined,
        installmentStartDate: editingAccount.installmentStartDate || undefined,
        installmentAmount: editingAccount.installmentAmount || undefined,
        installmentFreq: editingAccount.installmentFreq || undefined,
        noOfInstallments: editingAccount.noOfInstallments || undefined,
        LcNumber: editingAccount.LcNumber || '',
        validityDate: editingAccount.validityDate || undefined,
      })
    } else {
      form.reset({
        accountName: '',
        accountNumber: '',
        bankName: '',
        currencyId: '',
        accountType: 'DEPOSIT AWAITING FOR DISPOSAL',
        openingBalance: '',
        isActive: true,
        isReconcilable: true,
        createdBy: userId,
        glAccountId: undefined,
        noOfInstallments: undefined,
      })
    }
  }, [editingAccount, form, userId])

  // async function onSubmit(values: CreateBankAccount) {
  //   if (editingAccount) {
  //     const response = await editBankAccount(
  //       editingAccount.id!,
  //       {
  //         ...values,
  //         updatedBy: userId,
  //         openingBalance: Number(values.openingBalance),
  //       },
  //       token
  //     )
  //     if (response.error || !response.data) {
  //       console.error('Error editing bank account:', response.error)
  //       toast({
  //         title: 'Error',
  //         description: response.error?.message || 'Failed to edit bank account',
  //       })
  //     } else {
  //       toast({
  //         title: 'Success',
  //         description: 'Bank account updated successfully',
  //       })
  //       form.reset()
  //       fetchBankAccounts()
  //       setCurrentPage(1) // Reset to first page after edit
  //     }
  //   } else {
  //     const response = await createBankAccount(
  //       { ...values, openingBalance: Number(values.openingBalance) },
  //       token
  //     )
  //     console.log(`🚀 ~ onSubmit ~ bank create`, {
  //       ...values,
  //       openingBalance: Number(values.openingBalance),
  //     })
  //     if (response.error || !response.data) {
  //       console.error('Error creating bank account:', response.error)
  //     } else {
  //       toast({
  //         title: 'Success',
  //         description: 'Bank account created successfully',
  //       })
  //       form.reset()
  //       fetchBankAccounts()
  //       setCurrentPage(1) // Reset to first page after create
  //     }
  //   }
  //   setIsDialogOpen(false)
  //   setEditingAccount(null)
  // }
 async function onSubmit(values: CreateBankAccount) {
   if (editingAccount) {
     // Transform form values to match API expectations
     const updateData = {
       ...values,
       updatedBy: userId,
       openingBalance: Number(values.openingBalance),
       validityDate: values.validityDate || undefined,
       installmentStartDate: values.installmentStartDate || undefined,
       limit: values.limit ?? undefined,
       rate: values.rate ?? undefined,
       loanType: values.loanType || undefined,
       installmentAmount: values.installmentAmount ?? undefined,
       installmentFreq: values.installmentFreq || undefined,
       noOfInstallments: values.noOfInstallments ?? undefined,
       LcNumber: values.LcNumber || undefined,
       branchName: values.branchName || undefined,
       ifscCode: values.ifscCode || undefined,
       swiftCode: values.swiftCode || undefined,
       assetDetails: values.assetDetails || undefined,
       bankCode: values.bankCode || undefined,
       integrationId: values.integrationId || undefined,
       notes: values.notes || undefined,
       glAccountId: values.glAccountId ?? undefined,
     }

     // Remove undefined/null values before sending
     const cleanedData = cleanBankAccountData(updateData)

     const response = await editBankAccount(
       editingAccount.id!,
       cleanedData as BankAccountUpdate,
       token
     )

     if (response.error || !response.data) {
       console.error('Error editing bank account:', response.error)
       toast({
         title: 'Error',
         description: response.error?.message || 'Failed to edit bank account',
       })
     } else {
       toast({
         title: 'Success',
         description: 'Bank account updated successfully',
       })
       form.reset()
       fetchBankAccounts()
      //  setCurrentPage(1)
     }
   } else {
     // Transform form values for creation
     const createData = {
       ...values,
       openingBalance: Number(values.openingBalance),
     }

     // Remove undefined/null values before sending
     const cleanedData = cleanBankAccountData(createData)

     const response = await createBankAccount(
       cleanedData as BankAccountCreate,
       token
     )

     console.log(`🚀 ~ onSubmit ~ bank create`, cleanedData)

     if (response.error || !response.data) {
       console.error('Error creating bank account:', response.error)
       toast({
         title: 'Error',
         description:
           response.error?.message || 'Failed to create bank account',
       })
     } else {
       toast({
         title: 'Success',
         description: 'Bank account created successfully',
       })
       form.reset()
       fetchBankAccounts()
       setCurrentPage(1)
     }
   }
   setIsDialogOpen(false)
   setEditingAccount(null)
 }

  function handleEdit(account: BankAccount) {
    setEditingAccount(account)
    setIsDialogOpen(true)
  }

  const filteredAccounts = React.useMemo(() => {
    if (!searchTerm) return accounts
    return accounts.filter((account) => {
      const companyName =
        companies.find((company) => company.companyId === account.companyId)
          ?.companyName || ''
      const currencyCode =
        currency.find((curr) => curr.currencyId === Number(account.currencyId))
          ?.currencyCode || ''
      return (
        account.accountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.accountNumber
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        account.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.accountType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currencyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.openingBalance?.toString().includes(searchTerm)
      )
    })
  }, [accounts, searchTerm, companies, currency])

  const sortedAccounts = React.useMemo(() => {
    const sorted = [...filteredAccounts]
    sorted.sort((a, b) => {
      if (sortColumn === 'openingBalance') {
        return sortDirection === 'asc'
          ? Number(a[sortColumn]) - Number(b[sortColumn])
          : Number(b[sortColumn]) - Number(a[sortColumn])
      }
      if (sortColumn === 'isActive') {
        return sortDirection === 'asc'
          ? Number(a.isActive) - Number(b.isActive)
          : Number(b.isActive) - Number(a.isActive)
      }
      return sortDirection === 'asc'
        ? String(a[sortColumn]).localeCompare(String(b[sortColumn]))
        : String(b[sortColumn]).localeCompare(String(a[sortColumn]))
    })
    return sorted
  }, [filteredAccounts, sortColumn, sortDirection])

  const paginatedAccounts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedAccounts.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedAccounts, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedAccounts.length / itemsPerPage)

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Watch accountType field
  const watchedAccountType = form.watch('accountType')
  const watchedLoanType = form.watch('loanType')

  return (
 
    <div className="mx-auto py-10 ">
      <div className="flex justify-between items-center m-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Bank Accounts</h1>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="pl-10 w-64"
            />
          </div>

          {/* ---------- DIALOG ---------- */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              // allow DialogClose to close (when open === false);
              // prevent close on outside click / Esc via DialogContent handlers below
              setIsDialogOpen(open)
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="bg-black hover:bg-black/90"
                onClick={() => {
                  form.reset()
                  setIsDialogOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Bank Account
              </Button>
            </DialogTrigger>

            <DialogContent
              className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
              onInteractOutside={(e) => e.preventDefault()} // Prevent close on outside click
              onEscapeKeyDown={(e) => e.preventDefault()} // Prevent close on Escape
            >
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle>
                      {editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingAccount
                        ? 'Edit the details for the bank account here.'
                        : 'Enter the details for the new bank account here.'}
                    </DialogDescription>
                  </div>

                  {/* Use Shadcn's DialogClose as the SINGLE cross button */}
                  <DialogClose asChild>
                   
                  </DialogClose>
                </div>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="pr-6">
                    {/* --- Your form fields remain unchanged --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {!editingAccount && (
                        <FormField
                          control={form.control}
                          name="accountName"
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>Account Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter account name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter account number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <CustomCombobox
                              items={BANGLADESH_BANKS.map((bank) => ({
                                id: bank.id.toString(),
                                name: bank.name || 'Unnamed Bank',
                              }))}
                              value={
                                field.value
                                  ? {
                                      id: field.value.toString(),
                                      name:
                                        BANGLADESH_BANKS.find(
                                          (bank) => bank.name === field.value
                                        )?.name || 'Unnamed Bank',
                                    }
                                  : null
                              }
                              onChange={(value: { id: string; name: string } | null) =>
                                field.onChange(value ? value.name : null)
                              }
                              placeholder="Select bank"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="branchName"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Branch Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter branch name" value={field.value || ''} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="currencyId"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <CustomCombobox
                              items={currency.map((curr: CurrencyType) => ({
                                id: curr.currencyId.toString(),
                                name: curr.currencyCode || 'Unnamed Currency',
                              }))}
                              value={
                                field.value
                                  ? {
                                      id: field.value.toString(),
                                      name:
                                        currency.find(
                                          (curr: CurrencyType) =>
                                            curr.currencyId === Number(field.value)
                                        )?.currencyCode || 'Unnamed Currency',
                                    }
                                  : null
                              }
                              onChange={(value: { id: string; name: string } | null) => field.onChange(value ? value.id : '')}
                              placeholder="Select currency"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accountType"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Account Type</FormLabel>
                            <CustomCombobox
                              items={AccountTypes.map((type) => ({
                                id: type,
                                name: type,
                              }))}
                              value={field.value ? { id: field.value, name: field.value } : null}
                              onChange={(value: { id: string; name: string } | null) => field.onChange(value ? value.id : null)}
                              placeholder="Select account type"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {watchedAccountType === 'Loan Account' && (
                        <FormField
                          control={form.control}
                          name="noOfInstallments"
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>Number of Installments</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="Enter number of installments"
                                  {...field}
                                  onChange={(e: any) => {
                                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                                  }}
                                  value={field.value ?? ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      {watchedAccountType === 'Loan Account' && (
                        <FormField
                          control={form.control}
                          name="LcNumber"
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>LC Number</FormLabel>
                              <CustomCombobox
                                items={lcInfo?.map((lc) => ({ id: lc.LCREQNO.toString(), name: lc.LCREQNO.toString() })) ?? []}
                                value={
                                  field.value != null
                                    ? {
                                        id: field.value.toString(),
                                        name:
                                          lcInfo
                                            ?.find((lc) => lc.LCREQNO?.toString() === field.value?.toString())
                                            ?.LCREQNO?.toString() || 'Unnamed LC',
                                      }
                                    : null
                                }
                                onChange={(value: { id: string; name: string } | null) => field.onChange(value ? value.id : null)}
                                placeholder="Select LC Number"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormField
                        control={form.control}
                        name="openingBalance"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Loan Amount</FormLabel>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e: any) => {
                                const value = e.target.value
                                if (value === '' || value === '-' || value === '.' || value === '-.' || value.startsWith('-')) {
                                  field.onChange(value)
                                } else {
                                  const parsed = Number.parseFloat(value)
                                  if (!isNaN(parsed)) {
                                    field.onChange(parsed)
                                  }
                                }
                              }}
                              value={field.value}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="validityDate"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                onChange={(e: any) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="limit"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Limit</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e: any) => {
                                  const value = e.target.value
                                  if (value === '' || value === '.') {
                                    field.onChange(value)
                                  } else {
                                    const parsed = Number.parseFloat(value)
                                    if (!isNaN(parsed) && parsed >= 0) {
                                      field.onChange(parsed)
                                    }
                                  }
                                }}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rate"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Rate</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e: any) => {
                                  const value = e.target.value
                                  if (value === '' || value === '.') {
                                    field.onChange(value)
                                  } else {
                                    const parsed = Number.parseFloat(value)
                                    if (!isNaN(parsed) && parsed >= 0) {
                                      field.onChange(parsed)
                                    }
                                  }
                                }}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {!editingAccount && (
                        <FormField
                          control={form.control}
                          name="loanType"
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>Loan Type</FormLabel>
                              <CustomCombobox
                                items={[
                                  { id: 'EDF', name: 'EDF' },
                                  { id: 'TR', name: 'TR' },
                                  { id: 'IBP', name: 'IBP' },
                                  { id: 'OD', name: 'OD' },
                                  { id: 'Term', name: 'Term' },
                                  { id: 'Stimulas', name: 'Stimulas' },
                                  { id: 'UPAS', name: 'UPAS' },
                                ]}
                                value={field.value ? { id: field.value, name: field.value } : null}
                                onChange={(value: { id: string; name: string } | null) => field.onChange(value ? value.id : null)}
                                placeholder="Select loan type"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormField
                        control={form.control}
                        name="installmentStartDate"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel> Installment Start Date</FormLabel>
                            <FormControl>
                              {watchedLoanType === 'EDF' || watchedLoanType === 'UPAS' ? (
                                <Input
                                  type="number"
                                  placeholder="Enter days from today"
                                  value={
                                    field.value && typeof field.value === 'string'
                                      ? (() => {
                                          const fieldDate = new Date(field.value)
                                          const today = new Date()
                                          const diffTime = fieldDate.getTime() - today.getTime()
                                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                          return diffDays > 0 ? String(diffDays) : ''
                                        })()
                                      : ''
                                  }
                                  onChange={(e: any) => {
                                    const days = Number.parseInt(e.target.value)
                                    if (!isNaN(days) && days > 0) {
                                      const today = new Date()
                                      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)
                                      field.onChange(format(futureDate, 'yyyy-MM-dd'))
                                    } else {
                                      field.onChange('')
                                    }
                                  }}
                                />
                              ) : (
                                <Input
                                  type="date"
                                  {...field}
                                  value={
                                    field.value ? (typeof field.value === 'string' ? field.value : format(field.value, 'yyyy-MM-dd')) : ''
                                  }
                                  onChange={(e: any) => field.onChange(e.target.value)}
                                />
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="installmentAmount"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Installment Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e: any) => {
                                  const value = e.target.value
                                  if (value === '' || value === '.') {
                                    field.onChange(value)
                                  } else {
                                    const parsed = Number.parseFloat(value)
                                    if (!isNaN(parsed) && parsed >= 0) {
                                      field.onChange(parsed)
                                    }
                                  }
                                }}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="installmentFreq"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Installment Frequency</FormLabel>
                            <CustomCombobox
                              items={[
                                { id: 'Monthly', name: 'Monthly' },
                                { id: 'Quarterly', name: 'Quarterly' },
                                { id: 'Half Yearly', name: 'Half Yearly' },
                                { id: 'Yearly', name: 'Yearly' },
                                { id: 'One Time', name: 'One Time' },
                              ]}
                              value={field.value ? { id: field.value, name: field.value } : null}
                              onChange={(value: { id: string; name: string } | null) => field.onChange(value ? value.id : null)}
                              placeholder="Select installment frequency"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex space-x-4 py-5">
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }: any) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Active</FormLabel>
                              <div className="text-sm text-muted-foreground">Is this bank account active?</div>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isReconcilable"
                        render={({ field }: any) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Reconcilable</FormLabel>
                              <div className="text-sm text-muted-foreground">Can this account be reconciled?</div>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {!editingAccount && (
                      <div className="grid grid-cols-1 gap-4 pb-5">
                        <FormField
                          control={form.control}
                          name="glAccountId"
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>GL Account</FormLabel>
                              <CustomCombobox
                                items={
                                  bankAccounts
                                    ?.filter((glaccount) => !glaccount.isGroup)
                                    .map((glaccount) => ({
                                      id: glaccount.accountId.toString(),
                                      name: `${glaccount.name} (${glaccount.code})`,
                                    })) ?? []
                                }
                                value={
                                  field.value
                                    ? {
                                        id: field.value.toString(),
                                        name:
                                          glAccounts?.find((glaccount) => glaccount.accountId === field.value)?.name +
                                            ' (' +
                                            glAccounts?.find((glaccount) => glaccount.accountId === field.value)?.code +
                                            ')' || 'Unnamed Account',
                                      }
                                    : null
                                }
                                onChange={(value: { id: string; name: string } | null) =>
                                  field.onChange(value ? Number.parseInt(value.id, 10) : null)
                                }
                                placeholder="Select GL Account"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {!editingAccount && (
                      <FormField
                        control={form.control}
                        name="companyId"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <CustomCombobox
                              items={companies?.map((company) => ({ id: company.companyId.toString(), name: company.companyName })) ?? []}
                              value={
                                field.value
                                  ? {
                                      id: field.value.toString(),
                                      name:
                                        companies?.find((company) => company.companyId === field.value)?.companyName || 'Unnamed Company',
                                    }
                                  : null
                              }
                              onChange={(value: { id: string; name: string } | null) => field.onChange(value ? Number.parseInt(value.id, 10) : null)}
                              placeholder="Select Company"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }: any) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter any additional notes" className="resize-none" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-background pt-2 pb-4">
                    <Button type="submit" className="w-full">
                      {editingAccount ? 'Update' : 'Submit'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          {/* ---------- END DIALOG ---------- */}
        </div>
      </div>

      <div className="flex flex-col m-4">
        <Table className="border shadow-md">
          <TableHeader className="shadow-md bg-slate-200">
            <TableRow>
              <TableHead onClick={() => handleSort('accountName')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  <span>Account Name</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('accountNumber')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  <span>Account Number</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('bankName')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  <span>Bank Name</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('currencyId')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  <span>Currency</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('accountType')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  <span>Account Type</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('openingBalance')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  <span>Opening Balance</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('companyId')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  <span>Company Name</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('isActive')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAccounts.map((account: any) => (
              <TableRow key={account.id}>
                <TableCell>{account.accountName}</TableCell>
                <TableCell>{account.accountNumber}</TableCell>
                <TableCell>{account.bankName}</TableCell>
                <TableCell>{currency.find((curr) => curr.currencyId === Number(account.currencyId))?.currencyCode || 'Unknown'}</TableCell>
                <TableCell>{account.accountType}</TableCell>
                <TableCell>{account.openingBalance}</TableCell>
                <TableCell>{companies.find((company) => company.companyId === account.companyId)?.companyName}</TableCell>
                <TableCell>{account.isActive ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(account)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, index) => {
                if (index === 0 || index === totalPages - 1 || (index >= currentPage - 2 && index <= currentPage + 2)) {
                  return (
                    <PaginationItem key={`page-${index}`}>
                      <PaginationLink onClick={() => setCurrentPage(index + 1)} isActive={currentPage === index + 1}>
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (index === currentPage - 3 || index === currentPage + 3) {
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationLink>...</PaginationLink>
                    </PaginationItem>
                  )
                }
                return null
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
  

