'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'
import { CustomCombobox } from '@/utils/custom-combobox'
import { createBudgetMaster, createBudgetDetails } from '@/api/budget-api'
import { Checkbox } from '@/components/ui/checkbox'
import type { AccountsHead } from '@/utils/type'
import { CompanyType } from '@/api/company-api'
import { getAllChartOfAccounts } from '@/api/common-shared-api'

interface BudgetLine {
  id: number
  budgetId: number
  accountId: number
  amount?: number | null
  createdBy?: number | null
}

interface CreateBudgetFormProps {
  token: string
  refreshBudgetList: () => void
  company: CompanyType[]
}

const CreateBudgetForm: React.FC<CreateBudgetFormProps> = ({
  token,
  refreshBudgetList,
  company,
}) => {
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([
    {
      id: Math.floor(Math.random() * 1000000),
      budgetId: 0,
      accountId: 0,
      amount: 0,
    },
  ])
  const [accounts, setAccounts] = useState<AccountsHead[]>([])
  const [budgetType, setBudgetType] = useState<string>('both')
  const [budgetName, setBudgetName] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [isActive, setIsActive] = useState<boolean>(true)
  const [isLocked, setIsLocked] = useState<boolean>(false)

  useEffect(() => {
    async function fetchAccounts() {
      const response = await getAllChartOfAccounts(token)
      if (response.error) {
        console.error('Error fetching accounts:', response.error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch chart of accounts',
        })
      } else {
        setAccounts(response.data ?? [])
      }
    }
    fetchAccounts()
  }, [token])

  const addBudgetLine = () => {
    setBudgetLines([
      ...budgetLines,
      {
        id: Math.floor(Math.random() * 1000000),
        budgetId: 0,
        accountId: 0,
        amount: null,
      },
    ])
  }

  const updateBudgetLine = (
    id: number,
    field: 'accountId' | 'amount' | 'actual',
    value: number | string | null
  ) => {
    setBudgetLines(
      budgetLines.map((line) =>
        line.id === id ? { ...line, [field]: value } : line
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate each budget line
    for (const line of budgetLines) {
      if (
        line.accountId === 0 ||
        line.amount === null ||
        line.amount === undefined
      ) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description:
            'Please select an account and enter a budgeted amount for each line.',
        })
        return
      }
    }

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      toast({
        variant: 'destructive',
        title: 'Date Error',
        description: 'Start date cannot be after the end date.',
      })
      return
    }

    try {
      // 1. Create the master budget.
      const masterPayload = {
        budgetName,
        companyId: parseInt(companyId),
        fromDate: startDate,
        toDate: endDate,
        active: isActive,
        locked: isLocked,
        createdBy: 1,
      }

      const masterResponse = await createBudgetMaster({ token }, masterPayload)
      if (masterResponse.error || !masterResponse.data) {
        throw new Error(
          masterResponse.error?.message || 'Failed to create master budget'
        )
      }

      // Check if the API nests the actual data under a "data" property
      const masterData = masterResponse.data || masterResponse
      // Try both keys: "id" or "budgetId"
      const budgetId = masterData.id
      

      if (!budgetId) {
        throw new Error('Budget ID is undefined in the master response')
      }

      // 2. Prepare details payload including the master budgetId.
      const detailsPayload = budgetLines.map((line) => ({
        budgetId,
        accountId: line.accountId,
        amount: parseFloat(line.amount?.toString() || '0'),
        // actual: line.actual ? parseFloat(line.actual.toString()) : null,
        createdBy: 1,
      }))

      

      // 3. Create budget details.
      const detailsResponse = await createBudgetDetails(
        { token },
        detailsPayload
      )
      if (detailsResponse.error) {
        throw new Error(
          detailsResponse.error.message || 'Failed to create budget details'
        )
      }

      toast({
        title: 'Success',
        description: 'Budget created successfully',
      })
      refreshBudgetList()
    } catch (error: any) {
      console.error('Error creating budget:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create budget',
      })
    }
  }

  const [companyId, setCompanyId] = useState<string>(
    company[0].companyId?.toString() ?? ''
  )

  const handleCompanyIdChange = (id: string): void => {
    setCompanyId(id)
    setBudgetLines(
      budgetLines.map((line) => ({
        ...line,
        companyId: parseInt(id),
      }))
    )
  }

  return (
    <Card className="shadow-lg border-2 max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle>Create Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budgetName">Budget Name</Label>
              <Input
                id="budgetName"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <CustomCombobox
                items={company.map((companies) => ({
                  id: company[0].companyId?.toString() ?? '',
                  name: companies.companyName,
                }))}
                value={
                  company
                    ? {
                        id: company[0].companyId?.toString() ?? '',
                        name: company[0].companyName,
                      }
                    : null
                }
                onChange={(value: { id: string; name: string } | null) =>
                  setCompanyId(value ? value.id : '')
                }
              />{' '}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isLocked"
                checked={isLocked}
                onCheckedChange={(checked) => setIsLocked(checked)}
              />
              <Label htmlFor="isLocked">Locked</Label>
            </div>
          </div>
          <div>
            <Label>Budget Type</Label>
            <CustomCombobox
              items={['expense', 'income', 'both'].map((type) => ({
                id: type,
                name: type.charAt(0).toUpperCase() + type.slice(1),
              }))}
              value={
                budgetType
                  ? {
                      id: budgetType,
                      name:
                        budgetType.charAt(0).toUpperCase() +
                        budgetType.slice(1),
                    }
                  : null
              }
              onChange={(value: { id: string; name: string } | null) =>
                setBudgetType(value ? value.id : 'both')
              }
              placeholder="Select budget type"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Head</TableHead>
                <TableHead className="text-right">Budgeted Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgetLines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <CustomCombobox
                      items={accounts
                        .filter((account) => {
                          return (
                            (line.accountId !== 0 &&
                              account.accountId === line.accountId) ||
                            budgetType.toLowerCase() === 'both' ||
                            account.accountType.toLowerCase() ===
                              budgetType.toLowerCase()
                          )
                        })
                        .map((account) => ({
                          id: account.accountId.toString(),
                          name: account.name,
                        }))}
                      value={
                        line.accountId !== 0
                          ? {
                              id: line.accountId.toString(),
                              name:
                                accounts.find(
                                  (account) =>
                                    account.accountId === line.accountId
                                )?.name || 'Unnamed Account Head',
                            }
                          : null
                      }
                      onChange={(value: { id: string; name: string } | null) =>
                        updateBudgetLine(
                          line.id,
                          'accountId',
                          value ? parseInt(value.id) : 0
                        )
                      }
                      placeholder="Select account head"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={line.amount ?? ''}
                      onChange={(e) =>
                        updateBudgetLine(line.id, 'amount', e.target.value)
                      }
                      className="w-full text-right"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button type="button" variant="outline" onClick={addBudgetLine}>
            Add Budget Line
          </Button>
          <Button className="ml-2" type="submit">
            Final Posting
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default CreateBudgetForm
