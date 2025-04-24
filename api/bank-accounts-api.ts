import { fetchApi } from '@/utils/http'
import { AccountsHead, BankAccount, BankAccountCreate, BankAccountUpdate, ChartOfAccount, CreateBankAccount } from '@/utils/type'

export async function createBankAccount(data: BankAccountCreate) {
  console.log('Creating bank account:', data)
  return fetchApi<CreateBankAccount>({
    url: 'api/bank-accounts/create-bank-account',
    method: 'POST',
    body: data,
  })
}

export async function editBankAccount(id: number, data: BankAccountUpdate) {
  console.log('Editing bank account:', id, data)
  return fetchApi<BankAccount>({
    url: `api/bank-accounts/edit-bank-account/${id}`,
    method: 'PATCH',
    body: data,
  })
}

