import { fetchApi } from '@/utils/http'
import { PartnerLedgerType } from '@/utils/type'



export async function getPartnerLedgerByDate({
  partnercode,
  fromdate,
  todate,
  companyId,
  token
}: {
  partnercode: number
  fromdate: string
    todate: string
    companyId:number
  token: string
}) {
  return fetchApi<PartnerLedgerType[]>({
    url: `api/ledgerreport/partner-ledger/?fromdate=${fromdate}&todate=${todate}&partnercode=${partnercode}&companyId=${companyId}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}