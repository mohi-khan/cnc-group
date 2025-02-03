// 'use client'

// import { getBankBalance } from '@/api/cash-position-api'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import { BankBalance } from '@/utils/type'
// import { use, useEffect, useState } from 'react'

// interface BankTransaction {
//   bankName: string
//   amount: number
//   accountNo: string
//   previousBalance: number
//   amountDebited: number
//   amountCredited: number
//   presentBalance: number
// }

// const bankFinanceData: BankTransaction[] = [
//   {
//     bankName: 'draper bank',
//     amount: 0,
//     accountNo: '#########',
//     previousBalance: 0,
//     amountDebited: 3050514,
//     amountCredited: 8821547,
//     presentBalance: 0,
//   },
// ]

// const CashPositionTable = () => {
//   const [bankBalances, setBankBalances] = useState<BankBalance[]>([])

//   async function fetchGetBankBalance() {
//     const respons = await getBankBalance()
//     setBankBalances(respons.data || [])
//     console.log('This is all Bank Balance  data: ', respons.data || [])
//   }

//   useEffect(() => {
//     fetchGetBankBalance()
//   }, [])

//   return (
//     <div>
//       <div className="rounded-md border">
//         <Table>
//           {/* <TableCaption>Bank Transaction Report</TableCaption> */}

//           {/* First Section: Bank Transactions */}
//           <TableHeader>
//             <TableRow>
//               <TableHead colSpan={7} className="border bg-slate-50 font-bold">
//                 A. Bank Transactions
//               </TableHead>
//             </TableRow>
//             <TableRow className="bg-slate-200 shadow-md sticky top-28">
//               <TableHead className="border  font-semibold">Bank Name</TableHead>
//               <TableHead className="border  font-semibold">$ Amount</TableHead>
//               <TableHead className="border  font-semibold">A/C No.</TableHead>
//               <TableHead className="border  font-semibold">
//                 Previous Balance
//               </TableHead>
//               <TableHead className="border  font-semibold">
//                 Amount Debited
//                 <br />
//                 (Outgoing)
//               </TableHead>
//               <TableHead className="border  font-semibold">
//                 Amount Credited
//                 <br />
//                 (Incoming)
//               </TableHead>
//               <TableHead className="border  font-semibold">
//                 Present Balance
//               </TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {bankBalances.map((bankBalance, index) => (
//               <TableRow key={index}>
//                 <TableCell className="border"></TableCell>
//                 <TableCell className="border">
//                   {/* ${bankBalance.amount.toLocaleString()} */}
//                 </TableCell>
//                 <TableCell className="border">
//                   {bankBalance.BankAccount}
//                 </TableCell>
//                 <TableCell className="border">
//                   ${bankBalance.openingBalance.toLocaleString()}
//                 </TableCell>
//                 <TableCell className="border text-red-600">
//                   ${bankBalance.debitSum.toLocaleString()}
//                 </TableCell>
//                 <TableCell className="border text-green-600">
//                   ${bankBalance.creditSum.toLocaleString()}
//                 </TableCell>
//                 <TableCell className="border">
//                   ${bankBalance.closingBalance.toLocaleString()}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>

//           {/* Second Section: Bank Finance */}
//           <TableHeader>
//             <TableRow>
//               <TableHead colSpan={7} className="border bg-slate-50 font-bold">
//                 B. Bank Finance:
//               </TableHead>
//             </TableRow>
//             <TableRow className="bg-state-200 shadow-md">
//               <TableHead className="border  font-semibold">Bank Name</TableHead>
//               <TableHead className="border  font-semibold">$ Amount</TableHead>
//               <TableHead className="border  font-semibold">A/C No.</TableHead>
//               <TableHead className="border  font-semibold">
//                 Previous Balance
//               </TableHead>
//               <TableHead className="border  font-semibold">
//                 Amount Debited
//                 <br />
//                 (Outgoing)
//               </TableHead>
//               <TableHead className="border  font-semibold">
//                 Amount Credited
//                 <br />
//                 (Incoming)
//               </TableHead>
//               <TableHead className="border  font-semibold">
//                 Present Balance
//               </TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {bankBalances.map((finance, index) => (
//               <TableRow key={index} className="font-bold">
//                 <TableCell className="border"></TableCell>
//                 <TableCell className="border">
//                   {/* {finance.amount ? `$${finance.amount.toLocaleString()}` : ''} */}
//                 </TableCell>
//                 <TableCell className="border">{finance.BankAccount}</TableCell>
//                 <TableCell className="border">
//                   {finance.openingBalance
//                     ? `$${finance.openingBalance.toLocaleString()}`
//                     : ''}
//                 </TableCell>
//                 <TableCell className="border text-red-600">
//                   ${finance.debitSum.toLocaleString()}
//                 </TableCell>
//                 <TableCell className="border text-green-600">
//                   ${finance.creditSum.toLocaleString()}
//                 </TableCell>
//                 <TableCell className="border">
//                   {finance.closingBalance
//                     ? `$${finance.closingBalance.toLocaleString()}`
//                     : ''}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   )
// }

// export default CashPositionTable

'use client'

import { getBankBalance } from '@/api/cash-position-api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BankBalance } from '@/utils/type'
import { useEffect, useState } from 'react'

const CashPositionTable = () => {
  const [bankBalances, setBankBalances] = useState<BankBalance[]>([])

  async function fetchGetBankBalance() {
    const respons = await getBankBalance()
    setBankBalances(respons.data || [])
    console.log('This is all Bank Balance data: ', respons.data || [])
  }

  useEffect(() => {
    fetchGetBankBalance()
  }, [])

  // Filter the data based on AccountType
  const bankTransactions = bankBalances.filter(
    (bank) => bank.AccountType !== 'Overdraft'
  )
  const bankFinance = bankBalances.filter(
    (bank) => bank.AccountType === 'Overdraft'
  )

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          {/* First Section: Bank Transactions */}
          <TableHeader>
            <TableRow>
              <TableHead colSpan={7} className="border bg-slate-50 font-bold">
                A. Bank Transactions
              </TableHead>
            </TableRow>
            <TableRow className="bg-slate-200 shadow-md sticky top-28">
              <TableHead className="border font-semibold">Bank Name</TableHead>
              <TableHead className="border font-semibold">$ Amount</TableHead>
              <TableHead className="border font-semibold">A/C No.</TableHead>
              <TableHead className="border font-semibold">
                Previous Balance
              </TableHead>
              <TableHead className="border font-semibold">
                Amount Debited
                <br />
                (Outgoing)
              </TableHead>
              <TableHead className="border font-semibold">
                Amount Credited
                <br />
                (Incoming)
              </TableHead>
              <TableHead className="border font-semibold">
                Present Balance
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bankTransactions.map((bank, index) => (
              <TableRow key={index}>
                <TableCell className="border"></TableCell>
                <TableCell className="border">
                  {/* Uncomment and update below if you have an amount property */}
                  {/* ${bank.amount?.toLocaleString()} */}
                </TableCell>
                <TableCell className="border">{bank.BankAccount}</TableCell>
                <TableCell className="border">
                  ${bank.openingBalance.toLocaleString()}
                </TableCell>
                <TableCell className="border text-red-600">
                  ${bank.debitSum.toLocaleString()}
                </TableCell>
                <TableCell className="border text-green-600">
                  ${bank.creditSum.toLocaleString()}
                </TableCell>
                <TableCell className="border">
                  ${bank.closingBalance.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          {/* Second Section: Bank Finance */}
          <TableHeader>
            <TableRow>
              <TableHead colSpan={7} className="border bg-slate-50 font-bold">
                B. Bank Finance
              </TableHead>
            </TableRow>
            <TableRow className="bg-slate-200 shadow-md">
              <TableHead className="border font-semibold">Bank Name</TableHead>
              <TableHead className="border font-semibold">$ Amount</TableHead>
              <TableHead className="border font-semibold">A/C No.</TableHead>
              <TableHead className="border font-semibold">
                Previous Balance
              </TableHead>
              <TableHead className="border font-semibold">
                Amount Debited
                <br />
                (Outgoing)
              </TableHead>
              <TableHead className="border font-semibold">
                Amount Credited
                <br />
                (Incoming)
              </TableHead>
              <TableHead className="border font-semibold">
                Present Balance
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bankFinance.map((finance, index) => (
              <TableRow key={index} className="font-bold">
                <TableCell className="border"></TableCell>
                <TableCell className="border">
                  {/* Uncomment and update below if you have an amount property */}
                  {/* {finance.amount ? `$${finance.amount.toLocaleString()}` : ''} */}
                </TableCell>
                <TableCell className="border">{finance.BankAccount}</TableCell>
                <TableCell className="border">
                  {finance.openingBalance.toLocaleString()}
                </TableCell>
                <TableCell className="border text-red-600">
                  ${finance.debitSum.toLocaleString()}
                </TableCell>
                <TableCell className="border text-green-600">
                  ${finance.creditSum.toLocaleString()}
                </TableCell>
                <TableCell className="border">
                  ${finance.closingBalance.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default CashPositionTable
