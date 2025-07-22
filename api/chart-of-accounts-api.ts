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

export async function createChartOfAccounts(
  data: ChartOfAccounts,
  token: string
) {
  
  return fetchApi<ChartOfAccount[]>({
    url: 'api/chart-of-accounts/create-coa',
    method: 'POST',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

// Function to get parent codes with names
export async function getParentCodes(token: string) {
  return fetchApi<ChartOfAccount[]>({
    url: 'api/chart-of-accounts/get-pc-w-name-coa',
    method: 'GET',

    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

// Update Data Api
export async function updateChartOfAccounts(data: UpdateChartOfAccounts, token: string) {
  return fetchApi<ChartOfAccount[]>({
    url: `api/chart-of-accounts/update-coa/${data.accountId}`,
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
