import { fetchApi } from '@/utils/http'
import { EmployeeLedgerType } from '@/utils/type'

export async function getEmployeeLedgerByDate({
  employeeId,
  fromdate,
  todate,
  companyId,
  token,
}: {
  employeeId: number
  fromdate: string
  todate: string
  companyId: number
  token: string
}) {
  return fetchApi<EmployeeLedgerType[]>({
    url: `api/ledgerreport/employee-ledger/?fromdate=${fromdate}&todate=${todate}&employeeId=${employeeId}&companyId=${companyId}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
