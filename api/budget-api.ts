import { fetchApi } from '@/utils/http'
import {
  BudgetItems,
  CreateBudgetItemsType,
  CreateBudgetMasterType,
  MasterBudgetType,
} from '@/utils/type'



//Create Budget Master API
export async function createBudgetMaster(
  data: { token: string },
  budgetMasterData: CreateBudgetMasterType
) {
  return fetchApi<{ id: number }>({
    url: 'api/budget/createBudget',
    method: 'POST',
    body: budgetMasterData,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${data.token}`, // 🔥 Fixed: Added "Bearer "
    },
  })
}

//Create Budget Details API
export async function createBudgetDetails(
  data: { token: string },
  budgetDetailsData: CreateBudgetItemsType[]
) {
  return fetchApi<{ success: boolean }>({
    url: 'api/budget/createBudgetItems',
    method: 'POST',
    body: budgetDetailsData,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${data.token}`,
    },
  })
}

// Get All Master Budget API
export async function getAllMasterBudget(data: { token: string }) {
  return fetchApi<MasterBudgetType[]>({
    url: 'api/budget/getBudgerMaster',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${data.token}`,
    },
  })
}

export async function getAllBudgetDetails(id: number, token: string) {
  return fetchApi<BudgetItems[]>({
    url: `api/budget/getBudget/${id}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}

//update budget master api
export async function updateBudgetMaster(budgetId: number, token: string) {
  return fetchApi<MasterBudgetType[]>({
    url: `api/budget/updateBudget/${budgetId}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}
export async function updateBudgetDetails(id: number, token: string) {
  return fetchApi<MasterBudgetType[]>({
    url: `api/budget/updateBudgetItems/${id}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}
