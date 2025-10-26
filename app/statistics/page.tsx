import { prisma } from '@/lib/prisma'
import { calculateStatistics } from '@/lib/analytics'
import PerPersonBar from '@/components/Charts/PerPersonBar'
import PerWeekLine from '@/components/Charts/PerWeekLine'

async function getDramas() {
  const dramas = await prisma.drama.findMany({
    include: {
      participants: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return dramas
}

export const dynamic = 'force-dynamic'

export default async function StatisticsPage() {
  const dramas = await getDramas()
  const stats = calculateStatistics(dramas)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-purple-900 mb-2">📊 Statistics 📊</h1>
        <p className="text-purple-700 font-semibold">Overall drama analytics and trends</p>
      </div>

      {/* Monthly Drama Queen Awards */}
      {stats.monthlyQueens.length > 0 && (
        <section className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-4 border-purple-300 p-8">
          <h2 className="text-3xl font-black text-purple-900 mb-6 text-center">
            👑 Monthly Drama Queen Awards 👑
          </h2>
          <div className="space-y-4">
            {stats.monthlyQueens.map((queen) => (
              <div
                key={queen.month}
                className={`p-6 rounded-xl shadow-lg transition-all ${
                  queen.isCurrentMonth
                    ? 'gradient-purple-pink border-4 border-yellow-400 transform scale-105'
                    : 'bg-white border-2 border-purple-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{queen.icon || '👤'}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-2xl font-black ${queen.isCurrentMonth ? 'text-white drop-shadow' : 'text-purple-900'}`}>
                          {queen.name}
                        </h3>
                        {queen.isCurrentMonth && (
                          <span className="px-3 py-1 text-xs font-black bg-yellow-400 text-purple-900 rounded-full shadow-md animate-pulse">
                            🔥 CURRENT LEADER
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-bold ${queen.isCurrentMonth ? 'text-white/90' : 'text-purple-700'}`}>
                        {queen.monthLabel}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-black ${queen.isCurrentMonth ? 'text-white drop-shadow' : 'text-purple-600'}`}>
                      {queen.count}
                    </div>
                    <div className={`text-sm font-bold ${queen.isCurrentMonth ? 'text-white/90' : 'text-purple-600'}`}>
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
