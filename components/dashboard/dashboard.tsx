'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Bar,
  BarChart,
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

const fundPositionData = [
  { date: 'Jan 25', availableFund: 30, loan: 45 },
  { date: 'Feb 25', availableFund: 25, loan: 38 },
  { date: 'Mar 25', availableFund: 15, loan: 42 },
  { date: 'Apr 25', availableFund: 35, loan: 30 },
  { date: 'May 25', availableFund: 45, loan: 35 },
  { date: 'Jun 25', availableFund: 20, loan: 48 },
]

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
              <BarChart
                data={costBreakdownData}
                layout="vertical"
                margin={{ top: 0, right: 0, bottom: 0, left: 100 }}
                width={300}
                height={300}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Bar
                  dataKey="value"
                  fill="hsl(252, 100%, 70%)"
                  radius={[0, 4, 4, 0]}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'transparent' }}
                />
              </BarChart>
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
                availableFund: {
                  label: 'Available Fund',
                  color: 'hsl(252, 100%, 70%)',
                },
                loan: {
                  label: 'Loan',
                  color: 'hsl(180, 100%, 70%)',
                },
              }}
            >
              <LineChart
                data={fundPositionData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                width={600}
                height={300}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="availableFund"
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
                  dataKey="loan"
                  stroke="hsl(180, 100%, 70%)"
                  strokeWidth={2}
                  dot={{
                    stroke: 'hsl(180, 100%, 70%)',
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
