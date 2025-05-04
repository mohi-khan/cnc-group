import { fetchApi } from '@/utils/http'
import {
  ApproveInvoiceType,
  CreateInvoiceType,
  Employee,
  GetPaymentOrder,
  PurchaseEntryType,
  RequisitionAdvanceType,
  ResPartner,
} from '@/utils/type'

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

export async function getAllAdvance(data: { token: string }) {
  console.log('🚀 ~ getAllPaymentRequisition ~ token', data.token)
  return fetchApi<RequisitionAdvanceType[]>({
    url: `api/Advance/getAdvance`,
    method: 'GET',
    headers: {
      Authorization: `${data.token}`,
    },
  })
}

export async function getAllEmployees() {
  // console.log('🚀 ~ getAllPaymentRequisition ~ token', data.token)
  return fetchApi<Employee[]>({
    url: `api/employee/getEmployees`,
    method: 'GET',
    headers: {
      // Authorization: `${data.token}`,
    },
  })
}

export async function createInvoice(data: CreateInvoiceType, token: string) {
  // Don't log sensitive tokens in production
  console.log(token)
  return fetchApi({
    url: 'api/invoice/createInvoice',
    method: 'POST',
    headers: {
      Authorization: token, // Remove the template literal since token already includes "Bearer "
      'Content-Type': 'application/json',
    },
    body: data,
  })
}

export async function getAllVendors(token: string) {
  return fetchApi<ResPartner[]>({
    url: 'api/res-partner/get-all-res-partners',
    method: 'GET',
    headers: {
      Authorization: token,
    },
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

export async function approveInvoice(data: ApproveInvoiceType, token: string) {
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
