"use client"

import React from "react"
import { AreaChart, Area, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const UtilityDashboard = () => {
  const [selectedCompany, setSelectedCompany] = React.useState("acme-corp")

  // Sample data for the charts
  const electricityData = [
    { month: "Jan", usage: 1200, cost: 180 },
    { month: "Feb", usage: 1100, cost: 165 },
    { month: "Mar", usage: 1300, cost: 195 },
    { month: "Apr", usage: 1250, cost: 187 },
    { month: "May", usage: 1400, cost: 210 },
    { month: "Jun", usage: 1600, cost: 240 },
    { month: "Jul", usage: 1800, cost: 270 },
    { month: "Aug", usage: 1750, cost: 262 },
    { month: "Sep", usage: 1500, cost: 225 },
    { month: "Oct", usage: 1350, cost: 202 },
    { month: "Nov", usage: 1200, cost: 180 },
    { month: "Dec", usage: 1300, cost: 195 },
  ]

  const waterData = [
    { month: "Jan", usage: 800, cost: 120 },
    { month: "Feb", usage: 750, cost: 112 },
    { month: "Mar", usage: 900, cost: 135 },
    { month: "Apr", usage: 850, cost: 127 },
    { month: "May", usage: 950, cost: 142 },
    { month: "Jun", usage: 1100, cost: 165 },
    { month: "Jul", usage: 1200, cost: 180 },
    { month: "Aug", usage: 1150, cost: 172 },
    { month: "Sep", usage: 1000, cost: 150 },
    { month: "Oct", usage: 900, cost: 135 },
    { month: "Nov", usage: 800, cost: 120 },
    { month: "Dec", usage: 850, cost: 127 },
  ]

  const gasData = [
    { month: "Jan", usage: 600, cost: 90 },
    { month: "Feb", usage: 550, cost: 82 },
    { month: "Mar", usage: 500, cost: 75 },
    { month: "Apr", usage: 400, cost: 60 },
    { month: "May", usage: 300, cost: 45 },
    { month: "Jun", usage: 200, cost: 30 },
    { month: "Jul", usage: 150, cost: 22 },
    { month: "Aug", usage: 180, cost: 27 },
    { month: "Sep", usage: 250, cost: 37 },
    { month: "Oct", usage: 400, cost: 60 },
    { month: "Nov", usage: 500, cost: 75 },
    { month: "Dec", usage: 580, cost: 87 },
  ]

  const allUtilitiesData = [
    { month: "Jan", electricity: 180, water: 120, gas: 90 },
    { month: "Feb", electricity: 165, water: 112, gas: 82 },
    { month: "Mar", electricity: 195, water: 135, gas: 75 },
    { month: "Apr", electricity: 187, water: 127, gas: 60 },
    { month: "May", electricity: 210, water: 142, gas: 45 },
    { month: "Jun", electricity: 240, water: 165, gas: 30 },
    { month: "Jul", electricity: 270, water: 180, gas: 22 },
    { month: "Aug", electricity: 262, water: 172, gas: 27 },
    { month: "Sep", electricity: 225, water: 150, gas: 37 },
    { month: "Oct", electricity: 202, water: 135, gas: 60 },
    { month: "Nov", electricity: 180, water: 120, gas: 75 },
    { month: "Dec", electricity: 195, water: 127, gas: 87 },
  ]

  const companies = [
    { value: "acme-corp", label: "Acme Corporation" },
    { value: "tech-solutions", label: "Tech Solutions Inc" },
    { value: "global-industries", label: "Global Industries" },
    { value: "green-energy", label: "Green Energy Co" },
  ]

  const electricityConfig: ChartConfig = {
    usage: {
      label: "Usage (kWh)",
      color: "hsl(var(--chart-1))",
    },
    cost: {
      label: "Cost ($)",
      color: "hsl(var(--chart-2))",
    },
  }

  const waterConfig: ChartConfig = {
    usage: {
      label: "Usage (Gallons)",
      color: "hsl(var(--chart-3))",
    },
    cost: {
      label: "Cost ($)",
      color: "hsl(var(--chart-4))",
    },
  }

  const gasConfig: ChartConfig = {
    usage: {
      label: "Usage (Therms)",
      color: "hsl(var(--chart-5))",
    },
    cost: {
      label: "Cost ($)",
      color: "hsl(var(--chart-1))",
    },
  }

  const allUtilitiesConfig: ChartConfig = {
    electricity: {
      label: "Electricity",
      color: "hsl(var(--chart-1))",
    },
    water: {
      label: "Water",
      color: "hsl(var(--chart-2))",
    },
    gas: {
      label: "Gas",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Utility Dashboard</h1>
          <p className="text-muted-foreground">Monitor your utility consumption and costs</p>
        </div>
        <div className="w-64">
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger>
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.value} value={company.value}>
                  {company.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Electricity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Electricity Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                usage: {
                  label: "Usage (kWh)",
                  color: "hsl(252, 100%, 70%)",
                },
                cost: {
                  label: "Cost ($)",
                  color: "hsl(180, 100%, 70%)",
                },
              }}
            >
              <AreaChart
                data={electricityData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                width={900}
                height={300}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stackId="1"
                  stroke="hsl(252, 100%, 70%)"
                  fill="hsl(252, 100%, 70%)"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stackId="1"
                  stroke="hsl(180, 100%, 70%)"
                  fill="hsl(180, 100%, 70%)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Water Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Water Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                usage: {
                  label: "Usage (Gallons)",
                  color: "hsl(200, 100%, 70%)",
                },
                cost: {
                  label: "Cost ($)",
                  color: "hsl(120, 100%, 70%)",
                },
              }}
            >
              <AreaChart
                data={waterData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                width={900}
                height={300}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stackId="1"
                  stroke="hsl(200, 100%, 70%)"
                  fill="hsl(200, 100%, 70%)"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stackId="1"
                  stroke="hsl(120, 100%, 70%)"
                  fill="hsl(120, 100%, 70%)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gas Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Gas Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                usage: {
                  label: "Usage (Therms)",
                  color: "hsl(30, 100%, 70%)",
                },
                cost: {
                  label: "Cost ($)",
                  color: "hsl(300, 100%, 70%)",
                },
              }}
            >
              <AreaChart data={gasData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }} width={900} height={300}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stackId="1"
                  stroke="hsl(30, 100%, 70%)"
                  fill="hsl(30, 100%, 70%)"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stackId="1"
                  stroke="hsl(300, 100%, 70%)"
                  fill="hsl(300, 100%, 70%)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* All Utilities Combined Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              All Utilities
            </CardTitle>
            <CardDescription>Combined monthly utility costs comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={allUtilitiesConfig} className="h-[300px]">
              <BarChart data={allUtilitiesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="electricity" fill="var(--color-electricity)" radius={4} />
                <Bar dataKey="water" fill="var(--color-water)" radius={4} />
                <Bar dataKey="gas" fill="var(--color-gas)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UtilityDashboard
