'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CreateAccountPage() {
  const [email, setEmail] = useState('owenozmubb07@gmail.com')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('Owen')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const createAccount = async () => {
    if (!password || password.length < 6) {
      setResult({ error: 'Password must be at least 6 characters' })
      return
    }

    setLoading(true)
    setResult({ status: 'Creating account...' })

    try {
      // Create account
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: window.location.origin,
        }
      })

      if (error) throw error

      setResult({
        success: true,
        message: 'Account created successfully!',
        user: {
          email: data.user?.email,
          id: data.user?.id,
        },
        nextStep: 'Now go to /login and sign in with these credentials'
      })

      // Auto redirect after 3 seconds
      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)

    } catch (error: any) {
      setResult({
        error: error.message,
        hint: error.message.includes('already registered') 
          ? 'This email is already registered. Go to /login instead.'
          : 'Check the error and try again'
      })
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    if (!password) {
      setResult({ error: 'Enter password first' })
      return
    }

    setLoading(true)
    setResult({ status: 'Testing login...' })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      })

      if (error) throw error

      setResult({
        success: true,
        message: 'Login works! Redirecting...',
        user: data.user?.email,
      })

      setTimeout(() => {
        window.location.href = '/'
      }, 2000)

    } catch (error: any) {
      setResult({
        error: error.message,
        hint: 'If account doesn\'t exist, click "Create Account" first'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">🔐 Create Admin Account</h1>
        <p className="text-gray-400 mb-8">
          This page bypasses all auth checks. Use it to create your first account.
        </p>

        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Email (Admin)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Password (min 6 characters)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong password"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={createAccount}
              disabled={loading}
              className="flex-1 px-6 py-4 bg-green-600 hover:bg-green-700 rounded font-bold text-lg disabled:opacity-50"
            >
              {loading ? 'Creating...' : '✅ Create Account'}
            </button>

            <button
              onClick={testLogin}
              disabled={loading}
              className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded font-bold text-lg disabled:opacity-50"
            >
              {loading ? 'Testing...' : '🔐 Test Login'}
            </button>
          </div>
        </div>

        {result && (
          <div className={`rounded-lg p-6 ${result.success ? 'bg-green-900/20 border-2 border-green-600' : result.error ? 'bg-red-900/20 border-2 border-red-600' : 'bg-blue-900/20 border-2 border-blue-600'}`}>
            <h3 className="font-bold text-xl mb-2">
              {result.success ? '✅ Success!' : result.error ? '❌ Error' : '⏳ Processing...'}
            </h3>
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-900/20 border border-yellow-600 rounded-lg p-6">
          <h3 className="font-bold text-yellow-500 mb-2">📝 Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Enter your password (min 6 characters)</li>
            <li>Click "Create Account"</li>
            <li>Wait for success message</li>
            <li>Will auto-redirect to /login</li>
            <li>Login with the same credentials</li>
            <li>Done! ✅</li>
          </ol>
        </div>

        <div className="mt-6 text-center">
          <a href="/login" className="text-blue-500 hover:underline">
            Already have an account? Go to Login →
          </a>
        </div>
      </div>
    </div>
  )
}
