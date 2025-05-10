import { fetchApi } from '@/utils/http'
import {
  CostCenter,
  CostCenterSummarySchemaType,
  CostCenterSummaryType,
} from '@/utils/type'

export async function getCostCenterSummary({
  fromdate,
  enddate,
  costCenterId,
  companyid,
  token
}: {
  fromdate: string
  enddate: string
  costCenterId: string
    companyid: string
  token: string
}) {
  return fetchApi<CostCenterSummaryType[]>({
    url: `api/ledgerreport/costcetersummery?fromDate=${fromdate}&endDate=${enddate}&costCenterIds=${costCenterId}&companyId=${companyid}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}



//http://localhost:4000/api/ledgerreport/costcetersummery?fromDate=2024-01-01&endDate=2025-12-31&costCenterIds=1,2,3&companyId=75 //static api
