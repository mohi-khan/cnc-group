

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { CustomCombobox } from "@/utils/custom-combobox"
import { getAllCoa, createBudgetMaster, createBudgetDetails } from "@/api/budget-api"
import type { AccountsHead } from "@/utils/type"
import { Checkbox } from "@/components/ui/checkbox"

interface BudgetLine {
  id: string
  accountId: number
  accounthead: string
  amount: string
  actual: string
}

const CreateBudgetForm: React.FC = () => {
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([
    { id: Math.random().toString(36).substr(2, 9), accountId: 0, accounthead: "", amount: "", actual: "" },
  ])
  const [accounts, setAccounts] = useState<AccountsHead[]>([])
  const [budgetType, setBudgetType] = useState<string>("both")
  const [budgetName, setBudgetName] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [isActive, setIsActive] = useState<boolean>(true)

  useEffect(() => {
    async function fetchCoaAccounts() {
      const response = await getAllCoa()
      if (response.error) {
        console.error("Error fetching chart of accounts:", response.error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch chart of accounts",
        })
      } else {
        setAccounts(response.data ?? [])
      }
    }

    fetchCoaAccounts()
  }, [])

  const addBudgetLine = () => {
    setBudgetLines([
      ...budgetLines,
      { id: Math.random().toString(36).substr(2, 9), accountId: 0, accounthead: "", amount: "", actual: "" },
    ])
  }

  const updateBudgetLine = (id: string, field: "accounthead" | "amount" | "actual", value: string) => {
    setBudgetLines(budgetLines.map((line) => (line.id === id ? { ...line, [field]: value } : line)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Create budget master
      const budgetMasterResponse = await createBudgetMaster({
        budgetName,
        fromDate: startDate,
        toDate: endDate,
        active: isActive, // This should now correctly use the isActive state
        createdBy: 1, // Assuming a default user ID, replace with actual user ID
      })

      if (budgetMasterResponse.error || !budgetMasterResponse.data) {
        throw new Error(budgetMasterResponse.error?.message || 'Failed to create budget master')
      }

      const budgetId = budgetMasterResponse.data.id

      // Create budget details
      const budgetDetailsData = budgetLines.map((line) => ({
        id: line.id,
        budgetId,
        accountId: Number.parseInt(line.accounthead),
        amount: Number.parseFloat(line.amount),
        actual: line.actual ? Number.parseFloat(line.actual) : null,
        createdBy: 1, // Assuming a default user ID, replace with actual user ID
      }))

      const budgetDetailsResponse = await createBudgetDetails(budgetDetailsData)

      if (budgetDetailsResponse.error) {
        throw new Error(budgetDetailsResponse.error.message || 'Failed to create budget details')
      }

      toast({
        title: "Success",
        description: "Budget created successfully",
      })
    } catch (error) {
      console.error("Error creating budget:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create budget",
      })
    }
  }

  return (
    <Card className="shadow-lg border-2 max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle>Create Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="budgetName">Budget Name</Label>
            <Input id="budgetName" value={budgetName} onChange={(e) => setBudgetName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <div>
            <Label>Budget Type</Label>
            <CustomCombobox
              items={["expense", "income", "both"].map((type) => ({
                id: type,
                name: type.charAt(0).toUpperCase() + type.slice(1),
              }))}
              value={
                budgetType ? { id: budgetType, name: budgetType.charAt(0).toUpperCase() + budgetType.slice(1) } : null
              }
              onChange={(value: { id: string; name: string } | null) => setBudgetType(value ? value.id : "both")}
              placeholder="Select budget type"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Head</TableHead>
                <TableHead className="text-right">Budgeted Amount</TableHead>
                <TableHead className="text-right">Actual</TableHead>
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
                            account.accountId.toString() === line.accounthead ||
                            budgetType.toLowerCase() === "both" ||
                            account.accountType.toLowerCase() === budgetType.toLowerCase()
                          )
                        })
                        .map((account) => ({
                          id: account.accountId.toString(),
                          name: account.name,
                        }))}
                      value={
                        line.accounthead
                          ? {
                              id: line.accounthead,
                              name:
                                accounts.find((account) => account.accountId.toString() === line.accounthead)?.name ||
                                "Unnamed Account Head",
                            }
                          : null
                      }
                      onChange={(value: { id: string; name: string } | null) =>
                        updateBudgetLine(line.id, "accounthead", value ? value.id : "")
                      }
                      placeholder="Select account head"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={line.amount}
                      onChange={(e) => updateBudgetLine(line.id, "amount", e.target.value)}
                      className="w-full text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={line.actual}
                      onChange={(e) => updateBudgetLine(line.id, "actual", e.target.value)}
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
          <Button type="submit">Create Budget</Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default CreateBudgetForm


