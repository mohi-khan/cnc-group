'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, RotateCcw, Check, Pencil, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { toWords } from 'number-to-words'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  type FormStateType,
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  type VoucherById,
  VoucherTypes,
} from '@/utils/type'
import { useReactToPrint } from 'react-to-print'
import {
  getSingleVoucher,
  reverseJournalVoucher,
} from '@/api/contra-voucher-api'
import Loader from '@/utils/loader'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createJournalEntryWithDetails,
  editJournalDetailsNotes,
} from '@/api/vouchers-api'
import { Form } from '../ui/form'
import BankVoucherMaster from '../bank/bank-vouchers/bank-voucher-master'
import BankVoucherDetails from '../bank/bank-vouchers/bank-voucher-details'
import BankVoucherSubmit from '../bank/bank-vouchers/bank-voucher-submit'
import {
  getAllBankAccounts,
  getAllChartOfAccounts,
  getAllCostCenters,
  getAllDepartments,
  getResPartnersBySearch,
} from '@/api/common-shared-api'
import { ToWords } from 'to-words'
import { Textarea } from '../ui/textarea'
import { getAllEmployees } from '@/api/payment-requisition-api'
import { getCompanyWiseChartOfAccounts } from '@/api/chart-of-accounts-api'

const printStyles = `
  @media print {
    .no-print {
      display: none !important;
    }
      .tex-size-12 {
      font-size: 12pt !important;
    }
    .print\\:block {
      display: block !important;
    }
    .print\\:mb-8 {
      margin-bottom: 2rem !important;
    }
    
    /* Force single page layout with increased font size */
    body {
      zoom: 0.65;
    height: 50% !important; /* 50% of parent container's height */
    }
    
    /* Portrait specific settings */
    @page {
      margin: 2mm 2mm 2mm mm;
       margin-top: 0 !important;
    }
  }
  
  @media print and (orientation: landscape) {
    /* Landscape settings - left aligned, half page width */
    @page {
      margin: 2mm 2mm 2mm 0mm;
    }
    
    body {
      zoom: 0.65;
      max-width: 50% !important;
    }
    
    body, .mx-auto {
      margin-left: 0 !important;
      margin-right: auto !important;
    }
  }
`

const updateVoucherNotes = async (id: number, notes: string, token: string) => {
  try {
    const response = await editJournalDetailsNotes(
      {
        id,
        notes,
      },
      token
    )
    return response
  } catch (error) {
    console.error('Error updating voucher notes:', error)
    throw error
  }
}

export default function SingleVoucherDetails() {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { voucherid } = useParams()
  const router = useRouter()
  const [data, setData] = useState<VoucherById[]>()
  const [editingReferenceIndex, setEditingReferenceIndex] = useState<
    number | null
  >(null)
  const [editingReferenceText, setEditingReferenceText] = useState('')
  const [isReversingVoucher, setIsReversingVoucher] = useState(false)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const checkRef = useRef<HTMLDivElement>(null)
  const reactToPrintFn = useReactToPrint({
    contentRef,
    pageStyle: `
    @page {
      margin: 4mm;
    }
  `,
  })

  const printCheckFn = useReactToPrint({ contentRef: checkRef })

  const [userId, setUserId] = React.useState<number | null>(null)
  const [isBankVoucherDialogOpen, setIsBankVoucherDialogOpen] = useState(false)

  const isContraVoucher = data?.[0]?.journaltype === VoucherTypes.ContraVoucher

  const [validationError, setValidationError] = useState<string | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)
  const [notes, setNotes] = useState<string>('')
  const [companyChartOfAccount, setCompanyChartOfAccount] = useState<any[]>([])
  const [companyFilteredAccounts, setCompanyFilteredAccounts] = useState<any[]>(
    []
  )

  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: {
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
        journalType: 'Bank Voucher',
        companyId: 0,
        locationId: 0,
        currencyId: 1,
        exchangeRate: 1,
        amountTotal: 0,
        payTo: '',
        notes: '',
        createdBy: 0,
      },
      journalDetails: [
        {
          accountId: 0,
          costCenterId: null,
          departmentId: null,
          debit: 0,
          credit: 0,
          analyticTags: null,
          taxId: null,
          resPartnerId: null,
          notes: '',
          createdBy: 0,
        },
      ],
    },
  })

  const [formState, setFormState] = useState<FormStateType>({
    companies: [],
    locations: [],
    bankAccounts: [],
    chartOfAccounts: [],
    filteredChartOfAccounts: [],
    costCenters: [],
    partners: [],
    departments: [],
    employees: [],
    selectedBankAccount: null,
    formType: 'Credit',
    status: 'Draft',
  })

  // Load basic voucher data into form when dialog opens
  useEffect(() => {
    if (isBankVoucherDialogOpen && data && data.length > 0) {
      const voucherData = data[0]

      // Find company and location
      const selectedCompany =
        userData?.userCompanies?.find(
          (comp) => comp.company?.companyName === voucherData.companyname
        ) || userData?.userCompanies?.[0]

      const selectedLocation =
        userData?.userLocations?.find(
          (loc) => loc.location?.address === voucherData.location
        ) || userData?.userLocations?.[0]

      // Prepare journal details (exclude bank account entries)
      const mappedJournalDetails = data
        .filter((item) => !item.bankaccount) // Exclude bank account rows
        .map((item) => ({
          accountId: 0, // Will be mapped after accounts are loaded
          costCenterId: null,
          departmentId: null,
          employeeId: null,
          debit: Number.parseFloat(item.debit?.toString() || '0'),
          credit: Number.parseFloat(item.credit?.toString() || '0'),
          analyticTags: null,
          taxId: null,
          resPartnerId: null,
          notes: item.detail_notes || '',
          createdBy: userData?.userId || 0,
          // Store original names for later mapping
          _accountName: item.accountsname,
          _costCenterName: item.costcenter,
          _departmentName: item.department,
          _partnerName: item.partnar,
          _employeeName: item.employeeName,
        }))

      // Set basic form values
      form.setValue(
        'journalEntry.companyId',
        selectedCompany?.company?.companyId || 0
      )
      form.setValue(
        'journalEntry.locationId',
        selectedLocation?.location?.locationId || 0
      )
      form.setValue(
        'journalEntry.date',
        voucherData.date || new Date().toISOString().split('T')[0]
      )
      form.setValue('journalEntry.amountTotal', voucherData.totalamount || 0)
      form.setValue('journalEntry.payTo', voucherData.payTo || '')
      form.setValue('journalEntry.notes', voucherData.MasterNotes || '')

      // Set journal details
      form.setValue('journalDetails', mappedJournalDetails)

      // Find and set bank account
      const bankRow = data.find((item) => item.bankaccount)
      if (bankRow) {
        const bankAccount = formState.bankAccounts.find(
          (acc) =>
            acc.accountName === bankRow.bankaccountName ||
            acc.accountNumber === bankRow.accountNumber
        )

        if (bankAccount) {
          setFormState((prev) => ({
            ...prev,
            selectedBankAccount: {
              id: bankAccount.id,
              glCode: bankAccount.glAccountId || 0,
            },
            formType: bankRow.debit > 0 ? 'Debit' : 'Credit',
          }))
        }
      }
    }
  }, [isBankVoucherDialogOpen, data, userData, form, formState.bankAccounts])

  const fetchCompanyChartOfAccounts = useCallback(async () => {
    if (!token) return
    try {
      const response = await getCompanyWiseChartOfAccounts(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (response.error || !response.data) {
        console.error(
          'Error getting company chart of accounts:',
          response.error
        )
        setCompanyChartOfAccount([])
        return
      } else {
        setCompanyChartOfAccount(response.data)
      }
    } catch (error) {
      console.error('Error getting company chart of accounts:', error)
      setCompanyChartOfAccount([])
    }
  }, [token, router])

  // Map account names to IDs after reference data is loaded
  useEffect(() => {
    if (
      isBankVoucherDialogOpen &&
      formState.filteredChartOfAccounts.length > 0 &&
      formState.costCenters.length > 0 &&
      formState.departments.length > 0 &&
      formState.partners.length > 0 &&
      formState.employees.length > 0
    ) {
      const currentDetails = form.getValues('journalDetails')

      if (!currentDetails || currentDetails.length === 0) return

      // Check if we need to map (accountId is still 0 and we have original names)
      if (
        currentDetails[0]?.accountId === 0 &&
        (currentDetails[0] as any)?._accountName
      ) {
        const mappedDetails = (currentDetails as any[]).map((detail: any) => {
          const account = formState.filteredChartOfAccounts.find(
            (acc) =>
              acc.name?.toLowerCase().trim() ===
              detail._accountName?.toLowerCase().trim()
          )

          const costCenter = formState.costCenters.find(
            (cc) =>
              cc.costCenterName?.toLowerCase().trim() ===
              detail._costCenterName?.toLowerCase().trim()
          )

          const department = formState.departments.find(
            (dept) =>
              dept.departmentName?.toLowerCase().trim() ===
              detail._departmentName?.toLowerCase().trim()
          )

          const partner = formState.partners.find(
            (p) =>
              p.name?.toLowerCase().trim() ===
              detail._partnerName?.toLowerCase().trim()
          )

          const employee = formState.employees.find(
            (e) =>
              e.employeeName?.toLowerCase().trim() ===
              detail._employeeName?.toLowerCase().trim()
          )

          return {
            accountId: account?.accountId || 0,
            costCenterId: costCenter?.costCenterId || null,
            departmentId: department?.departmentID || null,
            employeeId: employee?.id || null,
            debit: detail.debit,
            credit: detail.credit,
            analyticTags: null,
            taxId: null,
            resPartnerId: partner?.id || null,
            notes: detail.notes || '',
            createdBy: userData?.userId || 0,
          }
        })

        form.setValue('journalDetails', mappedDetails)

        // Trigger validation
        setTimeout(() => form.trigger(), 100)
      }
    }
  }, [
    isBankVoucherDialogOpen,
    formState.filteredChartOfAccounts,
    formState.costCenters,
    formState.departments,
    formState.partners,
    formState.employees,
    form,
    userData,
  ])

  // Filter accounts based on selected company
  useEffect(() => {
    const subscription = form.watch((value) => {
      const selectedCompanyId = value.journalEntry?.companyId

      if (
        !selectedCompanyId ||
        !companyChartOfAccount.length ||
        !formState.chartOfAccounts.length
      ) {
        setCompanyFilteredAccounts([])
        return
      }

      const companyAccountIds = companyChartOfAccount
        .filter((mapping) => mapping.companyId === selectedCompanyId)
        .map((mapping) => mapping.chartOfAccountId)

      const filtered = formState.chartOfAccounts.filter(
        (account) =>
          companyAccountIds.includes(account.accountId) &&
          account.isGroup === false
      )

      setCompanyFilteredAccounts(filtered)
    })

    return () => subscription.unsubscribe()
  }, [form, companyChartOfAccount, formState.chartOfAccounts])

  const handleReceiptClick = React.useCallback(() => {
    if (!data || data.length === 0) {
      toast({
        title: 'Error',
        description: 'No voucher data available',
        variant: 'destructive',
      })
      return
    }

    // Reset form state
    setFormState((prevState) => ({
      ...prevState,
      status: 'Draft',
      formType: 'Credit',
      selectedBankAccount: null,
    }))

    // Open dialog - useEffect will handle population
    setIsBankVoucherDialogOpen(true)
  }, [data])

  // Initialize form state data
  useEffect(() => {
    if (userData) {
      setFormState((prevState) => ({
        ...prevState,
        companies: userData.userCompanies,
        locations: userData.userLocations,
      }))
    }
  }, [userData])

  // Fetch initial data for bank voucher form
  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')
      if (!storedUserData || !storedToken) {
        router.push('/')
        return
      }
    }

    checkUserData()

    const fetchInitialData = async () => {
      const search = ''
      if (!token) return

      try {
        const [
          bankAccountsResponse,
          chartOfAccountsResponse,
          costCentersResponse,
          partnersResponse,
          departmentsResponse,
          employeesResponse,
        ] = await Promise.all([
          getAllBankAccounts(token),
          getAllChartOfAccounts(token),
          getAllCostCenters(token),
          getResPartnersBySearch(search, token),
          getAllDepartments(token),
          getAllEmployees(token),
        ])

        if (
          bankAccountsResponse?.error?.status === 441 ||
          chartOfAccountsResponse?.error?.status === 441 ||
          costCentersResponse?.error?.status === 441 ||
          partnersResponse?.error?.status === 441 ||
          departmentsResponse?.error?.status === 441 ||
          employeesResponse?.error?.status === 441
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
          employees: employeesResponse.data || [],
        }))
      } catch (error) {
        console.error('Error fetching initial data:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch required data',
          variant: 'destructive',
        })
      }
    }

    fetchInitialData()
    fetchCompanyChartOfAccounts() // ADD THIS LINE
  }, [token, router, fetchCompanyChartOfAccounts])

  // Updated onSubmit function
  const onSubmit = async (
    values: JournalEntryWithDetails,
    status: 'Draft' | 'Posted'
  ) => {
    // Validate bank account selection
    if (!formState.selectedBankAccount) {
      toast({
        title: 'Error',
        description: 'Please select a bank account',
        variant: 'destructive',
      })
      return
    }

    // Validate amount
    if (
      !values.journalEntry.amountTotal ||
      values.journalEntry.amountTotal <= 0
    ) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      })
      return
    }

    const updatedValues = {
      ...values,
      journalEntry: {
        ...values.journalEntry,
        state: status === 'Draft' ? 0 : 1,
        journalType: 'Bank Voucher',
        currencyId: values.journalEntry.currencyId || 1,
        exchangeRate: 1,
        createdBy: userData?.userId ?? 0,
      },
      journalDetails: values.journalDetails.map((detail) => ({
        ...detail,
        createdBy: userData?.userId ?? 0,
        bankaccountid: null,
      })),
    }

    // Add bank account entry
    const finalValues = {
      ...updatedValues,
      journalDetails: [
        ...updatedValues.journalDetails,
        {
          accountId: formState.selectedBankAccount.glCode,
          costCenterId: null,
          departmentId: null,
          employeeId: null,
          debit:
            formState.formType === 'Debit'
              ? updatedValues.journalEntry.amountTotal
              : 0,
          credit:
            formState.formType === 'Credit'
              ? updatedValues.journalEntry.amountTotal
              : 0,
          analyticTags: null,
          taxId: null,
          resPartnerId: null,
          bankaccountid: formState.selectedBankAccount.id,
          notes: updatedValues.journalEntry.notes || '',
          createdBy: userData?.userId ?? 0,
        },
      ],
    }

    try {
      const response = await createJournalEntryWithDetails(finalValues, token)

      if (response.error || !response.data) {
        toast({
          title: 'Error',
          description: response.error?.message || 'Error creating Bank Voucher',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Bank Voucher created successfully',
        })

        // Close dialog and reset
        setIsBankVoucherDialogOpen(false)
        form.reset()
        setFormState((prevState) => ({
          ...prevState,
          selectedBankAccount: null,
          formType: 'Credit',
          status: 'Draft',
        }))

        // Refresh the page
        router.refresh()
      }
    } catch (error) {
      console.error('Error creating bank voucher:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    async function fetchVoucher() {
      if (!voucherid || !token) return
      try {
        const response = await getSingleVoucher(voucherid as string, token)
        if (response.error || !response.data) {
          toast({
            title: 'Error',
            description:
              response.error?.message || 'Failed to get Voucher Data',
          })
        } else {
          setData(response.data.reverse())
        }
      } catch (error) {
        toast({
          title: 'Error',
          description:
            'An unexpected error occurred while fetching the voucher.',
        })
      }
    }
    fetchVoucher()
  }, [voucherid, token])

  const handleReferenceEdit = (index: number, currentText: string) => {
    setEditingReferenceIndex(index)
    setEditingReferenceText(currentText)
  }

  React.useEffect(() => {
    if (userData) {
      setUserId(userData.userId)
    }
  }, [userData])

  const handleReferenceSave = async () => {
    if (data && editingReferenceIndex !== null && voucherid && token) {
      setIsSavingNotes(true)
      try {
        const currentItem = data[editingReferenceIndex]
        await updateVoucherNotes(currentItem.id, editingReferenceText, token)
        const updatedData = [...data]
        updatedData[editingReferenceIndex] = {
          ...updatedData[editingReferenceIndex],
          notes: editingReferenceText,
        }
        setData(updatedData)
        setEditingReferenceIndex(null)
        toast({
          title: 'Success',
          description: 'Notes updated successfully',
        })
      } catch (error) {
        console.error('Error updating notes:', error)
        toast({
          title: 'Error',
          description: 'Failed to update notes. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsSavingNotes(false)
      }
    }
  }

  const handleReferenceCancel = () => {
    setEditingReferenceIndex(null)
    setEditingReferenceText('')
  }

  const handleReverseVoucher = () => {
    setIsAlertDialogOpen(true)
  }

  const confirmReverseVoucher = async () => {
    setIsAlertDialogOpen(false)
    const createdId = userId ?? 0
    const voucherId = data?.[0].voucherno

    if (!voucherId || !data) return

    if (!voucherId) {
      toast({
        title: 'Error',
        description: 'Invalid voucher number',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsReversingVoucher(true)
      const response = await reverseJournalVoucher(
        Number(voucherid),
        createdId,
        token,
        notes
      )

      if (!response.data || response.error) {
        toast({
          title: 'Error',
          description:
            response.error?.message || 'Failed to reverse the voucher',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Voucher reversed successfully',
        })
        router.refresh()
      }
    } catch (error: any) {
      console.error('Reverse voucher error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to reverse the voucher',
        variant: 'destructive',
      })
    } finally {
      setIsReversingVoucher(false)
    }
  }

  const sortedData = React.useMemo(() => {
    if (!data) return []
    return [...data].sort((a, b) => {
      if (a.debit > 0 && b.debit === 0) return -1
      if (b.debit > 0 && a.debit === 0) return 1
      return 0
    })
  }, [data])

  if (!data) {
    return (
      <div className="felx items-center justify-center h-screen">
        <Loader />
      </div>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <Card ref={contentRef} className="w-full max-w-5xl mx-auto mt-24">
        {/* ADD THIS NEW SECTION */}
            <div className=" grid-cols-[120px,1fr] gap-8 print:block hidden">
              <span className="font-medium whitespace-nowrap">Printed On:</span>
              <span>
                {new Date().toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
            {/* END OF NEW SECTION */}

        <CardContent className="p-6 print:w-full print:max-w-none">
          <h1 className="text-center text-3xl font-bold">
            {data[0].companyname}
          </h1>
          <p className="text-center my-1 text-xl font-semibold">
            {data[0].location}{' '}
          </p>
          <p className="text-center mb-10 text-xs font-semibold">
            {data[0].address}{' '}
          </p>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="grid grid-cols-[120px,1fr] gap-8">
                <span className="font-medium">Voucher No:</span>
                <span>{data[0].voucherno}</span>
              </div>
              <div className="grid grid-cols-[120px,1fr] gap-8">
                <span className="font-medium whitespace-nowrap">
                  Accounting Date:
                </span>
                <span>{data[0].date}</span>
              </div>
              <div className="grid grid-cols-[120px,1fr] gap-8">
                <span className="font-medium whitespace-nowrap capitalize">
                  Created By: {data[0].createdby}
                </span>
                <span></span>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 no-print">
              {data[0].journaltype === VoucherTypes.BankVoucher && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReceiptClick}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  New Bank Voucher
                </Button>
              )}

              <AlertDialog
                open={isAlertDialogOpen}
                onOpenChange={setIsAlertDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReverseVoucher}
                    disabled={isReversingVoucher}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {isReversingVoucher ? 'Reversing...' : 'Reverse'}
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent className="bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will reverse the voucher. This action cannot
                      be undone. Please enter a note for this reversal
                      (optional):
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="my-4">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter notes for reversal..."
                      className="w-full border rounded p-2"
                    />
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel>No</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmReverseVoucher}>
                      Yes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {data[0].journaltype === VoucherTypes.BankVoucher && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => printCheckFn()}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Check
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => reactToPrintFn()}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Voucher
              </Button>
            </div>
          </div>

          {/* Bank Voucher Dialog */}
          <Dialog
            open={isBankVoucherDialogOpen}
            onOpenChange={setIsBankVoucherDialogOpen}
          >
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Create Bank Voucher from {data[0].journaltype}{' '}
                  {data[0].voucherno}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((values) => {
                      onSubmit(values, formState.status)
                    })}
                    className="space-y-8"
                  >
                    {validationError && (
                      <div className="text-red-500 text-sm mb-4">
                        {validationError}
                      </div>
                    )}
                    {amountError && (
                      <div className="text-red-500 text-sm mb-4">
                        {amountError}
                      </div>
                    )}
                    <BankVoucherMaster
                      form={form}
                      formState={formState}
                      requisition={undefined}
                      setFormState={setFormState}
                      disableJournalType={false}
                    />
                    <BankVoucherDetails
                      form={form}
                      formState={{
                        ...formState,
                        filteredChartOfAccounts: companyFilteredAccounts, // CHANGE THIS LINE
                      }}
                      requisition={undefined}
                      partners={formState.partners}
                      isFromInvoice={false}
                      invoicePartnerName=""
                      employees={formState.employees}
                    />
                    <BankVoucherSubmit
                      form={form}
                      onSubmit={onSubmit}
                      disabled={!!amountError}
                    />
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>

          {/* Journal Items Table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {data[0]?.journaltype}{' '}
                {data[0]?.state === 0 && (
                  <span className="text-lg"> (Draft) </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="shadow-md border">
                <TableHeader className="bg-slate-200 shadow-md">
                  <TableRow>
                    <TableHead className="tex-size-12">Accounts</TableHead>
                    <TableHead className="no-print">Bank Account</TableHead>
                    <TableHead className="no-print">Cost Center</TableHead>
                    <TableHead className="tex-size-12">Unit</TableHead>
                    <TableHead className="tex-size-12">Employee</TableHead>
                    <TableHead className="tex-size-12">Partner</TableHead>
                    <TableHead className="no-print">
                      {data[0].journaltype === VoucherTypes.BankVoucher
                        ? 'Cheque No.'
                        : 'Notes'}
                    </TableHead>
                    <TableHead className="tex-size-12">Debit</TableHead>
                    <TableHead className="tex-size-12">Credit</TableHead>
                    <TableHead className="no-print">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((item, index) => {
                    const originalIndex = data.findIndex(
                      (d) => d.id === item.id
                    )
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="tex-size-12">
                          {item.accountsname || 'N/A'}
                        </TableCell>
                        <TableCell className="no-print">
                          {item.bankaccount && item.bankaccountName
                            ? `${item.bankaccount} - ${item.bankaccountName}-${item.accountNumber}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="no-print">
                          {item.costcenter || 'N/A'}
                        </TableCell>
                        <TableCell className="tex-size-12">
                          {item.department || 'N/A'}
                        </TableCell>
                        <TableCell className="tex-size-12">
                          {item.employeeName || 'N/A'}
                        </TableCell>
                        <TableCell className="tex-size-12">
                          {item.partnar || 'N/A'}
                        </TableCell>
                        <TableCell className="no-print">
                          {editingReferenceIndex === originalIndex ? (
                            <div className="flex gap-2 items-start align-top">
                              <Input
                                type="text"
                                value={editingReferenceText}
                                onChange={(e) =>
                                  setEditingReferenceText(e.target.value)
                                }
                                className="min-w-[200px]"
                                disabled={isSavingNotes}
                              />
                            </div>
                          ) : (
                            item.detail_notes
                          )}
                        </TableCell>
                        <TableCell className="tex-size-12">
                          {item.debit > 0 ? item.debit.toFixed(2) : '-'}
                        </TableCell>
                        <TableCell className="tex-size-12">
                          {item.credit > 0 ? item.credit.toFixed(2) : '-'}
                        </TableCell>
                        <TableCell className="no-print">
                          {editingReferenceIndex === originalIndex ? (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReferenceSave}
                                disabled={isSavingNotes}
                              >
                                {isSavingNotes ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReferenceCancel}
                                disabled={isSavingNotes}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleReferenceEdit(originalIndex, item.notes)
                              }
                            >
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <div className="mt-6 grid grid-cols-[170px,1fr] gap-2">
                <span className="font-medium">Reference:</span>
                <span>{data?.[0]?.MasterNotes || 'Not available'}</span>
              </div>
              {/* Total Amount */}
              <div className="mt-4 grid grid-cols-[170px,1fr] gap-2">
                <span className="font-medium">Amount:</span>
                <span>
                  {data[data.length - 1].totalamount.toFixed(2)}{' '}
                  {data[data.length - 1].currency}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-[170px,1fr] gap-2">
                <span className="font-medium">Amount in word:</span>
                <span className="capitalize">
                  {new ToWords().convert(
                    Number(data[data.length - 1].totalamount.toFixed(2))
                  )}{' '}
                  {data[data.length - 1].currency} only
                </span>
              </div>
              <div className="flex justify-between mt-20">
                <h1 className="border-t-2 border-black pt-2">
                  Signature of Recipient
                </h1>
                <h1 className="border-t-2 border-black pt-2">Prepared by</h1>
                <h1 className="border-t-2 border-black pt-2">Checked by</h1>
                <h1 className="border-t-2 border-black pt-2">
                  Approved by CM/MD
                </h1>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Hidden check for printing */}
      {data.map((item, index) => (
        <div className="hidden" key={index}>
          <div ref={checkRef} className="p-8 bg-white">
            <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="relative p-6 border border-gray-300 bg-white">
                {/* Bank Header */}
                <div className="flex justify-end items-start mb-8">
                  <div className="text-right">
                    <div className="flex items-center justify-end">
                      <span className="text-sm mr-2">{item.date}</span>
                    </div>
                  </div>
                </div>
                {/* Payee Section */}
                <div className="mb-6">
                  <div className="flex items-center mb-1">
                    <p className="flex-1 pb-1 pt-2 ">{data[0]?.payTo}</p>
                  </div>
                </div>
                {/* Amount Section */}
                <div className="flex mb-6">
                  <div className="flex-1">
                    <p className="flex-1 pb-1 pt-2 ">
                      {item.debit === 0
                        ? toWords(item.credit)
                        : toWords(item.debit)}
                    </p>
                  </div>
                  <div className="px-2 py-1 flex items-center whitespace-nowrap ml-5">
                    <span className="font-medium">
                      {item.debit === 0 ? item.credit : item.debit}/-
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
