import api from './client'
import type { User } from './types'

export type SignupPayload = {
  name: string
  email: string
  password: string
  class_year?: number | null
}

export type AuthResponse = {
  token: string
  user: User
  /** Only present in local dev when the server has no email provider configured. */
  dev_verification_code?: string
  /** false if the server couldn't send the verification email (user can resend). */
  email_sent?: boolean
}

export async function signup(payload: SignupPayload) {
  const { data } = await api.post<AuthResponse>('/auth/signup', payload)
  return data
}

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
  return data
}

export async function me() {
  const { data } = await api.get<{ user: User }>('/auth/me')
  return data.user
}

export async function verifyEmail(code: string) {
  const { data } = await api.post<{ user: User }>('/auth/verify', { code })
  return data.user
}

export async function resendVerification() {
  const { data } = await api.post<{ dev_verification_code?: string; email_sent?: boolean }>(
    '/auth/resend-verification'
  )
  return data.dev_verification_code
}
