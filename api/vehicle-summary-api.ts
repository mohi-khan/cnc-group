import { fetchApi } from '@/utils/http'
import { VehicleSummaryType } from '@/utils/type'

export async function getVehicleSummery({
  vehicleNo,
  startDate,
  endDate,
  token,
}: {
  startDate: string
  endDate: string
  vehicleNo: number
  token: string
}) {
  console.log(
    'Fetching budget details for ID and tokekn from budget api:',
    vehicleNo,
    startDate,
    endDate,
    token
  )
  return fetchApi<VehicleSummaryType[]>({
    // url: `api/vehicle/getVehicleSummery?vehicleNo=${id}&startDate=${fromdate}&endDate=${enddate}`,
    url: 'api/vehicle/getVehicleSummery?vehicleNo=1&startDate=2025-01-01&endDate=2025-03-13',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg0LCJ1c2VybmFtZSI6InJpYWRuIiwiaWF0IjoxNzQxODQ1OTA2LCJleHAiOjE3NDE5MzIzMDZ9.mTAHabh9G1mrl8xxdcZbAhiILZrMLF_OxlYoh8V8zdg`,
    },
  })
}
