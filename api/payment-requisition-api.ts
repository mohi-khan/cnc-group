import { fetchApi } from '@/utils/http'
import { GetPaymentOrder, PurchaseEntryType } from '@/utils/type'

export async function getAllPaymentRequisition(data: {
  token: string
  companyId: number
}) {
  console.log('🚀 ~ getAllPaymentRequisition ~ token', data.token)
  return fetchApi<GetPaymentOrder[]>({
    url: `api/purchase/getPurchaseData?company=73,75,77`,
    method: 'GET',
    headers: {
      Authorization: `${data.token}`,
    },
  })
}

// interface ApiResponse<T> {
//   data: T;
// }

// export async function getAllPaymentRequisition(data: {
//   token: string;
//   companyId: number;
// }): Promise<GetPaymentOrder[]> {
//   console.log('🚀 ~ getAllPaymentRequisition ~ token', data.token);
//   const response = await fetchApi<ApiResponse<GetPaymentOrder[]>>({
//     url: `api/purchase/getPurchaseData?company=73,75,77`,
//     method: 'GET',
//     headers: {
//       Authorization: `${data.token}`,
//     },
//   });
  
//   return response.data;
// }

export async function createPaymentRequisition(
  data: PurchaseEntryType,
  token: string
) {
  return fetchApi({
    url: 'api/purchase/createPurchase',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}
