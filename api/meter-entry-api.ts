import { fetchApi } from '@/utils/http'
import {
    AccountsHead,
  CreateElectricityMeterType,
  GetElectricityMeterType,
} from '@/utils/type'

// Create a new meter entry
export async function createMeterEntry(data: CreateElectricityMeterType) {
  return fetchApi<CreateElectricityMeterType>({
    url: 'api/utility/createElecMeter',
    method: 'POST',
    body: data, // pass the data object directly if fetchApi stringifies it
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// Fetch all meter entry
export async function getMeterEntry() {
  return fetchApi<GetElectricityMeterType[]>({
    url: 'api/utility/getElecMeters',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}


export async function getAllCoa() {
  return fetchApi<AccountsHead[]>({
    url: 'api/chart-of-accounts/get-all-coa',
    method: 'GET',
  })
}