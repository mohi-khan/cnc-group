import { fetchApi } from '@/utils/http'
import { PartnerLedgerType, ResPartner } from '@/utils/type'

export async function getAllPartners() {
  return fetchApi<ResPartner[]>({
    url: 'api/res-partner/get-all-res-partners',
    method: 'GET',
  })
}

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