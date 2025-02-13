import { fetchApi } from "@/utils/http";
import { BankAccount, BankReconciliationType } from "@/utils/type";

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
  });
}

export async function updateBankReconciliation(id: number, data: Pick<BankReconciliationType, 'reconciled' | 'comments'>) {
  console.log('Updating bank reconciliation:', id, data);
  return fetchApi<BankReconciliationType>({
    url: `api/bank-reconciliation/edit-bank-reconciliation/${id}`,
    method: 'PATCH',
    body: data,
  });
}