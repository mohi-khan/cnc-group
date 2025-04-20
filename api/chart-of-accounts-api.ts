import { fetchApi } from '@/utils/http'
import { AccountsHead, ChartOfAccount } from '@/utils/type'

export type ChartOfAccounts = Omit<
  ChartOfAccount,
  'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'
>
//For updating chart of Accounts
export type UpdateChartOfAccounts = Omit<
  AccountsHead,
   'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'
>
//create chart of accounts


export async function createChartOfAccounts(data: ChartOfAccounts) {
  console.log('Created Chart Of Account:', data)
  return fetchApi<ChartOfAccount[]>({
    url: 'api/chart-of-accounts/create-coa',
    method: 'POST',
    body: data,
  })
}

//get all data coa
export async function getAllCoa() {
  return fetchApi<ChartOfAccount[]>({
    url: 'api/chart-of-accounts/get-all-coa',
    method: 'GET',
  })
}

// Function to get parent codes with names
export async function getParentCodes() {
  return fetchApi<ChartOfAccount[]>({
    url: 'api/chart-of-accounts/get-pc-w-name-coa',
    method: 'GET',
  })
}

// Update Data Api
export async function updateChartOfAccounts(data: UpdateChartOfAccounts) {
  return fetchApi<ChartOfAccount[]>({
    url: `api/chart-of-accounts/update-coa/${data.accountId}`,
    method: 'PATCH',
    body: data,
  })
}
