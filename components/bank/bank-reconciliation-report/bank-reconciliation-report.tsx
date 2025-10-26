// 'use client'

// import { useEffect, useState } from 'react'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import {
//   Form,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { useToast } from '@/hooks/use-toast'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import { useForm } from 'react-hook-form'
// import { format } from 'date-fns'
// import type { BankAccount, BankReconciliationReportType } from '@/utils/type'
// import {
//   createReconciliationOpening,
//   getBankReconciliationReports,
// } from '@/api/bank-reconciliation-report-api'
// import { getAllBankAccounts } from '@/api/common-shared-api'
// import { tokenAtom, useInitializeUser } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { useRouter } from 'next/navigation'

// export default function BankReconciliationReport() {
//   //getting userData from jotai atom component
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)

//   const router = useRouter()

//   //state variables
//   const [report, setReport] = useState<BankReconciliationReportType | null>(
//     null
//   )
//   const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
//   const [selectedBankAccount, setSelectedBankAccount] =
//     useState<BankAccount | null>(null)
//   const [reconciliations, setReconciliations] = useState<
//     BankReconciliationReportType[]
//   >([])
//   const [loading, setLoading] = useState(false)
//   const [showOpeningBalanceDialog, setShowOpeningBalanceDialog] =
//     useState(false)
//   const [openingBalanceValue, setOpeningBalanceValue] = useState('')
//   const [pendingFormData, setPendingFormData] = useState<{
//     bankAccount: string
//     fromDate: string
//     toDate: string
//   } | null>(null)
//   const { toast } = useToast()

//   const form = useForm({
//     defaultValues: {
//       bankAccount: '',
//       fromDate: '',
//       toDate: '',
//     },
//   })

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

//     const fetchBankAccounts = async () => {
//       if (!token) return
//       try {
//         setLoading(true)
//         const accounts = await getAllBankAccounts(token)
//         if (accounts?.error?.status === 401) {
//           router.push('/unauthorized-access')
//           return
//         } else if (accounts.data) {
//           setBankAccounts(accounts.data)
//         }
//       } catch (error) {
//         toast({
//           title: 'Error',
//           description: 'Failed to fetch bank accounts',
//           variant: 'destructive',
//         })
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchBankAccounts()
//   }, [router, toast, token])

//   const handleOpeningBalanceSubmit = async () => {
//     if (!openingBalanceValue || !pendingFormData || !selectedBankAccount) {
//       toast({
//         title: 'Error',
//         description: 'Please enter opening balance',
//         variant: 'destructive',
//       })
//       return
//     }

//     const balanceNumber = Number.parseFloat(openingBalanceValue)
//     if (isNaN(balanceNumber)) {
//       toast({
//         title: 'Error',
//         description: 'Please enter a valid number',
//         variant: 'destructive',
//       })
//       return
//     }

//     try {
//       setLoading(true)

//       console.log('Creating opening balance with:', {
//         bankId: selectedBankAccount.id,
//         openingBalance: balanceNumber,
//       })

//       const result = await createReconciliationOpening(
//         {
//           bankId: selectedBankAccount.id,
//           openingBalance: balanceNumber,
//         },
//         token
//       )

//       console.log('Opening balance created successfully:', result)

//       toast({
//         title: 'Success',
//         description: 'Opening balance created successfully',
//       })

//       setShowOpeningBalanceDialog(false)
//       setOpeningBalanceValue('')

//       await fetchReconciliationsReport({
//         ...pendingFormData,
//         token,
//       })
//     } catch (error) {
//       console.error('Error creating opening balance:', error)
//       const errorMessage =
//         error instanceof Error
//           ? error.message
//           : 'Failed to create opening balance'
//       toast({
//         title: 'Error',
//         description: errorMessage,
//         variant: 'destructive',
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchReconciliationsReport = async (data: {
//     bankAccount: string
//     fromDate: string
//     toDate: string
//     token: string
//   }) => {
//     if (data.bankAccount && data.fromDate && data.toDate) {
//       try {
//         setLoading(true)

//         const response = await getBankReconciliationReports(
//           Number.parseInt(data.bankAccount),
//           data.fromDate,
//           data.toDate,
//           data.token
//         )

//         setReconciliations(response.data || [])
//         console.log('report data: ', response.data || [])
//         console.log('bank account id: ', data.bankAccount)

//         // Set the report state with the first item from the response
//         if (response.data) {
//           let reportData: BankReconciliationReportType | null = null

//           if (Array.isArray(response.data)) {
//             if (response.data.length > 0) {
//               reportData = response.data[0]
//             } else {
//               setReport(null)
//               toast({
//                 title: 'No data',
//                 description:
//                   'No reconciliation data found for the selected criteria',
//               })
//               return
//             }
//           } else {
//             // If it's a single object, use it directly
//             reportData = response.data
//           }

//           // Check if opening balance is zero
//           if (
//             reportData &&
//             (!reportData.openingBalance?.book ||
//               reportData.openingBalance.book === 0)
//           ) {
//             // Show dialog to input opening balance
//             setPendingFormData({
//               bankAccount: data.bankAccount,
//               fromDate: data.fromDate,
//               toDate: data.toDate,
//             })
//             setShowOpeningBalanceDialog(true)
//             setReport(null)
//           } else {
//             // Opening balance exists, show report
//             setReport(reportData)
//           }
//         } else {
//           setReport(null)
//           toast({
//             title: 'No data',
//             description:
//               'No reconciliation data found for the selected criteria',
//           })
//         }
//       } catch (error) {
//         console.error('Error fetching reconciliations:', error)
//         toast({
//           title: 'Error',
//           description: 'Failed to fetch reconciliations',
//           variant: 'destructive',
//         })
//         setReport(null)
//       } finally {
//         setLoading(false)
//       }
//     } else {
//       setReconciliations([])
//       setReport(null)
//     }
//   }

//   // Helper function to format date from ISO string
//   const formatDate = (dateString: string) => {
//     try {
//       const date = new Date(dateString)
//       return format(date, 'dd/MM/yyyy')
//     } catch (error) {
//       return dateString
//     }
//   }

//   // Calculate total for a specific category
//   const calculateTotal = (items: any[]) => {
//     return items.reduce((sum, item) => sum + Number.parseFloat(item.amount), 0)
//   }

//   // Format currency values
//   const formatCurrency = (value: string | number) => {
//     const numValue =
//       typeof value === 'string' ? Number.parseFloat(value) : value
//     return new Intl.NumberFormat('en-US', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(numValue)
//   }

//   return (
//     <div className="w-[98%] mx-auto p-4">
//       {/* Opening Balance Dialog */}
//       <Dialog
//         open={showOpeningBalanceDialog}
//         onOpenChange={setShowOpeningBalanceDialog}
//       >
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Enter Opening Balance</DialogTitle>
//           </DialogHeader>
//           <div className="py-4">
//             <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
//               Opening Balance
//             </label>
//             <Input
//               type="number"
//               step="0.01"
//               placeholder="Enter opening balance"
//               value={openingBalanceValue}
//               onChange={(e) => setOpeningBalanceValue(e.target.value)}
//               className="mt-2"
//             />
//           </div>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setShowOpeningBalanceDialog(false)
//                 setOpeningBalanceValue('')
//                 setPendingFormData(null)
//               }}
//             >
//               Cancel
//             </Button>
//             <Button onClick={handleOpeningBalanceSubmit} disabled={loading}>
//               {loading ? 'Submitting...' : 'Submit'}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit((data) =>
//             fetchReconciliationsReport({ ...data, token })
//           )}
//           className="space-y-6"
//         >
//           <div className="flex justify-between items-end mb-4 gap-4 w-fit mx-auto">
//             <FormField
//               control={form.control}
//               name="fromDate"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>From Date</FormLabel>
//                   <Input type="date" {...field} />
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="toDate"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>To Date</FormLabel>
//                   <Input type="date" {...field} />
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="bankAccount"
//               render={({ field }) => (
//                 <FormItem className="w-1/3">
//                   <FormLabel>Bank Account</FormLabel>
//                   <CustomCombobox
//                     items={bankAccounts.map((account) => ({
//                       id: account.id.toString(),
//                       name: `${account.bankName} - ${account.accountName} - ${account.accountNumber}`,
//                     }))}
//                     value={
//                       selectedBankAccount
//                         ? {
//                             id: selectedBankAccount.id.toString(),
//                             name: `${selectedBankAccount.bankName} - ${selectedBankAccount.accountName} - ${selectedBankAccount.accountNumber}`,
//                           }
//                         : null
//                     }
//                     onChange={(value) => {
//                       if (!value) {
//                         setSelectedBankAccount(null)
//                         field.onChange(null)
//                         return
//                       }
//                       const selected = bankAccounts.find(
//                         (account) => account.id.toString() === value.id
//                       )
//                       setSelectedBankAccount(selected || null)
//                       field.onChange(value.id)
//                     }}
//                     placeholder="Select bank account"
//                   />
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <Button type="submit" disabled={loading}>
//               {loading ? 'Loading...' : 'Show'}
//             </Button>
//           </div>
//         </form>
//       </Form>

//       {report && selectedBankAccount && (
//         <Card className="mt-6 border-2">
//           <CardHeader className="pb-0">
//             <CardTitle className="text-center text-xl">
//               NATIONAL ACCESSORIES LTD
//             </CardTitle>
//             <div className="flex justify-between text-sm">
//               <div>
//                 Bank reconciliation of {selectedBankAccount.bankName} -{' '}
//                 {selectedBankAccount.accountNumber}
//               </div>
//               <div className="flex flex-col gap-2">
//                 <div className="flex gap-4">
//                   <div className="text-right">
//                     Balance as per Software book on Dt:{' '}
//                     {format(new Date(report.dateRange.to), 'dd/MM/yyyy')}
//                   </div>
//                   <div className="text-right font-semibold w-32">
//                     {formatCurrency(report.openingBalance.book)}
//                   </div>
//                 </div>
//                 <div className="flex gap-4">
//                   <div className="text-right">
//                     Balance as per Software bank on Dt:{' '}
//                     {format(new Date(report.dateRange.to), 'dd/MM/yyyy')}
//                   </div>
//                   <div className="text-right font-semibold w-32">
//                     {formatCurrency(report.openingBalance.bank)}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             {/* Table 1: Credited in software, but not shown in bank statement */}
//             <div className="mt-4">
//               <div className="flex">
//                 <div className="w-16">Add:</div>
//                 <div className="font-semibold">
//                   Credited in software, but not shown in bank statement
//                 </div>
//               </div>
//               <Table className="border">
//                 <TableHeader className="bg-slate-100">
//                   <TableRow>
//                     <TableHead className="w-24">Date</TableHead>
//                     <TableHead>Head of A/c</TableHead>
//                     <TableHead className="w-28">CHQ No</TableHead>
//                     <TableHead className="w-28">Out Date</TableHead>
//                     <TableHead className="w-32 text-right">Amount</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {report.unreconciledAmount.breakdown.onlyInBooks.map(
//                     (item) => (
//                       <TableRow key={item.id}>
//                         <TableCell>{formatDate(item.date)}</TableCell>
//                         <TableCell>{item.description}</TableCell>
//                         <TableCell>{item.checkNo}</TableCell>
//                         <TableCell></TableCell>
//                         <TableCell className="text-right">
//                           {formatCurrency(item.amount)}
//                         </TableCell>
//                       </TableRow>
//                     )
//                   )}
//                   {report.unreconciledAmount.breakdown.onlyInBooks.length ===
//                     0 && (
//                     <TableRow>
//                       <TableCell colSpan={5} className="text-center">
//                         No records found
//                       </TableCell>
//                     </TableRow>
//                   )}
//                   <TableRow>
//                     <TableCell colSpan={4} className="text-right font-semibold">
//                       Total
//                     </TableCell>
//                     <TableCell className="text-right font-semibold">
//                       {formatCurrency(
//                         calculateTotal(
//                           report.unreconciledAmount.breakdown.onlyInBooks
//                         )
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 </TableBody>
//               </Table>
//             </div>

//             {/* Table 2: Debited in bank statement but not shown in software */}
//             <div className="mt-4">
//               <div className="flex">
//                 <div className="w-16">Less:</div>
//                 <div className="font-semibold">
//                   Debited in bank statement but not shown in software
//                 </div>
//               </div>
//               <Table className="border">
//                 <TableHeader className="bg-slate-100">
//                   <TableRow>
//                     <TableHead className="w-24">Date</TableHead>
//                     <TableHead>Head of A/c</TableHead>
//                     <TableHead className="w-28">CHQ No</TableHead>
//                     <TableHead className="w-28">Out Date</TableHead>
//                     <TableHead className="w-32 text-right">Amount</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {report.unreconciledAmount.breakdown.onlyInBank.length > 0 ? (
//                     report.unreconciledAmount.breakdown.onlyInBank.map(
//                       (item) => (
//                         <TableRow key={item.id}>
//                           <TableCell>{formatDate(item.date)}</TableCell>
//                           <TableCell>{item.description}</TableCell>
//                           <TableCell>{item.checkNo}</TableCell>
//                           <TableCell></TableCell>
//                           <TableCell className="text-right">
//                             {formatCurrency(item.amount)}
//                           </TableCell>
//                         </TableRow>
//                       )
//                     )
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={5} className="text-center">
//                         No records found
//                       </TableCell>
//                     </TableRow>
//                   )}
//                   <TableRow>
//                     <TableCell colSpan={4} className="text-right font-semibold">
//                       Total
//                     </TableCell>
//                     <TableCell className="text-right font-semibold">
//                       {formatCurrency(
//                         calculateTotal(
//                           report.unreconciledAmount.breakdown.onlyInBank
//                         ) || 0
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 </TableBody>
//               </Table>
//             </div>

//             {/* Summary */}
//             <div className="mt-4 flex flex-col gap-1">
//               <div className="flex justify-between">
//                 <div>Balance as per Books</div>
//                 <div className="w-32 text-right font-semibold">
//                   {formatCurrency(report.closingBalance.book)}
//                 </div>
//               </div>
//               <div className="flex justify-between">
//                 <div>Balance as per Bank Statement</div>
//                 <div className="w-32 text-right font-semibold">
//                   {formatCurrency(report.closingBalance.bank)}
//                 </div>
//               </div>
//               <div className="flex justify-between">
//                 <div>Difference</div>
//                 <div className="w-32 text-right font-semibold">
//                   {formatCurrency(
//                     Number.parseFloat(report.closingBalance.book.toString()) -
//                       Number.parseFloat(report.closingBalance.bank.toString())
//                   )}
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   )
// }


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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { CustomCombobox } from '@/utils/custom-combobox'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import type { BankAccount, BankReconciliationReportType } from '@/utils/type'
import {
  createReconciliationOpening,
  getBankReconciliationReports,
} from '@/api/bank-reconciliation-report-api'
import { getAllBankAccounts } from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

export default function BankReconciliationReport() {
  //getting userData from jotai atom component
  useInitializeUser()
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  //state variables
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
  const [showOpeningBalanceDialog, setShowOpeningBalanceDialog] =
    useState(false)
  const [openingBalanceValue, setOpeningBalanceValue] = useState('')
  const [pendingFormData, setPendingFormData] = useState<{
    bankAccount: string
    fromDate: string
    toDate: string
  } | null>(null)
  const { toast } = useToast()

  const form = useForm({
    defaultValues: {
      bankAccount: '',
      fromDate: '',
      toDate: '',
    },
  })

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

    const fetchBankAccounts = async () => {
      if (!token) return
      try {
        setLoading(true)
        const accounts = await getAllBankAccounts(token)
        if (accounts?.error?.status === 401) {
          router.push('/unauthorized-access')
          return
        } else if (accounts.data) {
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
  }, [router, toast, token])

  const handleOpeningBalanceSubmit = async () => {
    if (!openingBalanceValue || !pendingFormData || !selectedBankAccount) {
      toast({
        title: 'Error',
        description: 'Please enter opening balance',
        variant: 'destructive',
      })
      return
    }

    const balanceNumber = Number.parseFloat(openingBalanceValue)
    if (isNaN(balanceNumber)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid number',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      console.log('Creating opening balance with:', {
        bankId: selectedBankAccount.id,
        openingBalance: balanceNumber,
      })

      const result = await createReconciliationOpening(
        {
          bankId: selectedBankAccount.id,
          openingBalance: balanceNumber,
        },
        token
      )

      console.log('Opening balance created successfully:', result)

      toast({
        title: 'Success',
        description: 'Opening balance created successfully',
      })

      setShowOpeningBalanceDialog(false)
      setOpeningBalanceValue('')

      await fetchReconciliationsReport({
        ...pendingFormData,
        token,
      })
    } catch (error) {
      console.error('Error creating opening balance:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create opening balance'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchReconciliationsReport = async (data: {
    bankAccount: string
    fromDate: string
    toDate: string
    token: string
  }) => {
    if (data.bankAccount && data.fromDate && data.toDate) {
      try {
        setLoading(true)

        const response = await getBankReconciliationReports(
          Number.parseInt(data.bankAccount),
          data.fromDate,
          data.toDate,
          data.token
        )

        setReconciliations(response.data || [])
        console.log('report data: ', response.data || [])
        console.log('bank account id: ', data.bankAccount)

        // Set the report state with the first item from the response
        if (response.data) {
          let reportData: BankReconciliationReportType | null = null

          if (Array.isArray(response.data)) {
            if (response.data.length > 0) {
              reportData = response.data[0]
            } else {
              setReport(null)
              toast({
                title: 'No data',
                description:
                  'No reconciliation data found for the selected criteria',
              })
              return
            }
          } else {
            // If it's a single object, use it directly
            reportData = response.data
          }

          // Check if BOTH opening balances are zero
          if (
            reportData &&
            (!reportData.openingBalance?.book ||
              reportData.openingBalance.book === 0) &&
            (!reportData.openingBalance?.bank ||
              reportData.openingBalance.bank === 0)
          ) {
            // Show dialog to input opening balance only if both are zero
            setPendingFormData({
              bankAccount: data.bankAccount,
              fromDate: data.fromDate,
              toDate: data.toDate,
            })
            setShowOpeningBalanceDialog(true)
            setReport(null)
          } else {
            // Opening balance exists (at least bank has data), show report
            setReport(reportData)
          }
        } else {
          setReport(null)
          toast({
            title: 'No data',
            description:
              'No reconciliation data found for the selected criteria',
          })
        }
      } catch (error) {
        console.error('Error fetching reconciliations:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch reconciliations',
          variant: 'destructive',
        })
        setReport(null)
      } finally {
        setLoading(false)
      }
    } else {
      setReconciliations([])
      setReport(null)
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

  // Format currency values
  const formatCurrency = (value: string | number) => {
    const numValue =
      typeof value === 'string' ? Number.parseFloat(value) : value
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue)
  }

  return (
    <div className="w-[98%] mx-auto p-4">
      {/* Opening Balance Dialog */}
      <Dialog
        open={showOpeningBalanceDialog}
        onOpenChange={setShowOpeningBalanceDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Opening Balance</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Opening Balance
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="Enter opening balance"
              value={openingBalanceValue}
              onChange={(e) => setOpeningBalanceValue(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowOpeningBalanceDialog(false)
                setOpeningBalanceValue('')
                setPendingFormData(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleOpeningBalanceSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            fetchReconciliationsReport({ ...data, token })
          )}
          className="space-y-6"
        >
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
              <div className="flex flex-col gap-2">
                <div className="flex gap-4">
                  <div className="text-right">
                    Balance as per Software Book on Dt:{' '}
                    {format(new Date(report.dateRange.to), 'dd/MM/yyyy')}
                  </div>
                  <div className="text-right font-semibold w-32">
                    {formatCurrency(report.openingBalance.book)}
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    Balance as per Software Bank on Dt:{' '}
                    {format(new Date(report.dateRange.to), 'dd/MM/yyyy')}
                  </div>
                  <div className="text-right font-semibold w-32">
                    {formatCurrency(report.openingBalance.bank)}
                  </div>
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
                  {report.unreconciledAmount.breakdown.onlyInBooks.map(
                    (item) => (
                      <TableRow key={item.id}>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.checkNo}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                  {report.unreconciledAmount.breakdown.onlyInBooks.length ===
                    0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No records found
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-semibold">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(
                        calculateTotal(
                          report.unreconciledAmount.breakdown.onlyInBooks
                        )
                      )}
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
                  {report.unreconciledAmount.breakdown.onlyInBank.length > 0 ? (
                    report.unreconciledAmount.breakdown.onlyInBank.map(
                      (item) => (
                        <TableRow key={item.id}>
                          <TableCell>{formatDate(item.date)}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.checkNo}</TableCell>
                          <TableCell></TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.amount)}
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No records found
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-semibold">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(
                        calculateTotal(
                          report.unreconciledAmount.breakdown.onlyInBank
                        ) || 0
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="mt-4 flex flex-col gap-1">
              <div className="flex justify-between">
                <div>Balance as per Books</div>
                <div className="w-32 text-right font-semibold">
                  {formatCurrency(report.closingBalance.book)}
                </div>
              </div>
              <div className="flex justify-between">
                <div>Balance as per Bank Statement</div>
                <div className="w-32 text-right font-semibold">
                  {formatCurrency(report.closingBalance.bank)}
                </div>
              </div>
              <div className="flex justify-between">
                <div>Difference</div>
                <div className="w-32 text-right font-semibold">
                  {formatCurrency(
                    Number.parseFloat(report.closingBalance.book.toString()) -
                      Number.parseFloat(report.closingBalance.bank.toString())
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}