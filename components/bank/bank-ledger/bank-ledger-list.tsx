import React from 'react'
import { BankAccountDateRange } from '@/utils/type'

interface BankLedgerListProps {
  transactions: BankAccountDateRange[]
}

export default function BankLedgerList({ transactions }: BankLedgerListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No available data
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">Bank Account</th>
            <th className="py-2 px-4 border-b">From Date</th>
            <th className="py-2 px-4 border-b">To Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="py-2 px-4 border-b">{transaction.bankaccount}</td>
              <td className="py-2 px-4 border-b">{transaction.fromdate}</td>
              <td className="py-2 px-4 border-b">{transaction.todate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

