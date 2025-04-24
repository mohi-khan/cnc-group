import { fetchApi } from "@/utils/http";
import { GetTradeDebtorsType } from "@/utils/type";
import { CompanyType } from "./company-api";


// Get all trade debtors
export async function getAllTradeDebtors() {
  return fetchApi<GetTradeDebtorsType[]>({
    url: 'api/trade-debtors/getTradeDebtorsReport',
    method: 'GET',
  })
}

