'use client'

import { useCallback, useEffect, useState } from 'react'
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
import type { AccountsHead, LevelType } from '@/utils/type'
import { createLevel, editLevel, getAllLevel } from '@/api/level-api'
import { toast } from '@/hooks/use-toast'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Plus, Backpack as Backspace } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { getAllChartOfAccounts } from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

// Define operators
const OPERATORS = [
  { symbol: '+', label: 'Add' },
  { symbol: '-', label: 'Subtract' },
]

const DOCUMENT_TYPES = [
  { value: 'Income Statement', label: 'Income Statement' },
  { value: 'Trial Balance', label: 'Trial Balance' },
]

// Utility functions
function parseFormula(formula: string): string[] {
  return formula.split(/(\d+|[-+])/).filter(Boolean)
}

export default function LevelEntry() {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [accounts, setAccounts] = useState<AccountsHead[]>([])
  const [levels, setLevels] = useState<LevelType[]>([])
  const [displayFormula, setDisplayFormula] = useState<string>('')
  const [levelFormulas, setLevelFormulas] = useState<{ [key: number]: string }>(
    {}
  )
  const [newRows, setNewRows] = useState<LevelType[]>([])

  function convertFormulaToDisplay(
    formula: string,
    levels: LevelType[]
  ): string {
    if (!formula) return ''
    const parts = parseFormula(formula)
    return parts
      .map((part) => {
        if (/^\d+$/.test(part)) {
          const level = levels.find(
            (l) => l.position === Number.parseInt(part, 10)
          )
          return level ? level.title || `l${level.position}` : part
        }
        return part
      })
      .join('')
  }

  const getNextPosition = () => {
    const existingPositions = levels.map((l) => l.position)
    const newRowPositions = newRows.map((r) => r.position)
    const allPositions = [...existingPositions, ...newRowPositions]
    return allPositions.length > 0 ? Math.max(...allPositions) + 1 : 1
  }

  const addNewRow = () => {
    const newRow: LevelType = {
      title: '',
      type: undefined,
      COA_ID: null,
      position: getNextPosition(),
      formula: '',
      negative: false,
      document: undefined,
    }
    setNewRows([...newRows, newRow])
  }

  const updateNewRow = (
    position: number,
    field: keyof LevelType,
    value: string | number | boolean | null
  ) => {
    setNewRows(
      newRows.map((row) =>
        row.position === position ? { ...row, [field]: value } : row
      )
    )
  }

  const updateExistingLevel = (
    position: number,
    field: keyof LevelType,
    value: string | number | boolean | null
  ) => {
    setLevels(
      levels.map((level) =>
        level.position === position ? { ...level, [field]: value } : level
      )
    )
  }

  const handleSave = async () => {
    if (newRows.length === 0) {
      toast({
        title: 'No new levels to save',
        description: 'Please add some levels before saving',
      })
      return
    }

    const response = await createLevel(newRows, token)
    if (response.error || !response.data) {
      toast({
        title: 'Error',
        description: response.error?.message || 'Error creating level',
      })
    } else {
      toast({
        title: 'Success',
        description: 'New levels created successfully',
      })
      setNewRows([])
      fetchLevels()
    }
  }

  const fetchChartOfAccounts = useCallback(async () => {
    if (!token) return
    const fetchedAccounts = await getAllChartOfAccounts(token)
    if (fetchedAccounts?.error?.status === 401) {
      router.push('/unauthorized-access')
      return
    } else if (fetchedAccounts.error || !fetchedAccounts.data) {
      toast({
        title: 'Error',
        description:
          fetchedAccounts.error?.message || 'Failed to get chart of accounts',
      })
    } else {
      setAccounts(fetchedAccounts.data)
    }
  }, [token, router])

  const fetchLevels = useCallback(async () => {
    if (!token) return
    const fetchLevels = await getAllLevel(token)
    if (fetchLevels?.error?.status === 401) {
      router.push('/unauthorized-access')
      return
    } else if (fetchLevels.error || !fetchLevels.data) {
      toast({
        title: 'Error',
        description: fetchLevels.error?.message || 'Failed to get levels',
      })
    } else {
      setLevels(fetchLevels.data)
    }
  }, [token, router])

  useEffect(() => {
    fetchChartOfAccounts()
    fetchLevels()
  }, [fetchChartOfAccounts, fetchLevels])

  const handleChartOfAccountSelect = (
    position: number,
    value: string,
    isNewRow = false
  ) => {
    const accountId = Number.parseInt(value, 10)
    if (isNewRow) updateNewRow(position, 'COA_ID', accountId)
    else updateExistingLevel(position, 'COA_ID', accountId)
  }

  const getAccountNameById = (accountId: number) =>
    accounts.find((acc) => acc.accountId === accountId)?.name || ''

  const getAvailableAccounts = (currentPosition: number, isNewRow = false) => {
    const existingSelectedAccounts = levels
      .filter((l) => l.COA_ID !== null)
      .map((l) => l.COA_ID)
    const newRowSelectedAccounts = newRows
      .filter((row) => row.position !== currentPosition && row.COA_ID !== null)
      .map((row) => row.COA_ID)
    const allSelectedAccounts = [
      ...existingSelectedAccounts,
      ...newRowSelectedAccounts,
    ]
    return accounts.filter(
      (account) =>
        account.isGroup &&
        (!allSelectedAccounts.includes(account.accountId) ||
          (isNewRow
            ? newRows.find((row) => row.position === currentPosition)
                ?.COA_ID === account.accountId
            : levels.find((level) => level.position === currentPosition)
                ?.COA_ID === account.accountId))
    )
  }

  const getPreviousVariables = (currentPosition: number) => {
    const existingLevels = levels
      .filter((l) => l.position < currentPosition)
      .map((level) => ({
        name: level.title || `l${level.position}`,
        id: level.position,
        position: level.position,
        displayValue: level.title || `l${level.position}`,
      }))
    const newRowVariables = newRows
      .filter((row) => row.position < currentPosition)
      .map((row) => ({
        name: row.title || `l${row.position}`,
        id: row.position,
        position: row.position,
        displayValue: row.title || `l${row.position}`,
      }))
    return [...existingLevels, ...newRowVariables].sort(
      (a, b) => a.position - b.position
    )
  }

  const handleInsertVariable = (
    position: number,
    variablePosition: number,
    displayValue: string,
    isNewRow = false
  ) => {
    if (isNewRow) {
      const currentValue =
        newRows.find((row) => row.position === position)?.formula || ''
      updateNewRow(position, 'formula', `${currentValue}${variablePosition}`)
    } else {
      const currentFormula =
        levelFormulas[position] ||
        levels.find((l) => l.position === position)?.formula ||
        ''
      const newFormula = `${currentFormula}${variablePosition}`
      setLevelFormulas((prev) => ({ ...prev, [position]: newFormula }))
      updateExistingLevel(position, 'formula', newFormula)
    }
  }

  const handleInsertOperator = (
    position: number,
    operator: string,
    isNewRow = false
  ) => {
    if (isNewRow) {
      const currentValue =
        newRows.find((row) => row.position === position)?.formula || ''
      updateNewRow(position, 'formula', `${currentValue}${operator}`)
    } else {
      const currentFormula =
        levelFormulas[position] ||
        levels.find((l) => l.position === position)?.formula ||
        ''
      const newFormula = `${currentFormula}${operator}`
      setLevelFormulas((prev) => ({ ...prev, [position]: newFormula }))
      updateExistingLevel(position, 'formula', newFormula)
    }
  }

  const handleBackspace = (position: number, isNewRow = false) => {
    if (isNewRow) {
      const currentValue =
        newRows.find((row) => row.position === position)?.formula || ''
      updateNewRow(position, 'formula', currentValue.slice(0, -1))
    } else {
      const currentFormula =
        levelFormulas[position] ||
        levels.find((l) => l.position === position)?.formula ||
        ''
      const newFormula = currentFormula.slice(0, -1)
      setLevelFormulas((prev) => ({ ...prev, [position]: newFormula }))
      updateExistingLevel(position, 'formula', newFormula)
    }
  }

  const handleUpdate = async () => {
    const response = await editLevel(levels, token)
    if (response.error)
      toast({
        title: 'Error',
        description: response.error.message || 'Failed to update levels',
      })
    else toast({ title: 'Success', description: 'Levels updated successfully' })
  }

  const renderLevelRow = (level: LevelType, isNewRow = false) => (
    <TableRow
      key={`${isNewRow ? 'new' : 'existing'}-${level.position}`}
      className={isNewRow ? 'bg-blue-50 dark:bg-blue-950/20' : ''}
    >
      <TableCell>{level.position}</TableCell>
      <TableCell>
        <Checkbox
          checked={level.negative}
          onCheckedChange={(checked) =>
            isNewRow
              ? updateNewRow(level.position, 'negative', checked === true)
              : updateExistingLevel(
                  level.position,
                  'negative',
                  checked === true
                )
          }
        />
      </TableCell>
      <TableCell>
        <Input
          value={level.title}
          onChange={(e) =>
            isNewRow
              ? updateNewRow(level.position, 'title', e.target.value)
              : updateExistingLevel(level.position, 'title', e.target.value)
          }
          placeholder="Enter title"
          maxLength={45}
        />
      </TableCell>
      <TableCell>
        <Select
          value={level.type}
          onValueChange={(value) => {
            isNewRow
              ? updateNewRow(
                  level.position,
                  'type',
                  value as 'Calculated Field' | 'COA Group'
                )
              : updateExistingLevel(
                  level.position,
                  'type',
                  value as 'Calculated Field' | 'COA Group'
                )
            if (value === 'Calculated Field') setDisplayFormula('')
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
        <Select
          value={level.document}
          onValueChange={(value) =>
            isNewRow
              ? updateNewRow(
                  level.position,
                  'document',
                  value as 'Income Statement' | 'Trial Balance'
                )
              : updateExistingLevel(
                  level.position,
                  'document',
                  value as 'Income Statement' | 'Trial Balance'
                )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select document" />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPES.map((docType) => (
              <SelectItem key={docType.value} value={docType.value}>
                {docType.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        {level.type === 'Calculated Field' && (
          <div className="flex gap-2">
            <Input
              value={
                isNewRow
                  ? level.formula || ''
                  : convertFormulaToDisplay(
                      levelFormulas[level.position] || level.formula || '',
                      levels
                    )
              }
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
                      {getPreviousVariables(level.position).map((variable) => (
                        <Button
                          key={variable.id}
                          variant="outline"
                          size="sm"
                          className="justify-start bg-transparent"
                          onClick={() =>
                            handleInsertVariable(
                              level.position,
                              variable.position,
                              variable.displayValue,
                              isNewRow
                            )
                          }
                        >
                          {variable.name} ({variable.position})
                        </Button>
                      ))}
                      {getPreviousVariables(level.position).length === 0 && (
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
                          onClick={() =>
                            handleInsertOperator(
                              level.position,
                              op.symbol,
                              isNewRow
                            )
                          }
                        >
                          {op.symbol}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleBackspace(level.position, isNewRow)
                        }
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
        {level.type === 'COA Group' && (
          <Select
            value={level.COA_ID?.toString() || ''}
            onValueChange={(value) =>
              handleChartOfAccountSelect(level.position, value, isNewRow)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a chart of account">
                {level.COA_ID
                  ? getAccountNameById(level.COA_ID)
                  : 'Select a chart of account'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {getAvailableAccounts(level.position, isNewRow).map((account) => (
                <SelectItem
                  key={account.accountId}
                  value={account.accountId?.toString() ?? ''}
                >
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {!level.type && (
          <span className="text-red-500">
            Please select a type: Calculated Field or COA Group
          </span>
        )}
      </TableCell>
    </TableRow>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Level Management</h1>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Negative</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levels.map((level) => renderLevelRow(level, false))}
            {newRows.map((row) => renderLevelRow(row, true))}
          </TableBody>
        </Table>

        <div className="flex justify-end gap-2 mt-4">
          {levels.length > 0 && (
            <Button onClick={handleUpdate} variant="outline">
              Update Existing
            </Button>
          )}
          <Button onClick={addNewRow} variant="outline">
            Add Level
          </Button>
          {newRows.length > 0 && (
            <Button onClick={handleSave}>Save New Levels</Button>
          )}
        </div>
      </div>
    </div>
  )
}

// "use client"

// import { useCallback, useEffect, useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import type { AccountsHead, LevelType } from "@/utils/type"
// import { createLevel, editLevel, getAllLevel } from "@/api/level-api"
// import { toast } from "@/hooks/use-toast"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Plus, Backpack as Backspace } from "lucide-react"
// import { Checkbox } from "@/components/ui/checkbox"
// import { getAllChartOfAccounts } from "@/api/common-shared-api"
// import { tokenAtom, useInitializeUser } from "@/utils/user"
// import { useAtom } from "jotai"
// import { useRouter } from "next/navigation"

// // Define operators
// const OPERATORS = [
//   { symbol: "+", label: "Add" },
//   { symbol: "-", label: "Subtract" },
// ]

// // Add these utility functions
// function parseFormula(formula: string): string[] {
//   return formula.split(/(\d+|[-+])/).filter(Boolean)
// }

// export default function LevelEntry() {
//   //getting userData from jotai atom component
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)

//   const router = useRouter()

//   // State variables
//   const [accounts, setAccounts] = useState<AccountsHead[]>([])
//   const [levels, setLevels] = useState<LevelType[]>([])
//   const [displayFormula, setDisplayFormula] = useState<string>("")
//   const [levelFormulas, setLevelFormulas] = useState<{ [key: number]: string }>({})
//   const [newRows, setNewRows] = useState<LevelType[]>([])

//   function convertFormulaToDisplay(formula: string, levels: LevelType[]): string {
//     if (!formula) return ""
//     const parts = parseFormula(formula)
//     return parts
//       .map((part) => {
//         if (/^\d+$/.test(part)) {
//           const level = levels.find((l) => l.position === Number.parseInt(part, 10))
//           return level ? level.title || `l${level.position}` : part
//         }
//         return part
//       })
//       .join("")
//   }

//   const getNextPosition = () => {
//     const existingPositions = levels.map((l) => l.position)
//     const newRowPositions = newRows.map((r) => r.position)
//     const allPositions = [...existingPositions, ...newRowPositions]
//     return allPositions.length > 0 ? Math.max(...allPositions) + 1 : 1
//   }

//   const addNewRow = () => {
//     const newRow: LevelType = {
//       title: "",
//       type: undefined,
//       COA_ID: null,
//       position: getNextPosition(),
//       formula: "",
//       negative: false,
//       document: "Income Statement",
//     }
//     setNewRows([...newRows, newRow])
//   }

//   const updateNewRow = (position: number, field: keyof LevelType, value: string | number | boolean | null) => {
//     setNewRows(newRows.map((row) => (row.position === position ? { ...row, [field]: value } : row)))
//   }

//   const updateExistingLevel = (position: number, field: keyof LevelType, value: string | number | boolean | null) => {
//     setLevels(levels.map((level) => (level.position === position ? { ...level, [field]: value } : level)))
//   }

//   const handleSave = async () => {
//     if (newRows.length === 0) {
//       toast({
//         title: "No new levels to save",
//         description: "Please add some levels before saving",
//       })
//       return
//     }

//     const response = await createLevel(newRows, token)
//     if (response.error || !response.data) {
//       console.error("Error creating level", response.error)
//       toast({
//         title: "Error",
//         description: response.error?.message || "Error creating level",
//       })
//     } else {
//       toast({
//         title: "Success",
//         description: "New levels created successfully",
//       })
//       setNewRows([])
//       fetchLevels()
//     }
//   }

//   const fetchChartOfAccounts = useCallback(async () => {
//     if (!token) return
//     const fetchedAccounts = await getAllChartOfAccounts(token)
//     if (fetchedAccounts?.error?.status === 401) {
//       router.push("/unauthorized-access")
//       return
//     } else if (fetchedAccounts.error || !fetchedAccounts.data) {
//       console.error("Error getting chart of accounts:", fetchedAccounts.error)
//       toast({
//         title: "Error",
//         description: fetchedAccounts.error?.message || "Failed to get chart of accounts",
//       })
//     } else {
//       setAccounts(fetchedAccounts.data)
//     }
//   }, [token, router])

//   const fetchLevels = useCallback(async () => {
//     if (!token) return
//     const fetchLevels = await getAllLevel(token)
//     if (fetchLevels?.error?.status === 401) {
//       router.push("/unauthorized-access")
//       return
//     } else if (fetchLevels.error || !fetchLevels.data) {
//       console.error("Error getting chart of accounts:", fetchLevels.error)
//       toast({
//         title: "Error",
//         description: fetchLevels.error?.message || "Failed to get chart of accounts",
//       })
//     } else {
//       setLevels(fetchLevels.data)
//     }
//   }, [token, router])

//   useEffect(() => {
//     // const checkUserData = () => {
//     //   const storedUserData = localStorage.getItem("currentUser")
//     //   const storedToken = localStorage.getItem("authToken")

//     //   if (!storedUserData || !storedToken) {
//     //     router.push("/")
//     //     return
//     //   }
//     // }

//     // checkUserData()

//     fetchChartOfAccounts()
//     fetchLevels()
//   }, [fetchChartOfAccounts, fetchLevels, router])

//   const handleChartOfAccountSelect = (position: number, value: string, isNewRow = false) => {
//     const accountId = Number.parseInt(value, 10)
//     if (isNewRow) {
//       updateNewRow(position, "COA_ID", accountId)
//     } else {
//       updateExistingLevel(position, "COA_ID", accountId)
//     }
//   }

//   const getAccountNameById = (accountId: number) => {
//     const account = accounts.find((acc) => acc.accountId === accountId)
//     return account ? account.name : ""
//   }

//   const getAvailableAccounts = (currentPosition: number, isNewRow = false) => {
//     const existingSelectedAccounts = levels.filter((level) => level.COA_ID !== null).map((level) => level.COA_ID)

//     const newRowSelectedAccounts = newRows
//       .filter((row) => row.position !== currentPosition && row.COA_ID !== null)
//       .map((row) => row.COA_ID)

//     const allSelectedAccounts = [...existingSelectedAccounts, ...newRowSelectedAccounts]

//     return accounts.filter(
//       (account) =>
//         account.isGroup &&
//         (!allSelectedAccounts.includes(account.accountId) ||
//           (isNewRow
//             ? newRows.find((row) => row.position === currentPosition)?.COA_ID === account.accountId
//             : levels.find((level) => level.position === currentPosition)?.COA_ID === account.accountId)),
//     )
//   }

//   const getPreviousVariables = (currentPosition: number) => {
//     const existingLevels = levels
//       .filter((level) => level.position < currentPosition)
//       .map((level) => ({
//         name: level.title || `l${level.position}`,
//         id: level.position,
//         position: level.position,
//         displayValue: level.title || `l${level.position}`,
//       }))

//     const newRowVariables = newRows
//       .filter((row) => row.position < currentPosition)
//       .map((row) => ({
//         name: row.title || `l${row.position}`,
//         id: row.position,
//         position: row.position,
//         displayValue: row.title || `l${row.position}`,
//       }))

//     return [...existingLevels, ...newRowVariables].sort((a, b) => a.position - b.position)
//   }

//   const handleInsertVariable = (position: number, variablePosition: number, displayValue: string, isNewRow = false) => {
//     if (isNewRow) {
//       const currentValue = newRows.find((row) => row.position === position)?.formula || ""
//       updateNewRow(position, "formula", `${currentValue}${variablePosition}`)
//     } else {
//       const currentFormula = levelFormulas[position] || levels.find((l) => l.position === position)?.formula || ""
//       const newFormula = `${currentFormula}${variablePosition}`
//       setLevelFormulas((prev) => ({ ...prev, [position]: newFormula }))
//       updateExistingLevel(position, "formula", newFormula)
//     }
//   }

//   const handleInsertOperator = (position: number, operator: string, isNewRow = false) => {
//     if (isNewRow) {
//       const currentValue = newRows.find((row) => row.position === position)?.formula || ""
//       updateNewRow(position, "formula", `${currentValue}${operator}`)
//     } else {
//       const currentFormula = levelFormulas[position] || levels.find((l) => l.position === position)?.formula || ""
//       const newFormula = `${currentFormula}${operator}`
//       setLevelFormulas((prev) => ({ ...prev, [position]: newFormula }))
//       updateExistingLevel(position, "formula", newFormula)
//     }
//   }

//   const handleBackspace = (position: number, isNewRow = false) => {
//     if (isNewRow) {
//       const currentValue = newRows.find((row) => row.position === position)?.formula || ""
//       const newValue = currentValue.slice(0, -1)
//       updateNewRow(position, "formula", newValue)
//     } else {
//       const currentFormula = levelFormulas[position] || levels.find((l) => l.position === position)?.formula || ""
//       const newFormula = currentFormula.slice(0, -1)
//       setLevelFormulas((prev) => ({ ...prev, [position]: newFormula }))
//       updateExistingLevel(position, "formula", newFormula)
//     }
//   }

//   const handleUpdate = async () => {
//     const response = await editLevel(levels, token)
//     if (response.error) {
//       toast({
//         title: "Error",
//         description: response.error.message || "Failed to update levels",
//       })
//     } else {
//       toast({
//         title: "Success",
//         description: "Levels updated successfully",
//       })
//     }
//   }

//   const renderLevelRow = (level: LevelType, isNewRow = false) => (
//     <TableRow
//       key={`${isNewRow ? "new" : "existing"}-${level.position}`}
//       className={isNewRow ? "bg-blue-50 dark:bg-blue-950/20" : ""}
//     >
//       <TableCell>{level.position}</TableCell>
//       <TableCell>
//         <Checkbox
//           checked={level.negative}
//           onCheckedChange={(checked) =>
//             isNewRow
//               ? updateNewRow(level.position, "negative", checked === true)
//               : updateExistingLevel(level.position, "negative", checked === true)
//           }
//         />
//       </TableCell>
//       <TableCell>
//         <Input
//           value={level.title}
//           onChange={(e) =>
//             isNewRow
//               ? updateNewRow(level.position, "title", e.target.value)
//               : updateExistingLevel(level.position, "title", e.target.value)
//           }
//           placeholder="Enter title"
//           maxLength={45}
//         />
//       </TableCell>
//       <TableCell>
//         <Select
//           value={level.type}
//           onValueChange={(value) => {
//             if (isNewRow) {
//               updateNewRow(level.position, "type", value as "Calculated Field" | "COA Group")
//             } else {
//               updateExistingLevel(level.position, "type", value as "Calculated Field" | "COA Group")
//             }
//             if (value === "Calculated Field") {
//               setDisplayFormula("")
//             }
//           }}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select type" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="Calculated Field">Calculated Field</SelectItem>
//             <SelectItem value="COA Group">COA Group</SelectItem>
//           </SelectContent>
//         </Select>
//       </TableCell>
//       <TableCell>
//         {level.type === "Calculated Field" && (
//           <div className="flex gap-2">
//             <Input
//               value={
//                 isNewRow
//                   ? level.formula || ""
//                   : convertFormulaToDisplay(levelFormulas[level.position] || level.formula || "", levels)
//               }
//               placeholder="Use Insert button to add variables and operators"
//               maxLength={45}
//               readOnly
//             />
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button variant="outline" size="sm">
//                   <Plus className="h-4 w-4 mr-2" />
//                   Insert
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-80">
//                 <div className="space-y-4">
//                   <div>
//                     <h4 className="mb-2 font-medium">Variables</h4>
//                     <div className="grid gap-2">
//                       {getPreviousVariables(level.position).map((variable) => (
//                         <Button
//                           key={variable.id}
//                           variant="outline"
//                           size="sm"
//                           className="justify-start bg-transparent"
//                           onClick={() =>
//                             handleInsertVariable(level.position, variable.position, variable.displayValue, isNewRow)
//                           }
//                         >
//                           {variable.name} ({variable.position})
//                         </Button>
//                       ))}
//                       {getPreviousVariables(level.position).length === 0 && (
//                         <p className="text-sm text-muted-foreground">No variables available from previous levels</p>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <h4 className="mb-2 font-medium">Operators</h4>
//                     <div className="grid grid-cols-3 gap-2">
//                       {OPERATORS.map((op) => (
//                         <Button
//                           key={op.symbol}
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleInsertOperator(level.position, op.symbol, isNewRow)}
//                         >
//                           {op.symbol}
//                         </Button>
//                       ))}
//                       <Button variant="outline" size="sm" onClick={() => handleBackspace(level.position, isNewRow)}>
//                         <Backspace className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </PopoverContent>
//             </Popover>
//           </div>
//         )}
//         {level.type === "COA Group" && (
//           <Select
//             value={level.COA_ID?.toString() || ""}
//             onValueChange={(value) => handleChartOfAccountSelect(level.position, value, isNewRow)}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Select a chart of account">
//                 {level.COA_ID ? getAccountNameById(level.COA_ID) : "Select a chart of account"}
//               </SelectValue>
//             </SelectTrigger>
//             <SelectContent>
//               {getAvailableAccounts(level.position, isNewRow).map((account) => (
//                 <SelectItem key={account.accountId} value={account.accountId?.toString() ?? ""}>
//                   {account.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         )}
//         {!level.type && <span className="text-red-500">Please select a type: Calculated Field or COA Group</span>}
//       </TableCell>
//     </TableRow>
//   )

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">Level Management</h1>
//       </div>

//       <div>
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Position</TableHead>
//               <TableHead>Negative</TableHead>
//               <TableHead>Title</TableHead>
//               <TableHead>Type</TableHead>
//               <TableHead>Value</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {levels.map((level) => renderLevelRow(level, false))}

//             {newRows.map((row) => renderLevelRow(row, true))}
//           </TableBody>
//         </Table>

//         <div className="flex justify-end gap-2 mt-4">
//           {levels.length > 0 && (
//             <Button onClick={handleUpdate} variant="outline">
//               Update Existing
//             </Button>
//           )}
//           <Button onClick={addNewRow} variant="outline">
//             Add Level
//           </Button>
//           {newRows.length > 0 && <Button onClick={handleSave}>Save New Levels</Button>}
//         </div>
//       </div>
//     </div>
//   )
// }
