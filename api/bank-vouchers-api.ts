import { z } from 'zod'
import { fetchApi } from '@/utils/http'
import { JournalEntryWithDetails, VoucherById } from '@/utils/type'

export async function reverseBankVoucher(voucherNo: number, createdId: number) {
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
  
  return fetchApi<JournalEntryWithDetails[]>({
    url: `api/journal/postJournal/${voucherid}/${createid}`,
    method: 'POST',
  })
}

export async function getSingleVoucher(voucherid: number) {
  
  return fetchApi<VoucherById[]>({
    url: `api/journal/getJournalDetail/${voucherid}`,
    method: 'GET',
  })
}
