import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'nyuad_eats_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  }

  async function signup(payload) {
    const { data } = await api.post('/auth/signup', payload);
    saveSession(data.token, data.user);
    return data;
  }

  async function login(payload) {
    const { data } = await api.post('/auth/login', payload);
    saveSession(data.token, data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  async function verifyEmail(code) {
    const { data } = await api.post('/auth/verify', { code });
    setUser(data.user);
    return data.user;
  }

  async function resendVerification() {
    const { data } = await api.post('/auth/resend-verification');
    return data.dev_verification_code;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, verifyEmail, resendVerification }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
