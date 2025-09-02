


// "use client"
// import type React from "react"
// import type { LoanBalanceType } from "@/utils/type"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// interface Props {
//   data: LoanBalanceType[]
// }

// const LoanSanctionReportList: React.FC<Props> = ({ data = [] }) => {
//   // Flatten in case data is array of arrays
//   const flatData: LoanBalanceType[] = data ? data.flat() : []

//   // Group by companyName → accountType
//   const groupedData = flatData.reduce((acc: any, item) => {
//     if (!acc[item.companyName]) acc[item.companyName] = {}
//     if (!acc[item.companyName][item.accountType]) acc[item.companyName][item.accountType] = []
//     acc[item.companyName][item.accountType].push(item)
//     return acc
//   }, {})

//   if (!data || data.length === 0) {
//     return <div className="text-center py-8 text-gray-500">No loan data available</div>
//   }

//   return (
//     <div className="space-y-6">
//       {Object.entries(groupedData).map(([companyName, accountTypes]) => (
//         <div key={companyName} className="space-y-4">
//           {/* Company Name */}
//           <h3 className="text-lg font-bold">{companyName}</h3>

//           {Object.entries(accountTypes as Record<string, LoanBalanceType[]>).map(([accountType, accounts]) => (
//             <div key={accountType} className="ml-4 space-y-2">
//               {/* Account Type */}
//               <h4 className="text-md font-semibold">{accountType}</h4>

//               <div className="ml-6">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="text-left">Bank – Branch</TableHead>
//                       <TableHead className="text-left">Limit</TableHead>
//                       <TableHead className="text-left">Rate</TableHead>
//                       <TableHead className="text-left">Balance</TableHead>
//                       <TableHead className="text-left">Date</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {accounts.map((acc, idx) => (
//                       <TableRow key={idx}>
//                         <TableCell>
//                           {acc.bankName}
//                           {acc.branchName ? ` – ${acc.branchName}` : ""}
//                         </TableCell>
//                         <TableCell>{acc.limit != null ? acc.limit : "–"}</TableCell>
//                         <TableCell>{acc.rate != null ? acc.rate + "%" : "–"}</TableCell>
//                         <TableCell>{acc.balance ?? "–"}</TableCell>
//                         <TableCell>{acc.date ? acc.date.split("T")[0] : "–"}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             </div>
//           ))}
//         </div>
//       ))}
//     </div>
//   )
// }

// export default LoanSanctionReportList

"use client"
import type { LoanBalanceType } from "@/utils/type"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import React from "react"

interface Props {
  data: LoanBalanceType[]
}

const LoanSanctionReportList: React.FC<Props> = ({ data = [] }) => {
  // Flatten in case data is array of arrays
  const flatData: LoanBalanceType[] = data ? data.flat() : []

  // Group by companyName → accountType
  const groupedData = flatData.reduce((acc: any, item) => {
    if (!acc[item.companyName]) acc[item.companyName] = {}
    if (!acc[item.companyName][item.accountType]) acc[item.companyName][item.accountType] = []
    acc[item.companyName][item.accountType].push(item)
    return acc
  }, {})

  const calculateTotal = (accounts: LoanBalanceType[]) => {
    return accounts.reduce((sum, acc) => {
      const balance = typeof acc.balance === "number" ? acc.balance : 0
      return sum + balance
    }, 0)
  }

  const calculateCompanyTotal = (accountTypes: Record<string, LoanBalanceType[]>) => {
    return Object.values(accountTypes).reduce((sum, accounts) => {
      return sum + calculateTotal(accounts)
    }, 0)
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">No loan data available</div>
  }

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Company / Account Type / Bank – Branch</TableHead>
            <TableHead className="text-left">Limit</TableHead>
            <TableHead className="text-left">Rate</TableHead>
            <TableHead className="text-left">Balance</TableHead>
            <TableHead className="text-left">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(groupedData).map(([companyName, accountTypes]) => (
            <React.Fragment key={companyName}>
              <TableRow className="bg-blue-50 font-bold">
                <TableCell className="font-bold text-blue-800">{companyName} Total</TableCell>
                <TableCell>–</TableCell>
                <TableCell>–</TableCell>
                <TableCell className="font-bold text-blue-800">
                  {calculateCompanyTotal(accountTypes as Record<string, LoanBalanceType[]>).toLocaleString()}
                </TableCell>
                <TableCell>–</TableCell>
              </TableRow>

              {Object.entries(accountTypes as Record<string, LoanBalanceType[]>).map(([accountType, accounts]) => (
                <React.Fragment key={accountType}>
                  <TableRow className="bg-green-50 font-semibold">
                    <TableCell className="pl-6 font-semibold text-green-800">{accountType}</TableCell>
                    <TableCell>–</TableCell>
                    <TableCell>–</TableCell>
                    <TableCell className="font-semibold text-green-800">
                      {calculateTotal(accounts).toLocaleString()}
                    </TableCell>
                    <TableCell>–</TableCell>
                  </TableRow>

                  {accounts.map((acc, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-12">
                        {acc.bankName}
                        {acc.branchName ? ` – ${acc.branchName}` : ""}
                      </TableCell>
                      <TableCell>{acc.limit != null ? acc.limit.toLocaleString() : "–"}</TableCell>
                      <TableCell>{acc.rate != null ? acc.rate + "%" : "–"}</TableCell>
                      <TableCell>{acc.balance != null ? acc.balance.toLocaleString() : "–"}</TableCell>
                      <TableCell>{acc.date ? acc.date.split("T")[0] : "–"}</TableCell>
                    </TableRow>
                  ))}
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
