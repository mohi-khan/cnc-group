import { fetchApi } from "@/utils/http";
import { VehicleCostByYearGetData, vehiclePerLitreCost } from "@/utils/type";

export async function getCostByYear(token: string, companyId: string) {
  return fetchApi<VehicleCostByYearGetData>({
    url: `api/vehicle/getcostByYear/${companyId}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getVehiclePer(token: string, vehicleId: string) {
  return fetchApi<vehiclePerLitreCost>({
    url: `api/vehicle/getVehiclePer/${vehicleId}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
