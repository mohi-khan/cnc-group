import { fetchApi } from '@/utils/http'
import {
  JournalEntryWithDetails,
  JournalNotes,
  JournalQuery,
  JournalResult,
  VoucherById,
} from '@/utils/type'

export async function getSingleVoucher(voucherid: number,token: string) {
  
  return fetchApi<VoucherById[]>({
    url: `api/journal/getJournalDetail/${voucherid}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    }, 
  })
}

export async function reverseJournalVoucher(
  voucherNo: number,
  createdId: number,
  token: string
) {
  
    '🚀 ~ reverseJournalVoucher ~ voucherNo: number, createdId: number:',
    voucherNo,
    createdId,
    token
  )
  return fetchApi<VoucherById[]>({
    url: `api/journal/reverseEntry`,
    method: 'POST',
    body: { voucherNo, createdId },
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}

export async function editJournalDetail(data: JournalNotes, token: string) {
  return fetchApi<JournalNotes>({
    url: `api/journal/edit-notes`,
    method: 'PATCH',
    body: data,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    }, 
  })
}

export async function getAllVoucher(data: JournalQuery, token: string) {
  const queryParams = new URLSearchParams(
    Object.entries({
      date: data.date,
      companyId: JSON.stringify(data.companyId),
      locationId: JSON.stringify(data.locationId),
      voucherType: data.voucherType ?? '', // Ensure undefined is handled
    }).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) acc[key] = String(value)
        return acc
      },
      {} as Record<string, string>
    )
  ).toString()
  
  return fetchApi<JournalResult[]>({
    url: `api/journal/getJournalLists/?${queryParams}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
    },
  })
}

export async function createJournalEntryWithDetails(
  data: JournalEntryWithDetails,
  token: string
) {
  
  return fetchApi<JournalEntryWithDetails>({
    url: 'api/journal/entry',
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}
