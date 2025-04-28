import { fetchApi } from '@/utils/http'
import {
  AccountsHead,
  BankAccount,
  CostCenter,
  CurrencyType,
  Employee,
  ExchangeType,
  GetAssetData,
  GetDepartment,
  LocationData,
  ResPartner,
} from '@/utils/type'
import { CompanyType } from './company-api'

// Chart of Accounts Get Api
export async function getAllChartOfAccounts(token: string) {
  return fetchApi<AccountsHead[]>({
    url: 'api/chart-of-accounts/get-all-coa',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    }
  })
}

// All Company Get Api
export async function getAllCompanies() {
  return fetchApi<CompanyType[]>({
    url: 'api/company/get-all-companies',
    method: 'GET',
  })
}

//get all assets api from database
export async function getAssets() {
  return fetchApi<GetAssetData[]>({
    url: 'api/asset/get-all-asset',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// All Department Get Api
export async function getAllDepartments(token: string) {
  return fetchApi<GetDepartment[]>({
    url: 'api/department/get-all-departments',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    }
  })
}

// get all res partner data
export async function getAllResPartners() {
  return fetchApi<ResPartner[]>({
    url: 'api/res-partner/get-all-res-partners',
    method: 'GET',
  })
}

// All Bank Accounts Get Api
export async function getAllBankAccounts(token: string) {
  return fetchApi<BankAccount[]>({
    url: 'api/bank-accounts/get-all-bank-accounts',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    }
  })
}

//Get All Locations Get Api
export async function getAllLocations() {
  return fetchApi<LocationData[]>({
    url: 'api/location/get-all-locations',
    method: 'GET',
  })
}

//get all cost center api
export async function getAllCostCenters() {
  return fetchApi<CostCenter[]>({
    url: 'api/cost-centers/get-all-cost-centers',
    method: 'GET',
  })
}

//Get all currency api
export async function getAllExchange() {
  return fetchApi<ExchangeType[]>({
    url: 'api/exchange/get-all-exchange',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

//get all currency api
export async function getAllCurrency() {
  return fetchApi<CurrencyType[]>({
    url: 'api/exchange/get-all-currency',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

//Fetch All Employee Data
export async function getEmployee() {
  return fetchApi<Employee[]>({
    url: 'api/employee/getEmployees',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}