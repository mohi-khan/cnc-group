import { fetchApi } from "@/utils/http"
import { LoanBalanceType } from "@/utils/type"

 export async function getLoanBalance({
  date,
  token,
}: {
  date: string
  token: string
}) {
  return fetchApi<LoanBalanceType>({
    url: `api/fundPosition/getLoanBalance?date=${date}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
