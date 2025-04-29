import { fetchApi } from '@/utils/http'
import { CostCenter, CostCenterActivateDeactivate, CreateCostCenterType } from '@/utils/type'



export async function createCostCenter(data: CreateCostCenterType, token: string) {
  console.log('Creating cost center:', data)
  return fetchApi<CreateCostCenterType>({
    url: 'api/cost-centers/create-cost-centers',
    method: 'POST',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    }
  })
}

export async function updateCostCenter(data: CostCenter, token: string) {
  console.log('Editing cost center:', data)
  return fetchApi<CostCenter>({
    url: `api/cost-centers/edit-cost-center/${data.costCenterId}`,
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export function activateCostCenter(costCenterId: number) {
  console.log('Activating cost center:', costCenterId)
  return fetchApi<CostCenterActivateDeactivate>({
    url: `api/cost-centers/activate-cost-center/${costCenterId}`,
    method: 'PATCH',
  })
}

export function deactivateCostCenter(costCenterId: number) {
  console.log('Deactivating cost center:', costCenterId)
  return fetchApi<CostCenterActivateDeactivate>({
    url: `api/cost-centers/deactivate-cost-center/${costCenterId}`,
    method: 'PATCH',
  })
}
