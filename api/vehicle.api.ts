import { fetchApi } from '@/utils/http'
import { CreateVehicleType, GetAllVehicleType } from '@/utils/type'

export async function getAllVehicles() {
  return fetchApi<GetAllVehicleType[]>({
    url: 'api/vehicle/get-all-vehicles',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function createVehicle(data: CreateVehicleType) {
  return fetchApi<CreateVehicleType[]>({
    url: 'api/vehicle/create-vehicles',
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function updateVehicleEmployee(
  vehicleId: number,
  vehicleUser: number | null
) {
  return fetchApi({
    url: `api/vehicle/update-Vehicle/${vehicleId}/${vehicleUser}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
