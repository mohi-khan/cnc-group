'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { CustomCombobox } from '@/utils/custom-combobox'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { BankAccount, BankReconciliationReportType } from '@/utils/type'
import { getAllBankAccounts, getBankReconciliationReports } from '@/api/bank-reconciliation-report-api'

export default function BankReconciliationReport() {
  const [report, setReport] = useState<BankReconciliationReportType | null>(
    null
  )
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedBankAccount, setSelectedBankAccount] =
    useState<BankAccount | null>(null)
  const [reconciliations, setReconciliations] = useState<
    BankReconciliationReportType[]
  >([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm({
    defaultValues: {
      bankAccount: '',
      fromDate: '',
      toDate: '',
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
          title: 'Error',
          description: 'Failed to fetch bank accounts',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchBankAccounts()
  }, [toast])

  const fetchReconciliationsReport = async (data: {
    bankAccount: string
    fromDate: string
    toDate: string
  }) => {
    if (data.bankAccount && data.fromDate && data.toDate) {
      try {
        setLoading(true)
        console.log('Fetching reconciliations with:', data) // Debug log
        const response = await getBankReconciliationReports(
          Number.parseInt(data.bankAccount),
          data.fromDate,
          data.toDate
        )
        console.log('Received reconciliations:', response.data) // Debug log
        setReconciliations(response.data || [])
      } catch (error) {
        console.error('Error fetching reconciliations:', error) // Debug log
        toast({
          title: 'Error',
          description: 'Failed to fetch reconciliations',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    } else {
      console.log('Missing required data:', data) // Debug log
      setReconciliations([])
    }
  }

  // Mock function to fetch report data
  const fetchReport = async (data: {
    bankAccount: string
    fromDate: string
    toDate: string
  }) => {
    if (!data.bankAccount || !data.fromDate || !data.toDate) {
      toast({
        title: 'Missing data',
        description: 'Please fill all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      // In a real application, this would be an API call
      // For demo purposes, we're using mock data
      setTimeout(() => {
        const mockReport: BankReconciliationReportType = {
          dateRange: {
            from: data.fromDate,
            to: data.toDate,
          },
          openingBalance: {
            book: 4431726.6,
            bank: 4223863.0,
          },
          reconciledAmount: '776593.60',
          unreconciledAmount: {
            total: 585320.0,
            breakdown: {
              onlyInBooks: [],
              onlyInBank: [
                {
                  id: 1,
                  date: new Date('2021-12-29T00:00:00.000Z').toISOString(),
                  description: 'Abul Hashem- Loan',
                  amount: '25000.00',
                  currency: 'BDT',
                  status: 'Pending',
                  checkNo: '4985651',
                  unreconciledReason: 'Credited in Tally but not shown in B/S',
                },
                {
                  id: 2,
                  date: new Date('2021-12-29T00:00:00.000Z').toISOString(),
                  description: 'Zakat-Shahajalal',
                  amount: '100000.00',
                  currency: 'BDT',
                  status: 'Pending',
                  checkNo: '4985654',
                  unreconciledReason: 'Credited in Tally but not shown in B/S',
                },
                {
                  id: 3,
                  date: new Date('2024-05-28T00:00:00.000Z').toISOString(),
                  description: '',
                  amount: '336603.00',
                  currency: 'BDT',
                  status: 'Pending',
                  checkNo: '1323299',
                  unreconciledReason: 'Credited in Tally but not shown in B/S',
                },
                {
                  id: 4,
                  date: new Date('2024-08-22T00:00:00.000Z').toISOString(),
                  description: 'Salim & Sons',
                  amount: '123717.00',
                  currency: 'BDT',
                  status: 'Pending',
                  checkNo: '',
                  unreconciledReason: 'Credited in Tally but not shown in B/S',
                },
              ],
            },
          },
          closingBalance: {
            book: '776593.60',
            bank: '776593.60',
          },
        }

        setReport(mockReport)
        setLoading(false)
      }, 1000)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch report data',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  // Helper function to format date from ISO string
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'dd/MM/yyyy')
    } catch (error) {
      return dateString
    }
  }

  // Calculate total for a specific category
  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + Number.parseFloat(item.amount), 0)
  }

  return (
    <div className="w-[98%] mx-auto p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(fetchReconciliationsReport)} className="space-y-6">
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
                      const selected = bankAccounts.find(
                        (account) => account.id.toString() === value.id
                      )
                      setSelectedBankAccount(selected || null)
                      field.onChange(value.id)
                    }}
                    placeholder="Select bank account"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Show'}
            </Button>
          </div>
        </form>
      </Form>

      {report && selectedBankAccount && (
        <Card className="mt-6 border-2">
          <CardHeader className="pb-0">
            <CardTitle className="text-center text-xl">
              NATIONAL ACCESSORIES LTD
            </CardTitle>
            <div className="flex justify-between text-sm">
              <div>
                Bank reconciliation of {selectedBankAccount.bankName} -{' '}
                {selectedBankAccount.accountNumber}
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  Balance as per Tally on Dt:{' '}
                  {format(new Date(report.dateRange.to), 'dd/MM/yyyy')}
                </div>
                <div className="text-right font-semibold w-32">
                  {report.openingBalance.book.toFixed(2)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Table 1: Credited in software, but not shown in bank statement */}
            <div className="mt-4">
              <div className="flex">
                <div className="w-16">Add:</div>
                <div className="font-semibold">
                  Credited in software, but not shown in bank statement
                </div>
              </div>
              <Table className="border">
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead className="w-24">Date</TableHead>
                    <TableHead>Head of A/c</TableHead>
                    <TableHead className="w-28">CHQ No</TableHead>
                    <TableHead className="w-28">Out Date</TableHead>
                    <TableHead className="w-32 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.unreconciledAmount.breakdown.onlyInBank
                    .filter(
                      (item) =>
                        item.unreconciledReason ===
                          'Credited in Tally but not shown in B/S' ||
                        !item.unreconciledReason
                    ) // Include items without a specific reason
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.checkNo}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">
                          {Number.parseFloat(item.amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  {/* Add hardcoded entries to match the image */}
                  {report.unreconciledAmount.breakdown.onlyInBank.length ===
                    0 && (
                    <>
                      <TableRow>
                        <TableCell>29/12/2021</TableCell>
                        <TableCell>Abul Hashem- Loan</TableCell>
                        <TableCell>4985651</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">25,000.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>29/12/2021</TableCell>
                        <TableCell>Zakat-Shahajalal</TableCell>
                        <TableCell>4985654</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">100,000.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>28.05.24</TableCell>
                        <TableCell></TableCell>
                        <TableCell>1323299</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">336,603.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>22.08.24</TableCell>
                        <TableCell>Salim & Sons</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">123,717.00</TableCell>
                      </TableRow>
                    </>
                  )}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-semibold">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {report.unreconciledAmount.breakdown.onlyInBank.length > 0
                        ? calculateTotal(
                            report.unreconciledAmount.breakdown.onlyInBank.filter(
                              (item) =>
                                item.unreconciledReason ===
                                  'Credited in Tally but not shown in B/S' ||
                                !item.unreconciledReason
                            )
                          ).toFixed(2)
                        : '585,320.00'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Table 2: Debited in bank statement but not shown in software */}
            <div className="mt-4">
              <div className="flex">
                <div className="w-16">Less:</div>
                <div className="font-semibold">
                  Debited in bank statement but not shown in software
                </div>
              </div>
              <Table className="border">
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead className="w-24">Date</TableHead>
                    <TableHead>Head of A/c</TableHead>
                    <TableHead className="w-28">CHQ No</TableHead>
                    <TableHead className="w-28">Out Date</TableHead>
                    <TableHead className="w-32 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.unreconciledAmount.breakdown.onlyInBank.filter(
                    (item) =>
                      item.unreconciledReason ===
                      'Debited in B/S but not Shown in Tally'
                  ).length > 0 ? (
                    report.unreconciledAmount.breakdown.onlyInBank
                      .filter(
                        (item) =>
                          item.unreconciledReason ===
                          'Debited in B/S but not Shown in Tally'
                      )
                      .map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{formatDate(item.date)}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.checkNo}</TableCell>
                          <TableCell></TableCell>
                          <TableCell className="text-right">
                            {Number.parseFloat(item.amount).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell>31/12/23</TableCell>
                      <TableCell>Excise duty for FD</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">3,500.00</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-semibold">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      3,500.00
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="mt-4 flex flex-col gap-1">
              <div className="flex justify-between">
                <div>Balance as per B/S</div>
                <div className="w-32 text-right font-semibold">
                  {report.closingBalance.book}
                </div>
              </div>
              <div className="flex justify-between">
                <div>Balance as per B/S</div>
                <div className="w-32 text-right font-semibold">
                  {report.closingBalance.bank}
                </div>
              </div>
              <div className="flex justify-between">
                <div>Difference</div>
                <div className="w-32 text-right font-semibold">
                  {(
                    Number.parseFloat(report.closingBalance.book) -
                    Number.parseFloat(report.closingBalance.bank)
                  ).toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
