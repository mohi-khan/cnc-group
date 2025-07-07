'use client'
import React, { useEffect, useState } from 'react'
import {
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
  BarChart,
  Bar,
} from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { getChartDetails } from '@/api/utility-dashboard-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'

export type MonthlyTotal = {
  year: number
  month:
    | 'Jan'
    | 'Feb'
    | 'Mar'
    | 'Apr'
    | 'May'
    | 'Jun'
    | 'Jul'
    | 'Aug'
    | 'Sep'
    | 'Oct'
    | 'Nov'
    | 'Dec'
  totalAmount: number
}

const UtilityDashboard = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const [selectedCompany, setSelectedCompany] = React.useState('acme-corp')

  // State for all utility types
  const [chartDataElec, setChartDataElec] = useState<MonthlyTotal[]>([])
  const [chartDataWater, setChartDataWater] = useState<MonthlyTotal[]>([])
  const [chartDataGas, setChartDataGas] = useState<MonthlyTotal[]>([])
  const [chartDataAll, setChartDataAll] = useState<any[]>([])

  // Transformed data and configs for each utility
  const [transformedDataElec, setTransformedDataElec] = useState<any[]>([])
  const [transformedDataWater, setTransformedDataWater] = useState<any[]>([])
  const [transformedDataGas, setTransformedDataGas] = useState<any[]>([])
  const [transformedDataAll, setTransformedDataAll] = useState<any[]>([])

  const [yearWiseConfigElec, setYearWiseConfigElec] = useState<ChartConfig>({})
  const [yearWiseConfigWater, setYearWiseConfigWater] = useState<ChartConfig>(
    {}
  )
  const [yearWiseConfigGas, setYearWiseConfigGas] = useState<ChartConfig>({})
  const [yearWiseConfigAll, setYearWiseConfigAll] = useState<ChartConfig>({})

  // Years for each utility
  const [yearsElec, setYearsElec] = useState<number[]>([])
  const [yearsWater, setYearsWater] = useState<number[]>([])
  const [yearsGas, setYearsGas] = useState<number[]>([])
  const [yearsAll, setYearsAll] = useState<number[]>([])

  // Dynamic chart config generator
  const getDynamicChartConfig = (years: number[]) => {
    const config: ChartConfig = {}
    years.forEach((year, index) => {
      config[year] = {
        label: String(year),
        color: `hsl(${(index * 70) % 360}, 70%, 50%)`,
      }
    })
    return config
  }

  // Transform monthly data function
  const transformMonthlyData = (data: MonthlyTotal[]) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]

    const grouped: Record<string, { [year: number]: number }> = {}
    data.forEach(({ year, month, totalAmount }) => {
      if (!grouped[month]) {
        grouped[month] = {}
      }
      grouped[month][year] = totalAmount
    })

    return months.map((month) => ({
      month,
      ...grouped[month],
    }))
  }

  // Fetch functions for each utility type
  const fetchChartDataElec = React.useCallback(async () => {
    try {
      const response = await getChartDetails('Electricity', token)
      if (response.data) {
        setChartDataElec(
          Array.isArray(response.data) ? response.data : [response.data]
        )
      } else {
        setChartDataElec([])
      }
    } catch (error) {
      console.error('Error fetching electricity data:', error)
      setChartDataElec([])
    }
  }, [token])

  const fetchChartDataWater = React.useCallback(async () => {
    try {
      const response = await getChartDetails('Water', token)
      if (response.data) {
        setChartDataWater(
          Array.isArray(response.data) ? response.data : [response.data]
        )
      } else {
        setChartDataWater([])
      }
    } catch (error) {
      console.error('Error fetching water data:', error)
      setChartDataWater([])
    }
  }, [token])

  const fetchChartDataGas = React.useCallback(async () => {
    try {
      const response = await getChartDetails('Gas', token)
      if (response.data) {
        setChartDataGas(
          Array.isArray(response.data) ? response.data : [response.data]
        )
      } else {
        setChartDataGas([])
      }
    } catch (error) {
      console.error('Error fetching gas data:', error)
      setChartDataGas([])
    }
  }, [token])

  // Combine all utilities data
  const combineAllUtilitiesData = React.useCallback(() => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]

    const combined = months.map((month) => {
      const result: any = { month }

      // Get all unique years from all utilities
      const allYears = new Set([
        ...chartDataElec.map((d) => d.year),
        ...chartDataWater.map((d) => d.year),
        ...chartDataGas.map((d) => d.year),
      ])

      allYears.forEach((year) => {
        const elecData = chartDataElec.find(
          (d) => d.year === year && d.month === month
        )
        const waterData = chartDataWater.find(
          (d) => d.year === year && d.month === month
        )
        const gasData = chartDataGas.find(
          (d) => d.year === year && d.month === month
        )

        const total =
          (elecData?.totalAmount || 0) +
          (waterData?.totalAmount || 0) +
          (gasData?.totalAmount || 0)
        if (total > 0) {
          result[year] = total
        }
      })

      return result
    })

    setChartDataAll(combined)
  }, [chartDataElec, chartDataWater, chartDataGas])

  // Initial data fetch
  useEffect(() => {
    if (token) {
      fetchChartDataElec()
      fetchChartDataWater()
      fetchChartDataGas()
    }
  }, [token, fetchChartDataElec, fetchChartDataWater, fetchChartDataGas])

  // Transform electricity data
  useEffect(() => {
    const uniqueYears = Array.from(
      new Set(chartDataElec.map((d) => d.year))
    ).sort()
    const transformed = transformMonthlyData(chartDataElec)
    const config = getDynamicChartConfig(uniqueYears)

    setYearsElec(uniqueYears)
    setTransformedDataElec(transformed)
    setYearWiseConfigElec(config)
  }, [chartDataElec])

  // Transform water data
  useEffect(() => {
    const uniqueYears = Array.from(
      new Set(chartDataWater.map((d) => d.year))
    ).sort()
    const transformed = transformMonthlyData(chartDataWater)
    const config = getDynamicChartConfig(uniqueYears)

    setYearsWater(uniqueYears)
    setTransformedDataWater(transformed)
    setYearWiseConfigWater(config)
  }, [chartDataWater])

  // Transform gas data
  useEffect(() => {
    const uniqueYears = Array.from(
      new Set(chartDataGas.map((d) => d.year))
    ).sort()
    const transformed = transformMonthlyData(chartDataGas)
    const config = getDynamicChartConfig(uniqueYears)

    setYearsGas(uniqueYears)
    setTransformedDataGas(transformed)
    setYearWiseConfigGas(config)
  }, [chartDataGas])

  // Combine and transform all utilities data
  useEffect(() => {
    combineAllUtilitiesData()
  }, [combineAllUtilitiesData])

  useEffect(() => {
    const uniqueYears = Array.from(
      new Set([
        ...chartDataElec.map((d) => d.year),
        ...chartDataWater.map((d) => d.year),
        ...chartDataGas.map((d) => d.year),
      ])
    ).sort()

    const config = getDynamicChartConfig(uniqueYears)
    setYearsAll(uniqueYears)
    setTransformedDataAll(chartDataAll)
    setYearWiseConfigAll(config)
  }, [chartDataAll, chartDataElec, chartDataWater, chartDataGas])

  const companies = [
    { value: 'acme-corp', label: 'Acme Corporation' },
    { value: 'tech-solutions', label: 'Tech Solutions Inc' },
    { value: 'global-industries', label: 'Global Industries' },
    { value: 'green-energy', label: 'Green Energy Co' },
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Utility Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor your utility consumption and costs
          </p>
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
            <CardTitle>Electricity Cost Breakdown</CardTitle>
            <CardDescription>Monthly total amount by year</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={yearWiseConfigElec}>
              <LineChart
                data={transformedDataElec}
                width={900}
                height={300}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                {yearsElec.map((year, index) => (
                  <Line
                    key={year}
                    type="monotone"
                    dataKey={String(year)}
                    stroke={`hsl(${(index * 70) % 360}, 70%, 50%)`}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Water Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Water Cost Breakdown</CardTitle>
            <CardDescription>Monthly total amount by year</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={yearWiseConfigWater}>
              <LineChart
                data={transformedDataWater}
                width={900}
                height={300}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                {yearsWater.map((year, index) => (
                  <Line
                    key={year}
                    type="monotone"
                    dataKey={String(year)}
                    stroke={`hsl(${(index * 70) % 360}, 70%, 50%)`}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gas Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Gas Cost Breakdown</CardTitle>
            <CardDescription>Monthly total amount by year</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={yearWiseConfigGas}>
              <LineChart
                data={transformedDataGas}
                width={900}
                height={300}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                {yearsGas.map((year, index) => (
                  <Line
                    key={year}
                    type="monotone"
                    dataKey={String(year)}
                    stroke={`hsl(${(index * 70) % 360}, 70%, 50%)`}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* All Utilities Combined Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              All Utilities Combined
            </CardTitle>
            <CardDescription>
              Combined monthly utility costs by year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={yearWiseConfigAll}>
              <BarChart
                data={transformedDataAll}
                width={900}
                height={300}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                {yearsAll.map((year, index) => (
                  <Bar
                    key={year}
                    dataKey={String(year)}
                    fill={`hsl(${(index * 70) % 360}, 70%, 50%)`}
                    radius={[2, 2, 0, 0]}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UtilityDashboard
