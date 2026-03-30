'use client'

import type React from 'react'
import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import type { GetCashReport, IouRecordGetType } from '@/utils/type'
import { VoucherTypes } from '@/utils/type'
import Link from 'next/link'
import { formatIndianNumber } from '@/utils/Formatindiannumber'

interface CashReportProps {
  cashReport: GetCashReport[]
  getEmployeeName: (employeeId: number) => string
  date: string
  setDate: (date: string) => void
  companyId?: number
  location?: number
  isGeneratingPdf?: boolean
  loanData?: IouRecordGetType[]
}

const CashReportList: React.FC<CashReportProps> = ({
  cashReport,
  getEmployeeName,
  isGeneratingPdf = false,
  loanData,
}) => {
  const linkGenerator = (voucherId: number) =>
    `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.CashVoucher}`

  // Money note state
  const [notes, setNotes] = useState({
    1000: 0,
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    1: 0,
    coins: 0,
  })

  // IOU tooltip visibility state
  const [showIouTooltip, setShowIouTooltip] = useState(false)

  const handleNoteChange = (value: number, key: keyof typeof notes) => {
    setNotes((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Total from note calculation
  const noteTotal = useMemo(() => {
    return (
      notes[1000] * 1000 +
      notes[500] * 500 +
      notes[200] * 200 +
      notes[100] * 100 +
      notes[50] * 50 +
      notes[20] * 20 +
      notes[10] * 10 +
      notes[5] * 5 +
      notes[1] * 1 +
      notes.coins
    )
  }, [notes])

  const formatDate = (date: string | Date) => {
    const d = new Date(date) // works for both Date or string
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  }

  return (
    <div>
      <Card>
        <CardContent className="p-2">
          <div>
            {cashReport.map((report, index) => {
              const closingBalance =
                Number(report.closingBal?.[0]?.balance) || 0

              const loanTotal =
                loanData?.reduce(
                  (sum, loan) => sum + (Number(loan.amount) || 0),
                  0
                ) || 0

              const totalAmount = closingBalance - loanTotal

              const restAmount = totalAmount - noteTotal

              return (
                <div key={index} className="space-y-4">
                  <div className="text-xl font-bold">
                    {report.openingBal?.map((bal, i) => (
                      <div key={i}>
                        {/* Opening Balance: {Number(bal.balance).toFixed(2)} */}
                        <p>Opening Balance: {formatIndianNumber(Number(bal.balance))}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Receipt Table */}
                    <div className="border rounded p-2">
                      <h3 className="font-bold mb-1 text-center pdf-table-header border-b border-gray-300 pb-1">
                        Receipt
                      </h3>
                      <Table>
                        <TableHeader className="pdf-table-header">
                          <TableRow>
                            <TableHead className="p-2">
                              Voucher Number
                            </TableHead>
                            <TableHead className="p-2">Particular</TableHead>
                            <TableHead className="p-2 text-right">
                              Amount
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.transactionData
                            ?.filter((t) => t.debit > 0)
                            .map((transaction, i) => (
                              <TableRow key={i}>
                                <TableCell className="p-2">
                                  {isGeneratingPdf ? (
                                    transaction.voucherNo
                                  ) : (
                                    <Link
                                      href={linkGenerator(
                                        transaction.voucherId
                                      )}
                                    >
                                      {transaction.voucherNo}
                                    </Link>
                                  )}
                                </TableCell>
                                <TableCell className="p-2">
                                  {transaction.oppositeNarration}
                                </TableCell>
                                <TableCell className="p-2 text-right">
                                  {formatIndianNumber(
                                    Number(transaction?.oppositeAmount || 0)
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Payment Table */}
                    <div className="border rounded p-2">
                      <h3 className="font-bold mb-1 text-center pdf-table-header border-b border-gray-300 pb-1">
                        Payment
                      </h3>
                      <Table>
                        <TableHeader className="pdf-table-header">
                          <TableRow>
                            <TableHead className="p-2">
                              Voucher Number
                            </TableHead>
                            <TableHead className="p-2">Particular</TableHead>
                            <TableHead className="p-2 text-right">
                              Amount
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.transactionData
                            ?.filter((t) => t.credit > 0)
                            .map((transaction, i) => (
                              <TableRow key={i}>
                                <TableCell className="p-2">
                                  {isGeneratingPdf ? (
                                    transaction.voucherNo
                                  ) : (
                                    <Link
                                      href={linkGenerator(
                                        transaction.voucherId
                                      )}
                                    >
                                      {transaction.voucherNo}
                                    </Link>
                                  )}
                                </TableCell>
                                <TableCell className="p-2">
                                  {transaction.oppositeNarration}
                                </TableCell>
                                <TableCell className="p-2 text-right">
                                  {formatIndianNumber(
                                    Number(transaction.oppositeAmount)
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}

                          {/* Closing Balance Row */}
                          {report.closingBal?.map((bal, i) => (
                            <TableRow
                              key={`closing-${i}`}
                              className="font-bold"
                            >
                              <TableCell
                                colSpan={2}
                                className="p-2 text-center"
                              >
                                Closing Balance
                              </TableCell>
                              <TableCell className="p-2 text-right">
                                {formatIndianNumber(Number(bal.balance))}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Total IOU with hover tooltip */}
                  <div className="border rounded p-2 ml-auto w-1/2">
                    <div
                      className="mt-1 font-bold relative inline-block cursor-default text-blue-600"
                      onMouseEnter={() => setShowIouTooltip(true)}
                      onMouseLeave={() => setShowIouTooltip(false)}
                    >
                      Total IOU:&nbsp;
                      {formatIndianNumber(
                        loanData?.reduce(
                          (sum, loan) => sum + Number(loan.amount || 0),
                          0
                        ) || 0
                      )}
                      {/* IOU Breakdown Tooltip */}
                      {showIouTooltip && loanData && loanData.length > 0 && (
                        // <div className="absolute left-0 top-full mt-1 z-50 w-[680px] h-[400px] bg-white border border-gray-200 rounded-lg shadow-2xl p-4">
                        <div className="absolute left-0 top-full mt-1 z-50 
                w-auto max-w-[680px] min-w-[200px] 
                max-h-[400px] bg-white border border-gray-200 
                rounded-lg shadow-2xl p-4 overflow-auto">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">
                            IOU Breakdown
                          </p>
                          <div className="overflow-y-auto h-[calc(100%-2.5rem)]">
                            <table className="w-full text-sm table-fixed border-collapse">
                              <thead className="bg-gray-200 sticky top-0">
                                <tr>
                                  <th className="w-12 text-left py-2 px-2 font-medium text-gray-600">
                                    IOU ID
                                  </th>
                                  <th className="w-36 text-left py-2 px-2 font-medium text-gray-600">
                                    Employee
                                  </th>
                                  <th className="w-28 text-right py-2 px-2 font-medium text-gray-600">
                                    Amount
                                  </th>
                                  <th className="w-28 text-right py-2 px-2 font-medium text-gray-600">
                                    Adjusted
                                  </th>
                                  <th className="w-28 text-left py-2 px-2 font-medium text-gray-600">
                                     Issued Date
                                  </th>
                                  <th className="w-28 text-left py-2 px-2 font-medium text-gray-600">
                                    Due Date
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {loanData.map((loan, i) => (
                                  <tr
                                    key={i}
                                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                                  >
                                    <td className="py-2 px-2 text-gray-700 font-semibold">
                                      {loan.iouId}
                                    </td>
                                    <td className="py-2 px-2 text-gray-700">
                                      {getEmployeeName(loan.employeeId)}
                                    </td>
                                    <td className="py-2 px-2 text-right text-gray-700">
                                      {formatIndianNumber(
                                        Number(loan.amount || 0)
                                      )}
                                    </td>
                                    <td className="py-2 px-2 text-right text-gray-700">
                                      {formatIndianNumber(
                                        Number(loan.adjustedAmount || 0)
                                      )}
                                    </td>
                                    <td className="py-2 px-2 text-gray-700">
                                      {formatDate(loan.dateIssued)}
                                    </td>
                                    <td className="py-2 px-2 text-gray-700">
                                      {formatDate(loan.dueDate)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-50 sticky bottom-0">
                                <tr className="border-t border-gray-300 font-bold">
                                  <td className="pt-2 px-2" colSpan={2}>
                                    Total
                                  </td>
                                  <td className="pt-2 px-2 text-right">
                                    {formatIndianNumber(
                                      loanData.reduce(
                                        (sum, loan) =>
                                          sum + Number(loan.amount || 0),
                                        0
                                      )
                                    )}
                                  </td>
                                  <td className="pt-2 px-2 text-right">
                                    {formatIndianNumber(
                                      loanData.reduce(
                                        (sum, loan) =>
                                          sum +
                                          Number(loan.adjustedAmount || 0),
                                        0
                                      )
                                    )}
                                  </td>
                                  <td colSpan={2}></td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Money Note Counter */}
                  <div className="border rounded p-2 ml-auto w-1/2">
                    <div className="font-bold mb-1">
                      Total Amount: {formatIndianNumber(totalAmount)}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <h4 className="font-semibold mb-1">Money Note Count</h4>
                        <div className="space-y-1">
                          {(
                            [1000, 500, 200, 100, 50, 20, 10, 5, 1] as const
                          ).map((denom) => (
                            <div
                              key={denom}
                              className="flex justify-between items-center gap-1"
                            >
                              <span>{denom} x</span>
                              <input
                                type="number"
                                className="w-20 border rounded p-1"
                                value={notes[denom]}
                                onChange={(e) =>
                                  handleNoteChange(
                                    Number(e.target.value) || 0,
                                    denom
                                  )
                                }
                              />
                              <span>=</span>
                              <input
                                type="number"
                                className="w-24 border rounded p-1"
                                readOnly
                                value={(notes[denom] * denom).toFixed(2)}
                              />
                            </div>
                          ))}

                          {/* Coins */}
                          <div className="flex justify-between items-center gap-1">
                            <span>Coins</span>
                            <input
                              type="number"
                              className="w-24 border rounded p-1"
                              value={notes.coins}
                              onChange={(e) =>
                                handleNoteChange(
                                  Number(e.target.value) || 0,
                                  'coins'
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 font-bold">
                      Note Total:
                      {formatIndianNumber(Number(noteTotal || 0))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CashReportList
