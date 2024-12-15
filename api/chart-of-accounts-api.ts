import { fetchApi } from "@/utils/http";
import { chartOfAccountSchema } from "@/utils/type";
import { z } from "zod";



export type ChartOfAccount = z.infer<typeof chartOfAccountSchema>


export type ChartOfAccounts = Omit<
  ChartOfAccount,
  'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'
>


//create chart of accounts

export async function createChartOfAccounts(data:ChartOfAccounts) {
  return fetchApi<ChartOfAccount>({
    url: 'api/chart-of-accounts/create-coa',
    method: 'POST',
    body:data,
    
  })
}


//get all data coa
export async function getAllCoa() {
  return fetchApi<ChartOfAccount>({
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