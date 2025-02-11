import { fetchApi } from '@/utils/http'
import { PurchaseEntryType } from '@/utils/type'

export async function getAllPaymentRequisition(data: {
  token: string
  companyId: number
}) {
  console.log('🚀 ~ getAllPaymentRequisition ~ token', data.token)
  return fetchApi({
    url: `api/purchase/getPurchaseData?company=73,75,77`,
    method: 'GET',
    headers: {
      Authorization: `${data.token}`,
    },
  })
}

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
