import { fetchApi } from '@/utils/http'
import { Account, ResPartner } from '@/utils/type'
import { z } from 'zod'
import { costCenterSchema } from './cost-centers-api'

export type CostCenter = z.infer<typeof costCenterSchema>

// chart of accouts get all data
export async function getAllChartOfAccounts() {
  return fetchApi<Account[]>({
    url: 'api/chart-of-accounts/get-all-coa',
    method: 'GET',
  })
}

//cost center get all data
export async function getAllCostCenters() {
  return fetchApi<CostCenter[]>({
    url: 'api/cost-centers/get-all-cost-centers',
    method: 'GET',
  })
}

// get all res partner data
export async function getAllResPartners() {
  return fetchApi<ResPartner[]>({
    url: 'api/res-partner/get-all-res-partners',
    method: 'GET',
  })
}
