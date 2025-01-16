import { fetchApi } from '@/utils/http'
import { ChartOfAccount, LevelType } from '@/utils/type'

export async function getAllCoa() {
  return fetchApi<ChartOfAccount[]>({
    url: 'api/chart-of-accounts/get-all-coa',
    method: 'GET',
  })
}

export async function createLevel(
  data: LevelType[]
) {
  console.log("Under APi:");
  console.log(data);
  return fetchApi<LevelType[]>({
    url: 'api/coa-pl-map/create-coa-pl-map',
    method: 'POST',
    body: data,
  })
}