// 'use client'
// import type { LoanBalanceType } from '@/utils/type'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import React from 'react'

// interface Props {
//   data: LoanBalanceType[]
// }

// const LoanSanctionReportList: React.FC<Props> = ({ data = [] }) => {
//   const flatData: LoanBalanceType[] = data ? data.flat() : []

//   // Group by company → bank – branch → account type
//   const groupedData = flatData.reduce((acc: any, item) => {
//     if (!acc[item.companyName]) acc[item.companyName] = {}

//     const bankBranch = item.branchName
//       ? `${item.bankName} – ${item.branchName}`
//       : item.bankName
//     if (!acc[item.companyName][bankBranch])
//       acc[item.companyName][bankBranch] = {}

//     if (!acc[item.companyName][bankBranch][item.accountType])
//       acc[item.companyName][bankBranch][item.accountType] = []
//     acc[item.companyName][bankBranch][item.accountType].push(item)

//     return acc
//   }, {})

//   // Calculate total for an array of accounts
//   const calculateTotal = (accounts: LoanBalanceType[]) =>
//     accounts.reduce(
//       (sum, acc) => sum + (acc.balance ? parseFloat(acc.balance) : 0),
//       0
//     )

//   // Calculate total for a company (all banks and accounts)
//   const calculateCompanyTotal = (
//     bankGroups: Record<string, Record<string, LoanBalanceType[]>>
//   ) =>
//     Object.values(bankGroups).reduce((sum, accountGroups) => {
//       return (
//         sum +
//         Object.values(accountGroups).reduce(
//           (s, accounts) => s + calculateTotal(accounts),
//           0
//         )
//       )
//     }, 0)

//   if (!data || data.length === 0) {
//     return (
//       <div className="text-center py-8 text-gray-500">
//         No loan data available
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <Table className='border-2 rounded-md'>
//         <TableHeader className='bg-gray-100'>
//           <TableRow>
//             <TableHead className="text-left">
//               Company / Bank – Branch / Account Type
//             </TableHead>
//             <TableHead className="text-left">Limit</TableHead>
//             <TableHead className="text-left">Rate</TableHead>
//             <TableHead className="text-left">Balance</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {Object.entries(groupedData).map(([companyName, bankGroups]) => (
//             <React.Fragment key={companyName}>
//               {/* Company Total */}
//               <TableRow className="bg-blue-50 font-bold">
//                 <TableCell className="font-bold text-blue-800">
//                   {companyName} Total
//                 </TableCell>
//                 <TableCell>–</TableCell>
//                 <TableCell>–</TableCell>
//                 <TableCell className="font-bold text-blue-800">
//                   {calculateCompanyTotal(
//                     bankGroups as Record<
//                       string,
//                       Record<string, LoanBalanceType[]>
//                     >
//                   ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
//                 </TableCell>
//               </TableRow>

//               {Object.entries(
//                 bankGroups as Record<string, Record<string, LoanBalanceType[]>>
//               ).map(([bankBranch, accountGroups]) => (
//                 <React.Fragment key={bankBranch}>
//                   {/* Bank – Branch Total */}
//                   <TableRow className="bg-green-50 font-semibold">
//                     <TableCell className="pl-6 font-semibold text-green-800">
//                       {bankBranch}
//                     </TableCell>
//                     <TableCell>–</TableCell>
//                     <TableCell>–</TableCell>
//                     <TableCell className="font-semibold text-green-800">
//                       {Object.values(accountGroups)
//                         .reduce(
//                           (sum, accounts) => sum + calculateTotal(accounts),
//                           0
//                         )
//                         .toLocaleString(undefined, {
//                           minimumFractionDigits: 2,
//                         })}
//                     </TableCell>
//                   </TableRow>

//                   {/* Account Type Rows */}
//                   {Object.entries(accountGroups).map(
//                     ([accountType, accounts]) => (
//                       <TableRow key={accountType}>
//                         <TableCell className="pl-12">{accountType}</TableCell>
//                         <TableCell>
//                           {accounts
//                             .map((acc) => (acc.limit != null ? acc.limit : 0))
//                             .reduce((a, b) => a + b, 0)
//                             .toLocaleString() || '–'}
//                         </TableCell>
//                         <TableCell>
//                           {accounts
//                             .map((acc) => (acc.rate != null ? acc.rate : 0))
//                             .reduce((a, b) => a + b, 0)
//                             .toLocaleString() || '–'}
//                         </TableCell>
//                         <TableCell>
//                           {calculateTotal(accounts).toLocaleString(undefined, {
//                             minimumFractionDigits: 2,
//                           })}
//                         </TableCell>
//                       </TableRow>
//                     )
//                   )}
//                 </React.Fragment>
//               ))}
//             </React.Fragment>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   )
// }

// export default LoanSanctionReportList


'use client'
import type { LoanBalanceType } from '@/utils/type'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import React from 'react'

interface Props {
  data: LoanBalanceType[]
  targetRef?: React.RefObject<HTMLDivElement>
}

const LoanSanctionReportList: React.FC<Props> = ({ data = [], targetRef }) => {
  const flatData: LoanBalanceType[] = data ? data.flat() : []

  // Group by company → bank – branch → account type
  const groupedData = flatData.reduce((acc: any, item) => {
    if (!acc[item.companyName]) acc[item.companyName] = {}

    const bankBranch = item.branchName
      ? `${item.bankName} – ${item.branchName}`
      : item.bankName
    if (!acc[item.companyName][bankBranch])
      acc[item.companyName][bankBranch] = {}

    if (!acc[item.companyName][bankBranch][item.accountType])
      acc[item.companyName][bankBranch][item.accountType] = []
    acc[item.companyName][bankBranch][item.accountType].push(item)

    return acc
  }, {})

  // Calculate total for an array of accounts
  const calculateTotal = (accounts: LoanBalanceType[]) =>
    accounts.reduce(
      (sum, acc) => sum + (acc.balance ? Number.parseFloat(acc.balance) : 0),
      0
    )

  // Calculate total for a company (all banks and accounts)
  const calculateCompanyTotal = (
    bankGroups: Record<string, Record<string, LoanBalanceType[]>>
  ) =>
    Object.values(bankGroups).reduce((sum, accountGroups) => {
      return (
        sum +
        Object.values(accountGroups).reduce(
          (s, accounts) => s + calculateTotal(accounts),
          0
        )
      )
    }, 0)

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No loan data available
      </div>
    )
  }

  return (
    <div className="space-y-6" ref={targetRef}>
      <Table className="border-2 rounded-md">
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="text-left">
              Company / Bank – Branch / Account Type
            </TableHead>
            <TableHead className="text-left">Limit</TableHead>
            <TableHead className="text-left">Rate</TableHead>
            <TableHead className="text-left">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(groupedData).map(([companyName, bankGroups]) => (
            <React.Fragment key={companyName}>
              {/* Company Total */}
              <TableRow className="bg-blue-50 font-bold">
                <TableCell className="font-bold text-blue-800">
                  {companyName} Total
                </TableCell>
                <TableCell>–</TableCell>
                <TableCell>–</TableCell>
                <TableCell className="font-bold text-blue-800">
                  {calculateCompanyTotal(
                    bankGroups as Record<
                      string,
                      Record<string, LoanBalanceType[]>
                    >
                  ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>

              {Object.entries(
                bankGroups as Record<string, Record<string, LoanBalanceType[]>>
              ).map(([bankBranch, accountGroups]) => (
                <React.Fragment key={bankBranch}>
                  {/* Bank – Branch Total */}
                  <TableRow className="bg-green-50 font-semibold">
                    <TableCell className="pl-6 font-semibold text-green-800">
                      {bankBranch}
                    </TableCell>
                    <TableCell>–</TableCell>
                    <TableCell>–</TableCell>
                    <TableCell className="font-semibold text-green-800">
                      {Object.values(accountGroups)
                        .reduce(
                          (sum, accounts) => sum + calculateTotal(accounts),
                          0
                        )
                        .toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                    </TableCell>
                  </TableRow>

                  {/* Account Type Rows */}
                  {Object.entries(accountGroups).map(
                    ([accountType, accounts]) => (
                      <TableRow key={accountType}>
                        <TableCell className="pl-12">{accountType}</TableCell>
                        <TableCell>
                          {accounts
                            .map((acc) => (acc.limit != null ? acc.limit : 0))
                            .reduce((a, b) => a + b, 0)
                            .toLocaleString() || '–'}
                        </TableCell>
                        <TableCell>
                          {accounts
                            .map((acc) => (acc.rate != null ? acc.rate : 0))
                            .reduce((a, b) => a + b, 0)
                            .toLocaleString() || '–'}
                        </TableCell>
                        <TableCell>
                          {calculateTotal(accounts).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default LoanSanctionReportList
