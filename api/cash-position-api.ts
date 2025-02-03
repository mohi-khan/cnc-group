import { fetchApi } from '@/utils/http'
import { BankBalance, CashBalance } from '@/utils/type'

export async function getBankBalance() {
  return fetchApi<BankBalance[]>({
    // url: `api/cash/bankBal?fromdate=${fromdate}&todate=${enddate}`,
    url: 'api/cash/bankBal?fromdate=01-01-2024&todate=02-03-2025',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
export async function getCashBalance({
  fromdate,
  enddate,
}: {
  fromdate: string
  enddate: string
}) {
  return fetchApi<CashBalance[]>({
    // url: `api/cash/bankBal?fromdate=${fromdate}&todate=${enddate}`,
    url: 'api/cash/cashBal?fromdate=01-01-2024&todate=02-03-2025',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}


// {
//   fromdate,
//   enddate,
// }: {
//   fromdate: string
//   enddate: string
// }