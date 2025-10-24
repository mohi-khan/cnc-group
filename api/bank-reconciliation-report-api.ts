import { fetchApi } from '@/utils/http'
import { BankAccount, BankReconciliationReportType, CreateReconciliationOpeningType } from '@/utils/type'

export async function getBankReconciliationReports(
  bankId: number,
  fromDate: string,
  toDate: string,
  token: string,
) {
  const params = new URLSearchParams({
    bankId: bankId.toString(),
    fromDate: fromDate,
    toDate: toDate,
    token: token,
  })
  
  const url = `api/bank-reconciliation/get-bank-reconciliation-summary?${params}`
  return fetchApi<BankReconciliationReportType[]>({
    url,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}






export async function createReconciliationOpening(
  data: { bankId: number; openingBalance: number },
  token: string
) {
  return fetchApi({
    url: 'api/bank-reconciliation/reconciliation-opening',
    method: 'POST',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
