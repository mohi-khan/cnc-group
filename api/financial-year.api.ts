import { z } from 'zod'
import { addMonths, isLastDayOfMonth } from 'date-fns'
import { fetchApi } from '@/utils/http'
import { createFinancialYearSchema, Period, updatePostingPeriodsSchema } from '@/utils/type'



export type financialYear = z.infer<typeof createFinancialYearSchema> 
export type postingPeriod = z.infer<typeof updatePostingPeriodsSchema> 
export type financialYearCreate = Omit<
  financialYear,
  'id' | 'createdBy' |  'createdAt' 
  >

//create Financial Year
export async function createFinancialYear(data: financialYearCreate, token: string) {
  console.log('create financial year: ', data)
  return fetchApi<financialYear>({
    url: 'api/financial-year/entry',
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    }
  })
}

//get data
export async function getPostingPeriod() {
  return fetchApi<Period[]>({
    url: 'api/financial-year/getpostingperiods/5',
    method:'GET'
  })
}


// Update Data Api

export async function updatePostingPeriod(data:postingPeriod) {
  return fetchApi<Period[]>({
    url: 'api/financial-year/postingperiodupdate',
    method: 'POST',
    body:data
  });
}