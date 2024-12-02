import { z } from 'zod'

// Define Zod schemas
export const companySchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.string(),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  taxId: z.string().optional(),
  currencyId: z.number(),
  logo: z.string().optional(),
  parentCompanyId: z.number().nullable(),
  locationId: z.number().optional(),
})

export const locationSchema = z.object({
  companyId: z.number(),
  branchName: z.string().min(1, 'Branch name is required'),
  address: z.string().min(1, 'Address is required'),
})

export async function createCompany(
  companyData: z.infer<typeof companySchema>,
  locations: string[]
) {
  console.log('API: Creating company with data:', companyData)

  const response = await fetch(
    'http://localhost:4000/api/company/create-company-location',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companydata: companyData,
        address: locations,
        branchName: locations,
      }),
    }
  )

  console.log('API: Company creation response status:', response.status)
  const data = await response.json()
  console.log('API: Company creation response data:', data)

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create company')
  }

  return data
}


export async function createLocation(
  locationData: z.infer<typeof locationSchema>
) {
  console.log('API: Creating location with data:', locationData)

  const response = await fetch(
    'http://localhost:4000/api/location/create-location',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
    }
  )

  console.log('API: Location creation response status:', response.status)
  const data = await response.json()
  console.log('API: Location creation response data:', data)

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create location')
  }

  return data
}
