import { fetchApi } from '@/utils/http'
import type { BankAccount, BankReconciliationType } from '@/utils/type'

export async function getAllBankAccounts() {
  return fetchApi<BankAccount[]>({
    url: 'api/bank-accounts/get-all-bank-accounts',
    method: 'GET',
  })
}

export async function getBankReconciliations() {
  return fetchApi<BankReconciliationType[]>({
    url: 'api/bank-reconciliation/get-all-bank-reconciliations',
    method: 'GET',
  })
}

export async function updateBankReconciliationComments(
  id: number,
  comments: string
) {
  console.log('Updating bank reconciliation comments:', id, comments)
  return fetchApi<BankReconciliationType>({
    url: `api/bank-reconciliation/edit-bank-reconciliations-comment/${id}`,
    method: 'PATCH',
    body: { comments },
  })
}

export async function setReconciled(id: number, reconciled: boolean) {
  const url = reconciled
    ? `api/bank-reconciliation/true-bank-reconciliations/${id}`
    : `api/bank-reconciliation/false-bank-reconciliations/${id}`

  return fetchApi<BankReconciliationType>({
    url,
    method: 'PATCH',
  })
}
