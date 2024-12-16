import { fetchApi } from '@/utils/http'

export async function getAllChartOfAccounts() {
  return fetchApi({
    url: 'api/chart-of-accounts/get-all-coa',
    method: 'GET',
  })
}
