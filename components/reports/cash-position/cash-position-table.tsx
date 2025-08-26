'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@/components/ui/table'
import { BankBalance, CashBalance, LoanReport } from '@/utils/type'

interface Props {
  bankBalances: BankBalance[]
  targetRef: React.RefObject<HTMLDivElement>
  cashBalances: CashBalance[]
  loanReport: LoanReport[]
}

const CashPositionTable: React.FC<Props> = ({
  bankBalances,
  targetRef,
  cashBalances,
  loanReport,
}) => {
  // Filter the bankBalances based on AccountType
  const bankTransactions = bankBalances.filter(
    (bank) => bank.AccountType !== 'Overdraft'
  )

  // Calculate totals for bank transactions
  const totalBankTransactions = bankTransactions.reduce(
    (totals, bank) => {
      totals.totalAmount += bank.openingBalance + bank.closingBalance
      totals.totalDebit += bank.debitSum
      totals.totalCredit += bank.creditSum
      totals.totalPreviousBalance += bank.openingBalance
      totals.totalClosingBalance += bank.closingBalance
      return totals
    },
    {
      totalAmount: 0,
      totalDebit: 0,
      totalCredit: 0,
      totalPreviousBalance: 0,
      totalClosingBalance: 0,
    }
  )

  // Calculate totals for cash balances
  const totalCashkBalances = cashBalances.reduce(
    (totals, cashkBalance) => {
      totals.totalAmount +=
        cashkBalance.openingBalance + cashkBalance.closingBalance
      totals.totalDebit += cashkBalance.debitSum
      totals.totalCredit += cashkBalance.creditSum
      totals.totalPreviousBalance += cashkBalance.openingBalance
      totals.totalClosingBalance += cashkBalance.closingBalance
      return totals
    },
    {
      totalAmount: 0,
      totalDebit: 0,
      totalCredit: 0,
      totalPreviousBalance: 0,
      totalClosingBalance: 0,
    }
  )

  // Combine totals for bank transactions and cash balances
  const combinedTotals = {
    totalAmount:
      totalBankTransactions.totalAmount + totalCashkBalances.totalAmount,
    totalDebit:
      totalBankTransactions.totalDebit + totalCashkBalances.totalDebit,
    totalCredit:
      totalBankTransactions.totalCredit + totalCashkBalances.totalCredit,
    totalPreviousBalance:
      totalBankTransactions.totalPreviousBalance +
      totalCashkBalances.totalPreviousBalance,
    totalClosingBalance:
      totalBankTransactions.totalClosingBalance +
      totalCashkBalances.totalClosingBalance,
  }

  // Calculate totals for loanReport (Bank Finance section)
  const totalLoanReport = loanReport.reduce(
    (totals, loan) => {
      totals.totalAmount += loan.openingBalance + loan.closingBalance
      totals.totalDebit += loan.debitSum
      totals.totalCredit += loan.creditSum
      totals.totalPreviousBalance += loan.openingBalance
      totals.totalClosingBalance += loan.closingBalance
      return totals
    },
    {
      totalAmount: 0,
      totalDebit: 0,
      totalCredit: 0,
      totalPreviousBalance: 0,
      totalClosingBalance: 0,
    }
  )

  return (
    <div>
      <div ref={targetRef} className="rounded-md border">
        {/* First Section: Bank Transactions and Cash Balances */}
        <Table>
          <thead>
            <TableRow className="border bg-slate-50 font-bold">
              <TableHead colSpan={7}>A. Bank Transactions</TableHead>
            </TableRow>
            <TableRow className="bg-slate-200 shadow-md sticky top-28">
              <TableHead className="border font-semibold">Bank Name</TableHead>
              <TableHead className="border font-semibold">$ Amount</TableHead>
              <TableHead className="border font-semibold">A/C No.</TableHead>
              <TableHead className="border font-semibold">
                Previous Balance
              </TableHead>
              <TableHead className="border font-semibold">
                Amount Debited (Outgoing)
              </TableHead>
              <TableHead className="border font-semibold">
                Amount Credited (Incoming)
              </TableHead>
              <TableHead className="border font-semibold">
                Present Balance
              </TableHead>
            </TableRow>
          </thead>
          <TableBody>
            {bankTransactions.map((bank, index) => (
              <TableRow key={index}>
                <TableCell className="border">
                  {bank.BankName} - {bank.BranchName}
                </TableCell>
                <TableCell className="border">
                  {bank.openingBalance + bank.closingBalance}
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
            {cashBalances.map((cashkBalance, index) => (
              <TableRow key={index}>
                <TableCell className="border">
                  {cashkBalance.companyName} - {cashkBalance.locationName}
                </TableCell>
                <TableCell className="border">
                  {cashkBalance.openingBalance + cashkBalance.closingBalance}
                </TableCell>
                <TableCell className="border"></TableCell>
                <TableCell className="border">
                  ${cashkBalance.openingBalance.toLocaleString()}
                </TableCell>
                <TableCell className="border text-red-600">
                  ${cashkBalance.debitSum.toLocaleString()}
                </TableCell>
                <TableCell className="border text-green-600">
                  ${cashkBalance.creditSum.toLocaleString()}
                </TableCell>
                <TableCell className="border">
                  ${cashkBalance.closingBalance.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {/* Combined Total Row for Bank Transactions and Cash Balances */}
            <TableRow className="font-semibold bg-slate-100">
              <TableCell className="border text-right" colSpan={1}>
                Total:
              </TableCell>
              <TableCell className="border">
                ${combinedTotals.totalAmount.toLocaleString()}
              </TableCell>
              <TableCell className="border"></TableCell>
              <TableCell className="border">
                ${combinedTotals.totalPreviousBalance.toLocaleString()}
              </TableCell>
              <TableCell className="border text-red-600">
                ${combinedTotals.totalDebit.toLocaleString()}
              </TableCell>
              <TableCell className="border text-green-600">
                ${combinedTotals.totalCredit.toLocaleString()}
              </TableCell>
              <TableCell className="border">
                ${combinedTotals.totalClosingBalance.toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Second Section: Loan Report (Bank Finance) */}
        <Table>
          <thead>
            <TableRow className="border bg-slate-50 font-bold">
              <TableHead colSpan={7}>B. Bank Finance:</TableHead>
            </TableRow>
            <TableRow className="bg-slate-200 shadow-md">
              <TableHead className="border font-semibold">Bank Name</TableHead>
              <TableHead className="border font-semibold">$ Amount</TableHead>
              <TableHead className="border font-semibold">A/C No.</TableHead>
              <TableHead className="border font-semibold">
                Previous Balance
              </TableHead>
              <TableHead className="border font-semibold">
                Amount Debited (Outgoing)
              </TableHead>
              <TableHead className="border font-semibold">
                Amount Credited (Incoming)
              </TableHead>
              <TableHead className="border font-semibold">
                Present Balance
              </TableHead>
            </TableRow>
          </thead>
          <TableBody>
            {loanReport.map((loan, index) => (
              <TableRow key={index}>
                <TableCell className="border">
                  {loan.BankName} - {loan.BranchName}
                </TableCell>
                <TableCell className="border">
                  {loan.openingBalance + loan.closingBalance}
                </TableCell>
                <TableCell className="border">{loan.BankAccount}</TableCell>
                <TableCell className="border">
                  ${loan.openingBalance.toLocaleString()}
                </TableCell>
                <TableCell className="border text-red-600">
                  ${loan.debitSum.toLocaleString()}
                </TableCell>
                <TableCell className="border text-green-600">
                  ${loan.creditSum.toLocaleString()}
                </TableCell>
                <TableCell className="border">
                  ${loan.closingBalance.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-slate-100">
              <TableCell className="border text-right" colSpan={1}>
                Total:
              </TableCell>
              <TableCell className="border">
                ${totalLoanReport.totalAmount.toLocaleString()}
              </TableCell>
              <TableCell className="border"></TableCell>
              <TableCell className="border">
                ${totalLoanReport.totalPreviousBalance.toLocaleString()}
              </TableCell>
              <TableCell className="border text-red-600">
                ${totalLoanReport.totalDebit.toLocaleString()}
              </TableCell>
              <TableCell className="border text-green-600">
                ${totalLoanReport.totalCredit.toLocaleString()}
              </TableCell>
              <TableCell className="border">
                ${totalLoanReport.totalClosingBalance.toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default CashPositionTable

// 'use client'

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
// } from '@/components/ui/table'
// import { BankBalance, CashBalance, LoanReport } from '@/utils/type'

// interface Props {
//   bankBalances: BankBalance[]
//   targetRef: React.RefObject<HTMLDivElement>
//   cashBalances: CashBalance[]
//   loanReport: LoanReport[]
// }

// const CashPositionTable: React.FC<Props> = ({
//   bankBalances,
//   targetRef,
//   cashBalances,
//   loanReport

// }) => {
//   // Filter the bankBalances based on AccountType
//   const bankTransactions = bankBalances.filter(
//     (bank) => bank.AccountType !== 'Overdraft'
//   )
//   const bankFinance = bankBalances.filter(
//     (bank) => bank.AccountType === 'Overdraft'
//   )

//   // Calculate totals for bank transactions
//   const totalBankTransactions = bankTransactions.reduce(
//     (totals, bank) => {
//       totals.totalAmount += bank.openingBalance + bank.closingBalance
//       totals.totalDebit += bank.debitSum
//       totals.totalCredit += bank.creditSum
//       totals.totalPreviousBalance += bank.openingBalance
//       totals.totalClosingBalance += bank.closingBalance
//       return totals
//     },
//     {
//       totalAmount: 0,
//       totalDebit: 0,
//       totalCredit: 0,
//       totalPreviousBalance: 0,
//       totalClosingBalance: 0,
//     }
//   )

//   // Calculate totals for cashk balances
//   const totalCashkBalances = cashBalances.reduce(
//     (totals, cashkBalance) => {
//       totals.totalAmount +=
//         cashkBalance.openingBalance + cashkBalance.closingBalance
//       totals.totalDebit += cashkBalance.debitSum
//       totals.totalCredit += cashkBalance.creditSum
//       totals.totalPreviousBalance += cashkBalance.openingBalance
//       totals.totalClosingBalance += cashkBalance.closingBalance
//       return totals
//     },
//     {
//       totalAmount: 0,
//       totalDebit: 0,
//       totalCredit: 0,
//       totalPreviousBalance: 0,
//       totalClosingBalance: 0,
//     }
//   )

//   // Calculate totals for bank finance
//   const totalBankFinance = bankFinance.reduce(
//     (totals, finance) => {
//       totals.totalAmount += finance.openingBalance + finance.closingBalance
//       totals.totalDebit += finance.debitSum
//       totals.totalCredit += finance.creditSum
//       totals.totalPreviousBalance += finance.openingBalance
//       totals.totalClosingBalance += finance.closingBalance
//       return totals
//     },
//     {
//       totalAmount: 0,
//       totalDebit: 0,
//       totalCredit: 0,
//       totalPreviousBalance: 0,
//       totalClosingBalance: 0,
//     }
//   )

//   // Combine totals for bank transactions and cashk balances
//   const combinedTotals = {
//     totalAmount:
//       totalBankTransactions.totalAmount + totalCashkBalances.totalAmount,
//     totalDebit:
//       totalBankTransactions.totalDebit + totalCashkBalances.totalDebit,
//     totalCredit:
//       totalBankTransactions.totalCredit + totalCashkBalances.totalCredit,
//     totalPreviousBalance:
//       totalBankTransactions.totalPreviousBalance +
//       totalCashkBalances.totalPreviousBalance,
//     totalClosingBalance:
//       totalBankTransactions.totalClosingBalance +
//       totalCashkBalances.totalClosingBalance,
//   }

//   return (
//     <div>
//       <div ref={targetRef} className="rounded-md border">
//         {/* First Section: Bank Transactions and Cash Balances */}
//         <Table>
//           <thead>
//             <TableRow className="border bg-slate-50 font-bold">
//               <TableHead colSpan={7}>A. Bank Transactions</TableHead>
//             </TableRow>
//             <TableRow className="bg-slate-200 shadow-md sticky top-28">
//               <TableHead className="border font-semibold">Bank Name</TableHead>
//               <TableHead className="border font-semibold">$ Amount</TableHead>
//               <TableHead className="border font-semibold">A/C No.</TableHead>
//               <TableHead className="border font-semibold">
//                 Previous Balance
//               </TableHead>
//               <TableHead className="border font-semibold">
//                 Amount Debited (Outgoing)
//               </TableHead>
//               <TableHead className="border font-semibold">
//                 Amount Credited (Incoming)
//               </TableHead>
//               <TableHead className="border font-semibold">
//                 Present Balance
//               </TableHead>
//             </TableRow>
//           </thead>
//           <TableBody>
//             {bankTransactions.map((bank, index) => (
//               <TableRow key={index}>
//                 <TableCell className="border">
//                {bank.BankName} - {bank.BranchName}
//                 </TableCell>
//                 <TableCell className="border">
//                   {bank.openingBalance + bank.closingBalance}
//                 </TableCell>
//                 <TableCell className="border">{bank.BankAccount}</TableCell>
//                 <TableCell className="border">
//                   ${bank.openingBalance.toLocaleString()}
//                 </TableCell>
//                 <TableCell className="border text-red-600">
//                   ${bank.debitSum.toLocaleString()}
//                 </TableCell>
//                 <TableCell className="border text-green-600">
//                   ${bank.creditSum.toLocaleString()}
//                 </TableCell>
//                 <TableCell className="border">
//                   ${bank.closingBalance.toLocaleString()}
//                 </TableCell>
//               </TableRow>
//             ))}
//             {cashBalances.map((cashkBalance, index) => (
//               <TableRow key={index}>
//                 <TableCell className="border">
//                   {cashkBalance.companyName} - {cashkBalance.locationName}
//                 </TableCell>
//                 <TableCell className="border">
//                   {cashkBalance.openingBalance + cashkBalance.closingBalance}
//                 </TableCell>
//                 <TableCell className="border"></TableCell>
//                 <TableCell className="border">
//                   ${cashkBalance.openingBalance.toLocaleString()}
//                 </TableCell>
//                 <TableCell className="border text-red-600">
//                   ${cashkBalance.debitSum.toLocaleString()}
//                 </TableCell>
//                 <TableCell className="border text-green-600">
//                   ${cashkBalance.creditSum.toLocaleString()}
//                 </TableCell>
//                 <TableCell className="border">
//                   ${cashkBalance.closingBalance.toLocaleString()}
//                 </TableCell>
//               </TableRow>
//             ))}
//             {/* Combined Total Row for Bank Transactions and Cash Balances */}
//             <TableRow className="font-semibold bg-slate-100">
//               <TableCell className="border text-right" colSpan={1}>
//                 Total:
//               </TableCell>
//               <TableCell className="border">
//                 ${combinedTotals.totalAmount.toLocaleString()}
//               </TableCell>
//               <TableCell className="border"></TableCell>
//               <TableCell className="border">
//                 ${combinedTotals.totalPreviousBalance.toLocaleString()}
//               </TableCell>
//               <TableCell className="border text-red-600">
//                 ${combinedTotals.totalDebit.toLocaleString()}
//               </TableCell>
//               <TableCell className="border text-green-600">
//                 ${combinedTotals.totalCredit.toLocaleString()}
//               </TableCell>
//               <TableCell className="border">
//                 ${combinedTotals.totalClosingBalance.toLocaleString()}
//               </TableCell>
//             </TableRow>
//           </TableBody>
//         </Table>

//         {/* Second Section: Bank Finance */}
//      <Table>
//           <thead>
//             <TableRow className="border bg-slate-50 font-bold">
//               <TableHead colSpan={7}>B. Bank Finance:</TableHead>
//             </TableRow>
//             <TableRow className="bg-slate-200 shadow-md">
//               <TableHead className="border font-semibold">Bank Name</TableHead>
//               <TableHead className="border font-semibold">$ Amount</TableHead>
//               <TableHead className="border font-semibold">A/C No.</TableHead>
//               <TableHead className="border font-semibold">
//                 Previous Balance
//               </TableHead>
//               <TableHead className="border font-semibold">
//                 Amount Debited (Outgoing)
//               </TableHead>
//               <TableHead className="border font-semibold">
//                 Amount Credited (Incoming)
//               </TableHead>
//               <TableHead className="border font-semibold">
//                 Present Balance
//               </TableHead>
//             </TableRow>
//           </thead>
//           <TableBody>
//             {bankFinance.map((finance, index) => (
//               <TableRow key={index}>
//                 <TableCell className="border"></TableCell>
//                 <TableCell className="border">
//                   {finance.openingBalance + finance.closingBalance}
//                 </TableCell>
//                 <TableCell className="border">{finance.BankAccount}</TableCell>
//                 <TableCell className="border">
//                   ${finance.openingBalance.toLocaleString()}
//                 </TableCell>
//                 <TableCell className="border text-red-600">
//                   ${finance.debitSum.toLocaleString()}
//                 </TableCell>
//                 <TableCell className="border text-green-600">
//                   ${finance.creditSum.toLocaleString()}
//                 </TableCell>
//                 <TableCell className="border">
//                   ${finance.closingBalance.toLocaleString()}
//                 </TableCell>
//               </TableRow>
//             ))}

//             <TableRow className="font-semibold bg-slate-100">
//               <TableCell className="border text-right" colSpan={1}>
//                 Total:
//               </TableCell>
//               <TableCell className="border">
//                 ${totalBankFinance.totalAmount.toLocaleString()}
//               </TableCell>
//               <TableCell className="border"></TableCell>
//               <TableCell className="border">
//                 ${totalBankFinance.totalPreviousBalance.toLocaleString()}
//               </TableCell>
//               <TableCell className="border text-red-600">
//                 ${totalBankFinance.totalDebit.toLocaleString()}
//               </TableCell>
//               <TableCell className="border text-green-600">
//                 ${totalBankFinance.totalCredit.toLocaleString()}
//               </TableCell>
//               <TableCell className="border">
//                 ${totalBankFinance.totalClosingBalance.toLocaleString()}
//               </TableCell>
//             </TableRow>
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   )
// }

// export default CashPositionTable
