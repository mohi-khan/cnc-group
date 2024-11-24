import { z } from 'zod';

// Update the schema to match the exact API response structure
export const costCenterSchema = z.object({
  costCenterId: z.string(),
  costCenterName: z.string().min(1, "Cost center name is required"),
  costCenterDescription: z.string(),
  budget: z.string(), // API returns budget as string
  actual: z.number().optional(),
  currencyCode: z.enum(["USD", "BDT", "EUR", "GBP"]),
  active: z.boolean().optional()
});

export type CostCenter = z.infer<typeof costCenterSchema>;

export const costCentersArraySchema = z.array(costCenterSchema);

export async function getAllCostCenters(): Promise<CostCenter[]> {
  console.log("API: Fetching all cost centers");
  
  const response = await fetch('http://localhost:4000/api/cost-centers/get-all-cost-centers');

  console.log("API: Get all cost centers response status:", response.status);
  const responseData = await response.json();
  console.log("API: Get all cost centers response data:", responseData.data);

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to fetch cost centers');
  }

  // Transform the data to match our schema if needed
  const transformedData = responseData.data.map((item: any) => ({
    costCenterId: item.costCenterId,
    costCenterName: item.costCenterName,
    costCenterDescription: item.costCenterDescription,
    budget: item.budget,
    currencyCode: item.currencyCode,
    active: true, // Default value since it's not in the API response
    companyNames: [], // Default value since it's not in the API response
    actual: 0, // Default value since it's not in the API response
  }));

  // Validate the transformed data
  const validatedData = costCentersArraySchema.parse(transformedData);

  return validatedData;
}

export async function createCostCenter(costCenter: Omit<CostCenter, 'costCenterId'> & { costCenterId: string }) {
  console.log("API: Creating cost center with data:", costCenter);
  
  const response = await fetch('http://localhost:4000/api/cost-centers/create-cost-centers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(costCenter), // Send single object instead of array
  });

  console.log("API: Cost center creation response status:", response.status);
  const responseData = await response.json();
  console.log("API: Cost center creation response data:", responseData.data);

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to create cost center');
  }

  return responseData.data;
}

export async function updateCostCenter(costCenter: CostCenter) {
  console.log("API: Updating cost center with data:", costCenter);
  
  const response = await fetch(`http://localhost:4000/api/cost-centers/cost-centers/edit/${costCenter.costCenterId}`, {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(costCenter),
  });

  console.log("API: Cost center update response status:", response.status);
  const responseData = await response.json();
  console.log("API: Cost center update response data:", responseData.data);

  if (!response.ok) {
      throw new Error(responseData.message || 'Failed to update cost center');
  }

  return responseData.data;
}