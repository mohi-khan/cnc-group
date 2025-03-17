'use client'

import React, { useState } from 'react'
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

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getExpenseData, getFundPosition } from '@/api/dashboard-api'
import type {
  ApproveAdvanceType,
  FundPositionType,
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
import { set } from 'date-fns'

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
  { name: 'Raw Material Cost', value: 8000000 },
  { name: 'Labor Cost', value: 5000000 },
  { name: 'Packaging Cost', value: 3000000 },
  { name: 'Other Costs', value: 2000000 },
]

export default function Dashboard() {
  const [fundPositionData, setFundPositionData] =
    React.useState<FundPositionType | null>(null)
  const [advances, setAdvances] = useState<ApproveAdvanceType[]>([])
  const [invoices, setInvoices] = useState<GetPaymentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expenseData, setExpenseData] = useState<GEtExpenseDataType[]>([])

  const mainToken = localStorage.getItem('authToken')
  console.log('🚀 ~ PaymentRequisition ~ mainToken:', mainToken)
  const token = `Bearer ${mainToken}`

  const fetchFundPosition = React.useCallback(async () => {
    try {
      const data = await getFundPosition(77, '2025-02-19', '02')
      console.log('Fetched fund position data:', data)
      setFundPositionData(data.data)
    } catch (error) {
      console.error('Error fetching fund position data:', error)
    }
  }, [])

  const fetchRequisitions = async () => {
    try {
      setLoading(true)
      const data = await getAllPaymentRequisition({
        companyId: 75,
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
  }

  const fetchAdvances = async () => {
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
  }

  //  Get Expected Revenue function
  const getExpectedRevenue = async () => {
    const companyId = 75 // Example companyId
    const startDate = '2025-01-01' // Example startDate
    const endDate = '2025-12-31' // Example endDate
    const token = `Bearer ${mainToken}`

    const response = await getExpenseData(companyId, startDate, endDate, token)
    if (response.data) {
      setExpenseData(Array.isArray(response.data) ? response.data : [response.data])
    } else {
      setExpenseData([])
    }
    console.log('🚀 ~ getExpectedRevenue ~ response:', response)
  }
  React.useEffect(() => {
    fetchFundPosition()
    fetchRequisitions()
    fetchAdvances()
    getExpectedRevenue()
  }, [fetchFundPosition])

  const processedFundPositionData = React.useMemo(() => {
    if (!fundPositionData) return []

    console.log('Processing fund position data:', fundPositionData)

    const dates = ['03/03/2025', '02/28/2025'] // We know there are two dates

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

  console.log('Processed fund position data:', processedFundPositionData)

  // Calculate total netexpense
  const totalExpense = expenseData?.reduce(
    (acc, expense) => acc + (expense?.netExpense || 0),
    0
  )


  // Calculate total lastmonth expense
  const lastMonthExpense = expenseData?.reduce(
    (acc, expense) => acc + (expense?.lastMonthNetExpense || 0),
    0
  )
  // Calculate total thismonth expense
  const expensePercentageChange = lastMonthExpense !== 0 
    ? ((totalExpense - lastMonthExpense) /  100) 
    : 0
  
  

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Select defaultValue="nationa">
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nationa">Nationa Accessories</SelectItem>
              <SelectItem value="other">Other Company</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              31/03/17
            </Button>
            <ChevronDown className="h-4 w-4" />
            <Button variant="outline" size="sm">
              31/12/20
            </Button>
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
        <div className="grid grid-cols-4 gap-4 col-span-3">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="cursor-pointer w-72">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-serif">
                    Current Month Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalExpense?.toLocaleString()}</div>
                  <p className="text-xs text-green-500">{expensePercentageChange}% vs prev</p>
                  
                  
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto bg-slate-300 p-2 rounded-lg shadow-2xl border flex-auto gap-2">
              <div>
                {expenseData.map((expense, index) => (
                  <div key={index} className='text-black text-sm p-2 flex justify-between gap-4 min-w-max bg-slate-300 rounded-lg shadow-xl  '>
                    <div><span className='font-bold'>GroupName:</span> {expense.groupName}</div>
                    <div><span className='font-bold'>NetExpense:</span> {expense.netExpense}</div>
                    <div><span className='font-bold'>LastMonthNetExpense:</span> {expense.lastMonthNetExpense}</div>
                  </div>
  ))}
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="cursor-pointer w-72">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Current Month Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$146,723</div>
                  <p className="text-xs text-green-500">+10% vs prev</p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-slate-300 p-2rounded-lg shadow-2xl border">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
                <p className="text-sm">
                  <span className="font-medium">Total Orders:</span> 1,245
                </p>
                <p className="text-sm">
                  <span className="font-medium">New Customers:</span> 150
                </p>
                <p className="text-sm">
                  <span className="font-medium">Avg. Order Value:</span> $58.33
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="cursor-pointer w-72">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Current Month Gross Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$580,145</div>
                  <p className="text-xs text-red-500">-10% vs prev</p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-slate-300 p-2 rounded-lg shadow-2xl border">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
                <p className="text-sm">
                  <span className="font-medium">Total Orders:</span> 1,245
                </p>
                <p className="text-sm">
                  <span className="font-medium">New Customers:</span> 150
                </p>
                <p className="text-sm">
                  <span className="font-medium">Avg. Order Value:</span> $58.33
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="cursor-pointer w-72">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Current Month Net Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,259</div>
                  <p className="text-xs text-green-500">+10% vs prev</p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-slate-300 p-2 rounded-lg shadow-2xl border">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
                <p className="text-sm">
                  <span className="font-medium">Total Orders:</span> 1,245
                </p>
                <p className="text-sm">
                  <span className="font-medium">New Customers:</span> 150
                </p>
                <p className="text-sm">
                  <span className="font-medium">Avg. Order Value: </span> $58.33
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="cursor-pointer w-72">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Current Financial Year Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,259</div>
                  <p className="text-xs text-green-500">+10% vs prev</p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-slate-300 p-2 rounded-lg shadow-2xl border">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
                <p className="text-sm">
                  <span className="font-medium">Total Orders:</span> 1,245
                </p>
                <p className="text-sm">
                  <span className="font-medium">New Customers:</span> 150
                </p>
                <p className="text-sm">
                  <span className="font-medium">Avg. Order Value: </span> $58.33
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="cursor-pointer w-72">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Current Financial Year Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,259</div>
                  <p className="text-xs text-green-500">+10% vs prev</p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-slate-300 p-2 rounded-lg shadow-2xl border">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
                <p className="text-sm">
                  <span className="font-medium">Total Orders:</span> 1,245
                </p>
                <p className="text-sm">
                  <span className="font-medium">New Customers:</span> 150
                </p>
                <p className="text-sm">
                  <span className="font-medium">Avg. Order Value: </span> $58.33
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="cursor-pointer w-72">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Current Financial Year Gross Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,259</div>
                  <p className="text-xs text-green-500">+10% vs prev</p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-slate-300 p-2 rounded-lg shadow-2xl border">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
                <p className="text-sm">
                  <span className="font-medium">Total Orders:</span> 1,245
                </p>
                <p className="text-sm">
                  <span className="font-medium">New Customers:</span> 150
                </p>
                <p className="text-sm">
                  <span className="font-medium">Avg. Order Value: </span> $58.33
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="cursor-pointer w-72">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Current Financial Year Net Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,259</div>
                  <p className="text-xs text-green-500">+10% vs prev</p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-slate-300 p-2 rounded-lg shadow-2xl border">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
                <p className="text-sm">
                  <span className="font-medium">Total Orders:</span> 1,245
                </p>
                <p className="text-sm">
                  <span className="font-medium">New Customers:</span> 150
                </p>
                <p className="text-sm">
                  <span className="font-medium">Avg. Order Value: </span> $58.33
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: 'Cost',
                  color: 'hsl(252, 100%, 70%)',
                },
              }}
            >
              <PieChart width={300} height={300}>
                <Pie
                  data={costBreakdownData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="hsl(252, 100%, 70%)"
                  label
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(${index * 60}, 100%, 70%)`}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
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
