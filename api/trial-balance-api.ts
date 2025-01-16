import { fetchApi } from '@/utils/http'
import { TrialBalanceData } from '@/utils/type'

export async function getTrialBalance({
  fromdate,
  enddate,
  companyid,
}: {
  fromdate: string
  enddate: string
  companyid: string
}) {
  return fetchApi<TrialBalanceData[]>({
    url: `api/ledgerreport/trialBalance?fromdate=${fromdate}&enddate=${enddate}&companyid=${companyid}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
