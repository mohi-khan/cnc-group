import { fetchApi } from '@/utils/http'
import {
    AccountsHead,
  CreateElectricityMeterType,
  GetElectricityMeterType,
} from '@/utils/type'

// Create a new meter entry
export async function createMeterEntry(data: CreateElectricityMeterType, token: string) {
  return fetchApi<CreateElectricityMeterType>({
    url: 'api/utility/createElecMeter',
    method: 'POST',
    body: data, // pass the data object directly if fetchApi stringifies it
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}

// Fetch all meter entry
export async function getMeterEntry(token: string) {
  return fetchApi<GetElectricityMeterType[]>({
    url: 'api/utility/getElecMeters',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}


