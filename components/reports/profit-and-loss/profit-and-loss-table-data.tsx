// 'use client'
// import type React from 'react'
// import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
// import type { CoaPlMappingReport, ProfitAndLossType } from '@/utils/type'

// interface ProfitAndLossProps {
//   data: CoaPlMappingReport[]
//   targetRef: React.RefObject<HTMLDivElement>
// }

// const ProfitAndLossTableData: React.FC<ProfitAndLossProps> = ({
//   data,
//   targetRef,
// }) => {
//   // Calculate values dynamically
//   const grossProfit = data
//     .filter((item) => item.position === 3)
//     .reduce((acc, curr) => acc + curr.value, 0)

//   const operatingIncome = data
//     .filter((item) => item.position === 5)
//     .reduce((acc, curr) => acc + curr.value, 0)

//   const netProfit = data
//     .filter((item) => item.position === 8)
//     .reduce((acc, curr) => acc + curr.value, 0)

//   return (
//     <div
//       ref={targetRef}
//       className="w-full mt-2 max-w-[98%] mx-auto px-6 py-3 border shadow-lg"
//     >
//       <Table>
//         <TableBody>
//           {/* Static rows */}
//           <TableRow className="hover:bg-gray-200 p-2 pdf-table-header">
//             <TableCell className="font-normal p-2">Revenue</TableCell>
//             <TableCell className="text-right p-2">
//               {data
//                 .filter((item) => item.position === 1)
//                 .reduce((acc, curr) => acc + curr.value, 0)
//                 .toLocaleString(undefined, { minimumFractionDigits: 2 })}
//             </TableCell>
//           </TableRow>
//           <TableRow className="hover:bg-gray-200 p-2">
//             <TableCell className="font-normal p-2">
//               Less Costs of Revenue
//             </TableCell>
//             <TableCell className="text-right p-2">
//               {data
//                 .filter((item) => item.position === 2)
//                 .reduce((acc, curr) => acc + curr.value, 0)
//                 .toLocaleString(undefined, { minimumFractionDigits: 2 })}
//             </TableCell>
//           </TableRow>

//           {/* Static Headline: Gross Profit Section */}
//           <TableRow className="bg-gray-100 p-2"></TableRow>
//           <TableRow className="hover:bg-gray-200 font-bold p-2 pdf-table-header">
//             <TableCell className="p-2">Gross Profit</TableCell>
//             <TableCell className="text-right p-2">
//               {grossProfit.toLocaleString(undefined, {
//                 minimumFractionDigits: 2,
//               })}
//             </TableCell>
//           </TableRow>

//           {/* Dynamic Rows */}
//           {data.map((item, index) => (
//             <TableRow
//               key={index}
//               className={`hover:bg-gray-200 p-2 ${item.negative ? 'text-red-500' : ''}`}
//             >
//               <TableCell
//                 className={`p-2 ${
//                   item.position === 3 ||
//                   item.position === 5 ||
//                   item.position === 8
//                     ? 'font-bold'
//                     : 'font-normal'
//                 }`}
//               >
//                 {item.title}
//               </TableCell>
//               <TableCell
//                 className={`text-right p-2 ${
//                   item.position === 3 ||
//                   item.position === 5 ||
//                   item.position === 8
//                     ? 'font-bold'
//                     : ''
//                 }`}
//               >
//                 {item.value.toLocaleString(undefined, {
//                   minimumFractionDigits: 2,
//                 })}
//               </TableCell>
//             </TableRow>
//           ))}

//           {/* Static Headline: Operating Income Section */}
//           <TableRow className="bg-gray-100 p-2"></TableRow>
//           <TableRow className="hover:bg-gray-200 font-bold p-2 pdf-table-header">
//             <TableCell className="p-2">Operating Income</TableCell>
//             <TableCell className="text-right p-2">
//               {operatingIncome.toLocaleString(undefined, {
//                 minimumFractionDigits: 2,
//               })}
//             </TableCell>
//           </TableRow>

//           {/* Static Headline: Net Profit Section */}
//           <TableRow className="bg-gray-100 p-2"></TableRow>
//           <TableRow className="hover:bg-gray-200 font-bold p-2 pdf-table-header">
//             <TableCell className="p-2">Net Profit</TableCell>
//             <TableCell className="text-right p-2">
//               {netProfit.toLocaleString(undefined, {
//                 minimumFractionDigits: 2,
//               })}
//             </TableCell>
//           </TableRow>
//         </TableBody>
//       </Table>
//     </div>
//   )
// }

// export default ProfitAndLossTableData


'use client'
import type React from 'react'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import type { CoaPlMappingReport } from '@/utils/type'

interface ProfitAndLossProps {
  data: CoaPlMappingReport[]
  targetRef: React.RefObject<HTMLDivElement>
}

const ProfitAndLossTableData: React.FC<ProfitAndLossProps> = ({
  data,
  targetRef,
}) => {
  // sort by position ascending
  const sortedData = [...data].sort((a, b) => a.position - b.position)

  return (
    <div
      ref={targetRef}
      className="w-full mt-2 max-w-[98%] mx-auto px-6 py-3 border shadow-lg"
    >
      <Table>
        <TableBody>
          {sortedData.map((item, index) => (
            <TableRow
              key={index}
              className={`hover:bg-gray-200 p-2 ${
                item.balance < 0 ? 'text-red-500' : ''
              }`}
            >
              <TableCell className="p-2">{item.Label}</TableCell>
              <TableCell className="text-right p-2">
                {item.balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default ProfitAndLossTableData
