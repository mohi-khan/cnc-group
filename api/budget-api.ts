import { fetchApi } from '@/utils/http'
import { AccountsHead, CreateBudgetItemsType } from '@/utils/type'

//get all data coa
export async function getAllCoa() {
  return fetchApi<AccountsHead[]>({
    url: 'api/chart-of-accounts/get-all-coa',
    method: 'GET',
  })
}

// export async function createBudgetItems(payload: any) {
//   const token = localStorage.getItem('authToken') // Ensure key matches storage
//   // console.log('sfslfslfsljfsjlf', token)

//   return fetchApi<CreateBudgetItemsType[]>({
//     url: 'api/budget/createBudgetItems',
//     method: 'POST',
//     body: JSON.stringify(payload),
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   })
// }

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const response = await fetch(
      'http://localhost:4000/api/budget/createBudgetItems',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg0LCJ1c2VybmFtZSI6InJpYWRuIiwiaWF0IjoxNzM5MjYxOTgxLCJleHAiOjE3MzkzNDgzODF9.Jix-dSEUgpknO7ghX8eLQ4iJSFWijFFBXLTy0VjkrDc',
        },
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Something went wrong' },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
