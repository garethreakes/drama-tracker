'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Person {
  id: string
  name: string
  icon: string
}

interface Vote {
  id: string
  severity: number
  comment?: string | null
  person: Person
  createdAt: string
}

interface VoteDistribution {
  severity: number
  count: number
  voters: { name: string; icon: string }[]
}

interface VotingData {
  votes: Vote[]
  averageSeverity: number
  totalVotes: number
  totalPeople: number
  pendingVoters: Person[]
  distribution: VoteDistribution[]
  currentUserVote?: Vote | null
}

interface DramaVotingProps {
  dramaId: string
  currentSeverity: number
}

export default function DramaVoting({ dramaId, currentSeverity }: DramaVotingProps) {
  const router = useRouter()
  const [votingData, setVotingData] = useState<VotingData | null>(null)
  const [selectedSeverity, setSelectedSeverity] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showVoteDetails, setShowVoteDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingVote, setIsEditingVote] = useState(false)

  const fetchVotingData = async () => {
    try {
      const response = await fetch(`/api/dramas/${dramaId}/vote`)
      if (response.ok) {
        const data = await response.json()
        setVotingData(data)
        if (data.currentUserVote) {
          setSelectedSeverity(data.currentUserVote.severity)
          setComment(data.currentUserVote.comment || '')
        }
      }
    } catch (error) {
      console.error('Error fetching voting data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVotingData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dramaId])

  const handleVoteSubmit = async () => {
    if (selectedSeverity === null) {
      alert('Please select a severity level')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/dramas/${dramaId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          severity: selectedSeverity,
          comment: comment.trim() || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit vote')
      }

      await fetchVotingData()
      setIsEditingVote(false)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit vote. Please try again.'
      alert(message)
      console.error('Vote submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSeverityInfo = (severity: number) => {
    const severityLevels = [
      { level: 1, emoji: '😌', label: 'Minor', color: 'bg-green-500' },
      { level: 2, emoji: '😐', label: 'Low', color: 'bg-blue-500' },
      { level: 3, emoji: '😬', label: 'Medium', color: 'bg-yellow-500' },
      { level: 4, emoji: '😰', label: 'High', color: 'bg-orange-500' },
      { level: 5, emoji: '🔥', label: 'Severe', color: 'bg-red-600' },
    ]
    return severityLevels[severity - 1] || severityLevels[2]
  }

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-white/20 rounded-xl backdrop-blur-sm">
        <div className="text-white text-center">Loading voting data...</div>
      </div>
    )
  }

  if (!votingData) {
    return null
  }

  const hasVoted = votingData.currentUserVote !== null && votingData.currentUserVote !== undefined
  const showVotingForm = !hasVoted || isEditingVote
  const allVoted = votingData.totalVotes === votingData.totalPeople
  const votingProgress = (votingData.totalVotes / votingData.totalPeople) * 100

  return (
    <div className="mt-4 space-y-3">
      {/* Voting Status Bar */}
      <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-white">
            Votes: {votingData.totalVotes}/{votingData.totalPeople}
          </span>
          {allVoted ? (
            <span className="text-xs font-bold bg-green-500 text-white px-2 py-1 rounded-full">
              ✓ All Voted!
            </span>
          ) : (
            <span className="text-xs font-bold bg-orange-500 text-white px-2 py-1 rounded-full">
              {votingData.pendingVoters.length} Pending
            </span>
          )}
        </div>
        <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-500"
            style={{ width: `${votingProgress}%` }}
          />
        </div>
        {votingData.pendingVoters.length > 0 && (
          <div className="mt-2 text-xs text-white/90">
            Waiting for: {votingData.pendingVoters.map(p => `${p.icon} ${p.name}`).join(', ')}
          </div>
        )}
      </div>

      {/* Voting Interface */}
      {showVotingForm ? (
        <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm overflow-visible">
          <div className="text-sm font-bold text-white mb-4">
            🗳️ Cast Your Vote - How severe was this drama?
          </div>

          <div className="bg-white rounded-lg p-2 mb-4">
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((severity) => {
                const info = getSeverityInfo(severity)
                const isSelected = selectedSeverity === severity
                return (
                  <button
                    key={severity}
                    onClick={() => setSelectedSeverity(severity)}
                    className={`p-2 rounded-lg font-bold transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? `${info.color} text-white shadow-xl border-4 border-white`
                        : 'bg-white/50 text-gray-700 hover:bg-white/70 hover:scale-105'
                    }`}
                  >
                    <div className="text-2xl">{info.emoji}</div>
                    <div className="text-xs mt-1">{severity}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment about your vote..."
            className="w-full p-2 rounded-lg text-sm bg-white/70 border-2 border-white/50 focus:border-white focus:outline-none resize-none"
            rows={2}
          />

          <button
            onClick={handleVoteSubmit}
            disabled={isSubmitting || selectedSeverity === null}
            className="mt-3 w-full bg-white text-purple-600 font-bold py-2 px-4 rounded-lg hover:bg-purple-50 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Vote'}
          </button>
        </div>
      ) : (
        <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-white">
              ✓ You voted: {getSeverityInfo(votingData.currentUserVote!.severity).emoji} {votingData.currentUserVote!.severity}/5
            </span>
            <button
              onClick={() => {
                setSelectedSeverity(votingData.currentUserVote!.severity)
                setComment(votingData.currentUserVote!.comment || '')
                setIsEditingVote(true)
              }}
              className="text-xs bg-white/50 hover:bg-white/70 px-2 py-1 rounded font-bold text-gray-700"
            >
              Change Vote
            </button>
          </div>
          {votingData.currentUserVote!.comment && (
            <div className="text-xs text-white/90 italic mt-1">
              &ldquo;{votingData.currentUserVote!.comment}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Vote Results */}
      {votingData.totalVotes > 0 && (
        <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
          <button
            onClick={() => setShowVoteDetails(!showVoteDetails)}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">
                📊 Average: {votingData.averageSeverity.toFixed(1)}/5
              </span>
              <span className="text-white/70 text-xs">
                {showVoteDetails ? '▼' : '▶'} {showVoteDetails ? 'Hide' : 'Show'} Details
              </span>
            </div>
          </button>

          {showVoteDetails && (
            <div className="mt-3 space-y-2">
              {votingData.distribution.map((dist) => {
                if (dist.count === 0) return null
                const info = getSeverityInfo(dist.severity)
                const percentage = (dist.count / votingData.totalVotes) * 100

                return (
                  <div key={dist.severity} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-bold">
                        {info.emoji} {dist.severity} - {info.label}
                      </span>
                      <span className="text-white/90">
                        {dist.count} vote{dist.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden mb-1">
                      <div
                        className={`${info.color} h-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-white/80">
                      {dist.voters.map(v => `${v.icon} ${v.name}`).join(', ')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
