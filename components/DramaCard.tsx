'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import DramaVoting from './DramaVoting'

interface Person {
  id: string
  name: string
}

interface Drama {
  id: string
  title: string
  details: string
  severity: number
  createdAt: Date | string
  isFinished: boolean
  finishedAt?: Date | string | null
  participants: Person[]
}

interface DramaCardProps {
  drama: Drama
}

export default function DramaCard({ drama }: DramaCardProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const createdAtDate = typeof drama.createdAt === 'string' ? new Date(drama.createdAt) : drama.createdAt
  const formattedDate = format(createdAtDate, 'MMM d, yyyy h:mm a')

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this drama?')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/dramas/${drama.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete drama')
      }

      router.refresh()
    } catch (error) {
      alert('Failed to delete drama. Please try again.')
      setIsDeleting(false)
    }
  }

  const handleToggleFinish = async (e: React.MouseEvent) => {
    e.stopPropagation()

    setIsToggling(true)

    try {
      const response = await fetch(`/api/dramas/${drama.id}/finish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFinished: !drama.isFinished }),
      })

      if (!response.ok) {
        throw new Error('Failed to update drama')
      }

      router.refresh()
    } catch (error) {
      alert('Failed to update drama. Please try again.')
      setIsToggling(false)
    }
  }

  const getSeverityInfo = (severity: number) => {
    const severityLevels = [
      { level: 1, emoji: '😌', label: 'Minor', bgColor: 'bg-green-500', textColor: 'text-white' },
      { level: 2, emoji: '😐', label: 'Low', bgColor: 'bg-blue-500', textColor: 'text-white' },
      { level: 3, emoji: '😬', label: 'Medium', bgColor: 'bg-yellow-500', textColor: 'text-gray-900' },
      { level: 4, emoji: '😰', label: 'High', bgColor: 'bg-orange-500', textColor: 'text-white' },
      { level: 5, emoji: '🔥', label: 'Severe', bgColor: 'bg-red-600', textColor: 'text-white' },
    ]
    return severityLevels[severity - 1] || severityLevels[2]
  }

  const severityInfo = getSeverityInfo(drama.severity)

  const cardColors = [
    'from-pink-400 to-purple-500',
    'from-blue-400 to-cyan-500',
    'from-green-400 to-teal-500',
    'from-rose-300 to-pink-400',
    'from-purple-400 to-pink-500',
    'from-indigo-400 to-purple-500',
  ]

  const colorIndex = drama.id.charCodeAt(0) % cardColors.length
  const cardColorClass = drama.isFinished
    ? 'from-gray-300 to-gray-400'
    : cardColors[colorIndex]
  const opacity = drama.isFinished ? 'opacity-75' : ''

  return (
    <div className={`drama-card bg-gradient-to-br ${cardColorClass} ${opacity} rounded-2xl shadow-lg hover:shadow-2xl relative overflow-hidden border-4 ${drama.isFinished ? 'border-gray-300' : 'border-white'}`}>
      {/* Decorative circles */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full"></div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/10 rounded-full"></div>

      {/* Action buttons in top right corner */}
      <div className="absolute top-3 right-3 flex gap-1 z-10">
        <button
          onClick={handleToggleFinish}
          disabled={isToggling}
          className={`w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-all shadow-md hover:shadow-lg transform hover:scale-110 disabled:bg-gray-200 disabled:cursor-not-allowed ${
            drama.isFinished ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'
          }`}
          title={drama.isFinished ? 'Mark as current' : 'Mark as finished'}
        >
          {drama.isFinished ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        <Link
          href={`/drama/edit/${drama.id}`}
          onClick={(e) => e.stopPropagation()}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-purple-600 hover:text-purple-800 transition-all shadow-md hover:shadow-lg transform hover:scale-110"
          title="Edit drama"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
          </svg>
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-red-600 hover:text-red-800 transition-all shadow-md hover:shadow-lg transform hover:scale-110 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          title="Delete drama"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      <div className="p-5 pr-32 relative z-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left focus:outline-none"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-black text-white drop-shadow-lg">{drama.title}</h3>
              <span className={`px-3 py-1 text-xs font-black ${severityInfo.bgColor} ${severityInfo.textColor} rounded-full shadow-lg ring-2 ring-white/50`}>
                {severityInfo.emoji} {severityInfo.label.toUpperCase()}
              </span>
              {drama.isFinished && (
                <span className="px-2 py-1 text-xs font-black bg-white/90 text-gray-700 rounded-full shadow">
                  ✓ FINISHED
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {drama.participants.map((person) => (
                <span
                  key={person.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-gray-800 shadow-md"
                >
                  {person.name}
                </span>
              ))}
            </div>

            {isExpanded && drama.details && (
              <div className="mt-3 pt-3 border-t-2 border-white/40">
                <p className="text-sm text-white font-medium whitespace-pre-wrap drop-shadow">{drama.details}</p>
              </div>
            )}

            {isExpanded && (
              <div className="mt-2 text-xs text-white/90 font-semibold space-y-1">
                <div>📅 Created: {formattedDate}</div>
                {drama.isFinished && drama.finishedAt ? (
                  <div>✓ Finished: {format(typeof drama.finishedAt === 'string' ? new Date(drama.finishedAt) : drama.finishedAt, 'MMM d, yyyy h:mm a')}</div>
                ) : (
                  <div>⏳ Not finished yet</div>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 text-sm text-white/90 flex items-center font-bold">
            <span className="mr-1">
              {isExpanded ? '👇' : '👉'}
            </span>
            <span>{isExpanded ? 'Click to hide' : 'Click for more'}</span>
          </div>
        </button>

        {/* Voting Section - shown when expanded */}
        {isExpanded && (
          <DramaVoting dramaId={drama.id} currentSeverity={drama.severity} />
        )}
      </div>
    </div>
  )
}
