import { z } from 'zod';

enum VoucherTypes {
    Payment = 'Payment Voucher',
    Receipt = 'Receipt Voucher',
    Bank = 'Bank Voucher',
    Journal = 'Journal Voucher',
    Contra = 'Contra Voucher',
}

// Sign-up schema
const signUpSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    active: z.boolean().default(true),
    roleId: z.number(),
    voucherTypes: z
      .array(z.nativeEnum(VoucherTypes))
      .min(1, "At least one voucher type is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const locationSchema = z.object({
    locationId: z.number(),
    address: z.string().min(1, "Location address is required"),
});

const companySchema = z.object({
    companyId: z.number().min(1, "CompanyId is required"),
    companyName: z.string().min(1, "Company name is required"),
});

const userLocationSchema = z.object({
    userId: z.number().min(1, "UserId is required"),
    locationId: z.number().min(1, "LocationId is required"),
});

const userCompanySchema = z.object({
    userId: z.number().min(1, "UserId is required"),
    companyId: z.number().min(1, "CompanyId is required"),
});

const roleSchema = z.object({
    roleId: z.number(),
    roleName: z.string().min(1, "role name is required"),
});

export type LocationData = z.infer<typeof locationSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type CompanyData = z.infer<typeof companySchema>;
export type UserCompanyData = z.infer<typeof userCompanySchema>;
export type UserLocationData = z.infer<typeof userLocationSchema>;
export type RoleData = z.infer<typeof roleSchema>;

// Sign-up function
export async function signUp(data: SignUpData) {
    try {
        const validatedData = signUpSchema.parse(data);
        const response = await fetch('http://localhost:4000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(validatedData),
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('Server response:', responseData);
            throw new Error(responseData.message || 'Sign up failed');
        }

        return { success: true, userId: responseData.userId };
    } catch (error) {
        console.error('Validation or API error:', error);
        if (error instanceof z.ZodError) {
            console.error('Validation errors:', error.errors);
            return { 
                success: false, 
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            };
        }
        throw error;
    }
}

// User-Location association function
export async function createUserLocation(userLocationData: { userId: number, locationId: number[] }) {
    const promises = userLocationData.locationId.map(async (locationId) => {
        const data = { userId: userLocationData.userId, locationId };
        const validatedData = userLocationSchema.parse(data);
        const response = await fetch('http://localhost:4000/api/auth/create-user-location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create user location');
        }

        return response.json();
    });

    return Promise.all(promises);
}

// User-Company association function
export async function createUserCompany(userCompanyData: { userId: number, companyId: number[] }) {
    const promises = userCompanyData.companyId.map(async (companyId) => {
        const data = { userId: userCompanyData.userId, companyId };
        const validatedData = userCompanySchema.parse(data);
        const response = await fetch('http://localhost:4000/api/auth/create-user-company', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create user company');
        }

        return response.json();
    });

    return Promise.all(promises);
}

// Get all companies function
export async function getAllCompanies() {
    const response = await fetch('http://localhost:4000/api/company/get-all-companies');
    
    if (!response.ok) {
        throw new Error('Failed to fetch companies');
    }
    
    const data = await response.json();
    return data.map((company: any) => companySchema.parse(company));
}

// Get all roles function
export async function getAllRoles(): Promise<RoleData[]> {
    const response = await fetch('http://localhost:4000/api/roles/get-all-roles');
    
    if (!response.ok) {
        throw new Error('Failed to fetch roles');
    }
    
    const responseData = await response.json();
    const roles = responseData.data;

    return roles
        .map((role: any) => {
            try {
                return roleSchema.parse({
                    roleId: role.roleId,
                    roleName: role.roleName
                });
            } catch (error) {
                console.error('Error parsing role:', role, error);
                return null;
            }
        })
        .filter((role: RoleData | null): role is RoleData => role !== null);
}

// Get all locations function
export async function getAllLocations() {
    const response = await fetch('http://localhost:4000/api/location/get-all-locations');
    
    if (!response.ok) {
        throw new Error('Failed to fetch locations');
    }
    
    const responseData = await response.json();
    const locations = responseData.data;

    return locations
        .map((location: any) => {
            try {
                return locationSchema.parse({
                    locationId: location.locationId,
                    address: location.address,
                });
            } catch (error) {
                console.error('Error parsing location:', location, error);
                return null;
            }
        })
        .filter((location: LocationData | null): role is LocationData => location !== null);
}

