import { fetchApi } from "@/utils/http";
import { AccountsHead, CreateBudgetItemsType, CreateBudgetMasterType } from "@/utils/type";

//get all data coa
export async function getAllCoa() {
  return fetchApi<AccountsHead[]>({
    url: 'api/chart-of-accounts/get-all-coa',
    method: 'GET',
  })
}

export async function createBudgetMaster(budgetMasterData: CreateBudgetMasterType) {
    return fetchApi<{ id: number }>({
      url: "api/budget/createBudget",
      method: "POST",
      body: budgetMasterData,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg0LCJ1c2VybmFtZSI6InJpYWRuIiwiaWF0IjoxNzM5Mzc0MzQ3LCJleHAiOjE3Mzk0NjA3NDd9.LPOqRjCgtiqA-PZEZ8hqG7ErCcUbHGqRirK2fGV_2tk`
      }
    })
  }
  
  export async function createBudgetDetails(budgetDetailsData: CreateBudgetItemsType[]) {
    return fetchApi<{ success: boolean }>({
      url: "api/budget/createBudgetItems",
      method: "POST",
      body: budgetDetailsData,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg0LCJ1c2VybmFtZSI6InJpYWRuIiwiaWF0IjoxNzM5Mzc0MzQ3LCJleHAiOjE3Mzk0NjA3NDd9.LPOqRjCgtiqA-PZEZ8hqG7ErCcUbHGqRirK2fGV_2tk`
      }
    })
  }