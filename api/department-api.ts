import { fetchApi } from '@/utils/http'
import { Department } from '@/utils/type'

export async function createDepartment(data: Department, token: string) {
  console.log('Creating department:', data)
  return fetchApi<Department>({
    url: 'api/department/create-department',
    method: 'POST',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}


