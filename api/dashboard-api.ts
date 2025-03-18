import { fetchApi } from '@/utils/http'
import { FundPositionType, GEtExpenseDataType } from '@/utils/type'

export async function getFundPosition(
  companyId: number,
  date: string,
  month: string
) {
  const params = new URLSearchParams({
    companyId: companyId.toString(),
    date: date,
    month: month,
  })
  console.log('🚀 ~ params:', params)
  const url = `api/dashboard/fundPosition?companyId=77,75&date=2025-02-19&month=02`
  return fetchApi<FundPositionType>({
    url,
    method: 'GET',
  })
}

// Get Expensense Data API
// export async function getExpenseData(
//   companyId: number,
//   startDate: string,
//   endDate: string,
//   token: string
// ) {
//   const params = new URLSearchParams({
//     companyId: companyId.toString(),
//     startDate: startDate,
//     endDate: endDate,
//     token: token,
//   })
//   console.log('🚀 ~ params:', params)
//   const url = `api/dashboard/getExpenseData?fromDate=2025-01-01&toDate=2025-12-31&companyId=75`
//   return fetchApi<GEtExpenseDataType>({
//     url,
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       authentication : `Bearer ${token}`
//     }
//   })
// }


export async function getExpenseData(companyId: number, startDate: string, endDate: string, token: string) {
  

  return fetchApi<GEtExpenseDataType>({
     url : `api/dashboard/getExpenseData?fromDate=${startDate}&toDate=${endDate}&companyId=${companyId}`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token, // Using the token directly as passed
    },
  })
}