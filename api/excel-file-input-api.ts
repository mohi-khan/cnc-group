import { fetchApi } from "@/utils/http"

// Assuming the Excel data structure matches this type
export interface BankTransactionData {
  [key: string]: any
}

export async function createBankTransactions(data: BankTransactionData[] | any[], apiEndpoint: string) {
  console.log("Creating bank transactions:", data)
  console.log("Using API endpoint:", apiEndpoint)

  return fetchApi<BankTransactionData[]>({
    url: apiEndpoint,
    method: "POST",
    body: data,
  })
}