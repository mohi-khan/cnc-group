import { fetchApi } from '@/utils/http'
import { Department } from '@/utils/type'

export async function getAllDepartments() {
  return fetchApi<Department[]>({
    url: 'api/department/get-all-departments',
    method: 'GET',
  })
}

export async function createDepartment(data: Omit<Department, 'departmentId'>) {
  console.log('Creating department:', data)
  return fetchApi<Department>({
    url: 'api/department/create-department',
    method: 'POST',
    body: data,
  })
}

