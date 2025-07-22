import { fetchApi } from '@/utils/http'
import { CreateElectricityBillType, GetElectricityBillType } from '@/utils/type'

export async function createBillEntry(
  data: CreateElectricityBillType,
  token: string
) {
  
  return fetchApi<CreateElectricityBillType>({
    url: 'api/utility/createElectricityBill',
    method: 'POST',
    body: data,
    headers: {
      Authorization: ` ${token}`,
      'Content-Type': 'application/json',
    },
  })
}

// Fetch all Bill entry
export async function getBillEntry(token: string) {
  return fetchApi<GetElectricityBillType[]>({
    url: 'api/utility/getBills',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}
