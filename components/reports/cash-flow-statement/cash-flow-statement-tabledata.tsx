// 'use client'

// interface CashFlowStatementItem {
//   cashflowTag: string
//   credit: string | number
//   debit: string | number
// }

// interface CashFlowStatementProps {
//   targetRef: React.RefObject<HTMLDivElement>
//   cashFlowStatements: CashFlowStatementItem[]
// }

// const CashFlowStatement: React.FC<CashFlowStatementProps> = ({
//   targetRef,
//   cashFlowStatements,
// }) => {
//   const operatingActivities = cashFlowStatements.filter((item) => {
//     const regex =
//       /(Advance Payments received from customers|Cash received from operating activities|Advance payments made to suppliers|Cash paid for operating activities)/i
//     return regex.test(item.cashflowTag || '')
//   })

//   const investingAndExtraordinary = cashFlowStatements.filter((item) =>
//     item.cashflowTag?.toLowerCase().includes('investing')
//   )

//   const financingActivities = cashFlowStatements.filter((item) =>
//     item.cashflowTag?.toLowerCase().includes('financing')
//   )

//   const unclassifiedActivities = cashFlowStatements.filter(
//     (item) =>
//       !item.cashflowTag?.toLowerCase().includes('operating') &&
//       !item.cashflowTag?.toLowerCase().includes('investing') &&
//       !item.cashflowTag?.toLowerCase().includes('financing')
//   )

//   const renderActivities = (activities: CashFlowStatementItem[]) => (
//     <div className="space-y-2">
//       {activities.map((item, index) => {
//         const credit =
//           typeof item.credit === 'number'
//             ? item.credit
//             : parseFloat(item.credit as string)
//         const debit =
//           typeof item.debit === 'number'
//             ? item.debit
//             : parseFloat(item.debit as string)
//         return (
//           <div key={index} className="flex justify-between pl-8">
//             <span className="w-1/2">{item.cashflowTag || 'N/A'}</span>
//             <span className="w-1/4 text-right">
//               {credit ? `-${credit.toFixed(2)}` : '0.00'}
//             </span>
//             <span className="w-1/4 text-right">
//               {debit ? `+${debit.toFixed(2)}` : '0.00'}
//             </span>
//           </div>
//         )
//       })}
//     </div>
//   )

//   return (
//     <div ref={targetRef} className="w-full max-w-4xl mx-auto border-2 p-4">
//       <div className="flex justify-between items-center bg-gray-100 p-3">
//         <span className="font-medium">
//           Cash and cash equivalents, beginning of period
//         </span>
//         <span>{cashFlowStatements[0]?.credit || '0.00'}</span>
//       </div>
//       <div className="mt-4">
//         <div className="bg-gray-100 p-3 mb-4">
//           <span className="font-medium">
//             Net increase in cash and cash equivalents
//           </span>
//         </div>

//         <div className="mb-4">
//           <div className="font-medium mb-2 bg-gray-100 p-3">
//             Cash flows from operating activities
//           </div>
//           <div className="flex justify-between pl-8 font-medium">
//             <span className="w-1/2">Activity</span>
//             <span className="w-1/4 text-right">Credit</span>
//             <span className="w-1/4 text-right">Debit</span>
//           </div>
//           {renderActivities(operatingActivities)}
//         </div>

//         <div className="mb-4">
//           <div className="font-medium mb-2">
//             Cash flows from investing & extraordinary activities
//           </div>
//           <div className="flex justify-between pl-8 font-medium">
//             <span className="w-1/2">Activity</span>
//             <span className="w-1/4 text-right">Credit</span>
//             <span className="w-1/4 text-right">Debit</span>
//           </div>
//           {renderActivities(investingAndExtraordinary)}
//         </div>

//         <div className="mb-4">
//           <div className="font-medium mb-2">
//             Cash flows from financing activities
//           </div>
//           <div className="flex justify-between pl-8 font-medium">
//             <span className="w-1/2">Activity</span>
//             <span className="w-1/4 text-right">Credit</span>
//             <span className="w-1/4 text-right">Debit</span>
//           </div>
//           {renderActivities(financingActivities)}
//         </div>

//         <div className="mb-4">
//           <div className="font-medium mb-2">
//             Cash flows from unclassified activities
//           </div>
//           <div className="flex justify-between pl-8 font-medium">
//             <span className="w-1/2">Activity</span>
//             <span className="w-1/4 text-right">Credit</span>
//             <span className="w-1/4 text-right">Debit</span>
//           </div>
//           {renderActivities(unclassifiedActivities)}
//         </div>
//       </div>
//       <div className="flex justify-between items-center bg-gray-100 p-3 mt-4">
//         <span className="font-medium">
//           Cash and cash equivalents, closing balance
//         </span>
//         <span>
//           {cashFlowStatements.find(
//             (item) =>
//               item.cashflowTag === 'Cash and cash equivalents, end of period'
//           )?.credit || '0.00'}
//         </span>
//       </div>
//     </div>
//   )
// }

// export default CashFlowStatement

// 'use client'

// import React from 'react'
// import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'

// interface CashFlowStatementItem {
//   cashflowTag: string
//   credit: string | number
//   debit: string | number
// }

// interface CashFlowStatementProps {
//   targetRef: React.RefObject<HTMLDivElement>
//   cashFlowStatements: CashFlowStatementItem[]
// }

// const CashFlowStatement: React.FC<CashFlowStatementProps> = ({
//   targetRef,
//   cashFlowStatements,
// }) => {
//   const operatingActivities = cashFlowStatements.filter((item) => {
//     const regex =
//       /(Advance Payments received from customers|Cash received from operating activities|Advance payments made to suppliers|Cash paid for operating activities)/i
//     return regex.test(item.cashflowTag || '')
//   })

//   const investingAndExtraordinary = cashFlowStatements.filter((item) =>
//     item.cashflowTag?.toLowerCase().includes('investing')
//   )

//   const financingActivities = cashFlowStatements.filter((item) =>
//     item.cashflowTag?.toLowerCase().includes('financing')
//   )

//   const unclassifiedActivities = cashFlowStatements.filter(
//     (item) =>
//       !item.cashflowTag?.toLowerCase().includes('operating') &&
//       !item.cashflowTag?.toLowerCase().includes('investing') &&
//       !item.cashflowTag?.toLowerCase().includes('financing')
//   )

//   const formatAmount = (amount: string | number) => {
//     const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
//     return numAmount ? numAmount.toFixed(2) : '0.00'
//   }

//   return (
//     <div ref={targetRef} className="w-full max-w-4xl mx-auto">
//       {/* Beginning Balance */}
//       <div className="bg-gray-100 p-4 flex justify-between items-center">
//         <span className="text-gray-700">
//           Cash and cash equivalents, beginning of period
//         </span>
//         <span className="text-gray-700">
//           {formatAmount(cashFlowStatements[0]?.credit)}
//         </span>
//       </div>

//       {/* Net Increase Section */}
//       <div className="bg-gray-100 p-4 mt-4">
//         <span className="text-gray-700">
//           Net increase in cash and cash equivalents
//         </span>
//       </div>

//       {/* Operating Activities */}
//       <div className="mt-2">
//         <div className="text-gray-700 p-4">
//           Cash flows from operating activities
//         </div>
//         <Table>
//           <TableBody>
//             {operatingActivities.map((item, index) => (
//               <TableRow key={index} className="hover:bg-muted/50">
//                 <TableCell className="pl-8">{item.cashflowTag}</TableCell>
//                 <TableCell className="text-right">
//                   {formatAmount(item.credit)}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Investing Activities */}
//       <div className="mt-2">
//         <div className="text-gray-700 p-4">
//           Cash flows from investing & extraordinary activities
//         </div>
//         <Table>
//           <TableBody>
//             <TableRow className="hover:bg-muted/50">
//               <TableCell className="pl-8">Cash in</TableCell>
//               <TableCell className="text-right">
//                 {formatAmount(
//                   investingAndExtraordinary.reduce(
//                     (sum, item) =>
//                       sum + (parseFloat(item.debit as string) || 0),
//                     0
//                   )
//                 )}
//               </TableCell>
//             </TableRow>
//             <TableRow className="hover:bg-muted/50">
//               <TableCell className="pl-8">Cash out</TableCell>
//               <TableCell className="text-right">
//                 {formatAmount(
//                   investingAndExtraordinary.reduce(
//                     (sum, item) =>
//                       sum + (parseFloat(item.credit as string) || 0),
//                     0
//                   )
//                 )}
//               </TableCell>
//             </TableRow>
//           </TableBody>
//         </Table>
//       </div>

//       {/* Financing Activities */}
//       <div className="mt-2">
//         <div className="text-gray-700 p-4">
//           Cash flows from financing activities
//         </div>
//         <Table>
//           <TableBody>
//             <TableRow className="hover:bg-muted/50">
//               <TableCell className="pl-8">Cash in</TableCell>
//               <TableCell className="text-right">
//                 {formatAmount(
//                   financingActivities.reduce(
//                     (sum, item) =>
//                       sum + (parseFloat(item.debit as string) || 0),
//                     0
//                   )
//                 )}
//               </TableCell>
//             </TableRow>
//             <TableRow className="hover:bg-muted/50">
//               <TableCell className="pl-8">Cash out</TableCell>
//               <TableCell className="text-right">
//                 {formatAmount(
//                   financingActivities.reduce(
//                     (sum, item) =>
//                       sum + (parseFloat(item.credit as string) || 0),
//                     0
//                   )
//                 )}
//               </TableCell>
//             </TableRow>
//           </TableBody>
//         </Table>
//       </div>

//       {/* Unclassified Activities */}
//       <div className="mt-2">
//         <div className="text-gray-700 p-4">
//           Cash flows from unclassified activities
//         </div>
//         <Table>
//           <TableBody>
//             <TableRow className="hover:bg-muted/50">
//               <TableCell className="pl-8">Cash in</TableCell>
//               <TableCell className="text-right">
//                 {formatAmount(
//                   unclassifiedActivities.reduce(
//                     (sum, item) =>
//                       sum + (parseFloat(item.debit as string) || 0),
//                     0
//                   )
//                 )}
//               </TableCell>
//             </TableRow>
//             <TableRow className="hover:bg-muted/50">
//               <TableCell className="pl-8">Cash out</TableCell>
//               <TableCell className="text-right">
//                 {formatAmount(
//                   unclassifiedActivities.reduce(
//                     (sum, item) =>
//                       sum + (parseFloat(item.credit as string) || 0),
//                     0
//                   )
//                 )}
//               </TableCell>
//             </TableRow>
//           </TableBody>
//         </Table>
//       </div>

//       {/* Closing Balance */}
//       <div className="bg-gray-100 p-4 mt-4 flex justify-between items-center">
//         <span className="text-gray-700">
//           Cash and cash equivalents, closing balance
//         </span>
//         <span className="text-gray-700">
//           {formatAmount(
//             cashFlowStatements.find(
//               (item) =>
//                 item.cashflowTag === 'Cash and cash equivalents, end of period'
//             )?.credit || '0.00'
//           )}
//         </span>
//       </div>
//     </div>
//   )
// }

// export default CashFlowStatement

'use client'

import React from 'react'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'

interface CashFlowStatementItem {
  cashflowTag: string
  credit: string | number
  debit: string | number
}

interface CashFlowStatementProps {
  targetRef: React.RefObject<HTMLDivElement>
  cashFlowStatements: CashFlowStatementItem[]
}

const CashFlowStatement: React.FC<CashFlowStatementProps> = ({
  targetRef,
  cashFlowStatements,
}) => {
  const operatingActivities = cashFlowStatements.filter((item) => {
    const regex =
      /(Advance Payments received from customers|Cash received from operating activities|Advance payments made to suppliers|Cash paid for operating activities)/i
    return regex.test(item.cashflowTag || '')
  })

  const investingAndExtraordinary = cashFlowStatements.filter((item) =>
    item.cashflowTag?.toLowerCase().includes('investing')
  )

  const financingActivities = cashFlowStatements.filter((item) =>
    item.cashflowTag?.toLowerCase().includes('financing')
  )

  const unclassifiedActivities = cashFlowStatements.filter(
    (item) =>
      !item.cashflowTag?.toLowerCase().includes('operating') &&
      !item.cashflowTag?.toLowerCase().includes('investing') &&
      !item.cashflowTag?.toLowerCase().includes('financing')
  )

  const formatAmount = (amount: string | number, isCredit: boolean = false) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (!numAmount) return '0.00'
    const formattedNumber = numAmount.toFixed(2)
    return isCredit ? `-${formattedNumber}` : `+${formattedNumber}`
  }

  return (
    <div
      ref={targetRef}
      className="mt-2 w-full border-2 shadow-lg rounded-md p-2 max-w-4xl mx-auto"
    >
      <Table>
        <TableBody>
          {/* Beginning Balance */}
          <TableRow className="hover:bg-muted/50">
            <TableCell className="bg-gray-100 p-2">
              <span className="text-gray-700 font-bold">
                Cash and cash equivalents, beginning of period
              </span>
            </TableCell>
            <TableCell className="bg-gray-100 p-2 text-right">
              <span className="text-gray-700">
                {formatAmount(cashFlowStatements[0]?.credit, true)}
              </span>
            </TableCell>
          </TableRow>

          {/* Net Increase Section */}
          <TableRow className="hover:bg-muted/50">
            <TableCell colSpan={2} className="bg-gray-100 p-2">
              <span className="text-gray-700 font-bold">
                Net increase in cash and cash equivalents
              </span>
            </TableCell>
          </TableRow>

          {/* Operating Activities */}
          <TableRow className="hover:bg-muted/50">
            <TableCell colSpan={2} className="p-2">
              <span className="text-gray-700 font-bold">
                Cash flows from operating activities
              </span>
            </TableCell>
          </TableRow>
          {operatingActivities.map((item, index) => (
            <TableRow key={index} className="hover:bg-muted/50">
              <TableCell className="pl-4 p-2">{item.cashflowTag}</TableCell>
              <TableCell className="text-right p-2">
                {item.credit
                  ? formatAmount(item.credit, true)
                  : formatAmount(item.debit)}
              </TableCell>
            </TableRow>
          ))}

          {/* Investing Activities */}
          <TableRow className="hover:bg-muted/50">
            <TableCell colSpan={2} className="p-2">
              <span className="text-gray-700 font-bold">
                Cash flows from investing & extraordinary activities
              </span>
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-muted/50">
            <TableCell className="pl-4 p-2">Cash in</TableCell>
            <TableCell className="text-right p-2">
              {formatAmount(
                investingAndExtraordinary.reduce(
                  (sum, item) => sum + (parseFloat(item.debit as string) || 0),
                  0
                )
              )}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-muted/50">
            <TableCell className="pl-4 p-2">Cash out</TableCell>
            <TableCell className="text-right p-2">
              {formatAmount(
                investingAndExtraordinary.reduce(
                  (sum, item) => sum + (parseFloat(item.credit as string) || 0),
                  0
                ),
                true
              )}
            </TableCell>
          </TableRow>

          {/* Financing Activities */}
          <TableRow className="hover:bg-muted/50">
            <TableCell colSpan={2} className="p-2">
              <span className="text-gray-700 font-bold">
                Cash flows from financing activities
              </span>
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-muted/50">
            <TableCell className="pl-4 p-2">Cash in</TableCell>
            <TableCell className="text-right p-2">
              {formatAmount(
                financingActivities.reduce(
                  (sum, item) => sum + (parseFloat(item.debit as string) || 0),
                  0
                )
              )}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-muted/50">
            <TableCell className="pl-4 p-2">Cash out</TableCell>
            <TableCell className="text-right p-2">
              {formatAmount(
                financingActivities.reduce(
                  (sum, item) => sum + (parseFloat(item.credit as string) || 0),
                  0
                ),
                true
              )}
            </TableCell>
          </TableRow>

          {/* Unclassified Activities */}
          <TableRow className="hover:bg-muted/50">
            <TableCell colSpan={2} className="p-2">
              <span className="text-gray-700 font-bold">
                Cash flows from unclassified activities
              </span>
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-muted/50">
            <TableCell className="pl-4 p-2">Cash in</TableCell>
            <TableCell className="text-right p-2">
              {formatAmount(
                unclassifiedActivities.reduce(
                  (sum, item) => sum + (parseFloat(item.debit as string) || 0),
                  0
                )
              )}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-muted/50">
            <TableCell className="pl-4 p-2">Cash out</TableCell>
            <TableCell className="text-right p-2">
              {formatAmount(
                unclassifiedActivities.reduce(
                  (sum, item) => sum + (parseFloat(item.credit as string) || 0),
                  0
                ),
                true
              )}
            </TableCell>
          </TableRow>

          {/* Closing Balance */}
          <TableRow className="hover:bg-muted/50">
            <TableCell className="bg-gray-100 p-2">
              <span className="text-gray-700 font-bold">
                Cash and cash equivalents, closing balance
              </span>
            </TableCell>
            <TableCell className="bg-gray-100 p-2 text-right">
              <span className="text-gray-700">0.00</span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

export default CashFlowStatement
