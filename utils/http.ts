import { z } from 'zod'

// Type for API response
type ApiResponse<T> = {
  data: T | null
  error: {
    message: string
    status?: number
    details?: unknown
  } | null
}

// Type for the fetch options
type FetchOptions<T> = {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  headers?: Record<string, string>
  schema?: z.ZodType<T>
}

// Function to handle user logout
const handleLogout = () => {
  //localStorage.clear()
  //window.location.href = '/login'
}

// Main fetch utility function
export async function fetchApi<T>({
  url,
  method = 'GET',
  body,
  headers = {},
  schema,
}: FetchOptions<T>): Promise<ApiResponse<T>> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`,
    {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    }
  ).catch(() => null)

  // Handle network errors
  if (!response) {
    return {
      data: null,
      error: {
        message: 'Network error occurred',
        status: 500,
      },
    }
  }

  // Handle unauthorized access
  if (response.status === 401) {
    handleLogout()
    return {
      data: null,
      error: {
        message: 'Unauthorized access',
        status: 401,
      },
    }
  }

  // Handle non-200 responses
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    return {
      data: null,
      error: {
        message: `HTTP error! status: ${response.status} ${errorData?.message}`,
        status: response.status,
        details: errorData,
      },
    }
  }

  // Parse JSON response
  const jsonData = await response.json().catch(() => null)
  if (!jsonData) {
    return {
      data: null,
      error: {
        message: 'Invalid JSON response',
        status: 400,
      },
    }
  }

  // Validate response with schema if provided
  if (schema) {
    const result = schema.safeParse(jsonData)
    if (!result.success) {
      return {
        data: null,
        error: {
          message: 'Response validation failed',
          status: 400,
          details: result.error.flatten(),
        },
      }
    }
    return { data: result.data, error: null }
  }

  return { data: jsonData as T, error: null }
}
