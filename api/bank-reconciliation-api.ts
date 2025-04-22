import { fetchApi } from '@/utils/http'
import type { BankAccount, BankReconciliationType } from '@/utils/type'

// export async function getAllBankAccounts() {
//   return fetchApi<BankAccount[]>({
//     url: 'api/bank-accounts/get-all-bank-accounts',
//     method: 'GET',
//   })
// }

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

export async function updateBankReconciliation(
  id: number,
  reconciled: boolean,
  comments: string,
) {
  console.log("Updating bank reconciliation:", id, reconciled, comments)
  return fetchApi<BankReconciliationType>({
    url: `api/bank-reconciliation/edit-bank-reconciliation/${id}`,
    method: "PATCH",
    body: { reconciled, comments },
  })
}
