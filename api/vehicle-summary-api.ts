import { fetchApi } from '@/utils/http'
import { VehicleSummaryType } from '@/utils/type'

export async function getVehicleSummary({
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
  return fetchApi<VehicleSummaryType[]>({
    url: `api/vehicle/getVehicleSummery?vehicleNo=${vehicleNo}&startDate=${startDate}&endDate=${endDate}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}
