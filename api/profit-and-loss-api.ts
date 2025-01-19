import { fetchApi } from '@/utils/http'
import { ProfitAndLossType } from '@/utils/type'

export async function getProfitAndLoss({
  fromdate,
  enddate,
  companyId,
}: {
  fromdate: string
  enddate: string
  companyId: string
}) {
  return fetchApi<ProfitAndLossType[]>({
    url: `api/ledgerreport/getPL?fromDate=${fromdate}&endDate=${enddate}&companyId=${companyId}`,
    // url: 'api/ledgerreport/getPL?fromDate=2024-01-01&endDate=2025-12-31&companyId=75',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

//api/ledgerreport/getPL?fromDate=2024-01-01&endDate=2025-12-31&companyId=75
