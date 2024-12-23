import { fetchApi } from '@/utils/http'
import { CostCenter, CostCenterActivateDeactivate } from '@/utils/type'

export async function getAllCostCenters() {
  return fetchApi<CostCenter[]>({
    url: 'api/cost-centers/get-all-cost-centers',
    method: 'GET',
  })
}

export async function createCostCenter(data: Omit<CostCenter, 'costCenterId'>) {
  console.log('Creating cost center:', data)
  return fetchApi<CostCenter>({
    url: 'api/cost-centers/create-cost-centers',
    method: 'POST',
    body: data,
  })
}

export async function updateCostCenter(data: Omit<CostCenter, 'updatedBy'>) {
  console.log('Editing cost center:', data)
  return fetchApi<CostCenter>({
    url: `api/cost-centers/edit-cost-center/${data.costCenterId}`,
    method: 'PATCH',
    body: data,
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
