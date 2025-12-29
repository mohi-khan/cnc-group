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
  Permission,
  ResPartner,
} from '@/utils/type'
import { CompanyType } from './company-api'
import { RoleData } from './create-user-api'

// Chart of Accounts Get Api
export async function getAllChartOfAccounts(token: string) {
  return fetchApi<AccountsHead[]>({
    url: 'api/chart-of-accounts/get-all-coa',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
export async function getAllChartOfAccountsWithCompany(token: string) {
  return fetchApi<AccountsHead[]>({
    url: 'api/chart-of-accounts/get-all-coa-with-company',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

// All Company Get Api
export async function getAllCompanies(token: string) {
  return fetchApi<CompanyType[]>({
    url: 'api/company/get-all-companies',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
export async function getFactoryLocaiton(token: string, companyId: number) {
  return fetchApi<number>({
    url: `api/location/getFactoryLocaiton/${companyId}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

//get all assets api from database
export async function getAssets(token: string) {
  return fetchApi<GetAssetData[]>({
    url: 'api/asset/get-all-asset',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

// All Role Get Api
export async function getAllRoles(token: string) {
  return fetchApi<RoleData[]>({
    url: 'api/roles/get-all-roles',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

// Get all Permission Api
export async function getAllPermissions(token: string) {
  return fetchApi<Permission[]>({
    url: 'api/roles/get-all-permissions',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

//update role permissions api
export async function updateRolePermissions(
  roleId: number,
  permissions: number[], // ← Change from string[] to number[]
  token: string
) {
  return fetchApi({
    url: `api/roles/update-role-permissions/${roleId}`,
    method: 'PUT',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    body: { permissions }
  });
}



// All Department Get Api
export async function getAllDepartments(token: string) {
  return fetchApi<GetDepartment[]>({
    url: 'api/department/get-all-departments',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

// get all res partner data
export async function getAllResPartners(token: string) {
  return fetchApi<ResPartner[]>({
    url: 'api/res-partner/get-all-res-partners',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getResPartnersBySearch(search: string, token: string) {
  return fetchApi<ResPartner[]>({
    url: `api/res-partner/get-res-partners-by-search?search=${search}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getPartnerById(id: number, token: string) {
  console.log(id);
  return fetchApi<ResPartner>({
    url: `api/res-partner/getbyId/${id}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
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
    },
  })
}

//Get All Locations Get Api
export async function getAllLocations(token: string) {
  return fetchApi<LocationData[]>({
    url: 'api/location/get-all-locations',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

//get all cost center api
export async function getAllCostCenters(token: string) {
  return fetchApi<CostCenter[]>({
    url: 'api/cost-centers/get-all-cost-centers',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

//Get all currency api
export async function getAllExchange(token: string) {
  return fetchApi<ExchangeType[]>({
    url: 'api/exchange/get-all-exchange',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

//get all currency api
export async function getAllCurrency(token: string) {
  return fetchApi<CurrencyType[]>({
    url: 'api/exchange/get-all-currency',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

//Fetch All Employee Data
export async function getEmployee(token: string) {
  return fetchApi<Employee[]>({
    url: 'api/employee/getEmployees',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getSettings(token: string, settingsName: string) {
  return fetchApi<number>({
    url: `api/settings/get/${settingsName}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}