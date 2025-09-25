

// 'use client'
// import type React from 'react'
// import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'

// interface CoaPlMappingReport {
//   accountId: number | null
//   name: string | null
//   position: number
//   formula: string | null
//   Label: string
//   document: string
//   balance: number
// }

// interface ProfitAndLossProps {
//   data: CoaPlMappingReport[]
//   targetRef: React.RefObject<HTMLDivElement>
// }

// const ProfitAndLossTableData: React.FC<ProfitAndLossProps> = ({
//   data,
//   targetRef,
// }) => {
//   // sort by position ascending
//   const sortedData = [...data].sort((a, b) => a.position - b.position)

//   return (
//     <div
//       ref={targetRef}
//       className="w-full mt-2 max-w-[98%] mx-auto px-6 py-3 border shadow-lg"
//     >
//       {data.length > 0 && (
//         <div className="mb-4 text-center">
//           <h2 className="text-xl font-bold text-gray-800">
//             {data[0]?.document || 'Financial Report'}
//           </h2>
//         </div>
//       )}

//       <Table>
//         <TableBody>
//           {sortedData.map((item, index) => (
//             <TableRow
//               key={index}
//               className={`hover:bg-gray-200 p-2 ${item.balance < 0 ? 'text-red-500' : ''}`}
//             >
//               <TableCell className="p-2 font-medium">{item.Label}</TableCell>
//               <TableCell className="text-right p-2 font-mono">
//                 {item.balance.toLocaleString(undefined, {
//                   minimumFractionDigits: 2,
//                 })}
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>

//       {data.length === 0 && (
//         <div className="text-center py-8 text-gray-500">
//           <p>No data available for the selected document type.</p>
//         </div>
//       )}
//     </div>
//   )
// }

// export default ProfitAndLossTableData


'use client'
import type React from 'react'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'

interface CoaPlMappingReport {
  accountId: number | null
  name: string | null
  position: number
  formula: string | null
  Label: string
  document: string
  balance: number
}

interface ProfitAndLossProps {
  data: CoaPlMappingReport[]
  targetRef: React.RefObject<HTMLDivElement>
}

const ProfitAndLossTableData: React.FC<ProfitAndLossProps> = ({
  data,
  targetRef,
}) => {
  const sortedData = [...data].sort((a, b) => a.position - b.position)

  return (
    <div
      ref={targetRef}
      className="w-full mt-2 max-w-[98%] mx-auto px-6 py-3 border shadow-lg"
    >
      {data.length > 0 && (
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold text-gray-800">
            {data[0]?.document || 'Financial Report'}
          </h2>
        </div>
      )}

      <Table>
        <TableBody>
          {sortedData.map((item, index) => (
            <TableRow
              key={index}
              className={`hover:bg-gray-200 p-2 ${item.balance < 0 ? 'text-red-500' : ''}`}
            >
              <TableCell className="p-2 font-medium">{item.Label}</TableCell>
              <TableCell className="text-right p-2 font-mono">
                {item.balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No data available for the selected document type.</p>
        </div>
      )}
    </div>
  )
}

export default ProfitAndLossTableData
