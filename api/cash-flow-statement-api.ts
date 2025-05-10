import { fetchApi } from '@/utils/http'
import { CashflowStatement } from '@/utils/type'

export async function getCashFowStatement({
  fromdate,
  enddate,
  companyid,
  token,
}: {
  fromdate: string
  enddate: string
    companyid: string
  token: string
}) {
  return fetchApi<CashflowStatement[]>({
    url: `api/ledgerreport/cashflow?fromdate=${fromdate}&enddate=${enddate}&companyid=${companyid}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
