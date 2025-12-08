import type React from 'react'
import type { PartnerLedgerType } from '@/utils/type'

interface GeneralLedgerListProps {
  transactions: PartnerLedgerType[]
  targetRef: React.RefObject<HTMLDivElement>
}

export default function PartnerLedgerList({
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
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Voucher No</th>
            <th className="py-2 px-4 border-b">Account Name</th>
            <th className="py-2 px-4 border-b">Debit</th>
            <th className="py-2 px-4 border-b">Credit</th>
            <th className="py-2 px-4 border-b">Partner</th>
            <th className="py-2 px-4 border-b">Notes</th>
            <th className="py-2 px-4 border-b">Cost Center</th>
            <th className="py-2 px-4 border-b">Department</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="py-2 px-4 border-b">{transaction.date}</td>
              <td className="py-2 px-4 border-b">{transaction.voucherno}</td>
              <td className="py-2 px-4 border-b">{`${transaction.accountname} ${-transaction.bankaccountnumber || ' '}`}</td>
              <td className="py-2 px-4 border-b">{transaction.debit}</td>
              <td className="py-2 px-4 border-b">{transaction.credit}</td>
              <td className="py-2 px-4 border-b">{transaction.partner}</td>
              <td className="py-2 px-4 border-b">{transaction.notes}</td>
              <td className="py-2 px-4 border-b">{transaction.coscenter}</td>
              <td className="py-2 px-4 border-b">{transaction.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
