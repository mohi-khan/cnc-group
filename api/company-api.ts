import { fetchApi } from '@/utils/http'
import { z } from 'zod'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const companySchema = z.object({
  companyId:z.number().int().optional(),
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
  locationId: z.number(),
  companyId: z.number(),
  branchName: z.string().min(1, 'Branch name is required'),
  address: z.string().min(1, 'Address is required'),
  
})

export const fullUpdateCompanySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  taxId: z.string().optional(),
  currencyId: z.number().optional(),
  parentCompanyId: z.number().nullable().optional(),
  locationId: z.number().nullable().optional(),
});

export type updateCompanyType = z.infer<typeof fullUpdateCompanySchema>
export type CompanyType = z.infer<typeof companySchema>

export async function createCompany(
  companyData: z.infer<typeof companySchema>,
  locations: string[],
  token: string
) {
  

  const response = await fetch(
    `${API_BASE_URL}/api/company/create-company-location`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify({
        companydata: companyData,
        address: locations,
        branchName: locations,
      }),
    }
  )

  
  const data = await response.json()
  

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create company')
  }

  return data
}

//update company api
export async function updateCompanyApi(
  token: string,
  companyId: number,
  payload: any
) {
  return fetchApi<updateCompanyType[]>({
    url: `api/company/update-company/${companyId}`,
    method: "PUT",
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

// get company by id api
export async function getCompanyById(token: string, companyId: number) {
  return fetchApi<any>({
    url: `api/company/get-company-by-id/${companyId}`,
    method: "GET",
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    },
  });
}


