import { fetchApi } from '@/utils/http'
import { CostCenter, CreateAssetData, GetAssetData, GetDepartment } from '@/utils/type'


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
