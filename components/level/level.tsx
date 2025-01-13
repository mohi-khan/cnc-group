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

interface LevelType {
  id: number
  revenue: string
  columnType: string
  calculatedColumn: string
  chartOfAccount: number
}

export default function Level() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const useLevelRows = () => {
    const [rows, setRows] = React.useState<LevelType[]>([
      { id: 1, revenue: '', columnType: '', calculatedColumn: '', chartOfAccount: 0 },
    ])
  
    const addRow = () => {
      const newRow: LevelType = {
        id: rows.length + 1,
        revenue: '',
        columnType: '',
        calculatedColumn: '',
        chartOfAccount: 0,
      }
      setRows([...rows, newRow])
    }
  
    const updateRow = (id: number, field: keyof LevelType, value: string | number) => {
      setRows(
        rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
      )
    }
  
    return { rows, addRow, updateRow }
  }
  const { rows, addRow, updateRow } = useLevelRows()

  const handleSave = () => {
    console.log('Saving data:', rows)
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

  const handleCalculatedColumnChange = (id: number, value: string) => {
    updateRow(id, 'calculatedColumn', value)
    
    // Get the last word being typed
    const words = value.split(' ')
    const lastWord = words[words.length - 1]

    if (lastWord) {
      // Get previous titles for suggestions
      const previousTitles = rows
        .filter(row => row.id < id && row.revenue)
        .map(row => row.revenue)
      
      // Filter suggestions based on the last word
      const matchingSuggestions = previousTitles.filter(title =>
        title.toLowerCase().includes(lastWord.toLowerCase())
      )

      setSuggestions(matchingSuggestions)
      setShowSuggestions(matchingSuggestions.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (id: number, suggestion: string) => {
    const currentValue = rows.find(row => row.id === id)?.calculatedColumn || ''
    const words = currentValue.split(' ')
    // Replace the last word with the selected suggestion
    words[words.length - 1] = suggestion
    const newValue = words.join(' ') + ' '
    updateRow(id, 'calculatedColumn', newValue)
    setShowSuggestions(false)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.suggestions-container')) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
                  <div className="suggestions-container relative">
                    <Input
                      value={row.calculatedColumn}
                      onChange={(e) => handleCalculatedColumnChange(row.id, e.target.value)}
                      placeholder="Enter calculated column"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                        <div className="py-1">
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSuggestionClick(row.id, suggestion)}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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

