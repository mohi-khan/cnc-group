'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Plus, Edit, ArrowUpDown } from 'lucide-react'
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
  createBankAccount,
  editBankAccount,
} from '../../../api/bank-accounts-api'
import { useToast } from '@/hooks/use-toast'
import { BANGLADESH_BANKS } from '@/utils/constants'
import {
  createBankAccountSchema,
  CurrencyType,
  type AccountsHead,
  type BankAccount,
  type CreateBankAccount,
} from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import {
  getAllBankAccounts,
  getAllChartOfAccounts,
  getAllCurrency,
} from '@/api/common-shared-api'
import { useRouter } from 'next/navigation'
import { CustomCombobox } from '@/utils/custom-combobox'

type SortColumn =
  | 'accountName'
  | 'accountNumber'
  | 'bankName'
  | 'currencyId'
  | 'accountType'
  | 'openingBalance'
  | 'isActive'
type SortDirection = 'asc' | 'desc'

enum AccountType {
  Savings = 'Savings',
  Current = 'Current',
  Overdraft = 'Overdraft',
  Fixed = 'Fixed',
}

export default function BankAccounts() {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

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
  const itemsPerPage = 10

  const router = useRouter()

  React.useEffect(() => {
    if (userData) {
      setUserId(userData?.userId)
      console.log('Current userId from localStorage:', userData.userId)
    } else {
      console.log('No user data found in localStorage')
    }
  }, [userData])

  const form = useForm<CreateBankAccount>({
    resolver: zodResolver(createBankAccountSchema),
    defaultValues: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      currencyId: '',
      accountType: 'Savings',
      openingBalance: '',
      isActive: true,
      isReconcilable: true,
      createdBy: userId,
      glAccountId: 0, // Initialize as a number
    },
  })

  // get all currency api
  const fetchCurrency = React.useCallback(async () => {
    if (!token) return
    const fetchedCurrency = await getAllCurrency(token)
    console.log(
      '🚀 ~ fetchCurrency ~ fetchedCurrency.fetchedCurrency:',
      fetchedCurrency
    )
    if (fetchedCurrency.error || !fetchedCurrency.data) {
      console.error('Error getting currency:', fetchedCurrency.error)
      toast({
        title: 'Error',
        description: fetchedCurrency.error?.message || 'Failed to get currency',
      })
    } else {
      setCurrency(fetchedCurrency.data)
    }
  }, [token])

  const fetchBankAccounts = React.useCallback(async () => {
    if (!token) return
    const fetchedAccounts = await getAllBankAccounts(token)
    console.log('Fetched accounts:', fetchedAccounts)
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
  }, [toast])

  const fetchGlAccounts = React.useCallback(async () => {
    if (!token) return
    const fetchedGlAccounts = await getAllChartOfAccounts(token)
    console.log('Fetched gl accounts:', fetchedGlAccounts)

    if (fetchedGlAccounts.error || !fetchedGlAccounts.data) {
      console.error('Error getting gl bank account:', fetchedGlAccounts.error)
      toast({
        title: 'Error',
        description:
          fetchedGlAccounts.error?.message || 'Failed to get gl bank accounts',
      })
    } else {
      setGlAccounts(fetchedGlAccounts.data)
    }
  }, [toast])

  React.useEffect(() => {
    fetchGlAccounts()
    fetchBankAccounts()
    fetchCurrency()
  }, [fetchBankAccounts, fetchGlAccounts])

  React.useEffect(() => {
    if (editingAccount) {
      form.reset({
        ...editingAccount,
        openingBalance: Number(editingAccount.openingBalance).toString(),
        updatedBy: userId,
        glAccountId: Number(editingAccount.glAccountId) || 0,
      })
    } else {
      form.reset({
        accountName: '',
        accountNumber: '',
        bankName: '',
        currencyId: '',
        accountType: 'Savings',
        openingBalance: '',
        isActive: true,
        isReconcilable: true,
        createdBy: userId,
        glAccountId: 0,
      })
    }
  }, [editingAccount, form, userId])

  async function onSubmit(values: CreateBankAccount) {
    console.log('Form submitted:', values)
    if (editingAccount) {
      console.log('Editing account:', editingAccount.id)
      const response = await editBankAccount(
        editingAccount.id!,
        {
          ...values,
          updatedBy: userId,
          openingBalance: Number(values.openingBalance),
        },
        token
      ); // Add semicolon here
      if (response.error || !response.data) {
        console.error('Error editing bank account:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to edit bank account',
        })
      } else {
        console.log('Account edited successfully')
        toast({
          title: 'Success',
          description: 'Bank account updated successfully',
        })
        form.reset()
        fetchBankAccounts()
      }
    } else {
      console.log('Creating new account')
      const response = await createBankAccount({...values, openingBalance: Number(values.openingBalance)}, token);      
      if (response.error || !response.data) {
        console.error('Error creating bank account:', response.error)
      } else {
        console.log('Account created successfully')
        toast({
          title: 'Success',
          description: 'Bank account created successfully',
        })
        form.reset()
        fetchBankAccounts()
      }
    }
    setIsDialogOpen(false)
    setEditingAccount(null)
  }

  function handleEdit(account: BankAccount) {
    setEditingAccount(account)
    setIsDialogOpen(true)
    console.log(account, 'account')
  }

  const sortedAccounts = React.useMemo(() => {
    const sorted = [...accounts]
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
  }, [accounts, sortColumn, sortDirection])

  const paginatedAccounts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedAccounts.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedAccounts, currentPage])

  const totalPages = Math.ceil(accounts.length / itemsPerPage)

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }
console.log('Form values:', form.getValues())
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bank Accounts</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setEditingAccount(null)
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="bg-black hover:bg-black/90"
              onClick={() => form.reset()}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Bank Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
              </DialogTitle>
              <DialogDescription>
                {editingAccount
                  ? 'Edit the details for the bank account here.'
                  : 'Enter the details for the new bank account here.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="pr-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!editingAccount && (
                      <FormField
                        control={form.control}
                        name="accountName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter account name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter account number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
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
                            onChange={(
                              value: { id: string; name: string } | null
                            ) => field.onChange(value ? value.name : null)}
                            placeholder="Select bank"
                          />{' '}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="branchName"
                      render={({ field }) => (
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
                      render={({ field }) => (
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
                                          curr.currencyId ===
                                          Number(field.value)
                                      )?.currencyCode || 'Unnamed Currency',
                                  }
                                : null
                            }
                            onChange={(
                              value: { id: string; name: string } | null
                            ) => field.onChange(value ? value.id : '')}
                            placeholder="Select currency"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />{' '}
                    <FormField
                      control={form.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <CustomCombobox
                            items={[
                              { id: 'Savings', name: 'Savings' },
                              { id: 'Current', name: 'Current' },
                              { id: 'Overdraft', name: 'Overdraft' },
                              { id: 'Fixed', name: 'Fixed' },
                            ]}
                            value={
                              field.value
                                ? {
                                    id: field.value,
                                    name: field.value,
                                  }
                                : null
                            }
                            onChange={(
                              value: { id: string; name: string } | null
                            ) => {
                              field.onChange(value ? value.id : null)
                            }}
                            placeholder="Select account type"
                          />{' '}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="openingBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opening Balance</FormLabel>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value
                              if (
                                value === '' ||
                                value === '-' ||
                                value === '.' ||
                                value === '-.' ||
                                value.startsWith('-')
                              ) {
                                field.onChange(value) // Allow negative values and incomplete input
                              } else {
                                const parsed = parseFloat(value)
                                if (!isNaN(parsed)) {
                                  field.onChange(parsed)
                                }
                              }
                            }}
                            value={field.value}
                          />                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="validityDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={
                                field.value
                                  ? format(field.value, 'yyyy-MM-dd')
                                  : ''
                              }
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex space-x-4 py-5">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
                            <FormDescription>
                              Is this bank account active?
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isReconcilable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Reconcilable
                            </FormLabel>
                            <FormDescription>
                              Can this account be reconciled?
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onChange={field.onChange}
                            />
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
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GL Account</FormLabel>
                            <CustomCombobox
                              items={glAccounts
                                ?.filter((glaccount) => !glaccount.isGroup)
                                .map((glaccount) => ({
                                  id: glaccount.accountId.toString(),
                                  name: `${glaccount.name} (${glaccount.code})`,
                                }))}
                              value={
                                field.value
                                  ? {
                                      id: field.value.toString(),
                                      name:
                                        glAccounts?.find(
                                          (glaccount) =>
                                            glaccount.accountId === field.value
                                        )?.name +
                                          ' (' +
                                          glAccounts?.find(
                                            (glaccount) =>
                                              glaccount.accountId ===
                                              field.value
                                          )?.code +
                                          ')' || 'Unnamed Account',
                                    }
                                  : null
                              }
                              onChange={(
                                value: { id: string; name: string } | null
                              ) =>
                                field.onChange(
                                  value ? Number.parseInt(value.id, 10) : null
                                )
                              }
                              placeholder="Select GL Account"
                            />{' '}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any additional notes"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="sticky bottom-0 bg-background pt-2 pb-4">
                  <Button type="submit" className="w-full">
                    {editingAccount ? 'Update' : 'Submit'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col">
        <Table className="border shadow-md">
          <TableHeader className="shadow-md bg-slate-200">
            <TableRow>
              <TableHead
                onClick={() => handleSort('accountName')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>Account Name</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('accountNumber')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>Account Number</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('bankName')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>Bank Name</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('currencyId')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>Currency</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('accountType')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>Account Type</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('openingBalance')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>Opening Balance</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('isActive')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAccounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.accountName}</TableCell>
                <TableCell>{account.accountNumber}</TableCell>
                <TableCell>{account.bankName}</TableCell>
                <TableCell>{account.currencyId}</TableCell>
                <TableCell>{account.accountType}</TableCell>
                <TableCell>{account.openingBalance}</TableCell>
                <TableCell>
                  {account.isActive ? 'Active' : 'Inactive'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(account)}
                  >
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                  }
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    onClick={() => setCurrentPage(index + 1)}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
