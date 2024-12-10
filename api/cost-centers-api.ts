import { fetchApi } from '@/utils/http'
import { z } from 'zod'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Update the schema to match the exact API response structure
export const costCenterSchema = z.object({
  costCenterId: z.number(),
  costCenterName: z.string().min(1, 'Cost center name is required'),
  costCenterDescription: z.string(),
  budget: z.number(),
  actual: z.number().optional(),
  currencyCode: z.enum(['USD', 'BDT', 'EUR', 'GBP']),
  active: z.boolean().optional(),
})

export type CostCenter = z.infer<typeof costCenterSchema>

export const costCentersArraySchema = z.array(costCenterSchema)

export async function getAllCostCenters() {
  return fetchApi<CostCenter>({
    url: 'api/cost-centers/get-all-cost-centers',
    method: 'GET',
  })
}

export async function createCostCenter(
  data: Omit<CostCenter, 'costCenterId'> & { costCenterId: string }
) {
  console.log('Creating bank account:', data)
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

export async function activateCostCenter(id: string) {
  console.log('API: Activating cost center with id:', id)

  const response = await fetch(
    `${API_BASE_URL}/api/cost-centers/activate/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  console.log('API: Cost center activation response status:', response.status)
  const responseData = await response.json()
  console.log('API: Cost center activation response data:', responseData.data)

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to activate cost center')
  }

  return responseData.data
}

export async function deactivateCostCenter(id: string) {
  console.log('API: Deactivating cost center with id:', id)

  const response = await fetch(
    `${API_BASE_URL}/api/cost-centers/deactivate/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  console.log('API: Cost center deactivation response status:', response.status)
  const responseData = await response.json()
  console.log('API: Cost center deactivation response data:', responseData.data)

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to deactivate cost center')
  }

  return responseData.data
}
