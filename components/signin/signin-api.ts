import axios from 'axios'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

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
    const response = await api.post<SignInResponse>('/auth/login', credentials)

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
