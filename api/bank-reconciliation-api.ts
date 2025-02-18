import { fetchApi } from '@/utils/http'
import type { BankAccount, BankReconciliationType } from '@/utils/type'

export async function getAllBankAccounts() {
  return fetchApi<BankAccount[]>({
    url: 'api/bank-accounts/get-all-bank-accounts',
    method: 'GET',
  })
}

export async function getBankReconciliations(
  bankId: number,
  fromDate: string,
  toDate: string
) {
  const params = new URLSearchParams({
    bankId: bankId.toString(),
    fromDate: fromDate,
    toDate: toDate,
  })
  console.log('🚀 ~ params:', params)
  const url = `api/bank-reconciliation/get-all-bank-reconciliations?${params}`
  return fetchApi<BankReconciliationType[]>({
    url,
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
