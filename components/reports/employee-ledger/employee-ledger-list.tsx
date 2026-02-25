import type React from 'react'
import type { EmployeeLedgerType } from '@/utils/type'

interface GeneralLedgerListProps {
  transactions: EmployeeLedgerType[]
  targetRef: React.RefObject<HTMLDivElement>
}

export default function EmployeeLedgerList({
  transactions,
  targetRef,
}: GeneralLedgerListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">No available data</div>
    )
  }

  return (
    <div className="overflow-x-auto" ref={targetRef}>
      <table className="min-w-full bg-white border border-gray-300 text-sm">
        <thead className="pdf-table-header">
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Date</th>
            <th className="py-2 px-4 border-b text-left">Voucher No</th>
            <th className="py-2 px-4 border-b text-left">Account Name</th>
            <th className="py-2 px-4 border-b text-left">Debit</th>
            <th className="py-2 px-4 border-b text-left">Credit</th>
            <th className="py-2 px-4 border-b text-left">Notes</th>
            <th className="py-2 px-4 border-b text-left">Cost Center</th>
            <th className="py-2 px-4 border-b text-left">Department</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="py-2 px-4 border-b text-left">{transaction.date}</td>
              <td className="py-2 px-4 border-b text-left">{transaction.voucherno}</td>
              <td className="py-2 px-4 border-b text-left">{`${transaction.accountname} ${-transaction.bankaccountnumber || ' '}`}</td>
              <td className="py-2 px-4 border-b text-left">{transaction.debit}</td>
              <td className="py-2 px-4 border-b text-left">{transaction.credit}</td>
              <td className="py-2 px-4 border-b text-left">{transaction.notes}</td>
              <td className="py-2 px-4 border-b text-left">{transaction.coscenter}</td>
              <td className="py-2 px-4 border-b text-left">{transaction.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
