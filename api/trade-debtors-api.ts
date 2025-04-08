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

// Get All companies api
export async function getAllCompany() {
  return fetchApi<CompanyType[]>({
    url: 'api/company/get-all-companies',
    method: 'GET',
  })
}