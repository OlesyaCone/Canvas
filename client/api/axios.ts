const API_URL = 'http://localhost:5000/api'

interface RequestOptions {
  method?: string
  body?: unknown
  token?: string
}

export const api = async (endpoint: string, options: RequestOptions = {}) => {
  const { method = 'GET', body, token } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Ошибка запроса')
  }

  return data
}