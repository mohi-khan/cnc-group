'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { PlusIcon, ArrowUpDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  updateCostCenter,
  createCostCenter,
  deactivateCostCenter,
  activateCostCenter,
} from '../../../api/cost-centers-api'
import { useToast } from '@/hooks/use-toast'
import type { CostCenter, CurrencyType } from '@/utils/type'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { getAllCostCenters, getAllCurrency } from '@/api/common-shared-api'
import { useRouter } from 'next/navigation'
import { CustomCombobox } from '@/utils/custom-combobox'

export default function CostCenterManagement() {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  // State variables
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCostCenter, setSelectedCostCenter] =
    useState<CostCenter | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [userId, setUserId] = React.useState<number>(0)
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] =
    useState<keyof CostCenter>('costCenterName')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currency, setCurrency] = React.useState<CurrencyType[]>([])

  const formRef = useRef<HTMLFormElement>(null)

  const fetchCostCenters = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    const data = await getAllCostCenters(token)
    console.log('🚀 ~ fetchCostCenters ~ data:', data)
    if (data?.error?.status === 401) {
      router.push('/unauthorized-access')
      console.log('Unauthorized access')
      return
    } else if (data?.error?.status === 401) {
      router.push('/unauthorized-access')
      return
    } else if (data.error || !data.data) {
      console.error('Error getting cost centers:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get cost centers',
        variant: 'destructive',
      })
    } else {
      setCostCenters(data.data)
    }
    setIsLoading(false)
  }, [toast, token, router])

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
  }, [token, toast])

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
    fetchCostCenters()
    fetchCurrency()
  }, [fetchCostCenters, fetchCurrency, router])

  const handleActivateDeactivate = async (id: number, isActive: boolean) => {
    try {
      let response
      if (isActive) {
        response = await deactivateCostCenter(id, token)
      } else {
        response = await activateCostCenter(id, token)
      }

      if (response.error || !response.data) {
        console.error(
          `Error ${isActive ? 'deactivating' : 'activating'} cost center:`,
          response.error
        )
        toast({
          title: 'Error',
          description:
            response.error?.message ||
            `Failed to ${isActive ? 'deactivate' : 'activate'} cost center`,
        })
      } else {
        console.log(
          `Cost center ${isActive ? 'deactivated' : 'activated'} successfully`
        )
        toast({
          title: 'Success',
          description: `Cost center ${isActive ? 'deactivated' : 'activated'} successfully`,
        })

        setCostCenters((prevCostCenters) =>
          prevCostCenters.map((center) =>
            center.costCenterId === id
              ? { ...center, isActive: !isActive }
              : center
          )
        )

        setFeedback({
          type: 'success',
          message: `Cost center ${isActive ? 'deactivated' : 'activated'} successfully`,
        })
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
      })
    }
  }

  const handleEdit = (center: CostCenter) => {
    setSelectedCostCenter(center)
    setIsEditDialogOpen(true)
  }

  React.useEffect(() => {
    if (userData) {
      setUserId(userData?.userId)
      console.log('Current userId from localStorage:', userData.userId)
    } else {
      console.log('No user data found in localStorage')
    }
  }, [userData])

  const CostCenterForm: React.FC<{ isEdit: boolean }> = ({ isEdit }) => {
    const [currencyCode, setCurrencyCode] = useState<string>(
      (isEdit && selectedCostCenter?.currencyCode) || 'BDT'
    )

    useEffect(() => {
      if (isEdit) {
        setCurrencyCode(selectedCostCenter?.currencyCode || 'BDT')
      } else {
        setCurrencyCode('BDT')
      }
    }, [isEdit])

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsLoading(true)
      setFeedback(null)

      try {
        const formData = new FormData(formRef.current!)
        const newCostCenter = {
          costCenterName: formData.get('name') as string,
          costCenterDescription: formData.get('description') as string,
          currencyCode: currencyCode,
          budget: Number(formData.get('budget')) || 0,
          isActive: formData.get('isActive') === 'on',
          isVehicle: formData.get('isVehicle') === 'on',
          actual: Number(formData.get('actual')) || 0,
          createdBy: userId,
        }

        const updateCostCenterData = {
          costCenterId: 0,
          costCenterName: formData.get('name') as string,
          costCenterDescription: formData.get('description') as string,
          currencyCode: currencyCode,
          budget: formData.get('budget')?.toString() || '0',
          isActive: formData.get('isActive') === 'on',
          isVehicle: formData.get('isVehicle') === 'on',
          actual: formData.get('actual')?.toString() || '0',
          createdBy: userId,
          updatedBy: userId,
        }

        if (isEdit && selectedCostCenter) {
          updateCostCenterData.costCenterId = selectedCostCenter.costCenterId
          const response = await updateCostCenter(
            {
              ...updateCostCenterData,
              currencyCode: currencyCode as 'USD' | 'BDT' | 'EUR' | 'GBP',
            },
            token
          )
          if (response.error || !response.data) {
            throw new Error(
              response.error?.message || 'Failed to edit cost center'
            )
          }

          toast({
            title: 'Success',
            description: 'Cost center edited successfully',
          })
        } else {
          const response = await createCostCenter(
            {
              ...newCostCenter,
              currencyCode: currencyCode as 'USD' | 'BDT' | 'EUR' | 'GBP',
            },
            token
          )
          if (response.error || !response.data) {
            throw new Error(
              response.error?.message || 'Failed to create cost center'
            )
          }

          toast({
            title: 'Success',
            description: 'Cost center created successfully',
          })
        }

        // Close dialogs first
        setIsAddDialogOpen(false)
        setIsEditDialogOpen(false)
        setSelectedCostCenter(null)

        // Then update feedback state
        setFeedback({
          type: 'success',
          message: `Cost center ${isEdit ? 'updated' : 'created'} successfully`,
        })
      } catch (error) {
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        })
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="cost-center-name" className="text-right">
            Cost Center Name
          </Label>
          <Input
            id="cost-center-name"
            name="name"
            defaultValue={isEdit ? selectedCostCenter?.costCenterName : ''}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="cost-center-description" className="text-right">
            Description
          </Label>
          <Input
            id="cost-center-description"
            name="description"
            defaultValue={
              isEdit ? selectedCostCenter?.costCenterDescription : ''
            }
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="currency-code" className="text-right">
            Currency Code
          </Label>
          <CustomCombobox
            items={currency.map((curr: CurrencyType) => ({
              id: curr.currencyId.toString(),
              name: curr.currencyCode || 'Unnamed Currency',
            }))}
            value={
              currencyCode
                ? {
                    id: currencyCode.toString(),
                    name:
                      currency.find(
                        (curr: CurrencyType) =>
                          curr.currencyCode === currencyCode
                      )?.currencyCode || 'Unnamed Currency',
                  }
                : null
            }
            onChange={(value: { id: string; name: string } | null) =>
              setCurrencyCode(
                value ? (value.name as 'USD' | 'BDT' | 'EUR' | 'GBP') : 'BDT'
              )
            }
            placeholder="Select currency"
          />{' '}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="budget" className="text-right">
            Budget
          </Label>
          <Input
            id="budget"
            name="budget"
            type="string"
            defaultValue={isEdit ? selectedCostCenter?.budget : 0}
            className="col-span-3"
            required
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md p-2">
          <Label htmlFor="isActive" className="text-right">
            Active
          </Label>
          <Switch
            id="isActive"
            name="isActive"
            defaultChecked={isEdit ? selectedCostCenter?.isActive : true}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md p-2">
          <Label htmlFor="isVehicle" className="text-right">
            Vehicle
          </Label>
          <Switch
            id="isVehicle"
            name="isVehicle"
            defaultChecked={isEdit ? selectedCostCenter?.isVehicle : false}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() =>
              isEdit ? setIsEditDialogOpen(false) : setIsAddDialogOpen(false)
            }
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Add'} Cost Center
          </Button>
        </div>
      </form>
    )
  }

  const handleSort = (column: keyof CostCenter) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedCostCenters = useMemo(() => {
    return [...costCenters].sort((a, b) => {
      const aValue = a[sortColumn] ?? ''
      const bValue = b[sortColumn] ?? ''
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortDirection === 'asc'
          ? aValue === bValue
            ? 0
            : aValue
              ? -1
              : 1
          : aValue === bValue
            ? 0
            : aValue
              ? 1
              : -1
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [costCenters, sortColumn, sortDirection])

  const paginatedCostCenters = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedCostCenters.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedCostCenters, currentPage, itemsPerPage])

  const totalPages = Math.ceil(costCenters.length / itemsPerPage)

  // Remove this useEffect
  // React.useEffect(() => {
  //   if (feedback && feedback.type === 'success') {
  //     fetchCostCenters()
  //   }
  // }, [feedback])

  // Replace with this implementation
  React.useEffect(() => {
    if (feedback?.type === 'success') {
      const timer = setTimeout(() => {
        fetchCostCenters()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [feedback, fetchCostCenters])

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cost Centers</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Cost Center
        </Button>
      </div>

      {isLoading ? (
        <div>Loading cost centers...</div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="border shadow-md">
            <TableHeader className="shadow-md bg-slate-200">
              <TableRow>
                <TableHead
                  onClick={() => handleSort('costCenterName')}
                  className="cursor-pointer"
                >
                  Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort('costCenterDescription')}
                  className="cursor-pointer"
                >
                  Description <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort('currencyCode')}
                  className="cursor-pointer"
                >
                  Currency Code <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort('isActive')}
                  className="cursor-pointer"
                >
                  Active <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort('isVehicle')}
                  className="cursor-pointer"
                >
                  Vehicle <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort('budget')}
                  className="cursor-pointer"
                >
                  Budget <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                {/* <TableHead
                  onClick={() => handleSort('actual')}
                  className="cursor-pointer"
                >
                  Actual <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead> */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCostCenters.map((center) => (
                <TableRow key={center.costCenterId}>
                  <TableCell>{center.costCenterName}</TableCell>
                  <TableCell>{center.costCenterDescription}</TableCell>
                  <TableCell>{center.currencyCode}</TableCell>
                  <TableCell>{center.isActive ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{center.isVehicle ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    {Number(center.budget).toLocaleString()}
                  </TableCell>
                  {/* <TableCell>{center.actual?.toLocaleString()}</TableCell> */}
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(center)}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleActivateDeactivate(
                          center.costCenterId,
                          center.isActive
                        )
                      }
                    >
                      {center.isActive ? 'Deactivate' : 'Activate'}
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
                  <PaginationItem key={`page-${index}`}>
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
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Cost Center</DialogTitle>
          </DialogHeader>
          <CostCenterForm isEdit={false} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Cost Center</DialogTitle>
          </DialogHeader>
          <CostCenterForm isEdit={true} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
