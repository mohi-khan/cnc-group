import { fetchApi } from '@/utils/http'
import {
  AccountsHead,
  ChartOfAccount,
  costCentersArraySchema,
  Department,
  GetDepartment,
  JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  JournalQuery,
  JournalResult,
  ResPartner,
  VoucherById,
} from '@/utils/type'
import { z } from 'zod'

export type CostCenter = z.infer<typeof costCentersArraySchema>

export async function createJournalEntryWithDetails(
  data: JournalEntryWithDetails, token: string
) {
  console.log('Under APi:')
  console.log(data)
  return fetchApi<JournalEntryWithDetails>({
    url: 'api/journal/entry',
    method: 'POST',
    body: data,
    headers: {
      Authorization: `${token}`,
    },
  })
}
// Get All Voucher Data
export async function getAllVoucher(data: JournalQuery, token: string) {
  const queryParams = new URLSearchParams({
    date: data.date,
    companyId: JSON.stringify(data.companyId), // Convert array to JSON string
    locationId: JSON.stringify(data.locationId), // Convert array to JSON string
    voucherType: data.voucherType ?? '',
  }).toString()
  console.log(queryParams)
  return fetchApi({
    url: `api/journal/getJournalLists/?${queryParams}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
    },
  })
}

export async function getAllVoucherById(voucherid: string) {
  console.log(voucherid)
  return fetchApi<VoucherById[]>({
    url: `api/journal/getJournalDetail/${voucherid}`, // Dynamic URL with voucherId
    method: 'GET',
  })
}
