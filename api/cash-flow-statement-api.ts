import { fetchApi } from '@/utils/http'
import { CashflowStatement, TrialBalanceData } from '@/utils/type'

export async function getCashFowStatement({
  fromdate,
  enddate,
  companyid,
}: {
  fromdate: string
  enddate: string
  companyid: string
}) {
  return fetchApi<CashflowStatement[]>({
    // url: `api/ledgerreport/cashflow?fromdate=2024-01-01&enddate=2024-12-31&companyid=75`,
    url: `api/ledgerreport/trialBalance?fromdate=${fromdate}&enddate=${enddate}&companyid=${companyid}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

//api/ledgerreport/cashflow?fromdate=2024-01-01&enddate=2024-12-31&companyid=75
