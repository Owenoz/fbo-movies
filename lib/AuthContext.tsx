'use client'

import { createContext, useContext, ReactNode } from 'react'

// Auth is not required — content loads from TMDB without login
interface AuthCtx {
  token: string | null
  loading: boolean
}

const AuthContext = createContext<AuthCtx>({ token: 'public', loading: false })

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ token: 'public', loading: false }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
