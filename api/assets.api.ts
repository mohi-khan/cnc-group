import { fetchApi } from '@/utils/http'
import { AssetType, CreateAssetData } from '@/utils/type'

//get all assets api from database
export async function getAssets() {
  return fetchApi<AssetType[]>({
    url: 'api/asset/get-all-asset',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function createAsset(data: CreateAssetData) {
  return fetchApi<CreateAssetData[]>({
    url: 'api/asset/create-asset',
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
