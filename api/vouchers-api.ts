import { fetchApi } from '@/utils/http'
import {
  AccountsHead,
  ChartOfAccount,
  costCentersArraySchema,
  Department,
  EditJournalEditNotesType,
  GetDepartment,
  JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  JournalQuery,
  JournalResult,
  ResPartner,
  VoucherById,
} from '@/utils/type'
import { useCallback } from 'react'
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

export async function editJournalDetailsNotes(
  data: EditJournalEditNotesType,
  token: string
) {
  console.log('Under APi:', data)
  return fetchApi<EditJournalEditNotesType>({
    url: 'api/journal/edit-notes',
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
    },
  })
}

export async function makePostJournal(voucherid: string, createId: string, token: string) {
  console.log('voucherid:', voucherid, 'Create ID:', createId)
  return fetchApi({
    url: `api/journal/postJournal/${voucherid}/${createId}`,
    method: 'POST',
    headers: {
      Authorization: `${token}`,
    },
  })
}

// Get All Voucher Data
export const getAllVoucher=async(data: JournalQuery, token: string)=> {
  const queryParams = new URLSearchParams({
    date: data.date,
    companyId: JSON.stringify(data.companyId), // Convert array to JSON string
    locationId: JSON.stringify(data.locationId), // Convert array to JSON string
    voucherType: data.voucherType ?? '',
  }).toString()
  
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
    url: `api/journal/getJournalDetail/${voucherid}`, // Dynamic URL with voucherid
    method: 'GET',
  })
}
