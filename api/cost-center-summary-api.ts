import { fetchApi } from '@/utils/http'
import { CostCenterSummarySchemaType } from '@/utils/type'

export async function getCostCenterSummary({
  fromdate,
  enddate,
  costCenterIds,
  companyid,
}: {
  fromdate: string
  enddate: string
  costCenterIds: string
  companyid: string
}) {
  return fetchApi<CostCenterSummarySchemaType[]>({
    url: `api/ledgerreport/costcetersummery?fromDate=${fromdate}&endDate=${enddate}&costCenterIds=${costCenterIds}&companyId=${companyid}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

//http://localhost:4000/api/ledgerreport/costcetersummery?fromDate=2024-01-01&endDate=2025-12-31&costCenterIds=1,2,3&companyId=75 //static api
