import { fetchApi } from '@/utils/http'
import { BoeApiResponse, BoeGet, CreateBoe } from '@/utils/type'

// Create Bill of Exchange
export async function createBillOfExchange(token: string, data: CreateBoe) {
  return fetchApi<BoeApiResponse[]>({
    url: 'api/create-bill-of-exchange',
    method: 'POST',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

// Get all Bill of Exchange
export async function getAllBillOfExchange(token: string) {
  return fetchApi<BoeGet[]>({
    url: 'api/BillOffExchange/get-bill-of-exchange',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

// Update Bill of Exchange
export async function updateBillOfExchange(
  token: string,
  boeNo: string,
  data: Partial<BoeGet>
) {
  return fetchApi({
    url: `api/update-bill-of-exchange/${boeNo}`,
    method: 'PATCH',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function updateBOEStatus(
  token: string,
  boeNo: string,

) {
  return fetchApi({
    url: `api/BillOffExchange/updateStatus/${boeNo}`,
    method: 'PATCH',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
