import { fetchApi } from '@/utils/http'
import {
  createVehicleFuelConsumptionType,
  GetVehicleConsumptionType,
} from '@/utils/type'

//get all vehicle fuel consumption api
export async function getAllVehicleFuelConsumpiton() {
  return fetchApi<GetVehicleConsumptionType[]>({
    url: 'api/vehicle-fuel-consumption/get-all-vehicle-fuel-consumptions',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

//CreateVehicle Fuel Consumption
export async function createVehicleFuelConsumption(
  data: createVehicleFuelConsumptionType
) {
  return fetchApi<createVehicleFuelConsumptionType[]>({
    url: 'api/vehicle-fuel-consumption/create-vehicle-fuel-consumptions',
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
