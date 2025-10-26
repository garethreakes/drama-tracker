'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Person {
  id: string
  name: string
}

interface AddDramaFormProps {
  initialPeople?: Person[]
}

export default function AddDramaForm({ initialPeople = [] }: AddDramaFormProps) {
  const router = useRouter()
  const [people, setPeople] = useState<Person[]>(initialPeople)
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [severity, setSeverity] = useState(3)
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(initialPeople.length === 0)

  useEffect(() => {
    if (initialPeople.length === 0) {
      fetchPeople()
    }
  }, [initialPeople.length])

  const fetchPeople = async () => {
    try {
      const response = await fetch('/api/people')
      if (response.ok) {
        const data = await response.json()
        setPeople(data)
      }
    } catch (err) {
      setError('Failed to load people')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleParticipant = (personId: string) => {
    const newSelected = new Set(selectedParticipants)
    if (newSelected.has(personId)) {
      newSelected.delete(personId)
    } else {
      newSelected.add(personId)
    }
    setSelectedParticipants(newSelected)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (selectedParticipants.size < 2) {
      setError('Please select at least 2 participants')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/dramas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          details: details.trim(),
          severity,
          participantIds: Array.from(selectedParticipants),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to add drama')
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  const isValid = title.trim().length > 0 && selectedParticipants.size >= 2

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="drama-title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="drama-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., WhatsApp chat blew up"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="drama-details" className="block text-sm font-medium text-gray-700 mb-1">
          Details
        </label>
        <textarea
          id="drama-details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add more context about what happened..."
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Severity Level
        </label>
        <div className="grid grid-cols-5 gap-2">
          {[
            { level: 1, emoji: '😌', label: 'Minor', color: 'bg-green-100 border-green-300 text-green-800' },
            { level: 2, emoji: '😐', label: 'Low', color: 'bg-blue-100 border-blue-300 text-blue-800' },
            { level: 3, emoji: '😬', label: 'Medium', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
            { level: 4, emoji: '😰', label: 'High', color: 'bg-orange-100 border-orange-300 text-orange-800' },
            { level: 5, emoji: '🔥', label: 'Severe', color: 'bg-red-100 border-red-300 text-red-800' },
          ].map(({ level, emoji, label, color }) => (
            <button
              key={level}
              type="button"
              onClick={() => setSeverity(level)}
              disabled={isSubmitting}
              className={`p-3 rounded-lg border-2 transition-all transform hover:scale-105 ${
                severity === level
                  ? `${color} ring-2 ring-offset-2 ring-purple-500 shadow-lg font-bold scale-105`
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-xs font-semibold">{label}</div>
              <div className="text-xs opacity-75">{level}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Participants <span className="text-red-500">*</span> (select at least 2)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {people.map((person) => (
            <label
              key={person.id}
              className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer transition-colors ${
                selectedParticipants.has(person.id)
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedParticipants.has(person.id)}
                onChange={() => toggleParticipant(person.id)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <span className="text-sm font-medium text-gray-900">{person.name}</span>
            </label>
          ))}
        </div>
        {people.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">No friends added yet. Add friends first!</p>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !isValid}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Adding Drama...' : 'Add Drama'}
      </button>
    </form>
  )
}
