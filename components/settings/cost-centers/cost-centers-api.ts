import { z } from 'zod'

// Update the schema to match the exact API response structure
export const costCenterSchema = z.object({
  costCenterId: z.string(),
  costCenterName: z.string().min(1, 'Cost center name is required'),
  costCenterDescription: z.string(),
  budget: z.number(),
  actual: z.number().optional(),
  currencyCode: z.enum(['USD', 'BDT', 'EUR', 'GBP']),
  active: z.boolean().optional(),
})

export type CostCenter = z.infer<typeof costCenterSchema>

export const costCentersArraySchema = z.array(costCenterSchema)

export async function getAllCostCenters(): Promise<CostCenter[]> {
  console.log('API: Fetching all cost centers')

  const response = await fetch(
    'http://localhost:4000/api/cost-centers/get-all-cost-centers'
  )

  console.log('API: Get all cost centers response status:', response.status)
  const responseData = await response.json()
  console.log('API: Get all cost centers response data:', responseData.data)

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to fetch cost centers')
  }

  // Transform the data to match our schema if needed
  const transformedData = responseData.data.map((item: any) => ({
    costCenterId: item.costCenterId,
    costCenterName: item.costCenterName,
    costCenterDescription: item.costCenterDescription || '',
    budget: Number(item.budget) || 0, // Convert string to number
    actual: Number(item.actual) || 0, // Convert string to number
    currencyCode: item.currencyCode,
    active: item.isActive ?? true, // Use API's isActive field or default to true
  }))

  // Validate the transformed data
  const validatedData = costCentersArraySchema.parse(transformedData)

  return validatedData
}

export async function createCostCenter(
  costCenter: Omit<CostCenter, 'costCenterId'> & { costCenterId: string }
) {
  console.log('API: Creating cost center with data:', costCenter)

  const response = await fetch(
    'http://localhost:4000/api/cost-centers/create-cost-centers',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(costCenter), // Send single object instead of array
    }
  )

  console.log('API: Cost center creation response status:', response.status)
  const responseData = await response.json()
  console.log('API: Cost center creation response data:', responseData.data)

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to create cost center')
  }

  return responseData.data
}

export async function updateCostCenter(costCenter: CostCenter) {
  console.log('API: Updating cost center with data:', costCenter)

  const response = await fetch(
    `http://localhost:4000/api/cost-centers/edit/${costCenter.costCenterId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(costCenter),
    }
  )

  console.log('API: Cost center update response status:', response.status)
  const responseData = await response.json()
  console.log('API: Cost center update response data:', responseData.data)

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to update cost center')
  }

  return responseData.data
}

export async function activateCostCenter(id: string) {
  console.log('API: Activating cost center with id:', id)

  const response = await fetch(
    `http://localhost:4000/api/cost-centers/activate/${id}`,
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
    `http://localhost:4000/api/cost-centers/deactivate/${id}`,
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
