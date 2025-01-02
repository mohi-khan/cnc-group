import { fetchApi } from '@/utils/http'
import {
  ChartOfAccount,
  Company,
  CostCenter,
  Department,
  JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  JournalNotes,
  JournalQuery,
  LocationData,
  VoucherById,
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

export async function getSingleVoucher(voucherid: number) {
  console.log(voucherid)
  return fetchApi<VoucherById[]>({
    url: `api/journal/getJournalDetail/${voucherid}`,
    method: 'GET',
  })
}

export async function reverseJournalVoucher(voucherNo: number, createdId: number) {
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

export async function editJournalDetail(data: JournalNotes) {
  return fetchApi<JournalNotes>({
    url: `api/journal/edit-notes`,
    method: 'PATCH',
    body: data
  })
}

// export async function editJournalVoucher(voucherid: number, createid: number) {
//   console.log(voucherid, createid)
//   return fetchApi<VoucherById[]>({
//     url: `api/journal/postJournal/${voucherid}/${createid}`,
//     method: 'POST',
//   })
// }

export async function getAllVoucher(data: JournalQuery) {
  const queryParams = new URLSearchParams({
    date: data.date,
    companyId: JSON.stringify(data.companyId), // Convert array to JSON string
    locationId: JSON.stringify(data.locationId), // Convert array to JSON string
    voucherType: data.voucherType,
  }).toString()
  console.log(queryParams)
  return fetchApi<VoucherById[]>({
    url: `api/journal/getJournalDetails/?${queryParams}`,
    method: 'GET',
  })
}

export async function createJournalEntryWithDetails(
  data: JournalEntryWithDetails
) {
  console.log("Under APi:");
  console.log(data);
  return fetchApi<JournalEntryWithDetails>({
    url: 'api/journal/entry',
    method: 'POST',
    body: data,
  })
}