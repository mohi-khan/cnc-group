import { fetchApi } from '@/utils/http'
import { z } from 'zod'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Update the schema to match the exact API response structure
export const costCenterSchema = z.object({
  costCenterId: z.number().min(1, 'Cost center id is required'),
  costCenterName: z.string().min(1, 'Cost center name is required'),
  costCenterDescription: z.string(),
  budget: z.number(),
  actual: z.number().optional(),
  currencyCode: z.enum(['USD', 'BDT', 'EUR', 'GBP']),
  active: z.boolean().optional(),
})

export type CostCenter = z.infer<typeof costCenterSchema>
export type CostCenterActivateDiactivate = z.infer<typeof costCenterSchema.costCenterId>

export const costCentersArraySchema = z.array(costCenterSchema)

export async function getAllCostCenters() {
  return fetchApi<CostCenter>({
    url: 'api/cost-centers/get-all-cost-centers',
    method: 'GET',
  })
}

export async function createCostCenter(data: Omit<CostCenter, 'costCenterId'>) {
  console.log('Creating cost center:', data)
  return fetchApi<CostCenter>({
    url: 'api/cost-centers/create-cost-centers',
    method: 'POST',
    body: data,
  })
}

export async function updateCostCenter(data: CostCenter) {
  console.log('Editing cost center:', data)
  return fetchApi<CostCenter>({
    url: `api/cost-centers/edit-cost-center/${data.costCenterId}`,
    method: 'PATCH',
    body: data,
  })
}

export async function activateCostCenter(costCenterId: number) {
  console.log('Activating cost center:', costCenterId)
  return fetchApi<CostCenter>({
    url: `api/cost-centers/activate/${costCenterId}`,
    method: 'PATCH'
  })
}

export async function deactivateCostCenter(costCenterId: number) {
  console.log('Deactivating cost center:', costCenterId)
  return fetchApi<CostCenter>({
    url: `api/cost-centers/deactivate/${costCenterId}`,
    method: 'PATCH'
  })
}
