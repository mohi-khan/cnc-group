'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChartOfAccount } from '@/utils/type'
import { getAllCoa } from '@/api/level-api'
import { toast } from '@/hooks/use-toast'

interface LavelRow {
  id: number
  revenue: string
  columnType: string
  calculatedColumn: string
  chartOfAccount: number
}

export default function Level() {
  
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([])

  const useLevelRows = () => {
    const [rows, setRows] = React.useState<LavelRow[]>([
      { id: 1, revenue: '', columnType: '', calculatedColumn: '', chartOfAccount: 0 },
    ])
  
    const addRow = () => {
      const newRow: LavelRow = {
        id: rows.length + 1,
        revenue: '',
        columnType: '',
        calculatedColumn: '',
        chartOfAccount: 0,
      }
      setRows([...rows, newRow])
    }
  
    const updateRow = (id: number, field: keyof LavelRow, value: string | number) => {
      setRows(
        rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
      )
    }
  
    return { rows, addRow, updateRow }
  }
  const { rows, addRow, updateRow } = useLevelRows()

  const handleSave = () => {
    console.log('Saving data:', rows)
    // Implement your save logic here
  }

  async function fetchChartOfAccounts() {
    const fetchedAccounts = await getAllCoa()
    if (fetchedAccounts.error || !fetchedAccounts.data) {
      console.error('Error getting chart of accounts:', fetchedAccounts.error)
      toast({
        title: 'Error',
        description:
          fetchedAccounts.error?.message || 'Failed to get chart of accounts',
      })
    } else {
      setAccounts(fetchedAccounts.data)
      console.log(fetchedAccounts.data)
    }
  }

  useEffect(() => {
    fetchChartOfAccounts()
  }, [])

  const handleChartOfAccountSelect = (id: number, value: string) => {
    const accountId = parseInt(value, 10)
    updateRow(id, 'chartOfAccount', accountId)
  }

  const getAccountNameById = (accountId: number) => {
    const account = accounts.find(acc => acc.accountId === accountId)
    return account ? account.name : ''
  }

  const getAvailableAccounts = (currentRowId: number) => {
    const selectedAccounts = rows
      .filter(row => row.id !== currentRowId && row.chartOfAccount !== 0)
      .map(row => row.chartOfAccount)

    return accounts.filter(
      (account) => account.isGroup && 
        (!selectedAccounts.includes(account.accountId) || 
         rows.find(row => row.id === currentRowId)?.chartOfAccount === account.accountId)
    )
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
            <TableHead>Title</TableHead>
            <TableHead>Column Type</TableHead>
            <TableHead>Value</TableHead>
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
                  value={row.columnType}
                  onValueChange={(value) => updateRow(row.id, 'columnType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calculatedColumn">Calculated Column</SelectItem>
                    <SelectItem value="chartOfAccount">Chart of Account</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {row.columnType === 'calculatedColumn' && (
                  <Input
                    value={row.calculatedColumn}
                    onChange={(e) => updateRow(row.id, 'calculatedColumn', e.target.value)}
                    placeholder="Enter calculated column"
                  />
                )}
                {row.columnType === 'chartOfAccount' && (
                  <Select
                    value={row.chartOfAccount !== 0 ? row.chartOfAccount.toString() : ''}
                    onValueChange={(value) => handleChartOfAccountSelect(row.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a chart of account">
                        {row.chartOfAccount !== 0 ? getAccountNameById(row.chartOfAccount) : "Select a chart of account"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableAccounts(row.id).map((account) => (
                        <SelectItem key={account.accountId} value={account.accountId.toString()}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {!row.columnType && (
                  <span className="text-red-500">
                    Please select an option from Calculated Column or Chart of Accounts
                  </span>
                )}
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

