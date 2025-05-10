import { fetchApi } from '@/utils/http'
import { DepartmentSummaryType, GetDepartment } from '@/utils/type'

export async function getDepartmentSummary({
  fromdate,
  enddate,
  departmentId,
  companyid,
  token
}: {
  fromdate: string
  enddate: string
  departmentId: string
    companyid: string
   token: string
}) {
  return fetchApi<DepartmentSummaryType[]>({
    url: `api/ledgerreport/departmentsummery?fromDate=${fromdate}&endDate=${enddate}&departmentIds=${departmentId}&companyId=${companyid}`,
    // url: 'api/ledgerreport/departmentsummery?fromDate=2024-01-01&endDate=2025-12-31&departmentIds=1,2,3&companyId=75',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

// static api for testing purpose : http://localhost:4000/api/ledgerreport/departmentsummery?fromDate=2024-01-01&endDate=2025-12-31&departmentIds=1,2,3&companyId=75

//get all department fetch api
export async function getAllDepartments(token: string) {
  return fetchApi<GetDepartment[]>({
    url: 'api/department/get-all-departments',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    }
  })
}
