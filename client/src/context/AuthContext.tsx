import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import { clearToken, getToken, setToken } from '../api/client'
import type { User } from '../api/types'

type AuthContextValue = {
  user: User | null
  loading: boolean
  signup: (payload: authApi.SignupPayload) => Promise<authApi.AuthResponse>
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  verifyEmail: (code: string) => Promise<User>
  /** Resolves to the code only in local dev without email; otherwise it was emailed. */
  resendVerification: () => Promise<string | undefined>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  async function signup(payload: authApi.SignupPayload) {
    const data = await authApi.signup(payload)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  async function login(email: string, password: string) {
    const data = await authApi.login(email, password)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  async function verifyEmail(code: string) {
    const updated = await authApi.verifyEmail(code)
    setUser(updated)
    return updated
  }

  async function resendVerification() {
    return authApi.resendVerification()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, verifyEmail, resendVerification }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
