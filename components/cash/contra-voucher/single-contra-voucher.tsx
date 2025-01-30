// 'use client'

// import React, { useState, useEffect, useRef } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { Card, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Printer, RotateCcw, Check } from 'lucide-react'
// import { toast } from '@/hooks/use-toast'

// import { VoucherById } from '@/utils/type'
// import { useReactToPrint } from 'react-to-print'
// import {
//   getSingleVoucher,
//   reverseJournalVoucher,
// } from '@/api/contra-voucher-api'

// export default function SingleContraVoucher() {
//   const { voucherid } = useParams()
//   const router = useRouter()
//   const [data, setData] = useState<VoucherById[]>()
//   const [editingReferenceIndex, setEditingReferenceIndex] = useState<
//     number | null
//   >(null)
//   const [editingReferenceText, setEditingReferenceText] = useState('')
//   const [isReversingVoucher, setIsReversingVoucher] = useState(false)

//   const contentRef = useRef<HTMLDivElement>(null)
//   const reactToPrintFn = useReactToPrint({ contentRef })
//   const [userId, setUserId] = React.useState<number | null>(null)

//   useEffect(() => {
//     async function fetchVoucher() {
//       if (!voucherid) return
//       try {
//         const response = await getSingleVoucher(voucherid as string)
//         if (response.error || !response.data) {
//           toast({
//             title: 'Error',
//             description:
//               response.error?.message || 'Failed to get Voucher Data',
//           })
//         } else {
//           setData(response.data)
//           console.log('🚀 ~ fetchVoucher ~ response.data.data:', response.data)
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

//   React.useEffect(() => {
//     const userStr = localStorage.getItem('currentUser')
//     if (userStr) {
//       const userData = JSON.parse(userStr)
//       setUserId(userData.userId)
//       console.log(
//         'Current userId from localStorage in everywhere:',
//         userData.userId
//       )
//     } else {
//       console.log('No user data found in localStorage')
//     }
//   }, [])

//   const handleReferenceSave = () => {
//     if (data && editingReferenceIndex !== null) {
//       const updatedData = [...data]
//       updatedData[editingReferenceIndex] = {
//         ...updatedData[editingReferenceIndex],
//         notes: editingReferenceText,
//       }
//       setData(updatedData)
//       setEditingReferenceIndex(null)
//     }
//   }

//   const handleReverseVoucher = async () => {
//     const createdId = userId ?? 0 // Replace with actual user ID
//     let voucherId = data?.[0].voucherno
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
//       const response = await reverseJournalVoucher(Number(voucherid), createdId)

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
//             <div className="grid grid-cols-[120px,1fr] gap-8">
//               <span className="font-medium whitespace-nowrap">
//                 Created By:{data[0].createdby}
//               </span>
//               <span></span>
//             </div>
//           </div>
//           <div className="flex justify-end gap-2 no-print">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleReverseVoucher}
//               disabled={isReversingVoucher}
//             >
//               <RotateCcw className="w-4 h-4 mr-2" />
//               {isReversingVoucher ? 'Reversing...' : 'Reverse'}
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => reactToPrintFn()}
//             >
//               <Printer className="w-4 h-4 mr-2" />
//               Print
//             </Button>
//           </div>
//         </div>

//         {/* Journal Items Table */}
//         <div className="mb-6">
//           <h3 className="font-medium mb-4">Journal Items</h3>
//           <div className="border rounded-lg">
//             <div className="grid grid-cols-[2fr,1fr,1fr,1fr,2fr,1fr,1fr,auto] gap-2 p-3 bg-muted text-sm font-medium">
//               <div>Accounts</div>
//               <div>Bank Account</div>

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
//                 <div>{item.bankaccount}</div>
//                 <div>
//                   {editingReferenceIndex === index ? (
//                     <input
//                       type="text"
//                       value={editingReferenceText}
//                       onChange={(e) => setEditingReferenceText(e.target.value)}
//                       className="border rounded px-2 py-1 w-full"
//                     />
//                   ) : (
//                     item.notes
//                   )}
//                 </div>
//                 <div>{item.debit}</div>
//                 <div>{item.credit}</div>
//                 <div>
//                   {editingReferenceIndex === index ? (
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={handleReferenceSave}
//                     >
//                       <Check className="w-4 h-4" />
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
//       </CardContent>
//     </Card>
//   )
// }
