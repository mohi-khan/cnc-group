import { fetchApi } from '@/utils/http'
import {
  AssetCategoryType,
  CreateAssetCategoryData,
} from '@/utils/type'

export async function getAllAssetCategories(token: string) {
  return fetchApi<AssetCategoryType[]>({
    url: 'api/asset-category/get-all-asset-category',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function createAssetCategory(
  data: CreateAssetCategoryData,
  token: string
) {
  return fetchApi<CreateAssetCategoryData[]>({
    url: 'api/asset-category/create-asset-category',
    method: 'POST',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
