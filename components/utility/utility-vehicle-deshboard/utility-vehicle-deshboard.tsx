// "use client"

// import React, { useEffect, useState } from "react"
// import { CartesianGrid, XAxis, YAxis, LineChart, Line, BarChart, Bar } from "recharts"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
// import { getAllCompanies } from "@/api/common-shared-api"
// import type { CompanyType } from "@/api/company-api"
// import { tokenAtom, useInitializeUser } from "@/utils/user"
// import { useAtom } from "jotai"
// import { getCostByYear, getVehiclePer } from "@/api/utility-vehicle-dashboard-api"
// import type { GetAllVehicleType, VehicleCostByYearGetData, vehiclePerLitreCost } from "@/utils/type"
// import { getAllVehicles } from "@/api/vehicle.api"

// // Types for transformed data
// export type MonthlyVehicleCost = {
//   year: number
//   month: "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun" | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec"
//   amount: number
//   costs: Array<{ costName: string; amount: number }>
// }

// export type VehiclePerformanceData = {
//   year: number
//   month: string
//   kmrsperlitre: number
// }

// const UtilityVehicleDashboard = () => {
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)

//   // Company and Vehicle Selection States
//   const [companies, setCompanies] = useState<CompanyType[]>([])
//   const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
//   const [vehicles, setVehicles] = useState<GetAllVehicleType[]>([])
//   const [selectedVehicleId, setSelectedVehicleId] = useState<string>("")

//   // Data States
//   const [costData, setCostData] = useState<VehicleCostByYearGetData | null>(null)
//   const [vehiclePerformanceData, setVehiclePerformanceData] = useState<vehiclePerLitreCost[]>([])

//   // Transformed Data States
//   const [transformedCostData, setTransformedCostData] = useState<any[]>([])
//   const [transformedPerformanceData, setTransformedPerformanceData] = useState<any[]>([])

//   // Chart Configuration States
//   const [costChartConfig, setCostChartConfig] = useState<ChartConfig>({})
//   const [performanceChartConfig, setPerformanceChartConfig] = useState<ChartConfig>({})

//   // Years for charts
//   const [costYears, setCostYears] = useState<number[]>([])
//   const [performanceYears, setPerformanceYears] = useState<number[]>([])

//   // Selected year for filtering
//   const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

//   // Dynamic chart config generator
//   const getDynamicChartConfig = (years: number[]) => {
//     const config: ChartConfig = {}
//     years.forEach((year, index) => {
//       config[year] = {
//         label: String(year),
//         color: `hsl(${(index * 70) % 360}, 70%, 50%)`,
//       }
//     })
//     return config
//   }

//   // Transform cost data for multi-year display
//   const transformCostDataForChart = (costData: VehicleCostByYearGetData | null) => {
//     if (!costData || !Array.isArray(costData)) return []

//     const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
//     const grouped: Record<string, { [year: number]: number }> = {}

//     // Group data by month and year
//     costData.forEach((item: any) => {
//       const monthIndex = item.month - 1
//       if (monthIndex >= 0 && monthIndex < 12) {
//         const monthName = months[monthIndex]
//         const amount = Number.parseFloat(item.amount) || 0
//         const year = item.year || new Date().getFullYear()

//         if (!grouped[monthName]) {
//           grouped[monthName] = {}
//         }

//         if (!grouped[monthName][year]) {
//           grouped[monthName][year] = 0
//         }

//         grouped[monthName][year] += amount
//       }
//     })

//     // Convert to chart format
//     return months.map((month) => ({
//       month,
//       ...grouped[month],
//     }))
//   }

//   // Transform performance data for multi-year display
//   const transformPerformanceDataForChart = (performanceData: vehiclePerLitreCost[]) => {
//     if (!performanceData || !Array.isArray(performanceData)) return []

//     const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
//     const grouped: Record<string, { [year: number]: number }> = {}

//     // Group data by month and year
//     performanceData.forEach((item: any) => {
//       const monthName = item.month
//       const kmrsperlitre = Number.parseFloat(item.kmrsperlitre) || 0
//       const year = item.year || new Date().getFullYear()

//       if (!grouped[monthName]) {
//         grouped[monthName] = {}
//       }

//       grouped[monthName][year] = kmrsperlitre
//     })

//     // Convert to chart format
//     return months.map((month) => ({
//       month,
//       ...grouped[month],
//     }))
//   }

//   // Fetch Functions
//   const fetchCompanies = React.useCallback(async () => {
//     if (!token) return
//     try {
//       const response = await getAllCompanies(token)
//       if (response.data) {
//         const companiesData = Array.isArray(response.data) ? response.data : [response.data]
//         setCompanies(companiesData)

//         // Auto-select first company if none selected
//         if (companiesData.length > 0 && !selectedCompanyId) {
//           setSelectedCompanyId(String(companiesData[0].companyId ?? ""))
//         }
//       } else {
//         setCompanies([])
//       }
//     } catch (error) {
//       console.error("Error fetching companies:", error)
//       setCompanies([])
//     }
//   }, [token, selectedCompanyId])

//   const fetchVehicles = React.useCallback(async () => {
//     if (!token) return
//     try {
//       const response = await getAllVehicles(token)
//       const data: GetAllVehicleType[] = response.data ?? []
//       setVehicles(data)

//       // Auto-select first vehicle if none selected
//       if (data.length > 0 && !selectedVehicleId) {
//         setSelectedVehicleId(String(data[0].vehicleNo ?? ""))
//       }
//     } catch (error) {
//       console.error("Error fetching vehicles:", error)
//       setVehicles([])
//     }
//   }, [token, selectedVehicleId])

//   const fetchCostByYear = React.useCallback(async () => {
//     if (!token || !selectedCompanyId) return
//     try {
//       const response = await getCostByYear(token, selectedCompanyId)
//       setCostData(response.data)
//     } catch (error) {
//       console.error("Error fetching cost data:", error)
//       setCostData(null)
//     }
//   }, [token, selectedCompanyId])

//   const fetchVehiclePerformance = React.useCallback(async () => {
//     if (!token || !selectedVehicleId) return
//     try {
//       const response = await getVehiclePer(token, selectedVehicleId)
//       const vehicleData = { data: Array.isArray(response.data) ? response.data : [response.data] } as { data: vehiclePerLitreCost[] }
//       setVehiclePerformanceData(vehicleData.data || [])
//       console.log("Vehicle Performance Data:", vehicleData.data)  
//     } catch (error) {
//       console.error("Error fetching vehicle performance data:", error)
//       setVehiclePerformanceData([])
//     }
//   }, [token, selectedVehicleId])

//   // Initial data fetch
//   useEffect(() => {
//     if (token) {
//       fetchCompanies()
//       fetchVehicles()
//     }
//   }, [token, fetchCompanies, fetchVehicles])

//   // Fetch data when selections change
//   useEffect(() => {
//     if (token && selectedCompanyId) {
//       fetchCostByYear()
//     }
//   }, [token, selectedCompanyId, fetchCostByYear])

//   useEffect(() => {
//     if (token && selectedVehicleId) {
//       fetchVehiclePerformance()
//     }
//   }, [token, selectedVehicleId, fetchVehiclePerformance])

//   // Transform cost data
//   useEffect(() => {
//     if (costData) {
//       const uniqueYears = Array.from(new Set(Array.isArray(costData) ? costData.map((d: VehicleCostByYearGetData) => d.year || new Date().getFullYear()) : [costData].map((d: VehicleCostByYearGetData) => d.year || new Date().getFullYear()))).sort() as number[]
//       const transformed = transformCostDataForChart(costData)
//       const config = getDynamicChartConfig(uniqueYears)

//       setCostYears(uniqueYears)
//       setTransformedCostData(transformed)
//       setCostChartConfig(config)
//     }
//   }, [costData])

//   // Transform performance data
//   useEffect(() => {
//     if (vehiclePerformanceData.length > 0) {
//       const uniqueYears = Array.from(
//         new Set(vehiclePerformanceData.map((d: any) => d.year || new Date().getFullYear())),
//       ).sort()
//       const transformed = transformPerformanceDataForChart(vehiclePerformanceData)
//       const config = getDynamicChartConfig(uniqueYears)

//       setPerformanceYears(uniqueYears)
//       setTransformedPerformanceData(transformed)
//       setPerformanceChartConfig(config)
//     }
//   }, [vehiclePerformanceData])

//   // // Get selected company and vehicle names for display
//   // const selectedCompany = companies.find((c) => String(c.companyId) === selectedCompanyId)
//   // const selectedVehicle = vehicles.find((v) => String(v.vehicleNo) === selectedVehicleId)

//   return (
//     <div className="min-h-screen bg-background p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Vehicle Dashboard</h1>
//           {/* <p className="text-muted-foreground">
//             Monitor your vehicle usage and costs
//             {selectedCompany && <span className="ml-2 text-primary font-medium">- {selectedCompany.companyName}</span>}
//             {selectedVehicle && (
//               <span className="ml-2 text-secondary-foreground font-medium">| {selectedVehicle.description}</span>
//             )}
//           </p> */}
//         </div>

//         {/* Controls */}
//         <div className="flex gap-4">
//           <div className="w-64">
//             <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select company" />
//               </SelectTrigger>
//               <SelectContent>
//                 {companies.map((company) => (
//                   <SelectItem key={String(company.companyId ?? "")} value={String(company.companyId ?? "")}>
//                     {company.companyName}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <input
//             type="number"
//             className="h-10 px-3 py-2 text-sm border rounded-md w-32"
//             onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
//             value={selectedYear}
//             min={1900}
//             max={new Date().getFullYear()}
//             placeholder="Year"
//           />
//         </div>
//       </div>

//       {/* Show message if no company selected */}
//       {!selectedCompanyId && companies.length > 0 && (
//         <div className="text-center py-8">
//           <p className="text-muted-foreground">Please select a company to view vehicle cost data.</p>
//         </div>
//       )}

//       {/* Vehicle Cost Charts - Only show if company is selected */}
//       {selectedCompanyId && (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//           {/* Vehicle Cost Line Chart */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Vehicle Cost Breakdown</CardTitle>
//               <CardDescription>Monthly vehicle costs by year</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ChartContainer config={costChartConfig}>
//                 <LineChart data={transformedCostData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
//                   <ChartTooltip content={<ChartTooltipContent />} />
//                   {costYears.map((year, index) => (
//                     <Line
//                       key={year}
//                       type="monotone"
//                       dataKey={String(year)}
//                       stroke={`hsl(${(index * 70) % 360}, 70%, 50%)`}
//                       strokeWidth={2}
//                       dot={{ r: 3 }}
//                     />
//                   ))}
//                 </LineChart>
//               </ChartContainer>
//             </CardContent>
//           </Card>

//           {/* Vehicle Cost Bar Chart */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Vehicle Cost Overview</CardTitle>
//               <CardDescription>Monthly vehicle costs comparison</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ChartContainer config={costChartConfig}>
//                 <BarChart data={transformedCostData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
//                   <ChartTooltip content={<ChartTooltipContent />} />
//                   {costYears.map((year, index) => (
//                     <Bar
//                       key={year}
//                       dataKey={String(year)}
//                       fill={`hsl(${(index * 70) % 360}, 70%, 50%)`}
//                       radius={[2, 2, 0, 0]}
//                     />
//                   ))}
//                 </BarChart>
//               </ChartContainer>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Vehicle Selection for Performance Charts */}
//       <div className="flex justify-end mb-6">
//         <div className="w-64">
//           <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select vehicle" />
//             </SelectTrigger>
//             <SelectContent>
//               {vehicles.map((vehicle) => (
//                 <SelectItem key={String(vehicle.vehicleNo ?? "")} value={String(vehicle.vehicleNo ?? "")}>
//                   {vehicle.description || "Unnamed Vehicle"}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {/* Show message if no vehicle selected */}
//       {!selectedVehicleId && vehicles.length > 0 && (
//         <div className="text-center py-8">
//           <p className="text-muted-foreground">Please select a vehicle to view performance data.</p>
//         </div>
//       )}

//       {/* Vehicle Performance Charts - Only show if vehicle is selected */}
//       {selectedVehicleId && (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Vehicle Performance Line Chart */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Vehicle Fuel Efficiency</CardTitle>
//               <CardDescription>Kilometers per liter by month</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ChartContainer config={performanceChartConfig}>
//                 <LineChart data={transformedPerformanceData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis tickFormatter={(value) => `${value} km/l`} />
//                   <ChartTooltip content={<ChartTooltipContent />} />
//                   {performanceYears.map((year, index) => (
//                     <Line
//                       key={year}
//                       type="monotone"
//                       dataKey={String(year)}
//                       stroke={`hsl(${(index * 70) % 360}, 70%, 50%)`}
//                       strokeWidth={2}
//                       dot={{ r: 3 }}
//                     />
//                   ))}
//                 </LineChart>
//               </ChartContainer>
//             </CardContent>
//           </Card>

//           {/* Vehicle Performance Bar Chart */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Fuel Efficiency Overview</CardTitle>
//               <CardDescription>Monthly fuel efficiency comparison</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ChartContainer config={performanceChartConfig}>
//                 <BarChart data={transformedPerformanceData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis tickFormatter={(value) => `${value} km/l`} />
//                   <ChartTooltip content={<ChartTooltipContent />} />
//                   {performanceYears.map((year, index) => (
//                     <Bar
//                       key={year}
//                       dataKey={String(year)}
//                       fill={`hsl(${(index * 70) % 360}, 70%, 50%)`}
//                       radius={[2, 2, 0, 0]}
//                     />
//                   ))}
//                 </BarChart>
//               </ChartContainer>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </div>
//   )
// }

// export default UtilityVehicleDashboard


"use client"

import React, { useEffect, useState } from "react"
import { CartesianGrid, XAxis, YAxis, LineChart, Line, BarChart, Bar } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { getAllCompanies } from "@/api/common-shared-api"
import type { CompanyType } from "@/api/company-api"
import { tokenAtom, useInitializeUser } from "@/utils/user"
import { useAtom } from "jotai"
import { getCostByYear, getVehiclePer } from "@/api/utility-vehicle-dashboard-api"
import type { GetAllVehicleType, VehicleCostByYearGetData, vehiclePerLitreCost } from "@/utils/type"
import { getAllVehicles } from "@/api/vehicle.api"

// Types for transformed data
export type MonthlyVehicleCost = {
  year: number
  month: "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun" | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec"
  amount: number
  costs: Array<{ costName: string; amount: number }>
}

export type VehiclePerformanceData = {
  year: number

  month: "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun" | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec"
  kmrsperlitre: number
  costs: Array<{ costName: string; kmrsperlitre: number }>
}

const UtilityVehicleDashboard = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)

  // Company and Vehicle Selection States
  const [companies, setCompanies] = useState<CompanyType[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [vehicles, setVehicles] = useState<GetAllVehicleType[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("")

  // Data States
  const [costData, setCostData] = useState<VehicleCostByYearGetData | null>(null)
  const [vehiclePerformanceData, setVehiclePerformanceData] = useState<vehiclePerLitreCost[]>([])

  // Transformed Data States
  const [transformedCostData, setTransformedCostData] = useState<any[]>([])
  const [transformedPerformanceData, setTransformedPerformanceData] = useState<any[]>([])

  // Chart Configuration States
  const [costChartConfig, setCostChartConfig] = useState<ChartConfig>({})
  const [performanceChartConfig, setPerformanceChartConfig] = useState<ChartConfig>({})

  // Years for charts
  const [costYears, setCostYears] = useState<number[]>([])
  const [performanceYears, setPerformanceYears] = useState<number[]>([])

  // Selected year for filtering
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

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

  // Transform cost data for multi-year display
  const transformCostDataForChart = (costData: VehicleCostByYearGetData | null) => {
    if (!costData || !Array.isArray(costData)) return []

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const grouped: Record<string, { [year: number]: number }> = {}

    // Group data by month and year
    costData.forEach((item: any) => {
      const monthIndex = item.month - 1
      if (monthIndex >= 0 && monthIndex < 12) {
        const monthName = months[monthIndex]
        const amount = Number.parseFloat(item.amount) || 0
        const year = item.year || new Date().getFullYear()

        if (!grouped[monthName]) {
          grouped[monthName] = {}
        }

        if (!grouped[monthName][year]) {
          grouped[monthName][year] = 0
        }

        grouped[monthName][year] += amount
      }
    })

    // Convert to chart format
    return months.map((month) => ({
      month,
      ...grouped[month],
    }))
  }

  // Transform performance data to show individual records with year, month, kmrsperlitre
  const transformPerformanceDataForChart = (performanceData: vehiclePerLitreCost[]) => {
    if (!performanceData || !Array.isArray(performanceData)) return []

    // Return the data in the format: { year, month, kmrsperlitre }
    return performanceData.map((item: any) => ({
      year: item.year || new Date().getFullYear(),
      month: item.month || "Jan",
      kmrsperlitre: Number.parseFloat(item.kmrsperlitre) || 0,
      // Create a combined label for better display
      monthYear: `${item.month} ${item.year || new Date().getFullYear()}`,
    }))
  }

  // Fetch Functions
  const fetchCompanies = React.useCallback(async () => {
    if (!token) return
    try {
      const response = await getAllCompanies(token)
      if (response.data) {
        const companiesData = Array.isArray(response.data) ? response.data : [response.data]
        setCompanies(companiesData)

        // Auto-select first company if none selected
        if (companiesData.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(String(companiesData[0].companyId ?? ""))
        }
      } else {
        setCompanies([])
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
      setCompanies([])
    }
  }, [token, selectedCompanyId])

  const fetchVehicles = React.useCallback(async () => {
    if (!token) return
    try {
      const response = await getAllVehicles(token)
      const data: GetAllVehicleType[] = response.data ?? []
      setVehicles(data)

      // Auto-select first vehicle if none selected
      if (data.length > 0 && !selectedVehicleId) {
        setSelectedVehicleId(String(data[0].vehicleNo ?? ""))
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error)
      setVehicles([])
    }
  }, [token, selectedVehicleId])

  const fetchCostByYear = React.useCallback(async () => {
    if (!token || !selectedCompanyId) return
    try {
      const response = await getCostByYear(token, selectedCompanyId)
      setCostData(response.data)
    } catch (error) {
      console.error("Error fetching cost data:", error)
      setCostData(null)
    }
  }, [token, selectedCompanyId])

  const fetchVehiclePerformance = React.useCallback(async () => {
    if (!token || !selectedVehicleId) return
    try {
      const response = await getVehiclePer(token, selectedVehicleId)
     const vehicleData = { data: Array.isArray(response.data) ? response.data : [response.data] } as { data: vehiclePerLitreCost[] }

      // Log the data to debug
      console.log("Vehicle Performance Data:", vehicleData)

      setVehiclePerformanceData(vehicleData.data)
    } catch (error) {
      console.error("Error fetching vehicle performance data:", error)
      setVehiclePerformanceData([])
    }
  }, [token, selectedVehicleId])

  // Initial data fetch
  useEffect(() => {
    if (token) {
      fetchCompanies()
      fetchVehicles()
    }
  }, [token, fetchCompanies, fetchVehicles])

  // Fetch data when selections change
  useEffect(() => {
    if (token && selectedCompanyId) {
      fetchCostByYear()
    }
  }, [token, selectedCompanyId, fetchCostByYear])

  useEffect(() => {
    if (token && selectedVehicleId) {
      fetchVehiclePerformance()
    }
  }, [token, selectedVehicleId, fetchVehiclePerformance])

  // Transform cost data
  useEffect(() => {


    if (costData && Array.isArray(costData)) {
      const uniqueYears = Array.from(new Set(costData.map((d) => d.year || new Date().getFullYear()))).sort() as number[]
      const transformed = transformCostDataForChart(costData)
      const config = getDynamicChartConfig(uniqueYears)

      setCostYears(uniqueYears)
      setTransformedCostData(transformed)
      setCostChartConfig(config)
    }
  }, [costData])

  // Transform performance data
  useEffect(() => {
    if (vehiclePerformanceData.length > 0) {
      const transformed = transformPerformanceDataForChart(vehiclePerformanceData)
      const uniqueYears = Array.from(
        new Set(vehiclePerformanceData.map((d: any) => d.year || new Date().getFullYear())),
      ).sort()

      setPerformanceYears(uniqueYears)
      setTransformedPerformanceData(transformed)

      // Simple config for single data series
      setPerformanceChartConfig({
        kmrsperlitre: {
          label: "Fuel Efficiency (km/l)",
          color: "hsl(220, 70%, 50%)",
        },
      })
    }
  }, [vehiclePerformanceData])

  // Get selected company and vehicle names for display
  const selectedCompany = companies.find((c) => String(c.companyId) === selectedCompanyId)
  const selectedVehicle = vehicles.find((v) => String(v.vehicleNo) === selectedVehicleId)

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your vehicle usage and costs
            {selectedCompany && <span className="ml-2 text-primary font-medium">- {selectedCompany.companyName}</span>}
            {selectedVehicle && (
              <span className="ml-2 text-secondary-foreground font-medium">| {selectedVehicle.description}</span>
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <div className="w-64">
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={String(company.companyId ?? "")} value={String(company.companyId ?? "")}>
                    {company.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <input
            type="number"
            className="h-10 px-3 py-2 text-sm border rounded-md w-32"
            onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
            value={selectedYear}
            min={1900}
            max={new Date().getFullYear()}
            placeholder="Year"
          />
        </div>
      </div>

      {/* Show message if no company selected */}
      {!selectedCompanyId && companies.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please select a company to view vehicle cost data.</p>
        </div>
      )}

      {/* Vehicle Cost Charts - Only show if company is selected */}
      {selectedCompanyId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Vehicle Cost Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Cost Breakdown</CardTitle>
              <CardDescription>Monthly vehicle costs by year</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={costChartConfig}>
                <LineChart data={transformedCostData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {costYears.map((year, index) => (
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

          {/* Vehicle Cost Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Cost Overview</CardTitle>
              <CardDescription>Monthly vehicle costs comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={costChartConfig}>
                <BarChart data={transformedCostData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {costYears.map((year, index) => (
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
      )}

      {/* Vehicle Selection for Performance Charts */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle) => (
                <SelectItem key={String(vehicle.vehicleNo ?? "")} value={String(vehicle.vehicleNo ?? "")}>
                  {vehicle.description || "Unnamed Vehicle"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Show message if no vehicle selected */}
      {!selectedVehicleId && vehicles.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please select a vehicle to view performance data.</p>
        </div>
      )}

      {/* Vehicle Performance Charts - Only show if vehicle is selected */}
      {selectedVehicleId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Performance Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Fuel Efficiency (Line Chart)</CardTitle>
              <CardDescription>Kilometers per liter performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ kmrsperlitre: { label: "km/l", color: "hsl(220, 70%, 50%)" } }}>
                <LineChart data={transformedPerformanceData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthYear" />
                  <YAxis tickFormatter={(value) => `${value} km/l`} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [`${value} km/l`, "Fuel Efficiency"]}
                        labelFormatter={(label) => `Period: ${label}`}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="kmrsperlitre"
                    stroke="hsl(220, 70%, 50%)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Fuel Efficiency"
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Vehicle Performance Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Fuel Efficiency (Bar Chart)</CardTitle>
              <CardDescription>Monthly kilometers per liter comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ kmrsperlitre: { label: "km/l", color: "hsl(160, 70%, 50%)" } }}>
                <BarChart data={transformedPerformanceData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthYear" />
                  <YAxis tickFormatter={(value) => `${value} km/l`} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [`${value} km/l`, "Fuel Efficiency"]}
                        labelFormatter={(label) => `Period: ${label}`}
                      />
                    }
                  />
                  <Bar dataKey="kmrsperlitre" fill="hsl(160, 70%, 50%)" radius={[2, 2, 0, 0]} name="Fuel Efficiency" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default UtilityVehicleDashboard



