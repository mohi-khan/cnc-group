import { fetchApi } from '@/utils/http'
import { FdrCreateType, FdrGetType } from '@/utils/type'

// Create FDR Record
export async function createFdr(data: FdrCreateType, token: string) {
  return fetchApi<FdrCreateType[]>({
    url: 'api/FDR/createfdr',
    method: 'POST',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

// Get All FDR Records
export async function getFdrData(token: string) {
  return fetchApi<FdrGetType[]>({
    url: 'api/FDR/getfdr',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
