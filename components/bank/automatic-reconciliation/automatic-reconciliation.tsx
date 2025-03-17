'use client'

import { useState, useEffect } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { Check, Edit } from 'lucide-react'
import { CustomCombobox } from '@/utils/custom-combobox'
import type {
  GetBankTransactionType,
  BankAccount,
  BankReconciliationType,
} from '@/utils/type'
import {
  getAllBankAccounts,
  getBankReconciliations,
  getBankTransactions,
} from '@/api/automatic-reconciliation-api'

export default function AutomaticReconciliation() {
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

  const form = useForm({
    defaultValues: {
      bankAccount: '',
      fromDate: '',
      toDate: '',
    },
  })

  const fetchBankAccounts = async () => {
    try {
      setLoading(true)
      const accounts = await getAllBankAccounts()
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
  }

  const fetchReconciliations = async (data: {
    bankAccount: string
    fromDate: string
    toDate: string
  }) => {
    if (data.bankAccount && data.fromDate && data.toDate) {
      try {
        setLoading(true)
        console.log('Fetching reconciliations with:', data) // Debug log
        const response = await getBankReconciliations(
          Number.parseInt(data.bankAccount),
          data.fromDate,
          data.toDate
        )
        console.log('Received reconciliations:', response.data) // Debug log
        setReconciliations(response.data || [])
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
      console.log('Missing required data:', data) // Debug log
      setReconciliations([])
    }
  }

  const fetchTransactions = async (data: {
    bankAccount: string
    fromDate: string
    toDate: string
  }) => {
    if (data.bankAccount && data.fromDate && data.toDate) {
      try {
        setLoading(true)
        console.log('Fetching reconciliations with:', data) // Debug log
        const response = await getBankTransactions(
          Number.parseInt(data.bankAccount),
          data.fromDate,
          data.toDate
        )
        console.log('Received transactions:', response.data) // Debug log
        setTransactions(response.data || [])
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
      console.log('Missing required data:', data) // Debug log
      setReconciliations([])
    }
  }

  useEffect(() => {
    fetchBankAccounts()
  }, [])

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

  const toggleEditMode = (id: number) => {
    setEditingId(id === editingId ? null : id)
  }

  return (
    <div className="w-[98%] mx-auto p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            fetchReconciliations(data)
            fetchTransactions(data)
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

      <Tabs defaultValue="automatic" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="automatic">Bank Transactions</TabsTrigger>
          <TabsTrigger value="manual">Bank Reconciliations</TabsTrigger>
        </TabsList>

        <TabsContent value="automatic">
          <div>
            <div>
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
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>{transaction.currency}</TableCell>
                        <TableCell>{transaction.status}</TableCell>
                        <TableCell>{transaction.checkNo}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No transactions found. Please select a bank account and
                        date range, then click &quot;Show&quot;
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manual">
          <div>
            <div>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : selectedBankAccount && reconciliations.length > 0 ? (
                    reconciliations.map((reconciliation) => (
                      <TableRow key={reconciliation.id}>
                        <TableCell>{reconciliation.voucherId}</TableCell>
                        <TableCell>{reconciliation.checkNo}</TableCell>
                        <TableCell>{reconciliation.amount}</TableCell>
                        <TableCell>{reconciliation.type}</TableCell>
                        <TableCell>
                          {editingId === reconciliation.id ? (
                            <Checkbox
                              checked={reconciliation.reconciled === 1}
                              onCheckedChange={(checked) =>
                                updateLocalReconciliation(
                                  reconciliation.id,
                                  'reconciled',
                                  checked ? 1 : 0
                                )
                              }
                            />
                          ) : reconciliation.reconciled === 1 ? (
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
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Please select a bank account and date range, then click
                        "Show"
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
