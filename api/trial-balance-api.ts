import { fetchApi } from '@/utils/http'
import { TrialBalanceData } from '@/utils/type'

export async function getTrialBalance() {
  return fetchApi<TrialBalanceData[]>({
    url: 'api/ledgerreport/trialBalance?fromdate=2024-01-01&enddate=2024-12-31&companyid=75', //static API
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// url: `http://localhost:4000/api/ledgerreport/trialBalance?fromdate=${fromdate}&enddate=${enddate}&companyid=${companyid}`,//dynamic API
