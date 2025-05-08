import { fetchApi } from '@/utils/http'
import { PartnerLedgerType, ResPartner } from '@/utils/type'



export async function getPartnerLedgerByDate({
  partnercode,
  fromdate,
  todate,
  token
}: {
  partnercode: number
  fromdate: string
    todate: string
  token: string
}) {
  return fetchApi<PartnerLedgerType[]>({
    url: `api/ledgerreport/partner-ledger/?fromdate=${fromdate}&todate=${todate}&partnercode=${partnercode}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}