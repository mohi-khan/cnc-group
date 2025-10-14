import { fetchApi } from '@/utils/http'
import { BankAccountDateRange, bankAccountDateRangeSchema, GetBankLedger } from '@/utils/type'
import { z } from 'zod'



// --- API function ---
export async function getBankAccountsByDate(
  params: BankAccountDateRange,
  token: string
) {
  // Validate input
  const validatedParams = bankAccountDateRangeSchema.parse(params)

  return fetchApi<GetBankLedger[]>({
    url: `api/ledgerreport/bank-ledger?bankaccount=${validatedParams.bankaccount}&fromdate=${validatedParams.fromdate}&todate=${validatedParams.todate}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
