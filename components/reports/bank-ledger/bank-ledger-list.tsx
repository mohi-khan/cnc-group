'use client'

import { formatIndianNumber } from '@/utils/Formatindiannumber'
import { GetBankLedger } from '@/utils/type'
import Link from 'next/link'
import React, { useEffect, useState, useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface BankLedgerListProps {
  transactions?: GetBankLedger[]
  isLoading?: boolean
}

interface GroupedVoucher {
  voucherno: string
  voucherid: string | number
  totalDebit: number
  totalCredit: number
  accountNames: string[]
  rows: GetBankLedger[]
  isGrouped: boolean // true if more than 1 row shares this voucher no
}

export default function BankLedgerList({
  transactions,
  isLoading = false,
}: BankLedgerListProps) {
  const [displayData, setDisplayData] = useState<GetBankLedger[]>([])
  const [expandedVouchers, setExpandedVouchers] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (Array.isArray(transactions) && transactions.length > 0) {
      setDisplayData(transactions)
    } else {
      setDisplayData([])
    }
  }, [transactions])

  // Extract opening & closing rows
  const openingRow = useMemo(
    () => displayData.find((t) => t.accountname?.toLowerCase().includes('opening')),
    [displayData]
  )
  const closingRow = useMemo(
    () => displayData.find((t) => t.accountname?.toLowerCase().includes('closing')),
    [displayData]
  )

  // Transaction rows only (no opening/closing)
  const transactionRows = useMemo(
    () => displayData.filter((t) => t !== openingRow && t !== closingRow),
    [displayData, openingRow, closingRow]
  )

  // Group transaction rows by voucherno
  const groupedRows = useMemo<GroupedVoucher[]>(() => {
    const map = new Map<string, GetBankLedger[]>()
    for (const row of transactionRows) {
      const key = row.voucherno ?? `__no_voucher_${Math.random()}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(row)
    }

    return Array.from(map.entries()).map(([voucherno, rows]) => {
      const totalDebit = rows.reduce((s, r) => s + (r.debit ?? 0), 0)
      const totalCredit = rows.reduce((s, r) => s + (r.credit ?? 0), 0)
      const accountNames = rows.map(
        (r) =>
          `${r.accountname ?? ''}${r.bankaccountnumber ? ` (${r.bankaccountnumber})` : ''}`
      )
      return {
        voucherno,
        voucherid: rows[0].voucherid ?? '',
        totalDebit,
        totalCredit,
        accountNames,
        rows,
        isGrouped: rows.length > 1,
      }
    })
  }, [transactionRows])

  const currentTotalDebit = useMemo(
    () => groupedRows.reduce((s, g) => s + g.totalDebit, 0),
    [groupedRows]
  )
  const currentTotalCredit = useMemo(
    () => groupedRows.reduce((s, g) => s + g.totalCredit, 0),
    [groupedRows]
  )

  const openingDebit = openingRow?.debit ?? 0
  const openingCredit = openingRow?.credit ?? 0
  const closingDebit = closingRow?.debit ?? 0
  const closingCredit = closingRow?.credit ?? 0

  const toggleExpand = (voucherno: string) => {
    setExpandedVouchers((prev) => {
      const next = new Set(prev)
      if (next.has(voucherno)) next.delete(voucherno)
      else next.add(voucherno)
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10 text-gray-500">
        <svg
          className="animate-spin h-5 w-5 mr-3 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 00-8 8h4z" />
        </svg>
        Loading data...
      </div>
    )
  }

  if (displayData.length === 0) {
    return <div className="text-center py-10 text-gray-500">No available data</div>
  }

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
              <th className="py-2 px-4 border-b border-gray-300 text-left">Date</th>
              <th className="py-2 px-4 border-b border-gray-300 text-left">Account Name</th>
              <th className="py-2 px-4 border-b border-gray-300 text-left">Voucher No</th>
              <th className="py-2 px-4 border-b border-gray-300 text-right">Debit</th>
              <th className="py-2 px-4 border-b border-gray-300 text-right">Credit</th>
              <th className="py-2 px-4 border-b border-gray-300 text-left">Partner</th>
              <th className="py-2 px-4 border-b border-gray-300 text-left">Notes</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* ── FIXED: Opening Balance ── */}
      <div className="flex-shrink-0 overflow-hidden border-b border-gray-300">
        <table className="w-full table-fixed border-collapse">
          <ColGroup />
          <tbody>
            <tr className="bg-blue-50 font-semibold text-gray-700">
              <td className="py-2 px-4" />
              <td className="py-2 px-4">Opening Balance</td>
              <td className="py-2 px-4" />
              <td className="py-2 px-4 text-right">{formatIndianNumber(openingDebit)}</td>
              <td className="py-2 px-4 text-right">{formatIndianNumber(openingCredit)}</td>
              <td className="py-2 px-4" />
              <td className="py-2 px-4" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── SCROLLABLE: Grouped Transaction Rows ── */}
      <div className="overflow-y-auto overflow-x-hidden max-h-[400px]">
        <table className="w-full table-fixed border-collapse">
          <ColGroup />
          <tbody>
            {groupedRows.map((group, index) => {
              const isExpanded = expandedVouchers.has(group.voucherno)
              const rowBg = index % 2 === 0 ? 'bg-gray-50' : 'bg-white'

              return (
                <React.Fragment key={`group-${group.voucherno}-${index}`}>
                  {/* ── Summary / Grouped Row ── */}
                  <tr
                    className={`${rowBg} hover:bg-blue-50 transition-colors ${group.isGrouped ? 'cursor-pointer' : ''}`}
                    onClick={() => group.isGrouped && toggleExpand(group.voucherno)}
                  >
                    {/* Date — show first row's date */}
                    <td className="py-2 px-4 border-b border-gray-100 text-gray-600">
                      {group.rows[0].date}
                    </td>

                    {/* Account Name(s) */}
                    <td className="py-2 px-4 border-b border-gray-100">
                      {group.isGrouped ? (
                        <span className="text-gray-700 font-medium">
                          {group.accountNames.join(', ')}
                        </span>
                      ) : (
                        <span className="truncate block">
                          {group.accountNames[0]}
                        </span>
                      )}
                    </td>

                    {/* Voucher No */}
                    <td className="py-2 px-4 border-b border-gray-100">
                      <div className="flex items-center gap-1">
                        {group.isGrouped && (
                          <span className="text-gray-500 flex-shrink-0">
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </span>
                        )}
                        <Link
                          target="_blank"
                          href={`/reports/general-ledger/single-general-ledger/${group.voucherid}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {group.voucherno}
                        </Link>
                        {group.isGrouped && (
                          <span className="ml-1 text-xs bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 font-medium flex-shrink-0">
                            {group.rows.length}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Debit total */}
                    <td className="py-2 px-4 border-b border-gray-100 text-right font-medium">
                      {formatIndianNumber(group.totalDebit)}
                    </td>

                    {/* Credit total */}
                    <td className="py-2 px-4 border-b border-gray-100 text-right font-medium">
                      {formatIndianNumber(group.totalCredit)}
                    </td>

                    {/* Partner — show first row's partner or "Multiple" */}
                    <td className="py-2 px-4 border-b border-gray-100">
                      {group.isGrouped
                        ? group.rows[0].partner ?? '—'
                        : group.rows[0].partner ?? '—'}
                    </td>

                    {/* Notes — show first row's notes or "Multiple" */}
                    <td className="py-2 px-4 border-b border-gray-100 truncate">
                      {group.isGrouped
                        ? group.rows[0].notes ?? '—'
                        : group.rows[0].notes ?? '—'}
                    </td>
                  </tr>

                  {/* ── Expanded Sub-Rows ── */}
                  {group.isGrouped && isExpanded &&
                    group.rows.map((row, subIndex) => (
                      <tr
                        key={`sub-${group.voucherno}-${subIndex}`}
                        className="bg-blue-50/60 border-l-4 border-l-blue-400 hover:bg-blue-100/60 transition-colors"
                      >
                        <td className="py-1.5 px-4 border-b border-blue-100 text-gray-500 text-xs pl-6">
                          {row.date}
                        </td>
                        <td className="py-1.5 px-4 border-b border-blue-100 text-xs pl-6">
                          {`${row.accountname ?? ''}${row.bankaccountnumber ? ` (${row.bankaccountnumber})` : ''}`}
                        </td>
                        <td className="py-1.5 px-4 border-b border-blue-100 text-xs text-center">
                          <Link
                            target="_blank"
                            href={`/reports/general-ledger/single-general-ledger/${row.voucherid}`}
                            className="text-blue-500 hover:text-blue-700 hover:underline"
                          >
                            {row.voucherno}
                          </Link>
                        </td>
                        <td className="py-1.5 px-4 border-b border-blue-100 text-right text-xs">
                          {formatIndianNumber(row.debit)}
                        </td>
                        <td className="py-1.5 px-4 border-b border-blue-100 text-right text-xs">
                          {formatIndianNumber(row.credit)}
                        </td>
                        <td className="py-1.5 px-4 border-b border-blue-100 text-xs">
                          {row.partner ?? '—'}
                        </td>
                        <td className="py-1.5 px-4 border-b border-blue-100 text-xs truncate">
                          {row.notes ?? '—'}
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              )
            })}
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
              <td className="py-2 px-4 border-b border-gray-200">Current Total</td>
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

      {/* ── FIXED: Closing Balance ── */}
      <div className="flex-shrink-0 overflow-hidden">
        <table className="w-full table-fixed border-collapse">
          <ColGroup />
          <tbody>
            <tr className="bg-blue-100 font-bold text-gray-900">
              <td className="py-2.5 px-4" />
              <td className="py-2.5 px-4">Closing Balance</td>
              <td className="py-2.5 px-4" />
              <td className="py-2.5 px-4 text-right">{formatIndianNumber(closingDebit)}</td>
              <td className="py-2.5 px-4 text-right">{formatIndianNumber(closingCredit)}</td>
              <td className="py-2.5 px-4" />
              <td className="py-2.5 px-4" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}


