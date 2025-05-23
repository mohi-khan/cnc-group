import { z } from 'zod'
import { fetchApi } from '@/utils/http'
import { JournalEntryWithDetails, VoucherById } from '@/utils/type'

export async function reverseBankVoucher(voucherNo: number, createdId: number) {
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
