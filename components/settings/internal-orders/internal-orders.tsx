'use client'

import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Edit2Icon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SmallButton } from '../../custom-ui/small-button'
import { useRouter } from 'next/navigation'

type InternalOrder = {
  id: string
  description: string
  purpose: string
  companyCodes: string[]
  effectiveDate: string
  active: boolean
}

type Company = {
  code: string
  name: string
}

const dummyData: InternalOrder[] = [
  {
    id: 'IO001',
    description: 'Marketing Campaign',
    purpose: 'Advertising',
    companyCodes: ['CC001', 'CC002'],
    effectiveDate: '2024-01-01',
    active: true,
  },
  {
    id: 'IO002',
    description: 'IT Infrastructure Upgrade',
    purpose: 'Technology',
    companyCodes: ['CC001'],
    effectiveDate: '2024-02-15',
    active: true,
  },
  {
    id: 'IO003',
    description: 'Employee Training Program',
    purpose: 'Human Resources',
    companyCodes: ['CC002', 'CC003'],
    effectiveDate: '2024-03-01',
    active: false,
  },
  {
    id: 'IO004',
    description: 'Product Launch Event',
    purpose: 'Sales',
    companyCodes: ['CC001', 'CC004'],
    effectiveDate: '2024-04-10',
    active: true,
  },
  {
    id: 'IO005',
    description: 'Office Renovation',
    purpose: 'Facilities',
    companyCodes: ['CC002'],
    effectiveDate: '2024-05-20',
    active: false,
  },
]

const companies: Company[] = [
  { code: 'CC001', name: 'Company A' },
  { code: 'CC002', name: 'Company B' },
  { code: 'CC003', name: 'Company C' },
  { code: 'CC004', name: 'Company D' },
  { code: 'CC005', name: 'Company E' },
]

export default function InternalOrders() {
  const router = useRouter()
  const [orders, setOrders] = useState<InternalOrder[]>(dummyData)
  const [selectedOrder, setSelectedOrder] = useState<InternalOrder | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleEdit = (order: InternalOrder) => {
    setSelectedOrder({ ...order })
    setIsDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedOrder) {
      setSelectedOrder({ ...selectedOrder, [e.target.name]: e.target.value })
    }
  }

  const handleSelectChange = (value: string, field: string) => {
    if (selectedOrder) {
      setSelectedOrder({ ...selectedOrder, [field]: value === 'true' })
    }
  }

  const handleCompanyCodeChange = (companyCode: string) => {
    if (selectedOrder) {
      const updatedCompanyCodes = selectedOrder.companyCodes.includes(
        companyCode
      )
        ? selectedOrder.companyCodes.filter((code) => code !== companyCode)
        : [...selectedOrder.companyCodes, companyCode]

      setSelectedOrder({ ...selectedOrder, companyCodes: updatedCompanyCodes })
    }
  }

  const saveChanges = () => {
    if (selectedOrder) {
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id ? selectedOrder : order
        )
      )
      setIsDialogOpen(false)
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
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Internal Orders</h1>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Internal Order No</TableHead>
              <TableHead className="w-[300px]">
                Internal Order Description
              </TableHead>
              <TableHead className="w-[200px]">Purpose</TableHead>
              <TableHead className="w-[150px]">Effective Date</TableHead>
              <TableHead className="w-[100px]">Active</TableHead>
              <TableHead className="w-[200px]">Company Code</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.description}</TableCell>
                <TableCell>{order.purpose}</TableCell>
                <TableCell>{order.effectiveDate}</TableCell>
                <TableCell>{order.active ? 'Yes' : 'No'}</TableCell>
                <TableCell>{order.companyCodes.join(', ')}</TableCell>
                <TableCell>
                  <SmallButton onClick={() => handleEdit(order)}>
                    <Edit2Icon className="" />
                  </SmallButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Internal Order</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={selectedOrder.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="purpose" className="text-right">
                  Purpose
                </Label>
                <Input
                  id="purpose"
                  name="purpose"
                  value={selectedOrder.purpose}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Active
                </Label>
                <Select
                  onValueChange={(value) => handleSelectChange(value, 'active')}
                  defaultValue={selectedOrder.active.toString()}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select active status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Company Codes</Label>
                <div className="col-span-3 space-y-2">
                  {companies.map((company) => (
                    <div
                      key={company.code}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={company.code}
                        checked={selectedOrder.companyCodes.includes(
                          company.code
                        )}
                        onCheckedChange={() =>
                          handleCompanyCodeChange(company.code)
                        }
                      />
                      <label
                        htmlFor={company.code}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {company.code} - {company.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <Button onClick={saveChanges}>Save Changes</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
