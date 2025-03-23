import { fetchApi } from '@/utils/http'
import { Department, FundPositionType, GetCostBreakdownType, GEtExpenseDataType } from '@/utils/type'

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

// Get Expense Data API
export async function getExpenseData(
  companyId: number,
  startDate: string,
  endDate: string,
  token: string
) {
  return fetchApi<GEtExpenseDataType>({
    url: `api/dashboard/getExpenseData?fromDate=${startDate}&toDate=${endDate}&companyId=${companyId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token, // Using the token directly as passed
    },
  })
}

//getIncomeData API

export async function getIncomeData(
  companyId: number,
  startDate: string,
  endDate: string,
  token: string
) {
  return fetchApi<GEtExpenseDataType>({
    url: `api/dashboard/getIncomeData?fromDate=${startDate}&toDate=${endDate}&companyId=${companyId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token, // Using the token directly as passed
    },
  })
}

//Get getGPData API

export async function getGPData(
  companyId: number,
  startDate: string,
  endDate: string,
  token: string
) {
  return fetchApi<GEtExpenseDataType>({
    url: `api/dashboard/getGPData?fromDate=${startDate}&toDate=${endDate}&companyId=${companyId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token, // Using the token directly as passed
    },
  })
}

//Get getNPData API

export async function getNPData(
  companyId: number,
  startDate: string,
  endDate: string,
  token: string
) {
  return fetchApi<GEtExpenseDataType>({
    url: `api/dashboard/getNPData?fromDate=${startDate}&toDate=${endDate}&companyId=${companyId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token, // Using the token directly as passed
    },
  })
}

//Get Department Data API
export async function getAllDepartments() {
  return fetchApi<Department[]>({
    url: 'api/department/get-all-departments',
    method: 'GET',
  })
}

//GET cost breakkdown API
export async function getCostBreakdown(
  departmentId: number,
  fromDate: string,
  toDate: string,
  companyId: number
) {
  return fetchApi<GetCostBreakdownType>({
    url: `api/dashboard/getcostBreakdown?departmentId=${departmentId}&fromDate=${fromDate}&toDate=${toDate}&companyId=${companyId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}