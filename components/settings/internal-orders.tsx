'use client'

import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit2Icon } from 'lucide-react'
import { SmallButton } from '../custom-ui/small-button'

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
  { id: 'IO001', description: 'Marketing Campaign', purpose: 'Advertising', companyCodes: ['CC001', 'CC002'], effectiveDate: '2024-01-01', active: true },
  { id: 'IO002', description: 'IT Infrastructure Upgrade', purpose: 'Technology', companyCodes: ['CC001'], effectiveDate: '2024-02-15', active: true },
  { id: 'IO003', description: 'Employee Training Program', purpose: 'Human Resources', companyCodes: ['CC002', 'CC003'], effectiveDate: '2024-03-01', active: false },
  { id: 'IO004', description: 'Product Launch Event', purpose: 'Sales', companyCodes: ['CC001', 'CC004'], effectiveDate: '2024-04-10', active: true },
  { id: 'IO005', description: 'Office Renovation', purpose: 'Facilities', companyCodes: ['CC002'], effectiveDate: '2024-05-20', active: false },
]

const companies: Company[] = [
  { code: 'CC001', name: 'Company A' },
  { code: 'CC002', name: 'Company B' },
  { code: 'CC003', name: 'Company C' },
  { code: 'CC004', name: 'Company D' },
  { code: 'CC005', name: 'Company E' },
]

export default function InternalOrders() {
  const [orders, setOrders] = useState<InternalOrder[]>(dummyData)
  const [selectedOrder, setSelectedOrder] = useState<InternalOrder | null>(null)

  const toggleActive = (id: string) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, active: !order.active } : order
    ))
  }

  const handleCompanyCodeChange = (companyCode: string) => {
    if (selectedOrder) {
      const updatedCompanyCodes = selectedOrder.companyCodes.includes(companyCode)
        ? selectedOrder.companyCodes.filter(code => code !== companyCode)
        : [...selectedOrder.companyCodes, companyCode]

      setSelectedOrder({ ...selectedOrder, companyCodes: updatedCompanyCodes })
    }
  }

  const saveCompanyCodes = () => {
    if (selectedOrder) {
      setOrders(orders.map(order =>
        order.id === selectedOrder.id ? { ...order, companyCodes: selectedOrder.companyCodes } : order
      ))
      setSelectedOrder(null)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Internal Orders</h1>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Internal Order No</TableHead>
              <TableHead className="w-[300px]">Internal Order Description</TableHead>
              <TableHead className="w-[200px]">Purpose</TableHead>
              <TableHead className="w-[150px]">Effective Date</TableHead>
              <TableHead className="w-[100px]">Active</TableHead>
              <TableHead className="w-[200px]">Company Code</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.description}</TableCell>
                <TableCell>{order.purpose}</TableCell>
                <TableCell>{order.effectiveDate}</TableCell>
                <TableCell>
                  <Checkbox 
                    checked={order.active} 
                    onCheckedChange={() => toggleActive(order.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-between items-center space-x-2">
                    <p>{order.companyCodes.join(', ')}</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <SmallButton onClick={() => setSelectedOrder(order)}>
                          <Edit2Icon className="h-4 w-4" />
                        </SmallButton>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Company Codes</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          {companies.map((company) => (
                            <div key={company.code} className="flex items-center space-x-2">
                              <Checkbox
                                id={company.code}
                                checked={selectedOrder?.companyCodes.includes(company.code)}
                                onCheckedChange={() => handleCompanyCodeChange(company.code)}
                              />
                              <label htmlFor={company.code} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {company.code} - {company.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        <DialogClose asChild>
                        <Button onClick={saveCompanyCodes}>Save</Button>
                        </DialogClose>
                        
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}