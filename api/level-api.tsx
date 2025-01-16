import { fetchApi } from '@/utils/http'
import { ChartOfAccount } from '@/utils/type'

export async function getAllCoa() {
  return fetchApi<ChartOfAccount[]>({
    url: 'api/chart-of-accounts/get-all-coa',
    method: 'GET',
  })
}