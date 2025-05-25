import { fetchApi } from '@/utils/http'
import { SalesInvoiceType } from '@/utils/type'

//Fetch All Invoice Data
export async function getInvoiceData(token: string) {
  return fetchApi<SalesInvoiceType[]>({
    url: 'api/SalesInvoice/get',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getInvoiceById(token: string, id: number) {
  return fetchApi<SalesInvoiceType>({
    url: `api/SalesInvoice/get/${id}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

