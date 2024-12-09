import { z } from 'zod'

const API_BASE_URL = 'http://localhost:4000'

// Zod schema for res partner validation
export const resPartnerSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  // companyName: z.string().optional().nullable(),
  type: z.string().optional(),
  companyId: z.number().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  website: z.string().url().optional(),
  isCompany: z.boolean().optional(),
  vat: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  active: z.boolean().optional(),
  creditLimit: z.number().nonnegative().optional(),
  customerRank: z.number().nonnegative().optional(),
  supplierRank: z.number().nonnegative().optional(),
  comment: z.string().optional(),
  createdBy: z.number().optional(),
  updatedBy: z.number().optional(),
})

export type ResPartner = z.infer<typeof resPartnerSchema> & {
  id?: number
  companyId?: number
  createdAt?: string
  updatedAt?: string
}

export type ResPartnerCreate = Omit<
  ResPartner,
  'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'
>
export type ResPartnerUpdate = Omit<
  ResPartner,
  'id' | 'createdBy' | 'createdAt' | 'updatedAt'
>

export async function createResPartner(
  data: ResPartnerCreate
): Promise<ResPartner> {
  console.log('Creating res partner:', data)
  const response = await fetch(
    `${API_BASE_URL}/api/res-partner/create-res-partner`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to create res partner')
  }
  console.log('Res partner created:', response)
  return response.json()
}

export async function editResPartner(
  id: number,
  data: ResPartnerUpdate
): Promise<ResPartner> {
  console.log('Editing res partner:', id, data)
  const response = await fetch(
    `${API_BASE_URL}/api/res-partner/edit-res-partner/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to edit res partner')
  }
  console.log('Res partner edited:', response)
  return response.json()
}

export async function getAllResPartners(): Promise<ResPartner[]> {
  // console.log('Fetching all res partners');
  const response = await fetch(
    `${API_BASE_URL}/api/res-partner/get-all-res-partners`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch res partners')
  }
  console.log('Fetched res partners:', response)
  return response.json()
}

export async function getAllCompanies() {
  // console.log('Fetching all companies');
  const response = await fetch(`${API_BASE_URL}/api/company/get-all-companies`)

  if (!response.ok) {
    throw new Error('Failed to fetch companies')
  }
  console.log('Fetched companies:', response)
  return response.json()
}
