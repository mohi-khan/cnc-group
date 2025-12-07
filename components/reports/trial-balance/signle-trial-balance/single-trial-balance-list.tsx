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
  showLogoInPdf?: boolean
}

type SortField = Exclude<
  keyof GeneralLedgerType,
  'closingbalance' | 'openingbalance'
>
type SortDirection = 'asc' | 'desc' | null

export default function SingleTrialBalanceList({
  transactions,
  targetRef,
  showLogoInPdf = false,
}: SingleTrialBalanceListProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  console.log(transactions)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
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

  const isBalanceRow = (transaction: GeneralLedgerType) => {
    const accountName = (transaction.accountname || '').toLowerCase()
    const notes = (transaction.notes || '').toLowerCase()
    const voucherNo = (transaction.voucherno || '').toLowerCase()
    const voucherId = String(transaction.voucherid || '').toLowerCase()

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
    const firstBalanceIndex = transactions.findIndex(isBalanceRow)
    const lastBalanceIndex =
      transactions
        .map((t, i) => ({ transaction: t, index: i }))
        .reverse()
        .find(({ transaction }) => isBalanceRow(transaction))?.index ?? -1

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

    return [
      ...beforeBalance,
      ...balanceRows.filter((_, index) => index === 0),
      ...sortedRegularTransactions,
      ...balanceRows.filter((_, index) => index > 0),
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
      {showLogoInPdf ? (
        <span className="font-semibold text-left">{children}</span>
      ) : (
        <Button
          variant="ghost"
          onClick={() => handleSort(field)}
          className="h-auto p-0 font-semibold text-left justify-start hover:bg-transparent"
        >
          {children}
          {getSortIcon(field)}
        </Button>
      )}
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
        padding: '40px 40px',
        boxSizing: 'border-box',
      }}
    >
      <table className="min-w-full table-fixed bg-white border border-gray-300 text-sm">
        <thead className="pdf-table-header sticky top-0 bg-white z-10">
          <tr className="bg-gray-100">
            <SortableHeader field="voucherno">Voucher No</SortableHeader>
            <SortableHeader field="date">
              <span className="block w-[50px]">Date</span>
            </SortableHeader>
            <SortableHeader field="accountname">Account Name</SortableHeader>
            <SortableHeader field="notes">
              <span className="block w-[80px]">Notes</span>
            </SortableHeader>
            <SortableHeader field="partner">Partner</SortableHeader>
            <SortableHeader field="coscenter">Cost Center</SortableHeader>
            <SortableHeader field="department">Department</SortableHeader>
            <SortableHeader field="debit">Debit</SortableHeader>
            <SortableHeader field="credit">Credit</SortableHeader>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((transaction, index) => (
            <tr
              key={`${transaction.voucherid}-${index}`}
              className={`${index % 2 === 0 ? 'bg-gray-50' : ''} ${
                isBalanceRow(transaction)
                  ? 'font-semibold bg-blue-50 border-l-4 border-blue-400'
                  : ''
              }`}
            >
              <td className="py-2 px-4 border-b text-center">
                <Link
                  target="_blank"
                  href={`/reports/general-ledger/single-general-ledger/${transaction.voucherid}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {transaction.voucherno}
                </Link>
              </td>
              <td className="py-2 px-2 border-b text-center w-[100px]">
                {transaction.date}
              </td>
              <td className="py-2 px-2 border-b text-start w-[150px]">
                {index === 0
                  ? 'Opening Balance'
                  : index === sortedTransactions.length - 1
                    ? 'Closing Balance'
                    : `${transaction.accountname || '—'} (${transaction.bankaccountnumber || '—'})`}
              </td>
              <td className="py-2 px-2 border-b text-left w-[300px]">
                {transaction.notes}
              </td>
              <td className="py-2 px-2 border-b text-center w-[150px]">
                {transaction.partner}
              </td>
              <td className="py-2 px-2 border-b text-center w-[120px]">
                {transaction.coscenter}
              </td>
              <td className="py-2 px-2 border-b text-center w-[120px]">
                {transaction.department}
              </td>
              <td className="py-2 px-2 border-b text-right w-[100px]">
                {transaction.debit?.toFixed(2)}
              </td>
              <td className="py-2 px-2 border-b text-right w-[100px]">
                {transaction.credit?.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


