import { z } from 'zod';

// Define Zod schemas
export const companySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  companyId: z.string().optional(),
  currency: z.enum(["BDT", "USD", "EUR"]),
  phone: z.string().optional(),
  mobile: z.string().min(1, "Mobile number is required"),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  emailDomain: z.string().optional(),
});

export const locationSchema = z.object({
  companyId: z.number(),
  branchName: z.string().min(1, "Branch name is required"),
  address: z.string().min(1, "Address is required"),
});

export async function createCompany(companyData: z.infer<typeof companySchema>) {
  console.log("API: Creating company with data:", companyData);
  
  const response = await fetch('http://localhost:4000/api/company/create-company', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
  });

  console.log("API: Company creation response status:", response.status);
  const data = await response.json();
  console.log("API: Company creation response data:", data);

  if (!response.ok) {
      throw new Error(data.message || 'Failed to create company');
  }

  return data;
}

export async function createLocation(locationData: z.infer<typeof locationSchema>) {
  console.log("API: Creating location with data:", locationData);
  
  const response = await fetch('http://localhost:4000/api/location/create-location', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
  });

  console.log("API: Location creation response status:", response.status);
  const data = await response.json();
  console.log("API: Location creation response data:", data);

  if (!response.ok) {
      throw new Error(data.message || 'Failed to create location');
  }

  return data;
}

