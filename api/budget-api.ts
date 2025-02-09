import { fetchApi } from '@/utils/http'
import { AccountsHead, CreateBudgetItemsType } from '@/utils/type'

//get all data coa
export async function getAllCoa() {
  return fetchApi<AccountsHead[]>({
    url: 'api/chart-of-accounts/get-all-coa',
    method: 'GET',
  })
}

// export async function createBudgetItems() {
//   return fetchApi<CreateBudgetItemsType[]>({
//     url: 'api/budget/createBudgetItems',
//     method: 'POST',
//   })
// }


export async function createBudgetItems(payload: any) {
  return fetchApi<CreateBudgetItemsType[]>({
    url: 'api/budget/createBudgetItems',
    method: 'POST',
    body: JSON.stringify(payload),
  })
}