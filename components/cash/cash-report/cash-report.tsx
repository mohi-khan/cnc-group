'use client'
import { Card, CardContent } from '@/components/ui/card'
import { useCallback, useEffect, useState } from 'react'
import { getCashReport } from '@/api/cash-report-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { CompanyFromLocalstorage, Employee, GetCashReport, LocationData, LocationFromLocalstorage, User } from '@/utils/type'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { getEmployee } from '@/api/common-shared-api'
import { CompanyType } from '@/api/company-api'
import { CustomCombobox } from '@/utils/custom-combobox'

export default function CashReport() {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const [cashReport, setCashReport] = useState<GetCashReport[]>([])
  const [fromDate, setFromDate] = useState<string>('2025-05-01')
  const [endDate, setEndDate] = useState<string>('2025-06-30')
  const [companyId, setCompanyId] = useState<number | undefined>()
  const [location, setLocation] = useState<number>()
   const [user, setUser] = useState<User | null>(null)
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
   const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

 useEffect(() => {
    if (userData) {
      setUser(userData)
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
      console.log('Current user from localStorage:', userData)
    }
  }, [userData])

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
      companyId: companyId !== undefined ? companyId : 0,
      location: location !== undefined ? location : 0,
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
    fetchEmployees()
  }, [fetchEmployees])

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
          <CustomCombobox
            value={
              companies
                .map((company) => ({
                  id: company.company?.companyId ?? 0,
                  name: company.company?.companyName,
                }))
                .find((item) => item.id === Number(companyId)) || null
            }
            onChange={(item) => setCompanyId(item ? Number(item.id) : 0)}
            items={companies.map((company) => ({
              id: company.company?.companyId !== undefined ? company.company.companyId : 0,
              name: company.company?.companyName,
            }))}
            placeholder="Select Company"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Location</Label>
          <CustomCombobox
            value={
              locations
                .map((location) => ({
                  id: location.location?.locationId ?? 0,
                  name: location.location?.address,
                }))
                .find((item) => item.id === location) || null
            }
            onChange={(item) => setLocation(item ? Number(item.id) : 0)}
            items={locations.map((location) => ({
              id: location.location?.locationId !== undefined ? location.location?.locationId : 0,
              name: location.location?.address,
            }))}
            placeholder="Select Location"
          />{' '}
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
