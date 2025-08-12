import { fetchApi } from '@/utils/http'
import { AccountsHead, GeneralLedgerType } from '@/utils/type'

export async function getAllCoa() {
  return fetchApi<AccountsHead[]>({
    url: 'api/chart-of-accounts/get-all-coa',
    method: 'GET',
  })
}

// export async function
//   getGeneralLedgerByDate({
//   accountcode,
//   fromdate,
//   todate,
//   token,
// }: {
//   accountcode: number
//   fromdate: string
//   todate: string
//   token: string
// }) {
//   return fetchApi<GeneralLedgerType[]>({
//     url: `api/ledgerreport/general-ledger/?fromdate=${fromdate}&todate=${todate}&accountcode=${accountcode}`,
//     method: 'GET',
//     headers: {
//       Authorization: `${token}`,
//       'Content-Type': 'application/json',
//     },
//   })
// }

export async function getGeneralLedgerByDate({
  accountcode,
  fromdate,
  todate,
  companyId,
  locationId,
  token,
}: {
  accountcode: number;
  fromdate: string;
  todate: string;
  companyId: number;
  locationId: number;
  token: string;
}) {
  return fetchApi<GeneralLedgerType[]>({
    url: `api/ledgerreport/general-ledger?fromdate=${fromdate}&todate=${todate}&accountcode=${accountcode}&companyId=${companyId}&locationId=${locationId}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  });
}

