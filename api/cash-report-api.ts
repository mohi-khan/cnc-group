// import { fetchApi } from '@/utils/http'
// import { GetCashReport } from '@/utils/type'

// export interface CashReportParams {
//   fromDate: string
//   endDate: string
//   companyId: number
//   location: number
// }

// export async function getCashReport(params: CashReportParams, token: string) {
//   return fetchApi<GetCashReport>({
//    url: `api/cash/cashReport?fromDate=${params.fromDate}&endDate=${params.endDate}&companyId=${params.companyId}&location=${params.location}`,
//     method: 'GET',
//     headers: {
//       Authorization: `${token}`,
//       'Content-Type': 'application/json',
//     },
//   })
// }

//url: `api/cash/cashReport?fromDate=${params.fromDate}&endDate=${params.endDate}&companyId=${params.companyId}&location=${params.location}`,

import { fetchApi } from '@/utils/http'
import { GetCashReport } from '@/utils/type'

export interface CashReportParams {
  date: string
  companyId: number
  location: number
}

export async function getCashReport(params: CashReportParams, token: string) {
  return fetchApi<GetCashReport>({
    url: `api/cash/cashReport?date=${params.date}&companyId=${params.companyId}&location=${params.location}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
//url: `api/cash/cashReport?fromDate=${params.fromDate}&endDate=${params.endDate}&companyId=${params.companyId}&location=${params.location}`,
//url: `api/cash/cashReport?companyId=3&location=1&date=2025-12-06`
