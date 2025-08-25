import type { GeneralLedgerType } from '@/utils/type'
import Link from 'next/link'

interface GeneralLedgerListProps {
  transactions: GeneralLedgerType[]
}

export default function GeneralLedgerList({
  transactions,
}: GeneralLedgerListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">No available data</div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="pdf-table-header">
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">Voucher ID</th>
            <th className="py-2 px-4 border-b">Voucher No</th>
            <th className="py-2 px-4 border-b">Account Name</th>
            <th className="py-2 px-4 border-b">Debit</th>
            <th className="py-2 px-4 border-b">Credit</th>
            <th className="py-2 px-4 border-b">Notes</th>
            <th className="py-2 px-4 border-b">Partner</th>
            <th className="py-2 px-4 border-b">Cost Center</th>
            <th className="py-2 px-4 border-b">Department</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="py-2 px-4 border-b">{transaction.voucherid}</td>
              <td className="py-2 px-4 border-b">
                <span className="pdf-hide">
                  <Link
                    href={`/reports/general-ledger/single-general-ledger/${transaction.voucherid}`}
                  >
                    {transaction.voucherno}
                  </Link>
                </span>
                <span className="pdf-show hidden">{transaction.voucherno}</span>
              </td>
              <td className="py-2 px-4 border-b">{transaction.accountname}</td>
              <td className="py-2 px-4 border-b">{transaction.debit}</td>
              <td className="py-2 px-4 border-b">{transaction.credit}</td>
              <td className="py-2 px-4 border-b">{transaction.notes}</td>
              <td className="py-2 px-4 border-b">{transaction.partner}</td>
              <td className="py-2 px-4 border-b">{transaction.coscenter}</td>
              <td className="py-2 px-4 border-b">{transaction.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
