

'use client'

import type React from 'react'
import type { GeneralLedgerType } from '@/utils/type'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface SingleTrialBalanceListProps {
  transactions: GeneralLedgerType[]
  targetRef: React.RefObject<HTMLDivElement>
}

type SortField = Exclude<
  keyof GeneralLedgerType,
  'closingbalance' | 'openingbalance'
>
type SortDirection = 'asc' | 'desc' | null

export default function SingleTrialBalanceList({
  transactions,
  targetRef,
}: SingleTrialBalanceListProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortField(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // More comprehensive function to detect balance rows
  const isBalanceRow = (transaction: GeneralLedgerType) => {
    const accountName = (transaction.accountname || '').toLowerCase()
    const notes = (transaction.notes || '').toLowerCase()
    const voucherNo = (transaction.voucherno || '').toLowerCase()
    const voucherId = String(transaction.voucherid || '').toLowerCase()

    // Check multiple possible indicators for balance rows
    const balanceIndicators = [
      'opening balance',
      'closing balance',
      'opening bal',
      'closing bal',
      'balance b/f',
      'balance c/f',
      'balance brought forward',
      'balance carried forward',
    ]

    return balanceIndicators.some(
      (indicator) =>
        accountName.includes(indicator) ||
        notes.includes(indicator) ||
        voucherNo.includes(indicator) ||
        voucherId.includes(indicator)
    )
  }

  const sortedTransactions = useMemo(() => {
    // Find the first and last balance rows to maintain their positions
    const firstBalanceIndex = transactions.findIndex(isBalanceRow)
    const lastBalanceIndex =
      transactions
        .map((t, i) => ({ transaction: t, index: i }))
        .reverse()
        .find(({ transaction }) => isBalanceRow(transaction))?.index ?? -1

    // If no balance rows found, sort all transactions normally
    if (firstBalanceIndex === -1 && lastBalanceIndex === -1) {
      if (!sortField || !sortDirection) {
        return transactions
      }

      return [...transactions].sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        if (aValue == null && bValue == null) return 0
        if (aValue == null) return sortDirection === 'asc' ? 1 : -1
        if (bValue == null) return sortDirection === 'asc' ? -1 : 1

        const aStr = String(aValue).toLowerCase()
        const bStr = String(bValue).toLowerCase()

        const numericFields = [
          'debit',
          'credit',
          'voucherid',
          'companyId',
          'locationId',
        ]
        if (numericFields.includes(sortField)) {
          const aNum = Number.parseFloat(aStr) || 0
          const bNum = Number.parseFloat(bStr) || 0
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum
        }

        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    // Separate transactions into three groups
    const beforeBalance: GeneralLedgerType[] = []
    const balanceRows: GeneralLedgerType[] = []
    const regularTransactions: GeneralLedgerType[] = []
    const afterBalance: GeneralLedgerType[] = []

    transactions.forEach((transaction, index) => {
      if (isBalanceRow(transaction)) {
        balanceRows.push(transaction)
      } else if (index < firstBalanceIndex) {
        beforeBalance.push(transaction)
      } else if (index > lastBalanceIndex) {
        afterBalance.push(transaction)
      } else {
        regularTransactions.push(transaction)
      }
    })

    // Sort only regular transactions if sorting is applied
    let sortedRegularTransactions = regularTransactions

    if (sortField && sortDirection) {
      sortedRegularTransactions = [...regularTransactions].sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        if (aValue == null && bValue == null) return 0
        if (aValue == null) return sortDirection === 'asc' ? 1 : -1
        if (bValue == null) return sortDirection === 'asc' ? -1 : 1

        const aStr = String(aValue).toLowerCase()
        const bStr = String(bValue).toLowerCase()

        const numericFields = [
          'debit',
          'credit',
          'voucherid',
          'companyId',
          'locationId',
        ]
        if (numericFields.includes(sortField)) {
          const aNum = Number.parseFloat(aStr) || 0
          const bNum = Number.parseFloat(bStr) || 0
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum
        }

        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    // Reconstruct the array maintaining balance row positions
    return [
      ...beforeBalance,
      ...balanceRows.filter((_, index) => index === 0), // Opening balance
      ...sortedRegularTransactions,
      ...balanceRows.filter((_, index) => index > 0), // Closing balance(s)
      ...afterBalance,
    ]
  }, [transactions, sortField, sortDirection])

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="ml-2 h-4 w-4" />
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />
  }

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField
    children: React.ReactNode
  }) => (
    <th className="py-2 px-4 border-b">
      <Button
        variant="ghost"
        onClick={() => handleSort(field)}
        className="h-auto p-0 font-semibold text-left justify-start hover:bg-transparent"
      >
        {children}
        {getSortIcon(field)}
      </Button>
    </th>
  )

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">No available data</div>
    )
  }

  return (
    <div
      className="overflow-x-auto mx-3 mb-3 shadow-md"
      ref={targetRef}
      style={{
        padding: '40px 40px', // 40px top & bottom, 40px left & right
        boxSizing: 'border-box',
      }}
    >
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <SortableHeader field="voucherno">Voucher No</SortableHeader>
            <SortableHeader field="date">Date</SortableHeader>
            <SortableHeader field="voucherid">Voucher ID</SortableHeader>
            <SortableHeader field="accountname">Account Name</SortableHeader>
            <SortableHeader field="debit">Debit</SortableHeader>
            <SortableHeader field="credit">Credit</SortableHeader>
            <SortableHeader field="notes">Notes</SortableHeader>
            <SortableHeader field="partner">Partner</SortableHeader>
            <SortableHeader field="coscenter">Cost Center</SortableHeader>
            <SortableHeader field="department">Department</SortableHeader>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.length > 0 ? (
            sortedTransactions.map((transaction, index) => (
              <tr
                key={`${transaction.voucherid}-${index}`}
                className={`${index % 2 === 0 ? 'bg-gray-50' : ''} ${
                  isBalanceRow(transaction)
                    ? 'font-semibold bg-blue-50 border-l-4 border-blue-400'
                    : ''
                }`}
              >
                <td className="py-2 px-4 border-b">
                  {isBalanceRow(transaction) ? (
                    <span className="text-blue-700">
                      {transaction.voucherno}
                    </span>
                  ) : (
                    <Link
                      target="_blank"
                      href={`/reports/general-ledger/single-general-ledger/${transaction.voucherid}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {transaction.voucherno}
                    </Link>
                  )}
                </td>
                <td className="py-2 px-4 border-b w-full">
                  {transaction.date}
                </td>
                <td className="py-2 px-4 border-b">{transaction.voucherid}</td>
                <td className="py-2 px-4 border-b">
                  {transaction.accountname}
                </td>
                <td className="py-2 px-4 border-b">{transaction.debit}</td>
                <td className="py-2 px-4 border-b">{transaction.credit}</td>
                <td className="py-2 px-4 border-b">{transaction.notes}</td>
                <td className="py-2 px-4 border-b">{transaction.partner}</td>
                <td className="py-2 px-4 border-b">{transaction.coscenter}</td>
                <td className="py-2 px-4 border-b">{transaction.department}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={12} className="text-center py-4 text-gray-500">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

