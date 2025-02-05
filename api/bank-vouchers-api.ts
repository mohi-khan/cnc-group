import { z } from 'zod'
import { fetchApi } from '@/utils/http'
import {
  ChartOfAccount,
  BankAccount,
  Company,
  CostCenter,
  LocationData,
  ResPartner,
  AccountsHead,
  JournalQuery,
  JournalEntryWithDetails,
  VoucherById,
  GetDepartment,
} from '@/utils/type'
import { ChartOfAccounts } from './chart-of-accounts-api'

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

export async function getAllBankAccounts() {
  return fetchApi<BankAccount[]>({
    url: 'api/bank-accounts/get-all-bank-accounts',
    method: 'GET',
  })
}

//need to change the type. it should be chartOfAccount type. not BankAccount type.
export async function getAllChartOfAccounts() {
  return fetchApi<AccountsHead[]>({
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

export async function getAllResPartners() {
  return fetchApi<ResPartner[]>({
    url: 'api/res-partner/get-all-res-partners',
    method: 'GET',
  })
}

export async function getAllDepartments() {
  return fetchApi<GetDepartment[]>({
    url: 'api/department/get-all-departments',
    method: 'GET',
  })
}

export async function reverseBankVoucher(voucherNo: number, createdId: number) {
  console.log("🚀 ~ reverseJournalVoucher ~ voucherNo: number, createdId: number:", voucherNo, createdId)
  return fetchApi<VoucherById[]>({
    url: `api/journal/reverseEntry`,
    method: 'POST',
    body: { voucherNo, createdId },
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function editJournalVoucher(voucherid: number, createid: number) {
  console.log(voucherid, createid)
  return fetchApi<JournalEntryWithDetails[]>({
    url: `api/journal/postJournal/${voucherid}/${createid}`,
    method: 'POST',
  })
}

export async function getSingleVoucher(voucherid: number) {
  console.log(voucherid)
  return fetchApi<VoucherById[]>({
    url: `api/journal/getJournalDetail/${voucherid}`,
    method: 'GET',
  })
}