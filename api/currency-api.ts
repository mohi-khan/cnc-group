import { fetchApi } from "@/utils/http";
import { CurrencyType } from "@/utils/type";

export async function getAllCurrency() {
  return fetchApi<CurrencyType[]>({
    url: 'api/exchange/get-all-currency',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
export async function getCurrency(currencyName:string,token:string) {
  return fetchApi<number>({
    url: `api/currency/get/${currencyName}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
       Authorization: `${token}`
    },
  })
}

