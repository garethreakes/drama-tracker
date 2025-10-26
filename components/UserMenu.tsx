'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface UserMenuProps {
  user: {
    id: string
    name: string
    icon: string
    isAdmin: boolean
  }
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full shadow">
        <span className="text-2xl">{user.icon}</span>
        <span className="font-bold text-purple-900">{user.name}</span>
        {user.isAdmin && (
          <span className="px-2 py-0.5 text-xs font-black bg-yellow-400 text-purple-900 rounded-full">
            ADMIN
          </span>
        )}
      </div>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="px-4 py-2 text-sm font-bold text-red-700 hover:text-red-900 bg-white hover:bg-red-50 rounded-full transition-all transform hover:scale-105 shadow disabled:opacity-50"
      >
        {isLoggingOut ? '...' : '🚪 Logout'}
      </button>
    </div>
  )
}
