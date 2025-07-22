import type { z } from 'zod'
import { fetchApi } from '@/utils/http'
import type {
  createFinancialYearSchema,
  GetFinancialYearType,
  Period,
  updatePostingPeriodsSchema,
} from '@/utils/type'

export type financialYear = z.infer<typeof createFinancialYearSchema>
export type postingPeriod = z.infer<typeof updatePostingPeriodsSchema>
export type financialYearCreate = Omit<
  financialYear,
  'id' | 'createdBy' | 'createdAt'
>

//create Financial Year
export async function createFinancialYear(
  data: financialYearCreate,
  token: string
) {
  
  return fetchApi<financialYear>({
    url: 'api/financial-year/entry',
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}

//get data
export async function getPostingPeriod(token: string, yearid: number) {
  return fetchApi<Period[]>({
    url: `api/financial-year/getpostingperiods/${yearid}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}

export async function getFinancialYear(token: string) {
  return fetchApi<GetFinancialYearType[]>({
    url: 'api/financial-year/getfinancialyears',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}

export async function updatePostingPeriod(data: postingPeriod, token: string) {
  return fetchApi<Period[]>({
    url: 'api/financial-year/postingperiodupdate',
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}
