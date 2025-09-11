


// 'use client'

// import { forwardRef } from 'react'
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts'

// interface LoanGraphReportListProps {
//   loanPosition: any[]
// }

// const LoanGraphReportList = forwardRef<
//   HTMLDivElement,
//   LoanGraphReportListProps
// >(({ loanPosition }, ref) => {
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
//     balance: Number.parseFloat(item.balance) || 0,
//   }))

//   // Group by company
//   const companyMap = new Map<string, typeof normalizedData>()
//   normalizedData.forEach((item) => {
//     if (!companyMap.has(item.companyName)) companyMap.set(item.companyName, [])
//     companyMap.get(item.companyName)!.push(item)
//   })

//   // Get unique dates and companies
//   const uniqueDates = Array.from(
//     new Set(normalizedData.map((item) => item.date))
//   ).sort()

//   const companies = Array.from(companyMap.keys())

//   // Transform data for chart format
//   const chartData = uniqueDates.map((date) => {
//     const dataPoint: any = { date: new Date(date).toLocaleDateString() }

//     companies.forEach((company) => {
//       const companyRecords = companyMap.get(company) || []
//       const dateBalance = companyRecords
//         .filter((record) => record.date === date)
//         .reduce((sum, record) => sum + record.balance, 0)

//       dataPoint[company] = dateBalance
//     })

//     return dataPoint
//   })

//   // Generate colors for each company line
//   const colors = [
//     '#8884d8',
//     '#82ca9d',
//     '#ffc658',
//     '#ff7300',
//     '#00ff00',
//     '#ff00ff',
//     '#00ffff',
//     '#ffff00',
//     '#ff0000',
//     '#0000ff',
//   ]

//   const formatTooltip = (value: any, name: string) => {
//     return [Number(value).toLocaleString(), name]
//   }

//   return (
//     <div ref={ref} className="w-full">
//       <div className="bg-white p-6 rounded-lg shadow-sm">
//         <h2 className="text-xl font-semibold mb-4 text-center">
//           Quick Assets Status
//         </h2>
//         <div style={{ width: '100%', height: '500px' }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart
//               data={chartData}
//               margin={{
//                 top: 20,
//                 right: 30,
//                 left: 20,
//                 bottom: 60,
//               }}
//             >
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis
//                 dataKey="date"
//                 angle={-45}
//                 textAnchor="end"
//                 height={80}
//                 fontSize={12}
//               />
//               <YAxis
//                 tickFormatter={(value) => value.toLocaleString()}
//                 fontSize={12}
//               />
//               <Tooltip
//                 formatter={formatTooltip}
//                 labelStyle={{ color: '#333' }}
//                 contentStyle={{
//                   backgroundColor: '#fff',
//                   border: '1px solid #ccc',
//                   borderRadius: '4px',
//                 }}
//               />
//               <Legend wrapperStyle={{ paddingTop: '20px' }} />
//               {companies.map((company, index) => (
//                 <Line
//                   key={company}
//                   type="monotone"
//                   dataKey={company}
//                   stroke={colors[index % colors.length]}
//                   strokeWidth={2}
//                   dot={{ r: 4 }}
//                   activeDot={{ r: 6 }}
//                   connectNulls={false}
//                 />
//               ))}
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   )
// })

// LoanGraphReportList.displayName = 'LoanGraphReportList'

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
