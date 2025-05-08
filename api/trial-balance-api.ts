import { fetchApi } from '@/utils/http'
import { TrialBalanceData } from '@/utils/type'

export async function getTrialBalance({
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
  return fetchApi<TrialBalanceData[]>({
    url: `api/ledgerreport/trialBalance?fromdate=${fromdate}&enddate=${enddate}&companyid=${companyid}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
