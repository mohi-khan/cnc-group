// 'use client'

// import React, { useState, useEffect, useRef } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { Card, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Printer, RotateCcw, Check } from 'lucide-react'
// import { toast } from '@/hooks/use-toast'
// import {
//   getSingleVoucher,
//   reverseJournalVoucher,
//   editJournalDetail,
// } from '@/api/journal-voucher-api'
// import type { VoucherById } from '@/utils/type'
// import { useReactToPrint } from 'react-to-print'
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
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// export default function SingleJournalVoucher() {
//   const voucherid: number = Number.parseInt(useParams().voucherid as string, 10)
//   const router = useRouter()
//   const [data, setData] = useState<VoucherById[]>()
//   const [editingReferenceIndex, setEditingReferenceIndex] = useState<
//     number | null
//   >(null)
//   const [editingReferenceText, setEditingReferenceText] = useState('')
//   const [isReversingVoucher, setIsReversingVoucher] = useState(false)
//   const [userId, setUserId] = React.useState<number>()
//   const [isUpdating, setIsUpdating] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)

//   const contentRef = useRef<HTMLDivElement>(null)

//   const reactToPrintFn = useReactToPrint({ contentRef })

//   useEffect(() => {
//     async function fetchVoucher() {
//       if (!voucherid) return
//       console.log('Initial fetch for voucher:', voucherid)
//       try {
//         const response = await getSingleVoucher(voucherid.toString())
//         console.log('Initial fetch response:', response)
//         if (response.error || !response.data) {
//           toast({
//             title: 'Error',
//             description:
//               response.error?.message || 'Failed to get Voucher Data',
//           })
//         } else {
//           console.log('Setting initial data:', response.data)
//           setData(response.data)
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
//   }, [voucherid])

//   const handleReferenceEdit = (index: number, currentText: string) => {
//     setEditingReferenceIndex(index)
//     setEditingReferenceText(currentText)
//   }

//   const handleReferenceSave = async () => {
//     if (editingReferenceIndex === null || !data) {
//       return
//     }

//     const journalDetail = data[editingReferenceIndex]
//     console.log('Before update - Current data:', data)

//     setIsUpdating(true)
//     setError(null)

//     try {
//       const response = await editJournalDetail({
//         id: journalDetail.id,
//         notes: editingReferenceText,
//       })

//       console.log('API Response:', response)

//       if (response.error) {
//         throw new Error(response.error?.message || 'Failed to update notes')
//       }

//       // Reset editing state
//       setEditingReferenceIndex(null)
//       setEditingReferenceText('')

//       // Refetch the data to ensure we have the latest from the database
//       if (voucherid) {
//         console.log('Refetching data for voucher:', voucherid)
//         const refreshResponse = await getSingleVoucher(voucherid.toString())
//         console.log('Refresh response:', refreshResponse)

//         if (refreshResponse.error || !refreshResponse.data) {
//           throw new Error(
//             refreshResponse.error?.message || 'Failed to refresh data'
//           )
//         }
//         console.log('Setting new data:', refreshResponse.data)
//         setData(refreshResponse.data)
//       }

//       toast({
//         title: 'Success',
//         description: 'Notes updated successfully',
//       })
//     } catch (error) {
//       console.error('Error updating notes:', error)
//       setError(
//         error instanceof Error ? error.message : 'Failed to update notes'
//       )
//       toast({
//         title: 'Error',
//         description:
//           error instanceof Error ? error.message : 'Failed to update notes',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsUpdating(false)
//     }
//   }

//   React.useEffect(() => {
//     const userStr = localStorage.getItem('currentUser')
//     if (userStr) {
//       const userData = JSON.parse(userStr)
//       setUserId(userData?.userId)
//       console.log('Current userId from localStorage:', userData.userId)
//     } else {
//       console.log('No user data found in localStorage')
//     }
//   }, [])

//   const handleReverseVoucher = () => {
//     setIsAlertDialogOpen(true)
//   }

//   const confirmReverseVoucher = async () => {
//     setIsAlertDialogOpen(false)
//     const createdId = userId
//     let voucherId
//     if (data && data[0]) {
//       voucherId = data[0].voucherid
//     }
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
//       const response = await reverseJournalVoucher(voucherId, createdId)

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
//     return <p>Loading...</p>
//   }

//   return (
//     <Card ref={contentRef} className="w-full max-w-5xl mx-auto mt-24">
//       <CardContent className="p-6">
//         {/* Header Section */}
//         <div className="grid grid-cols-2 gap-6 mb-8">
//           <div className="space-y-4">
//             <div className="grid grid-cols-[120px,1fr] gap-2">
//               <span className="font-medium">Voucher No:</span>
//               <span>{data[0].voucherno}</span>
//             </div>
//             <div className="grid grid-cols-[120px,1fr] gap-8">
//               <span className="font-medium whitespace-nowrap">
//                 Accounting Date:
//               </span>
//               <span>{data[0].date}</span>
//             </div>
//             <div className="flex gap-3">
//               <span className="font-medium whitespace-nowrap">Created By:</span>
//               <span>{data[0].createdby || 'N/A'}</span>
//             </div>
//           </div>
//           <div className="flex justify-end gap-2 no-print">
//             <AlertDialog
//               open={isAlertDialogOpen}
//               onOpenChange={setIsAlertDialogOpen}
//             >
//               <AlertDialogTrigger asChild>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={handleReverseVoucher}
//                   disabled={isReversingVoucher || data[0].isreversed}
//                 >
//                   <RotateCcw className="w-4 h-4 mr-2" />
//                   {isReversingVoucher ? 'Reversing...' : 'Reverse'}
//                 </Button>
//               </AlertDialogTrigger>
//               <AlertDialogContent className="bg-white">
//                 <AlertDialogHeader>
//                   <AlertDialogTitle>
//                     Are you sure you want to reverse this voucher?
//                   </AlertDialogTitle>
//                   <AlertDialogDescription>
//                     This action cannot be undone. Reversing the voucher will
//                     create a new voucher with opposite entries.
//                   </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter>
//                   <AlertDialogCancel>Cancel</AlertDialogCancel>
//                   <AlertDialogAction onClick={confirmReverseVoucher}>
//                     Reverse Voucher
//                   </AlertDialogAction>
//                 </AlertDialogFooter>
//               </AlertDialogContent>
//             </AlertDialog>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => reactToPrintFn && reactToPrintFn()}
//             >
//               <Printer className="w-4 h-4 mr-2" />
//               Print
//             </Button>
//           </div>
//         </div>

//         {/* Reversed Voucher Alert */}
//         {data[0].isreversed && (
//           <Alert className="mb-4">
//             <AlertTitle>Voucher Reversed</AlertTitle>
//             <AlertDescription>
//               This voucher has been reversed. No further actions can be taken.
//             </AlertDescription>
//           </Alert>
//         )}

//         {/* Journal Items Table */}
//         <div className="mb-6">
//           <h3 className="font-medium mb-4">Journal Items</h3>
//           <div className="border rounded-lg">
//             <div className="grid grid-cols-[2fr,1fr,1fr,1fr,2fr,1fr,1fr,auto] gap-2 p-3 bg-muted text-sm font-medium">
//               <div>Accounts</div>
//               <div>Cost Center</div>
//               <div>Department</div>
//               <div>Partner</div>
//               <div>Notes</div>
//               <div>Debit</div>
//               <div>Credit</div>
//               <div>Action</div>
//             </div>
//             {data.map((item, index) => (
//               <div
//                 key={item.id}
//                 className="grid grid-cols-[2fr,1fr,1fr,1fr,2fr,1fr,1fr,auto] gap-2 p-3 border-t items-center text-sm"
//               >
//                 <div>{item.accountsname}</div>
//                 <div>{item.costcenter}</div>
//                 <div>{item.department}</div>
//                 <div>{item.partner}</div>
//                 <div>
//                   {editingReferenceIndex === index ? (
//                     <input
//                       type="text"
//                       value={editingReferenceText}
//                       onChange={(e) => setEditingReferenceText(e.target.value)}
//                       className="border rounded px-2 py-1 w-full"
//                     />
//                   ) : (
//                     item.detail_notes
//                   )}
//                 </div>
//                 <div>{item.debit.toLocaleString()}</div>
//                 <div>{item.credit.toLocaleString()}</div>
//                 <div>
//                   {editingReferenceIndex === index ? (
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={handleReferenceSave}
//                       disabled={isUpdating}
//                     >
//                       {isUpdating ? 'Saving...' : <Check className="w-4 h-4" />}
//                     </Button>
//                   ) : (
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleReferenceEdit(index, item.notes)}
//                     >
//                       Edit
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="mt-6">
//             <div className="grid grid-cols-[120px,1fr] gap-2">
//               <span className="font-medium">Reference:</span>
//               <span>{data[0].notes}</span>
//             </div>
//           </div>
//         </div>
//         {error && <div className="text-red-500 mt-2">{error}</div>}
//       </CardContent>
//     </Card>
//   )
// }
