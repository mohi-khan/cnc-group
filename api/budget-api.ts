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

// export async function createBudgetMaster(data: { token: string },
//   budgetMasterData: CreateBudgetMasterType
// ) {
//   return fetchApi<{ id: number }>({
//     url: 'api/budget/createBudget',
//     method: 'POST',
//     body: budgetMasterData,
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `${data.token}`,
//     },
//   })
// }
export async function createBudgetMaster(
  data: { token: string },
  budgetMasterData: CreateBudgetMasterType
) {
  return fetchApi<{ id: number }>({
    url: "api/budget/createBudget",
    method: "POST",
    body: budgetMasterData,
    headers: {
      "Content-Type": "application/json",
      Authorization: `${data.token}`, // 🔥 Fixed: Added "Bearer "
    },
  })
}

// export async function createBudgetDetails(data: { token: string },
//   budgetDetailsData: CreateBudgetItemsType[]
// ) {
//   return fetchApi<{ success: boolean }>({
//     url: 'api/budget/createBudgetItems',
//     method: 'POST',
//     body: budgetDetailsData,
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `${data.token}`,
//     },
//   })
// }
export async function createBudgetDetails(
  data: { token: string },
  budgetDetailsData: CreateBudgetItemsType[]
) {
  return fetchApi<{ success: boolean }>({
    url: "api/budget/createBudgetItems",
    method: "POST",
    body: budgetDetailsData,
    headers: {
      "Content-Type": "application/json",
      Authorization: `${data.token}`, // 🔥 Fixed: Added "Bearer "
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
  console.log('Fetching budget details for ID and tokekn from budget api:', id, token)
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
export async function updateBudgetMaster(
  budgetId: number,
  token: string
) {
  return fetchApi<MasterBudgetType[]>({
    url: `api/budget/updateBudget/${budgetId}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}
