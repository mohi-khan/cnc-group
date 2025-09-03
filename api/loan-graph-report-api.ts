import { fetchApi } from "@/utils/http"
import { LoanPosition } from "@/utils/type"


export async function getLoanPosition({
  date,
  month,
  token,
}: {
  date: string
  month: number
  token: string
}) {
  return fetchApi<LoanPosition>({ // replace LoanBalanceType with correct type if different
    url: `api/fundPosition/getLoanPosition?date=${date}&month=${month}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
