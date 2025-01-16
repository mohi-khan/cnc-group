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
import { ChartOfAccount, LevelType } from '@/utils/type'
import { createLevel, getAllCoa } from '@/api/level-api'
import { toast } from '@/hooks/use-toast'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Plus, SkipBackIcon as Backspace } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"

// Define operators
const OPERATORS = [
  { symbol: '+', label: 'Add' },
  { symbol: '-', label: 'Subtract' },
]

export default function LevelEntry() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([])
  const [displayFormula, setDisplayFormula] = useState<string>('')

  const useLevelRows = () => {
    const [rows, setRows] = React.useState<LevelType[]>([
      { title: '', type: undefined, COA_ID: null, position: 1, formula: '', negative: false },
    ])

    const addRow = () => {
      const newRow: LevelType = {
        title: '',
        type: undefined,
        COA_ID: null,
        position: rows.length + 1,
        formula: '',
        negative: false,
      }
      setRows([...rows, newRow])
    }

    const updateRow = (position: number, field: keyof LevelType, value: string | number | boolean | null) => {
      setRows(
        rows.map((row) => (row.position === position ? { ...row, [field]: value } : row))
      )
    }

    return { rows, addRow, updateRow }
  }
  const { rows, addRow, updateRow } = useLevelRows()

  const handleSave = async () => {
    console.log('Saving data:', rows)
    const response = await createLevel(rows)
    if (response.error || !response.data) {
      console.error('Error creating level', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Error creating level',
      })
    } else {
      console.log('level is created successfully', response.data)
      toast({
        title: 'Success',
        description: 'level is created successfully',
      })
    }
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

  const handleChartOfAccountSelect = (position: number, value: string) => {
    const accountId = parseInt(value, 10)
    updateRow(position, 'COA_ID', accountId)
  }

  const getAccountNameById = (accountId: number) => {
    const account = accounts.find(acc => acc.accountId === accountId)
    return account ? account.name : ''
  }

  const getAvailableAccounts = (currentPosition: number) => {
    const selectedAccounts = rows
      .filter(row => row.position !== currentPosition && row.COA_ID !== null)
      .map(row => row.COA_ID)

    return accounts.filter(
      (account) => account.isGroup && 
        (!selectedAccounts.includes(account.accountId) || 
         rows.find(row => row.position === currentPosition)?.COA_ID === account.accountId)
    )
  }

  const getPreviousVariables = (currentPosition: number) => {
    return rows
      .filter(row => row.position < currentPosition)
      .map(row => ({
        name: row.title || `Level ${row.position}`,
        id: row.position,
        position: row.position,
        displayValue: row.title || `Level ${row.position}`
      }))
  }

  const handleInsertVariable = (position: number, variablePosition: number, displayValue: string) => {
    const currentValue = rows.find(row => row.position === position)?.formula || ''
    const currentDisplayValue = displayFormula || ''
    
    // Update the actual formula with position numbers (for database)
    updateRow(position, 'formula', `${currentValue}${variablePosition}`)
    
    // Update the display formula with titles
    setDisplayFormula(`${currentDisplayValue}${displayValue}`)
  }

  const handleInsertOperator = (position: number, operator: string) => {
    const currentValue = rows.find(row => row.position === position)?.formula || ''
    updateRow(position, 'formula', `${currentValue}${operator}`)
    setDisplayFormula(`${displayFormula}${operator}`)
  }

  const handleBackspace = (position: number) => {
    const currentValue = rows.find(row => row.position === position)?.formula || ''
    const newValue = currentValue.slice(0, -1)
    updateRow(position, 'formula', newValue)
    setDisplayFormula(displayFormula.slice(0, -1))
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
            <TableHead>Position</TableHead>
            <TableHead>Negative</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.position}>
              <TableCell>{row.position}</TableCell>
              <TableCell>
                <Checkbox
                  checked={row.negative}
                  onCheckedChange={(checked) => updateRow(row.position, 'negative', checked === true)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.title}
                  onChange={(e) => updateRow(row.position, 'title', e.target.value)}
                  placeholder="Enter title"
                  maxLength={45}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={row.type}
                  onValueChange={(value) => {
                    updateRow(row.position, 'type', value as 'Calculated Field' | 'COA Group')
                    if (value === 'Calculated Field') {
                      setDisplayFormula('')
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Calculated Field">Calculated Field</SelectItem>
                    <SelectItem value="COA Group">COA Group</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {row.type === 'Calculated Field' && (
                  <div className="flex gap-2">
                    <Input
                      value={displayFormula}
                      placeholder="Use Insert button to add variables and operators"
                      maxLength={45}
                      readOnly
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Insert
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <div>
                            <h4 className="mb-2 font-medium">Variables</h4>
                            <div className="grid gap-2">
                              {getPreviousVariables(row.position).map((variable) => (
                                <Button
                                  key={variable.id}
                                  variant="outline"
                                  size="sm"
                                  className="justify-start"
                                  onClick={() => handleInsertVariable(row.position, variable.position, variable.displayValue)}
                                >
                                  {variable.name}
                                </Button>
                              ))}
                              {getPreviousVariables(row.position).length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                  No variables available from previous levels
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="mb-2 font-medium">Operators</h4>
                            <div className="grid grid-cols-3 gap-2">
                              {OPERATORS.map((op) => (
                                <Button
                                  key={op.symbol}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleInsertOperator(row.position, op.symbol)}
                                >
                                  {op.symbol}
                                </Button>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBackspace(row.position)}
                              >
                                <Backspace className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                {row.type === 'COA Group' && (
                  <Select
                    value={row.COA_ID?.toString() || ''}
                    onValueChange={(value) => handleChartOfAccountSelect(row.position, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a chart of account">
                        {row.COA_ID ? getAccountNameById(row.COA_ID) : "Select a chart of account"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableAccounts(row.position).map((account) => (
                        <SelectItem key={account.accountId} value={account.accountId.toString()}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {!row.type && (
                  <span className="text-red-500">
                    Please select a type: Calculated Field or COA Group
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

