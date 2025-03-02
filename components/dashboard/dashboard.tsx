'use client'

import React from 'react'
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
import { getFundPosition } from '@/api/dashboard-api'
import type { FundPositionType } from '@/utils/type'

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

  const fetchFundPosition = React.useCallback(async () => {
    try {
      const data = await getFundPosition(77, '2025-02-19', '02')
      console.log('Fetched fund position data:', data)
      setFundPositionData(data.data)
    } catch (error) {
      console.error('Error fetching fund position data:', error)
    }
  }, [])

  React.useEffect(() => {
    fetchFundPosition()
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

      <div className="grid grid-cols-4 gap-4">
        <div className="grid grid-cols-4 gap-4 col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Current Month Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">726,318</div>
              <p className="text-xs text-green-500">+10% vs prev</p>
            </CardContent>
          </Card>
          <Card>
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Current Month Gross Margin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">580,145</div>
              <p className="text-xs text-red-500">-10% vs prev</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Current Month Net Margin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,259</div>
              <p className="text-xs text-green-500">+10% vs prev</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Current Financial Year Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,259</div>
              <p className="text-xs text-green-500">+10% vs prev</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Current Financial Year Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,259</div>
              <p className="text-xs text-green-500">+10% vs prev</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Current Financial Year Gross Margin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,259</div>
              <p className="text-xs text-green-500">+10% vs prev</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Current Financial Year Net Margin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,259</div>
              <p className="text-xs text-green-500">+10% vs prev</p>
            </CardContent>
          </Card>
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
