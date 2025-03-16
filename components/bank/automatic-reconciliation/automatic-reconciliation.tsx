"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { Check, Edit, RefreshCw } from "lucide-react"
import { CustomCombobox } from "@/utils/custom-combobox"
import type { BankAccount, BankReconciliationType } from "@/utils/type"
import {
  getAllBankAccounts,
  getBankReconciliations,
  updateBankReconciliation,
  getAutomaticReconciliationMatches,
  applyAutomaticReconciliation,
} from "@/api/bank-reconciliation-api"

export default function AutomaticReconciliation() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null)
  const [reconciliations, setReconciliations] = useState<BankReconciliationType[]>([])
  const [automaticMatches, setAutomaticMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [processingMatches, setProcessingMatches] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const { toast } = useToast()

  const form = useForm({
    defaultValues: {
      bankAccount: "",
      fromDate: "",
      toDate: "",
    },
  })

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        setLoading(true)
        const accounts = await getAllBankAccounts()
        if (accounts.data) {
          setBankAccounts(accounts.data)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch bank accounts",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchBankAccounts()
  }, [toast])

  const fetchData = async (data: {
    bankAccount: string
    fromDate: string
    toDate: string
  }) => {
    if (data.bankAccount && data.fromDate && data.toDate) {
      try {
        setLoading(true)

        // Fetch regular reconciliations
        const reconciliationResponse = await getBankReconciliations(
          Number.parseInt(data.bankAccount),
          data.fromDate,
          data.toDate,
        )
        setReconciliations(reconciliationResponse.data || [])

        // Fetch automatic reconciliation matches
        const matchesResponse = await getAutomaticReconciliationMatches(
          Number.parseInt(data.bankAccount),
          data.fromDate,
          data.toDate,
        )
        setAutomaticMatches(matchesResponse.data || [])
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    } else {
      setReconciliations([])
      setAutomaticMatches([])
    }
  }

  const handleReconciliationUpdate = async (id: number, reconciled: number, comments: string) => {
    try {
      setLoading(true)
      await updateBankReconciliation(id, reconciled, comments)

      setReconciliations((prevReconciliations) =>
        prevReconciliations.map((r) => (r.id === id ? { ...r, reconciled, comments } : r)),
      )
      setEditingId(null)
      toast({
        title: "Success",
        description: "Reconciliation updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reconciliation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateLocalReconciliation = (id: number, field: "reconciled" | "comments", value: any) => {
    setReconciliations((prevReconciliations) =>
      prevReconciliations.map((r) =>
        r.id === id
          ? {
              ...r,
              [field]: field === "reconciled" ? (value ? 1 : 0) : value,
            }
          : r,
      ),
    )
  }

  const toggleEditMode = (id: number) => {
    setEditingId(id === editingId ? null : id)
  }

  const handleApplyAutomaticReconciliation = async () => {
    if (!selectedBankAccount) return

    try {
      setProcessingMatches(true)
      const response = await applyAutomaticReconciliation(
        selectedBankAccount.id,
        form.getValues().fromDate,
        form.getValues().toDate,
      )

      if (response.success) {
        toast({
          title: "Success",
          description: `${response.data.count || 0} transactions automatically reconciled`,
        })

        // Refresh data after applying automatic reconciliation
        await fetchData(form.getValues())
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply automatic reconciliation",
        variant: "destructive",
      })
    } finally {
      setProcessingMatches(false)
    }
  }

  return (
    <div className="w-[98%] mx-auto p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(fetchData)} className="mb-6">
          <div className="flex justify-between items-end mb-4 gap-4 w-fit mx-auto">
            <FormField
              control={form.control}
              name="fromDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Date</FormLabel>
                  <Input type="date" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="toDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Date</FormLabel>
                  <Input type="date" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankAccount"
              render={({ field }) => (
                <FormItem className="w-1/3">
                  <FormLabel>Bank Account</FormLabel>
                  <CustomCombobox
                    items={bankAccounts.map((account) => ({
                      id: account.id.toString(),
                      name: `${account.bankName} - ${account.accountName} - ${account.accountNumber}`,
                    }))}
                    value={
                      selectedBankAccount
                        ? {
                            id: selectedBankAccount.id.toString(),
                            name: `${selectedBankAccount.bankName} - ${selectedBankAccount.accountName} - ${selectedBankAccount.accountNumber}`,
                          }
                        : null
                    }
                    onChange={(value) => {
                      if (!value) {
                        setSelectedBankAccount(null)
                        field.onChange(null)
                        return
                      }
                      const selected = bankAccounts.find((account) => account.id.toString() === value.id)
                      setSelectedBankAccount(selected || null)
                      field.onChange(value.id)
                    }}
                    placeholder="Select bank account"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={!form.formState.isValid}>
              Show
            </Button>
          </div>
        </form>
      </Form>

      <Tabs defaultValue="automatic" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="automatic">Automatic Matches</TabsTrigger>
          <TabsTrigger value="manual">Manual Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="automatic">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Automatic Reconciliation Matches</CardTitle>
              <Button
                onClick={handleApplyAutomaticReconciliation}
                disabled={processingMatches || automaticMatches.length === 0}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${processingMatches ? "animate-spin" : ""}`} />
                Apply Automatic Reconciliation
              </Button>
            </CardHeader>
            <CardContent>
              <Table className="shadow-md border">
                <TableHeader className="bg-slate-200 shadow-md">
                  <TableRow>
                    <TableHead>Bank Transaction</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Matching Voucher</TableHead>
                    <TableHead>Voucher Amount</TableHead>
                    <TableHead>Voucher Date</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : automaticMatches.length > 0 ? (
                    automaticMatches.map((match, index) => (
                      <TableRow key={index}>
                        <TableCell>{match.bankTransactionId}</TableCell>
                        <TableCell>{match.bankAmount}</TableCell>
                        <TableCell>{match.bankDate}</TableCell>
                        <TableCell>{match.voucherId}</TableCell>
                        <TableCell>{match.voucherAmount}</TableCell>
                        <TableCell>{match.voucherDate}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              match.confidence > 0.8
                                ? "bg-green-100 text-green-800"
                                : match.confidence > 0.5
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {Math.round(match.confidence * 100)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No automatic matches found. Please select a bank account and date range, then click &quot;Show&quot;
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual Reconciliation</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="shadow-md border">
                <TableHeader className="bg-slate-200 shadow-md">
                  <TableRow>
                    <TableHead>Voucher ID</TableHead>
                    <TableHead>Check No</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reconciled</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : selectedBankAccount && reconciliations.length > 0 ? (
                    reconciliations.map((reconciliation) => (
                      <TableRow key={reconciliation.id}>
                        <TableCell>{reconciliation.voucherId}</TableCell>
                        <TableCell>{reconciliation.checkNo}</TableCell>
                        <TableCell>{reconciliation.amount}</TableCell>
                        <TableCell>{reconciliation.type}</TableCell>
                        <TableCell>
                          {editingId === reconciliation.id ? (
                            <Checkbox
                              checked={reconciliation.reconciled === 1}
                              onCheckedChange={(checked) =>
                                updateLocalReconciliation(reconciliation.id, "reconciled", checked ? 1 : 0)
                              }
                            />
                          ) : reconciliation.reconciled === 1 ? (
                            "Yes"
                          ) : (
                            "No"
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === reconciliation.id ? (
                            <Input
                              value={reconciliation.comments || ""}
                              onChange={(e) => updateLocalReconciliation(reconciliation.id, "comments", e.target.value)}
                            />
                          ) : (
                            reconciliation.comments || ""
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === reconciliation.id ? (
                            <Button
                              type="button"
                              onClick={() =>
                                handleReconciliationUpdate(
                                  reconciliation.id,
                                  reconciliation.reconciled ?? 0,
                                  reconciliation.comments || "",
                                )
                              }
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button type="button" onClick={() => toggleEditMode(reconciliation.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Please select a bank account and date range, then click "Show"
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

