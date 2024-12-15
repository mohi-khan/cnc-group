import { fetchApi } from '@/utils/http'
import { z } from 'zod'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

enum VoucherTypes {
  Cash = 'Cash Voucher',
  Bank = 'Bank Voucher',
  Journal = 'Journal Voucher',
  Contra = 'Contra Voucher',
}

// Sign-up schema
const signUpSchema = z
  .object({
    username: z.string().min(1, 'Username is required'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .refine(
        (password) => /[A-Z]/.test(password),
        'Password must contain at least one uppercase letter'
      )
      .refine(
        (password) => /[a-z]/.test(password),
        'Password must contain at least one lowercase letter'
      )
      .refine(
        (password) => /\d/.test(password),
        'Password must contain at least one number'
      )
      .refine(
        (password) => /[\W_]/.test(password),
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
    active: z.boolean().default(true),
    roleId: z.number(),
    voucherTypes: z
      .array(z.nativeEnum(VoucherTypes))
      .min(1, 'At least one voucher type is required'),
    companyid: z
      .array(z.number())
      .min(1, 'At least one company type is required'),
    locationid: z
      .array(z.number())
      .min(1, 'At least one location type is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

const locationSchema = z.object({
  locationId: z.number(),
  address: z.string().min(1, 'Location address is required'),
})

const companySchema = z.object({
  companyId: z.number().min(1, 'CompanyId is required'),
  companyName: z.string().min(1, 'At least one company name is required'),
})

const userLocationSchema = z.object({
  userId: z.number().min(1, 'UserId is required'),
  locationId: z.number().min(1, 'LocationId is required'), // Changed to single number
})

// Modified user-company schema to handle single companyId
const userCompanySchema = z.object({
  userId: z.number().min(1, 'UserId is required'),
  companyId: z.number().min(1, 'CompanyId is required'), // Changed to single number
})

const roleSchema = z.object({
  roleId: z.number(),
  roleName: z.string().min(1, 'role name is required'),
})

export type LocationData = z.infer<typeof locationSchema>
export type SignUpData = z.infer<typeof signUpSchema>
export type CompanyData = z.infer<typeof companySchema>
export type UserCompanyData = z.infer<typeof userCompanySchema>
export type UserLocationData = z.infer<typeof userLocationSchema>
export type RoleData = z.infer<typeof roleSchema>

// Sign-up function
export async function signUp(data: SignUpData) {
  try {
    const validatedData = signUpSchema.parse(data)
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error('Server response:', responseData)
      throw new Error(responseData.message || 'Sign up failed')
    }

    return { success: true, userId: responseData.userId }
  } catch (error) {
    console.error('Validation or API error:', error)
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors)
      return {
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      }
    }
    throw error
  }
}

// Get all companies function
export async function getAllCompanies() {
  return fetchApi<CompanyData[]>({
    url: 'api/company/get-all-companies',
    method: 'GET',
  })
}

export async function getAllLocations() {
  return fetchApi<LocationData[]>({
    url: 'api/location/get-all-locations',
    method: 'GET',
  })
}

// Get all roles function
export async function getAllRoles(): Promise<RoleData[]> {
  const response = await fetch(`${API_BASE_URL}/api/roles/get-all-roles`)

  if (!response.ok) {
    throw new Error('Failed to fetch roles')
  }

  const responseData = await response.json()
  const roles = responseData.data

  return roles
    .map((role: any) => {
      try {
        return roleSchema.parse({
          roleId: role.roleId,
          roleName: role.roleName,
        })
      } catch (error) {
        console.error('Error parsing role:', role, error)
        return null
      }
    })
    .filter((role: RoleData | null): role is RoleData => role !== null)
}

// export async function getAllRoles() {
//   return fetchApi<RoleData[]>({
//     url: 'api/roles/get-all-roles',
//     method: 'GET',
//   }).then((response) => {
//     if (response.error || !response.data) {
//       throw new Error(response.error?.message || 'Failed to fetch roles')
//     }
//     return response.data
//       .map((role: any) => {
//         try {
//           return roleSchema.parse({
//             roleId: role.roleId,
//             roleName: role.roleName,
//           })
//         } catch (error) {
//           console.error('Error parsing role:', role, error)
//           return null
//         }
//       })
//       .filter((role: RoleData | null): role is RoleData => role !== null)
//   })
// }