import { fetchApi } from '@/utils/http'
import { z } from 'zod'

export const SignInRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

const RoleSchema = z.object({
  roleId: z.number(),
  roleName: z.string(),
  permissions: z.array(z.number()), // Changed from string to array of numbers
})

const CompanySchema = z.object({
  companyId: z.number(),
  companyName: z.string(),
  address: z.string(),
  city: z.string().nullable(), // Made nullable to match potential null values
  state: z.string().nullable(),
  country: z.string().nullable(),
  postalCode: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  taxId: z.string().nullable(),
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
  employeeId: z.number(),
  isPasswordResetRequired: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  role: RoleSchema,
  userCompanies: z.array(UserCompanySchema),
  userLocations: z.array(UserLocationSchema),
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
