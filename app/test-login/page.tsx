'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestLoginPage() {
  const [email, setEmail] = useState('owenozmubb07@gmail.com')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResult({ status: 'Testing Supabase connection...' })
    
    try {
      // Test 1: Check Supabase config
      const config = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
      setResult({ status: 'Supabase config', config })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Test 2: Try to get session
      const { data: sessionData } = await supabase.auth.getSession()
      setResult((prev: any) => ({ ...prev, currentSession: sessionData }))
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Test 3: List users (if service role key available)
      try {
        const { data: users, error } = await supabase.auth.admin.listUsers()
        setResult((prev: any) => ({ ...prev, usersCount: users?.users?.length || 0, usersError: error?.message }))
      } catch (e: any) {
        setResult((prev: any) => ({ ...prev, usersError: 'Cannot list users (need service role key)' }))
      }
      
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    if (!password) {
      setResult({ error: 'Please enter a password' })
      return
    }
    
    setLoading(true)
    setResult({ status: 'Attempting login...' })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })
      
      setResult({
        success: !error,
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          confirmed: !!data.user.confirmed_at,
        } : null,
        session: data.session ? 'Session created' : 'No session',
        error: error?.message,
      })
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testSignup = async () => {
    if (!password) {
      setResult({ error: 'Please enter a password' })
      return
    }
    
    setLoading(true)
    setResult({ status: 'Attempting signup...' })
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: 'Test User',
          }
        }
      })
      
      setResult({
        success: !error,
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          confirmed: !!data.user.confirmed_at,
        } : null,
        session: data.session ? 'Session created' : 'No session',
        error: error?.message,
        message: 'If email confirmation is enabled, check your email'
      })
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Login Debug Tool</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Test Credentials</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold disabled:opacity-50"
            >
              Test Connection
            </button>
            
            <button
              onClick={testSignup}
              disabled={loading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded font-semibold disabled:opacity-50"
            >
              Test Signup
            </button>
            
            <button
              onClick={testLogin}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded font-semibold disabled:opacity-50"
            >
              Test Login
            </button>
          </div>
        </div>
        
        {result && (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Results</h2>
            <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6 bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-6">
          <h3 className="text-yellow-500 font-bold mb-2">⚠️ Important Notes:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>This page helps debug authentication issues</li>
            <li>Test Connection checks if Supabase is configured</li>
            <li>Test Signup creates a new account</li>
            <li>Test Login tries to login with provided credentials</li>
            <li>Check browser console for additional logs</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
