import { fetchApi } from '@/utils/http'
import { BankAccountDateRange } from '@/utils/type'

export async function getBankAccountsByDate(params: BankAccountDateRange, token: string) {
  return fetchApi<BankAccountDateRange[]>({
    url: `api/ledgerreport/bank-ledger?bankaccount=${params.bankaccount}&fromdate=${params.fromdate}&todate=${params.todate}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}