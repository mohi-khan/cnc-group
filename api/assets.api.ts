import { fetchApi } from '@/utils/http'
import { CreateAssetData } from '@/utils/type'

//get all assets api from database
export async function getAssets() {
  return fetchApi<CreateAssetData[]>({
    url: 'api/asset/get-all-asset',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
