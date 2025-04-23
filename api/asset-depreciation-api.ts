import { fetchApi } from '@/utils/http'
import { CreateAssetDepreciationData, GetAssetData, JournalEntryWithDetails } from '@/utils/type'
import { CompanyType } from './company-api'

export async function createAssetDepreciation(
  data: CreateAssetDepreciationData,
  token: string
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



export async function createJournalEntryWithDetails(
  data: JournalEntryWithDetails
) {
  console.log('journal', data)
  return fetchApi<JournalEntryWithDetails>({
    url: 'api/journal/entry',
    method: 'POST',
    body: data,
  })
}
