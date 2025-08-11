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
import { getChartDetails, getUtilityMeter } from '@/api/utility-dashboard-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { getAllCompanies } from '@/api/common-shared-api'
import type { CompanyType } from '@/api/company-api'

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

// Mock utility meters data - replace with your actual data source

const UtilityDashboard = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  // Fixed: Separate states for companies list and selected company
  const [companies, setCompanies] = useState<CompanyType[]>([])
  const [utilityMeters, setUtilityMeters] = useState<any[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')

  // Replace the single selectedLocation state with three separate ones
  const [selectedLocationElec, setSelectedLocationElec] =
    useState<string>('All')
  const [selectedLocationWater, setSelectedLocationWater] =
    useState<string>('All')
  const [selectedLocationGas, setSelectedLocationGas] = useState<string>('All')

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

  const fetchCompany = React.useCallback(async () => {
    try {
      const response = await getAllCompanies(token)
      if (response.data) {
        const companiesData = Array.isArray(response.data)
          ? response.data
          : [response.data]
        setCompanies(companiesData)
        // Auto-select first company if none selected
        if (companiesData.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(String(companiesData[0].companyId ?? ''))
        }
        
      } else {
        setCompanies([])
      }
    } catch (error) {
      console.error('Error fetching company data:', error)
      setCompanies([])
    }
  }, [token, selectedCompanyId])

  const fetchUtilityMeter = React.useCallback(async () => {
      try {
        const response = await getUtilityMeter(token)
        if (response.data) {
          setUtilityMeters(
            Array.isArray(response.data) ? response.data : [response.data]
          )
          
        } else {
          setUtilityMeters([])
        }
      } catch (error) {
        console.error('Error fetching gas data:', error)
        setUtilityMeters([])
      }
    }, [token])
  

  // Helper function to get location parameter
  const getLocationParam = (location: string) => {
    return location === 'All' ? '' : location
  }

  const fetchChartDataElec = React.useCallback(async () => {
    if (!selectedCompanyId) return
    try {
      const locationParam = getLocationParam(selectedLocationElec)
      const response = await getChartDetails(
        'Electricity',
        token,
        locationParam
      )
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
  }, [token, selectedCompanyId, selectedLocationElec])

  const fetchChartDataWater = React.useCallback(async () => {
    if (!selectedCompanyId) return
    try {
      const locationParam = getLocationParam(selectedLocationWater)
      const response = await getChartDetails('Water', token, locationParam)
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
  }, [token, selectedCompanyId, selectedLocationWater])

  const fetchChartDataGas = React.useCallback(async () => {
    if (!selectedCompanyId) return
    try {
      const locationParam = getLocationParam(selectedLocationGas)
      const response = await getChartDetails('Gas', token, locationParam)
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
  }, [token, selectedCompanyId, selectedLocationGas])

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
      fetchCompany()
    }
  }, [token, fetchCompany])

  // Fetch chart data when company or location is selected
  useEffect(() => {
    if (token && selectedCompanyId) {
      fetchChartDataElec()
      fetchChartDataWater()
      fetchChartDataGas()
      fetchUtilityMeter()
    }
  }, [
    token,
    selectedCompanyId,
    selectedLocationElec,
    selectedLocationWater,
    selectedLocationGas,
    fetchChartDataElec,
    fetchChartDataWater,
    fetchChartDataGas,
    fetchUtilityMeter,
  ])

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

  // Get selected company name for display
  const selectedCompany = companies.find(
    (c) => String(c.companyId) === selectedCompanyId
  )

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Electricity Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Electricity Cost Breakdown</CardTitle>
                <CardDescription>
                  Monthly total amount by year
                  {selectedLocationElec !== 'All' && (
                    <span className="ml-2 text-sm font-medium">
                      • {selectedLocationElec}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="w-48">
                <Select
                  value={selectedLocationElec}
                  onValueChange={setSelectedLocationElec}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Locations</SelectItem>
                    {utilityMeters.map((meter, index) => (
                      <SelectItem
                        key={index}
                        value={String(meter.location ?? '')}
                      >
                        {meter.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Water Cost Breakdown</CardTitle>
                <CardDescription>
                  Monthly total amount by year
                  {selectedLocationWater !== 'All' && (
                    <span className="ml-2 text-sm font-medium">
                      • {selectedLocationWater}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="w-48">
                <Select
                  value={selectedLocationWater}
                  onValueChange={setSelectedLocationWater}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Locations</SelectItem>
                    {utilityMeters.map((meter, index) => (
                      <SelectItem
                        key={index}
                        value={String(meter.location ?? '')}
                      >
                        {meter.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gas Cost Breakdown</CardTitle>
                <CardDescription>
                  Monthly total amount by year
                  {selectedLocationGas !== 'All' && (
                    <span className="ml-2 text-sm font-medium">
                      • {selectedLocationGas}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="w-48">
                <Select
                  value={selectedLocationGas}
                  onValueChange={setSelectedLocationGas}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Locations</SelectItem>
                    {utilityMeters.map((meter, index) => (
                      <SelectItem
                        key={index}
                        value={String(meter.location ?? '')}
                      >
                        {meter.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
