import { fetchApi } from '@/utils/http'
import { PartnerLedgerType, ResPartner } from '@/utils/type'



export async function getPartnerLedgerByDate({
  partnercode,
  fromdate,
  todate
}: {
  partnercode: number
  fromdate: string
  todate: string
}) {
  return fetchApi<PartnerLedgerType[]>({
    url: `api/ledgerreport/partner-ledger/?fromdate=${fromdate}&todate=${todate}&partnercode=${partnercode}`,
    method: 'GET',
  })
}