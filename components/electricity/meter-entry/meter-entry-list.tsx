
'use client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus } from 'lucide-react'
import React from 'react'

interface MeterEntryListProps {
  onAddCategory: () => void
}

const MeterEntryList: React.FC<MeterEntryListProps> = ({ onAddCategory }) => {
    const data = [
      {
        meterName: 'Meter 1',
        companyName: 'Company A',
        meterType: 'Type A',
        costCenter: 'Cost Center 1',
        meterDescription: 'Description of Meter 1',
        provisionAccountName: 'Account 1',
        expenseAccountName: 'Expense 1',
      },
      {
        meterName: 'Meter 2',
        companyName: 'Company B',
        meterType: 'Type B',
        costCenter: 'Cost Center 2',
        meterDescription: 'Description of Meter 2',
        provisionAccountName: 'Account 2',
        expenseAccountName: 'Expense 2',
      },
      {
        meterName: 'Meter 3',
        companyName: 'Company C',
        meterType: 'Type C',
        costCenter: 'Cost Center 3',
        meterDescription: 'Description of Meter 3',
        provisionAccountName: 'Account 3',
        expenseAccountName: 'Expense 3',
      },
      {
        meterName: 'Meter 4',
        companyName: 'Company D',
        meterType: 'Type A',
        costCenter: 'Cost Center 4',
        meterDescription: 'Description of Meter 4',
        provisionAccountName: 'Account 4',
        expenseAccountName: 'Expense 4',
      },
      {
        meterName: 'Meter 5',
        companyName: 'Company E',
        meterType: 'Type B',
        costCenter: 'Cost Center 5',
        meterDescription: 'Description of Meter 5',
        provisionAccountName: 'Account 5',
        expenseAccountName: 'Expense 5',
      },      // Add more data here as needed
    ]
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Meter List</h1>
        </div>
        <Button onClick={onAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          ADD
        </Button>
      </div>
      <div >
        <Table className="shadow-md border ">
          <TableHeader className="bg-slate-200 shadow-md ">
            <TableRow>
              <TableHead>Meter Name</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Meter Type</TableHead>
              <TableHead>Cost Center</TableHead>
              <TableHead>Meter Description</TableHead>
              <TableHead>Provision Account Name</TableHead>
              <TableHead>Expense Account Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.meterName}</TableCell>
                <TableCell>{row.companyName}</TableCell>
                <TableCell>{row.meterType}</TableCell>
                <TableCell>{row.costCenter}</TableCell>
                <TableCell>{row.meterDescription}</TableCell>
                <TableCell>{row.provisionAccountName}</TableCell>
                <TableCell>{row.expenseAccountName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default MeterEntryList
