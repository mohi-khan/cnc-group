'use client'
import React, { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getAllCompanies } from '@/api/common-shared-api'
import type { CompanyType } from '@/api/company-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { CustomCombobox } from '@/utils/custom-combobox'
import { getCostByYear, getVehiclePer } from '@/api/utility-vehicle-dashboard-api'
import type { GetAllVehicleType, VehicleCostByYearGetData, vehiclePerLitreCost } from '@/utils/type'
import { getAllVehicles } from '@/api/vehicle.api'

const data = [
  { month: 'Jan', year1: 2023, amount1: 240, year2: 2024, amount2: 280 },
  { month: 'Feb', year1: 2022, amount1: 139, year2: 2023, amount2: 159 },
  { month: 'Mar', year1: 2024, amount1: 980, year2: 2025, amount2: 920 },
  { month: 'Apr', year1: 2021, amount1: 390, year2: 2022, amount2: 410 },
  { month: 'May', year1: 2023, amount1: 480, year2: 2024, amount2: 460 },
  { month: 'Jun', year1: 2022, amount1: 380, year2: 2023, amount2: 400 },
  { month: 'Jul', year1: 2024, amount1: 430, year2: 2025, amount2: 450 },
  { month: 'Aug', year1: 2021, amount1: 290, year2: 2022, amount2: 310 },
  { month: 'Sep', year1: 2023, amount1: 500, year2: 2024, amount2: 520 },
  { month: 'Oct', year1: 2022, amount1: 420, year2: 2023, amount2: 440 },
  { month: 'Nov', year1: 2024, amount1: 550, year2: 2025, amount2: 570 },
  { month: 'Dec', year1: 2021, amount1: 340, year2: 2022, amount2: 360 },
]

// Enhanced custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg max-w-xs">
        <p className="font-semibold text-gray-800">{`${label}`}</p>
        <p className="text-lg font-bold text-green-600">{`Total: ${data?.amount?.toLocaleString()}`}</p>
        <p className="text-sm text-blue-600">{`Year: ${data?.year }`}</p>
        {data?.costs && data.costs.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Cost Breakdown:</p>
            {data.costs.map((cost: any, index: number) => (
              <p key={index} className="text-xs text-gray-700">
                {`${cost.costName}: ${cost.amount.toLocaleString()}`}
              </p>
            ))}
          </div>
        )}
      </div>
    )
  }
  return null
}

// Function to format cost data for the chart
const formatCostDataForChart = (
  costData: VehicleCostByYearGetData | null,
 
) => {
  if (!costData || !Array.isArray(costData)) return []

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

  // Filter data for the selected year and group by month
  const monthlyTotals = costData
    
    .reduce((acc: any, item: any) => {
      const monthIndex = item.month - 1 // Convert 1-12 to 0-11
      if (monthIndex >= 0 && monthIndex < 12) {
        if (!acc[monthIndex]) {
          acc[monthIndex] = {
            month: months[monthIndex],
            monthNumber: item.month,
            amount: 0,
           
            costs: [],
          }
        }
        const amount = Number.parseFloat(item.amount) || 0
        acc[monthIndex].amount += amount
        acc[monthIndex].costs.push({
          costName: item.costName,
          amount: amount,
        })
      }
      return acc
    }, {})

  // Convert to array and fill missing months with zero
  return months.map((month, index) => {
    return (
      monthlyTotals[index] || {
        month,
        monthNumber: index + 1,
        amount: 0,
        costs: [],
      }
    )
  })
}

const UtilityVehicleDeshboard = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const [getCompany, setGetCompany] = useState<CompanyType[] | null>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  )
  const [vehicles, setVehicles] = useState<GetAllVehicleType[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null
  )
  const [costData, setCostData] = useState<VehicleCostByYearGetData | null>(
    null
  )
  const [vehiclePer, setVehiclePer] = useState<vehiclePerLitreCost[]>([]) // Adjust type as needed
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  )

  // Fetch the vehicle data from API
  const fetchVehicles = React.useCallback(async () => {
    if (!token) return
    const response = await getAllVehicles(token)
    const data: GetAllVehicleType[] = response.data ?? []
    setVehicles(data)
  }, [token])

  const fetchVehiclePer = React.useCallback(async () => {
      if (!token || !selectedVehicleId) return
      try {
        const response = await getVehiclePer(
          token,
          selectedVehicleId.toString(),
          
        )
        setVehiclePer(response.data.data  || [])
        console.log('fetchVehiclePer response:', response.data)
      } catch (error) {
        console.error('Error fetching vehicle data:', error)
    }
    
    }, [token, selectedVehicleId])
  

  const fetchCostByYear = React.useCallback(async () => {
    if (!token || !selectedCompanyId) return
    try {
      const response = await getCostByYear(token, selectedCompanyId.toString())
      setCostData(response.data)
      console.log('fetchCostByYear response:', response.data)
    } catch (error) {
      console.error('Error fetching cost data:', error)
    }
  }, [token, selectedCompanyId])

  const fetchCompnay = React.useCallback(async () => {
    if (!token) return
    const response = await getAllCompanies(token)
    setGetCompany(response.data)
    console.log(
      'fetchAssetCategories category names asset tsx file:',
      response.data
    )
  }, [token])

  useEffect(() => {
    fetchCompnay()
    fetchVehicles()
  }, [fetchCompnay, fetchVehicles])

  useEffect(() => {
    fetchCostByYear()
    fetchVehiclePer()
  }, [fetchCostByYear, fetchVehiclePer])

  // Format the data for the chart
  const chartData = formatCostDataForChart(costData)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vehicle Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your vehicle usage and costs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2 flex justify-end mx-8 gap-4">
          <CustomCombobox
            items={(getCompany ?? []).map((company) => ({
              id: company?.companyId?.toString() ?? '',
              name: company.companyName || 'Unnamed Company',
            }))}
            value={
              selectedCompanyId !== null
                ? {
                    id: selectedCompanyId.toString(),
                    name:
                      getCompany?.find(
                        (company) => company.companyId === selectedCompanyId
                      )?.companyName || 'Unnamed Company',
                  }
                : null
            }
            onChange={(value: { id: string; name: string } | null) =>
              setSelectedCompanyId(value ? Number.parseInt(value.id, 10) : null)
            }
            placeholder="Select company"
          />
          <input
            type="number"
            className="h-10 px-3 py-2 text-sm border rounded-md"
            onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
            value={selectedYear}
            min={1900}
            max={new Date().getFullYear()}
          />
        </div>

        {/* Fixed Line Chart - Monthly Cost Data */}
        <Card className="p-4 shadow-lg border-2">
          {/* <CardHeader>
            <CardTitle>Monthly Vehicle Costs ({selectedYear})</CardTitle>
            <CardDescription>
              Total costs by month for the selected year
            </CardDescription>
          </CardHeader> */}
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#82ca9d', strokeWidth: 2 }}
                  name={` Total Amount`}
                  label={{
                    position: 'top',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="p-4 shadow-lg border-2">
          {/* <CardHeader>
            <CardTitle>Comparison Chart</CardTitle>
            <CardDescription>Monthly comparison data</CardDescription>
          </CardHeader> */}
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  type="monotone"
                  dataKey="amount"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  fill="#82ca9d"
                  name={` Total Amount`}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2 flex justify-end mx-8">
          <CustomCombobox
            items={(vehicles ?? []).map((vehicle) => ({
              id: vehicle?.vehicleNo?.toString() ?? '',
              name: vehicle.description || 'Unnamed Vehicle',
            }))}
            value={
              selectedVehicleId !== null
                ? {
                    id: selectedVehicleId.toString(),
                    name:
                      vehicles?.find(
                        (vehicle) => vehicle.vehicleNo === selectedVehicleId
                      )?.description || 'Unnamed Vehicle',
                  }
                : null
            }
            onChange={(value: { id: string; name: string } | null) =>
              setSelectedVehicleId(value ? Number.parseInt(value.id, 10) : null)
            }
            placeholder="Select vehicle"
          />
        </div>

        <Card className="p-4 shadow-lg border-2">
          {/* <CardHeader>
            <CardTitle>Vehicle Performance</CardTitle>
            <CardDescription>Individual vehicle metrics</CardDescription>
          </CardHeader> */}
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vehiclePer}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="kmrsperlitre" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="p-4 shadow-lg border-2">
          {/* <CardHeader>
            <CardTitle>Vehicle Costs</CardTitle>
            <CardDescription>Cost breakdown by vehicle</CardDescription>
          </CardHeader> */}
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vehiclePer}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="month" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UtilityVehicleDeshboard
