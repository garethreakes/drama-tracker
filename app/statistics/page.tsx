import { prisma } from '@/lib/prisma'
import { calculateStatistics } from '@/lib/analytics'
import PerPersonBar from '@/components/Charts/PerPersonBar'
import PerWeekLine from '@/components/Charts/PerWeekLine'
import Link from 'next/link'

async function getDramas() {
  const dramas = await prisma.drama.findMany({
    include: {
      participants: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return dramas
}

async function getAllPeople() {
  const people = await prisma.person.findMany({
    orderBy: { name: 'asc' },
  })
  return people
}

export const dynamic = 'force-dynamic'

export default async function StatisticsPage() {
  const dramas = await getDramas()
  const allPeople = await getAllPeople()
  const stats = calculateStatistics(dramas, allPeople)

  // Separate current month and previous months
  const currentMonthWinner = stats.monthlyQueens.find(q => q.isCurrentMonth)
  const previousMonthsWinners = stats.monthlyQueens.filter(q => !q.isCurrentMonth)

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <h1 className="text-4xl font-black text-purple-900">📊 Statistics 📊</h1>
          <Link
            href="/"
            className="gradient-purple-pink text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all whitespace-nowrap"
          >
            🏠 Back to Home
          </Link>
        </div>
        <p className="text-purple-700 font-semibold">Overall drama analytics and trends</p>
      </div>

      {/* Current Month Leaderboard */}
      {stats.currentMonthLeaderboard.length > 0 && (
        <section className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-4 border-purple-300 p-8">
          <h2 className="text-3xl font-black text-purple-900 mb-2 text-center">
            👑 {currentMonthWinner?.monthLabel || 'Current Month'} Drama Queen Leaderboard 👑
          </h2>
          <p className="text-center text-purple-700 font-semibold mb-6">
            Current standings for this month
          </p>
          <div className="space-y-3">
            {stats.currentMonthLeaderboard.map((entry, index) => (
              <div
                key={entry.personId}
                className={`p-4 rounded-xl shadow-lg transition-all ${
                  index === 0 && entry.count > 0
                    ? 'gradient-purple-pink border-4 border-yellow-400'
                    : entry.count > 0
                    ? 'bg-white border-2 border-purple-200'
                    : 'bg-gray-50 border-2 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-black w-8 text-center ${
                      index === 0 && entry.count > 0 ? 'text-white drop-shadow' : 'text-purple-600'
                    }`}>
                      {index === 0 && entry.count > 0 ? '👑' : `#${entry.rank}`}
                    </div>
                    <div className="text-4xl">{entry.icon || '👤'}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-xl font-black ${
                          index === 0 && entry.count > 0 ? 'text-white drop-shadow' : 'text-purple-900'
                        }`}>
                          {entry.name}
                        </h3>
                        {index === 0 && entry.count > 0 && (
                          <span className="px-3 py-1 text-xs font-black bg-yellow-400 text-purple-900 rounded-full shadow-md animate-pulse">
                            🔥 LEADING
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-black ${
                      index === 0 && entry.count > 0
                        ? 'text-white drop-shadow'
                        : entry.count > 0
                        ? 'text-purple-600'
                        : 'text-gray-400'
                    }`}>
                      {entry.count}
                    </div>
                    <div className={`text-xs font-bold ${
                      index === 0 && entry.count > 0
                        ? 'text-white/90'
                        : entry.count > 0
                        ? 'text-purple-600'
                        : 'text-gray-400'
                    }`}>
                      {entry.count === 1 ? 'drama' : 'dramas'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Previous Months Winners History */}
      {previousMonthsWinners.length > 0 && (
        <section className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-4 border-purple-300 p-8">
          <h2 className="text-3xl font-black text-purple-900 mb-6 text-center">
            🏆 Drama Queen Hall of Fame 🏆
          </h2>
          <p className="text-center text-purple-700 font-semibold mb-6">
            Previous months&apos; winners
          </p>
          <div className="space-y-3">
            {previousMonthsWinners.map((queen) => (
              <div
                key={queen.month}
                className="p-5 rounded-xl shadow-lg bg-white border-2 border-purple-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{queen.icon || '👤'}</div>
                    <div>
                      <h3 className="text-xl font-black text-purple-900">
                        {queen.name}
                      </h3>
                      <p className="text-sm font-bold text-purple-700">
                        {queen.monthLabel}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-purple-600">
                      {queen.count}
                    </div>
                    <div className="text-xs font-bold text-purple-600">
                      {queen.count === 1 ? 'drama' : 'dramas'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Total Drama Count */}
      <section className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-4 border-purple-300 p-8">
        <div className="text-center">
          <p className="text-sm font-black text-purple-700 uppercase tracking-wide">Total Dramas (All Time)</p>
          <p className="text-6xl font-black text-purple-600 mt-2">{stats.totalDramas} 🎭</p>
        </div>
      </section>

      {/* Per Person Involvement */}
      <section className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-4 border-purple-300 p-8">
        <h2 className="text-2xl font-black text-purple-900 mb-2">Drama Involvement by Person</h2>
        <p className="text-sm text-purple-700 font-semibold mb-6">Number of dramas each person has been involved in</p>
        {stats.perPerson.length === 0 ? (
          <div className="text-center py-8 text-purple-600 font-semibold">
            No data available yet
          </div>
        ) : (
          <PerPersonBar data={stats.perPerson} />
        )}
      </section>

      {/* Weekly Trends */}
      <section className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-4 border-purple-300 p-8">
        <h2 className="text-2xl font-black text-purple-900 mb-2">Drama Trends Over Time</h2>
        <p className="text-sm text-purple-700 font-semibold mb-6">Total dramas per week (Monday-Sunday)</p>
        {stats.perWeek.length === 0 ? (
          <div className="text-center py-8 text-purple-600 font-semibold">
            No data available yet
          </div>
        ) : (
          <PerWeekLine data={stats.perWeek} />
        )}
      </section>
    </div>
  )
}
