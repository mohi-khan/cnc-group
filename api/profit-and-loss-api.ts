import { fetchApi } from '@/utils/http'
import { ProfitAndLossType } from '@/utils/type'

export async function getProfitAndLoss({
  fromdate,
  enddate,
  companyId,
  token
}: {
  fromdate: string
  enddate: string
    companyId: string
  token: string
}) {
  return fetchApi<ProfitAndLossType[]>({
    url: `api/ledgerreport/getPL?fromDate=${fromdate}&endDate=${enddate}&companyId=${companyId}`,
    // url: 'api/ledgerreport/getPL?fromDate=2024-01-01&endDate=2025-12-31&companyId=75',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

//api/ledgerreport/getPL?fromDate=2024-01-01&endDate=2025-12-31&companyId=75
