import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  
  interface Transaction {
    voucherNo: string
    voucherDate: string
    accountsNotes: string
    partner: string
    debit: number
    credit: number
    balance: number
  }
  
  interface BankLedgerListProps {
    transactions: Transaction[]
  }
  
  export default function BankLedgerList({ transactions }: BankLedgerListProps) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voucher No</TableHead>
              <TableHead>Voucher Date</TableHead>
              <TableHead>Accounts Notes</TableHead>
              <TableHead>Partner</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.voucherNo}>
                <TableCell>{transaction.voucherNo}</TableCell>
                <TableCell>{transaction.voucherDate}</TableCell>
                <TableCell>{transaction.accountsNotes}</TableCell>
                <TableCell>{transaction.partner}</TableCell>
                <TableCell className="text-right">{transaction.debit}</TableCell>
                <TableCell className="text-right">{transaction.credit}</TableCell>
                <TableCell className="text-right">{transaction.balance}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }
  
  