'use client'

import React, { useEffect, useState } from 'react'
import {
  getAllBudgetDetails,
  createBudgetDetails,
  updateBudgetDetails,
} from '@/api/budget-api'
import { toast } from '@/hooks/use-toast'
import { AccountsHead, BudgetItems } from '@/utils/type'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useParams } from 'next/navigation'
import { Edit, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Loader from '@/utils/loader'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SmallButton } from '@/components/custom-ui/small-button'
import { CustomCombobox } from '@/utils/custom-combobox'
import { getAllChartOfAccounts } from '@/api/common-shared-api'

const SingleBudgetItemsDetails = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItems[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<BudgetItems | null>(null)
  const [editedAmount, setEditedAmount] = useState<number>(0)
  const [open, setOpen] = useState(false)
  const [accounts, setAccounts] = useState<AccountsHead[]>([])
  const [selectedAccount, setSelectedAccount] = useState<{
    id: string
    name: string
  } | null>(null)

  const { id } = useParams()
  const budgetId = Number(id)
  const mainToken = localStorage.getItem('authToken')
  const token = `Bearer ${mainToken}`

  /** 🔹 Fetch chart of accounts */
  const fetchAccounts = async () => {
    try {
      const response = await getAllChartOfAccounts(token)
      console.log('📋 Accounts Response:', response)
      if (response.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch chart of accounts',
        })
      } else {
        setAccounts(response.data || [])
      }
    } catch (error) {
      console.error('❌ Error fetching accounts:', error)
    }
  }

  /** 🔹 Fetch all budget details */
  const fetchGetAllBudgetItems = React.useCallback(async () => {
    console.log('🔄 Fetching budget items...')
    setLoading(true)
    try {
      const response = await getAllBudgetDetails(budgetId, token)
      console.log('📊 Budget Items Response:', response)
      if (!response.data) throw new Error('No data received')
      console.log('✅ Setting budget items:', response.data)
      setBudgetItems(response.data)
    } catch (error) {
      console.error('❌ Error fetching budget items:', error)
      toast({
        title: 'Error',
        description: 'Failed to load budget details',
      })
      setBudgetItems([])
    } finally {
      setLoading(false)
    }
  }, [budgetId, token])

  useEffect(() => {
    fetchGetAllBudgetItems()
    fetchAccounts()
  }, [fetchGetAllBudgetItems])

  /** 🔹 Add new budget item */
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAccount) {
      toast({
        title: 'Error',
        description: 'Please select a Chart of Account name',
      })
      return
    }

    const newItem = {
      budgetId,
      name: selectedAccount.name,
      budgetAmount: editedAmount,
      accountId: Number(selectedAccount.id),
      createdBy: null,
      amount: editedAmount,
      actual: null,
    }

    console.log('➕ Creating new item:', newItem)

    try {
      const response = await createBudgetDetails({ token }, [newItem])
      console.log('✅ Create Response:', response)
      if (response.data) {
        await fetchGetAllBudgetItems()
        setSelectedAccount(null)
        setEditedAmount(0)
        setOpen(false)
        toast({
          title: 'Success',
          description: 'New budget item added successfully',
        })
      } else {
        throw new Error('Failed to create budget item')
      }
    } catch (error) {
      console.error('❌ Error creating budget item:', error)
      toast({
        title: 'Error',
        description: 'Failed to create budget item',
      })
    }
  }

  /** 🔹 Edit existing item */
  const handleEditClick = (item: BudgetItems) => {
    console.log('✏️ Editing item:', item)
    setSelectedItem(item)
    // Set the account properly with current item's accountId
    setSelectedAccount({
      id: item.accountId?.toString() ?? '',
      name: item.name,
    })
    setEditedAmount(item.budgetAmount)
    setIsEditModalOpen(true)
  }

  /** 🔹 Submit edit */
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) {
      console.log('❌ Missing selectedItem')
      return
    }

    // Use selectedAccount if it exists and has valid data, otherwise use original item's data
    const accountId = selectedAccount?.id
      ? Number(selectedAccount.id)
      : selectedItem.accountId

    const accountName = selectedAccount?.name
      ? selectedAccount.name
      : selectedItem.name

    console.log('🔍 Account ID being used:', accountId)
    console.log('🔍 Account Name being used:', accountName)
    console.log('🔍 Selected Account state:', selectedAccount)
    console.log('🔍 Original Item:', selectedItem)

    const updatedItem = {
      budgetId,
      accountId: accountId,
      budgetAmount: editedAmount,
      amount: editedAmount,
      name: accountName,
    }

    console.log('🔄 Updating item ID:', selectedItem.id)
    console.log('📝 Update payload:', updatedItem)
    console.log('💰 New amount:', editedAmount)

    try {
      const response = await updateBudgetDetails(
        selectedItem.id,
        updatedItem,
        token
      )
      console.log('✅ Update Response:', response)

      if (response.data) {
        // Immediate optimistic update
        setBudgetItems((prevItems) =>
          prevItems.map((item) =>
            item.id === selectedItem.id
              ? {
                  ...item,
                  budgetAmount: editedAmount,
                  name: accountName,
                  accountId,
                }
              : item
          )
        )

        // Fetch fresh data after a short delay
        setTimeout(() => {
          fetchGetAllBudgetItems()
        }, 300)

        toast({
          title: 'Success',
          description: 'Budget item updated successfully',
        })

        setIsEditModalOpen(false)
        setSelectedItem(null)
        setSelectedAccount(null)
        setEditedAmount(0)
      } else {
        throw new Error('Failed to update budget item')
      }
    } catch (error) {
      console.error('❌ Error updating budget item:', error)
      toast({
        title: 'Error',
        description: 'Failed to update budget item',
      })
    }
  }

  // Log current state for debugging
  useEffect(() => {
    console.log('📊 Current budgetItems state:', budgetItems)
  }, [budgetItems])

  return (
    <div className="p-4 w-max-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold mb-4">Budget Details</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <SmallButton variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Budget Item
            </SmallButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Budget Item</DialogTitle>
              <DialogDescription>
                Add a new item to your budget.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddItem}>
              <div className="space-y-4">
                <div>
                  <Label>Select Chart of Account</Label>
                  <CustomCombobox
                    items={accounts.map((account) => ({
                      id: account.accountId.toString(),
                      name: account.name,
                    }))}
                    value={selectedAccount}
                    onChange={(value) => setSelectedAccount(value)}
                    placeholder="Select account head"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    value={editedAmount}
                    onChange={(e) => setEditedAmount(Number(e.target.value))}
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit">Add Item</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader />
        </div>
      ) : (
        <Table className="border shadow-md">
          <TableHeader>
            <TableRow>
              <TableHead>Chart of Account</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgetItems.map((item) => {
              console.log(
                '🔍 Rendering item:',
                item.id,
                'Amount:',
                item.budgetAmount
              )
              return (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.budgetAmount}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(item)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      {/* 🔹 Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget Item</DialogTitle>
            <DialogDescription>
              Modify Chart of Account and budget amount.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4">
              <div>
                <Label>Chart of Account</Label>
                <CustomCombobox
                  items={accounts.map((account) => ({
                    id: account.accountId.toString(),
                    name: account.name,
                  }))}
                  value={selectedAccount}
                  onChange={(value) => {
                    console.log('🔄 Account changed:', value)
                    setSelectedAccount(value)
                  }}
                  placeholder="Select account head"
                />
              </div>
              <div>
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editedAmount}
                  onChange={(e) => {
                    const newAmount = Number(e.target.value)
                    console.log('💰 Amount input changed:', newAmount)
                    setEditedAmount(newAmount)
                  }}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SingleBudgetItemsDetails
