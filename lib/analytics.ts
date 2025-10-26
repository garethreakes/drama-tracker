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
 * Calculates overall statistics for dramas
 * @param dramas Array of dramas
 * @returns Object containing total drama count, per-person involvement, and weekly data
 */
export function calculateStatistics(dramas: Drama[]) {
  return {
    totalDramas: dramas.length,
    perPerson: calculatePersonInvolvement(dramas),
    perWeek: groupByWeek(dramas),
    monthlyQueens: calculateMonthlyDramaQueens(dramas),
  }
}
