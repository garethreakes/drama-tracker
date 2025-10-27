import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import DramaList from '@/components/DramaList'

async function getDramas() {
  const dramas = await prisma.drama.findMany({
    include: {
      participants: {
        orderBy: { name: 'asc' },
      },
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Serialize dates for client component and add voting info
  return dramas.map((drama) => {
    const totalVotes = drama.votes.length
    const totalParticipants = drama.participants.length
    const allVoted = totalVotes === totalParticipants && totalParticipants > 0

    // Calculate average severity from votes if all have voted
    const averageSeverity = totalVotes > 0
      ? drama.votes.reduce((sum, vote) => sum + vote.severity, 0) / totalVotes
      : drama.severity

    return {
      ...drama,
      createdAt: drama.createdAt.toISOString(),
      finishedAt: drama.finishedAt ? drama.finishedAt.toISOString() : null,
      totalVotes,
      totalParticipants,
      allVoted,
      averageSeverity: Math.round(averageSeverity),
      votes: undefined, // Don't send all vote details to client
    }
  })
}

export const dynamic = 'force-dynamic'

export default async function Home() {
  const dramas = await getDramas()

  return (
    <div className="space-y-8">
      {/* Current Drama Board */}
      <section>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-4xl font-black text-purple-900 drop-shadow-lg">✨ Drama Board ✨</h2>
          <div className="flex gap-3">
            <Link
              href="/statistics"
              className="gradient-yellow-orange text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              📊 Stats
            </Link>
            <Link
              href="/friends"
              className="gradient-green-blue text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              👥 Manage Friends
            </Link>
            <Link
              href="/drama/new"
              className="gradient-purple-pink text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              ➕ Add Drama
            </Link>
          </div>
        </div>

        <DramaList dramas={dramas} />
      </section>
    </div>
  )
}
