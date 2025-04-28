import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

import { fetchApi } from '@/utils/http'
import { z } from 'zod'

export const SignInRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})
const RoleSchema = z.object({
  roleId: z.number(),
  roleName: z.string(),
  permissions: z.string(),
})
const CompanySchema = z.object({
  companyId: z.number(),
  companyName: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.string().nullable(),
  phone: z.string(),
  email: z.string(),
  website: z.string(),
  taxId: z.string(),
  currencyId: z.number().nullable(),
  logo: z.string().nullable(),
  parentCompanyId: z.null(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const LocationSchema = z.object({
  locationId: z.number(),
  companyId: z.number(),
  branchName: z.string(),
  address: z.string(),
  city: z.null(),
  state: z.null(),
  country: z.null(),
  postalCode: z.null(),
  phone: z.null(),
  email: z.null(),
  managerName: z.null(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const UserCompanySchema = z.object({
  userId: z.number(),
  companyId: z.number(),
  company: CompanySchema,
})

const UserLocationSchema = z.object({
  userId: z.number(),
  locationId: z.number(),
  location: LocationSchema,
})

const UserSchema = z.object({
  userId: z.number(),
  username: z.string(),
  password: z.string(),
  active: z.boolean(),
  roleId: z.number(),
  voucherTypes: z.array(z.string()),
  isPasswordResetRequired: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  role: RoleSchema,
  userCompanies: z.array(UserCompanySchema),
  userLocations: z.array(UserLocationSchema),
  employeeId: z.number(),
})

// Define the main response schema
const SignInResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    token: z.string(),
    user: UserSchema,
  }),
})
export type SignInRequest = z.infer<typeof SignInRequestSchema>
export type SignInResponse = z.infer<typeof SignInResponseSchema>

export async function signIn(credentials: SignInRequest) {
 
  return fetchApi<SignInResponse>({
    url: 'api/auth/login',
    method: 'POST',
    body: credentials,
    schema: SignInResponseSchema,
  })
}
