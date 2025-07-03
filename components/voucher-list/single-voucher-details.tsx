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
import { createJournalEntryWithDetails, editJournalDetailsNotes } from '@/api/vouchers-api'
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
const updateVoucherNotes = async (
  id: number,
  notes: string,
  token: string
) => {
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
  const [isSavingNotes, setIsSavingNotes] = useState(false) // Add loading state for saving notes
  const contentRef = useRef<HTMLDivElement>(null)
  const checkRef = useRef<HTMLDivElement>(null)
  const reactToPrintFn = useReactToPrint({ contentRef })
  const printCheckFn = useReactToPrint({ contentRef: checkRef })
  const [userId, setUserId] = React.useState<number | null>(null)
  const [isBankVoucherDialogOpen, setIsBankVoucherDialogOpen] = useState(false)

  const isContraVoucher = data?.[0]?.journaltype === VoucherTypes.ContraVoucher

  // Add missing state for validationError and amountError
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

  const handleReceiptClick = React.useCallback(() => {
    // Pre-populate the bank voucher form with single voucher data
    form.reset({
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
        journalType: 'Bank Voucher', // Changed from 'Bank Voucher' to 'Receipt'
        companyId: 0, // Set to 0 or replace with a valid property if available
        locationId: 0,
        currencyId: 1,
        exchangeRate: 1,
        amountTotal: 0,
        payTo: '',
        notes: `Receipt for Invoice ${data?.[0]}`,
        createdBy: userData?.userId || 0,
      },
      journalDetails: [
        {
          accountId: 0,
          costCenterId: null,
          departmentId: null,
          debit: data?.[0]?.totalamount || 0, // Set to the invoice amount
          credit: 0,
          analyticTags: null,
          taxId: null,
          resPartnerId: data?.[0]?.partner || null,
          notes: `Receipt Invoice ${data?.[0]}`,
          createdBy: userData?.userId || 0,
        },
      ],
    })

    setIsBankVoucherDialogOpen(true)
  }, [form, userData, data])

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
        console.log('No user data or token found in localStorage')
        router.push('/')
        return
      }
    }

    checkUserData()

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

  // Bank voucher submission logic
  const onSubmit = async (
    values: JournalEntryWithDetails,
    status: 'Draft' | 'Posted'
  ) => {
    const updatedValues = {
      ...values,
      journalEntry: {
        ...values.journalEntry,
        companyId: data?.[0]?.voucherid || 0,
        state: status === 'Draft' ? 0 : 1,
        notes: values.journalEntry.notes || '',
        journalType: 'Bank Voucher', // Changed from 'Bank Voucher' to 'Receipt'
        currencyId: values.journalEntry.currencyId || 1,
        amountTotal: values.journalEntry.amountTotal || 0,
        createdBy: userData?.userId ?? 0,
      },
      journalDetails: values.journalDetails.map((detail) => ({
        ...detail,
        notes: detail.notes || '',
        createdBy: userData?.userId ?? 0,
      })),
    }

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

    const response = await createJournalEntryWithDetails(
      updateValueswithBank,
      token
    )

    if (response.error || !response.data) {
      toast({
        title: 'Error',
        description: response.error?.message || 'Error creating Bank Voucher',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Bank Voucher created successfully',
      })
      // Close popup and reset form
      setIsBankVoucherDialogOpen(false)
      form.reset()
      setFormState({
        ...formState,
        selectedBankAccount: null,
        formType: 'Credit',
        status: 'Draft',
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
          setData(response.data)
          console.log('🚀 ~ fetchVoucher ~ response.data.data:', response.data)
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
      console.log(
        'Current userId from localStorage in everywhere:',
        userData.userId
      )
    } else {
      console.log('No user data found in localStorage')
    }
  }, [userData])

  // Updated handleReferenceSave function to persist changes to database
  const handleReferenceSave = async () => {
    if (data && editingReferenceIndex !== null && voucherid && token) {
      setIsSavingNotes(true)

      try {
        const currentItem = data[editingReferenceIndex]

        // Call API to update the notes in the database
        await updateVoucherNotes(
          currentItem.id,
          editingReferenceText,
          token
        )

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
    const createdId = userId ?? 0 // Replace with actual user ID
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
          <Dialog
            open={isBankVoucherDialogOpen}
            onOpenChange={setIsBankVoucherDialogOpen}
          >
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {/* Create Receipt - Invoice {selectedInvoice?.LCPINo} */}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((values) =>
                      onSubmit(values, formState.status)
                    )}
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
                      disableJournalType={true} // Disable Type field when coming from invoice
                    />
                    <BankVoucherDetails
                      form={form}
                      formState={formState}
                      requisition={undefined}
                      partners={formState.partners}
                      isFromInvoice={true} // Add this when coming from invoice
                      invoicePartnerName={data?.[0]?.partner || ''} // Add partner name from voucher data
                    />
                    <BankVoucherSubmit
                      form={form}
                      onSubmit={onSubmit}
                      disabled={!!amountError} // Disable submit if there's an amount error
                    />
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>

          {/* Journal Items Table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{data[0]?.journaltype}</CardTitle>
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
                    {data[0].journaltype === VoucherTypes.CashVoucher ? (
                      <TableHead>Amount</TableHead>
                    ) : (
                      <>
                        <TableHead>Debit</TableHead>
                        <TableHead>Credit</TableHead>
                      </>
                    )}
                    <TableHead className="no-print">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data[0].journaltype === VoucherTypes.CashVoucher
                    ? [data[0]] // Only the first item
                    : data
                  ) // All items
                    .map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.accountsname || 'N/A'}</TableCell>
                        <TableCell>{item.bankaccount || 'N/A'}</TableCell>
                        <TableCell>{item.costcenter || 'N/A'}</TableCell>
                        <TableCell>{item.department || 'N/A'}</TableCell>
                        <TableCell>{item.partner || 'N/A'}</TableCell>
                        <TableCell>
                          {editingReferenceIndex === index ? (
                            <div className="flex gap-2 items-center">
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
                            item.notes
                          )}
                        </TableCell>
                        {data[0].journaltype === VoucherTypes.CashVoucher ? (
                          <TableCell>{item.totalamount}</TableCell>
                        ) : (
                          <>
                            <TableCell>{item.debit}</TableCell>
                            <TableCell>{item.credit}</TableCell>
                          </>
                        )}
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
                <span>{data[data.length - 1].notes}</span>
              </div>

              {/* Total Debit Amount */}
              <div className="mt-4 grid grid-cols-[170px,1fr] gap-2">
                <span className="font-medium">Amount:</span>
                <span>
                  {data[data.length - 1].totalamount}{' '}
                  {data[data.length - 1].currency}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-[170px,1fr] gap-2">
                <span className="font-medium">Amount in word:</span>
                <span className="capitalize">
                  {toWords(data[data.length - 1].totalamount)}{' '}
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

      {/* Hidden check for printing - completely separate from the main card */}
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
