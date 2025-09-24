'use client'

import type React from 'react'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'

interface CashFlowStatementItem {
  cashflowTag: string
  credit: string | number
  debit: string | number
}

interface CashFlowStatementProps {
  targetRef: React.RefObject<HTMLDivElement>
  cashFlowStatements: CashFlowStatementItem[]
}

const CashFlowStatement: React.FC<CashFlowStatementProps> = ({
  targetRef,
  cashFlowStatements,
}) => {
  const operatingActivities = cashFlowStatements.filter((item) => {
    const regex =
      /(Advance Payments received from customers|Cash received from operating activities|Advance payments made to suppliers|Cash paid for operating activities)/i
    return regex.test(item.cashflowTag || '')
  })

  const investingAndExtraordinary = cashFlowStatements.filter((item) =>
    item.cashflowTag?.toLowerCase().includes('investing')
  )

  const financingActivities = cashFlowStatements.filter((item) =>
    item.cashflowTag?.toLowerCase().includes('financing')
  )

  const unclassifiedActivities = cashFlowStatements.filter(
    (item) =>
      !item.cashflowTag?.toLowerCase().includes('operating') &&
      !item.cashflowTag?.toLowerCase().includes('investing') &&
      !item.cashflowTag?.toLowerCase().includes('financing')
  )

  // const formatAmount = (amount: string | number, isCredit = false) => {
  //   const numAmount =
  //     typeof amount === 'string' ? Number.parseFloat(amount) : amount
  //   if (!numAmount) return '0.00'
  //   const formattedNumber = numAmount.toFixed(2)
  //   return isCredit ? `-${formattedNumber}` : `+${formattedNumber}`
  // }

  const formatAmount = (amount: string | number, isCredit = false) => {
    const numAmount =
      typeof amount === 'string' ? Number.parseFloat(amount) : amount
    if (!numAmount) return '0.00'

    const formattedNumber = Math.abs(numAmount).toFixed(2)

    // if negative -> show in brackets
    if (numAmount < 0 || isCredit) {
      return `(${formattedNumber})`
    }

    // if positive -> show plain number
    return formattedNumber
  }

  return (
    <div
      ref={targetRef}
      className="mt-2 w-full border-2 shadow-lg rounded-md p-2 max-w-4xl mx-auto"
    >
      <Table>
        <TableBody>
          {/* Beginning Balance */}
          <TableRow className="hover:bg-muted/50">
            <TableCell className="bg-gray-100 p-2 pdf-table-header">
              <span className="text-gray-700 font-bold">
                Cash and cash equivalents, beginning of period
              </span>
            </TableCell>
            <TableCell className="bg-gray-100 p-2 text-right pdf-table-header">
              <span className="text-gray-700">
                {formatAmount(cashFlowStatements[0]?.credit, true)}
              </span>
            </TableCell>
          </TableRow>

          {/* Net Increase Section */}
          <TableRow className="hover:bg-muted/50">
            <TableCell colSpan={2} className="bg-gray-100 p-2 pdf-table-header">
              <span className="text-gray-700 font-bold">
                Net increase in cash and cash equivalents
              </span>
            </TableCell>
          </TableRow>

          {/* Operating Activities */}
          <TableRow className="hover:bg-muted/50">
            <TableCell colSpan={2} className="p-2 pdf-table-header">
              <span className="text-gray-700 font-bold">
                Cash flows from operating activities
              </span>
            </TableCell>
          </TableRow>
          {operatingActivities.map((item, index) => (
            <TableRow key={index} className="hover:bg-muted/50">
              <TableCell className="pl-4 p-2">{item.cashflowTag}</TableCell>
              <TableCell className="text-right p-2">
                {item.credit
                  ? formatAmount(item.credit, true)
                  : formatAmount(item.debit)}
              </TableCell>
            </TableRow>
          ))}

          {/* Investing Activities */}
          <TableRow className="hover:bg-muted/50">
            <TableCell colSpan={2} className="p-2 pdf-table-header">
              <span className="text-gray-700 font-bold">
                Cash flows from investing & extraordinary activities
              </span>
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-muted/50">
            <TableCell className="pl-4 p-2">Cash in</TableCell>
            <TableCell className="text-right p-2">
              {formatAmount(
                investingAndExtraordinary.reduce(
                  (sum, item) =>
                    sum + (Number.parseFloat(item.debit as string) || 0),
                  0
                )
              )}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-muted/50">
            <TableCell className="pl-4 p-2">Cash out</TableCell>
            <TableCell className="text-right p-2">
              {formatAmount(
                investingAndExtraordinary.reduce(
                  (sum, item) =>
                    sum + (Number.parseFloat(item.credit as string) || 0),
                  0
                ),
                true
              )}
            </TableCell>
          </TableRow>

          {/* Financing Activities */}
          <TableRow className="hover:bg-muted/50">
            <TableCell colSpan={2} className="p-2 pdf-table-header">
              <span className="text-gray-700 font-bold">
                Cash flows from financing activities
              </span>
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-muted/50">
            <TableCell className="pl-4 p-2">Cash in</TableCell>
            <TableCell className="text-right p-2">
              {formatAmount(
                financingActivities.reduce(
                  (sum, item) =>
                    sum + (Number.parseFloat(item.debit as string) || 0),
                  0
                )
              )}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-muted/50">
            <TableCell className="pl-4 p-2">Cash out</TableCell>
            <TableCell className="text-right p-2">
              {formatAmount(
                financingActivities.reduce(
                  (sum, item) =>
                    sum + (Number.parseFloat(item.credit as string) || 0),
                  0
                ),
                true
              )}
            </TableCell>
          </TableRow>

          {/* Unclassified Activities */}
          <TableRow className="hover:bg-muted/50">
            <TableCell colSpan={2} className="p-2 pdf-table-header">
              <span className="text-gray-700 font-bold">
                Cash flows from unclassified activities
              </span>
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-muted/50">
            <TableCell className="pl-4 p-2">Cash in</TableCell>
            <TableCell className="text-right p-2">
              {formatAmount(
                unclassifiedActivities.reduce(
                  (sum, item) =>
                    sum + (Number.parseFloat(item.debit as string) || 0),
                  0
                )
              )}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-muted/50">
            <TableCell className="pl-4 p-2">Cash out</TableCell>
            <TableCell className="text-right p-2">
              {formatAmount(
                unclassifiedActivities.reduce(
                  (sum, item) =>
                    sum + (Number.parseFloat(item.credit as string) || 0),
                  0
                ),
                true
              )}
            </TableCell>
          </TableRow>

          {/* Closing Balance */}
          <TableRow className="hover:bg-muted/50">
            <TableCell className="bg-gray-100 p-2 pdf-table-header">
              <span className="text-gray-700 font-bold">
                Cash and cash equivalents, closing balance
              </span>
            </TableCell>
            <TableCell className="bg-gray-100 p-2 text-right pdf-table-header">
              <span className="text-gray-700">
                {formatAmount(
                  cashFlowStatements[cashFlowStatements.length - 1]?.credit,
                  true
                )}
              </span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

export default CashFlowStatement
