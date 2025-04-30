import { fetchApi } from '@/utils/http'
import {CreateAssetData } from '@/utils/type'


export async function createAsset(data: CreateAssetData, token: string) {
  return fetchApi<CreateAssetData[]>({
    url: 'api/asset/create-asset',
    method: 'POST',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
