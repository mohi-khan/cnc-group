import { fetchApi } from '@/utils/http'

export async function getAllGlAccounts() {
  return fetchApi({
    url: 'api/chart-of-accounts/get-all-coa',
    method: 'GET',
  })
}
