'use client'
import React from 'react'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { ProfitAndLossType } from '@/utils/type'

interface ProfitAndLossProps {
  data: ProfitAndLossType[]
  targetRef: React.RefObject<HTMLDivElement>
}

const ProfitAndLossTableData: React.FC<ProfitAndLossProps> = ({
  data,
  targetRef,
}) => {
  // Calculate values dynamically
  const grossProfit = data
    .filter((item) => item.position === 3)
    .reduce((acc, curr) => acc + curr.value, 0)

  const operatingIncome = data
    .filter((item) => item.position === 5)
    .reduce((acc, curr) => acc + curr.value, 0)

  const netProfit = data
    .filter((item) => item.position === 8)
    .reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div ref={targetRef}>
      <div className="w-full mt-2 max-w-2xl mx-auto px-2 py-1 border shadow-lg">
        <Table>
          <TableBody>
            {/* Static rows */}
            <TableRow className="hover:bg-gray-200">
              <TableCell className="font-normal">Revenue</TableCell>
              <TableCell className="text-right">
                {data
                  .filter((item) => item.position === 1)
                  .reduce((acc, curr) => acc + curr.value, 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
            <TableRow className="hover:bg-gray-200">
              <TableCell className="font-normal">
                Less Costs of Revenue
              </TableCell>
              <TableCell className="text-right">
                {data
                  .filter((item) => item.position === 2)
                  .reduce((acc, curr) => acc + curr.value, 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </TableCell>
            </TableRow>

            {/* Static Headline: Gross Profit Section */}
            <TableRow className="bg-gray-100">
              <TableCell colSpan={2} className="font-semibold text-left">
                Gross Profit
              </TableCell>
            </TableRow>
            <TableRow className="hover:bg-gray-200 font-bold">
              <TableCell>Gross Profit</TableCell>
              <TableCell className="text-right">
                {grossProfit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
            </TableRow>

            {/* Dynamic Rows */}
            {data.map((item, index) => (
              <TableRow
                key={index}
                className={`hover:bg-gray-200 ${item.negative ? 'text-red-500' : ''}`}
              >
                <TableCell
                  className={`${
                    item.position === 3 ||
                    item.position === 5 ||
                    item.position === 8
                      ? 'font-bold'
                      : 'font-normal'
                  }`}
                >
                  {item.title}
                </TableCell>
                <TableCell
                  className={`text-right ${
                    item.position === 3 ||
                    item.position === 5 ||
                    item.position === 8
                      ? 'font-bold'
                      : ''
                  }`}
                >
                  {item.value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
            ))}

            {/* Static Headline: Operating Income Section */}
            <TableRow className="bg-gray-100">
              <TableCell colSpan={2} className="font-semibold text-left">
                Operating Income (or Loss)
              </TableCell>
            </TableRow>
            <TableRow className="hover:bg-gray-200 font-bold">
              <TableCell>Operating Income</TableCell>
              <TableCell className="text-right">
                {operatingIncome.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
            </TableRow>

            {/* Static Headline: Net Profit Section */}
            <TableRow className="bg-gray-100">
              <TableCell colSpan={2} className="font-semibold text-left">
                Net Profit Section
              </TableCell>
            </TableRow>
            <TableRow className="hover:bg-gray-200 font-bold">
              <TableCell>Net Profit</TableCell>
              <TableCell className="text-right">
                {netProfit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default ProfitAndLossTableData

// 'use client'
// import React from 'react'
// import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
// import { ProfitAndLossType } from '@/utils/type'

// interface ProfitAndLossProps {
//   data: ProfitAndLossType[]
//   targetRef: React.RefObject<HTMLDivElement>
// }

// const ProfitAndLossTableData: React.FC<ProfitAndLossProps> = ({
//   data,
//   targetRef,
// }) => {
//   return (
//     <div ref={targetRef}>
//       <div className="w-full mt-2 max-w-2xl mx-auto px-2 py-1 border shadow-lg">
//         <Table>
//           <TableBody>
//             {/* Static rows */}
//             <TableRow className="hover:bg-gray-200">
//               <TableCell className="font-normal">Revenue</TableCell>
//               <TableCell className="text-right">0.00</TableCell>
//             </TableRow>
//             <TableRow className="hover:bg-gray-200">
//               <TableCell className="font-normal">
//                 Less Costs of Revenue
//               </TableCell>
//               <TableCell className="text-right">0.00</TableCell>
//             </TableRow>

//             {/* Static Headline: Gross Profit Section */}
//             <TableRow className="bg-gray-100">
//               <TableCell colSpan={2} className="font-semibold text-left">
//                 Gross Profit
//               </TableCell>
//             </TableRow>

//             {/* Dynamic Rows */}
//             {data.map((item, index) => (
//               <TableRow
//                 key={index}
//                 className={`hover:bg-gray-200 ${item.negative ? 'text-red-500' : ''}`}
//               >
//                 <TableCell
//                   className={`${
//                     item.position === 3 ||
//                     item.position === 5 ||
//                     item.position === 8
//                       ? 'font-bold'
//                       : 'font-normal'
//                   }`}
//                 >
//                   {item.title}
//                 </TableCell>
//                 <TableCell
//                   className={`text-right ${
//                     item.position === 3 ||
//                     item.position === 5 ||
//                     item.position === 8
//                       ? 'font-bold'
//                       : ''
//                   }`}
//                 >
//                   {item.value.toLocaleString(undefined, {
//                     minimumFractionDigits: 2,
//                   })}
//                 </TableCell>
//               </TableRow>
//             ))}

//             {/* Static Headline: Operating Income Section */}
//             <TableRow className="bg-gray-100">
//               <TableCell colSpan={2} className="font-semibold text-left">
//                 Operating Income (or Loss)
//               </TableCell>
//             </TableRow>

//             {/* Another static row example */}
//             <TableRow className="hover:bg-gray-200">
//               <TableCell className="font-normal">Less Other Expenses</TableCell>
//               <TableCell className="text-right">0.00</TableCell>
//             </TableRow>

//             {/* Static Headline: Net Profit Section */}
//             <TableRow className="bg-gray-100">
//               <TableCell colSpan={2} className="font-semibold text-left">
//                 Net Profit Section
//               </TableCell>
//             </TableRow>
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   )
// }

// export default ProfitAndLossTableData
