import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface SignInRequest {
  username: string
  password: string
}

interface SignInResponse {
  status: string
  data: {
    token: string
    user: {
      id: number
      username: string
      [key: string]: any
    }
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const signin = async (
  credentials: SignInRequest
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const response = await api.post<SignInResponse>('api/auth/login', credentials)

    if (response.data.status === 'success' && response.data.data) {
      return {
        success: true,
        data: response.data.data,
      }
    }

    return {
      success: false,
      message: 'Invalid response format from server',
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Wrong Login/Password. Please Contact with Administrator.',
      }
    }
    return {
      success: false,
      message: 'An unexpected error occurred',
    }
  }
}


















// import { fetchApi } from '@/utils/http'
// import { z } from 'zod'

// export const SignInRequestSchema = z.object({
//   username: z.string().min(1),
//   password: z.string().min(1),
// })

// export const SignInResponseSchema = z.object({
//   token: z.string(),
//   user: z.object({
//     id: z.string(),
//     email: z.string(),
//     name: z.string().optional(),
//   }),
// })

// export type SignInRequest = z.infer<typeof SignInRequestSchema>
// export type SignInResponse = z.infer<typeof SignInResponseSchema>

// export async function signIn(credentials: SignInRequest) {
//   return fetchApi<SignInResponse>({
//     url: '/api/auth/login',
//     method: 'POST',
//     body: credentials,
//     schema: SignInResponseSchema,
//   })
// }

