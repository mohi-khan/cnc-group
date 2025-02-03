'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface BankTransaction {
  bankName: string
  amount: number
  accountNo: string
  previousBalance: number
  amountDebited: number
  amountCredited: number
  presentBalance: number
}

const transactions: BankTransaction[] = [
  {
    bankName: 'First National Bank',
    amount: 5000,
    accountNo: '1234567890',
    previousBalance: 10000,
    amountDebited: 2000,
    amountCredited: 7000,
    presentBalance: 15000,
  },
  {
    bankName: 'City Bank',
    amount: 3000,
    accountNo: '0987654321',
    previousBalance: 8000,
    amountDebited: 1000,
    amountCredited: 4000,
    presentBalance: 11000,
  },
]

const bankFinanceData: BankTransaction[] = [
  {
    bankName: 'Total',
    amount: 0,
    accountNo: '#########',
    previousBalance: 0,
    amountDebited: 3050514,
    amountCredited: 8821547,
    presentBalance: 0,
  },
]

const CashPositionTable = () => {
  return (
    <div>
      <div className="rounded-md border">
        <Table>
          {/* <TableCaption>Bank Transaction Report</TableCaption> */}

          {/* First Section: Bank Transactions */}
          <TableHeader>
            <TableRow>
              <TableHead colSpan={7} className="border bg-slate-50 font-bold">
                A. Bank Transactions
              </TableHead>
            </TableRow>
            <TableRow className="bg-emerald-50">
              <TableHead className="border border-emerald-600 font-semibold">
                Bank Name
              </TableHead>
              <TableHead className="border border-emerald-600 font-semibold">
                $ Amount
              </TableHead>
              <TableHead className="border border-emerald-600 font-semibold">
                A/C No.
              </TableHead>
              <TableHead className="border border-emerald-600 font-semibold">
                Previous Balance
              </TableHead>
              <TableHead className="border border-emerald-600 font-semibold">
                Amount Debited
                <br />
                (Outgoing)
              </TableHead>
              <TableHead className="border border-emerald-600 font-semibold">
                Amount Credited
                <br />
                (Incoming)
              </TableHead>
              <TableHead className="border border-emerald-600 font-semibold">
                Present Balance
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell className="border">{transaction.bankName}</TableCell>
                <TableCell className="border">
                  ${transaction.amount.toLocaleString()}
                </TableCell>
                <TableCell className="border">
                  {transaction.accountNo}
                </TableCell>
                <TableCell className="border">
                  ${transaction.previousBalance.toLocaleString()}
                </TableCell>
                <TableCell className="border text-red-600">
                  ${transaction.amountDebited.toLocaleString()}
                </TableCell>
                <TableCell className="border text-green-600">
                  ${transaction.amountCredited.toLocaleString()}
                </TableCell>
                <TableCell className="border">
                  ${transaction.presentBalance.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          {/* Second Section: Bank Finance */}
          <TableHeader>
            <TableRow>
              <TableHead colSpan={7} className="border bg-slate-50 font-bold">
                B. Bank Finance:
              </TableHead>
            </TableRow>
            <TableRow className="bg-emerald-50">
              <TableHead className="border border-emerald-600 font-semibold">
                Bank Name
              </TableHead>
              <TableHead className="border border-emerald-600 font-semibold">
                $ Amount
              </TableHead>
              <TableHead className="border border-emerald-600 font-semibold">
                A/C No.
              </TableHead>
              <TableHead className="border border-emerald-600 font-semibold">
                Previous Balance
              </TableHead>
              <TableHead className="border border-emerald-600 font-semibold">
                Amount Debited
                <br />
                (Outgoing)
              </TableHead>
              <TableHead className="border border-emerald-600 font-semibold">
                Amount Credited
                <br />
                (Incoming)
              </TableHead>
              <TableHead className="border border-emerald-600 font-semibold">
                Present Balance
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bankFinanceData.map((finance, index) => (
              <TableRow key={index} className="font-bold">
                <TableCell className="border">{finance.bankName}</TableCell>
                <TableCell className="border">
                  {finance.amount ? `$${finance.amount.toLocaleString()}` : ''}
                </TableCell>
                <TableCell className="border">{finance.accountNo}</TableCell>
                <TableCell className="border">
                  {finance.previousBalance
                    ? `$${finance.previousBalance.toLocaleString()}`
                    : ''}
                </TableCell>
                <TableCell className="border text-red-600">
                  ${finance.amountDebited.toLocaleString()}
                </TableCell>
                <TableCell className="border text-green-600">
                  ${finance.amountCredited.toLocaleString()}
                </TableCell>
                <TableCell className="border">
                  {finance.presentBalance
                    ? `$${finance.presentBalance.toLocaleString()}`
                    : ''}
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
