'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface LavelRow {
  id: number
  revenue: string
  calculatedColumn: string
  isGroup: string
}

const useLevelRows = () => {
  const [rows, setRows] = React.useState<LavelRow[]>([
    { id: 1, revenue: '', calculatedColumn: '', isGroup: '' }
  ])

  const addRow = () => {
    const newRow: LavelRow = {
      id: rows.length + 1,
      revenue: '',
      calculatedColumn: '',
      isGroup: ''
    }
    setRows([...rows, newRow])
  }

  const updateRow = (id: number, field: keyof LavelRow, value: string) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ))
  }

  return { rows, addRow, updateRow }
}

export default function Level() {
  const { rows, addRow, updateRow } = useLevelRows()

  const handleSave = () => {
    console.log('Saving data:', rows)
    // Implement your save logic here
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Level</h1>
        <Button onClick={addRow}>Add Level</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Revenue</TableHead>
            <TableHead>Calculated Column/Chart of Account</TableHead>
            <TableHead>Is Group</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Input
                  value={row.revenue}
                  onChange={(e) => updateRow(row.id, 'revenue', e.target.value)}
                  placeholder="Enter revenue"
                />
              </TableCell>
              <TableCell>
                <Select
                  value={row.calculatedColumn}
                  onValueChange={(value) => updateRow(row.id, 'calculatedColumn', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="column1">Column 1</SelectItem>
                    <SelectItem value="column2">Column 2</SelectItem>
                    <SelectItem value="column3">Column 3</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={row.isGroup}
                  onValueChange={(value) => updateRow(row.id, 'isGroup', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  )
}

