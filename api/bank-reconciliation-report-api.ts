import { fetchApi } from '@/utils/http'
import { BankAccount, BankReconciliationReportType } from '@/utils/type'

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
