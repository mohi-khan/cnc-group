'use client'

import { formatIndianNumber } from '@/utils/Formatindiannumber'
import { GetBankLedger } from '@/utils/type'
import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'

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
      setDisplayData([])
    }
  }, [transactions])

  // 🔍 Extract opening balance row from API data
  const openingRow = useMemo(
    () =>
      displayData.find((t) => t.accountname?.toLowerCase().includes('opening')),
    [displayData]
  )

  // 🔍 Extract closing balance row from API data
  const closingRow = useMemo(
    () =>
      displayData.find((t) => t.accountname?.toLowerCase().includes('closing')),
    [displayData]
  )

  // 📋 Transaction rows = exclude opening & closing balance rows
  const transactionRows = useMemo(
    () => displayData.filter((t) => t !== openingRow && t !== closingRow),
    [displayData, openingRow, closingRow]
  )

  // 📊 Current totals from transaction rows only
  const currentTotalDebit = useMemo(
    () => transactionRows.reduce((sum, t) => sum + (t.debit ?? 0), 0),
    [transactionRows]
  )
  const currentTotalCredit = useMemo(
    () => transactionRows.reduce((sum, t) => sum + (t.credit ?? 0), 0),
    [transactionRows]
  )

  // Opening & closing values from extracted rows
  const openingDebit = openingRow?.debit ?? 0
  const openingCredit = openingRow?.credit ?? 0
  const closingDebit = closingRow?.debit ?? 0
  const closingCredit = closingRow?.credit ?? 0

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

  // Shared column widths — identical across all tables to keep alignment
  const COL_WIDTHS = [110, 200, 140, 120, 120, 120, 220]

  const ColGroup = () => (
    <colgroup>
      {COL_WIDTHS.map((w, i) => (
        <col key={i} style={{ width: w, minWidth: w }} />
      ))}
    </colgroup>
  )

  return (
    <div className="flex flex-col border border-gray-300 rounded-md text-sm bg-white overflow-hidden shadow-sm">
      {/* ── FIXED: Column Headers ── */}
      <div className="flex-shrink-0 overflow-hidden">
        <table className="w-full table-fixed border-collapse">
          <ColGroup />
          <thead>
            <tr className="bg-gray-200 text-gray-700 font-semibold">
              <th className="py-2 px-4 border-b border-gray-300 text-left">
                Date
              </th>
              <th className="py-2 px-4 border-b border-gray-300 text-left">
                Account Name
              </th>
              <th className="py-2 px-4 border-b border-gray-300 text-left">
                Voucher No
              </th>
              <th className="py-2 px-4 border-b border-gray-300 text-right">
                Debit
              </th>
              <th className="py-2 px-4 border-b border-gray-300 text-right">
                Credit
              </th>
              <th className="py-2 px-4 border-b border-gray-300 text-left">
                Partner
              </th>
              <th className="py-2 px-4 border-b border-gray-300 text-left">
                Notes
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* ── FIXED: Opening Balance (from API data) ── */}
      <div className="flex-shrink-0 overflow-hidden border-b border-gray-300">
        <table className="w-full table-fixed border-collapse">
          <ColGroup />
          <tbody>
            <tr className="bg-blue-50 font-semibold text-gray-700">
              <td className="py-2 px-4" />
              <td className="py-2 px-4">Opening Balance</td>
              <td className="py-2 px-4" />
              <td className="py-2 px-4 text-right">
                {formatIndianNumber(openingDebit)}
              </td>
              <td className="py-2 px-4 text-right">
                {formatIndianNumber(openingCredit)}
              </td>
              <td className="py-2 px-4" />
              <td className="py-2 px-4" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── SCROLLABLE: Transaction Rows only ── */}
      <div className="overflow-y-auto overflow-x-hidden max-h-[400px]">
        <table className="w-full table-fixed border-collapse">
          <ColGroup />
          <tbody>
            {transactionRows.map((transaction, index) => (
              <tr
                key={`${transaction.voucherid}-${index}`}
                className={
                  index % 2 === 0
                    ? 'bg-gray-50 hover:bg-blue-50 transition-colors'
                    : 'bg-white hover:bg-blue-50 transition-colors'
                }
              >
                <td className="py-2 px-4 border-b border-gray-100 text-gray-600">
                  {transaction.date}
                </td>
                <td className="py-2 px-4 border-b border-gray-100 truncate">
                  {`${transaction.accountname ?? ''}${
                    transaction.bankaccountnumber
                      ? ` (${transaction.bankaccountnumber})`
                      : ''
                  }`}
                </td>
                <td className="py-2 px-4 border-b border-gray-100 text-center">
                  <Link
                    target="_blank"
                    href={`/reports/general-ledger/single-general-ledger/${transaction.voucherid}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {transaction.voucherno}
                  </Link>
                </td>
                <td className="py-2 px-4 border-b border-gray-100 text-right">
                  {formatIndianNumber(transaction.debit)}
                </td>
                <td className="py-2 px-4 border-b border-gray-100 text-right">
                  {formatIndianNumber(transaction.credit)}
                </td>
                <td className="py-2 px-4 border-b border-gray-100">
                  {transaction.partner ?? '—'}
                </td>
                <td className="py-2 px-4 border-b border-gray-100 truncate">
                  {transaction.notes ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── FIXED: Current Total ── */}
      <div className="flex-shrink-0 overflow-hidden border-t border-gray-300">
        <table className="w-full table-fixed border-collapse">
          <ColGroup />
          <tbody>
            <tr className="bg-gray-100 font-semibold text-gray-800">
              <td className="py-2 px-4 border-b border-gray-200" />
              <td className="py-2 px-4 border-b border-gray-200">
                Current Total
              </td>
              <td className="py-2 px-4 border-b border-gray-200" />
              <td className="py-2 px-4 border-b border-gray-200 text-right">
                {formatIndianNumber(currentTotalDebit)}
              </td>
              <td className="py-2 px-4 border-b border-gray-200 text-right">
                {formatIndianNumber(currentTotalCredit)}
              </td>
              <td className="py-2 px-4 border-b border-gray-200" />
              <td className="py-2 px-4 border-b border-gray-200" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── FIXED: Closing Balance (from API data) ── */}
      <div className="flex-shrink-0 overflow-hidden">
        <table className="w-full table-fixed border-collapse">
          <ColGroup />
          <tbody>
            <tr className="bg-blue-100 font-bold text-gray-900">
              <td className="py-2.5 px-4" />
              <td className="py-2.5 px-4">Closing Balance</td>
              <td className="py-2.5 px-4" />
              <td className="py-2.5 px-4 text-right">
                {formatIndianNumber(closingDebit)}
              </td>
              <td className="py-2.5 px-4 text-right">
                {formatIndianNumber(closingCredit)}
              </td>
              <td className="py-2.5 px-4" />
              <td className="py-2.5 px-4" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

