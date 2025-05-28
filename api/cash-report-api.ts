import { fetchApi } from '@/utils/http'

export interface CashReportParams {
  fromDate: string
  endDate: string
  companyId: number
  location: number
}

export async function getCashReport(params: CashReportParams, token: string) {
  return fetchApi<any>({
    url: `api/cash/cashReport?fromDate=2025-05-01&endDate=2025-06-30&companyId=3&location=1`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

//url: `api/cash/cashReport?fromDate=${params.fromDate}&endDate=${params.endDate}&companyId=${params.companyId}&location=${params.location}`,
