import { fetchApi } from '@/utils/http'
import { AccountsHead, AssetCategoryType, CreateAssetCategoryData } from '@/utils/type'

export async function getAllAssetCategories() {
  return fetchApi<AssetCategoryType[]>({
    url: 'api/asset-category/get-all-asset-category',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function createAssetCategory(data: CreateAssetCategoryData) {
  return fetchApi<CreateAssetCategoryData[]>({
    url: 'api/asset-category/create-asset-category',
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}



