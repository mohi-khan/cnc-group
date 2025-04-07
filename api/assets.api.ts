import { fetchApi } from '@/utils/http'
import { AssetType, CostCenter, CreateAssetData, Department, GetDepartment } from '@/utils/type'

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

export async function getAllDepartments() {
  return fetchApi<GetDepartment[]>({
    url: 'api/department/get-all-departments',
    method: 'GET',
  })
}

export async function getAllCostCenters() {
  return fetchApi<CostCenter[]>({
    url: 'api/cost-centers/get-all-cost-centers',
    method: 'GET',
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
