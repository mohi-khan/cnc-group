import { fetchApi } from '@/utils/http'
import { Company } from '@/utils/type'
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

export async function createResPartner(data: ResPartner) {
  console.log('Creating res:', data)
  return fetchApi<ResPartner>({
    url: 'api/res-partner/create-res-partner',
    method: 'POST',
    body: data,
  })
}

export async function editResPartner(id: number, data: ResPartner) {
  console.log('Editing res:', id, data)
  return fetchApi<ResPartner>({
    url: `api/res-partner/edit-res-partner/${id}`,
    method: 'PATCH',
    body: data,
  })
}

export async function getAllResPartners() {
  return fetchApi<ResPartner>({
    url: 'api/res-partner/get-all-res-partners',
    method: 'GET',
  })
}

export async function getAllCompanies() {
  return fetchApi<Company>({
    url: 'api/company/get-all-companies',
    method: 'GET',
  })
}
