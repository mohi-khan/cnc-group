import { fetchApi } from '@/utils/http'
import { UtilityBillSummary } from '@/utils/type'

export async function getUtilityBillsSummary(
  token: string,
  fromDate: string,
  toDate: string,
  meterNo: string
) {
  return fetchApi<UtilityBillSummary>({
    url: `api/utilities/getBillsSummary?fromDate=${fromDate}&toDate=${toDate}&meterNo=${meterNo}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getUtilityBills(token: string) {
  return fetchApi({
    url: 'api/utilities/getMeters',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

