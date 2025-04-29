import { fetchApi } from '@/utils/http'
import { User } from '@/utils/type'

export async function GetUsersByRoles(token: string) {
  return fetchApi<User[]>({
    url: 'api/auth/users-by-roles',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    }
  })
}
