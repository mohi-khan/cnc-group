'use client'

import {
  getAllBudgetDetails,
  createBudgetDetails,
  updateBudgetDetails,
} from '@/api/budget-api'
import { toast } from '@/hooks/use-toast'
import { AccountsHead, BudgetItems, ChartOfAccount } from '@/utils/type'
import React, { useEffect, useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useParams } from 'next/navigation'
import { Edit, ArrowUpDown, Plus, Pencil } from 'lucide-react'
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

const SingleBudgetItemsDetails = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItems[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [sortColumn, setSortColumn] = useState<keyof BudgetItems>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<BudgetItems | null>(null)
  const [editedName, setEditedName] = useState<string>('')
  const [editedAmount, setEditedAmount] = useState<number>(0)
  const [open, setOpen] = useState(false)
  const [accounts, setAccounts] = useState<AccountsHead[]>([])

  const { id } = useParams()
  const budgetId = Number(id)

  const mainToken = localStorage.getItem('authToken')
  const token = `Bearer ${mainToken}`

  // async function fetchAccounts() {
  //   const response = await getAllCoa()
  //   if (response.error) {
  //     console.error('Error fetching accounts:', response.error)
  //     toast({
  //       variant: 'destructive',
  //       title: 'Error',
  //       description: 'Failed to fetch chart of accounts',
  //     })
  //   } else {
  //     setAccounts(response.data)
  //   }
  // }

  const fetchGetAllBudgetItems = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await getAllBudgetDetails(budgetId, token)
      if (!response.data) throw new Error('No data received')
      setBudgetItems(response.data)
    } catch (error) {
      console.error('Error getting budget details:', error)
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
    // fetchAccounts()
  }, [fetchGetAllBudgetItems])

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    const newItem = {
      budgetId: budgetId,
      name: editedName,
      budgetAmount: editedAmount,
      accountId: 5, // Replace with the actual account ID from your application
      createdBy: null,
      amount: editedAmount,
      actual: null,
    }
    try {
      const response = await createBudgetDetails({ token }, [newItem])
      if (response.data) {
        setBudgetItems((prev) => [...prev, { id: Date.now(), ...newItem }])
        setEditedName('')
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
      toast({
        title: 'Error',
        description: 'Failed to create budget item',
      })
      console.error('Error creating budget item:', error)
    }
  }

  const handleEditClick = (item: BudgetItems) => {
    setSelectedItem(item)
    setEditedName(item.name)
    setEditedAmount(item.budgetAmount)
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    const updatedBudgetItem = {
      budgetId: 64,

      budgetAmount: editedAmount,
      accountId: selectedItem.accountId,
    }

    console.log('Updated Budget Item:', updatedBudgetItem)

    try {
      const response = await updateBudgetDetails(budgetId, token)
      console.log('Update Response:', response)
      if (response.data) {
        setBudgetItems((prev) =>
          prev.map((item) =>
            item.id === selectedItem.id
              ? { ...item, name: editedName, budgetAmount: editedAmount }
              : item
          )
        )
        toast({
          title: 'Success',
          description: 'Budget item updated successfully',
        })
      } else {
        throw new Error('Failed to update budget item')
      }
    } catch (error) {
      console.log('Update Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update budget item',
      })
      console.error('Error updating budget item:', error)
    }

    setIsEditModalOpen(false)
    setSelectedItem(null)
    setEditedName('')
    setEditedAmount(0)
  } // const handleAccountChange = (currentId: number, newAccountId: number) => {
  //   if (newAccountId) {
  //     const selectedAccount = accounts.find(
  //       (account) => account.accountId === newAccountId
  //     )
  //     if (selectedAccount) {
  //       setEditedName(selectedAccount.name)
  //       setSelectedItem((prev) =>
  //         prev ? { ...prev, accountId: newAccountId } : null
  //       )
  //     }
  //   }
  // }

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
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Enter item name"
                    required
                  />
                  {/* <CustomCombobox
                    items={accounts.map((account) => ({
                      id: account.accountId.toString(),
                      name: account.name,
                    }))}
                    value={
                      selectedItem?.id
                        ? {
                            id: selectedItem.id.toString(),
                            name:
                              accounts.find(
                                (account) =>
                                  account.accountId === selectedItem.id
                              )?.name || 'Unnamed Account Head',
                          }
                        : null
                    }
                    onChange={(value: { id: string; name: string } | null) =>
                      handleAccountChange(
                        selectedItem?.id || 0,
                        value ? parseInt(value.id) : 0
                      )
                    }
                    placeholder="Select account head"
                  /> */}
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
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
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgetItems.map((item) => (
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
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget Item</DialogTitle>
            <DialogDescription>
              Make changes to your budget item.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Item Name</Label>
                <Input
                  id="edit-name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Enter item name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editedAmount}
                  onChange={(e) => setEditedAmount(Number(e.target.value))}
                  placeholder="Enter amount"
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
