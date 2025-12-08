'use client'

import { GetBankLedger } from '@/utils/type'
import { useEffect, useState } from 'react'

interface BankLedgerListProps {
  transactions?: GetBankLedger[]
  isLoading?: boolean
}

export default function BankLedgerList({
  transactions,
  isLoading = false,
}: BankLedgerListProps) {
  const [displayData, setDisplayData] = useState<GetBankLedger[]>([])

  // 🔄 Always sync local data with props
  useEffect(() => {
    if (Array.isArray(transactions) && transactions.length > 0) {
      setDisplayData(transactions)
    } else {
      // if empty or undefined → clear old data
      setDisplayData([])
    }
  }, [transactions])

  // ⏳ Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10 text-gray-500">
        <svg
          className="animate-spin h-5 w-5 mr-3 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 00-8 8h4z"
          />
        </svg>
        Loading data...
      </div>
    )
  }

  // 🚫 No data case
  if (displayData.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">No available data</div>
    )
  }

  // ✅ Table render
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Date</th>
            <th className="py-2 px-4 border-b text-left">Voucher No</th>
            <th className="py-2 px-4 border-b text-left">Account Name</th>
            <th className="py-2 px-4 border-b text-right">Debit</th>
            <th className="py-2 px-4 border-b text-right">Credit</th>
            <th className="py-2 px-4 border-b text-left">Partner</th>
            <th className="py-2 px-4 border-b text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((transaction, index) => (
            <tr
              key={`${transaction.voucherid}-${index}`}
              className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
            >
              <td className="py-2 px-4 border-b">{transaction.date}</td>
              <td className="py-2 px-4 border-b">{transaction.voucherno}</td>
              <td className="py-2 px-4 border-b">{`${transaction.accountname} ${-transaction.bankaccountnumber || ' '}`}</td>
              <td className="py-2 px-4 border-b text-right">
                {transaction.debit.toLocaleString()}
              </td>
              <td className="py-2 px-4 border-b text-right">
                {transaction.credit.toLocaleString()}
              </td>
              <td className="py-2 px-4 border-b">
                {transaction.partner ?? '—'}
              </td>
              <td className="py-2 px-4 border-b">{transaction.notes ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
