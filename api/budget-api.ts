import { fetchApi } from '@/utils/http'
import {
  AccountsHead,
  BudgetItems,
  CreateBudgetItemsType,
  CreateBudgetMasterType,
  MasterBudgetType,
} from '@/utils/type'

//get all data coa
export async function getAllCoa() {
  return fetchApi<AccountsHead[]>({
    url: 'api/chart-of-accounts/get-all-coa',
    method: 'GET',
  })
}

export async function createBudgetMaster(
  budgetMasterData: CreateBudgetMasterType
) {
  return fetchApi<{ id: number }>({
    url: 'api/budget/createBudget',
    method: 'POST',
    body: budgetMasterData,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg0LCJ1c2VybmFtZSI6InJpYWRuIiwiaWF0IjoxNzM5ODU5NDI0LCJleHAiOjE3Mzk5NDU4MjR9.JRp9I6buFmjyDMJPD4hh4ag4hIKuikktECPz9TJLxPU`,
    },
  })
}

export async function createBudgetDetails(
  budgetDetailsData: CreateBudgetItemsType[]
) {
  return fetchApi<{ success: boolean }>({
    url: 'api/budget/createBudgetItems',
    method: 'POST',
    body: budgetDetailsData,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg0LCJ1c2VybmFtZSI6InJpYWRuIiwiaWF0IjoxNzM5OTQ2MTY2LCJleHAiOjE3NDAwMzI1NjZ9.DWiZa8yXBW-6-C2PdQpa22V6NHleoT_80kpFCrLmk-w`,
    },
  })
}

// Get All Master Budget API
export async function getAllMasterBudget() {
  return fetchApi<MasterBudgetType[]>({
    url: 'api/budget/getBudgerMaster',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg0LCJ1c2VybmFtZSI6InJpYWRuIiwiaWF0IjoxNzM5OTQ2MTY2LCJleHAiOjE3NDAwMzI1NjZ9.DWiZa8yXBW-6-C2PdQpa22V6NHleoT_80kpFCrLmk-w`,
    },
  })
}

// Get All Budget Items API

export async function getAllBudgetDetails(id: number) {
  console.log('dkdkd', id)
  return fetchApi<BudgetItems[]>({
    url: `api/budget/getBudget/${id}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg0LCJ1c2VybmFtZSI6InJpYWRuIiwiaWF0IjoxNzM5OTQ2MTY2LCJleHAiOjE3NDAwMzI1NjZ9.DWiZa8yXBW-6-C2PdQpa22V6NHleoT_80kpFCrLmk-w`,
    },
  })
}
