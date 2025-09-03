


// // 'use client'

// // import React from 'react'
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from '@/components/ui/table'

// // interface LoanGraphReportListProps {
// //   loanPosition: any[]
// // }

// // const LoanGraphReportList: React.FC<LoanGraphReportListProps> = ({
// //   loanPosition,
// // }) => {
// //   if (!loanPosition || loanPosition.length === 0) {
// //     return (
// //       <div className="text-center py-8 text-gray-500">
// //         No data available for the selected period.
// //       </div>
// //     )
// //   }

// //   // Normalize data
// //   const normalizedData = loanPosition.map((item) => ({
// //     companyName: item.companyName ?? 'Unknown',
// //     date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
// //     balance: parseFloat(item.balance) || 0,
// //   }))

// //   // Group by company
// //   const companyMap = new Map<string, typeof normalizedData>()
// //   normalizedData.forEach((item) => {
// //     if (!companyMap.has(item.companyName)) companyMap.set(item.companyName, [])
// //     companyMap.get(item.companyName)!.push(item)
// //   })

// //   // Unique dates sorted
// //   const uniqueDates = Array.from(
// //     new Set(normalizedData.map((item) => item.date))
// //   ).sort()

// //   const formatBalance = (balance: number) => balance.toLocaleString()
// //   const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString()

// //   return (
// //     <Table className="table-fixed border-collapse border border-gray-300 overflow-x-auto">
// //       <TableHeader>
// //         <TableRow className="bg-gray-200 text-center">
// //           <TableHead className="border border-gray-300">Company</TableHead>
// //           {uniqueDates.map((date, idx) => (
// //             <TableHead key={idx} className="border border-gray-300">
// //               {formatDate(date)}
// //             </TableHead>
// //           ))}
// //           <TableHead className="border border-gray-300">Total</TableHead>
// //         </TableRow>
// //       </TableHeader>
// //       <TableBody>
// //         {Array.from(companyMap.entries()).map(
// //           ([company, records], rowIndex) => {
// //             const dateMap = new Map(records.map((r) => [r.date, r.balance]))
// //             const companyTotal = Array.from(dateMap.values()).reduce(
// //               (a, b) => a + b,
// //               0
// //             )

// //             return (
// //               <TableRow key={rowIndex} className="text-center">
// //                 <TableCell className="border border-gray-300 font-bold">
// //                   {company}
// //                 </TableCell>
// //                 {uniqueDates.map((date, idx) => {
// //                   const balance = dateMap.get(date) || 0
// //                   return (
// //                     <TableCell key={idx} className="border border-gray-300">
// //                       {balance === 0 ? '0' : formatBalance(balance)}
// //                     </TableCell>
// //                   )
// //                 })}
// //                 <TableCell className="border border-gray-300 font-bold">
// //                   {formatBalance(companyTotal)}
// //                 </TableCell>
// //               </TableRow>
// //             )
// //           }
// //         )}

// //         {/* TOTAL row */}
// //         <TableRow className="bg-gray-200 font-bold text-center">
// //           <TableCell className="border border-gray-300">TOTAL</TableCell>
// //           {uniqueDates.map((date, idx) => {
// //             const total = Array.from(companyMap.values()).reduce(
// //               (sum, records) =>
// //                 sum + (records.find((r) => r.date === date)?.balance || 0),
// //               0
// //             )
// //             return (
// //               <TableCell key={idx} className="border border-gray-300">
// //                 {formatBalance(total)}
// //               </TableCell>
// //             )
// //           })}
// //           <TableCell className="border border-gray-300">
// //             {Array.from(companyMap.values())
// //               .reduce(
// //                 (sum, records) =>
// //                   sum + records.reduce((a, r) => a + r.balance, 0),
// //                 0
// //               )
// //               .toLocaleString()}
// //           </TableCell>
// //         </TableRow>
// //       </TableBody>
// //     </Table>
// //   )
// // }

// // export default LoanGraphReportList


// 'use client'

// import React from 'react'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'

// interface LoanGraphReportListProps {
//   loanPosition: any[]
// }

// const LoanGraphReportList: React.FC<LoanGraphReportListProps> = ({
//   loanPosition,
// }) => {
//   if (!loanPosition || loanPosition.length === 0) {
//     return (
//       <div className="text-center py-8 text-gray-500">
//         No data available for the selected period.
//       </div>
//     )
//   }

//   // Normalize data
//   const normalizedData = loanPosition.map((item) => ({
//     companyName: item.companyName ?? 'Unknown',
//     date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
//     balance: parseFloat(item.balance) || 0,
//   }))

//   // Group by company
//   const companyMap = new Map<string, typeof normalizedData>()
//   normalizedData.forEach((item) => {
//     if (!companyMap.has(item.companyName)) companyMap.set(item.companyName, [])
//     companyMap.get(item.companyName)!.push(item)
//   })

//   // Unique dates sorted
//   const uniqueDates = Array.from(
//     new Set(normalizedData.map((item) => item.date))
//   ).sort()

//   const formatBalance = (balance: number) => balance.toLocaleString()
//   const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString()

//   return (
//     <Table className="table-fixed border-collapse border border-gray-300 overflow-x-auto">
//       <TableHeader>
//         <TableRow className="bg-gray-200 text-center">
//           <TableHead className="border border-gray-300">Company</TableHead>
//           {uniqueDates.map((date, idx) => (
//             <TableHead key={idx} className="border border-gray-300">
//               {formatDate(date)}
//             </TableHead>
//           ))}
//           <TableHead className="border border-gray-300">Total</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {Array.from(companyMap.entries()).map(
//           ([company, records], rowIndex) => {
//             // Build dateMap with summed balances
//             const dateMap = new Map<string, number>()
//             records.forEach((r) => {
//               dateMap.set(r.date, (dateMap.get(r.date) || 0) + r.balance)
//             })

//             const companyTotal = Array.from(dateMap.values()).reduce(
//               (a, b) => a + b,
//               0
//             )

//             return (
//               <TableRow key={rowIndex} className="text-center">
//                 <TableCell className="border border-gray-300 font-bold">
//                   {company}
//                 </TableCell>
//                 {uniqueDates.map((date, idx) => {
//                   const balance = dateMap.get(date) || 0
//                   return (
//                     <TableCell key={idx} className="border border-gray-300">
//                       {balance === 0 ? '0' : formatBalance(balance)}
//                     </TableCell>
//                   )
//                 })}
//                 <TableCell className="border border-gray-300 font-bold">
//                   {formatBalance(companyTotal)}
//                 </TableCell>
//               </TableRow>
//             )
//           }
//         )}

//         {/* TOTAL row */}
//         <TableRow className="bg-gray-200 font-bold text-center">
//           <TableCell className="border border-gray-300">TOTAL</TableCell>
//           {uniqueDates.map((date, idx) => {
//             const total = Array.from(companyMap.values()).reduce(
//               (sum, records) =>
//                 sum +
//                 records.reduce(
//                   (s, r) => (r.date === date ? s + r.balance : s),
//                   0
//                 ),
//               0
//             )
//             return (
//               <TableCell key={idx} className="border border-gray-300">
//                 {formatBalance(total)}
//               </TableCell>
//             )
//           })}
//           <TableCell className="border border-gray-300">
//             {Array.from(companyMap.values())
//               .reduce(
//                 (sum, records) =>
//                   sum + records.reduce((a, r) => a + r.balance, 0),
//                 0
//               )
//               .toLocaleString()}
//           </TableCell>
//         </TableRow>
//       </TableBody>
//     </Table>
//   )
// }

// export default LoanGraphReportList


'use client'

import { forwardRef } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface LoanGraphReportListProps {
  loanPosition: any[]
}

const LoanGraphReportList = forwardRef<
  HTMLDivElement,
  LoanGraphReportListProps
>(({ loanPosition }, ref) => {
  if (!loanPosition || loanPosition.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available for the selected period.
      </div>
    )
  }

  // Normalize data
  const normalizedData = loanPosition.map((item) => ({
    companyName: item.companyName ?? 'Unknown',
    date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
    balance: Number.parseFloat(item.balance) || 0,
  }))

  // Group by company
  const companyMap = new Map<string, typeof normalizedData>()
  normalizedData.forEach((item) => {
    if (!companyMap.has(item.companyName)) companyMap.set(item.companyName, [])
    companyMap.get(item.companyName)!.push(item)
  })

  // Unique dates sorted
  const uniqueDates = Array.from(
    new Set(normalizedData.map((item) => item.date))
  ).sort()

  const formatBalance = (balance: number) => balance.toLocaleString()
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString()

  return (
    <div ref={ref}>
      <Table className="table-fixed border-collapse border border-gray-300 overflow-x-auto">
        <TableHeader>
          <TableRow className="bg-gray-200 text-center">
            <TableHead className="border border-gray-300">Company</TableHead>
            {uniqueDates.map((date, idx) => (
              <TableHead key={idx} className="border border-gray-300">
                {formatDate(date)}
              </TableHead>
            ))}
            <TableHead className="border border-gray-300">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from(companyMap.entries()).map(
            ([company, records], rowIndex) => {
              // Build dateMap with summed balances
              const dateMap = new Map<string, number>()
              records.forEach((r) => {
                dateMap.set(r.date, (dateMap.get(r.date) || 0) + r.balance)
              })

              const companyTotal = Array.from(dateMap.values()).reduce(
                (a, b) => a + b,
                0
              )

              return (
                <TableRow key={rowIndex} className="text-center">
                  <TableCell className="border border-gray-300 font-bold">
                    {company}
                  </TableCell>
                  {uniqueDates.map((date, idx) => {
                    const balance = dateMap.get(date) || 0
                    return (
                      <TableCell key={idx} className="border border-gray-300">
                        {balance === 0 ? '0' : formatBalance(balance)}
                      </TableCell>
                    )
                  })}
                  <TableCell className="border border-gray-300 font-bold">
                    {formatBalance(companyTotal)}
                  </TableCell>
                </TableRow>
              )
            }
          )}

          {/* TOTAL row */}
          <TableRow className="bg-gray-200 font-bold text-center">
            <TableCell className="border border-gray-300">TOTAL</TableCell>
            {uniqueDates.map((date, idx) => {
              const total = Array.from(companyMap.values()).reduce(
                (sum, records) =>
                  sum +
                  records.reduce(
                    (s, r) => (r.date === date ? s + r.balance : s),
                    0
                  ),
                0
              )
              return (
                <TableCell key={idx} className="border border-gray-300">
                  {formatBalance(total)}
                </TableCell>
              )
            })}
            <TableCell className="border border-gray-300">
              {Array.from(companyMap.values())
                .reduce(
                  (sum, records) =>
                    sum + records.reduce((a, r) => a + r.balance, 0),
                  0
                )
                .toLocaleString()}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
})

LoanGraphReportList.displayName = 'LoanGraphReportList'

export default LoanGraphReportList
