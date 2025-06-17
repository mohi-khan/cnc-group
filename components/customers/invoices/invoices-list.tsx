'use client'
import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getInvoiceData, getInvoiceById } from '@/api/invoices-api'
import type { SalesInvoiceType } from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import Loader from '@/utils/loader'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { Form } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  type FormStateType,
} from '@/utils/type'
import {
  getAllBankAccounts,
  getAllChartOfAccounts,
  getAllCostCenters,
  getAllDepartments,
  getResPartnersBySearch,
} from '@/api/common-shared-api'
import { createJournalEntryWithDetails } from '@/api/vouchers-api'
import BankVoucherMaster from '@/components/bank/bank-vouchers/bank-voucher-master'
import BankVoucherDetails from '@/components/bank/bank-vouchers/bank-voucher-details'
import BankVoucherSubmit from '@/components/bank/bank-vouchers/bank-voucher-submit'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const InvoicesList = () => {
  useInitializeUser()
  const router = useRouter()

  const [token] = useAtom(tokenAtom)
  const [userData] = useAtom(userDataAtom)
  const [invoices, setInvoices] = useState<SalesInvoiceType[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] =
    useState<SalesInvoiceType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBankVoucherDialogOpen, setIsBankVoucherDialogOpen] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage] = useState(10)
  const [originalInvoiceAmount, setOriginalInvoiceAmount] = useState<number>(0)

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

  const fetchInvoices = React.useCallback(async () => {
    if (!token) return
    try {
      const response = await getInvoiceData(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        console.log('Unauthorized access')
        return
      } else if (response.error || !response.data) {
        console.error('Error invoice:', response.error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error?.message || 'Failed to fetch Invoices',
        })
      } else {
        setInvoices(response.data)
      }
      console.log('Invoices fetched successfully:', response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }, [token, router])

  const handleInvoiceClick = React.useCallback(
    async (id: number) => {
      const response = await getInvoiceById(token, id)
      setSelectedInvoice(response.data)
      setIsDialogOpen(true)
    },
    [token]
  )

  const handleReceiptClick = React.useCallback(
    (invoice: SalesInvoiceType) => {
      setSelectedInvoice(invoice)
      setOriginalInvoiceAmount(invoice.invoiceAmount) // Store original amount

      // Pre-populate the bank voucher form with invoice data
      form.reset({
        journalEntry: {
          date: new Date().toISOString().split('T')[0],
          journalType: 'Bank Voucher', // Changed from 'Bank Voucher' to 'Receipt'
          companyId: invoice.companyId || 0,
          locationId: 0,
          currencyId: invoice.currencyId,
          exchangeRate: 1,
          amountTotal: invoice.invoiceAmount,
          payTo: invoice.apporvedBy || '',
          notes: invoice.LCPINo || '',
          createdBy: userData?.userId || 0,
        },
        journalDetails: [
          {
            accountId: 0,
            costCenterId: null,
            departmentId: null,
            debit: invoice.invoiceAmount,
            credit: 0,
            analyticTags: null,
            taxId: null,
            resPartnerId: invoice.res_partnerId || null,
            notes: `Receipt Invoice ${invoice.LCPINo}`,
            createdBy: userData?.userId || 0,
          },
        ],
      })

      setIsBankVoucherDialogOpen(true)
    },
    [form, userData]
  )

  // Add this after the form setup
  const watchedAmount = form.watch('journalEntry.amountTotal')
  const [amountError, setAmountError] = useState<string>('')

  // Add useEffect to validate amount changes
  useEffect(() => {
    if (originalInvoiceAmount > 0 && watchedAmount > originalInvoiceAmount) {
      setAmountError(
        `You cannot input greater than existing amount (${formatCurrency(originalInvoiceAmount, selectedInvoice?.currencyName || 'USD')})`
      )
    } else {
      setAmountError('')
    }
  }, [watchedAmount, originalInvoiceAmount, selectedInvoice?.currencyName])

  // Bank voucher submission logic
  const onSubmit = async (
    values: JournalEntryWithDetails,
    status: 'Draft' | 'Posted'
  ) => {
    // Add amount validation check
    if (values.journalEntry.amountTotal > originalInvoiceAmount) {
      setValidationError(
        `Amount cannot be greater than the original invoice amount of ${formatCurrency(originalInvoiceAmount, selectedInvoice?.currencyName || 'USD')}`
      )
      return
    }

    const totalDetailsAmount = values.journalDetails.reduce(
      (sum, detail) => sum + (detail.debit || detail.credit || 0),
      0
    )

    if (Math.abs(values.journalEntry.amountTotal - totalDetailsAmount) > 0.01) {
      setValidationError(
        "The total amount in journal details doesn't match the journal entry amount total."
      )
      return
    }

    setValidationError(null)

    const updatedValues = {
      ...values,
      journalEntry: {
        ...values.journalEntry,
        state: status === 'Draft' ? 0 : 1,
        notes: values.journalEntry.notes || '',
        journalType: 'Bank Voucher', // Changed from 'Bank Voucher' to 'Receipt'
        currencyId: values.journalEntry.currencyId || 1,
        amountTotal: totalDetailsAmount,
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
    fetchInvoices()
  }, [fetchInvoices])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sales Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>LCPI No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Shipper</TableHead>
                  <TableHead>Consignee</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Consign Address</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Approval Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Partner Name</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!Array.isArray(invoices) || invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-8">
                      <Loader />
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices
                    .slice(
                      (currentPage - 1) * rowsPerPage,
                      currentPage * rowsPerPage
                    )
                    .map((invoice, id) => (
                      <TableRow key={id}>
                        <TableCell className="font-medium">
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-slate-100"
                            onClick={() => handleInvoiceClick(invoice.id)}
                          >
                            {invoice.LCPINo}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(invoice.date)}</TableCell>
                        <TableCell>{invoice.shipper}</TableCell>
                        <TableCell>{invoice.consignee}</TableCell>
                        <TableCell>{invoice.client}</TableCell>
                        <TableCell
                          className="max-w-xs truncate"
                          title={invoice.address}
                        >
                          {invoice.address}
                        </TableCell>
                        <TableCell
                          className="max-w-xs truncate"
                          title={invoice.consignAddress}
                        >
                          {invoice.consignAddress}
                        </TableCell>
                        <TableCell>{invoice.apporvedBy}</TableCell>
                        <TableCell>
                          {formatDate(invoice.approvalDate)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(
                            invoice.invoiceAmount,
                            invoice.currencyName
                          )}
                        </TableCell>
                        <TableCell>{invoice.res_partnerName}</TableCell>
                        <TableCell>{invoice.companyName}</TableCell>
                        <TableCell>{invoice.currencyName}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReceiptClick(invoice)}
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
          {Array.isArray(invoices) && invoices.length > 0 && (
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                {Math.min(currentPage * rowsPerPage, invoices.length)} of{' '}
                {invoices.length} invoices
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }}
                      className={
                        currentPage === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: Math.ceil(invoices.length / rowsPerPage) },
                    (_, i) => i + 1
                  )
                    .filter((page) => {
                      const totalPages = Math.ceil(
                        invoices.length / rowsPerPage
                      )
                      if (totalPages <= 7) return true
                      if (page === 1 || page === totalPages) return true
                      if (page >= currentPage - 1 && page <= currentPage + 1)
                        return true
                      return false
                    })
                    .map((page, index, array) => {
                      const prevPage = array[index - 1]
                      const showEllipsis = prevPage && page - prevPage > 1

                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(page)
                              }}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      )
                    })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage((prev) =>
                          Math.min(
                            prev + 1,
                            Math.ceil(invoices.length / rowsPerPage)
                          )
                        )
                      }}
                      className={
                        currentPage === Math.ceil(invoices.length / rowsPerPage)
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Voucher Dialog */}
      <Dialog
        open={isBankVoucherDialogOpen}
        onOpenChange={setIsBankVoucherDialogOpen}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Create Receipt - Invoice {selectedInvoice?.LCPINo}
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
                  <div className="text-red-500 text-sm mb-4">{amountError}</div>
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
                  invoicePartnerName={selectedInvoice?.res_partnerName || ''} // Add partner name from invoice
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

      {/* Invoice Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="font-semibold">LCPI No:</div>
                <div>{selectedInvoice.LCPINo}</div>
                <div className="font-semibold">Date:</div>
                <div>{formatDate(selectedInvoice.date)}</div>
                <div className="font-semibold">Amount:</div>
                <div>
                  {formatCurrency(
                    selectedInvoice.invoiceAmount,
                    selectedInvoice.currencyName
                  )}
                </div>
                <div className="font-semibold">Shipper:</div>
                <div>{selectedInvoice.shipper}</div>
                <div className="font-semibold">Consignee:</div>
                <div>{selectedInvoice.consignee}</div>
                <div className="font-semibold">Client:</div>
                <div>{selectedInvoice.client}</div>
                <div className="font-semibold">Address:</div>
                <div>{selectedInvoice.address}</div>
                <div className="font-semibold">Consign Address:</div>
                <div>{selectedInvoice.consignAddress}</div>
                <div className="font-semibold">Approved By:</div>
                <div>{selectedInvoice.apporvedBy}</div>
                <div className="font-semibold">Approval Date:</div>
                <div>{formatDate(selectedInvoice.approvalDate)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default InvoicesList

// 'use client'
// import React, { useEffect, useState } from 'react'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { getInvoiceData, getInvoiceById } from '@/api/invoices-api'
// import type { SalesInvoiceType } from '@/utils/type'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import Loader from '@/utils/loader'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import { Button } from '@/components/ui/button'
// import { useRouter } from 'next/navigation'
// import { toast } from '@/hooks/use-toast'
// import { Form } from '@/components/ui/form'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import {
//   type JournalEntryWithDetails,
//   JournalEntryWithDetailsSchema,
//   type FormStateType,
// } from '@/utils/type'
// import {
//   getAllBankAccounts,
//   getAllChartOfAccounts,
//   getAllCostCenters,
//   getAllDepartments,
//   getResPartnersBySearch,
// } from '@/api/common-shared-api'
// import { createJournalEntryWithDetails } from '@/api/vouchers-api'
// import BankVoucherMaster from '@/components/bank/bank-vouchers/bank-voucher-master'
// import BankVoucherDetails from '@/components/bank/bank-vouchers/bank-voucher-details'
// import BankVoucherSubmit from '@/components/bank/bank-vouchers/bank-voucher-submit'
// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from '@/components/ui/pagination'

// const InvoicesList = () => {
//   useInitializeUser()
//   const router = useRouter()

//   const [token] = useAtom(tokenAtom)
//   const [userData] = useAtom(userDataAtom)
//   const [invoices, setInvoices] = useState<SalesInvoiceType[]>([])
//   const [error, setError] = useState<string | null>(null)
//   const [selectedInvoice, setSelectedInvoice] =
//     useState<SalesInvoiceType | null>(null)
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [isBankVoucherDialogOpen, setIsBankVoucherDialogOpen] = useState(false)
//   const [validationError, setValidationError] = useState<string | null>(null)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [rowsPerPage] = useState(10)
//   const [originalInvoiceAmount, setOriginalInvoiceAmount] = useState<number>(0)

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
//     const fetchInitialData = async () => {
//       const search = ''
//       if (!token) return

//       const [
//         bankAccountsResponse,
//         chartOfAccountsResponse,
//         costCentersResponse,
//         partnersResponse,
//         departmentsResponse,
//       ] = await Promise.all([
//         getAllBankAccounts(token),
//         getAllChartOfAccounts(token),
//         getAllCostCenters(token),
//         getResPartnersBySearch(search, token),
//         getAllDepartments(token),
//       ])

//       if (
//         bankAccountsResponse?.error?.status === 441 ||
//         chartOfAccountsResponse?.error?.status === 441 ||
//         costCentersResponse?.error?.status === 441 ||
//         partnersResponse?.error?.status === 441 ||
//         departmentsResponse?.error?.status === 441
//       ) {
//         router.push('/unauthorized-access')
//         return
//       }

//       const filteredCoa = chartOfAccountsResponse.data?.filter((account) => {
//         return account.isGroup === false
//       })

//       setFormState((prevState) => ({
//         ...prevState,
//         bankAccounts: bankAccountsResponse.data || [],
//         chartOfAccounts: chartOfAccountsResponse.data || [],
//         filteredChartOfAccounts: filteredCoa || [],
//         costCenters: costCentersResponse.data || [],
//         partners: partnersResponse.data || [],
//         departments: departmentsResponse.data || [],
//       }))
//     }

//     fetchInitialData()
//   }, [token, router])

//   const fetchInvoices = React.useCallback(async () => {
//     if (!token) return
//     try {
//       const response = await getInvoiceData(token)
//       if (response?.error?.status === 401) {
//         router.push('/unauthorized-access')
//         console.log('Unauthorized access')
//         return
//       } else if (response.error || !response.data) {
//         console.error('Error invoice:', response.error)
//         toast({
//           variant: 'destructive',
//           title: 'Error',
//           description: response.error?.message || 'Failed to fetch Invoices',
//         })
//       } else {
//         setInvoices(response.data)
//       }
//       console.log('Invoices fetched successfully:', response.data)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred')
//     }
//   }, [token, router])

//   const handleInvoiceClick = React.useCallback(
//     async (id: number) => {
//       const response = await getInvoiceById(token, id)
//       setSelectedInvoice(response.data)
//       setIsDialogOpen(true)
//     },
//     [token]
//   )

//   const handleReceiptClick = React.useCallback(
//     (invoice: SalesInvoiceType) => {
//       setSelectedInvoice(invoice)
//       setOriginalInvoiceAmount(invoice.invoiceAmount) // Store original amount

//       // Pre-populate the bank voucher form with invoice data
//       form.reset({
//         journalEntry: {
//           date: new Date().toISOString().split('T')[0],
//           journalType: 'Bank Voucher', // Changed from 'Bank Voucher' to 'Receipt'
//           companyId: invoice.companyId || 0,
//           locationId: 0,
//           currencyId: invoice.currencyId,
//           exchangeRate: 1,
//           amountTotal: invoice.invoiceAmount,
//           payTo: invoice.apporvedBy || '',
//           notes: invoice.LCPINo || '',
//           createdBy: userData?.userId || 0,
//         },
//         journalDetails: [
//           {
//             accountId: 0,
//             costCenterId: null,
//             departmentId: null,
//             debit: invoice.invoiceAmount,
//             credit: 0,
//             analyticTags: null,
//             taxId: null,
//             resPartnerId: invoice.res_partnerId || null,
//             notes: `Payment for Invoice ${invoice.LCPINo}`,
//             createdBy: userData?.userId || 0,
//           },
//         ],
//       })

//       setIsBankVoucherDialogOpen(true)
//     },
//     [form, userData]
//   )

//   // Add this after the form setup
//   const watchedAmount = form.watch('journalEntry.amountTotal')
//   const [amountError, setAmountError] = useState<string>('')

//   // Add useEffect to validate amount changes
//   useEffect(() => {
//     if (originalInvoiceAmount > 0 && watchedAmount > originalInvoiceAmount) {
//       setAmountError(
//         `You cannot input greater than existing amount (${formatCurrency(originalInvoiceAmount, selectedInvoice?.currencyName || 'USD')})`
//       )
//     } else {
//       setAmountError('')
//     }
//   }, [watchedAmount, originalInvoiceAmount, selectedInvoice?.currencyName])

//   // Bank voucher submission logic
//   const onSubmit = async (
//     values: JournalEntryWithDetails,
//     status: 'Draft' | 'Posted'
//   ) => {
//     // Add amount validation check
//     if (values.journalEntry.amountTotal > originalInvoiceAmount) {
//       setValidationError(
//         `Amount cannot be greater than the original invoice amount of ${formatCurrency(originalInvoiceAmount, selectedInvoice?.currencyName || 'USD')}`
//       )
//       return
//     }

//     const totalDetailsAmount = values.journalDetails.reduce(
//       (sum, detail) => sum + (detail.debit || detail.credit || 0),
//       0
//     )

//     if (Math.abs(values.journalEntry.amountTotal - totalDetailsAmount) > 0.01) {
//       setValidationError(
//         "The total amount in journal details doesn't match the journal entry amount total."
//       )
//       return
//     }

//     setValidationError(null)

//     const updatedValues = {
//       ...values,
//       journalEntry: {
//         ...values.journalEntry,
//         state: status === 'Draft' ? 0 : 1,
//         notes: values.journalEntry.notes || '',
//         journalType: 'Bank Voucher', // Changed from 'Bank Voucher' to 'Receipt'
//         currencyId: values.journalEntry.currencyId || 1,
//         amountTotal: totalDetailsAmount,
//         createdBy: userData?.userId ?? 0,
//       },
//       journalDetails: values.journalDetails.map((detail) => ({
//         ...detail,

//         notes: detail.notes || '',
//         createdBy: userData?.userId ?? 0,
//       })),
//     }

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

//     const response = await createJournalEntryWithDetails(
//       updateValueswithBank,
//       token
//     )

//     if (response.error || !response.data) {
//       toast({
//         title: 'Error',
//         description: response.error?.message || 'Error creating Bank Voucher',
//       })
//     } else {
//       toast({
//         title: 'Success',
//         description: 'Bank Voucher created successfully',
//       })

//       // Close popup and reset form
//       setIsBankVoucherDialogOpen(false)
//       form.reset()
//       setFormState({
//         ...formState,
//         selectedBankAccount: null,
//         formType: 'Credit',
//         status: 'Draft',
//       })
//     }
//   }

//   useEffect(() => {
//     fetchInvoices()
//   }, [fetchInvoices])

//   const formatCurrency = (amount: number, currency: string) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: currency || 'USD',
//     }).format(amount)
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     })
//   }

//   if (error) {
//     return (
//       <Card>
//         <CardContent className="flex items-center justify-center h-64">
//           <div className="text-center">
//             <p className="text-red-600">Error: {error}</p>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <>
//       <Card>
//         <CardHeader>
//           <CardTitle>Sales Invoices</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="max-w-full overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>LCPI No</TableHead>
//                   <TableHead>Date</TableHead>
//                   <TableHead>Shipper</TableHead>
//                   <TableHead>Consignee</TableHead>
//                   <TableHead>Client</TableHead>
//                   <TableHead>Address</TableHead>
//                   <TableHead>Consign Address</TableHead>
//                   <TableHead>Approved By</TableHead>
//                   <TableHead>Approval Date</TableHead>
//                   <TableHead>Amount</TableHead>
//                   <TableHead>Partner Name</TableHead>
//                   <TableHead>Company Name</TableHead>
//                   <TableHead>Currency</TableHead>
//                   <TableHead>Action</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {!Array.isArray(invoices) || invoices.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={15} className="text-center py-8">
//                       <Loader />
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   invoices
//                     .slice(
//                       (currentPage - 1) * rowsPerPage,
//                       currentPage * rowsPerPage
//                     )
//                     .map((invoice, id) => (
//                       <TableRow key={id}>
//                         <TableCell className="font-medium">
//                           <Badge
//                             variant="outline"
//                             className="cursor-pointer hover:bg-slate-100"
//                             onClick={() => handleInvoiceClick(invoice.id)}
//                           >
//                             {invoice.LCPINo}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>{formatDate(invoice.date)}</TableCell>
//                         <TableCell>{invoice.shipper}</TableCell>
//                         <TableCell>{invoice.consignee}</TableCell>
//                         <TableCell>{invoice.client}</TableCell>
//                         <TableCell
//                           className="max-w-xs truncate"
//                           title={invoice.address}
//                         >
//                           {invoice.address}
//                         </TableCell>
//                         <TableCell
//                           className="max-w-xs truncate"
//                           title={invoice.consignAddress}
//                         >
//                           {invoice.consignAddress}
//                         </TableCell>
//                         <TableCell>{invoice.apporvedBy}</TableCell>
//                         <TableCell>
//                           {formatDate(invoice.approvalDate)}
//                         </TableCell>
//                         <TableCell className="font-semibold">
//                           {formatCurrency(
//                             invoice.invoiceAmount,
//                             invoice.currencyName
//                           )}
//                         </TableCell>
//                         <TableCell>{invoice.res_partnerName}</TableCell>
//                         <TableCell>{invoice.companyName}</TableCell>
//                         <TableCell>{invoice.currencyName}</TableCell>
//                         <TableCell>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handleReceiptClick(invoice)}
//                           >
//                             Receipt
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//           {Array.isArray(invoices) && invoices.length > 0 && (
//             <div className="flex items-center justify-between py-4">
//               <div className="text-sm text-muted-foreground">
//                 Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
//                 {Math.min(currentPage * rowsPerPage, invoices.length)} of{' '}
//                 {invoices.length} invoices
//               </div>
//               <Pagination>
//                 <PaginationContent>
//                   <PaginationItem>
//                     <PaginationPrevious
//                       href="#"
//                       onClick={(e) => {
//                         e.preventDefault()
//                         setCurrentPage((prev) => Math.max(prev - 1, 1))
//                       }}
//                       className={
//                         currentPage === 1
//                           ? 'pointer-events-none opacity-50'
//                           : 'cursor-pointer'
//                       }
//                     />
//                   </PaginationItem>

//                   {Array.from(
//                     { length: Math.ceil(invoices.length / rowsPerPage) },
//                     (_, i) => i + 1
//                   )
//                     .filter((page) => {
//                       const totalPages = Math.ceil(
//                         invoices.length / rowsPerPage
//                       )
//                       if (totalPages <= 7) return true
//                       if (page === 1 || page === totalPages) return true
//                       if (page >= currentPage - 1 && page <= currentPage + 1)
//                         return true
//                       return false
//                     })
//                     .map((page, index, array) => {
//                       const prevPage = array[index - 1]
//                       const showEllipsis = prevPage && page - prevPage > 1

//                       return (
//                         <React.Fragment key={page}>
//                           {showEllipsis && (
//                             <PaginationItem>
//                               <PaginationEllipsis />
//                             </PaginationItem>
//                           )}
//                           <PaginationItem>
//                             <PaginationLink
//                               href="#"
//                               onClick={(e) => {
//                                 e.preventDefault()
//                                 setCurrentPage(page)
//                               }}
//                               isActive={currentPage === page}
//                               className="cursor-pointer"
//                             >
//                               {page}
//                             </PaginationLink>
//                           </PaginationItem>
//                         </React.Fragment>
//                       )
//                     })}

//                   <PaginationItem>
//                     <PaginationNext
//                       href="#"
//                       onClick={(e) => {
//                         e.preventDefault()
//                         setCurrentPage((prev) =>
//                           Math.min(
//                             prev + 1,
//                             Math.ceil(invoices.length / rowsPerPage)
//                           )
//                         )
//                       }}
//                       className={
//                         currentPage === Math.ceil(invoices.length / rowsPerPage)
//                           ? 'pointer-events-none opacity-50'
//                           : 'cursor-pointer'
//                       }
//                     />
//                   </PaginationItem>
//                 </PaginationContent>
//               </Pagination>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Bank Voucher Dialog */}
//       <Dialog
//         open={isBankVoucherDialogOpen}
//         onOpenChange={setIsBankVoucherDialogOpen}
//       >
//         <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>
//               Create Receipt - Invoice {selectedInvoice?.LCPINo}
//             </DialogTitle>
//           </DialogHeader>
//           <div className="mt-4">
//             {/* <p className="text-sm text-muted-foreground mb-4">
//               Create a bank voucher for invoice payment. The form is
//               pre-populated with invoice details.
//             </p> */}
//             <Form {...form}>
//               <form
//                 onSubmit={form.handleSubmit((values) =>
//                   onSubmit(values, formState.status)
//                 )}
//                 className="space-y-8"
//               >
//                 {validationError && (
//                   <div className="text-red-500 text-sm mb-4">
//                     {validationError}
//                   </div>
//                 )}
//                 {amountError && (
//                   <div className="text-red-500 text-sm mb-4">{amountError}</div>
//                 )}
//                 <BankVoucherMaster
//                   form={form}
//                   formState={formState}
//                   requisition={undefined}
//                   setFormState={setFormState}
//                   disableJournalType={true} // Add this prop to disable the type field
//                 />
//                 <BankVoucherDetails
//                   form={form}
//                   formState={formState}
//                   requisition={undefined}
//                   partners={formState.partners}
//                   isFromInvoice={true} // Add this when coming from invoice
//                   invoicePartnerName={selectedInvoice?.res_partnerName || ''} // Add this to show partner name
//                 />
//                 <BankVoucherSubmit
//                   form={form}
//                   onSubmit={onSubmit}
//                   disabled={!!amountError} // Disable submit if there's an amount error
//                 />
//               </form>
//             </Form>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Invoice Details Dialog */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Invoice Details</DialogTitle>
//           </DialogHeader>
//           {selectedInvoice && (
//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="font-semibold">LCPI No:</div>
//                 <div>{selectedInvoice.LCPINo}</div>
//                 <div className="font-semibold">Date:</div>
//                 <div>{formatDate(selectedInvoice.date)}</div>
//                 <div className="font-semibold">Amount:</div>
//                 <div>
//                   {formatCurrency(
//                     selectedInvoice.invoiceAmount,
//                     selectedInvoice.currencyName
//                   )}
//                 </div>
//                 <div className="font-semibold">Shipper:</div>
//                 <div>{selectedInvoice.shipper}</div>
//                 <div className="font-semibold">Consignee:</div>
//                 <div>{selectedInvoice.consignee}</div>
//                 <div className="font-semibold">Client:</div>
//                 <div>{selectedInvoice.client}</div>
//                 <div className="font-semibold">Address:</div>
//                 <div>{selectedInvoice.address}</div>
//                 <div className="font-semibold">Consign Address:</div>
//                 <div>{selectedInvoice.consignAddress}</div>
//                 <div className="font-semibold">Approved By:</div>
//                 <div>{selectedInvoice.apporvedBy}</div>
//                 <div className="font-semibold">Approval Date:</div>
//                 <div>{formatDate(selectedInvoice.approvalDate)}</div>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }

// export default InvoicesList
