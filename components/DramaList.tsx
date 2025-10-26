'use client'

import { useState } from 'react'
import DramaCard from './DramaCard'

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

interface DramaListProps {
  dramas: Drama[]
}

type FilterType = 'all' | 'current' | 'finished'

export default function DramaList({ dramas }: DramaListProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredDramas = dramas.filter((drama) => {
    if (filter === 'current') return !drama.isFinished
    if (filter === 'finished') return drama.isFinished
    return true
  })

  const currentCount = dramas.filter((d) => !d.isFinished).length
  const finishedCount = dramas.filter((d) => d.isFinished).length

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-full font-black shadow-md transition-all transform hover:scale-105 ${
            filter === 'all'
              ? 'gradient-purple-pink text-white shadow-lg'
              : 'bg-white/80 text-purple-900 hover:bg-white'
          }`}
        >
          🎭 All ({dramas.length})
        </button>
        <button
          onClick={() => setFilter('current')}
          className={`px-6 py-2 rounded-full font-black shadow-md transition-all transform hover:scale-105 ${
            filter === 'current'
              ? 'gradient-purple-pink text-white shadow-lg'
              : 'bg-white/80 text-purple-900 hover:bg-white'
          }`}
        >
          🔥 Current ({currentCount})
        </button>
        <button
          onClick={() => setFilter('finished')}
          className={`px-6 py-2 rounded-full font-black shadow-md transition-all transform hover:scale-105 ${
            filter === 'finished'
              ? 'gradient-purple-pink text-white shadow-lg'
              : 'bg-white/80 text-purple-900 hover:bg-white'
          }`}
        >
          ✓ Finished ({finishedCount})
        </button>
      </div>

      {/* Drama grid */}
      {filteredDramas.length === 0 ? (
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-4 border-purple-300 p-12 text-center">
          <div className="text-6xl mb-4">
            {filter === 'current' ? '😌' : filter === 'finished' ? '🎉' : '😌'}
          </div>
          <p className="text-purple-900 text-2xl font-bold mb-2">
            {filter === 'current'
              ? 'No current drama!'
              : filter === 'finished'
              ? 'No finished drama yet!'
              : 'No drama yet!'}
          </p>
          <p className="text-purple-700 font-semibold">
            {filter === 'current'
              ? 'Things are super peaceful right now!'
              : filter === 'finished'
              ? 'Finish some dramas to see them here!'
              : 'Things are super peaceful right now!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDramas.map((drama) => (
            <DramaCard key={drama.id} drama={drama} />
          ))}
        </div>
      )}
    </div>
  )
}
