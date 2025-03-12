import { fetchApi } from '@/utils/http'
import { CreateElectricityBillType, GetElectricityBillType } from '@/utils/type'

// // Create a new Bill entry
// export async function createBillEntry(data: CreateElectricityBillType) {
//   return fetchApi<CreateElectricityBillType>({
//     url: 'api/utility/createElecMeter',
//     method: 'POST',
//     body: data, // pass the data object directly if fetchApi stringifies it
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   })
// }

export async function createBillEntry(data: CreateElectricityBillType) {
  console.log('Request Payload:', data);  // Log the data being sent
  return fetchApi<CreateElectricityBillType>({
    url: 'api/utility/createElectricityBill',
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// Fetch all Bill entry
export async function getBillEntry() {
  return fetchApi<GetElectricityBillType[]>({
    url: 'api/utility/getBills',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
