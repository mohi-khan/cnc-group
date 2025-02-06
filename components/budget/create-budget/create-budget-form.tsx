// import React from 'react'

// const CreateBudgetForm = () => {
//   return <div>CreateBudgetForm</div>
// }

// export default CreateBudgetForm

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

interface BudgetLine {
  id: string
  project: string
  budgeted: string
}

const CreateBudgetForm = () => {
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([
    { id: '1', project: 'MyBudget', budgeted: '10,000.00' },
  ])

  const addBudgetLine = () => {
    const newLine: BudgetLine = {
      id: Math.random().toString(36).substr(2, 9),
      project: '',
      budgeted: '',
    }
    setBudgetLines([...budgetLines, newLine])
  }

  const updateBudgetLine = (
    id: string,
    field: 'project' | 'budgeted',
    value: string
  ) => {
    setBudgetLines(
      budgetLines.map((line) =>
        line.id === id ? { ...line, [field]: value } : line
      )
    )
  }

  const total = budgetLines.reduce((sum, line) => {
    const amount = Number.parseFloat(line.budgeted.replace(/,/g, '')) || 0
    return sum + amount
  }, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="space-y-4">
            <div>
              <Label htmlFor="budgetName">Budget Name</Label>
              <Input
                id="budgetName"
                placeholder="e.g. Budget 2023"
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Budget Type</Label>
                <Select defaultValue="expense">
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Period</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input type="date" defaultValue="2025-02-01" />
                  <span>→</span>
                  <Input type="date" defaultValue="2025-06-30" />
                </div>
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="font-medium">Budget Lines</h3>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Head</TableHead>
                <TableHead className="text-right">Budgeted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgetLines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <Input
                      value={line.project}
                      onChange={(e) =>
                        updateBudgetLine(line.id, 'project', e.target.value)
                      }
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      value={line.budgeted}
                      onChange={(e) =>
                        updateBudgetLine(line.id, 'budgeted', e.target.value)
                      }
                      className="w-full text-right"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button
            variant="outline"
            className="text-primary"
            onClick={addBudgetLine}
          >
            Add a line
          </Button>

          <div className="flex justify-end border-t pt-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-lg font-medium">
                {total.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CreateBudgetForm
