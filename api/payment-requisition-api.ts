import { fetchApi } from '@/utils/http'
import { ApproveInvoiceType, CreateInvoiceType, GetPaymentOrder, PurchaseEntryType, RequisitionAdvanceType } from '@/utils/type'

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

export async function getAllAdvance(data: {
  token: string
}) {
  console.log('🚀 ~ getAllPaymentRequisition ~ token', data.token)
  return fetchApi<RequisitionAdvanceType[]>({
    url: `api/Advance/getAdvance`,
    method: 'GET',
    headers: {
      Authorization: `${data.token}`,
    },
  })
}

export async function createInvoice(
  data: CreateInvoiceType,
  token: string
) {
  return fetchApi({
    url: 'api/invoice/createInvoice',
    method: 'POST',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    body: data,
  })
}

export async function createAdvance(
  data: RequisitionAdvanceType,
  token: string
) {
  console.log('🚀 ~ createAdvance ~ data', data)
  return fetchApi({
    url: 'api/Advance/createAdvance',
    method: 'POST',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    body: data,
  })
}

export async function approveInvoice(
  data: ApproveInvoiceType,
  token: string
) {
  return fetchApi({
    url: 'api/invoice/updateInvoice',
    method: 'POST',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    body: data,
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
    body: data,
  })
}
