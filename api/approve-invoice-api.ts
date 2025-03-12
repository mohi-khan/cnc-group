import { fetchApi } from "@/utils/http";
import { ApproveInvoiceType, GetPaymentOrder } from "@/utils/type";

export async function getAllInvoices(data: {
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