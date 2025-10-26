'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AddFriendFormProps {
  onSuccess?: () => void
}

const FRIEND_ICONS = ['👤', '😀', '😎', '🤓', '😊', '🥳', '😇', '🤗', '🤩', '😺', '🐶', '🐱', '🦊', '🐻', '🐼', '🦁', '🐯', '🦄', '🌟', '⭐', '💫', '✨', '🎨', '🎭', '🎮', '⚽', '🎸', '🎤']

export default function AddFriendForm({ onSuccess }: AddFriendFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('😀')
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
      const response = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), icon: selectedIcon }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to add friend')
        return
      }

      setName('')
      setSelectedIcon('😀')
      router.refresh()
      onSuccess?.()
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="friend-name" className="block text-sm font-bold text-purple-900 mb-1">
          Friend Name
        </label>
        <input
          id="friend-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border-2 border-purple-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold"
          placeholder="Enter friend's name"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-purple-900 mb-2">
          Choose an Icon
        </label>
        <div className="grid grid-cols-7 gap-2">
          {FRIEND_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setSelectedIcon(icon)}
              className={`text-2xl p-2 rounded-lg transition-all transform hover:scale-110 ${
                selectedIcon === icon
                  ? 'bg-purple-500 ring-4 ring-purple-300 shadow-lg'
                  : 'bg-white/80 hover:bg-white shadow'
              }`}
              disabled={isSubmitting}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-100 border-2 border-red-300 rounded-xl px-4 py-3 font-bold">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !name.trim()}
        className="w-full gradient-purple-pink text-white font-black py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '⏳ Adding...' : '➕ Add Friend'}
      </button>
    </form>
  )
}
