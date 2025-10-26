import { startOfWeek, startOfMonth, format } from 'date-fns'

export interface Drama {
  id: string
  title: string
  details: string
  createdAt: Date
  participants: Person[]
}

export interface Person {
  id: string
  name: string
  icon?: string
  createdAt: Date
}

export interface WeeklyData {
  weekStart: string
  count: number
}

export interface PersonInvolvement {
  personId: string
  name: string
  icon?: string
  count: number
}

export interface MonthlyDramaQueen {
  month: string // Format: "YYYY-MM"
  monthLabel: string // Format: "January 2025"
  personId: string
  name: string
  icon?: string
  count: number
  isCurrentMonth: boolean
}

export interface MonthlyLeaderboardEntry {
  personId: string
  name: string
  icon?: string
  count: number
  rank: number
}

/**
 * Groups dramas by week (Monday-started weeks) and counts them
 * @param dramas Array of dramas with createdAt dates
 * @returns Array of weekly data sorted by date ascending
 */
export function groupByWeek(dramas: { createdAt: Date }[]): WeeklyData[] {
  if (dramas.length === 0) return []

  const weekMap = new Map<string, number>()

  dramas.forEach((drama) => {
    const date = new Date(drama.createdAt)
    const weekStartDate = startOfWeek(date, { weekStartsOn: 1 }) // Monday = 1
    const weekKey = format(weekStartDate, 'yyyy-MM-dd')

    weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + 1)
  })

  const result = Array.from(weekMap.entries())
    .map(([weekStart, count]) => ({ weekStart, count }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))

  return result
}

/**
 * Calculates per-person involvement in dramas
 * @param dramas Array of dramas with participants
 * @returns Array of person involvement sorted by count descending
 */
export function calculatePersonInvolvement(dramas: Drama[]): PersonInvolvement[] {
  const involvementMap = new Map<string, { name: string; count: number }>()

  dramas.forEach((drama) => {
    drama.participants.forEach((person) => {
      const existing = involvementMap.get(person.id)
      if (existing) {
        existing.count++
      } else {
        involvementMap.set(person.id, { name: person.name, count: 1 })
      }
    })
  })

  const result = Array.from(involvementMap.entries())
    .map(([personId, data]) => ({
      personId,
      name: data.name,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)

  return result
}

/**
 * Calculates monthly drama queen awards
 * @param dramas Array of dramas with participants
 * @returns Array of monthly winners sorted by month descending (newest first)
 */
export function calculateMonthlyDramaQueens(dramas: Drama[]): MonthlyDramaQueen[] {
  if (dramas.length === 0) return []

  const currentMonth = format(new Date(), 'yyyy-MM')

  // Group dramas by month and person
  const monthlyInvolvement = new Map<string, Map<string, { name: string; icon?: string; count: number }>>()

  dramas.forEach((drama) => {
    const date = new Date(drama.createdAt)
    const monthKey = format(date, 'yyyy-MM')

    if (!monthlyInvolvement.has(monthKey)) {
      monthlyInvolvement.set(monthKey, new Map())
    }

    const monthMap = monthlyInvolvement.get(monthKey)!

    drama.participants.forEach((person) => {
      const existing = monthMap.get(person.id)
      if (existing) {
        existing.count++
      } else {
        monthMap.set(person.id, { name: person.name, icon: person.icon, count: 1 })
      }
    })
  })

  // Find winner for each month
  const winners: MonthlyDramaQueen[] = []

  monthlyInvolvement.forEach((personMap, monthKey) => {
    let maxCount = 0
    let winnerData: { personId: string; name: string; icon?: string; count: number } | undefined

    personMap.forEach((data, personId) => {
      if (data.count > maxCount) {
        maxCount = data.count
        winnerData = { personId, name: data.name, icon: data.icon, count: data.count }
      }
    })

    if (winnerData) {
      const monthDate = new Date(monthKey + '-01')
      winners.push({
        month: monthKey,
        monthLabel: format(monthDate, 'MMMM yyyy'),
        personId: winnerData.personId,
        name: winnerData.name,
        icon: winnerData.icon,
        count: winnerData.count,
        isCurrentMonth: monthKey === currentMonth,
      })
    }
  })

  // Sort by month descending (newest first)
  winners.sort((a, b) => b.month.localeCompare(a.month))

  return winners
}

/**
 * Calculates the full leaderboard for the current month
 * @param dramas Array of dramas with participants
 * @param allPeople Array of all people in the system
 * @returns Array of all people sorted by drama count in current month (descending)
 */
export function calculateCurrentMonthLeaderboard(
  dramas: Drama[],
  allPeople: Person[]
): MonthlyLeaderboardEntry[] {
  const currentMonth = format(new Date(), 'yyyy-MM')

  // Filter dramas to current month only
  const currentMonthDramas = dramas.filter((drama) => {
    const dramaMonth = format(new Date(drama.createdAt), 'yyyy-MM')
    return dramaMonth === currentMonth
  })

  // Count involvement per person in current month
  const involvementMap = new Map<string, { name: string; icon?: string; count: number }>()

  currentMonthDramas.forEach((drama) => {
    drama.participants.forEach((person) => {
      const existing = involvementMap.get(person.id)
      if (existing) {
        existing.count++
      } else {
        involvementMap.set(person.id, {
          name: person.name,
          icon: person.icon,
          count: 1,
        })
      }
    })
  })

  // Create leaderboard including people with 0 dramas
  const leaderboard: MonthlyLeaderboardEntry[] = allPeople.map((person) => {
    const involvement = involvementMap.get(person.id)
    return {
      personId: person.id,
      name: person.name,
      icon: person.icon,
      count: involvement?.count || 0,
      rank: 0, // Will be assigned after sorting
    }
  })

  // Sort by count descending, then by name ascending
  leaderboard.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count
    }
    return a.name.localeCompare(b.name)
  })

  // Assign ranks
  let currentRank = 1
  leaderboard.forEach((entry, index) => {
    if (index > 0 && entry.count < leaderboard[index - 1].count) {
      currentRank = index + 1
    }
    entry.rank = currentRank
  })

  return leaderboard
}

/**
 * Calculates overall statistics for dramas
 * @param dramas Array of dramas
 * @param allPeople Array of all people (optional, for current month leaderboard)
 * @returns Object containing total drama count, per-person involvement, and weekly data
 */
export function calculateStatistics(dramas: Drama[], allPeople?: Person[]) {
  return {
    totalDramas: dramas.length,
    perPerson: calculatePersonInvolvement(dramas),
    perWeek: groupByWeek(dramas),
    monthlyQueens: calculateMonthlyDramaQueens(dramas),
    currentMonthLeaderboard: allPeople ? calculateCurrentMonthLeaderboard(dramas, allPeople) : [],
  }
}
