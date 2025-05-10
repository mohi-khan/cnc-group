import { fetchApi } from '@/utils/http'
import {
  JournalEntryWithDetails,
  JournalQuery,
  VoucherById,
} from '@/utils/type'

export async function getSingleVoucher(voucherid: string,token: string) {
  console.log(voucherid)
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
  token: string
) {
  console.log(
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
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function editJournalVoucher(voucherid: number, createid: number) {
  console.log(voucherid, createid)
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
  console.log(queryParams)
  return fetchApi({
    url: `api/journal/getJournalDetails/?${queryParams}`,
    method: 'GET',
  })
}

export async function createJournalEntryWithDetails(
  data: JournalEntryWithDetails
) {
  console.log('Under APi:')
  console.log(data)
  return fetchApi<JournalEntryWithDetails>({
    url: 'api/journal/entry',
    method: 'POST',
    body: data,
  })
}
