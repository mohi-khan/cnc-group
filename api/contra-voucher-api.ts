import { fetchApi } from '@/utils/http'
import {
  JournalEntryWithDetails,
  JournalQuery,
  VoucherById,
} from '@/utils/type'

export async function getSingleVoucher(voucherid: string,token: string) {
  
  return fetchApi<VoucherById[]>({
    url: `api/journal/getJournalDetail/${voucherid}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
      
    }
  })
}

export async function reverseJournalVoucher(
  voucherNo: number,
  createdId: number,
  token: string,
  notes?: string // ✅ optional custom note
) {
  return fetchApi<VoucherById[]>({
    url: `api/journal/reverseEntry`,
    method: 'POST',
    body: { voucherNo, createdId, notes }, // ✅ include notes in request body
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function editJournalVoucher(voucherid: number, createid: number) {
  
  return fetchApi<VoucherById[]>({
    url: `api/journal/postJournal/${voucherid}/${createid}`,
    method: 'POST',
  })
}

export async function getAllVoucher(data: JournalQuery) {
  const queryParams = new URLSearchParams(
    Object.entries({
      date: data.date,
      companyId: JSON.stringify(data.companyId), // Convert array to JSON string
      locationId: JSON.stringify(data.locationId), // Convert array to JSON string
      voucherType: data.voucherType || '', // Ensure undefined is handled
    }).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) acc[key] = String(value) // Convert all values to strings
        return acc
      },
      {} as Record<string, string>
    )
  ).toString()
  
  return fetchApi({
    url: `api/journal/getJournalDetails/?${queryParams}`,
    method: 'GET',
  })
}

export async function createJournalEntryWithDetails(
  data: JournalEntryWithDetails
) {
  
  
  return fetchApi<JournalEntryWithDetails>({
    url: 'api/journal/entry',
    method: 'POST',
    body: data,
  })
}
