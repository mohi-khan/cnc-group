'use client'
import { getAllBudgetDetails } from '@/api/budget-api'
import { toast } from '@/hooks/use-toast'
import { BudgetItems } from '@/utils/type'
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
import { Edit, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Loader from '@/utils/loader'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from '@/components/ui/pagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SingleBudgetItemsDetails = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItems[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [sortColumn, setSortColumn] = useState<keyof BudgetItems>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage] = useState<number>(10)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<BudgetItems | null>(null)
  const [editedName, setEditedName] = useState<string>('')
  const [editedAmount, setEditedAmount] = useState<number>(0)

  const { id } = useParams()

  const mainToken = localStorage.getItem('authToken')
  console.log(
    '🚀 ~ create budget token in single budget items details:',
    mainToken
  )
  const token = `Bearer ${mainToken}`

  async function fetchGetAllBudgetItems(
    id: number,
    { token }: { token: string }
  ) {
    setLoading(true)
    try {
      const response = await getAllBudgetDetails(id, token)
      if (!response.data) throw new Error('No data received')
      setBudgetItems(response.data)
      console.log('budget items data: ', response.data)
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
  }

  useEffect(() => {
    fetchGetAllBudgetItems(Number(id), { token })
  }, [id, token])
  // Sorting Function
  const sortData = (data: BudgetItems[]) => {
    return [...data].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  // Handle Sorting
  const handleSort = (column: keyof BudgetItems) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage

  const currentItems = useMemo(() => {
    const sortedData = sortData(budgetItems)
    return sortedData.slice(indexOfFirstItem, indexOfLastItem)
  }, [budgetItems, currentPage, sortColumn, sortDirection])

  const totalPages = Math.ceil(budgetItems.length / itemsPerPage)

  // Open Edit Modal
  const handleEditClick = (item: BudgetItems) => {
    setSelectedItem(item)
    setEditedName(item.name)
    setEditedAmount(item.budgetAmount)
    setIsEditModalOpen(true)
  }

  // Handle Save Changes - Updates only the selected item
  const handleSave = () => {
    if (selectedItem) {
      setBudgetItems((prev) =>
        prev.map((item) =>
          // Only update the item if its id matches the selected item's id.
          item.id === selectedItem.id
            ? { ...item, name: editedName, budgetAmount: editedAmount }
            : item
        )
      )
      toast({
        title: 'Success',
        description: 'Budget item updated successfully',
      })
      // Reset edit states after saving.
      setIsEditModalOpen(false)
      setSelectedItem(null)
      setEditedName('')
      setEditedAmount(0)
    }
  }

  return (
    <div className="p-4 w-max-5xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Budget Details</h2>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader />
        </div>
      ) : budgetItems.length > 0 ? (
        <>
          <Table className="border shadow-md">
            <TableHeader className="bg-gray-200 shadow-sm sticky top-28">
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    <span>Name</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('budgetAmount')}
                >
                  <div className="flex items-center gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item, ) => (
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

          {/* Pagination */}
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
                  <PaginationItem key={`page-${index + 1}`}>
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
        </>
      ) : (
        <p className="text-gray-500">No budget items found.</p>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Budget Item</DialogTitle>
            </DialogHeader>
            <Label>Name</Label>
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
            />
            <Label>Amount</Label>
            <Input
              type="number"
              value={editedAmount}
              onChange={(e) => setEditedAmount(Number(e.target.value))}
            />
            <DialogFooter>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default SingleBudgetItemsDetails
