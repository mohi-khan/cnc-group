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
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import type { BankAccount, BankReconciliationType } from '@/utils/type'
import { useToast } from '@/hooks/use-toast'
import {
  getAllBankAccounts,
  getBankReconciliations,
  updateBankReconciliation,
} from '@/api/bank-reconciliation-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import { useForm } from 'react-hook-form'
import { Check, Edit } from 'lucide-react'

export const BankReconciliation = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedBankAccount, setSelectedBankAccount] =
    useState<BankAccount | null>(null)
  const [reconciliations, setReconciliations] = useState<
    BankReconciliationType[]
  >([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const { toast } = useToast()
  const form = useForm()

  useEffect(() => {
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
    fetchBankAccounts()
  }, [toast])

  useEffect(() => {
    const fetchReconciliations = async () => {
      if (selectedBankAccount) {
        try {
          setLoading(true)
          const data = await getBankReconciliations()
          // Filter reconciliations based on the selected bank account
          const filteredReconciliations = data.data
            ? data.data.filter(
                (reconciliation: BankReconciliationType) =>
                  reconciliation.bankId === selectedBankAccount.id
              )
            : []
          setReconciliations(filteredReconciliations)
        } catch (error) {
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
    fetchReconciliations()
  }, [selectedBankAccount, toast])

  const handleReconciliationUpdate = async (
    id: number,
    reconciled: number,
    comments: string
  ) => {
    try {
      setLoading(true)
      await updateBankReconciliation(id, { reconciled, comments })
      setReconciliations((prevReconciliations) =>
        prevReconciliations.map((r) =>
          r.id === id ? { ...r, reconciled, comments } : r
        )
      )
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(() => {})}
        className="w-[98%] mx-auto p-4"
      >
        <FormField
          control={form.control}
          name="bankAccount"
          render={({ field }) => (
            <FormItem>
              <div className="w-1/4 mx-auto py-5">
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
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Table className="mt-4 shadow-md border">
          <TableHeader className="bg-slate-200 shadow-md">
            <TableRow>
              <TableHead>Voucher ID</TableHead>
              <TableHead>Check No</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reconciled</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : selectedBankAccount ? (
              reconciliations.map((reconciliation) => (
                <TableRow key={reconciliation.id}>
                  <TableCell>{reconciliation.voucherId}</TableCell>
                  <TableCell>{reconciliation.checkNo}</TableCell>
                  <TableCell>{reconciliation.amount}</TableCell>
                  <TableCell>{reconciliation.type}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={reconciliation.reconciled === 1}
                      onCheckedChange={(checked) =>
                        handleReconciliationUpdate(
                          reconciliation.id,
                          checked ? 1 : 0,
                          reconciliation.comments || ''
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {editingId === reconciliation.id ? (
                      <Input
                        value={reconciliation.comments || ''}
                        onChange={(e) => {
                          const updatedReconciliations = reconciliations.map(
                            (r) =>
                              r.id === reconciliation.id
                                ? { ...r, comments: e.target.value }
                                : r
                          )
                          setReconciliations(updatedReconciliations)
                        }}
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
                            reconciliation.reconciled || 0,
                            reconciliation.comments || ''
                          )
                        }
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => setEditingId(reconciliation.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Please select a bank account
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </form>
    </Form>
  )
}
