import { z } from 'zod';

// Update the schema to match the exact API response structure
export const costCenterSchema = z.object({
  costCenterId: z.string(),
  costCenterName: z.string().min(1, "Cost center name is required"),
  costCenterDescription: z.string(),
  budget: z.string(), // API returns budget as string
  currencyCode: z.enum(["USD", "BDT", "EUR", "GBP"]),
  active: z.boolean().optional().default(true),
  companyNames: z.array(z.string()).optional(),
  actual: z.number().optional()
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

export async function createCostCenters(costCenters: Omit<CostCenter, 'costCenterId'>[]) {
  console.log("API: Creating cost centers with data:", costCenters);
  
  const response = await fetch('http://localhost:4000/api/cost-centers/create-cost-centers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(costCenters),
  });

  console.log("API: Cost centers creation response status:", response.status);
  const responseData = await response.json();
  console.log("API: Cost centers creation response data:", responseData.data);

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to create cost centers');
  }

  return responseData.data;
}