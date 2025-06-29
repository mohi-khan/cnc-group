import { fetchApi } from '@/utils/http'
import { CreateVehicleType, GetAllVehicleType } from '@/utils/type'

export async function getAllVehicles(token: string) {
  return fetchApi<GetAllVehicleType[]>({
    url: 'api/vehicle/get-all-vehicles',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function createVehicle(data: CreateVehicleType, token: string) {
  return fetchApi<CreateVehicleType[]>({
    url: 'api/vehicle/create-vehicles',
    method: 'POST',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function updateVehicleEmployee(
  vehicleId: number,
  vehicleUser: number | null,
  token: string
) {
  return fetchApi({
    url: `api/vehicle/update-Vehicle/${vehicleId}/${vehicleUser}`,
    method: 'POST',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
