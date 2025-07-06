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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllCompanies } from '@/api/common-shared-api'
import { CompanyType } from '@/api/company-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { CustomCombobox } from '@/utils/custom-combobox'
import { getCostByYear } from '@/api/utility-vehicle-dashboard-api'
import { GetAllVehicleType, VehicleCostByYearGetData } from '@/utils/type'
import { getAllVehicles } from '@/api/vehicle.api'

const data = [
  { name: 'Jan', value1: 400, value2: 240 },
  { name: 'Feb', value1: 300, value2: 139 },
  { name: 'Mar', value1: 200, value2: 980 },
  { name: 'Apr', value1: 278, value2: 390 },
  { name: 'May', value1: 189, value2: 480 },
  { name: 'Jun', value1: 239, value2: 380 },
  { name: 'Jul', value1: 349, value2: 430 },
  { name: 'Aug', value1: 289, value2: 290 },
  { name: 'Sep', value1: 329, value2: 500 },
  { name: 'Oct', value1: 269, value2: 420 },
  { name: 'Nov', value1: 319, value2: 550 },
  { name: 'Dec', value1: 239, value2: 340 },
]

const UtilityVehicleDeshboard = () => {
  useInitializeUser()

  const [token] = useAtom(tokenAtom)

  const [getCompany, setGetCompany] = useState<CompanyType[] | null>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  )
  const [vehicles, setVehicles] = useState<GetAllVehicleType[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)

    // Fetch the vehicle data from API
    const fetchVehicles = React.useCallback(async () => {
      if (!token) return
      const response = await getAllVehicles(token)
      const data: GetAllVehicleType[] = response.data ?? []
      setVehicles(data)
     
    }, [token])

  const [costData, setCostData] = useState<VehicleCostByYearGetData | null>(null)
  
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
     fetchCostByYear()
     fetchVehicles()
  }, [fetchCompnay, fetchCostByYear, fetchVehicles])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vehicle Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your vehicle usage and costs
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2 flex justify-end mx-8">
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
        </div>
        <Card className="p-4 shadow-md border-2">
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart 
                data={Array.isArray(costData) ? costData : []}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />

                <YAxis domain={[0, 5000]} ticks={[0, 1000, 2000, 3000, 4000, 5000]} />
                <Tooltip />
                <Legend />
                {costData && Array.isArray(costData) && Array.from(new Set(costData.map((item: VehicleCostByYearGetData) => item.costName))).map((costName, index) => (
                  <Line
                    key={costName}
                    type="monotone"
                    dataKey="amount"
                    name={costName}
                    stroke={`hsl(${index * 70 % 360}, 100%, 50%)`}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    data={costData.filter(item => item.costName === costName)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="p-4 shadow-lg border-2">
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={Array.isArray(costData) ? costData : []}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5000]} ticks={[0, 1000, 2000, 3000, 4000, 5000]} />
                <Tooltip />
                <Legend />
                {costData && Array.isArray(costData) && Array.from(new Set(costData.map((item: VehicleCostByYearGetData) => item.costName))).map((costName, index) => (
                  <Bar
                    key={costName}
                    dataKey="amount"
                    name={costName}
                    fill={`hsl(${index * 70 % 360}, 100%, 50%)`}
                    data={costData.filter(item => item.costName === costName)}
                  />
                ))}
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
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value2" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4 shadow-lg border-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value1" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}

export default UtilityVehicleDeshboard
