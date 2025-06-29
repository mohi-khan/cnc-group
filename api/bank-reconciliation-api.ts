import { fetchApi } from '@/utils/http'
import type { BankAccount, BankReconciliationType } from '@/utils/type'

export async function getBankReconciliations(
  bankId: number,
  fromDate: string,
  toDate: string,
  token: string
) {
  const params = new URLSearchParams({
    bankId: bankId.toString(),
    fromDate: fromDate,
    toDate: toDate,
    token: token,
  })
  console.log('🚀 ~ params:', params)
  const url = `api/bank-reconciliation/get-all-bank-reconciliations?${params}`
  return fetchApi<BankReconciliationType[]>({
    url,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function updateBankReconciliation(
  id: number,
  reconciled: boolean,
  comments: string,
  token: string
) {
  console.log('Updating bank reconciliation:', id, reconciled, comments)
  return fetchApi<BankReconciliationType>({
    url: `api/bank-reconciliation/edit-bank-reconciliation/${id}`,
    method: 'PATCH',
    body: { reconciled, comments },
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function markTrueBankReconciliations(
  ids: number[],
  token: string
) {
  console.log('Updating bank reconciliation:', ids)
  return fetchApi<BankReconciliationType>({
    url: `api/bank-reconciliation/true-bank-reconciliations`,
    method: 'PATCH',
    body: { ids },
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
