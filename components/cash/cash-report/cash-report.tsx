'use client'
import { Card, CardContent } from '@/components/ui/card'
import { useCallback, useEffect, useState } from 'react'
import { getCashReport } from '@/api/cash-report-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { Employee, GetCashReport, LocationData } from '@/utils/type'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import {
  getAllCompanies,
  getAllLocations,
  getEmployee,
} from '@/api/common-shared-api'
import { CompanyType } from '@/api/company-api'

export default function CashReport() {
  useInitializeUser()

  const [token] = useAtom(tokenAtom)
  const [cashReport, setCashReport] = useState<GetCashReport[]>([])
  const [fromDate, setFromDate] = useState<string>('2025-05-01')
  const [endDate, setEndDate] = useState<string>('2025-06-30')
  const [companyId, setCompanyId] = useState<number>(0)
  const [location, setLocation] = useState<number>(0)
  const [companies, setCompanies] = useState<CompanyType[]>([])
  const [locations, setLocations] = useState<LocationData[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const fetchCompanies = useCallback(async () => {
    if (!token) return
    const response = await getAllCompanies(token)
    setCompanies(response.data as CompanyType[])
  }, [token])

  const fetchLocations = useCallback(async () => {
    if (!token) return
    const response = await getAllLocations(token)
    setLocations(response.data as LocationData[])
  }, [token])

  const fetchEmployees = useCallback(async () => {
    if (!token) return
    const response = await getEmployee(token)
    setEmployees(response.data || [])
  }, [token])

  const fetchCashReport = useCallback(async () => {
    if (!token) return
    const CashReportParams = {
      fromDate,
      endDate,
      companyId,
      location,
    }
    const respons = await getCashReport(CashReportParams, token)
    setCashReport(
      Array.isArray(respons.data)
        ? respons.data
        : respons.data
          ? [respons.data]
          : []
    )
    console.log('This is cash report data: ', respons.data || [])
  }, [token, fromDate, endDate, companyId, location])

  useEffect(() => {
    fetchCashReport()
  }, [fetchCashReport])

  useEffect(() => {
    fetchCompanies()
    fetchLocations()
    fetchEmployees()
  }, [fetchCompanies, fetchLocations, fetchEmployees])

  const getEmployeeName = (id: number) => {
    const employee = employees.find((emp) => Number(emp.id) === id)
    return employee ? employee.employeeName : id
  }

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold mb-4 text-center">Cash Report</h1>

      <div className="grid grid-cols-4 gap-8 mb-4 px-4 mx-20">
        <div className="space-y-2">
          <Label className="text-sm font-medium">From Date</Label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full p-1 border rounded"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">End Date</Label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-1 border rounded"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Company</Label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(Number(e.target.value))}
            className="w-full p-1 border rounded"
          >
            <option value={0}>Select Company</option>
            {companies.map((company) => (
              <option key={company.companyId} value={company.companyId}>
                {company.companyName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Location</Label>
          <select
            value={location}
            onChange={(e) => setLocation(Number(e.target.value))}
            className="w-full p-1 border rounded"
          >
            <option value={0}>Select Location</option>
            {locations.map((loc) => (
              <option key={loc.locationId} value={loc.locationId}>
                {loc.address}
              </option>
            ))}
          </select>
        </div>
      </div>
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
                          <TableHead className="p-2">Voucher ID</TableHead>
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
                                {transaction.voucherId}
                              </TableCell>
                              <TableCell className="p-2">
                                {transaction.date}
                              </TableCell>
                              <TableCell className="p-2">
                                {transaction.oppositeAccountName}
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
                          <TableHead className="p-2">Voucher ID</TableHead>
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
                                {transaction.voucherId}
                              </TableCell>
                              <TableCell className="p-2">
                                {transaction.date}
                              </TableCell>
                              <TableCell className="p-2">
                                {transaction.oppositeAccountName}
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
                  <h3 className="font-bold mb-1">IOU List</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="p-2">Employee</TableHead>
                        <TableHead className="p-2">Due Date</TableHead>
                        <TableHead className="p-2">IOU ID</TableHead>
                        <TableHead className="p-2">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.IouBalance?.map((iou, i) => (
                        <TableRow key={i}>
                          <TableCell className="p-2">
                            {getEmployeeName(iou.employeeId)}
                          </TableCell>
                          <TableCell className="p-2">
                            {iou.dateIssued}
                          </TableCell>
                          <TableCell className="p-2">{iou.iouId}</TableCell>
                          <TableCell className="p-2">{iou.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-1 font-bold">
                    Total IOU:{' '}
                    {report.IouBalance?.reduce(
                      (sum, iou) => sum + (iou.amount || 0),
                      0
                    )}
                  </div>
                </div>

                <div className="border rounded p-2 ml-auto w-1/2">
                  <div className="font-bold mb-1">
                    Total Amount:{' '}
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
