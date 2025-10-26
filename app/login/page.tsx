'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to login')
        return
      }

      // Redirect to home page
      router.push('/')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-4 border-purple-300 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-purple-900 mb-2">🎭 Drama Tracker 🎭</h1>
            <p className="text-purple-700 font-semibold">Please login to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-purple-900 mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold"
                placeholder="Enter your name"
                disabled={isSubmitting}
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-purple-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold"
                placeholder="Enter your password"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-100 border-2 border-red-300 rounded-xl px-4 py-3 font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full gradient-purple-pink text-white font-black py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? '⏳ Logging in...' : '🔐 Login'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-purple-700 font-semibold">
            <p>Contact Lowri if you need help with your password!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
