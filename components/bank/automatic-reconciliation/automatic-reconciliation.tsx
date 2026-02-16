'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { CustomCombobox } from '@/utils/custom-combobox'
import type {
  GetBankTransactionType,
  BankAccount,
  BankReconciliationType,
} from '@/utils/type'
import {
  getBankReconciliations,
  getBankTransactions,
  automaticReconciliation,
} from '@/api/automatic-reconciliation-api'
import { getAllBankAccounts } from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { formatIndianNumber } from '@/utils/Formatindiannumber'

export default function AutomaticReconciliation() {
  //getting userData from jotai atom component
  useInitializeUser()
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  //state variables
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedBankAccount, setSelectedBankAccount] =
    useState<BankAccount | null>(null)
  const [reconciliations, setReconciliations] = useState<
    BankReconciliationType[]
  >([])
  const [transactions, setTransactions] = useState<GetBankTransactionType[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const { toast } = useToast()
  const [selectedReconciliations, setSelectedReconciliations] = useState<
    number[]
  >([])

  const form = useForm({
    defaultValues: {
      bankAccount: '',
      fromDate: '',
      toDate: '',
    },
  })

  const fetchBankAccounts = useCallback(async () => {
    try {
      setLoading(true)
      const accounts = await getAllBankAccounts(token)
      if (accounts.data) {
        setBankAccounts(accounts.data)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch bank accounts',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast, token])

  const fetchReconciliations = async (data: {
    bankAccount: string
    fromDate: string
    toDate: string
    token: string
  }) => {
    if (!token) return
    if (data.bankAccount && data.fromDate && data.toDate) {
      try {
        setLoading(true)
        
        const response = await getBankReconciliations(
          Number.parseInt(data.bankAccount),
          data.fromDate,
          data.toDate,
          data.token
        )
        if (response?.error?.status === 401) {
          router.push('/unauthorized-access')
          return
        } else if (response.error || !response.data) {
          console.error('Error getting gl bank account:', response.error)
          toast({
            title: 'Error',
            description:
              response.error?.message || 'Failed to get gl bank accounts',
          })
        } else {
          setReconciliations(response.data || [])
          
        }
      } catch (error) {
        console.error('Error fetching reconciliations:', error) // Debug log
        toast({
          title: 'Error',
          description: 'Failed to fetch reconciliations',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    } else {
      
      setReconciliations([])
    }
  }

  const fetchTransactions = async (data: {
    bankAccount: string
    fromDate: string
    toDate: string
    token: string
  }) => {
    if (!token) return
    if (data.bankAccount && data.fromDate && data.toDate) {
      try {
        setLoading(true)
        
        const response = await getBankTransactions(
          Number.parseInt(data.bankAccount),
          data.fromDate,
          data.toDate,
          data.token
        )
        if (response?.error?.status === 401) {
          router.push('/unauthorized-access')
          return
        } else if (response.error || !response.data) {
          console.error('Error getting gl bank account:', response.error)
          toast({
            title: 'Error',
            description:
              response.error?.message || 'Failed to get gl bank accounts',
          })
        } else {
          setTransactions(response.data || [])
        }
        
      } catch (error) {
        console.error('Error fetching reconciliations:', error) // Debug log
        toast({
          title: 'Error',
          description: 'Failed to fetch reconciliations',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    } else {
      
      setReconciliations([])
    }
  }

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        
        router.push('/')
        return
      }
    }

    checkUserData()
    fetchBankAccounts()
  }, [fetchBankAccounts, router])

  const updateLocalReconciliation = (
    id: number,
    field: 'reconciled' | 'comments',
    value: any
  ) => {
    setReconciliations((prevReconciliations) =>
      prevReconciliations.map((r) =>
        r.id === id
          ? {
              ...r,
              [field]: field === 'reconciled' ? (value ? 1 : 0) : value,
            }
          : r
      )
    )
  }

  const getRowColor = (transaction: GetBankTransactionType) => {
    // Format transaction date to match reconciliation date format
    const transactionDate = new Date(transaction.date)
      .toISOString()
      .split('T')[0]

    // Check if there's a reconciliation with matching checkNo
    const matchingCheckNo = reconciliations.some(
      (r) => r.checkNo === transaction.checkNo && transaction.checkNo
    )

    // Check if there's a reconciliation with matching amount and date
    const matchingAmountAndDate = reconciliations.some(
      (r) =>
        Number(r.amount) === Number(transaction.amount) &&
        r.date === transactionDate
    )

    if (matchingCheckNo) return 'bg-green-100'
    if (matchingAmountAndDate) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getReconciliationRowColor = (
    reconciliation: BankReconciliationType
  ) => {
    // Check if there's a transaction with matching checkNo
    const matchingCheckNo = transactions.some(
      (t) => t.checkNo === reconciliation.checkNo && reconciliation.checkNo
    )

    // Check if there's a transaction with matching amount and date
    const matchingAmountAndDate = transactions.some((t) => {
      const transactionDate = new Date(t.date).toISOString().split('T')[0]
      return (
        Number(t.amount) === Number(reconciliation.amount) &&
        transactionDate === reconciliation.date
      )
    })

    if (matchingCheckNo) return 'bg-green-100'
    if (matchingAmountAndDate) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const handleReconciliationSelect = (
    reconciliation: BankReconciliationType,
    rowColor: string
  ) => {
    // Don't allow selection of red rows
    if (rowColor === 'bg-red-100') return

    setSelectedReconciliations((prev) => {
      // If already selected, remove it
      if (prev.includes(reconciliation.id)) {
        return prev.filter((item) => item !== reconciliation.id)
      }
      // Otherwise add it
      return [...prev, reconciliation.id]
    })
  }

  const handleAutomaticReconcile = async () => {
    if (selectedReconciliations.length === 0) {
      toast({
        title: 'No items selected',
        description: 'Please select at least one item to reconcile',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      // Create an array of objects with id and reconcileId
      const reconciliationsToProcess = selectedReconciliations
        .map((id) => {
          const reconciliation = reconciliations.find((r) => r.id === id)
          if (!reconciliation) return null

          let matchingTransactionId = 0

          // For green rows (matching by check number)
          if (reconciliation.checkNo) {
            const matchingTransaction = transactions.find(
              (t) =>
                t.checkNo === reconciliation.checkNo && reconciliation.checkNo
            )
            if (matchingTransaction) {
              matchingTransactionId = matchingTransaction.id
            }
          }

          // For yellow rows (matching by amount and date)
          if (matchingTransactionId === 0) {
            const matchingTransaction = transactions.find((t) => {
              const transactionDate = new Date(t.date)
                .toISOString()
                .split('T')[0]
              return (
                Number(t.amount) === Number(reconciliation.amount) &&
                transactionDate === reconciliation.date
              )
            })
            if (matchingTransaction) {
              matchingTransactionId = matchingTransaction.id
            }
          }

          return {
            id: reconciliation.id,
            reconcileId: matchingTransactionId,
          }
        })
        .filter(
          (item): item is { id: number; reconcileId: number } => item !== null
        )

      // Send all reconciliations in a single API call
      await automaticReconciliation(reconciliationsToProcess, token)

      toast({
        title: 'Success',
        description: 'Reconciliations processed successfully',
      })

      // Refresh the data
      const formData = form.getValues()
      fetchReconciliations({ ...formData, token })
      fetchTransactions({ ...formData, token })

      // Clear selections
      setSelectedReconciliations([])
    } catch (error) {
      console.error('Error during automatic reconciliation:', error)
      toast({
        title: 'Error',
        description: 'Failed to process reconciliations',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-[98%] mx-auto p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            fetchReconciliations({ ...data, token })
            fetchTransactions({ ...data, token })
          })}
          className="mb-6"
        >
          <div className="flex justify-between items-end mb-4 gap-4 w-fit mx-auto">
            <FormField
              control={form.control}
              name="fromDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Date</FormLabel>
                  <Input type="date" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="toDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Date</FormLabel>
                  <Input type="date" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankAccount"
              render={({ field }) => (
                <FormItem className="w-1/3">
                  <FormLabel>Bank Account</FormLabel>
                  <CustomCombobox
                    items={bankAccounts.map((account) => ({
                      id: account.id.toString(),
                      name: `${account.bankName} - ${account.accountName} - ${account.accountNumber}`,
                    }))}
                    value={
                      selectedBankAccount
                        ? {
                            id: selectedBankAccount.id.toString(),
                            name: `${selectedBankAccount.bankName} - ${selectedBankAccount.accountName} - ${selectedBankAccount.accountNumber}`,
                          }
                        : null
                    }
                    onChange={(value) => {
                      if (!value) {
                        setSelectedBankAccount(null)
                        field.onChange(null)
                        return
                      }
                      const selected = bankAccounts.find(
                        (account) => account.id.toString() === value.id
                      )
                      setSelectedBankAccount(selected || null)
                      field.onChange(value.id)
                    }}
                    placeholder="Select bank account"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={!form.formState.isValid}>
              Show
            </Button>
          </div>
        </form>
      </Form>

      <div className="grid grid-cols-2 gap-4">
        {/* Bank Transactions Table */}
        <div className="w-full">
          <h2 className="text-lg font-semibold mb-2">Bank Transactions</h2>
          <Table className="shadow-md border">
            <TableHeader className="bg-slate-200 shadow-md">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check No.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : transactions.length > 0 ? (
                // Filter out transactions that are already used in reconciliations
                transactions
                  .filter(
                    (transaction) =>
                      !reconciliations.some(
                        (r) =>
                          r.reconcileId !== null &&
                          r.reconcileId === transaction.id &&
                          r.reconciled === true
                      )
                  )
                  .map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className={getRowColor(transaction)}
                    >
                      <TableCell>
                        {new Date(transaction.date).toISOString().split('T')[0]}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{formatIndianNumber(Number(transaction.amount || 0))}</TableCell>
                      <TableCell>{transaction.currency}</TableCell>
                      <TableCell>{transaction.status}</TableCell>
                      <TableCell>{transaction.checkNo}</TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No transactions found. Please select a bank account and date
                    range, then click &quot;Show&quot;
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Bank Reconciliations Table */}
        <div className="w-full">
          <h2 className="text-lg font-semibold mb-2">Bank Reconciliations</h2>
          <Table className="shadow-md border">
            <TableHeader className="bg-slate-200 shadow-md">
              <TableRow>
                <TableHead>Voucher ID</TableHead>
                <TableHead>Check No</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reconciled</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : selectedBankAccount && reconciliations.length > 0 ? (
                // Filter out already reconciled items
                reconciliations
                  .filter(
                    (reconciliation) => reconciliation.reconciled !== true
                  )
                  .map((reconciliation) => (
                    <TableRow
                      key={reconciliation.id}
                      className={getReconciliationRowColor(reconciliation)}
                    >
                      <TableCell>{reconciliation.voucherId}</TableCell>
                      <TableCell>{reconciliation.checkNo}</TableCell>
                      <TableCell>{formatIndianNumber(Number(reconciliation.amount || 0))}</TableCell>
                      <TableCell>{reconciliation.type}</TableCell>
                      <TableCell>
                        {editingId === reconciliation.id ? (
                          <Checkbox
                            checked={reconciliation.reconciled === true}
                            onCheckedChange={(checked) =>
                              updateLocalReconciliation(
                                reconciliation.id,
                                'reconciled',
                                checked ? 1 : 0
                              )
                            }
                          />
                        ) : reconciliation.reconciled === true ? (
                          'Yes'
                        ) : (
                          'No'
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === reconciliation.id ? (
                          <Input
                            value={reconciliation.comments || ''}
                            onChange={(e) =>
                              updateLocalReconciliation(
                                reconciliation.id,
                                'comments',
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          reconciliation.comments || ''
                        )}
                      </TableCell>
                      <TableCell>{reconciliation.date}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={selectedReconciliations.includes(
                            reconciliation.id
                          )}
                          onCheckedChange={() =>
                            handleReconciliationSelect(
                              reconciliation,
                              getReconciliationRowColor(reconciliation)
                            )
                          }
                          disabled={
                            getReconciliationRowColor(reconciliation) ===
                            'bg-red-100'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Please select a bank account and date range, then click
                    &quot;Show&quot;
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="text-center mt-10">
        <Button
          onClick={handleAutomaticReconcile}
          disabled={loading || selectedReconciliations.length === 0}
        >
          {loading ? 'Processing...' : 'Automatically Reconcile'}
        </Button>
      </div>
    </div>
  )
}
