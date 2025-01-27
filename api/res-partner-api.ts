import { fetchApi } from '@/utils/http'
import { Company, ResPartner } from '@/utils/type'

export async function createResPartner(data: ResPartner) {
  console.log('Creating res:', data)
  return fetchApi<ResPartner>({
    url: 'api/res-partner/create-res-partner',
    method: 'POST',
    body: data,
  })
}

export async function editResPartner(id: number, data: ResPartner) {
  console.log('Editing res:', id, data)
  return fetchApi<ResPartner>({
    url: `api/res-partner/edit-res-partner/${id}`,
    method: 'PATCH',
    body: data,
  })
}

export async function getAllResPartners() {
  return fetchApi<ResPartner[]>({
    url: 'api/res-partner/get-all-res-partners',
    method: 'GET',
  })
}

export async function getAllCompanies() {
  return fetchApi<Company[]>({
    url: 'api/company/get-all-companies',
    method: 'GET',
  })
}
