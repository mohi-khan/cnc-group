import { fetchApi } from "@/utils/http";
import { GetTradeDebtorsType } from "@/utils/type";

export async function getAllTradeDebtors() {
  return fetchApi<GetTradeDebtorsType[]>({
    url: 'api/trade-debtors/getTradeDebtorsReport',
    method: 'GET',
  })
}
