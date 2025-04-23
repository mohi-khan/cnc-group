import { fetchApi } from '@/utils/http'
import {
  JournalEntryWithDetails,
  JournalNotes,
  JournalQuery,
  JournalResult,
  VoucherById,
} from '@/utils/type'

export async function getSingleVoucher(voucherid: number) {
  console.log(voucherid)
  return fetchApi<VoucherById[]>({
    url: `api/journal/getJournalDetail/${voucherid}`,
    method: 'GET',
  })
}

export async function reverseJournalVoucher(
  voucherNo: number,
  createdId: number
) {
  console.log(
    '🚀 ~ reverseJournalVoucher ~ voucherNo: number, createdId: number:',
    voucherNo,
    createdId
  )
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
    body: data,
  })
}

export async function getAllVoucher(data: JournalQuery) {
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
  console.log(queryParams)
  return fetchApi<JournalResult[]>({
    url: `api/journal/getJournalLists/?${queryParams}`,
    method: 'GET',
  })
}

export async function createJournalEntryWithDetails(
  data: JournalEntryWithDetails
) {
  console.log('journal', data)
  return fetchApi<JournalEntryWithDetails>({
    url: 'api/journal/entry',
    method: 'POST',
    body: data,
  })
}
