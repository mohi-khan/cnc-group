'use client'

import type React from 'react'
import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import type { GetCashReport, IouRecordGetType } from '@/utils/type'
import { VoucherTypes } from '@/utils/type'
import Link from 'next/link'

interface CashReportProps {
  cashReport: GetCashReport[]
  getEmployeeName: (employeeId: number) => string
  date: string
  setDate: (date: string) => void
  companyId?: number
  location?: number
  isGeneratingPdf?: boolean
  loanData?: IouRecordGetType[]
}

const CashReportList: React.FC<CashReportProps> = ({
  cashReport,
  getEmployeeName,
  isGeneratingPdf = false,
  loanData,
}) => {
  const linkGenerator = (voucherId: number) =>
    `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.CashVoucher}`

  // 🟢 Money note state
  const [notes, setNotes] = useState({
    1000: 0,
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    1: 0,
    coins: 0,
  })

  const handleNoteChange = (value: number, key: keyof typeof notes) => {
    setNotes((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // 🟢 Total from note calculation
  const noteTotal = useMemo(() => {
    return (
      notes[1000] * 1000 +
      notes[500] * 500 +
      notes[200] * 200 +
      notes[100] * 100 +
      notes[50] * 50 +
      notes[20] * 20 +
      notes[10] * 10 +
      notes[5] * 5 +
      notes[1] * 1 +
      notes.coins
    )
  }, [notes])

  return (
    <div>
      <Card>
        <CardContent className="p-2">
          <div>
            {cashReport.map((report, index) => {
              const closingBalance =
                Number(report.closingBal?.[0]?.balance) || 0

              // 🟢 Use loanData instead of iouTotal
              const loanTotal =
                loanData?.reduce(
                  (sum, loan) => sum + (Number(loan.amount) || 0),
                  0
                ) || 0

              const totalAmount = closingBalance - loanTotal

              const restAmount = totalAmount - noteTotal

              return (
                <div key={index} className="space-y-4">
                  <div className="text-xl font-bold">
                    {report.openingBal?.map((bal, i) => (
                      <div key={i}>
                        Opening Balance: {Number(bal.balance).toFixed(2)}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Receipt Table */}
                    <div className="border rounded p-2">
                      <h3 className="font-bold mb-1 text-center pdf-table-header">
                        Receipt
                      </h3>
                      <Table>
                        <TableHeader className="pdf-table-header">
                          <TableRow>
                            <TableHead className="p-2">
                              Voucher Number
                            </TableHead>
                            <TableHead className="p-2">Date</TableHead>
                            <TableHead className="p-2">Particular</TableHead>
                            <TableHead className="p-2">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.transactionData
                            ?.filter((t) => t.debit > 0)
                            .map((transaction, i) => (
                              <TableRow key={i}>
                                <TableCell className="p-2">
                                  {isGeneratingPdf ? (
                                    transaction.voucherNo
                                  ) : (
                                    <Link
                                      href={linkGenerator(
                                        transaction.voucherId
                                      )}
                                    >
                                      {transaction.voucherNo}
                                    </Link>
                                  )}
                                </TableCell>
                                <TableCell className="p-2">
                                  {transaction.date}
                                </TableCell>
                                <TableCell className="p-2">
                                  {transaction.oppositeNarration}
                                </TableCell>
                                <TableCell className="p-2 text-right">
                                  {Number(transaction.oppositeAmount).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Payment Table */}
                    <div className="border rounded p-2">
                      <h3 className="font-bold mb-1 text-center pdf-table-header">
                        Payment
                      </h3>
                      <Table>
                        <TableHeader className="pdf-table-header">
                          <TableRow>
                            <TableHead className="p-2">
                              Voucher Number
                            </TableHead>
                            <TableHead className="p-2">Date</TableHead>
                            <TableHead className="p-2">Particular</TableHead>
                            <TableHead className="p-2">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.transactionData
                            ?.filter((t) => t.credit > 0)
                            .map((transaction, i) => (
                              <TableRow key={i}>
                                <TableCell className="p-2">
                                  {isGeneratingPdf ? (
                                    transaction.voucherNo
                                  ) : (
                                    <Link
                                      href={linkGenerator(
                                        transaction.voucherId
                                      )}
                                    >
                                      {transaction.voucherNo}
                                    </Link>
                                  )}
                                </TableCell>
                                <TableCell className="p-2">
                                  {transaction.date}
                                </TableCell>
                                <TableCell className="p-2">
                                  {transaction.oppositeNarration}
                                </TableCell>
                                <TableCell className="p-2 text-right">
                                  {Number(transaction.oppositeAmount).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}

                          {/* 🟢 Closing Balance Row */}
                          {report.closingBal?.map((bal, i) => (
                            <TableRow
                              key={`closing-${i}`}
                              className="font-bold"
                            >
                              <TableCell />
                              <TableCell />
                              <TableCell className="p-2">
                                Closing Balance
                              </TableCell>
                              <TableCell className="p-2 text-right">
                                {Number(bal.balance).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="border rounded p-2 ml-auto w-1/2">
                    <div className="mt-1 font-bold">
                      Total IOU:&nbsp;
                      {loanData
                        ?.reduce((sum, loan) => sum + loan.amount, 0)
                        .toFixed(2)}
                    </div>
                  </div>

                  <div className="border rounded p-2 ml-auto w-1/2">
                    <div className="font-bold mb-1">
                      Total Amount: {totalAmount.toFixed(2)}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <h4 className="font-semibold mb-1">Money Note Count</h4>
                        <div className="space-y-1">
                          {(
                            [1000, 500, 200, 100, 50, 20, 10, 5, 1] as const
                          ).map((denom) => (
                            <div
                              key={denom}
                              className="flex justify-between items-center gap-1"
                            >
                              <span>{denom} x</span>
                              <input
                                type="number"
                                className="w-20 border rounded p-1"
                                value={notes[denom]}
                                onChange={(e) =>
                                  handleNoteChange(
                                    Number(e.target.value) || 0,
                                    denom
                                  )
                                }
                              />
                              <span>=</span>
                              <input
                                type="number"
                                className="w-24 border rounded p-1"
                                readOnly
                                value={(notes[denom] * denom).toFixed(2)}
                              />
                            </div>
                          ))}

                          {/* Coins */}
                          <div className="flex justify-between items-center gap-1">
                            <span>Coins</span>
                            <input
                              type="number"
                              className="w-24 border rounded p-1"
                              value={notes.coins}
                              onChange={(e) =>
                                handleNoteChange(
                                  Number(e.target.value) || 0,
                                  'coins'
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 font-bold">
                      Note Total: {noteTotal.toFixed(2)}
                    </div>
                    {/* <div className="mt-1 font-bold text-red-600">
                      Rest Amount: {restAmount.toFixed(2)}
                    </div> */}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
export default CashReportList




// 'use client'

// import type React from 'react'
// import { useState, useMemo } from 'react'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import { Card, CardContent } from '@/components/ui/card'
// import type { GetCashReport, IouRecordGetType } from '@/utils/type'
// import { VoucherTypes } from '@/utils/type'
// import Link from 'next/link'

// interface CashReportProps {
//   cashReport: GetCashReport[]
//   getEmployeeName: (employeeId: number) => string
//   date: string
//   setDate: (date: string) => void
//   companyId?: number
//   location?: number
//   isGeneratingPdf?: boolean
//   loanData?: IouRecordGetType[]
// }

// const CashReportList: React.FC<CashReportProps> = ({
//   cashReport,
//   getEmployeeName,
//   isGeneratingPdf = false,
//   loanData,
// }) => {
//   const linkGenerator = (voucherId: number) =>
//     `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.CashVoucher}`

//   // 🟢 Money note state
//   const [notes, setNotes] = useState({
//     1000: 0,
//     500: 0,
//     200: 0,
//     100: 0,
//     50: 0,
//     20: 0,
//     10: 0,
//     5: 0,
//     1: 0,
//     coins: 0,
//   })

//   const handleNoteChange = (value: number, key: keyof typeof notes) => {
//     setNotes((prev) => ({
//       ...prev,
//       [key]: value,
//     }))
//   }

//   // 🟢 Total from note calculation
//   const noteTotal = useMemo(() => {
//     return (
//       notes[1000] * 1000 +
//       notes[500] * 500 +
//       notes[200] * 200 +
//       notes[100] * 100 +
//       notes[50] * 50 +
//       notes[20] * 20 +
//       notes[10] * 10 +
//       notes[5] * 5 +
//       notes[1] * 1 +
//       notes.coins
//     )
//   }, [notes])

//   return (
//     <div>
//       <Card>
//         <CardContent className="p-2">
//           <div>
//             {cashReport.map((report, index) => {
//               const closingBalance =
//                 Number(report.closingBal?.[0]?.balance) || 0

//               // 🟢 Use loanData instead of iouTotal
//               const loanTotal =
//                 loanData?.reduce(
//                   (sum, loan) => sum + (Number(loan.amount) || 0),
//                   0
//                 ) || 0

//               const totalAmount = closingBalance - loanTotal

//               const restAmount = totalAmount - noteTotal

//               return (
//                 <div key={index} className="space-y-4">
//                   <div className="text-xl font-bold">
//                     {report.openingBal?.map((bal, i) => (
//                       <div key={i}>Opening Balance: {bal.balance}</div>
//                     ))}
//                   </div>

//                   <div className="grid grid-cols-2 gap-2">
//                     {/* Receipt Table */}
//                     <div className="border rounded p-2">
//                       <h3 className="font-bold mb-1 text-center pdf-table-header">
//                         Receipt
//                       </h3>
//                       <Table>
//                         <TableHeader className="pdf-table-header">
//                           <TableRow>
//                             <TableHead className="p-2">
//                               Voucher Number
//                             </TableHead>
//                             <TableHead className="p-2">Date</TableHead>
//                             <TableHead className="p-2">Particular</TableHead>
//                             <TableHead className="p-2">Amount</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {report.transactionData
//                             ?.filter((t) => t.debit > 0)
//                             .map((transaction, i) => (
//                               <TableRow key={i}>
//                                 <TableCell className="p-2">
//                                   {isGeneratingPdf ? (
//                                     transaction.voucherNo
//                                   ) : (
//                                     <Link
//                                       href={linkGenerator(
//                                         transaction.voucherId
//                                       )}
//                                     >
//                                       {transaction.voucherNo}
//                                     </Link>
//                                   )}
//                                 </TableCell>
//                                 <TableCell className="p-2">
//                                   {transaction.date}
//                                 </TableCell>
//                                 <TableCell className="p-2">
//                                   {transaction.oppositeNarration}
//                                 </TableCell>
//                                 <TableCell className="p-2 text-right">
//                                   {transaction.oppositeAmount}
//                                 </TableCell>
//                               </TableRow>
//                             ))}
//                         </TableBody>
//                       </Table>
//                     </div>

//                     {/* Payment Table */}
//                     <div className="border rounded p-2">
//                       <h3 className="font-bold mb-1 text-center pdf-table-header">
//                         Payment
//                       </h3>
//                       <Table>
//                         <TableHeader className="pdf-table-header">
//                           <TableRow>
//                             <TableHead className="p-2">
//                               Voucher Number
//                             </TableHead>
//                             <TableHead className="p-2">Date</TableHead>
//                             <TableHead className="p-2">Particular</TableHead>
//                             <TableHead className="p-2">Amount</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {report.transactionData
//                             ?.filter((t) => t.credit > 0)
//                             .map((transaction, i) => (
//                               <TableRow key={i}>
//                                 <TableCell className="p-2">
//                                   {isGeneratingPdf ? (
//                                     transaction.voucherNo
//                                   ) : (
//                                     <Link
//                                       href={linkGenerator(
//                                         transaction.voucherId
//                                       )}
//                                     >
//                                       {transaction.voucherNo}
//                                     </Link>
//                                   )}
//                                 </TableCell>
//                                 <TableCell className="p-2">
//                                   {transaction.date}
//                                 </TableCell>
//                                 <TableCell className="p-2">
//                                   {transaction.oppositeNarration}
//                                 </TableCell>
//                                 <TableCell className="p-2 text-right">
//                                   {transaction.oppositeAmount}
//                                 </TableCell>
//                               </TableRow>
//                             ))}

//                           {/* 🟢 Closing Balance Row */}
//                           {report.closingBal?.map((bal, i) => (
//                             <TableRow
//                               key={`closing-${i}`}
//                               className="font-bold"
//                             >
//                               <TableCell />
//                               <TableCell />
//                               <TableCell className="p-2">
//                                 Closing Balance
//                               </TableCell>
//                               <TableCell className="p-2 text-right">
//                                 {bal.balance}
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </div>
//                   </div>

//                   <div className="border rounded p-2 ml-auto w-1/2">
//                     <div className="mt-1 font-bold">
//                       Total IOU:&nbsp;
//                       {loanData?.reduce((sum, loan) => sum + loan.amount, 0)}
//                     </div>
//                   </div>

//                   <div className="border rounded p-2 ml-auto w-1/2">
//                     <div className="font-bold mb-1">
//                       Total Amount: {totalAmount}
//                     </div>

//                     <div className="grid grid-cols-2 gap-2">
//                       <div>
//                         <h4 className="font-semibold mb-1">Money Note Count</h4>
//                         <div className="space-y-1">
//                           {(
//                             [1000, 500, 200, 100, 50, 20, 10, 5, 1] as const
//                           ).map((denom) => (
//                             <div
//                               key={denom}
//                               className="flex justify-between items-center gap-1"
//                             >
//                               <span>{denom} x</span>
//                               <input
//                                 type="number"
//                                 className="w-20 border rounded p-1"
//                                 value={notes[denom]}
//                                 onChange={(e) =>
//                                   handleNoteChange(
//                                     Number(e.target.value) || 0,
//                                     denom
//                                   )
//                                 }
//                               />
//                               <span>=</span>
//                               <input
//                                 type="number"
//                                 className="w-24 border rounded p-1"
//                                 readOnly
//                                 value={notes[denom] * denom}
//                               />
//                             </div>
//                           ))}

//                           {/* Coins */}
//                           <div className="flex justify-between items-center gap-1">
//                             <span>Coins</span>
//                             <input
//                               type="number"
//                               className="w-24 border rounded p-1"
//                               value={notes.coins}
//                               onChange={(e) =>
//                                 handleNoteChange(
//                                   Number(e.target.value) || 0,
//                                   'coins'
//                                 )
//                               }
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="mt-3 font-bold">
//                       Note Total: {noteTotal}
//                     </div>
//                     {/* <div className="mt-1 font-bold text-red-600">
//                       Rest Amount: {restAmount}
//                     </div> */}
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
// export default CashReportList
