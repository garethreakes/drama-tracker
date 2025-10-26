import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import DramaList from '@/components/DramaList'

async function getDramas() {
  const dramas = await prisma.drama.findMany({
    include: {
      participants: {
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Serialize dates for client component
  return dramas.map((drama) => ({
    ...drama,
    createdAt: drama.createdAt.toISOString(),
    finishedAt: drama.finishedAt ? drama.finishedAt.toISOString() : null,
  }))
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
