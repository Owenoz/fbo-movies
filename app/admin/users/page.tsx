'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Mail, Calendar, Search, Download, RefreshCw, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string
  name?: string
  confirmed_at?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Fetch all users from auth.users
      const { data, error } = await supabase.auth.admin.listUsers()

      if (error) throw error

      const usersData: User[] = data.users.map((user: any) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        name: user.user_metadata?.name,
        confirmed_at: user.confirmed_at
      }))

      setUsers(usersData)

      // Calculate stats
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

      const todayCount = usersData.filter(u => new Date(u.created_at) >= today).length
      const weekCount = usersData.filter(u => new Date(u.created_at) >= weekAgo).length

      setStats({
        total: usersData.length,
        today: todayCount,
        thisWeek: weekCount
      })
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const exportToCSV = () => {
    const csv = [
      ['Email', 'Name', 'Joined Date', 'Last Sign In', 'Confirmed'],
      ...filteredUsers.map(u => [
        u.email,
        u.name || 'N/A',
        new Date(u.created_at).toLocaleDateString(),
        u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'Never',
        u.confirmed_at ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
              <p className="text-white/60">Manage registered users</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-white/60 text-sm">New Today</p>
                <p className="text-2xl font-bold text-white">{stats.today}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-white/60 text-sm">This Week</p>
                <p className="text-2xl font-bold text-white">{stats.thisWeek}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-800 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
              <p className="text-white/60">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <p className="text-white/60">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                      Last Sign In
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-white">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/80">
                        {user.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-white/60">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-white/60">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.confirmed_at
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-yellow-500/20 text-yellow-500'
                          }`}
                        >
                          {user.confirmed_at ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-white/40 text-sm">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </div>
  )
}
