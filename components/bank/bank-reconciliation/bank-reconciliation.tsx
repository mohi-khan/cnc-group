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
import type { BankAccount, BankReconciliationType } from '@/utils/type'
import { useToast } from '@/hooks/use-toast'
import {
  getBankReconciliations,
  updateBankReconciliation,
  markTrueBankReconciliations,
} from '@/api/bank-reconciliation-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import { useForm } from 'react-hook-form'
import { Check, Edit } from 'lucide-react'
import { getAllBankAccounts } from '@/api/common-shared-api'
import { useAtom } from 'jotai'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useRouter } from 'next/navigation'

export const BankReconciliation = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  // State variables
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedBankAccount, setSelectedBankAccount] =
    useState<BankAccount | null>(null)
  const [reconciliations, setReconciliations] = useState<
    BankReconciliationType[]
  >([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const { toast } = useToast()
  const form = useForm({
    defaultValues: {
      bankAccount: '',
      fromDate: '',
      toDate: '',
    },
  })

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
    const fetchBankAccounts = async () => {
      if (!token) return
      try {
        setLoading(true)
        const accounts = await getAllBankAccounts(token)
        if (accounts.error?.status === 401) {
          router.push('/unauthorized-access')
          return
        } else if (accounts.data) {
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
    fetchBankAccounts()
  }, [toast, router, token])

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
          // Filter out reconciled items
          const unReconciledItems = response.data.filter(
            (item) => !item.reconciled
          )
          setReconciliations(unReconciledItems || [])
          // Reset selections when new data is loaded
          setSelectedIds([])
          setSelectAll(false)
        }
      } catch (error) {
        console.error('Error fetching reconciliations:', error)
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
      setSelectedIds([])
      setSelectAll(false)
    }
  }

  // Handle individual checkbox selection
  const handleIndividualSelection = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id))
      setSelectAll(false)
    }
  }

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedIds(reconciliations.map((r) => r.id))
    } else {
      setSelectedIds([])
    }
  }

  // Update select all state when individual selections change
  useEffect(() => {
    if (reconciliations.length > 0) {
      setSelectAll(selectedIds.length === reconciliations.length)
    }
  }, [selectedIds, reconciliations])

  // Handle bulk reconciliation update
  const handleBulkReconciliation = async () => {
    if (selectedIds.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select at least one item to reconcile',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      await markTrueBankReconciliations(selectedIds, token)

      toast({
        title: 'Success',
        description: `${selectedIds.length} reconciliation(s) updated successfully`,
      })

      // Refresh the data after successful update
      const formData = form.getValues()
      await fetchReconciliations({ ...formData, token })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update reconciliations',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Update the handleReconciliationUpdate function
  const handleReconciliationUpdate = async (
    id: number,
    reconciled: boolean,
    comments: string
  ) => {
    try {
      setLoading(true)
      // Update both reconciled status and comments in a single API call
      await updateBankReconciliation(id, reconciled, comments, token)

      setEditingId(null)
      toast({
        title: 'Success',
        description: 'Reconciliation updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update reconciliation',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Update the updateLocalReconciliation function
  const updateLocalReconciliation = (
    id: number,
    field: 'reconciled' | 'comments',
    value: any,
    token: string
  ) => {
    setReconciliations((prevReconciliations) =>
      prevReconciliations.map((r) =>
        r.id === id
          ? {
              ...r,
              [field]: field === 'reconciled' ? (value ? true : false) : value,
            }
          : r
      )
    )
  }

  // Helper function to toggle edit mode for a reconciliation
  const toggleEditMode = (id: number) => {
    setEditingId(id === editingId ? null : id)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          fetchReconciliations({ ...data, token })
        )}
        className="w-[98%] mx-auto p-4"
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

        {/* Bulk Action Button */}
        {reconciliations.length > 0 && (
          <div className="mb-4 flex justify-end">
            <Button
              type="button"
              onClick={handleBulkReconciliation}
              disabled={selectedIds.length === 0 || loading}
            >
              Mark Selected as Reconciled ({selectedIds.length})
            </Button>
          </div>
        )}

        <Table className="mt-4 shadow-md border">
          <TableHeader className="bg-slate-200 shadow-md">
            <TableRow>
              <TableHead>Voucher ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Check No</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Reconciled
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    disabled={reconciliations.length === 0}
                    className='border border-black'
                  />
                </div>
              </TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Actions</TableHead>
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
                  <TableCell>{reconciliation.date}</TableCell>
                  <TableCell>{reconciliation.checkNo}</TableCell>
                  <TableCell>{reconciliation.amount}</TableCell>
                  <TableCell>{reconciliation.type}</TableCell>

                  {/* Reconciled column - always checkbox, used for selection */}
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(reconciliation.id)}
                      onCheckedChange={(checked) =>
                        handleIndividualSelection(
                          reconciliation.id,
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>

                  {/* Comments column - only editable when in edit mode */}
                  <TableCell>
                    {editingId === reconciliation.id ? (
                      <Input
                        value={reconciliation.comments || ''}
                        onChange={(e) =>
                          updateLocalReconciliation(
                            reconciliation.id,
                            'comments',
                            e.target.value,
                            token
                          )
                        }
                      />
                    ) : (
                      reconciliation.comments || ''
                    )}
                  </TableCell>

                  <TableCell>
                    {editingId === reconciliation.id ? (
                      <Button
                        type="button"
                        onClick={() =>
                          handleReconciliationUpdate(
                            reconciliation.id,
                            reconciliation.reconciled ?? false,
                            reconciliation.comments || ''
                          )
                        }
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => toggleEditMode(reconciliation.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Please select a bank account and date range, then click
                  &quot;Show&quot;
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </form>
    </Form>
  )
}
