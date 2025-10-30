'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PasswordChangeFormProps {
  personId: string
  personName: string
  canChange: boolean
  onSuccess?: () => void
}

export default function PasswordChangeForm({ personId, personName, canChange, onSuccess }: PasswordChangeFormProps) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  if (!canChange) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!password) {
      setError('Password is required')
      return
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/people/${personId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // If session is invalid, redirect to login
        if (response.status === 401) {
          alert(data.error || 'Your session is invalid. Please log in again.')
          router.push('/login')
          return
        }
        setError(data.error || 'Failed to update password')
        return
      }

      setSuccess(true)
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setShowForm(false)
        setSuccess(false)
        onSuccess?.()
      }, 2000)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="mt-3 px-4 py-2 text-sm font-bold text-purple-700 hover:text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-full transition-all transform hover:scale-105 shadow"
      >
        🔑 Change Password
      </button>
    )
  }

  return (
    <div className="mt-4 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-black text-purple-900">Change Password for {personName}</h4>
        <button
          onClick={() => {
            setShowForm(false)
            setError('')
            setPassword('')
            setConfirmPassword('')
          }}
          className="text-purple-600 hover:text-purple-800 font-bold"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-semibold"
            placeholder="New password (min 4 characters)"
            disabled={isSubmitting}
            autoComplete="new-password"
          />
        </div>

        <div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-semibold"
            placeholder="Confirm password"
            disabled={isSubmitting}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="text-xs text-red-700 bg-red-100 border-2 border-red-300 rounded-lg px-3 py-2 font-bold">
            {error}
          </div>
        )}

        {success && (
          <div className="text-xs text-green-700 bg-green-100 border-2 border-green-300 rounded-lg px-3 py-2 font-bold">
            ✓ Password updated successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !password || !confirmPassword}
          className="w-full gradient-purple-pink text-white font-bold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          {isSubmitting ? '⏳ Updating...' : '💾 Update Password'}
        </button>
      </form>
    </div>
  )
}
