import { fetchApi } from "@/utils/http";
import { VehicleCostByYearGetData } from "@/utils/type";

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
