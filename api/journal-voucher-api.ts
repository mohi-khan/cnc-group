import { fetchApi } from '@/utils/http'
import {
  ChartOfAccount,
  Company,
  CostCenter,
  Department,
  JournalQuery,
  LocationData,
} from '@/utils/type'

export async function getAllCompanies() {
  return fetchApi<Company[]>({
    url: 'api/company/get-all-companies',
    method: 'GET',
  })
}

export async function getAllLocations() {
  return fetchApi<LocationData[]>({
    url: 'api/location/get-all-locations',
    method: 'GET',
  })
}

export async function getAllChartOfAccounts() {
  return fetchApi<ChartOfAccount[]>({
    url: 'api/chart-of-accounts/get-all-coa',
    method: 'GET',
  })
}

export async function getAllCostCenters() {
  return fetchApi<CostCenter[]>({
    url: 'api/cost-centers/get-all-cost-centers',
    method: 'GET',
  })
}

export async function getAllDepartments() {
  return fetchApi<Department[]>({
    url: 'api/department/get-all-departments',
    method: 'GET',
  })
}

export async function getAllVoucher(data: JournalQuery) {
  const queryParams = new URLSearchParams({
    date: data.date,
    companyId: JSON.stringify(data.companyId), // Convert array to JSON string
    locationId: JSON.stringify(data.locationId), // Convert array to JSON string
    voucherType: data.voucherType,
  }).toString()
  console.log(queryParams)
  return fetchApi({
    url: `api/journal/getJournalDetails/?${queryParams}`,
    method: 'GET',
  })
}
