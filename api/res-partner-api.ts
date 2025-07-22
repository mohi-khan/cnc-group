import { fetchApi } from '@/utils/http'
import { ResPartner } from '@/utils/type'

export async function createResPartner(data: ResPartner, token: string) {
  
  return fetchApi<ResPartner>({
    url: 'api/res-partner/create-res-partner',
    method: 'POST',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function editResPartner(id: number, data: ResPartner, token: string) {
  
  return fetchApi<ResPartner>({
    url: `api/res-partner/edit-res-partner/${id}`,
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
