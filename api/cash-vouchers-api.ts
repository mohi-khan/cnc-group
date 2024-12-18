import { fetchApi } from '@/utils/http'
import {
  ChartOfAccount,
  JournalEntryWithDetailsSchema,
  ResPartner,
} from '@/utils/type'
import { z } from 'zod'
import { costCenterSchema } from './cost-centers-api'

export type CostCenter = z.infer<typeof costCenterSchema>

export async function createJournalEntryWithDetails(
  JournalEntryWithDetails: z.infer<typeof JournalEntryWithDetailsSchema>
) {
  console.log('API: Creating journal with details:', JournalEntryWithDetails)

  const response = await fetch('http://localhost:4000/api/journal/entry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })
  console.log(
    'API: journal with details creation response status:',
    response.status
  )
  const data = await response.json()
  console.log('API: journal with details creation response data:', data)

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create company')
  }

  return data
}

// chart of accouts get all data
export async function getAllChartOfAccounts() {
  return fetchApi<ChartOfAccount[]>({
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
