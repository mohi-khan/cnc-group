import { z } from 'zod'

// Zod schema for bank account validation
export const bankAccountSchema = z.object({
  id: z.number().optional(),
  accountName: z.string().min(2, 'Account name must be at least 2 characters.').max(100, 'Account name must not exceed 100 characters.'),
  accountNumber: z.string().min(5, 'Account number must be at least 5 characters.').max(50, 'Account number must not exceed 50 characters.'),
  bankName: z.string().min(2, 'Bank name must be at least 2 characters.').max(100, 'Bank name must not exceed 100 characters.'),
  branchName: z.string().max(100, 'Branch name must not exceed 100 characters.').optional(),
  ifscCode: z.string().max(20, 'IFSC code must not exceed 20 characters.').optional().nullable(),
  swiftCode: z.string().max(20, 'SWIFT code must not exceed 20 characters.').optional().nullable(),
  currencyId: z.string().max(36, 'Currency ID must not exceed 36 characters'),
  accountType: z.enum(['Savings', 'Current', 'Overdraft', 'Fixed']),
  openingBalance: z.number().nonnegative('Opening balance must be a non-negative number.').multipleOf(0.01, 'Opening balance must have at most 2 decimal places.'),
  validityDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  assetDetails: z.string().max(255, 'Asset details must not exceed 255 characters').optional().nullable(),
  isActive: z.boolean(),
  isReconcilable: z.boolean(),
  glAccountId: z.string().max(36, 'GL Account ID must not exceed 36 characters').optional(),
  bankCode: z.string().max(50, 'Bank code must not exceed 50 characters').optional().nullable(),
  integrationId: z.string().max(36, 'Integration ID must not exceed 36 characters').optional().nullable(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
  createdBy: z.number(),
  updatedBy: z.number().optional(),
})

export type BankAccount = z.infer<typeof bankAccountSchema> & {
  createdAt?: string;
  updatedAt?: string;
};

export type BankAccountCreate = Omit<BankAccount, 'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'>;
export type BankAccountUpdate = Omit<BankAccount, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>;

const API_BASE_URL = 'http://localhost:4000'

export async function createBankAccount(data: BankAccountCreate): Promise<BankAccount> {
  console.log('Creating bank account:', data);
  const response = await fetch(`${API_BASE_URL}/api/bank-accounts/create-bank-account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to create bank account')
  }
  console.log('Bank account created:', response);
  return response.json()
}

export async function editBankAccount(id: number, data: BankAccountUpdate): Promise<BankAccount> {
  console.log('Editing bank account:', id, data);
  const response = await fetch(`${API_BASE_URL}/api/bank-accounts/edit-bank-account/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to edit bank account')
  }
  console.log('Bank account edited:', response);
  return response.json()
}

export async function getAllBankAccounts(): Promise<BankAccount[]> {
  console.log('Fetching all bank accounts');
  const response = await fetch(`${API_BASE_URL}/api/bank-accounts/get-all-bank-accounts`)

  if (!response.ok) {
    throw new Error('Failed to fetch bank accounts')
  }
  console.log('Fetched bank accounts:', response);
  return response.json()
}

export async function getAllGlAccounts() {
  console.log('Fetching all GL accounts');
  const response = await fetch(`${API_BASE_URL}/api/chart-of-accounts/get-all-coa`)

  if (!response.ok) {
    throw new Error('Failed to fetch GL accounts')
  }
  console.log('Fetched GL accounts:', response);
  return response.json()
}

