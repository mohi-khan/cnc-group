import { z } from 'zod';

// Sign-up schema
const signUpSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
    role: z.enum(["Admin", "Entry Operation", "Supervisor", "Management"]),
    companies: z.array(z.string()),
    locations: z.array(z.string()),
    vouchers: z.array(z.string())
});

export const locationSchema = z.object({
    locationId: z.number(),
    address: z.string().min(1, "Location address is required"),
    // Add other fields as necessary
  });

export type LocationData = z.infer<typeof locationSchema>;

export type SignUpData = z.infer<typeof signUpSchema>;

const companySchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
});

const roleSchema = z.object({
    companyName: z.string().min(1, "role is required"),
});

export type CompanyData = z.infer<typeof companySchema>;

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

        if (!response.ok) {
            throw new Error('Sign up failed');
        }

        return await response.json();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, errors: error.errors };
        }
        throw error;
    }
}

// Get all companies function
export async function getAllCompanies() {
    try {
        const response = await fetch('http://localhost:4000/api/company/get-all-companies');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('companies data', data)
        return data.map((company: any) => companySchema.parse(company));
    } catch (error) {
        console.error('Error fetching companies:', error);
        throw new Error('Failed to fetch companies. Please try again later.');
    }
}

export async function getAllRoles() {
    try {
        const response = await fetch('http://localhost:4000/api/roles/get-all-roles');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('role data', data)
        return data.map((role: any) => roleSchema.parse(role));
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw new Error('Failed to fetch roles. Please try again later.');
    }
}

export async function getAllLocations() {
    try {
      const response = await fetch('http://localhost:4000/api/location/get-all-locations');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData = await response.json();
      console.log('locations data', responseData.data);
      
      // Assuming the locations are in responseData.data
      const locations = responseData.data;
      
      // Validate and transform the data
      return locations.map((location: any) => {
        try {
          return locationSchema.parse({
            locationId: location.locationId,
            address: location.address,
            // Map other fields as necessary
          });
        } catch (error) {
          console.error('Error parsing location:', location, error);
          return null;
        }
      }).filter((location: LocationData | null): location is LocationData => location !== null);
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw new Error('Failed to fetch locations. Please try again later.');
    }
  }
  
  