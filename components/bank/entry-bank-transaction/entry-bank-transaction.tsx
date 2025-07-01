'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import type { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { PlusIcon, ArrowUpDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import {
  type BankTransactionData,
  createBankTransactions,
  getAllBankTransactions,
} from '@/api/excel-file-input-api'
import {
  type BankAccount,
  createBankTransactionSchema,
  type CurrencyType,
} from '@/utils/type'
import { getAllBankAccounts, getAllCurrency } from '@/api/common-shared-api'
import { CustomCombobox } from '@/utils/custom-combobox'

type SortColumn =
  | 'date'
  | 'amount'
  | 'currency'
  | 'description'
  | 'status'
  | 'bankId'
  | 'checkNo'

type SortDirection = 'asc' | 'desc'

export default function EntryBankTransaction() {
  // Getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  // State variables
  const [transactions, setTransactions] = useState<BankTransactionData[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [currencies, setCurrencies] = useState<CurrencyType[]>([])
  const { toast } = useToast()
  const [sortColumn, setSortColumn] = useState<SortColumn>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedBankAccount, setSelectedBankAccount] = useState<{
    id: number
    glCode: number
  } | null>(null)

  const form = useForm<z.infer<typeof createBankTransactionSchema>>({
    resolver: zodResolver(createBankTransactionSchema),
    defaultValues: {
      bankId: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      currency: 'BDT',
      status: 'Pending',
      checkNo: '',
    },
  })

  const fetchBankAccounts = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const response = await getAllBankAccounts(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (response.error || !response.data) {
        console.error('Error getting bank accounts:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to get bank accounts',
        })
      } else {
        setBankAccounts(response.data)
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch bank accounts',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, router, token])

  const fetchTransactions = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const response = await getAllBankTransactions(token)
      console.log('🚀 ~ fetchTransactions ~ response:', response)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (response.error || !response.data) {
        console.error('Error getting transactions:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to get transactions',
        })
      } else {
        setTransactions(response.data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch transactions',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, router, token])

  const fetchCurrencies = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const response = await getAllCurrency(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (response.error || !response.data) {
        console.error('Error getting currencies:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to get currencies',
        })
      } else {
        setCurrencies(response.data)
      }
    } catch (error) {
      console.error('Error fetching currencies:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch currencies',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, router, token])

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        console.log('No user data or token found in localStorage')
        router.push('/')
        return
      }
    }

    checkUserData()
    fetchTransactions()
    fetchCurrencies()
    fetchBankAccounts()
  }, [fetchTransactions, fetchCurrencies, fetchBankAccounts, router])

  React.useEffect(() => {
    if (userData) {
    }
  }, [userData])

  React.useEffect(() => {}, [form])

  const onSubmit = async (values: BankTransactionData) => {
    if (!token) return
    setIsLoading(true)
    setFeedback(null)

    try {
      // Validate the single transaction
      createBankTransactionSchema.parse(values)

      // Send as array as requested
      const transactionArray = [values]

      const response = await createBankTransactions(
        transactionArray,
        'api/bank-transactions/create-bank-transactions',
        token
      )

      if (response.error || !response.data) {
        throw new Error(
          response.error?.message || 'Failed to create transaction'
        )
      }

      toast({
        title: 'Success',
        description: 'Transaction created successfully',
      })
      form.reset()
      await fetchTransactions()
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Invalid form data. Please check your inputs.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  console.log('Form values:', form.getValues())

  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions]
    sorted.sort((a, b) => {
      if (sortColumn === 'amount') {
        return sortDirection === 'asc'
          ? Number(a[sortColumn]) - Number(b[sortColumn])
          : Number(b[sortColumn]) - Number(a[sortColumn])
      }
      if (sortColumn === 'date') {
        const dateA = a[sortColumn] ? new Date(a[sortColumn]).getTime() : 0
        const dateB = b[sortColumn] ? new Date(b[sortColumn]).getTime() : 0
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
      }
      return sortDirection === 'asc'
        ? String(a[sortColumn as keyof typeof a]).localeCompare(
            String(b[sortColumn as keyof typeof b])
          )
        : String(b[sortColumn as keyof typeof b]).localeCompare(
            String(a[sortColumn as keyof typeof a])
          )
    })
    return sorted
  }, [transactions, sortColumn, sortDirection])

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedTransactions, currentPage])

  const totalPages = Math.ceil(transactions.length / itemsPerPage)

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const SortableTableHead: React.FC<{
    column: SortColumn
    children: React.ReactNode
  }> = ({ column, children }) => {
    const isActive = column === sortColumn
    return (
      <TableHead
        onClick={() => handleSort(column)}
        className="cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-1">
          <span>{children}</span>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableHead>
    )
  }

  return (
    <div className="w-[97%] mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bank Transactions</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </div>
      {feedback && (
        <Alert
          variant={feedback.type === 'success' ? 'default' : 'destructive'}
          className="mb-6"
        >
          <AlertTitle>
            {feedback.type === 'success' ? 'Success' : 'Error'}
          </AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <div>Loading transactions...</div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="border shadow-md">
            <TableHeader className="bg-slate-200">
              <TableRow>
                <SortableTableHead column="date">Date</SortableTableHead>
                <SortableTableHead column="amount">Amount</SortableTableHead>
                <SortableTableHead column="currency">
                  Currency
                </SortableTableHead>
                <SortableTableHead column="description">
                  Description
                </SortableTableHead>
                <SortableTableHead column="status">Status</SortableTableHead>
                <SortableTableHead column="checkNo">Check No</SortableTableHead>
                <SortableTableHead column="bankId">Bank Name</SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {transaction.date
                      ? new Date(transaction.date).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>{transaction.currency}</TableCell>
                  <TableCell>{transaction.description || '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'Matched'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'Unmatched'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.checkNo || '-'}</TableCell>
                  <TableCell>{bankAccounts.find(bank => bank.id === transaction.bankId)?.bankName || '-'}</TableCell>
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
      )}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[650px] h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Bank Transaction</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="bankId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Account Details</FormLabel>
                    <CustomCombobox
                      items={bankAccounts.map((account) => ({
                        id: account.id,
                        name:
                          `${account.bankName} - ${account.accountName} - ${account.accountNumber}` ||
                          'Unnamed Account',
                      }))}
                      value={
                        field.value
                          ? {
                              id: Number(field.value),
                              name:
                                `${bankAccounts.find((a) => a.id === Number(field.value))?.bankName} - ${
                                  bankAccounts.find(
                                    (a) => a.id === Number(field.value)
                                  )?.accountName
                                } - ${bankAccounts.find((a) => a.id === Number(field.value))?.accountNumber}` ||
                                '',
                            }
                          : null
                      }
                      onChange={(value) => {
                        if (!value) {
                          setSelectedBankAccount(null)
                          field.onChange(0) // Set to 0 instead of undefined for number type
                          return
                        }
                        const selectedAccount = bankAccounts.find(
                          (account) => account.id === value.id
                        )
                        if (selectedAccount) {
                          setSelectedBankAccount({
                            id: selectedAccount.id,
                            glCode: selectedAccount.glAccountId || 0,
                          })
                          field.onChange(Number(selectedAccount.id)) // Ensure it's a number
                        } else {
                          setSelectedBankAccount(null)
                          field.onChange(0) // Set to 0 instead of undefined for number type
                        }
                      }}
                      placeholder="Select bank account"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter amount" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem
                            key={currency.currencyId}
                            value={currency.currencyName}
                          >
                            {currency.currencyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Matched">Matched</SelectItem>
                        <SelectItem value="Unmatched">Unmatched</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="checkNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check Number (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter check number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Add Transaction'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
