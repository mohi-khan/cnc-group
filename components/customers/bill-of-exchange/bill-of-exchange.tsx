'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  JournalEntryWithDetailsSchema,
  type BoeGet,
  type JournalEntryWithDetails,
  type FormStateType,
} from '@/utils/type'
import { getAllBillOfExchange } from '@/api/bill-of-exchange-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import React, { useCallback, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { AlertDialogHeader } from '@/components/ui/alert-dialog'
import { Form } from '@/components/ui/form'
import { formatCurrency } from '@/utils/format'
import { toast } from '@/hooks/use-toast'
import {
  getAllBankAccounts,
  getAllChartOfAccounts,
  getAllCostCenters,
  getAllDepartments,
  getResPartnersBySearch,
} from '@/api/common-shared-api'
import { createJournalEntryWithDetails } from '@/api/vouchers-api'
import { useRouter } from 'next/navigation'
import BoeReceiptForm from './boe-receipt-form'
import { getSettings } from '@/api/shared-api'
import { getAllCurrency, getCurrency } from '@/api/currency-api'

// ✅ Corrected Date Formatting Function
const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return 'N/A'
  const parsedDate = typeof date === 'string' ? new Date(date) : date
  if (isNaN(parsedDate.getTime())) return 'Invalid Date'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsedDate)
}

// Helper function to determine the status
const getBoeStatus = (boe: BoeGet): string => {
  const hasSubDate = !!boe.boeSubDate
  const hasRecDate = !!boe.boeRecDate
  const hasNegotiationDate = !!boe.negotiationDate
  const hasMaturityDate = !!boe.maturityDate

  if (hasSubDate && hasRecDate && hasNegotiationDate && hasMaturityDate) {
    return 'Matured'
  } else if (hasSubDate && hasRecDate && hasNegotiationDate) {
    return 'Negotiated'
  } else if (hasSubDate && hasRecDate) {
    return 'Received'
  } else if (hasSubDate) {
    return 'Submitted'
  } else {
    return 'Created'
  }
}

const BillOfExchange = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const [userData] = useAtom(userDataAtom)
  const [data, setData] = useState<BoeGet[]>([])
  const [selectedBoe, setSelectedBoe] = useState<BoeGet | null>(null)
  const [originalBoeAmount, setOriginalBoeAmount] = useState<number>(0)
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state for Bank Voucher
  const [formState, setFormState] = useState<FormStateType>({
    companies: [],
    locations: [],
    bankAccounts: [],
    chartOfAccounts: [],
    filteredChartOfAccounts: [],
    costCenters: [],
    partners: [],
    departments: [],
    selectedBankAccount: null,
    formType: 'Credit',
    status: 'Draft',
  })

  const router = useRouter()

  const fetchData = useCallback(async () => {
    try {
      const result = await getAllBillOfExchange(token)
      const fetchedData = result.data ? result.data : []
      setData(fetchedData)
      console.log('Fetched Bill of Exchange data:', result.data || [])
    } catch (err) {
      console.error('Failed to fetch Bill of Exchange data:', err)
      setError('Failed to load data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchData()
  }, [fetchData, token])

  // Fetch initial data for bank voucher form (similar to InvoicesList)
  React.useEffect(() => {
    const fetchInitialData = async () => {
      const search = ''
      if (!token) return

      const [
        bankAccountsResponse,
        chartOfAccountsResponse,
        costCentersResponse,
        partnersResponse,
        departmentsResponse,
      ] = await Promise.all([
        getAllBankAccounts(token),
        getAllChartOfAccounts(token),
        getAllCostCenters(token),
        getResPartnersBySearch(search, token),
        getAllDepartments(token),
      ])

      if (
        bankAccountsResponse?.error?.status === 441 ||
        chartOfAccountsResponse?.error?.status === 441 ||
        costCentersResponse?.error?.status === 441 ||
        partnersResponse?.error?.status === 441 ||
        departmentsResponse?.error?.status === 441
      ) {
        router.push('/unauthorized-access')
        return
      }

      const filteredCoa = chartOfAccountsResponse.data?.filter((account) => {
        return account.isGroup === false
      })

      setFormState((prevState) => ({
        ...prevState,
        bankAccounts: bankAccountsResponse.data || [],
        chartOfAccounts: chartOfAccountsResponse.data || [],
        filteredChartOfAccounts: filteredCoa || [],
        costCenters: costCentersResponse.data || [],
        partners: partnersResponse.data || [],
        departments: departmentsResponse.data || [],
      }))
    }

    fetchInitialData()
  }, [token, router])

  useEffect(() => {
    if (userData) {
      setFormState((prevState) => ({
        ...prevState,
        companies: userData.userCompanies.map((uc) => uc.company), // Map to company objects
        locations: userData.userLocations.map((ul) => ul.location), // Map to location objects
      }))
    }
  }, [userData])

  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: {
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
        journalType: 'Bank Voucher', // This will be 'Receipt' conceptually
        companyId: userData?.userCompanies[0]?.company.companyId || 0, // Default to first company ID
        locationId: userData?.userLocations[0]?.location.locationId || 0, // Default to first location ID
        currencyId: 1, // Default to 1 (USD)
        exchangeRate: 1,
        amountTotal: 0,
        payTo: '',
        notes: '',
        createdBy: 0,
      },
      journalDetails: [
        {
          accountId: 0, // This will be the partner's GL account, user will select
          costCenterId: null,
          departmentId: null,
          debit: 0,
          credit: 0,
          analyticTags: null,
          taxId: null,
          resPartnerId: null, // Will be selected by user
          notes: '',
          createdBy: 0,
        },
        {
          accountId: 0, // This will be the bank's GL account
          costCenterId: null,
          departmentId: null,
          debit: 0,
          credit: 0,
          analyticTags: null,
          taxId: null,
          resPartnerId: null,
          bankaccountid: null, // Will be selected by user
          notes: '',
          createdBy: 0,
        },
      ],
    },
  })

  // Add this after the form setup for amount validation
  const watchedAmount = form.watch('journalEntry.amountTotal')
  const [amountError, setAmountError] = useState<string>('')

  // Add useEffect to validate amount changes
  useEffect(() => {
    if (originalBoeAmount > 0 && watchedAmount > originalBoeAmount) {
      setAmountError(
        `You cannot input greater than existing amount (${formatCurrency(originalBoeAmount, 'USD')})` // Hardcoded USD
      )
    } else {
      setAmountError('')
    }
  }, [watchedAmount, originalBoeAmount])

  const handleReceiptClick = React.useCallback(
    (boe: BoeGet) => {
      setSelectedBoe(boe)
      setOriginalBoeAmount(boe.usdAmount)
      // Pre-populate the form with BOE data
      form.reset({
        journalEntry: {
          date: new Date().toISOString().split('T')[0],
          journalType: 'Bank Voucher', // This will be 'Receipt' conceptually
          companyId: userData?.userCompanies[0]?.company.companyId || 0, // Default to first company ID
          locationId: userData?.userLocations[0]?.location.locationId || 0, // Default to first location ID
          currencyId: 1, // Assuming USD (ID 1)
          exchangeRate: 1,
          amountTotal: boe.usdAmount,
          payTo: boe.boeNo || '', // Using boeNo for payTo
          notes: `Receipt for BOE ${boe.boeNo}`, // Using boeNo for notes
          createdBy: userData?.userId || 0,
        },
        journalDetails: [
          {
            accountId: 0, // This will be the partner's GL account, user will select
            costCenterId: null,
            departmentId: null,
            debit: 0,
            credit: boe.usdAmount, // Partner is credited for a receipt
            analyticTags: null,
            taxId: null,
            resPartnerId: null, // User will select this in the form
            notes: `Receipt for BOE ${boe.boeNo}`,
            createdBy: userData?.userId || 0,
          },
          {
            accountId: 0, // This will be the bank's GL account, set by selectedBankAccount
            costCenterId: null,
            departmentId: null,
            debit: boe.usdAmount, // Bank is debited for a receipt
            credit: 0,
            analyticTags: null,
            taxId: null,
            resPartnerId: null,
            bankaccountid: null, // User will select this in the form
            notes: `Receipt for BOE ${boe.boeNo}`,
            createdBy: userData?.userId || 0,
          },
        ],
      })
      setIsReceiptDialogOpen(true)
    },
    [form, userData]
  )

  const onSubmit = async (
    values: JournalEntryWithDetails,
    status: 'Draft' | 'Posted'
  ) => {
    // Re-validate amount before submission
    console.log(values.journalDetails)
    if (values.journalEntry.amountTotal > originalBoeAmount) {
      setValidationError(
        `Amount cannot be greater than the original BOE amount of ${formatCurrency(originalBoeAmount, 'USD')}`
      )
      return
    }

    // Ensure the journal details balance
    const totalDebits = values.journalDetails.reduce(
      (sum, detail) => sum + (detail.debit || 0),
      0
    )
    const totalCredits = values.journalDetails.reduce(
      (sum, detail) => sum + (detail.credit || 0),
      0
    )

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      setValidationError(
        'The total debits and credits in journal details do not balance.'
      )
      return
    }

    // Ensure the journal entry amountTotal matches the balanced details
    if (Math.abs(values.journalEntry.amountTotal - totalDebits) > 0.01) {
      setValidationError(
        "The total amount in journal entry doesn't match the balanced journal details."
      )
      return
    }

    // Removed: Validation for bank account GL code as per user's request to copy accountId

    setValidationError(null)
    const accountid = (await getSettings(token, 'Secured BOE')).data
    const currencyId = (await getCurrency('USD', token)).data
    console.log(currencyId)
    //    console.log(values.journalDetails)
    const finalValues = {
      ...values,
      journalEntry: {
        ...values.journalEntry,
        state: status === 'Draft' ? 0 : 1,
        notes: values.journalEntry.notes || '',
        journalType: 'Bank Voucher', // Still 'Bank Voucher' as per schema, but conceptually a Receipt
        currencyId: currencyId || 0,
        amountTotal: values.journalEntry.amountTotal,
        createdBy: userData?.userId ?? 0,
        companyId:
          values.journalEntry.companyId ||
          userData?.userCompanies[0]?.company.companyId ||
          0,
        locationId:
          values.journalEntry.locationId ||
          userData?.userLocations[0]?.location.locationId ||
          0,
      },

      journalDetails: values.journalDetails.map((detail, index, arr) => ({
        ...detail,
        notes: detail.notes || '',
        accountId:
          index === arr.length - 1
            ? 108
            : formState.selectedBankAccount?.glAccountId,
        createdBy: userData?.userId ?? 0,
      })),
    }

    console.log(
      '🚀 ~ onSubmit ~ formState.selectedBankAccount:',
      formState.selectedBankAccount
    )
    console.log('secured BOE', getSettings(token, 'Secured BOE'))
    // Ensure the first detail is for the partner (credit) and second for bank (debit)
    // and their amounts are correctly set from journalEntry.amountTotal
    if (finalValues.journalDetails[0]) {
      finalValues.journalDetails[0].debit = 0
      finalValues.journalDetails[0].credit =
        finalValues.journalEntry.amountTotal
      // The accountId for the partner is now selected by the user in the form
    }

    if (finalValues.journalDetails[1]) {
      finalValues.journalDetails[1].debit = finalValues.journalEntry.amountTotal
      finalValues.journalDetails[1].credit = 0
      // FIX: Set the accountId of the second journal detail to be the same as the first one
      /*     finalValues.journalDetails[1].accountId =
        finalValues.journalDetails[0].accountId*/
      finalValues.journalDetails[1].bankaccountid =
        formState.selectedBankAccount?.id || null
    }

    console.log('Final values before API call:', finalValues) // Add this for debugging
    const response = await createJournalEntryWithDetails(finalValues, token)
    console.log('🚀 ~ onSubmit ~ finalValues:', finalValues)

    if (response.error || !response.data) {
      toast({
        title: 'Error',
        description: response.error?.message || 'Error creating Receipt',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Receipt created successfully',
      })
      // Close popup and reset form
      setIsReceiptDialogOpen(false)
      form.reset()
      setFormState({
        ...formState,
        selectedBankAccount: null,
        formType: 'Credit',
        status: 'Draft',
      })
      fetchData()
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Bill of Exchange Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full mx-auto mt-5">
      <CardHeader>
        <CardTitle>Bill of Exchange Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className=" border shadow-md">
            <TableHeader className=" bg-slate-200 shadow-md">
              <TableRow>
                <TableHead>BOE No</TableHead>
                <TableHead>BOE Date</TableHead>
                <TableHead>LC Log No</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Received Date</TableHead>
                <TableHead>Negotiation Date</TableHead>
                <TableHead>Maturity Date</TableHead>
                <TableHead className="text-right">USD Amount</TableHead>
                <TableHead className="text-right">BDT Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    No data available.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((boe) => (
                  <TableRow key={boe.boeNo}>
                    <TableCell className="font-medium">{boe.boeNo}</TableCell>
                    <TableCell>{formatDate(boe.boeDate)}</TableCell>
                    <TableCell>{boe.lcLogNo}</TableCell>
                    <TableCell>{formatDate(boe.boeSubDate)}</TableCell>
                    <TableCell>{formatDate(boe.boeRecDate)}</TableCell>
                    <TableCell>{formatDate(boe.negotiationDate)}</TableCell>
                    <TableCell>{formatDate(boe.maturityDate)}</TableCell>
                    <TableCell className="text-right">
                      ${boe.usdAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ৳{boe.bdtAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>{getBoeStatus(boe)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        disabled={getBoeStatus(boe) !== 'Matured'}
                        onClick={() => handleReceiptClick(boe)}
                      >
                        Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <DialogTitle>Create Receipt - BOE {selectedBoe?.boeNo}</DialogTitle>
          </AlertDialogHeader>
          <div className="mt-4">
            <Form {...form}>
              <BoeReceiptForm
                selectedBoe={selectedBoe}
                formState={formState}
                setFormState={setFormState}
                validationError={validationError}
                amountError={amountError}
                onSubmit={onSubmit}
                onClose={() => setIsReceiptDialogOpen(false)}
              />
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BillOfExchange
