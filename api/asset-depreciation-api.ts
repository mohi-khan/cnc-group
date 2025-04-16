import { fetchApi } from '@/utils/http'
import { CreateAssetDepreciationData } from '@/utils/type'
import { CompanyType } from './company-api'

const mainToken = localStorage.getItem('authToken')
console.log('🚀 ~ PaymentRequisition ~ mainToken:', mainToken)
const token = `Bearer ${mainToken}`

export async function createAssetDepreciation(
  data: CreateAssetDepreciationData
) {
  return fetchApi<CreateAssetDepreciationData[]>({
    url: 'api/depreciation-schedules/create-depreciation-schedule',
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  })
}

export async function previewAssetDepreciation(
  data: CreateAssetDepreciationData
) {
  return fetchApi<CreateAssetDepreciationData[]>({
    url: 'api/depreciation-schedules/preview-depreciation-schedule',
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllCompanies() {
  return fetchApi<CompanyType[]>({
    url: 'api/company/get-all-companies',
    method: 'GET',
  })
}
