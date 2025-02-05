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
