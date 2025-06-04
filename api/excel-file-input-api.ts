import { fetchApi } from "@/utils/http"

// Assuming the Excel data structure matches this type
export interface BankTransactionData {
  [key: string]: any
}

export async function createBankTransactions(data: BankTransactionData[] | any[], apiEndpoint: string, token: string) {
  console.log("Creating bank transactions:", data)
  console.log("Using API endpoint:", apiEndpoint)

  return fetchApi<BankTransactionData[]>({
    url: apiEndpoint,
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    },
  })
}

export async function getAllCurrency() {
  return fetchApi<BankTransactionData[]>({
    url: 'api/bank-transactions/get-bank-transactions',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${localStorage.getItem('token')}`,
    },
  })
}