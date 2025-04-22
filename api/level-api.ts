import { fetchApi } from '@/utils/http'
import { AccountsHead, ChartOfAccount, LevelType } from '@/utils/type'

export async function getAllCoa() {
  return fetchApi<AccountsHead[]>({
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

export async function getAllLevel() {
  return fetchApi<LevelType[]>({
    url: 'api/coa-pl-map/get-all-coa-pl-map',
    method: 'GET',
  })
}

export async function editLevel(
  data: LevelType[]
) {
  console.log("Under APi:");
  console.log(data);
  return fetchApi<LevelType[]>({
    url: 'api/coa-pl-map/edit-coa-pl-map',
    method: 'PATCH',
    body: data,
  })
}