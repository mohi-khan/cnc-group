"use client"

import { useState } from "react"
import type { AssetDepreciationReportType } from "@/utils/type"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAssetReport } from "@/api/asset-report-api"

const AssetReport = () => {
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<AssetDepreciationReportType[]>([])
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [companyId, setCompanyId] = useState<number>(75)
  const [dataFetched, setDataFetched] = useState(false)

//   // Use the provided token
//   const token =
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYwLCJ1c2VybmFtZSI6ImFraWx0YWp3YXIiLCJpYXQiOjE3NDQxODE3NDksImV4cCI6MTc0NDI2ODE0OX0.dPrt1RzBuMk2pM2JViCalF8UscBBQjMS_GnNriOo9cg"

    const mainToken = localStorage.getItem('authToken')
  console.log('🚀 ~ PaymentRequisition ~ mainToken:', mainToken)
  const token = `Bearer ${mainToken}`

  const fetchReportData = async () => {
    // Validate inputs before fetching
    if (!startDate || !endDate) {
      alert("Please select both start and end dates")
      return
    }

    setLoading(true)
    try {
      const data = await getAssetReport(companyId, startDate, endDate, token)
      console.log("🚀 ~ fetchReportData ~ data:", data.data)
      setReportData(Array.isArray(data.data) 
        ? data.data 
        : ([data.data].filter((item): item is AssetDepreciationReportType => item !== null) ?? []))
      setDataFetched(true)
    } catch (error) {
      console.error("Failed to fetch asset report:", error)
      alert("Failed to fetch data. Please check console for details.")
    } finally {
      setLoading(false)
    }
  }

  const handleExportToExcel = () => {
    // Implementation for exporting to Excel would go here
    console.log("Exporting to Excel...")
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-2xl font-bold">Asset Depreciation Report</CardTitle>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Company</span>
              <Select value={companyId.toString()} onValueChange={(value) => setCompanyId(Number.parseInt(value))}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="75">Company ID: 75</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">End Date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={fetchReportData} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Report
              </Button>
              {dataFetched && (
                <Button variant="outline" onClick={handleExportToExcel}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {dataFetched ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 bg-gray-100 p-2 text-left">Particulars</th>
                    <th className="border border-gray-300 bg-gray-100 p-2 text-right">
                      Opening as on
                      <br />
                      01.07.xxxx
                    </th>
                    <th className="border border-gray-300 bg-gray-100 p-2 text-right">Addition</th>
                    <th className="border border-gray-300 bg-gray-100 p-2 text-right">
                      Total as on
                      <br />
                      31.12.xxxx
                    </th>
                    <th className="border border-gray-300 bg-gray-100 p-2 text-right">Rate %</th>
                    <th colSpan={3} className="border border-gray-300 bg-gray-100 p-2 text-center">
                      D E P R E C I A T I O N
                    </th>
                    <th className="border border-gray-300 bg-gray-100 p-2 text-right">
                      W.D.V as on
                      <br />
                      31.12.xxxx
                    </th>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 bg-gray-100 p-2"></th>
                    <th className="border border-gray-300 bg-gray-100 p-2"></th>
                    <th className="border border-gray-300 bg-gray-100 p-2"></th>
                    <th className="border border-gray-300 bg-gray-100 p-2"></th>
                    <th className="border border-gray-300 bg-gray-100 p-2"></th>
                    <th className="border border-gray-300 bg-gray-100 p-2 text-right">
                      Opening as on
                      <br />
                      01.07.xxxx
                    </th>
                    <th className="border border-gray-300 bg-gray-100 p-2 text-right">
                      During the
                      <br />
                      Period
                    </th>
                    <th className="border border-gray-300 bg-gray-100 p-2 text-right">
                      Total as on
                      <br />
                      31.12.xxxx
                    </th>
                    <th className="border border-gray-300 bg-gray-100 p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((asset, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">{asset.category_name}</td>
                      <td className="border border-gray-300 p-2 text-right">{asset.opening_balance}</td>
                      <td className="border border-gray-300 p-2 text-right">
                        {Number.parseFloat(asset.addition_during_period) === 0 ? "-" : asset.addition_during_period}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">{asset.closing_balance}</td>
                      <td className="border border-gray-300 p-2 text-right">{asset.rate}</td>
                      <td className="border border-gray-300 p-2 text-right">{asset.dep_opening}</td>
                      <td className="border border-gray-300 p-2 text-right text-purple-700 font-medium">
                        {asset.dep_during_period}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">{asset.dep_closing}</td>
                      <td className="border border-gray-300 p-2 text-right">{asset.written_down_value}</td>
                    </tr>
                  ))}
                  {reportData.length > 0 && (
                    <tr className="bg-gray-50 font-bold">
                      <td className="border border-gray-300 p-2 text-right">Taka</td>
                      <td className="border border-gray-300 p-2 text-right">
                        {calculateTotal(reportData, "opening_balance")}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {calculateTotal(reportData, "addition_during_period")}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {calculateTotal(reportData, "closing_balance")}
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2 text-right">
                        {calculateTotal(reportData, "dep_opening")}
                      </td>
                      <td className="border border-gray-300 p-2 text-right text-purple-700">
                        {calculateTotal(reportData, "dep_during_period")}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {calculateTotal(reportData, "dep_closing")}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {calculateTotal(reportData, "written_down_value")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Please select a date range and click "Generate Report" to view data
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to calculate totals
function calculateTotal(data: AssetDepreciationReportType[], field: keyof AssetDepreciationReportType): string {
  const total = data.reduce((sum, item) => {
    return sum + Number.parseFloat((item[field] as string) || "0")
  }, 0)

  return total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default AssetReport
