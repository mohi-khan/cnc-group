import { fetchApi } from '@/utils/http'
import { BankBalance, CashBalance, LoanReport } from '@/utils/type'

// export async function getBankBalance(fromDate: string, toDate: string,token: string) {
//   return fetchApi<BankBalance[]>({
//     url: `api/cash/bankBal?fromdate=${fromDate}&todate=${toDate}`,
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `${token}`,
//     },
//   })
// }
export async function getBankBalance(date: string, token: string) {
  return fetchApi<BankBalance[]>({
    url: `api/cash/bankBal?date=${date}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}


// export async function getCashBalance(fromDate: string, toDate: string,token: string) {
//   return fetchApi<CashBalance[]>({
//     url: `api/cash/cashBal?fromdate=${fromDate}&todate=${toDate}`,
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `${token}`,
//     },
//   })
// }


export async function getCashBalance(date: string, token: string) {
  return fetchApi<CashBalance[]>({
    url: `api/cash/cashBal?date=${date}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}




export async function getLoanReport(date: string, token: string) {
  return fetchApi<LoanReport[]>({
    url: `api/cash/loanReport?date=${date}`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    },
  })
}



