'use client'

import { getMeterEntry } from '@/api/meter-entry-api'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { GetElectricityMeterType } from '@/utils/type'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

interface MeterEntryListProps {
  onAddCategory: () => void
  meterEntry: GetElectricityMeterType[]
}

const MeterEntryList: React.FC<MeterEntryListProps> = ({
  onAddCategory,
  meterEntry,
}) => {
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
      <div>
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
            {meterEntry.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.meterName}</TableCell>
                <TableCell>{row.companyName}</TableCell>
                <TableCell>{row.metertpe}</TableCell>
                <TableCell>{row.costCenterName}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.provaccountName}</TableCell>
                <TableCell>{row.accountHead}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default MeterEntryList
