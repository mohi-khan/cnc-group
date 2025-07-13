'use client'
import React, { useCallback, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
} from 'recharts'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  getAllDepartments,
  getCostBreakdown,
  getExpenseData,
  getFundPosition,
  getGPData,
  getIncomeData,
  getNPData,
} from '@/api/dashboard-api'
import type {
  ApproveAdvanceType,
  FundPositionType,
  GetCostBreakdownType,
  GetDepartment,
  GEtExpenseDataType,
  GetPaymentOrder,
} from '@/utils/type'
import Link from 'next/link'
import { getAllPaymentRequisition } from '@/api/payment-requisition-api'
import { getAllAdvance } from '@/api/approve-advance-api'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@radix-ui/react-hover-card'
import { toast } from '@/hooks/use-toast'
import { CustomCombobox } from '@/utils/custom-combobox'
import type { CompanyType } from '@/api/company-api'
import { getAllCompanies } from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const formatInternationalNumber = (num: number): string => {
  const absNum = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  if (absNum < 1000) {
    // Show as is
    return `${sign}${absNum}`
  } else if (absNum < 1_000_000) {
    // Thousand
    const value = absNum / 1_000
    return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}K`
  } else if (absNum < 1_000_000_000) {
    // Million
    const value = absNum / 1_000_000
    return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)}M`
  } else if (absNum < 1_000_000_000_000) {
    // Billion
    const value = absNum / 1_000_000_000
    return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)}B`
  } else {
    // Trillion and above
    const value = absNum / 1_000_000_000_000
    return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)}T`
  }
}

// Dummy data for other charts (unchanged)
const inventoryData = [
  { date: 'Jan 25', rawMaterials: 120, color: 45, packaging: 30 },
  { date: 'Feb 25', rawMaterials: 130, color: 35, packaging: 25 },
  { date: 'Mar 25', rawMaterials: 115, color: 40, packaging: 35 },
  { date: 'Apr 25', rawMaterials: 140, color: 30, packaging: 28 },
  { date: 'May 25', rawMaterials: 125, color: 50, packaging: 32 },
  { date: 'Jun 25', rawMaterials: 110, color: 45, packaging: 27 },
]

const costBreakdownData = [
  { financialTag: 'Raw Material Cost', balance: 8000000 },
  { financialTag: 'Labor Cost', balance: 5000000 },
  { financialTag: 'Packaging Cost', balance: 3000000 },
  { financialTag: 'Other Costs', balance: 2000000 },
]

export default function Dashboard() {
  //getting userData from jotai atom component
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const router = useRouter()
  const [userData] = useAtom(userDataAtom)

  // Dynamic form state
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(3)
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [yearlyStartDate, setYearlyStartDate] = useState<string>('2025-01-01')
  const [yearlyEndDate, setYearlyEndDate] = useState<string>('2025-12-31')
  const [fundPositionMonth, setFundPositionMonth] = useState<string>('02')
  const [fundPositionDate, setFundPositionDate] = useState<string>('2025-02-19')

  const [fundPositionData, setFundPositionData] =
    React.useState<FundPositionType | null>(null)
  const [advances, setAdvances] = useState<ApproveAdvanceType[]>([])
  const [invoices, setInvoices] = useState<GetPaymentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expenseData, setExpenseData] = useState<GEtExpenseDataType[]>([])
  const [expenseDataYearly, setExpenseDataYearly] = useState<
    GEtExpenseDataType[]
  >([])
  const [incomeData, setIncomeData] = useState<GEtExpenseDataType[]>([])
  const [incomeDataYearly, setIncomeDataYearly] = useState<
    GEtExpenseDataType[]
  >([])
  const [gpData, setGPData] = useState<GEtExpenseDataType[]>([])
  const [gpDataYearly, setGPDataYearly] = useState<GEtExpenseDataType[]>([])
  const [npData, setNPData] = useState<GEtExpenseDataType[]>([])
  const [npDataYearly, setNPDataYearly] = useState<GEtExpenseDataType[]>([])
  const [department, setDepartments] = useState<GetDepartment[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(3)
  const [costBreakdown, setCostBreakdown] = useState<GetCostBreakdownType[]>([])
  const [getCompany, setGetCompany] = useState<CompanyType[]>([])

  console.log('🚀 ~ AssetDepreciation ~ token:', token)

  const fetchFundPosition = React.useCallback(async () => {
    try {
      const data = await getFundPosition(
        selectedCompanyId,
        fundPositionDate,
        fundPositionMonth,
        token
      )
      console.log('Fetched fund position data:', data)
      setFundPositionData(data.data)
    } catch (error) {
      console.error('Error fetching fund position data:', error)
    }
  }, [selectedCompanyId, fundPositionDate, fundPositionMonth, token])

  // Fetch Departments
  const fetchDepartments = React.useCallback(async () => {
    if (!token) return
    const data = await getAllDepartments(token)
    if (data.error || !data.data) {
      console.error('Error getting departments:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get departments',
      })
    } else {
      setDepartments(data.data)
    }
  }, [token])

  const fetchRequisitions = React.useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      const data = await getAllPaymentRequisition({
        companyId: selectedCompanyId,
        token: token,
      })
      const filteredInvoices =
        data.data?.filter((req) => req.status === 'Invoice Created') || []
      setInvoices(filteredInvoices)
      console.log('🚀 ~ fetchRequisitions ~ data:', data.data)
    } catch (err) {
      setError('Failed to fetch requisitions')
    } finally {
      setLoading(false)
    }
  }, [token, selectedCompanyId])

  const fetchAdvances = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null) // Reset error state
      const data = await getAllAdvance(token)
      setAdvances(Array.isArray(data?.data) ? data.data : []) // Ensure it's always an array
      console.log('🚀 ~ fetchAdvances ~ data.data:', data.data)
    } catch (err) {
      console.error('Error fetching advances:', err)
      setError('Failed to fetch advance requests')
      setAdvances([]) // Ensure UI still works
    } finally {
      setLoading(false)
    }
  }, [token])

  // Get All company function
  const fetchAllCompany = React.useCallback(async () => {
    const response = await getAllCompanies(token)
    console.log('🚀 ~ fetchAllCompany ~ response from dashboard :', response)
    setGetCompany(response.data || [])
  }, [token])

  //  Get Expense data monthly
  const fetchExpenseData = React.useCallback(async () => {
    const response = await getExpenseData(
      selectedCompanyId,
      startDate,
      endDate,
      token
    )
    if (response.data) {
      setExpenseData(
        Array.isArray(response.data) ? response.data : [response.data]
      )
    } else {
      setExpenseData([])
    }
    console.log('🚀 ~ getExpectedRevenue ~ response:', response)
  }, [selectedCompanyId, startDate, endDate, token])

  //  Get Expense data yearly
  const fetchExpenseDataYearly = React.useCallback(async () => {
    const response = await getExpenseData(
      selectedCompanyId,
      yearlyStartDate,
      yearlyEndDate,
      token
    )
    if (response.data) {
      setExpenseDataYearly(
        Array.isArray(response.data) ? response.data : [response.data]
      )
    } else {
      setExpenseDataYearly([])
    }
    console.log('🚀 ~ getExpectedRevenue ~ response:', response)
  }, [selectedCompanyId, yearlyStartDate, yearlyEndDate, token])

  // Get Income Data
  const fetchIncomeData = React.useCallback(async () => {
    const response = await getIncomeData(
      selectedCompanyId,
      startDate,
      endDate,
      token
    )
    if (response.data) {
      setIncomeData(
        Array.isArray(response.data) ? response.data : [response.data]
      )
    } else {
      setIncomeData([])
    }
    console.log('🚀 ~ getIncomeData  ~ response:', response)
  }, [selectedCompanyId, startDate, endDate, token])

  // Get Income Data yearly
  const fetchIncomeDataYearly = React.useCallback(async () => {
    const response = await getIncomeData(
      selectedCompanyId,
      yearlyStartDate,
      yearlyEndDate,
      token
    )
    if (response.data) {
      setIncomeDataYearly(
        Array.isArray(response.data) ? response.data : [response.data]
      )
    } else {
      setIncomeDataYearly([])
    }
    console.log('🚀 ~ getIncomeData  ~ response:', response)
  }, [selectedCompanyId, yearlyStartDate, yearlyEndDate, token])

  //Get getGPData
  const fetchGPData = React.useCallback(async () => {
    const response = await getGPData(
      selectedCompanyId,
      startDate,
      endDate,
      token
    )
    if (response.data) {
      setGPData(Array.isArray(response.data) ? response.data : [response.data])
    } else {
      setGPData([])
    }
    console.log('🚀 ~ GetGPData   ~ response:', response.data)
  }, [selectedCompanyId, startDate, endDate, token])

  //Get getGPData yearly
  const fetchGPDataYearly = React.useCallback(async () => {
    const response = await getGPData(
      selectedCompanyId,
      yearlyStartDate,
      yearlyEndDate,
      token
    )
    if (response.data) {
      setGPDataYearly(
        Array.isArray(response.data) ? response.data : [response.data]
      )
    } else {
      setGPDataYearly([])
    }
    console.log('🚀 ~ GetGPData   ~ response:', response)
  }, [selectedCompanyId, yearlyStartDate, yearlyEndDate, token])

  //Get getNPData
  const fetchNPData = React.useCallback(async () => {
    const response = await getNPData(
      selectedCompanyId,
      yearlyStartDate,
      yearlyEndDate,
      token
    )
    if (response.data) {
      setNPData(Array.isArray(response.data) ? response.data : [response.data])
    } else {
      setNPData([])
    }
    console.log('🚀 ~ GetNPData   ~ response:', response)
  }, [selectedCompanyId, yearlyStartDate, yearlyEndDate, token])

  //Get getNPData yearly
  const fetchNPDataYearly = React.useCallback(async () => {
    const response = await getNPData(
      selectedCompanyId,
      yearlyStartDate,
      yearlyEndDate,
      token
    )
    if (response.data) {
      setNPDataYearly(
        Array.isArray(response.data) ? response.data : [response.data]
      )
    } else {
      setNPDataYearly([])
    }
    console.log('🚀 ~ GetNPData   ~ response:', response)
  }, [selectedCompanyId, yearlyStartDate, yearlyEndDate, token])

  //Get Cost Breakdown Data
  const fetchCostBreakdown = React.useCallback(async () => {
    const departmentId = selectedDepartment || 0
    const response = await getCostBreakdown(
      departmentId,
      yearlyStartDate,
      yearlyEndDate,
      selectedCompanyId,
      token
    )
    if (response.data) {
      setCostBreakdown(
        Array.isArray(response.data) ? response.data : [response.data]
      )
    } else {
      setCostBreakdown([])
    }
    console.log('🚀 ~ GetCostBreakdown ~ response:', response)
  }, [
    selectedDepartment,
    yearlyStartDate,
    yearlyEndDate,
    selectedCompanyId,
    token,
  ])

  const processedFundPositionData = React.useMemo(() => {
    if (!fundPositionData) return []
    console.log('Processing fund position data:', fundPositionData)
    const dates = ['01/01/2025', '01/12/2025'] // We know there are two dates
    return dates.map((date) => {
      const cashBalance = fundPositionData.cashBalance
        .filter((item) => item.date === date)
        .reduce(
          (sum, item) => sum + (Number.parseFloat(item.balance || '0') || 0),
          0
        )
      const bankBalance = fundPositionData.BankBalance.flat()
        .filter((item) => item.date === date)
        .reduce(
          (sum, item) => sum + (Number.parseFloat(item.balance || '0') || 0),
          0
        )
      console.log(`Date: ${date}, Cash: ${cashBalance}, Bank: ${bankBalance}`)
      const [month, day, year] = date.split('/')
      return {
        date: `${month}/${day}`,
        cashBalance,
        bankBalance,
        netBalance: cashBalance + bankBalance,
      }
    })
  }, [fundPositionData])

  // Function to handle date changes and refetch data
  const handleDateChange = useCallback(() => {
    fetchFundPosition()
    fetchExpenseData()
    fetchIncomeData()
    fetchGPData()
  }, [fetchFundPosition, fetchExpenseData, fetchIncomeData, fetchGPData])

  const handleYearlyDateChange = useCallback(() => {
    fetchExpenseDataYearly()
    fetchIncomeDataYearly()
    fetchGPDataYearly()
    fetchNPData()
    fetchNPDataYearly()
    fetchCostBreakdown()
  }, [
    fetchExpenseDataYearly,
    fetchIncomeDataYearly,
    fetchGPDataYearly,
    fetchNPData,
    fetchNPDataYearly,
    fetchCostBreakdown,
  ])

  const handleCompanyChange = useCallback(() => {
    fetchRequisitions()
    fetchFundPosition()
    fetchExpenseData()
    fetchExpenseDataYearly()
    fetchIncomeData()
    fetchIncomeDataYearly()
    fetchGPData()
    fetchGPDataYearly()
    fetchNPData()
    fetchNPDataYearly()
    fetchCostBreakdown()
  }, [
    fetchRequisitions,
    fetchFundPosition,
    fetchExpenseData,
    fetchExpenseDataYearly,
    fetchIncomeData,
    fetchIncomeDataYearly,
    fetchGPData,
    fetchGPDataYearly,
    fetchNPData,
    fetchNPDataYearly,
    fetchCostBreakdown,
  ])

  React.useEffect(() => {
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
    fetchAdvances()
    fetchDepartments()
    fetchAllCompany()
  }, [token, fetchAdvances, fetchDepartments, fetchAllCompany])

  // Trigger data fetch when dynamic values change
  React.useEffect(() => {
    if (token && selectedCompanyId) {
      handleCompanyChange()
    }
  }, [selectedCompanyId, token, handleCompanyChange])

  React.useEffect(() => {
    if (token) {
      handleDateChange()
    }
  }, [startDate, endDate, token, handleDateChange])

  React.useEffect(() => {
    if (token) {
      handleYearlyDateChange()
    }
  }, [yearlyStartDate, yearlyEndDate, token, handleYearlyDateChange])

  React.useEffect(() => {
    if (token && selectedDepartment !== null) {
      fetchCostBreakdown()
    }
  }, [selectedDepartment, token, fetchCostBreakdown])

  console.log('Processed fund position data:', processedFundPositionData)

  // Calculate total netexpense
  const totalExpense = expenseData?.reduce(
    (acc, expense) => acc + (expense?.netExpense || 0),
    0
  )

  // calculate total expense yearly
  const totalExpenseYearly = expenseDataYearly?.reduce(
    (acc, expense) => acc + (expense?.netExpense || 0),
    0
  )

  // Calculate total lastmonth expense
  const lastMonthExpense = expenseData?.reduce(
    (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
    0
  )

  // calculate total lastmonth expense yearly
  const lastMonthExpenseYearly = expenseDataYearly?.reduce(
    (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
    0
  )

  // Calculate total thismonth expense
  const expensePercentageChange =
    lastMonthExpense !== 0 ? (totalExpense - lastMonthExpense) / 100 : 0

  // Calculate total thismonth expense yearly
  const expensePercentageChangeYearly =
    lastMonthExpenseYearly !== 0
      ? (totalExpenseYearly - lastMonthExpenseYearly) / 100
      : 0

  // Calculate total income
  const totalIncome = incomeData?.reduce(
    (acc, expense) => acc + (expense?.netExpense || 0),
    0
  )

  // calculate total income yearly
  const totalIncomeYearly = incomeDataYearly?.reduce(
    (acc, expense) => acc + (expense?.netExpense || 0),
    0
  )

  // Calculate total lastmonth income
  const lastMonthIncome = incomeData?.reduce(
    (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
    0
  )

  // calculate total lastmonth income yearly
  const lastMonthIncomeYearly = incomeDataYearly?.reduce(
    (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
    0
  )

  // Calculate total thismonth income
  const incomePercentageChange =
    lastMonthExpense !== 0 ? (totalIncome - lastMonthIncome) / 100 : 0

  // Calculate total thismonth income yearly
  const incomePercentageChangeYearly =
    lastMonthExpenseYearly !== 0
      ? (totalIncomeYearly - lastMonthIncomeYearly) / 100
      : 0

  // Calculate total GP
  const totalGP = gpData?.reduce(
    (acc, expense) => acc + (expense?.netExpense || 0),
    0
  )

  // calculate total GP yearly
  const totalGPYearly = gpDataYearly?.reduce(
    (acc, expense) => acc + (expense?.netExpense || 0),
    0
  )

  // Calculate total lastmonth GP
  const lastMonthGP = gpData?.reduce(
    (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
    0
  )

  // calculate total lastmonth GP yearly
  const lastMonthGPYearly = gpDataYearly?.reduce(
    (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
    0
  )

  // Calculate total thismonth GP
  const gpPercentageChange =
    lastMonthExpense !== 0 ? (totalGP - lastMonthGP) / 100 : 0

  // Calculate total thismonth GP yearly
  const gpPercentageChangeYearly =
    lastMonthExpenseYearly !== 0 ? (totalGPYearly - lastMonthGPYearly) / 100 : 0

  // Calculate total NP
  const totalNP = npData?.reduce(
    (acc, expense) => acc + (expense?.netExpense || 0),
    0
  )

  // calculate total NP yearly
  const totalNPYearly = npDataYearly?.reduce(
    (acc, expense) => acc + (expense?.netExpense || 0),
    0
  )

  // Calculate total
  const lastMonthNP = npData?.reduce(
    (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
    0
  )

  // calculate total lastmonth NP yearly
  const lastMonthNPYearly = npDataYearly?.reduce(
    (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
    0
  )

  // Calculate total thismonth NP
  const npPercentageChange =
    lastMonthExpense !== 0 ? (totalNP - lastMonthNP) / 100 : 0

  // Calculate total thismonth NP yearly
  const npPercentageChangeYearly =
    lastMonthExpenseYearly !== 0 ? (totalNPYearly - lastMonthNPYearly) / 100 : 0

  function handleDepartmentChange(departmentId: number | null): void {
    setSelectedDepartment(departmentId)
  }

  function handleCompanySelection(companyId: number | null): void {
    if (companyId) {
      setSelectedCompanyId(companyId)
    }
  }

  // Function to handle Pie Chart Click
  interface PieEntry {
    financialTag: string
  }

  const handlePieClick = (entry: PieEntry) => {
    const financialTag = entry.financialTag
    if (financialTag === 'Asset') {
      window.location.href = `dashboard/cost-breakdown-details/${financialTag}`
    } else if (financialTag === 'Gross Profit') {
      window.location.href = `dashboard/cost-breakdown-details/${financialTag}`
    } else {
      window.location.href = `dashboard/cost-breakdown-details/${financialTag}`
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-20">
          <CustomCombobox
            items={getCompany.map((company) => ({
              id: (company.companyId ?? '').toString(),
              name: company.companyName || 'Unnamed Company',
            }))}
            value={
              selectedCompanyId
                ? {
                    id: selectedCompanyId.toString(),
                    name:
                      getCompany.find(
                        (company) => company.companyId === selectedCompanyId
                      )?.companyName || 'Unnamed Company',
                  }
                : null
            }
            onChange={(value: { id: string; name: string } | null) =>
              handleCompanySelection(
                value ? Number.parseInt(value.id, 10) : null
              )
            }
            placeholder="Select company"
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="px-3 py-1 border rounded-md text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <ChevronDown className="h-4 w-4" />
            <input
              type="date"
              className="px-3 py-1 border rounded-md text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Link href="/approve-advance">
          <Card className="p-3 text-center">
            You have {advances.length} pending advance approvals
          </Card>
        </Link>
        <Link href="/approve-invoice">
          <Card className="p-3 text-center">
            You have {invoices.length} pending invoice approvals
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="grid grid-cols-4 w-fit gap-4 col-span-3">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base ">
                    Current Month Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatInternationalNumber(totalIncome)}
                  </div>
                  <p
                    className={`text-xs ${incomePercentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {incomePercentageChange}% vs prev
                  </p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-4 z-10">
              <div>
                <table className="w-full table-auto text-sm">
                  <thead className="bg-slate-400">
                    <tr>
                      <th className="text-left p-2 text-sm">Group Name</th>
                      <th className="text-left p-2 text-sm">This Month</th>
                      <th className="text-left p-2 text-sm">Last Month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeData.map((expense, index) => (
                      <tr key={index} className="bg-slate-300 border-b">
                        <td className="p-2 text-sm">{expense.groupName}</td>
                        <td className="p-2 text-sm">{expense.netExpense}</td>
                        <td className="p-2 text-sm">
                          {expense.lastMonthNetExpense}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base ">
                    Current Month Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatInternationalNumber(totalExpense)}
                  </div>
                  <p
                    className={`text-xs ${expensePercentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {expensePercentageChange}% vs prev
                  </p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-4 z-10">
              <div>
                <table className="w-full table-auto text-sm">
                  <thead className="bg-slate-400">
                    <tr>
                      <th className="text-left p-2 text-sm">Group Name</th>
                      <th className="text-left p-2 text-sm">This Month</th>
                      <th className="text-left p-2 text-sm">Last Month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseData.map((expense, index) => (
                      <tr key={index} className="bg-slate-300 border-b">
                        <td className="p-2 text-sm">{expense.groupName}</td>
                        <td className="p-2 text-sm">{expense.netExpense}</td>
                        <td className="p-2 text-sm">
                          {expense.lastMonthNetExpense}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base ">
                    Current Month Gross Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatInternationalNumber(totalGP)}
                  </div>
                  <p
                    className={`text-xs ${gpPercentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {gpPercentageChange}% vs prev
                  </p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-4 z-10">
              <div>
                <table className="w-full table-auto text-sm">
                  <thead className="bg-slate-400">
                    <tr>
                      <th className="text-left p-2 text-sm">Group Name</th>
                      <th className="text-left p-2 text-sm">This Month</th>
                      <th className="text-left p-2 text-sm">Last Month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gpData.map((expense, index) => (
                      <tr key={index} className="bg-slate-300 border-b">
                        <td className="p-2 text-sm">{expense.groupName}</td>
                        <td className="p-2 text-sm">{expense.netExpense}</td>
                        <td className="p-2 text-sm">
                          {expense.lastMonthNetExpense}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base ">
                    Current Month Net Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatInternationalNumber(totalNP)}
                  </div>
                  <p
                    className={`text-xs ${npPercentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {npPercentageChange}% vs prev
                  </p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-4 z-10">
              <div>
                <table className="w-full table-auto text-sm">
                  <thead className="bg-slate-400">
                    <tr>
                      <th className="text-left p-2 text-sm">Group Name</th>
                      <th className="text-left p-2 text-sm">This Month</th>
                      <th className="text-left p-2 text-sm">Last Month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {npData.map((expense, index) => (
                      <tr key={index} className="bg-slate-300 border-b">
                        <td className="p-2 text-sm">{expense.groupName}</td>
                        <td className="p-2 text-sm">{expense.netExpense}</td>
                        <td className="p-2 text-sm">
                          {expense.lastMonthNetExpense}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base ">
                    Current Financial Year Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatInternationalNumber(totalIncomeYearly)}
                  </div>
                  <p
                    className={`text-xs ${npPercentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {incomePercentageChangeYearly}% vs prev
                  </p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-4 z-10">
              <div>
                <table className="w-full table-auto text-sm">
                  <thead className="bg-slate-400">
                    <tr>
                      <th className="text-left p-2 text-sm">Group Name</th>
                      <th className="text-left p-2 text-sm">This Month</th>
                      <th className="text-left p-2 text-sm">Last Month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeDataYearly.map((expense, index) => (
                      <tr key={index} className="bg-slate-300 border-b">
                        <td className="p-2 text-sm">{expense.groupName}</td>
                        <td className="p-2 text-sm">{expense.netExpense}</td>
                        <td className="p-2 text-sm">
                          {expense.lastMonthNetExpense}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base ">
                    Current Financial Year Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatInternationalNumber(totalExpenseYearly)}
                  </div>
                  <p
                    className={`text-xs ${expensePercentageChangeYearly >= 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {expensePercentageChangeYearly}% vs prev
                  </p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-4 z-10">
              <div>
                <table className="w-full table-auto text-sm">
                  <thead className="bg-slate-400">
                    <tr>
                      <th className="text-left p-2 text-sm">Group Name</th>
                      <th className="text-left p-2 text-sm">This Month</th>
                      <th className="text-left p-2 text-sm">Last Month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseDataYearly.map((expense, index) => (
                      <tr key={index} className="bg-slate-300 border-b">
                        <td className="p-2 text-sm">{expense.groupName}</td>
                        <td className="p-2 text-sm">{expense.netExpense}</td>
                        <td className="p-2 text-sm">
                          {expense.lastMonthNetExpense}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base ">
                    Current Financial Year Gross Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatInternationalNumber(totalGPYearly)}
                  </div>
                  <p
                    className={`text-xs ${expensePercentageChangeYearly >= 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {gpPercentageChangeYearly}% vs prev
                  </p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-4 z-10">
              <div>
                <table className="w-full table-auto text-sm">
                  <thead className="bg-slate-400">
                    <tr>
                      <th className="text-left p-2 text-sm">Group Name</th>
                      <th className="text-left p-2 text-sm">This Month</th>
                      <th className="text-left p-2 text-sm">Last Month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gpDataYearly.map((expense, index) => (
                      <tr key={index} className="bg-slate-300 border-b">
                        <td className="p-2 text-sm">{expense.groupName}</td>
                        <td className="p-2 text-sm">{expense.netExpense}</td>
                        <td className="p-2 text-sm">
                          {expense.lastMonthNetExpense}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base ">
                    Current Financial Year Net Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatInternationalNumber(totalNPYearly)}
                  </div>
                  <p
                    className={`text-xs ${expensePercentageChangeYearly >= 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {npPercentageChangeYearly}% vs prev
                  </p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-4 z-10">
              <div>
                <table className="w-full table-auto text-sm">
                  <thead className="bg-slate-400">
                    <tr>
                      <th className="text-left p-2 text-sm">Group Name</th>
                      <th className="text-left p-2 text-sm">This Month</th>
                      <th className="text-left p-2 text-sm">Last Month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {npDataYearly.map((expense, index) => (
                      <tr key={index} className="bg-slate-300 border-b">
                        <td className="p-2 text-sm">{expense.groupName}</td>
                        <td className="p-2 text-sm">{expense.netExpense}</td>
                        <td className="p-2 text-sm">
                          {expense.lastMonthNetExpense}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        <Card className="lg:col-span-1 ">
          <CardHeader>
            <div className="flex items-center justify-between gap-1">
              <CardTitle className="text-sm">Cost Breakdown</CardTitle>
              <CustomCombobox
                items={department
                  .filter(
                    (dept) =>
                      dept.isActive && dept.companyCode === selectedCompanyId
                  )
                  .map((dept) => ({
                    id: dept.departmentID.toString(),
                    name: dept.departmentName || 'Unnamed Department',
                  }))}
                value={
                  selectedDepartment
                    ? {
                        id: selectedDepartment.toString(),
                        name:
                          department.find(
                            (d) => d.departmentID === selectedDepartment
                          )?.departmentName || '',
                      }
                    : null
                }
                onChange={(value) =>
                  handleDepartmentChange(
                    value ? Number.parseInt(value.id, 10) : null
                  )
                }
                placeholder="Select department"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: 'Cost', color: 'hsl(252, 100%, 70%)' },
              }}
            >
              {costBreakdown && costBreakdown.length > 0 ? (
                <PieChart width={300} height={300}>
                  <Pie
                    data={costBreakdown.map((item) => ({
                      ...item,
                      balance: Math.abs(
                        Number.parseFloat(item.balance.toString())
                      ),
                    }))}
                    dataKey="balance"
                    nameKey="financialTag"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="hsl(252, 100%, 70%)"
                    label
                    onClick={handlePieClick} // Click event to navigate
                    cursor="pointer"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 1
                            ? 'hsl(120, 100%, 30%)'
                            : `hsl(${index * 60}, 100%, 70%)`
                        }
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <div className="flex h-[300px] items-center justify-center">
                  No data available
                </div>
              )}
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="">
          <CardHeader>
            <CardTitle>Fund Position</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                cashBalance: {
                  label: 'Cash Balance',
                  color: 'hsl(252, 100%, 70%)',
                },
                bankBalance: {
                  label: 'Bank Balance',
                  color: 'hsl(180, 100%, 70%)',
                },
                netBalance: {
                  label: 'Net Balance',
                  color: 'hsl(0, 100%, 70%)',
                },
              }}
            >
              <LineChart
                data={processedFundPositionData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                width={600}
                height={300}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cashBalance"
                  stroke="hsl(252, 100%, 70%)"
                  strokeWidth={2}
                  dot={{
                    stroke: 'hsl(252, 100%, 70%)',
                    fill: 'white',
                    strokeWidth: 2,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="bankBalance"
                  stroke="hsl(180, 100%, 70%)"
                  strokeWidth={2}
                  dot={{
                    stroke: 'hsl(180, 100%, 70%)',
                    fill: 'white',
                    strokeWidth: 2,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="netBalance"
                  stroke="hsl(0, 100%, 70%)"
                  strokeWidth={2}
                  dot={{
                    stroke: 'hsl(0, 100%, 70%)',
                    fill: 'white',
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader>
            <CardTitle>Inventory Turnover</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                rawMaterials: {
                  label: 'Raw Materials',
                  color: 'hsl(252, 100%, 70%)',
                },
                color: {
                  label: 'Color',
                  color: 'hsl(180, 100%, 70%)',
                },
                packaging: {
                  label: 'Packaging',
                  color: 'hsl(0, 100%, 70%)',
                },
              }}
            >
              <AreaChart
                data={inventoryData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                width={900}
                height={300}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="rawMaterials"
                  stackId="1"
                  stroke="hsl(252, 100%, 70%)"
                  fill="hsl(252, 100%, 70%)"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="color"
                  stackId="1"
                  stroke="hsl(180, 100%, 70%)"
                  fill="hsl(180, 100%, 70%)"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="packaging"
                  stackId="1"
                  stroke="hsl(0, 100%, 70%)"
                  fill="hsl(0, 100%, 70%)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// 'use client'

// import React, { useCallback, useEffect, useState } from 'react'
// import {
//   CartesianGrid,
//   Line,
//   LineChart,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   Area,
//   AreaChart,
//   Pie,
//   PieChart,
//   Cell,
// } from 'recharts'
// import { ChevronDown } from 'lucide-react'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from '@/components/ui/chart'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import {
//   getAllDepartments,
//   getCostBreakdown,
//   getExpenseData,
//   getFundPosition,
//   getGPData,
//   getIncomeData,
//   getNPData,
// } from '@/api/dashboard-api'
// import type {
//   ApproveAdvanceType,
//   FundPositionType,
//   GetCostBreakdownType,
//   GetDepartment,
//   GEtExpenseDataType,
//   GetPaymentOrder,
// } from '@/utils/type'
// import Link from 'next/link'
// import { getAllPaymentRequisition } from '@/api/payment-requisition-api'
// import { getAllAdvance } from '@/api/approve-advance-api'
// import {
//   HoverCard,
//   HoverCardContent,
//   HoverCardTrigger,
// } from '@radix-ui/react-hover-card'
// import { toast } from '@/hooks/use-toast'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import { CompanyType } from '@/api/company-api'
// import { getAllCompanies } from '@/api/common-shared-api'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { useRouter } from 'next/navigation'

// const formatInternationalNumber = (num: number): string => {
//   const absNum = Math.abs(num)
//   const sign = num < 0 ? '-' : ''

//   if (absNum < 1000) {
//     // Show as is
//     return `${sign}${absNum}`
//   } else if (absNum < 1_000_000) {
//     // Thousand
//     const value = absNum / 1_000
//     return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}K`
//   } else if (absNum < 1_000_000_000) {
//     // Million
//     const value = absNum / 1_000_000
//     return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)}M`
//   } else if (absNum < 1_000_000_000_000) {
//     // Billion
//     const value = absNum / 1_000_000_000
//     return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)}B`
//   } else {
//     // Trillion and above
//     const value = absNum / 1_000_000_000_000
//     return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)}T`
//   }
// }

// // Dummy data for other charts (unchanged)
// const inventoryData = [
//   { date: 'Jan 25', rawMaterials: 120, color: 45, packaging: 30 },
//   { date: 'Feb 25', rawMaterials: 130, color: 35, packaging: 25 },
//   { date: 'Mar 25', rawMaterials: 115, color: 40, packaging: 35 },
//   { date: 'Apr 25', rawMaterials: 140, color: 30, packaging: 28 },
//   { date: 'May 25', rawMaterials: 125, color: 50, packaging: 32 },
//   { date: 'Jun 25', rawMaterials: 110, color: 45, packaging: 27 },
// ]

// export default function Dashboard() {
//   //getting userData from jotai atom component
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)
//   const router = useRouter()
//   const [userData] = useAtom(userDataAtom)

//   const [fundPositionData, setFundPositionData] =
//     React.useState<FundPositionType | null>(null)
//   const [advances, setAdvances] = useState<ApproveAdvanceType[]>([])
//   const [invoices, setInvoices] = useState<GetPaymentOrder[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [expenseData, setExpenseData] = useState<GEtExpenseDataType[]>([])
//   const [expenseDataYearly, setExpenseDataYearly] = useState<
//     GEtExpenseDataType[]
//   >([])
//   const [incomeData, setIncomeData] = useState<GEtExpenseDataType[]>([])
//   const [incomeDataYearly, setIncomeDataYearly] = useState<
//     GEtExpenseDataType[]
//   >([])
//   const [gpData, setGPData] = useState<GEtExpenseDataType[]>([])
//   const [gpDataYearly, setGPDataYearly] = useState<GEtExpenseDataType[]>([])
//   const [npData, setNPData] = useState<GEtExpenseDataType[]>([])
//   const [npDataYearly, setNPDataYearly] = useState<GEtExpenseDataType[]>([])
//   const [department, setDepartments] = useState<GetDepartment[]>([])
//   const [selectedDepartment, setSelectedDepartment] = useState<number>(
//     0
//   )
//   const [costBreakdown, setCostBreakdown] = useState<GetCostBreakdownType[]>([])
//   const [getCompany, setGetCompany] = useState<CompanyType[]>([])

//   const fetchFundPosition = React.useCallback(async () => {
//     try {
//        if (!token) return
//       const data = await getFundPosition(3, '2025-02-19', '02', token)

//       setFundPositionData(data.data)
//     } catch (error) {
//       console.error('Error fetching fund position data:', error)
//     }
//   }, [])

//   // Fetch Departments
//   const fetchDepartments = React.useCallback(async () => {
//     if (!token) return
//     const data = await getAllDepartments(token)
//     if (data.error || !data.data) {
//       console.error('Error getting departments:', data.error)
//       toast({
//         title: 'Error',
//         description: data.error?.message || 'Failed to get departments',
//       })
//     } else {
//       setDepartments(data.data)
//     }
//   }, [token])

//   const fetchRequisitions = React.useCallback(async () => {
//     if (!token) return
//     try {
//       setLoading(true)
//       const data = await getAllPaymentRequisition({
//         companyId: getCompany[0]?.companyId || 3,
//         token: token,
//       })
//       const filteredInvoices =
//         data.data?.filter((req) => req.status === 'Invoice Created') || []
//       setInvoices(filteredInvoices)

//     } catch (err) {
//       setError('Failed to fetch requisitions')
//     } finally {
//       setLoading(false)
//     }
//   }, [token, getCompany])

//   const fetchAdvances = React.useCallback(async () => {
//     if (!token) return
//     try {
//       if (!token) return
//       setLoading(true)
//       setError(null) // Reset error state

//       const data = await getAllAdvance(token)
//       setAdvances(Array.isArray(data?.data) ? data.data : []) // Ensure it's always an array

//     } catch (err) {
//       console.error('Error fetching advances:', err)
//       setError('Failed to fetch advance requests')
//       setAdvances([]) // Ensure UI still works
//     } finally {
//       setLoading(false)
//     }
//   }, [token])

//   // Get All company function
//   const fetchAllCompany = React.useCallback(async () => {
//     if (!token) return
//     const response = await getAllCompanies(token)

//     setGetCompany(response.data || [])
//   }, [token])

//   //  Get Expense data monthly
//   const fetchExpenseData = React.useCallback(async () => {
//     if (!token) return
//     const companyId = 3 // Example companyId
//  // First day of the current month
//   const now = new Date();
//   const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
//   .toISOString()
//   .split('T')[0]; // Format: 'YYYY-MM-DD'

// // Last day of the current month
//   const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
//   .toISOString()
//   .split('T')[0]; // Format: 'YYYY-MM-DD'

//     const response = await getExpenseData(companyId, startDate, endDate, token)

//     if (response.data) {
//       setExpenseData(
//         Array.isArray(response.data) ? response.data : [response.data]
//       )
//     } else {
//       setExpenseData([])
//     }

//   }, [token])

//   //  Get Expense data yearly
//   const fetchExpenseDataYearly = React.useCallback(async () => {
//     if (!token) return
//     const companyId = 3 // Example companyId
//     const startDate = '2025-02-01' // Example startDate
//     const endDate = '2025-12-31' // Example endDate

//     const response = await getExpenseData(companyId, startDate, endDate, token)
//     if (response.data) {
//       setExpenseDataYearly(
//         Array.isArray(response.data) ? response.data : [response.data]
//       )
//     } else {
//       setExpenseDataYearly([])
//     }

//   }, [token])

//   // Get Income Data
//   const fetchIncomeData = React.useCallback(async () => {
//     if (!token) return
//     const companyId = 3 // Example companyId
//     const now = new Date();
//   const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
//   .toISOString()
//   .split('T')[0]; // Format: 'YYYY-MM-DD'

// // Last day of the current month
//   const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
//   .toISOString()
//   .split('T')[0]; // Format: 'YYYY-MM-DD'

//     const response = await getIncomeData(companyId, startDate, endDate, token)
//     if (response.data) {
//       setIncomeData(
//         Array.isArray(response.data) ? response.data : [response.data]
//       )
//     } else {
//       setIncomeData([])
//     }

//   }, [token])

//   // Get Income Data  yearly
//   const fetchIncomeDataYearly = React.useCallback(async () => {
//     if (!token) return
//     const companyId = 3 // Example companyId
//     const startDate = '2025-02-01' // Example startDate
//     const endDate = '2025-12-31' // Example endDate

//     const response = await getIncomeData(companyId, startDate, endDate, token)
//     if (response.data) {
//       setIncomeDataYearly(
//         Array.isArray(response.data) ? response.data : [response.data]
//       )
//     } else {
//       setIncomeDataYearly([])
//     }

//   }, [token])

//   //Get getGPData
//   const fetchGPData = React.useCallback(async () => {
//     if (!token) return
//     const companyId = 3 // Example companyId
//    const now = new Date();
//   const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
//   .toISOString()
//   .split('T')[0]; // Format: 'YYYY-MM-DD'

// // Last day of the current month
//   const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
//   .toISOString()
//   .split('T')[0]; // Format: 'YYYY-MM-DD'

//     const response = await getGPData(companyId, startDate, endDate, token)
//     if (response.data) {
//       setGPData(Array.isArray(response.data) ? response.data : [response.data])
//     } else {
//       setGPData([])
//     }

//   }, [token])

//   //Get getGPData yearly
//   const fetchGPDataYearly = React.useCallback(async () => {
//     if (!token) return
//     const companyId = 3 // Example companyId
//     const startDate = '2025-02-01' // Example startDate
//     const endDate = '2025-12-31' // Example endDate

//     const response = await getGPData(companyId, startDate, endDate, token)
//     if (response.data) {
//       setGPDataYearly(
//         Array.isArray(response.data) ? response.data : [response.data]
//       )
//     } else {
//       setGPDataYearly([])
//     }

//   }, [token])

//   //Get getNPData
//   const fetchNPData = React.useCallback(async () => {
//     if (!token) return
//     const companyId = 3 // Example companyId
//     const startDate = '2025-01-01' // Example startDate
//     const endDate = '2025-12-31' // Example endDate

//     const response = await getNPData(companyId, startDate, endDate, token)
//     if (response.data) {
//       setNPData(Array.isArray(response.data) ? response.data : [response.data])
//     } else {
//       setNPData([])
//     }

//   }, [token])

//   //Get getNPData yearly
//   const fetchNPDataYearly = React.useCallback(async () => {
//     if (!token) return
//     const companyId = 3 // Example companyId
//     const startDate = '' // Example startDate
//     const endDate = '' // Example endDate

//     const response = await getNPData(companyId, startDate, endDate, token)

//     if (response.data) {
//       setNPDataYearly(
//         Array.isArray(response.data) ? response.data : [response.data]
//       )
//     } else {
//       setNPDataYearly([])
//     }

//   }, [token])

//   //Get Cost Breakdown Data
//   const fetchCostBreakdown = React.useCallback(async (departmentId:number) => {
//     console.log("under fetchCostBreakdown",token)
//      if (!token) return
//     //const departmentId = selectedDepartment // Default to 0 if no department is selected
//   const now = new Date();
//   const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
//   .toISOString()
//   .split('T')[0]; // Format: 'YYYY-MM-DD'

// // Last day of the current month
//   const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
//   .toISOString()
//   .split('T')[0]; // Format: 'YYYY-MM-DD'
//     const companyId = 3 // Example companyId

//     const response = await getCostBreakdown(
//       departmentId,
//       startDate,
//       endDate,
//       companyId,
//       token
//     )

//     console.log(response.data)
//     if (response.data) {
//       setCostBreakdown(
//         Array.isArray(response.data) ? response.data : [response.data]
//       )
//     } else {
//       setCostBreakdown([])
//     }
//     console.log('🚀 ~ GetCostBreakdown ~ response:', response)
//   }, [])

//   const processedFundPositionData = React.useMemo(() => {
//     if (!fundPositionData) return []

//     console.log('Processing fund position data:', fundPositionData)

//     const dates = ['01/01/2025', '01/12/2025'] // We know there are two dates

//     return dates.map((date) => {
//       const cashBalance = fundPositionData.cashBalance
//         .filter((item) => item.date === date)
//         .reduce(
//           (sum, item) => sum + (Number.parseFloat(item.balance || '0') || 0),
//           0
//         )

//       const bankBalance = fundPositionData.BankBalance.flat()
//         .filter((item) => item.date === date)
//         .reduce(
//           (sum, item) => sum + (Number.parseFloat(item.balance || '0') || 0),
//           0
//         )

//       console.log(`Date: ${date}, Cash: ${cashBalance}, Bank: ${bankBalance}`)

//       const [month, day, year] = date.split('/')
//       return {
//         date: `${month}/${day}`,
//         cashBalance,
//         bankBalance,
//         netBalance: cashBalance + bankBalance,
//       }
//     })
//   }, [])

//   React.useEffect(() => {
//     const checkUserData = () => {
//       const storedUserData = localStorage.getItem('currentUser')
//       const storedToken = localStorage.getItem('authToken')

//       if (!storedUserData || !storedToken) {
//         console.log('No user data or token found in localStorage')
//         router.push('/')
//         return
//       }
//     }
//     checkUserData()

//     fetchFundPosition()
//     fetchRequisitions()
//     fetchAdvances()
//     fetchExpenseData()
//     fetchExpenseDataYearly()
//     fetchIncomeData()
//     fetchIncomeDataYearly()
//     fetchGPData()
//     fetchGPDataYearly()
//     fetchNPData()
//     fetchNPDataYearly()
//     fetchDepartments()
//     fetchCostBreakdown(selectedDepartment)
//     fetchAllCompany()
//   }, [
//     token,
//     selectedDepartment,

//   ])

//   // Calculate total netexpense
//   const totalExpense = expenseData?.reduce(
//     (acc, expense) => acc + (expense?.netExpense || 0),
//     0
//   )
//   // calculate total expense yearly
//   const totalExpenseYearly = expenseDataYearly?.reduce(
//     (acc, expense) => acc + (expense?.netExpense || 0),
//     0
//   )

//   // Calculate total lastmonth expense
//   const lastMonthExpense = expenseData?.reduce(
//     (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
//     0
//   )
//   // calculate total lastmonth expense yearly
//   const lastMonthExpenseYearly = expenseDataYearly?.reduce(
//     (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
//     0
//   )

//   // Calculate total thismonth expense
//   const expensePercentageChange =
//     lastMonthExpense !== 0 ? (totalExpense - lastMonthExpense) / 100 : 0

//   // Calculate total thismonth expense yearly
//   const expensePercentageChangeYearly =
//     lastMonthExpenseYearly !== 0
//       ? (totalExpenseYearly - lastMonthExpenseYearly) / 100
//       : 0

//   // Calculate total income
//   const totalIncome = incomeData?.reduce(
//     (acc, expense) => acc + (expense?.netExpense || 0),
//     0
//   )
//   // calculate total income yearly
//   const totalIncomeYearly = incomeDataYearly?.reduce(
//     (acc, expense) => acc + (expense?.netExpense || 0),
//     0
//   )

//   // Calculate total lastmonth income

//   const lastMonthIncome = incomeData?.reduce(
//     (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
//     0
//   )
//   // calculate total lastmonth income yearly
//   const lastMonthIncomeYearly = incomeDataYearly?.reduce(
//     (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
//     0
//   )

//   // Calculate total thismonth income
//   const incomePercentageChange =
//     lastMonthExpense !== 0 ? (totalIncome - lastMonthIncome) / 100 : 0

//   // Calculate total thismonth income yearly
//   const incomePercentageChangeYearly =
//     lastMonthExpenseYearly !== 0
//       ? (totalIncomeYearly - lastMonthIncomeYearly) / 100
//       : 0

//   // Calculate total GP
//   const totalGP = gpData?.reduce(
//     (acc, expense) => acc + (expense?.netExpense || 0),
//     0
//   )
//   // calculate total GP yearly
//   const totalGPYearly = gpDataYearly?.reduce(
//     (acc, expense) => acc + (expense?.netExpense || 0),
//     0
//   )
//   // Calculate total lastmonth GP
//   const lastMonthGP = gpData?.reduce(
//     (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
//     0
//   )
//   // calculate total lastmonth GP yearly
//   const lastMonthGPYearly = gpDataYearly?.reduce(
//     (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
//     0
//   )
//   // Calculate total thismonth GP
//   const gpPercentageChange =
//     lastMonthExpense !== 0 ? (totalGP - lastMonthGP) / 100 : 0
//   // Calculate total thismonth GP yearly
//   const gpPercentageChangeYearly =
//     lastMonthExpenseYearly !== 0 ? (totalGPYearly - lastMonthGPYearly) / 100 : 0

//   // Calculate total NP
//   const totalNP = npData?.reduce(
//     (acc, expense) => acc + (expense?.netExpense || 0),
//     0
//   )
//   // calculate total NP yearly
//   const totalNPYearly = npDataYearly?.reduce(
//     (acc, expense) => acc + (expense?.netExpense || 0),
//     0
//   )
//   // Calculate total
//   const lastMonthNP = npData?.reduce(
//     (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
//     0
//   )

//   // calculate total lastmonth NP yearly
//   const lastMonthNPYearly = npDataYearly?.reduce(
//     (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
//     0
//   )

//   // Calculate total thismonth NP
//   const npPercentageChange =
//     lastMonthExpense !== 0 ? (totalNP - lastMonthNP) / 100 : 0
//   // Calculate total thismonth NP yearly
//   const npPercentageChangeYearly =
//     lastMonthExpenseYearly !== 0 ? (totalNPYearly - lastMonthNPYearly) / 100 : 0

//   function handleDepartmentChange(departmentId: number): void {
//     setSelectedDepartment(departmentId)
//     // You can add more logic here if needed, such as fetching data based on the selected department
//   }

//   // Function to handle Pie Chart Click
//   interface PieEntry {
//     financialTag: string
//   }

//   const handlePieClick = (entry: PieEntry) => {
//     const financialTag = entry.financialTag
//     if (financialTag === 'Asset') {
//       window.location.href = `dashboard/cost-breakdown-details/${financialTag}`
//     } else if (financialTag === 'Gross Profit') {
//       window.location.href = `dashboard/cost-breakdown-details/${financialTag}`
//     } else {
//       window.location.href = `dashboard/cost-breakdown-details/${financialTag}`
//     }
//   }

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <h1 className="text-2xl font-semibold">Dashboard</h1>
//         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-20">
//           <Select defaultValue="nationa">
//             <CustomCombobox
//               items={getCompany.map((company) => ({
//                 id: (company.companyId ?? '').toString(),
//                 name: company.companyName || 'Unnamed Company',
//               }))}
//               value={
//                 selectedDepartment
//                   ? {
//                       id: selectedDepartment?.toString() || '',
//                       name:
//                         getCompany.find(
//                           (company) => company.companyId === selectedDepartment
//                         )?.companyName || 'Unnamed Company',
//                     }
//                   : null
//               }
//               onChange={(value: { id: string; name: string } | null) =>
//                 handleDepartmentChange(
//                   value ? Number.parseInt(value.id, 10) : 0
//                 )
//               }
//               placeholder="Select company"
//             />
//           </Select>
//           <div className="flex items-center gap-2">
//             <input
//               type="date"
//               className="px-3 py-1 border rounded-md text-sm"
//               defaultValue="2017-03-31"
//             />
//             <ChevronDown className="h-4 w-4" />
//             <input
//               type="date"
//               className="px-3 py-1 border rounded-md text-sm"
//               defaultValue="2020-12-31"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-5">
//         <Link href="/approve-advance">
//           <Card className="p-3 text-center">
//             You have {advances.length} pending advance approvals
//           </Card>
//         </Link>
//         <Link href="/approve-invoice">
//           <Card className="p-3 text-center">
//             You have {invoices.length} pending invoice approvals
//           </Card>
//         </Link>
//       </div>

//       <div className="grid grid-cols-4 gap-4">
//         <div className="grid grid-cols-4 w-fit gap-4 col-span-3">
//           <HoverCard>
//             <HoverCardTrigger asChild>
//               <Card className="cursor-pointer">
//                 <CardHeader className="pb-2">
//                   <CardTitle className="text-base ">
//                     Current Month Revenue
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {formatInternationalNumber(totalIncome)}
//                   </div>
//                   <p
//                     className={`text-xs ${incomePercentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
//                   >
//                     {incomePercentageChange}% vs prev
//                   </p>
//                 </CardContent>
//               </Card>
//             </HoverCardTrigger>

//             <HoverCardContent className="w-80 bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-4 z-10">
//               <div>
//                 <table className="w-full table-auto text-sm">
//                   <thead className="bg-slate-400">
//                     <tr>
//                       <th className="text-left p-2 text-sm">Group Name</th>
//                       <th className="text-left p-2 text-sm">This Month</th>
//                       <th className="text-left p-2 text-sm">Last Month</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {incomeData.map((expense, index) => (
//                       <tr key={index} className="bg-slate-300 border-b">
//                         <td className="p-2 text-sm">{expense.groupName}</td>
//                         <td className="p-2 text-sm">{expense.netExpense}</td>
//                         <td className="p-2 text-sm">
//                           {expense.lastMonthNetExpense}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </HoverCardContent>
//           </HoverCard>

//           <HoverCard>
//             <HoverCardTrigger asChild>
//               <Card className="cursor-pointer">
//                 <CardHeader className="pb-2">
//                   <CardTitle className="text-base ">
//                     Current Month Cost
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {formatInternationalNumber(totalExpense)}
//                   </div>
//                   <p
//                     className={`text-xs ${expensePercentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
//                   >
//                     {expensePercentageChange}% vs prev
//                   </p>
//                 </CardContent>
//               </Card>
//             </HoverCardTrigger>

//             <HoverCardContent className="w-auto bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-4 z-10">
//               <div>
//                 <table className="w-full table-auto text-sm">
//                   <thead className="bg-slate-400">
//                     <tr>
//                       <th className="text-left p-2 text-sm">Group Name</th>
//                       <th className="text-left p-2 text-sm">This Month</th>
//                       <th className="text-left p-2 text-sm">Last Month</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {expenseData.map((expense, index) => (
//                       <tr key={index} className="bg-slate-300 border-b">
//                         <td className="p-2 text-sm">{expense.groupName}</td>
//                         <td className="p-2 text-sm">{expense.netExpense}</td>
//                         <td className="p-2 text-sm">
//                           {expense.lastMonthNetExpense}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </HoverCardContent>
//           </HoverCard>

//           <HoverCard>
//             <HoverCardTrigger asChild>
//               <Card className="cursor-pointer">
//                 <CardHeader className="pb-2">
//                   <CardTitle className="text-base ">
//                     Current Month Gross Margin
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {formatInternationalNumber(totalGP)}
//                   </div>
//                   <p
//                     className={`text-xs ${gpPercentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
//                   >
//                     {gpPercentageChange}% vs prev
//                   </p>
//                 </CardContent>
//               </Card>
//             </HoverCardTrigger>

//             <HoverCardContent className="w-auto bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-4 z-10">
//               <div>
//                 <table className="w-full table-auto text-sm">
//                   <thead className="bg-slate-400">
//                     <tr>
//                       <th className="text-left p-2 text-sm">Group Name</th>
//                       <th className="text-left p-2 text-sm">This Month</th>
//                       <th className="text-left p-2 text-sm">Last Month</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {gpData.map((expense, index) => (
//                       <tr key={index} className="bg-slate-300 border-b">
//                         <td className="p-2 text-sm">{expense.groupName}</td>
//                         <td className="p-2 text-sm">{expense.netExpense}</td>
//                         <td className="p-2 text-sm">
//                           {expense.lastMonthNetExpense}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </HoverCardContent>
//           </HoverCard>

//           <HoverCard>
//             <HoverCardTrigger asChild>
//               <Card className="cursor-pointer">
//                 <CardHeader className="pb-2">
//                   <CardTitle className="text-base ">
//                     Current Month Net Margin
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {formatInternationalNumber(totalNP)}
//                   </div>
//                   <p
//                     className={`text-xs ${npPercentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
//                   >
//                     {npPercentageChange}% vs prev
//                   </p>
//                 </CardContent>
//               </Card>
//             </HoverCardTrigger>
//             <HoverCardContent className="w-auto bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-4 z-10">
//               <div>
//                 <table className="w-full table-auto text-sm">
//                   <thead className="bg-slate-400">
//                     <tr>
//                       <th className="text-left p-2 text-sm">Group Name</th>
//                       <th className="text-left p-2 text-sm">This Month</th>
//                       <th className="text-left p-2 text-sm">Last Month</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {npData.map((expense, index) => (
//                       <tr key={index} className="bg-slate-300 border-b">
//                         <td className="p-2 text-sm">{expense.groupName}</td>
//                         <td className="p-2 text-sm">{expense.netExpense}</td>
//                         <td className="p-2 text-sm">
//                           {expense.lastMonthNetExpense}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </HoverCardContent>
//           </HoverCard>

//           <HoverCard>
//             <HoverCardTrigger asChild>
//               <Card className="cursor-pointer">
//                 <CardHeader className="pb-2">
//                   <CardTitle className="text-base ">
//                     Current Financial Year Revenue
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {formatInternationalNumber(totalIncomeYearly)}
//                   </div>
//                   <p
//                     className={`text-xs ${npPercentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
//                   >
//                     {incomePercentageChangeYearly}% vs prev
//                   </p>
//                 </CardContent>
//               </Card>
//             </HoverCardTrigger>
//             <HoverCardContent className="w-auto bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-4 z-10">
//               <div>
//                 <table className="w-full table-auto text-sm">
//                   <thead className="bg-slate-400">
//                     <tr>
//                       <th className="text-left p-2 text-sm">Group Name</th>
//                       <th className="text-left p-2 text-sm">This Month</th>
//                       <th className="text-left p-2 text-sm">Last Month</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {incomeDataYearly.map((expense, index) => (
//                       <tr key={index} className="bg-slate-300 border-b">
//                         <td className="p-2 text-sm">{expense.groupName}</td>
//                         <td className="p-2 text-sm">{expense.netExpense}</td>
//                         <td className="p-2 text-sm">
//                           {expense.lastMonthNetExpense}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </HoverCardContent>
//           </HoverCard>

//           <HoverCard>
//             <HoverCardTrigger asChild>
//               <Card className="cursor-pointer">
//                 <CardHeader className="pb-2">
//                   <CardTitle className="text-base ">
//                     Current Financial Year Cost
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {formatInternationalNumber(totalExpenseYearly)}
//                   </div>
//                   <p
//                     className={`text-xs ${expensePercentageChangeYearly >= 0 ? 'text-green-500' : 'text-red-500'}`}
//                   >
//                     {expensePercentageChangeYearly}% vs prev
//                   </p>
//                 </CardContent>
//               </Card>
//             </HoverCardTrigger>
//             <HoverCardContent className="w-auto bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-4 z-10">
//               <div>
//                 <table className="w-full table-auto text-sm">
//                   <thead className="bg-slate-400">
//                     <tr>
//                       <th className="text-left p-2 text-sm">Group Name</th>
//                       <th className="text-left p-2 text-sm">This Month</th>
//                       <th className="text-left p-2 text-sm">Last Month</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {expenseDataYearly.map((expense, index) => (
//                       <tr key={index} className="bg-slate-300 border-b">
//                         <td className="p-2 text-sm">{expense.groupName}</td>
//                         <td className="p-2 text-sm">{expense.netExpense}</td>
//                         <td className="p-2 text-sm">
//                           {expense.lastMonthNetExpense}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </HoverCardContent>
//           </HoverCard>

//           <HoverCard>
//             <HoverCardTrigger asChild>
//               <Card className="cursor-pointer">
//                 <CardHeader className="pb-2">
//                   <CardTitle className="text-base ">
//                     Current Financial Year Gross Margin
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {formatInternationalNumber(totalGPYearly)}
//                   </div>
//                   <p
//                     className={`text-xs ${expensePercentageChangeYearly >= 0 ? 'text-green-500' : 'text-red-500'}`}
//                   >
//                     {gpPercentageChangeYearly}% vs prev
//                   </p>
//                 </CardContent>
//               </Card>
//             </HoverCardTrigger>
//             <HoverCardContent className="w-auto bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-4 z-10">
//               <div>
//                 <table className="w-full table-auto text-sm">
//                   <thead className="bg-slate-400">
//                     <tr>
//                       <th className="text-left p-2 text-sm">Group Name</th>
//                       <th className="text-left p-2 text-sm">This Month</th>
//                       <th className="text-left p-2 text-sm">Last Month</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {gpDataYearly.map((expense, index) => (
//                       <tr key={index} className="bg-slate-300 border-b">
//                         <td className="p-2 text-sm">{expense.groupName}</td>
//                         <td className="p-2 text-sm">{expense.netExpense}</td>
//                         <td className="p-2 text-sm">
//                           {expense.lastMonthNetExpense}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </HoverCardContent>
//           </HoverCard>

//           <HoverCard>
//             <HoverCardTrigger asChild>
//               <Card className="cursor-pointer">
//                 <CardHeader className="pb-2">
//                   <CardTitle className="text-base ">
//                     Current Financial Year Net Margin
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {formatInternationalNumber(totalNPYearly)}
//                   </div>
//                   <p
//                     className={`text-xs ${expensePercentageChangeYearly >= 0 ? 'text-green-500' : 'text-red-500'}`}
//                   >
//                     {npPercentageChangeYearly}% vs prev
//                   </p>
//                 </CardContent>
//               </Card>
//             </HoverCardTrigger>
//             <HoverCardContent className="w-auto bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-4 z-10">
//               <div>
//                 <table className="w-full table-auto text-sm">
//                   <thead className="bg-slate-400">
//                     <tr>
//                       <th className="text-left p-2 text-sm">Group Name</th>
//                       <th className="text-left p-2 text-sm">This Month</th>
//                       <th className="text-left p-2 text-sm">Last Month</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {npDataYearly.map((expense, index) => (
//                       <tr key={index} className="bg-slate-300 border-b">
//                         <td className="p-2 text-sm">{expense.groupName}</td>
//                         <td className="p-2 text-sm">{expense.netExpense}</td>
//                         <td className="p-2 text-sm">
//                           {expense.lastMonthNetExpense}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </HoverCardContent>
//           </HoverCard>
//         </div>

//         <Card className="lg:col-span-1">
//           <CardHeader>
//             <div className="flex items-center justify-between gap-1">
//               <CardTitle className="text-sm">Cost Breakdown</CardTitle>
//               <CustomCombobox
//                 items={department.map((dept) => ({
//                   id: dept.departmentID.toString(),
//                   name: dept.departmentName || 'Unnamed Department',
//                 }))}
//                 value={
//                   selectedDepartment
//                     ? {
//                         id: selectedDepartment.toString(),
//                         name:
//                           department.find(
//                             (d) => d.departmentID === selectedDepartment
//                           )?.departmentName || '',
//                       }
//                     : null
//                 }
//                 onChange={(value) =>
//                   handleDepartmentChange(
//                     value ? Number.parseInt(value.id, 10) : 0
//                   )
//                 }
//                 placeholder="Select department"
//               />
//             </div>
//           </CardHeader>
//           <CardContent>
//             <ChartContainer
//               config={{
//                 value: { label: 'Cost', color: 'hsl(252, 100%, 70%)' },
//               }}
//             >
//               {costBreakdown && costBreakdown.length > 0 ? (
//                 <PieChart width={300} height={300}>
//                   <Pie
//                     data={costBreakdown.map((item) => ({
//                       ...item,
//                       balance: Math.abs(parseFloat(item.balance.toString())),
//                     }))}
//                     dataKey="balance"
//                     nameKey="financialTag"
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={80}
//                     fill="hsl(252, 100%, 70%)"
//                     label
//                     onClick={handlePieClick} // Click event to navigate
//                     cursor="pointer"
//                   >
//                     {costBreakdown.map((entry, index) => (
//                       <Cell
//                         key={`cell-${index}`}
//                         fill={`hsl(${index * 60}, 100%, 70%)`}
//                         style={{ cursor: 'pointer' }}
//                       />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               ) : (
//                 <div className="flex h-[300px] items-center justify-center">
//                   No data available
//                 </div>
//               )}
//             </ChartContainer>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <Card className="">
//           <CardHeader>
//             <CardTitle>Fund Position</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ChartContainer
//               config={{
//                 cashBalance: {
//                   label: 'Cash Balance',
//                   color: 'hsl(252, 100%, 70%)',
//                 },
//                 bankBalance: {
//                   label: 'Bank Balance',
//                   color: 'hsl(180, 100%, 70%)',
//                 },
//                 netBalance: {
//                   label: 'Net Balance',
//                   color: 'hsl(0, 100%, 70%)',
//                 },
//               }}
//             >
//               <LineChart
//                 data={processedFundPositionData}
//                 margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
//                 width={600}
//                 height={300}
//               >
//                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip content={<ChartTooltipContent />} />
//                 <Legend />
//                 <Line
//                   type="monotone"
//                   dataKey="cashBalance"
//                   stroke="hsl(252, 100%, 70%)"
//                   strokeWidth={2}
//                   dot={{
//                     stroke: 'hsl(252, 100%, 70%)',
//                     fill: 'white',
//                     strokeWidth: 2,
//                   }}
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="bankBalance"
//                   stroke="hsl(180, 100%, 70%)"
//                   strokeWidth={2}
//                   dot={{
//                     stroke: 'hsl(180, 100%, 70%)',
//                     fill: 'white',
//                     strokeWidth: 2,
//                   }}
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="netBalance"
//                   stroke="hsl(0, 100%, 70%)"
//                   strokeWidth={2}
//                   dot={{
//                     stroke: 'hsl(0, 100%, 70%)',
//                     fill: 'white',
//                     strokeWidth: 2,
//                   }}
//                 />
//               </LineChart>
//             </ChartContainer>
//           </CardContent>
//         </Card>

//         <Card className="">
//           <CardHeader>
//             <CardTitle>Inventory Turnover</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ChartContainer
//               config={{
//                 rawMaterials: {
//                   label: 'Raw Materials',
//                   color: 'hsl(252, 100%, 70%)',
//                 },
//                 color: {
//                   label: 'Color',
//                   color: 'hsl(180, 100%, 70%)',
//                 },
//                 packaging: {
//                   label: 'Packaging',
//                   color: 'hsl(0, 100%, 70%)',
//                 },
//               }}
//             >
//               <AreaChart
//                 data={inventoryData}
//                 margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
//                 width={900}
//                 height={300}
//               >
//                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <ChartTooltip content={<ChartTooltipContent />} />
//                 <Area
//                   type="monotone"
//                   dataKey="rawMaterials"
//                   stackId="1"
//                   stroke="hsl(252, 100%, 70%)"
//                   fill="hsl(252, 100%, 70%)"
//                   fillOpacity={0.2}
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey="color"
//                   stackId="1"
//                   stroke="hsl(180, 100%, 70%)"
//                   fill="hsl(180, 100%, 70%)"
//                   fillOpacity={0.2}
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey="packaging"
//                   stackId="1"
//                   stroke="hsl(0, 100%, 70%)"
//                   fill="hsl(0, 100%, 70%)"
//                   fillOpacity={0.2}
//                 />
//               </AreaChart>
//             </ChartContainer>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }
