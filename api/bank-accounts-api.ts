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

export async function getAllBankAccounts() {
  return fetchApi<BankAccount[]>({
    url: 'api/bank-accounts/get-all-bank-accounts',
    method: 'GET',
  })
}

//need to change the type. it should be chartOfAccount type. not BankAccount type.
export async function getAllGlAccounts() {
  return fetchApi<AccountsHead[]>({
    url: 'api/chart-of-accounts/get-all-coa',
    method: 'GET',
  })
}
