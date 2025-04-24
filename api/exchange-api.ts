import { fetchApi } from '@/utils/http'
import { CurrencyType, ExchangeType } from '@/utils/type'



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

export async function editExchange(exchangeDate: string, baseCurrency: number, rate: number) {
  console.log(exchangeDate, baseCurrency, rate)
  return fetchApi<ExchangeType[]>({
    url: `api/exchange/edit-exchange/${exchangeDate}/${baseCurrency}`,
    method: 'PATCH',
    body: { rate }
  })
}


