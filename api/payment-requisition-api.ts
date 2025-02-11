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
      Authorization: `Bearer ${data.token}`,
      //   Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg0LCJ1c2VybmFtZSI6InJpYWRuIiwiaWF0IjoxNzM5MjU3ODA3LCJleHAiOjE3MzkzNDQyMDd9.U2bbHQSkwzTps9MV5ixvKK81IpdpAJqU474i9hBpPuI`,
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
