'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import {
  updateCostCenter,
  getAllCostCenters,
  createCostCenter,
  deactivateCostCenter,
  activateCostCenter,
} from '../../../api/cost-centers-api'
import { useToast } from '@/hooks/use-toast'
import { CostCenter } from '@/utils/type'

export default function CostCenterManagement() {
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
  const [userId, setUserId] = React.useState<number | undefined>()
  const { toast } = useToast()

  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    fetchCostCenters()
  }, [])

  const fetchCostCenters = async () => {
    setIsLoading(true)
    const data = await getAllCostCenters()
    console.log('🚀 ~ fetchCostCenters ~ data:', data)
    if (data.error || !data.data) {
      console.error('Error getting cost centers:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get cost centers',
      })
    } else {
      setCostCenters(data.data)
    }
    setIsLoading(false)
  }

  const handleActivateDeactivate = async (id: number, isActive: boolean) => {
    try {
      let response
      if (isActive) {
        response = await deactivateCostCenter(id)
      } else {
        response = await activateCostCenter(id)
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

        // Update the local state immediately
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
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUserId(userData?.userId)
      console.log('Current userId from localStorage:', userData.userId)
    } else {
      console.log('No user data found in localStorage')
    }
  }, [])

  const CostCenterForm = ({ isEdit = false }) => {
    const [currencyCode, setCurrencyCode] = useState<
      'BDT' | 'USD' | 'EUR' | 'GBP'
    >(isEdit && selectedCostCenter?.currencyCode || 'BDT')

    useEffect(() => {
      if (isEdit && selectedCostCenter) {
        setCurrencyCode(selectedCostCenter.currencyCode)
      } else {
        setCurrencyCode('BDT')
      }
    }, [isEdit, selectedCostCenter])

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsLoading(true)
      setFeedback(null)

      const formData = new FormData(formRef.current!)
      const newCostCenter = {
        costCenterId: 0,
        costCenterName: formData.get('name') as string,
        costCenterDescription: formData.get('description') as string,
        currencyCode: currencyCode as 'BDT' | 'USD' | 'EUR' | 'GBP',
        budget: Number(formData.get('budget')),
        isActive: formData.get('isActive') === 'on',
        actual: parseFloat(formData.get('actual') as string),
        createdBy: userId,
        updatedBy: userId,
      }

      if (isEdit && selectedCostCenter) {
        newCostCenter.costCenterId = selectedCostCenter.costCenterId
        const response = await updateCostCenter(newCostCenter)
        if (response.error || !response.data) {
          console.error('Error updating cost center:', response.error)
          toast({
            title: 'Error',
            description:
              response.error?.message || 'Failed to edit cost center',
          })
        } else {
          console.log('Cost center edited successfully')
          toast({
            title: 'Success',
            description: 'Cost center edited successfully',
          })
          // Update the local state immediately
          setCostCenters((prevCostCenters) =>
            prevCostCenters.map((center) =>
              center.costCenterId === newCostCenter.costCenterId
                ? { ...center, ...newCostCenter }
                : center
            )
          )
        }
      } else {
        const response = await createCostCenter(newCostCenter)
        if (response.error || !response.data) {
          console.error('Error creating cost center:', response.error)
          toast({
            title: 'Error',
            description:
              response.error?.message || 'Failed to create cost center',
          })
        } else {
          console.log('Cost center created successfully')
          toast({
            title: 'Success',
            description: 'Cost center created successfully',
          })
          // Add the new cost center to the local state
          setCostCenters((prevCostCenters) => [...prevCostCenters, response.data])
        }
      }

      setIsAddDialogOpen(false)
      setIsEditDialogOpen(false)
      setSelectedCostCenter(null)
      setFeedback({
        type: 'success',
        message: `Cost center ${isEdit ? 'updated' : 'created'} successfully`,
      })
      setIsLoading(false)
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
          <Select
            name="currencyCode"
            value={currencyCode}
            onValueChange={(value) =>
              setCurrencyCode(value as 'BDT' | 'USD' | 'EUR' | 'GBP')
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select currency code" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BDT">BDT</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {!isEdit && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget
              </Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                defaultValue=""
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="actual" className="text-right">
                Actual
              </Label>
              <Input
                id="actual"
                name="actual"
                type="number"
                defaultValue={isEdit ? selectedCostCenter?.actual : ''}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Active
              </Label>
              <Switch id="isActive" name="isActive" defaultChecked={true} />
            </div>
          </>
        )}
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

  React.useEffect(() => {
    if (feedback && feedback.type === 'success') {
      fetchCostCenters()
    }
  }, [feedback])

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cost Centers</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Cost Center
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
        <div>Loading cost centers...</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Currency Code</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costCenters.map((center) => (
                <TableRow key={center.costCenterId}>
                  <TableCell>{center.costCenterName}</TableCell>
                  <TableCell>{center.costCenterDescription}</TableCell>
                  <TableCell>{center.currencyCode}</TableCell>
                  <TableCell>
                    {center.isActive ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell>
                    {Number(center.budget).toLocaleString()}
                  </TableCell>
                  <TableCell>{center.actual?.toLocaleString()}</TableCell>
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
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
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

