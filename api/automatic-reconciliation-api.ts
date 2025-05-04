import { fetchApi } from '@/utils/http'
import type {
  BankReconciliationType,
  GetBankTransactionType,
} from '@/utils/type'

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
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}

export async function getBankTransactions(
  bankId: number,
  fromDate: string,
  toDate: string,
  token: string
) {
  const params = new URLSearchParams({
    bankId: bankId.toString(),
    fromDate: fromDate,
    toDate: toDate,
    token: token
  })
  console.log('🚀 ~ params:', params)
  const url = `api/bank-transactions/get-bank-transactions?${params}`
  return fetchApi<GetBankTransactionType[]>({
    url,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}

export async function updateBankReconciliation(
  id: number,
  reconciled: number,
  comments: string
) {
  console.log('Updating bank reconciliation:', id, reconciled, comments)
  return fetchApi<BankReconciliationType>({
    url: `api/bank-reconciliation/edit-bank-reconciliation/${id}`,
    method: 'PATCH',
    body: { reconciled, comments },
  })
}

export async function automaticReconciliation(
  reconciliations: Array<{ id: number; reconcileId: number }>, token: string
) {
  console.log('Processing automatic reconciliation:', reconciliations)
  return fetchApi<BankReconciliationType>({
    url: `api/bank-reconciliation/auto-reconcile`,
    method: 'PATCH',
    body: reconciliations,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}
