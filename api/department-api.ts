import { fetchApi } from '@/utils/http'
import { Department, GetDepartment } from '@/utils/type'
import { CompanyType } from './company-api'

export async function getAllDepartments() {
  return fetchApi<GetDepartment[]>({
    url: 'api/department/get-all-departments',
    method: 'GET',
  })
}

export async function createDepartment(data: Department) {
  console.log('Creating department:', data)
  return fetchApi<Department>({
    url: 'api/department/create-department',
    method: 'POST',
    body: data,
  })
}

//get all companies api
export async function getAllCompany() {
  return fetchApi<CompanyType[]>({
    url: 'api/company/get-all-companies',
    method: 'GET',
  })
}
