'use client'

import React, { useState, useEffect, useRef } from 'react'
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

// Add this after your imports
const printStyles = `
  @media print {
    .no-print {
      display: none !important;
    }
    .print\\:block {
      display: block !important;
    }
    .print\\:mb-8 {
      margin-bottom: 2rem !important;
    }
  }
`

// Add this API function for updating voucher notes
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
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  // State variables
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
  const reactToPrintFn = useReactToPrint({ contentRef })
  const printCheckFn = useReactToPrint({ contentRef: checkRef })

  const [userId, setUserId] = React.useState<number | null>(null)
  const [isBankVoucherDialogOpen, setIsBankVoucherDialogOpen] = useState(false)

  const isContraVoucher = data?.[0]?.journaltype === VoucherTypes.ContraVoucher

  const [validationError, setValidationError] = useState<string | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)

  // Bank voucher form setup
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
    selectedBankAccount: null,
    formType: 'Debit',
    status: 'Draft',
  })

  // Enhanced effect to handle form population
  useEffect(() => {
    if (
      isBankVoucherDialogOpen &&
      data &&
      formState.filteredChartOfAccounts.length > 0 &&
      formState.costCenters.length > 0 &&
      formState.departments.length > 0 &&
      formState.partners.length > 0 &&
      formState.bankAccounts.length > 0
    ) {
      console.log('🔄 Starting form population...')
      const voucherData = data[0]
      console.log('📊 Voucher data:', voucherData)

      // Helper functions to get objects by name with better matching
      const getAccountByName = (accountName: string) => {
        if (!accountName) return null
        const cleanName = accountName.toLowerCase().trim()
        const found = formState.filteredChartOfAccounts.find(
          (acc) =>
            acc.name?.toLowerCase().trim() === cleanName ||
            acc.displayName?.toLowerCase().trim() === cleanName ||
            acc.code?.toLowerCase().trim() === cleanName
        )
        console.log(`🔍 Account search for "${accountName}":`, found)
        return found
      }

      const getCostCenterByName = (costCenterName: string) => {
        if (!costCenterName) return null
        const cleanName = costCenterName.toLowerCase().trim()
        const found = formState.costCenters.find(
          (cc) => cc.costCenterName?.toLowerCase().trim() === cleanName
        )
        console.log(`🔍 Cost center search for "${costCenterName}":`, found)
        return found
      }

      const getDepartmentByName = (departmentName: string) => {
        if (!departmentName) return null
        const cleanName = departmentName.toLowerCase().trim()
        const found = formState.departments.find(
          (dept) => dept.departmentName?.toLowerCase().trim() === cleanName
        )
        console.log(`🔍 Department search for "${departmentName}":`, found)
        return found
      }

      const getPartnerByName = (partnerName: string) => {
        if (!partnerName) return null
        const cleanName = partnerName.toLowerCase().trim()
        const found = formState.partners.find(
          (p) => p.name?.toLowerCase().trim() === cleanName
        )
        console.log(`🔍 Partner search for "${partnerName}":`, found)
        return found
      }

      const getBankAccountByName = (bankAccountName: string) => {
        if (!bankAccountName) return null
        const cleanName = bankAccountName.toLowerCase().trim()
        const found = formState.bankAccounts.find(
          (bank) =>
            bank.accountName?.toLowerCase().trim() === cleanName ||
            bank.bankName?.toLowerCase().trim() === cleanName ||
            `${bank.bankName} - ${bank.accountName}`.toLowerCase().trim() ===
              cleanName ||
            bank.accountNumber?.toLowerCase().trim() === cleanName
        )
        console.log(`🔍 Bank account search for "${bankAccountName}":`, found)
        return found
      }

      // Find company and location from user data
      const selectedCompany =
        userData?.userCompanies?.find(
          (comp) => comp.company?.companyName === voucherData.companyname
        ) || userData?.userCompanies?.[0]

      const selectedLocation =
        userData?.userLocations?.find(
          (loc) => loc.location?.address === voucherData.location
        ) || userData?.userLocations?.[0]

      console.log('🏢 Selected company:', selectedCompany)
      console.log('📍 Selected location:', selectedLocation)

      // Find bank account
      const bankAccount = getBankAccountByName(voucherData.bankaccount || '')
      console.log(
        '🏦 Found bank account:',
        bankAccount,
        'for name:',
        voucherData.bankaccount
      )

      // Map existing journal details with proper IDs and better error handling
      const mappedJournalDetails = data.map((item, index) => {
        console.log(`📝 Processing item ${index}:`, item)
        const account = getAccountByName(item.accountsname || '')
        const costCenter = getCostCenterByName(item.costcenter || '')
        const department = getDepartmentByName(item.department || '')
        const partner = getPartnerByName(item.partnar || '')

        const mapped = {
          accountId: account?.accountId || 0,
          costCenterId: costCenter?.costCenterId || null,
          departmentId: department?.departmentID || null,
          debit: Number.parseFloat(item.debit?.toString() || '0'),
          credit: Number.parseFloat(item.credit?.toString() || '0'),
          analyticTags: null,
          taxId: null,
          resPartnerId: partner?.id || null,
          notes: item.notes || '',
          createdBy: userData?.userId || 0,
        }

        console.log(`✅ Mapped detail ${index}:`, mapped)
        return mapped
      })

      // Set form values
      const formValues = {
        journalEntry: {
          date: voucherData.date || new Date().toISOString().split('T')[0],
          journalType: 'Bank Voucher',
          companyId: selectedCompany?.company?.companyId || 0,
          locationId: selectedLocation?.location?.locationId || 0,
          currencyId: 1,
          exchangeRate: 1,
          amountTotal: voucherData.totalamount || 0,
          payTo: voucherData.payTo || '',
          payToText: voucherData.payTo || '',
          notes: `Bank voucher for ${voucherData.journaltype} ${voucherData.voucherno}`,
          createdBy: userData?.userId || 0,
        },
        journalDetails: mappedJournalDetails,
      }

      console.log('📋 Form values to be set:', formValues)

      // Reset form with the populated values
      form.reset(formValues)

      // Set individual form values
      form.setValue(
        'journalEntry.companyId',
        selectedCompany?.company?.companyId || 0
      )
      form.setValue(
        'journalEntry.locationId',
        selectedLocation?.location?.locationId || 0
      )
      form.setValue('journalEntry.amountTotal', voucherData.totalamount || 0)
      form.setValue('journalEntry.payTo', voucherData.payTo || '')
      form.setValue('journalEntry.payTo', voucherData.payTo || '')
      form.setValue(
        'journalEntry.notes',
        `Bank voucher for ${voucherData.journaltype} ${voucherData.voucherno}`
      )
      form.setValue(
        'journalEntry.date',
        voucherData.date || new Date().toISOString().split('T')[0]
      )

      // Set journal details
      mappedJournalDetails.forEach((detail, index) => {
        console.log(`🔧 Setting form values for detail ${index}:`, detail)
        form.setValue(`journalDetails.${index}.accountId`, detail.accountId)
        form.setValue(
          `journalDetails.${index}.costCenterId`,
          detail.costCenterId
        )
        form.setValue(
          `journalDetails.${index}.departmentId`,
          detail.departmentId
        )
        form.setValue(`journalDetails.${index}.debit`, detail.debit)
        form.setValue(`journalDetails.${index}.credit`, detail.credit)
        form.setValue(
          `journalDetails.${index}.resPartnerId`,
          detail.resPartnerId
        )
        form.setValue(`journalDetails.${index}.notes`, detail.notes)
      })

      // Update formState for bank account - ONLY if it's different to prevent infinite loop
      if (
        bankAccount &&
        (!formState.selectedBankAccount ||
          formState.selectedBankAccount.id !== bankAccount.id)
      ) {
        setFormState((prev) => ({
          ...prev,
          selectedBankAccount: {
            id: bankAccount.id,
            glCode: bankAccount.glAccountId || 0,
          },
        }))
      }

      // Trigger form validation
      setTimeout(() => {
        form.trigger()
        console.log('✅ Form values after population:', form.getValues())
      }, 100)

      console.log('✅ Form population completed')
    }
  }, [
    isBankVoucherDialogOpen,
    data,
    formState.filteredChartOfAccounts.length,
    formState.costCenters.length,
    formState.departments.length,
    formState.partners.length,
    formState.bankAccounts.length,
    formState.bankAccounts,
    formState.costCenters,
    formState.departments,
    formState.partners,
    formState.filteredChartOfAccounts,
    formState.selectedBankAccount,
    userData,
    form,
  ])

  // Simplified handleReceiptClick function
  const handleReceiptClick = React.useCallback(() => {
    if (!data || data.length === 0) {
      toast({
        title: 'Error',
        description: 'No voucher data available',
        variant: 'destructive',
      })
      return
    }

    console.log('🚀 Opening bank voucher dialog with data:', data[0])

    // Update form state
    setFormState((prevState) => ({
      ...prevState,
      status: 'Draft',
      formType: 'Debit',
      selectedBankAccount: null,
    }))

    // Open dialog - the useEffect above will handle populating the form
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

        console.log('📊 Fetched data:', {
          bankAccounts: bankAccountsResponse.data?.length || 0,
          chartOfAccounts: chartOfAccountsResponse.data?.length || 0,
          filteredCoa: filteredCoa?.length || 0,
          costCenters: costCentersResponse.data?.length || 0,
          partners: partnersResponse.data?.length || 0,
          departments: departmentsResponse.data?.length || 0,
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
  }, [token, router])

  // Enhanced onSubmit function with better validation
  const onSubmit = async (
    values: JournalEntryWithDetails,
    status: 'Draft' | 'Posted'
  ) => {
    // Validate that required fields are filled
    if (!formState.selectedBankAccount) {
      toast({
        title: 'Error',
        description: 'Please select a bank account',
        variant: 'destructive',
      })
      return
    }

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
        notes: values.journalEntry.notes || '',
        journalType: 'Bank Voucher',
        currencyId: values.journalEntry.currencyId || 1,
        amountTotal: values.journalEntry.amountTotal || 0,
        payTo: values.journalEntry.payTo || '',
        payToText: values.journalEntry.payTo || '',
        createdBy: userData?.userId ?? 0,
      },
      journalDetails: values.journalDetails.map((detail) => ({
        ...detail,
        notes: detail.notes || '',
        createdBy: userData?.userId ?? 0,
      })),
    }

    // Add bank account entry
    const updateValueswithBank = {
      ...updatedValues,
      journalDetails: [
        ...updatedValues.journalDetails,
        {
          accountId: formState.selectedBankAccount?.glCode || 0,
          costCenterId: null,
          departmentId: null,
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
          bankaccountid: formState.selectedBankAccount?.id,
          notes: updatedValues.journalEntry.notes || '',
          createdBy: userData?.userId ?? 0,
        },
      ],
    }

    try {
      const response = await createJournalEntryWithDetails(
        updateValueswithBank,
        token
      )
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
        // Close popup and reset form
        setIsBankVoucherDialogOpen(false)
        form.reset()
        setFormState((prevState) => ({
          ...prevState,
          selectedBankAccount: null,
          formType: 'Debit',
          status: 'Draft',
        }))
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
          console.log('Fetched voucher data:', response.data)
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

  // Updated handleReferenceSave function to persist changes to database
  const handleReferenceSave = async () => {
    if (data && editingReferenceIndex !== null && voucherid && token) {
      setIsSavingNotes(true)
      try {
        const currentItem = data[editingReferenceIndex]
        // Call API to update the notes in the database
        await updateVoucherNotes(currentItem.id, editingReferenceText, token)
        // Update local state only after successful API call
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

  // Add cancel function for editing
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
        token
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
        <CardContent className="p-6">
          {/* Header Section */}
          <h1 className="text-center text-3xl font-bold">
            {data[0].companyname}
          </h1>
          <p className="text-center mb-10 text-xl font-semibold">
            {data[0].location}{' '}
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
                      be undone. Are you sure?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
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
                      console.log('Submitting form with values:', values)
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
                      disableJournalType={true}
                    />
                    <BankVoucherDetails
                      form={form}
                      formState={formState}
                      requisition={undefined}
                      partners={formState.partners}
                      isFromInvoice={true}
                      invoicePartnerName={data?.[0]?.partnar || ''}
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
                    <TableHead>Accounts</TableHead>
                    <TableHead>Bank Account</TableHead>
                    <TableHead>Cost Center</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>
                      {data[0].journaltype === VoucherTypes.BankVoucher
                        ? 'Cheque No.'
                        : 'Notes'}
                    </TableHead>
                    <TableHead>Debit</TableHead>
                    <TableHead>Credit</TableHead>
                    <TableHead className="no-print">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.accountsname || 'N/A'}</TableCell>
                      <TableCell>
                        {item.bankaccount && item.bankaccountName
                          ? `${item.bankaccount} - ${item.bankaccountName}-${item.accountNumber}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{item.costcenter || 'N/A'}</TableCell>
                      <TableCell>{item.department || 'N/A'}</TableCell>
                      <TableCell>{item.partnar || 'N/A'}</TableCell>
                      <TableCell>
                        {editingReferenceIndex === index ? (
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
                      <TableCell>
                        {item.debit > 0 ? item.debit.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell>
                        {item.credit > 0 ? item.credit.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell className="no-print">
                        {editingReferenceIndex === index ? (
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
                              handleReferenceEdit(index, item.notes)
                            }
                          >
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-6 grid grid-cols-[170px,1fr] gap-2">
                <span className="font-medium">Reference:</span>
                <span>{data?.[0]?.detail_notes || 'Not available'}</span>
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




// 'use client'

// import React, { useState, useEffect, useRef } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Printer, RotateCcw, Check, Pencil, Loader2 } from 'lucide-react'
// import { toast } from '@/hooks/use-toast'
// import { toWords } from 'number-to-words'
// import { Card, CardHeader, CardTitle } from '@/components/ui/card'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from '@/components/ui/alert-dialog'
// import {
//   type FormStateType,
//   type JournalEntryWithDetails,
//   JournalEntryWithDetailsSchema,
//   type VoucherById,
//   VoucherTypes,
// } from '@/utils/type'
// import { useReactToPrint } from 'react-to-print'
// import {
//   getSingleVoucher,
//   reverseJournalVoucher,
// } from '@/api/contra-voucher-api'
// import Loader from '@/utils/loader'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import {
//   createJournalEntryWithDetails,
//   editJournalDetailsNotes,
// } from '@/api/vouchers-api'
// import { Form } from '../ui/form'
// import BankVoucherMaster from '../bank/bank-vouchers/bank-voucher-master'
// import BankVoucherDetails from '../bank/bank-vouchers/bank-voucher-details'
// import BankVoucherSubmit from '../bank/bank-vouchers/bank-voucher-submit'
// import {
//   getAllBankAccounts,
//   getAllChartOfAccounts,
//   getAllCostCenters,
//   getAllDepartments,
//   getResPartnersBySearch,
// } from '@/api/common-shared-api'
// import { ToWords } from 'to-words'

// // Add this after your imports
// const printStyles = `
//   @media print {
//     .no-print {
//       display: none !important;
//     }
//     .print\\:block {
//       display: block !important;
//     }
//     .print\\:mb-8 {
//       margin-bottom: 2rem !important;
//     }
//   }
// `

// // Add this API function for updating voucher notes
// const updateVoucherNotes = async (id: number, notes: string, token: string) => {
//   try {
//     const response = await editJournalDetailsNotes(
//       {
//         id,
//         notes,
//       },
//       token
//     )
//     return response
//   } catch (error) {
//     console.error('Error updating voucher notes:', error)
//     throw error
//   }
// }

// export default function SingleVoucherDetails() {
//   //getting userData from jotai atom component
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)

//   // State variables
//   const { voucherid } = useParams()
//   const router = useRouter()
//   const [data, setData] = useState<VoucherById[]>()
//   const [editingReferenceIndex, setEditingReferenceIndex] = useState<
//     number | null
//   >(null)
//   const [editingReferenceText, setEditingReferenceText] = useState('')
//   const [isReversingVoucher, setIsReversingVoucher] = useState(false)
//   const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
//   const [isSavingNotes, setIsSavingNotes] = useState(false) // Add loading state for saving notes

//   const contentRef = useRef<HTMLDivElement>(null)
//   const checkRef = useRef<HTMLDivElement>(null)
//   const reactToPrintFn = useReactToPrint({ contentRef })
//   const printCheckFn = useReactToPrint({ contentRef: checkRef })

//   const [userId, setUserId] = React.useState<number | null>(null)
//   const [isBankVoucherDialogOpen, setIsBankVoucherDialogOpen] = useState(false)

//   const isContraVoucher = data?.[0]?.journaltype === VoucherTypes.ContraVoucher

//   // Add missing state for validationError and amountError
//   const [validationError, setValidationError] = useState<string | null>(null)
//   const [amountError, setAmountError] = useState<string | null>(null)

//   // Bank voucher form setup
//   const form = useForm<JournalEntryWithDetails>({
//     resolver: zodResolver(JournalEntryWithDetailsSchema),
//     defaultValues: {
//       journalEntry: {
//         date: new Date().toISOString().split('T')[0],
//         journalType: 'Bank Voucher',
//         companyId: 0,
//         locationId: 0,
//         currencyId: 1,
//         exchangeRate: 1,
//         amountTotal: 0,
//         payTo: '',
//         notes: '',
//         createdBy: 0,
//       },
//       journalDetails: [
//         {
//           accountId: 0,
//           costCenterId: null,
//           departmentId: null,
//           debit: 0,
//           credit: 0,
//           analyticTags: null,
//           taxId: null,
//           resPartnerId: null,
//           notes: '',
//           createdBy: 0,
//         },
//       ],
//     },
//   })

//   const [formState, setFormState] = useState<FormStateType>({
//     companies: [],
//     locations: [],
//     bankAccounts: [],
//     chartOfAccounts: [],
//     filteredChartOfAccounts: [],
//     costCenters: [],
//     partners: [],
//     departments: [],
//     selectedBankAccount: null,
//     formType: 'Debit',
//     status: 'Draft',
//   })

//   // Enhanced effect to handle form population - FIXED to prevent infinite loop
//   useEffect(() => {
//     if (
//       isBankVoucherDialogOpen &&
//       data &&
//       formState.filteredChartOfAccounts.length > 0 &&
//       formState.costCenters.length > 0 &&
//       formState.departments.length > 0 &&
//       formState.partners.length > 0 &&
//       formState.bankAccounts.length > 0
//     ) {
//       console.log('🔄 Starting form population...')
//       const voucherData = data[0]
//       console.log('📊 Voucher data:', voucherData)

//       // Helper functions to get objects by name with better matching
//       const getAccountByName = (accountName: string) => {
//         if (!accountName) return null
//         const cleanName = accountName.toLowerCase().trim()
//         const found = formState.filteredChartOfAccounts.find(
//           (acc) =>
//             acc.name?.toLowerCase().trim() === cleanName ||
//             acc.displayName?.toLowerCase().trim() === cleanName ||
//             acc.code?.toLowerCase().trim() === cleanName
//         )
//         console.log(`🔍 Account search for "${accountName}":`, found)
//         return found
//       }

//       const getCostCenterByName = (costCenterName: string) => {
//         if (!costCenterName) return null
//         const cleanName = costCenterName.toLowerCase().trim()
//         const found = formState.costCenters.find(
//           (cc) => cc.costCenterName?.toLowerCase().trim() === cleanName
//         )
//         console.log(`🔍 Cost center search for "${costCenterName}":`, found)
//         return found
//       }

//       const getDepartmentByName = (departmentName: string) => {
//         if (!departmentName) return null
//         const cleanName = departmentName.toLowerCase().trim()
//         const found = formState.departments.find(
//           (dept) => dept.departmentName?.toLowerCase().trim() === cleanName
//         )
//         console.log(`🔍 Department search for "${departmentName}":`, found)
//         return found
//       }

//       const getPartnerByName = (partnerName: string) => {
//         if (!partnerName) return null
//         const cleanName = partnerName.toLowerCase().trim()
//         const found = formState.partners.find(
//           (p) => p.name?.toLowerCase().trim() === cleanName
//         )
//         console.log(`🔍 Partner search for "${partnerName}":`, found)
//         return found
//       }

//       const getBankAccountByName = (bankAccountName: string) => {
//         if (!bankAccountName) return null
//         const cleanName = bankAccountName.toLowerCase().trim()
//         const found = formState.bankAccounts.find(
//           (bank) =>
//             bank.accountName?.toLowerCase().trim() === cleanName ||
//             bank.bankName?.toLowerCase().trim() === cleanName ||
//             `${bank.bankName} - ${bank.accountName}`.toLowerCase().trim() ===
//               cleanName ||
//             bank.accountNumber?.toLowerCase().trim() === cleanName
//         )
//         console.log(`🔍 Bank account search for "${bankAccountName}":`, found)
//         return found
//       }

//       // Find company and location from user data
//       const selectedCompany =
//         userData?.userCompanies?.find(
//           (comp) => comp.company?.companyName === voucherData.companyname
//         ) || userData?.userCompanies?.[0]

//       const selectedLocation =
//         userData?.userLocations?.find(
//           (loc) => loc.location?.address === voucherData.location
//         ) || userData?.userLocations?.[0]

//       console.log('🏢 Selected company:', selectedCompany)
//       console.log('📍 Selected location:', selectedLocation)

//       // Find bank account
//       const bankAccount = getBankAccountByName(voucherData.bankaccount || '')
//       console.log(
//         '🏦 Found bank account:',
//         bankAccount,
//         'for name:',
//         voucherData.bankaccount
//       )

//       // Map existing journal details with proper IDs and better error handling
//       const mappedJournalDetails = data.map((item, index) => {
//         console.log(`📝 Processing item ${index}:`, item)
//         const account = getAccountByName(item.accountsname || '')
//         const costCenter = getCostCenterByName(item.costcenter || '')
//         const department = getDepartmentByName(item.department || '')
//         const partner = getPartnerByName(item.partnar || '')

//         const mapped = {
//           accountId: account?.accountId || 0,
//           costCenterId: costCenter?.costCenterId || null,
//           departmentId: department?.departmentID || null,
//           debit: Number.parseFloat(item.debit?.toString() || '0'),
//           credit: Number.parseFloat(item.credit?.toString() || '0'),
//           analyticTags: null,
//           taxId: null,
//           resPartnerId: partner?.id || null,
//           notes: item.notes || '',
//           createdBy: userData?.userId || 0,
//         }

//         console.log(`✅ Mapped detail ${index}:`, mapped)
//         return mapped
//       })

//       // Set form values
//       const formValues = {
//         journalEntry: {
//           date: voucherData.date || new Date().toISOString().split('T')[0],
//           journalType: 'Bank Voucher',
//           companyId: selectedCompany?.company?.companyId || 0,
//           locationId: selectedLocation?.location?.locationId || 0,
//           currencyId: 1,
//           exchangeRate: 1,
//           amountTotal: voucherData.totalamount || 0,
//           payTo: voucherData.payTo || '',
//           payToText: voucherData.payTo || '',
//           notes: `Bank voucher for ${voucherData.journaltype} ${voucherData.voucherno}`,
//           createdBy: userData?.userId || 0,
//         },
//         journalDetails: mappedJournalDetails,
//       }

//       console.log('📋 Form values to be set:', formValues)

//       // Reset form with the populated values
//       form.reset(formValues)

//       // Set individual form values
//       form.setValue(
//         'journalEntry.companyId',
//         selectedCompany?.company?.companyId || 0
//       )
//       form.setValue(
//         'journalEntry.locationId',
//         selectedLocation?.location?.locationId || 0
//       )
//       form.setValue('journalEntry.amountTotal', voucherData.totalamount || 0)
//       form.setValue('journalEntry.payTo', voucherData.payTo || '')
//       form.setValue('journalEntry.payTo', voucherData.payTo || '') // Clear manual input
//       form.setValue(
//         'journalEntry.notes',
//         `Bank voucher for ${voucherData.journaltype} ${voucherData.voucherno}`
//       )
//       form.setValue(
//         'journalEntry.date',
//         voucherData.date || new Date().toISOString().split('T')[0]
//       )

//       // Set journal details
//       mappedJournalDetails.forEach((detail, index) => {
//         console.log(`🔧 Setting form values for detail ${index}:`, detail)
//         form.setValue(`journalDetails.${index}.accountId`, detail.accountId)
//         form.setValue(
//           `journalDetails.${index}.costCenterId`,
//           detail.costCenterId
//         )
//         form.setValue(
//           `journalDetails.${index}.departmentId`,
//           detail.departmentId
//         )
//         form.setValue(`journalDetails.${index}.debit`, detail.debit)
//         form.setValue(`journalDetails.${index}.credit`, detail.credit)
//         form.setValue(
//           `journalDetails.${index}.resPartnerId`,
//           detail.resPartnerId
//         )
//         form.setValue(`journalDetails.${index}.notes`, detail.notes)
//       })

//       // Update formState for bank account - ONLY if it's different to prevent infinite loop
//       if (
//         bankAccount &&
//         (!formState.selectedBankAccount ||
//           formState.selectedBankAccount.id !== bankAccount.id)
//       ) {
//         setFormState((prev) => ({
//           ...prev,
//           selectedBankAccount: {
//             id: bankAccount.id,
//             glCode: bankAccount.glAccountId || 0,
//           },
//         }))
//       }

//       // Trigger form validation
//       setTimeout(() => {
//         form.trigger()
//         console.log('✅ Form values after population:', form.getValues())
//       }, 100)

//       console.log('✅ Form population completed')
//     }
//   }, [
//     isBankVoucherDialogOpen,
//     data,
//     formState.filteredChartOfAccounts.length,
//     formState.costCenters.length,
//     formState.departments.length,
//     formState.partners.length,
//     formState.bankAccounts.length,
//     formState.bankAccounts,
//     formState.costCenters,
//     formState.departments,
//     formState.partners,
//     formState.filteredChartOfAccounts,
//     formState.selectedBankAccount,

//     userData,
//     form,
//   ])

//   // Simplified handleReceiptClick function
//   const handleReceiptClick = React.useCallback(() => {
//     if (!data || data.length === 0) {
//       toast({
//         title: 'Error',
//         description: 'No voucher data available',
//         variant: 'destructive',
//       })
//       return
//     }

//     console.log('🚀 Opening bank voucher dialog with data:', data[0])

//     // Update form state
//     setFormState((prevState) => ({
//       ...prevState,
//       status: 'Draft',
//       formType: 'Debit',
//       selectedBankAccount: null, // Reset bank account selection
//     }))

//     // Open dialog - the useEffect above will handle populating the form
//     setIsBankVoucherDialogOpen(true)
//   }, [data])

//   // Initialize form state data
//   useEffect(() => {
//     if (userData) {
//       setFormState((prevState) => ({
//         ...prevState,
//         companies: userData.userCompanies,
//         locations: userData.userLocations,
//       }))
//     }
//   }, [userData])

//   // Fetch initial data for bank voucher form
//   useEffect(() => {
//     const checkUserData = () => {
//       const storedUserData = localStorage.getItem('currentUser')
//       const storedToken = localStorage.getItem('authToken')
//       if (!storedUserData || !storedToken) {
//         router.push('/')
//         return
//       }
//     }

//     checkUserData()

//     const fetchInitialData = async () => {
//       const search = ''
//       if (!token) return

//       try {
//         const [
//           bankAccountsResponse,
//           chartOfAccountsResponse,
//           costCentersResponse,
//           partnersResponse,
//           departmentsResponse,
//         ] = await Promise.all([
//           getAllBankAccounts(token),
//           getAllChartOfAccounts(token),
//           getAllCostCenters(token),
//           getResPartnersBySearch(search, token),
//           getAllDepartments(token),
//         ])

//         if (
//           bankAccountsResponse?.error?.status === 441 ||
//           chartOfAccountsResponse?.error?.status === 441 ||
//           costCentersResponse?.error?.status === 441 ||
//           partnersResponse?.error?.status === 441 ||
//           departmentsResponse?.error?.status === 441
//         ) {
//           router.push('/unauthorized-access')
//           return
//         }

//         const filteredCoa = chartOfAccountsResponse.data?.filter((account) => {
//           return account.isGroup === false
//         })

//         console.log('📊 Fetched data:', {
//           bankAccounts: bankAccountsResponse.data?.length || 0,
//           chartOfAccounts: chartOfAccountsResponse.data?.length || 0,
//           filteredCoa: filteredCoa?.length || 0,
//           costCenters: costCentersResponse.data?.length || 0,
//           partners: partnersResponse.data?.length || 0,
//           departments: departmentsResponse.data?.length || 0,
//         })

//         setFormState((prevState) => ({
//           ...prevState,
//           bankAccounts: bankAccountsResponse.data || [],
//           chartOfAccounts: chartOfAccountsResponse.data || [],
//           filteredChartOfAccounts: filteredCoa || [],
//           costCenters: costCentersResponse.data || [],
//           partners: partnersResponse.data || [],
//           departments: departmentsResponse.data || [],
//         }))
//       } catch (error) {
//         console.error('Error fetching initial data:', error)
//         toast({
//           title: 'Error',
//           description: 'Failed to fetch required data',
//           variant: 'destructive',
//         })
//       }
//     }

//     fetchInitialData()
//   }, [token, router])

//   // Enhanced onSubmit function with better validation
//   const onSubmit = async (
//     values: JournalEntryWithDetails,
//     status: 'Draft' | 'Posted'
//   ) => {
//     // Validate that required fields are filled
//     if (!formState.selectedBankAccount) {
//       toast({
//         title: 'Error',
//         description: 'Please select a bank account',
//         variant: 'destructive',
//       })
//       return
//     }

//     if (
//       !values.journalEntry.amountTotal ||
//       values.journalEntry.amountTotal <= 0
//     ) {
//       toast({
//         title: 'Error',
//         description: 'Please enter a valid amount',
//         variant: 'destructive',
//       })
//       return
//     }

//     const updatedValues = {
//       ...values,
//       journalEntry: {
//         ...values.journalEntry,
//         state: status === 'Draft' ? 0 : 1,
//         notes: values.journalEntry.notes || '',
//         journalType: 'Bank Voucher',
//         currencyId: values.journalEntry.currencyId || 1,
//         amountTotal: values.journalEntry.amountTotal || 0,
//         payTo: values.journalEntry.payTo || '',
//         payToText: values.journalEntry.payTo || '',
//         createdBy: userData?.userId ?? 0,
//       },
//       journalDetails: values.journalDetails.map((detail) => ({
//         ...detail,
//         notes: detail.notes || '',
//         createdBy: userData?.userId ?? 0,
//       })),
//     }

//     // Add bank account entry
//     const updateValueswithBank = {
//       ...updatedValues,
//       journalDetails: [
//         ...updatedValues.journalDetails,
//         {
//           accountId: formState.selectedBankAccount?.glCode || 0,
//           costCenterId: null,
//           departmentId: null,
//           debit:
//             formState.formType === 'Debit'
//               ? updatedValues.journalEntry.amountTotal
//               : 0,
//           credit:
//             formState.formType === 'Credit'
//               ? updatedValues.journalEntry.amountTotal
//               : 0,
//           analyticTags: null,
//           taxId: null,
//           resPartnerId: null,
//           bankaccountid: formState.selectedBankAccount?.id,
//           notes: updatedValues.journalEntry.notes || '',
//           createdBy: userData?.userId ?? 0,
//         },
//       ],
//     }

//     try {
//       const response = await createJournalEntryWithDetails(
//         updateValueswithBank,
//         token
//       )
//       if (response.error || !response.data) {
//         toast({
//           title: 'Error',
//           description: response.error?.message || 'Error creating Bank Voucher',
//           variant: 'destructive',
//         })
//       } else {
//         toast({
//           title: 'Success',
//           description: 'Bank Voucher created successfully',
//         })
//         // Close popup and reset form
//         setIsBankVoucherDialogOpen(false)
//         form.reset()
//         setFormState((prevState) => ({
//           ...prevState,
//           selectedBankAccount: null,
//           formType: 'Debit',
//           status: 'Draft',
//         }))
//       }
//     } catch (error) {
//       console.error('Error creating bank voucher:', error)
//       toast({
//         title: 'Error',
//         description: 'An unexpected error occurred',
//         variant: 'destructive',
//       })
//     }
//   }

//   useEffect(() => {
//     async function fetchVoucher() {
//       if (!voucherid || !token) return
//       try {
//         const response = await getSingleVoucher(voucherid as string, token)
//         if (response.error || !response.data) {
//           toast({
//             title: 'Error',
//             description:
//               response.error?.message || 'Failed to get Voucher Data',
//           })
//         } else {
//           console.log('Fetched voucher data:', response.data)
//           setData(response.data.reverse())
//         }
//       } catch (error) {
//         toast({
//           title: 'Error',
//           description:
//             'An unexpected error occurred while fetching the voucher.',
//         })
//       }
//     }
//     fetchVoucher()
//   }, [voucherid, token])

//   const handleReferenceEdit = (index: number, currentText: string) => {
//     setEditingReferenceIndex(index)
//     setEditingReferenceText(currentText)
//   }

//   React.useEffect(() => {
//     if (userData) {
//       setUserId(userData.userId)
//     } else {
//     }
//   }, [userData])

//   // Updated handleReferenceSave function to persist changes to database
//   const handleReferenceSave = async () => {
//     if (data && editingReferenceIndex !== null && voucherid && token) {
//       setIsSavingNotes(true)
//       try {
//         const currentItem = data[editingReferenceIndex]
//         // Call API to update the notes in the database
//         await updateVoucherNotes(currentItem.id, editingReferenceText, token)
//         // Update local state only after successful API call
//         const updatedData = [...data]
//         updatedData[editingReferenceIndex] = {
//           ...updatedData[editingReferenceIndex],
//           notes: editingReferenceText,
//         }
//         setData(updatedData)
//         setEditingReferenceIndex(null)
//         toast({
//           title: 'Success',
//           description: 'Notes updated successfully',
//         })
//       } catch (error) {
//         console.error('Error updating notes:', error)
//         toast({
//           title: 'Error',
//           description: 'Failed to update notes. Please try again.',
//           variant: 'destructive',
//         })
//       } finally {
//         setIsSavingNotes(false)
//       }
//     }
//   }

//   // Add cancel function for editing
//   const handleReferenceCancel = () => {
//     setEditingReferenceIndex(null)
//     setEditingReferenceText('')
//   }

//   const handleReverseVoucher = () => {
//     setIsAlertDialogOpen(true)
//   }

//   const confirmReverseVoucher = async () => {
//     setIsAlertDialogOpen(false)
//     const createdId = userId ?? 0 // Replace with actual user ID
//     const voucherId = data?.[0].voucherno

//     if (!voucherId || !data) return

//     if (!voucherId) {
//       toast({
//         title: 'Error',
//         description: 'Invalid voucher number',
//         variant: 'destructive',
//       })
//       return
//     }

//     try {
//       setIsReversingVoucher(true)
//       const response = await reverseJournalVoucher(
//         Number(voucherid),
//         createdId,
//         token
//       )
//       if (!response.data || response.error) {
//         toast({
//           title: 'Error',
//           description:
//             response.error?.message || 'Failed to reverse the voucher',
//           variant: 'destructive',
//         })
//       } else {
//         toast({
//           title: 'Success',
//           description: 'Voucher reversed successfully',
//         })
//         router.refresh()
//       }
//     } catch (error: any) {
//       console.error('Reverse voucher error:', error)
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to reverse the voucher',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsReversingVoucher(false)
//     }
//   }

//   if (!data) {
//     return (
//       <div className="felx items-center justify-center h-screen">
//         <Loader />
//       </div>
//     )
//   }

//   return (
//     <>
//       <style dangerouslySetInnerHTML={{ __html: printStyles }} />
//       <Card ref={contentRef} className="w-full max-w-5xl mx-auto mt-24">
//         <CardContent className="p-6">
//           {/* Header Section */}
//           <h1 className="text-center text-3xl font-bold">
//             {data[0].companyname}
//           </h1>
//           <p className="text-center mb-10 text-xl font-semibold">
//             {data[0].location}{' '}
//           </p>
//           <div className="grid grid-cols-2 gap-6 mb-8">
//             <div className="space-y-4">
//               <div className="grid grid-cols-[120px,1fr] gap-8">
//                 <span className="font-medium">Voucher No:</span>
//                 <span>{data[0].voucherno}</span>
//               </div>
//               <div className="grid grid-cols-[120px,1fr] gap-8">
//                 <span className="font-medium whitespace-nowrap">
//                   Accounting Date:
//                 </span>
//                 <span>{data[0].date}</span>
//               </div>
//               <div className="grid grid-cols-[120px,1fr] gap-8">
//                 <span className="font-medium whitespace-nowrap capitalize">
//                   Created By: {data[0].createdby}
//                 </span>
//                 <span></span>
//               </div>
//             </div>
//             <div className="flex justify-end gap-2 no-print">
//               {data[0].journaltype === VoucherTypes.BankVoucher && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={handleReceiptClick}
//                 >
//                   <Pencil className="w-4 h-4 mr-2" />
//                   New Bank Voucher
//                 </Button>
//               )}
//               <AlertDialog
//                 open={isAlertDialogOpen}
//                 onOpenChange={setIsAlertDialogOpen}
//               >
//                 <AlertDialogTrigger asChild>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={handleReverseVoucher}
//                     disabled={isReversingVoucher}
//                   >
//                     <RotateCcw className="w-4 h-4 mr-2" />
//                     {isReversingVoucher ? 'Reversing...' : 'Reverse'}
//                   </Button>
//                 </AlertDialogTrigger>
//                 <AlertDialogContent className="bg-white">
//                   <AlertDialogHeader>
//                     <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                     <AlertDialogDescription>
//                       This action will reverse the voucher. This action cannot
//                       be undone. Are you sure?
//                     </AlertDialogDescription>
//                   </AlertDialogHeader>
//                   <AlertDialogFooter>
//                     <AlertDialogCancel>No</AlertDialogCancel>
//                     <AlertDialogAction onClick={confirmReverseVoucher}>
//                       Yes
//                     </AlertDialogAction>
//                   </AlertDialogFooter>
//                 </AlertDialogContent>
//               </AlertDialog>
//               {data[0].journaltype === VoucherTypes.BankVoucher && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => printCheckFn()}
//                 >
//                   <Printer className="w-4 h-4 mr-2" />
//                   Print Check
//                 </Button>
//               )}
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => reactToPrintFn()}
//               >
//                 <Printer className="w-4 h-4 mr-2" />
//                 Print Voucher
//               </Button>
//             </div>
//           </div>

//           {/* Bank Voucher Dialog */}
//           <Dialog
//             open={isBankVoucherDialogOpen}
//             onOpenChange={setIsBankVoucherDialogOpen}
//           >
//             <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>
//                   Create Bank Voucher from {data[0].journaltype}{' '}
//                   {data[0].voucherno}
//                 </DialogTitle>
//               </DialogHeader>
//               <div className="mt-4">
//                 <Form {...form}>
//                   <form
//                     onSubmit={form.handleSubmit((values) => {
//                       console.log('Submitting form with values:', values)
//                       onSubmit(values, formState.status)
//                     })}
//                     className="space-y-8"
//                   >
//                     {validationError && (
//                       <div className="text-red-500 text-sm mb-4">
//                         {validationError}
//                       </div>
//                     )}
//                     {amountError && (
//                       <div className="text-red-500 text-sm mb-4">
//                         {amountError}
//                       </div>
//                     )}
//                     <BankVoucherMaster
//                       form={form}
//                       formState={formState}
//                       requisition={undefined}
//                       setFormState={setFormState}
//                       disableJournalType={true} // Disable Type field when coming from invoice
//                     />
//                     <BankVoucherDetails
//                       form={form}
//                       formState={formState}
//                       requisition={undefined}
//                       partners={formState.partners}
//                       isFromInvoice={true} // Add this when coming from invoice
//                       invoicePartnerName={data?.[0]?.partnar || ''} // Add partner name from voucher data
//                     />
//                     <BankVoucherSubmit
//                       form={form}
//                       onSubmit={onSubmit}
//                       disabled={!!amountError} // Disable submit if there's an amount error
//                     />
//                   </form>
//                 </Form>
//               </div>
//             </DialogContent>
//           </Dialog>

//           {/* Journal Items Table */}
//           <Card className="mb-6">
//             <CardHeader>
//               <CardTitle>
//                 {data[0]?.journaltype}{' '}
//                 {data[0]?.state === 0 && (
//                   <span className="text-lg"> (Draft) </span>
//                 )}
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Table className="shadow-md border">
//                 <TableHeader className="bg-slate-200 shadow-md">
//                   <TableRow>
//                     <TableHead>Accounts</TableHead>
//                     <TableHead>Bank Account</TableHead>
//                     <TableHead>Cost Center</TableHead>
//                     <TableHead>Unit</TableHead>
//                     <TableHead>Partner</TableHead>
//                     <TableHead>
//                       {data[0].journaltype === VoucherTypes.BankVoucher
//                         ? 'Cheque No.'
//                         : 'Notes'}
//                     </TableHead>
//                     {data[0].journaltype === VoucherTypes.CashVoucher ? (
//                       <TableHead>Amount</TableHead>
//                     ) : (
//                       <>
//                         <TableHead>Debit</TableHead>
//                         <TableHead>Credit</TableHead>
//                       </>
//                     )}
//                     <TableHead className="no-print">Action</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {(data[0].journaltype === VoucherTypes.CashVoucher
//                     ? data // Only the first item
//                     : data
//                   ) // All items
//                     .map((item, index) => (
//                       <TableRow key={item.id}>
//                         <TableCell>{item.accountsname || 'N/A'}</TableCell>
//                         <TableCell>
//                           {item.bankaccount && item.bankaccountName
//                             ? `${item.bankaccount} - ${item.bankaccountName}-${item.accountNumber}`
//                             : 'N/A'}
//                         </TableCell>

//                         <TableCell>{item.costcenter || 'N/A'}</TableCell>
//                         <TableCell>{item.department || 'N/A'}</TableCell>
//                         <TableCell>{item.partnar || 'N/A'}</TableCell>
//                         <TableCell>
//                           {editingReferenceIndex === index ? (
//                             <div className="flex gap-2 items-start align-top">
//                               <Input
//                                 type="text"
//                                 value={editingReferenceText}
//                                 onChange={(e) =>
//                                   setEditingReferenceText(e.target.value)
//                                 }
//                                 className="min-w-[200px]"
//                                 disabled={isSavingNotes}
//                               />
//                             </div>
//                           ) : (
//                             item.detail_notes
//                           )}
//                         </TableCell>

//                         <TableCell>
//                           {item.credit > 0
//                             ? `${item.credit.toFixed(2)} `
//                             : `${item.debit.toFixed(2)}`}
//                         </TableCell>

//                         <TableCell className="no-print">
//                           {editingReferenceIndex === index ? (
//                             <div className="flex gap-2">
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={handleReferenceSave}
//                                 disabled={isSavingNotes}
//                               >
//                                 {isSavingNotes ? (
//                                   <Loader2 className="w-4 h-4 animate-spin" />
//                                 ) : (
//                                   <Check className="w-4 h-4" />
//                                 )}
//                               </Button>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={handleReferenceCancel}
//                                 disabled={isSavingNotes}
//                               >
//                                 Cancel
//                               </Button>
//                             </div>
//                           ) : (
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() =>
//                                 handleReferenceEdit(index, item.notes)
//                               }
//                             >
//                               Edit
//                             </Button>
//                           )}
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                 </TableBody>
//               </Table>
//               <div className="mt-6 grid grid-cols-[170px,1fr] gap-2">
//                 <span className="font-medium">Reference:</span>
//                 <span>{data?.[0]?.detail_notes || 'Not available'}</span>
//               </div>
//               {/* Total Debit Amount */}
//               <div className="mt-4 grid grid-cols-[170px,1fr] gap-2">
//                 <span className="font-medium">Amount:</span>
//                 <span>
//                   {data[data.length - 1].totalamount.toFixed(2)}{' '}
//                   {data[data.length - 1].currency}
//                 </span>
//               </div>
//               <div className="mt-4 grid grid-cols-[170px,1fr] gap-2">
//                 <span className="font-medium">Amount in word:</span>
//                 <span className="capitalize">
//                   {new ToWords().convert(
//                     Number(data[data.length - 1].totalamount.toFixed(2))
//                   )}{' '}
//                   {data[data.length - 1].currency} only
//                 </span>
//               </div>
//               <div className="flex justify-between mt-20">
//                 <h1 className="border-t-2 border-black pt-2">
//                   Signature of Recipient
//                 </h1>
//                 <h1 className="border-t-2 border-black pt-2">Prepared by</h1>
//                 <h1 className="border-t-2 border-black pt-2">Checked by</h1>
//                 <h1 className="border-t-2 border-black pt-2">
//                   Approved by CM/MD
//                 </h1>
//               </div>
//             </CardContent>
//           </Card>
//         </CardContent>
//       </Card>

//       {/* Hidden check for printing - completely separate from the main card */}
//       {data.map((item, index) => (
//         <div className="hidden" key={index}>
//           <div ref={checkRef} className="p-8 bg-white">
//             <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden">
//               <div className="relative p-6 border border-gray-300 bg-white">
//                 {/* Bank Header */}
//                 <div className="flex justify-end items-start mb-8">
//                   <div className="text-right">
//                     <div className="flex items-center justify-end">
//                       <span className="text-sm mr-2">{item.date}</span>
//                     </div>
//                   </div>
//                 </div>
//                 {/* Payee Section */}
//                 <div className="mb-6">
//                   <div className="flex items-center mb-1">
//                     <p className="flex-1 pb-1 pt-2 ">{data[0]?.payTo}</p>
//                   </div>
//                 </div>
//                 {/* Amount Section */}
//                 <div className="flex mb-6">
//                   <div className="flex-1">
//                     <p className="flex-1 pb-1 pt-2 ">
//                       {item.debit === 0
//                         ? toWords(item.credit)
//                         : toWords(item.debit)}
//                     </p>
//                   </div>
//                   <div className="px-2 py-1 flex items-center whitespace-nowrap ml-5">
//                     <span className="font-medium">
//                       {item.debit === 0 ? item.credit : item.debit}/-
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ))}
//     </>
//   )
// }

