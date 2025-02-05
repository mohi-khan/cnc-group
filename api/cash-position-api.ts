import { fetchApi } from '@/utils/http'
import { BankBalance, CashBalance } from '@/utils/type'

export async function getBankBalance(fromDate: string, toDate: string) {
  return fetchApi<BankBalance[]>({
    url: `api/cash/bankBal?fromdate=${fromDate}&todate=${toDate}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function getCashBalance(fromDate: string, toDate: string) {
  return fetchApi<CashBalance[]>({
    url: `api/cash/cashBal?fromdate=${fromDate}&todate=${toDate}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
