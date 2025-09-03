"use client"

import { useMemo } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface LoanGraphReportChartProps {
  loanPosition: any[]
}

const LoanGraphReportChart = ({ loanPosition }: LoanGraphReportChartProps) => {
  const chartData = useMemo(() => {
    if (!loanPosition || loanPosition.length === 0) return []

    // Normalize data
    const normalizedData = loanPosition.map((item) => ({
      companyName: item.companyName ?? "Unknown",
      date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
      balance: Number.parseFloat(item.balance) || 0,
    }))

    // Get unique dates and companies
    const uniqueDates = Array.from(new Set(normalizedData.map((item) => item.date))).sort()

    const companies = Array.from(new Set(normalizedData.map((item) => item.companyName)))

    // Create chart data structure
    return uniqueDates.map((date) => {
      const dataPoint: any = { date: new Date(date).toLocaleDateString() }

      companies.forEach((company) => {
        const companyData = normalizedData.filter((item) => item.date === date && item.companyName === company)
        const totalBalance = companyData.reduce((sum, item) => sum + item.balance, 0)
        dataPoint[company] = totalBalance
      })

      return dataPoint
    })
  }, [loanPosition])

  const companies = useMemo(() => {
    if (!loanPosition || loanPosition.length === 0) return []
    return Array.from(new Set(loanPosition.map((item) => item.companyName ?? "Unknown")))
  }, [loanPosition])

  const chartConfig = useMemo(() => {
    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
      "hsl(220, 70%, 50%)",
      "hsl(340, 75%, 55%)",
      "hsl(45, 93%, 47%)",
      "hsl(120, 60%, 50%)",
      "hsl(280, 65%, 60%)",
    ]

    const config: any = {}
    companies.forEach((company, index) => {
      config[company] = {
        label: company,
        color: colors[index % colors.length],
      }
    })
    return config
  }, [companies])

  if (!loanPosition || loanPosition.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Loan Position Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">No data available to display chart.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Loan Position Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => value.toLocaleString()} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: any) => [value.toLocaleString(), ""]}
              />
              <Legend />
              {companies.map((company) => (
                <Line
                  key={company}
                  type="monotone"
                  dataKey={company}
                  stroke={`var(--color-${company})`}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name={company}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default LoanGraphReportChart
