'use client'

import { useCallback, useEffect, useState } from 'react'
import type { AssetDepreciationReportType } from '@/utils/type'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { getAssetReport } from '@/api/asset-report-api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CustomCombobox } from '@/utils/custom-combobox'
import { toast } from '@/hooks/use-toast'
import { getAllCompanies } from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const AssetReport = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  //state variables
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<AssetDepreciationReportType[]>(
    []
  )
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [companyId, setCompanyId] = useState<number>(0)
  const [companies, setCompanies] = useState<any[]>([])
  const [dataFetched, setDataFetched] = useState(false)

  const fetchReportData = async () => {
    // Validate inputs before fetching
    if (!startDate || !endDate) {
      alert('Please select both start and end dates')
      return
    }

    setLoading(true)
    try {
      const data = await getAssetReport(companyId, startDate, endDate, token)
      console.log('🚀 ~ fetchReportData ~ data:', data.data)
      setReportData(
        Array.isArray(data.data)
          ? data.data
          : ([data.data].filter(
              (item): item is AssetDepreciationReportType => item !== null
            ) ?? [])
      )
      setDataFetched(true)
    } catch (error) {
      console.error('Failed to fetch asset report:', error)
      alert('Failed to fetch data. Please check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllCompanies = useCallback(async () => {
    try {
      const fetchedCompanies = await getAllCompanies(token)
      if (fetchedCompanies?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (fetchedCompanies.error || !fetchedCompanies.data) {
        console.error('Error getting companies:', fetchedCompanies.error)
        toast({
          title: 'Error',
          description:
            fetchedCompanies.error?.message || 'Failed to get companies',
          variant: 'destructive',
        })
      } else {
        setCompanies(fetchedCompanies.data)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch companies',
        variant: 'destructive',
      })
    }
  }, [token,router])

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        console.log('No user data or token found in localStorage')
        router.push('/')
        return
      }
      
    }

checkUserData()
    fetchAllCompanies()
  }, [fetchAllCompanies, router])

  return (
    <div className="w-[97%] mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Asset Depreciation Report</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Companies</span>
            <CustomCombobox
              items={companies.map((company) => {
                return {
                  id:
                    company.companyId?.toString() ||
                    company.id?.toString() ||
                    '',
                  name:
                    company.companyName || company.name || 'Unnamed Company',
                }
              })}
              value={
                companyId
                  ? {
                      id: companyId.toString(),
                      name:
                        companies.find(
                          (c) => (c.companyId || c.id) === companyId
                        )?.companyName ||
                        companies.find(
                          (c) => (c.companyId || c.id) === companyId
                        )?.name ||
                        '',
                    }
                  : null
              }
              onChange={(value) =>
                setCompanyId(value ? Number.parseInt(value.id, 10) : 0)
              }
              placeholder="Select company"
            />
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
            {/* {dataFetched && (
              <Button variant="outline" onClick={handleExportToExcel}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )} */}
          </div>
        </div>
      </div>
      <div>
        {dataFetched ? (
          <div className="overflow-x-auto mt-10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="border border-gray-300 bg-gray-100 font-medium">
                    Particulars
                  </TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 text-right font-medium">
                    Opening as on
                    <br />
                    01.07.xxxx
                  </TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 text-right font-medium">
                    Addition
                  </TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 text-right font-medium">
                    Total as on
                    <br />
                    31.12.xxxx
                  </TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 text-right font-medium">
                    Rate %
                  </TableHead>
                  <TableHead
                    colSpan={3}
                    className="border border-gray-300 bg-gray-100 text-center font-medium"
                  >
                    D E P R E C I A T I O N
                  </TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 text-right font-medium">
                    W.D.V as on
                    <br />
                    31.12.xxxx
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="border border-gray-300 bg-gray-100"></TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100"></TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100"></TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100"></TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100"></TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 text-right font-medium">
                    Opening as on
                    <br />
                    01.07.xxxx
                  </TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 text-right font-medium">
                    During the
                    <br />
                    Period
                  </TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 text-right font-medium">
                    Total as on
                    <br />
                    31.12.xxxx
                  </TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((asset, index) => (
                  <TableRow key={index}>
                    <TableCell className="border border-gray-300">
                      {asset.category_name}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-right">
                      {asset.opening_balance}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-right">
                      {Number.parseFloat(asset.addition_during_period) === 0
                        ? '-'
                        : asset.addition_during_period}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-right">
                      {asset.closing_balance}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-right">
                      {asset.rate}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-right">
                      {asset.dep_opening}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-right text-purple-700 font-medium">
                      {asset.dep_during_period}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-right">
                      {asset.dep_closing}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-right">
                      {asset.written_down_value}
                    </TableCell>
                  </TableRow>
                ))}
                {reportData.length > 0 && (
                  <TableRow className="bg-gray-50 font-bold">
                    <TableCell className="border border-gray-300 text-right">
                      Taka
                    </TableCell>
                    <TableCell className="border border-gray-300 text-right">
                      {calculateTotal(reportData, 'opening_balance')}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-right">
                      {calculateTotal(reportData, 'addition_during_period')}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-right">
                      {calculateTotal(reportData, 'closing_balance')}
                    </TableCell>
                    <TableCell className="border border-gray-300"></TableCell>
                    <TableCell className="border border-gray-300 text-right">
                      {calculateTotal(reportData, 'dep_opening')}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-right text-purple-700">
                      {calculateTotal(reportData, 'dep_during_period')}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-right">
                      {calculateTotal(reportData, 'dep_closing')}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-right">
                      {calculateTotal(reportData, 'written_down_value')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Please select a date range and click &quot;Generate Report&quot; to
            view data
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to calculate totals
function calculateTotal(
  data: AssetDepreciationReportType[],
  field: keyof AssetDepreciationReportType
): string {
  const total = data.reduce((sum, item) => {
    return sum + Number.parseFloat((item[field] as string) || '0')
  }, 0)

  return total.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default AssetReport
