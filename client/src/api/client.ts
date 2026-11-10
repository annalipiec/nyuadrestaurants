import axios, { type AxiosError } from 'axios'

const TOKEN_KEY = 'nyuad_eats_token'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function apiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.') {
  const axiosErr = err as AxiosError<{ error?: string }>
  return axiosErr?.response?.data?.error || fallback
}

export default api
