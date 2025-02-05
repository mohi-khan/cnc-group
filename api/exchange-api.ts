import { fetchApi } from '@/utils/http'
import { ExchangeType } from '@/utils/type'

export async function getAllExchange() {
  return fetchApi<ExchangeType[]>({
    url: 'api/exchange/get-all-exchange',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function createExchange(data: ExchangeType) {
  return fetchApi<ExchangeType[]>({
    url: 'api/exchange/create-exchange',
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function editExchange(exchangeDate: string, baseCurrency: number) {
  console.log(exchangeDate, baseCurrency)
  return fetchApi<ExchangeType[]>({
    url: `api/exchange/edit-exchange/${exchangeDate}/${baseCurrency}`,
    method: 'PATCH',
  })
}
