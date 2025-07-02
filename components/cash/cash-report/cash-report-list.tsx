'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { GetCashReport } from '@/utils/type'
import { VoucherTypes } from '@/utils/type'
import Link from 'next/link'

interface CashReportProps {
  cashReport: GetCashReport[]
  getEmployeeName: (employeeId: number) => string
  date: string
  setDate: (date: string) => void
  companyId?: number
  location?: number
  targetRef: React.RefObject<HTMLDivElement>
}

const CashReportList: React.FC<CashReportProps> = ({
  cashReport,
  getEmployeeName,
  targetRef,
}) => {
  const linkGenerator = (voucherId: number) => `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.CashVoucher}`
  return (
    <div ref={targetRef}>
      <Card>
        <CardContent className="p-2">
          <div>
            {cashReport.map((report, index) => (
              <div key={index} className="space-y-4">
                <div className="text-xl font-bold">
                  {report.openingBal?.map((bal, i) => (
                    <div key={i}>Opening Balance: {bal.balance}</div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="border rounded p-2">
                    <h3 className="font-bold mb-1 text-center">Receipt</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="p-2">Voucher Number</TableHead>
                          <TableHead className="p-2">Date</TableHead>
                          <TableHead className="p-2">Particular</TableHead>
                          <TableHead className="p-2">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.transactionData
                          ?.filter((t) => t.debit > 0)
                          .map((transaction, i) => (
                            <TableRow key={i}>
                              <TableCell className="p-2">
                               <Link href={linkGenerator(transaction.voucherId)}>
                                  {transaction.voucherNo}
                                </Link>

                              </TableCell>
                              <TableCell className="p-2">
                                {transaction.date}
                              </TableCell>
                              <TableCell className="p-2">
                                {transaction.narration}
                              </TableCell>
                              <TableCell className="p-2">
                                {transaction.debit}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="border rounded p-2">
                    <h3 className="font-bold mb-1 text-center">Payment</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="p-2">Voucher Number</TableHead>
                          <TableHead className="p-2">Date</TableHead>
                          <TableHead className="p-2">Particular</TableHead>
                          <TableHead className="p-2">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.transactionData
                          ?.filter((t) => t.credit > 0)
                          .map((transaction, i) => (
                            <TableRow key={i}>
                              <TableCell className="p-2">
                               <Link href={linkGenerator(transaction.voucherId)}>
                                  {transaction.voucherNo}
                                </Link>

                              </TableCell>
                              <TableCell className="p-2">
                                {transaction.date}
                              </TableCell>
                              <TableCell className="p-2">
                                {transaction.narration}
                              </TableCell>
                              <TableCell className="p-2">
                                {transaction.credit}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="text-right font-bold">
                  {report.closingBal?.map((bal, i) => (
                    <div key={i}>Closing Balance: {bal.balance}</div>
                  ))}
                </div>

                <div className="border rounded p-2 ml-auto w-1/2">
                  {/* <h3 className="font-bold mb-1">IOU List</h3> */}
                  {/* <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="p-2">IOU ID</TableHead>
                        <TableHead className="p-2">Employee</TableHead>
                        <TableHead className="p-2">Date</TableHead>
                        <TableHead className="p-2">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.IouBalance?.map((iou, i) => (
                        <TableRow key={i}>
                          <TableCell className="p-2">{iou.iouId}</TableCell>
                          <TableCell className="p-2">
                            {getEmployeeName(iou.employeeId)}
                          </TableCell>
                          <TableCell className="p-2">
                            {
                              new Date(iou.dateIssued)
                                .toISOString()
                                .split('T')[0]
                            }
                          </TableCell>

                          <TableCell className="p-2">{iou.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table> */}

                  <div className="mt-1 font-bold">
                    Total IOU:
                    {report.IouBalance?.reduce(
                      (sum, iou) => sum + (iou.amount || 0),
                      0
                    )}
                  </div>
                </div>

                <div className="border rounded p-2 ml-auto w-1/2">
                  <div className="font-bold mb-1">
                    Total Amount:
                    {(Number(report.closingBal?.[0]?.balance) || 0) -
                      (report.IouBalance?.reduce(
                        (sum, iou) => sum + (Number(iou.amount) || 0),
                        0
                      ) || 0)}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <h4 className="font-semibold mb-1">Money Note Count</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>1000 x</span>
                          <input
                            type="number"
                            className="w-20 border rounded p-1"
                          />
                          <span>=</span>
                          <input
                            type="number"
                            className="w-24 border rounded p-1"
                            readOnly
                          />
                        </div>
                        <div className="flex justify-between">
                          <span>500 x</span>
                          <input
                            type="number"
                            className="w-20 border rounded p-1"
                          />
                          <span>=</span>
                          <input
                            type="number"
                            className="w-24 border rounded p-1"
                            readOnly
                          />
                        </div>
                        <div className="flex justify-between">
                          <span>200 x</span>
                          <input
                            type="number"
                            className="w-20 border rounded p-1"
                          />
                          <span>=</span>
                          <input
                            type="number"
                            className="w-24 border rounded p-1"
                            readOnly
                          />
                        </div>
                        <div className="flex justify-between">
                          <span>100 x</span>
                          <input
                            type="number"
                            className="w-20 border rounded p-1"
                          />
                          <span>=</span>
                          <input
                            type="number"
                            className="w-24 border rounded p-1"
                            readOnly
                          />
                        </div>
                        <div className="flex justify-between">
                          <span>50 x</span>
                          <input
                            type="number"
                            className="w-20 border rounded p-1"
                          />
                          <span>=</span>
                          <input
                            type="number"
                            className="w-24 border rounded p-1"
                            readOnly
                          />
                        </div>
                        <div className="flex justify-between">
                          <span>20 x</span>
                          <input
                            type="number"
                            className="w-20 border rounded p-1"
                          />
                          <span>=</span>
                          <input
                            type="number"
                            className="w-24 border rounded p-1"
                            readOnly
                          />
                        </div>
                        <div className="flex justify-between">
                          <span>10 x</span>
                          <input
                            type="number"
                            className="w-20 border rounded p-1"
                          />
                          <span>=</span>
                          <input
                            type="number"
                            className="w-24 border rounded p-1"
                            readOnly
                          />
                        </div>
                        <div className="flex justify-between">
                          <span>5 x</span>
                          <input
                            type="number"
                            className="w-20 border rounded p-1"
                          />
                          <span>=</span>
                          <input
                            type="number"
                            className="w-24 border rounded p-1"
                            readOnly
                          />
                        </div>
                        <div className="flex justify-between">
                          <span>1 x</span>
                          <input
                            type="number"
                            className="w-20 border rounded p-1"
                          />
                          <span>=</span>
                          <input
                            type="number"
                            className="w-24 border rounded p-1"
                            readOnly
                          />
                        </div>
                        <div className="flex justify-between">
                          <span>Coins</span>
                          <input
                            type="number"
                            className="w-24 border rounded p-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CashReportList
