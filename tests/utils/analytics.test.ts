import { describe, it, expect } from 'vitest'
import { groupByWeek, calculatePersonInvolvement, calculateStatistics } from '@/lib/analytics'

describe('groupByWeek', () => {
  it('should return empty array for no dramas', () => {
    const result = groupByWeek([])
    expect(result).toEqual([])
  })

  it('should group dramas by week starting Monday', () => {
    const dramas = [
      { createdAt: new Date('2025-10-20T10:00:00Z') }, // Monday
      { createdAt: new Date('2025-10-22T10:00:00Z') }, // Wednesday same week
      { createdAt: new Date('2025-10-27T10:00:00Z') }, // Monday next week
    ]

    const result = groupByWeek(dramas)

    expect(result).toHaveLength(2)
    expect(result[0].count).toBe(2)
    expect(result[1].count).toBe(1)
  })

  it('should sort results by week ascending', () => {
    const dramas = [
      { createdAt: new Date('2025-10-27T10:00:00Z') }, // Later week
      { createdAt: new Date('2025-10-20T10:00:00Z') }, // Earlier week
    ]

    const result = groupByWeek(dramas)

    expect(result[0].weekStart < result[1].weekStart).toBe(true)
  })

  it('should format weekStart as yyyy-MM-dd', () => {
    const dramas = [
      { createdAt: new Date('2025-10-22T10:00:00Z') },
    ]

    const result = groupByWeek(dramas)

    expect(result[0].weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('calculatePersonInvolvement', () => {
  it('should return empty array for no dramas', () => {
    const result = calculatePersonInvolvement([])
    expect(result).toEqual([])
  })

  it('should count involvement correctly', () => {
    const dramas = [
      {
        id: '1',
        title: 'Drama 1',
        details: '',
        createdAt: new Date(),
        participants: [
          { id: '1', name: 'Alice', createdAt: new Date() },
          { id: '2', name: 'Bob', createdAt: new Date() },
        ],
      },
      {
        id: '2',
        title: 'Drama 2',
        details: '',
        createdAt: new Date(),
        participants: [
          { id: '1', name: 'Alice', createdAt: new Date() },
          { id: '3', name: 'Charlie', createdAt: new Date() },
        ],
      },
    ]

    const result = calculatePersonInvolvement(dramas)

    expect(result).toHaveLength(3)

    const alice = result.find((p) => p.name === 'Alice')
    const bob = result.find((p) => p.name === 'Bob')
    const charlie = result.find((p) => p.name === 'Charlie')

    expect(alice?.count).toBe(2)
    expect(bob?.count).toBe(1)
    expect(charlie?.count).toBe(1)
  })

  it('should sort by count descending', () => {
    const dramas = [
      {
        id: '1',
        title: 'Drama 1',
        details: '',
        createdAt: new Date(),
        participants: [
          { id: '1', name: 'Alice', createdAt: new Date() },
          { id: '2', name: 'Bob', createdAt: new Date() },
        ],
      },
      {
        id: '2',
        title: 'Drama 2',
        details: '',
        createdAt: new Date(),
        participants: [
          { id: '1', name: 'Alice', createdAt: new Date() },
        ],
      },
    ]

    const result = calculatePersonInvolvement(dramas)

    expect(result[0].name).toBe('Alice')
    expect(result[0].count).toBe(2)
    expect(result[1].name).toBe('Bob')
    expect(result[1].count).toBe(1)
  })
})

describe('calculateStatistics', () => {
  it('should return correct statistics', () => {
    const dramas = [
      {
        id: '1',
        title: 'Drama 1',
        details: '',
        createdAt: new Date('2025-10-20T10:00:00Z'),
        participants: [
          { id: '1', name: 'Alice', createdAt: new Date() },
          { id: '2', name: 'Bob', createdAt: new Date() },
        ],
      },
      {
        id: '2',
        title: 'Drama 2',
        details: '',
        createdAt: new Date('2025-10-27T10:00:00Z'),
        participants: [
          { id: '1', name: 'Alice', createdAt: new Date() },
        ],
      },
    ]

    const result = calculateStatistics(dramas)

    expect(result.totalDramas).toBe(2)
    expect(result.perPerson).toHaveLength(2)
    expect(result.perWeek).toHaveLength(2)
  })
})
