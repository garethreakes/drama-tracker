import { describe, it, expect } from 'vitest'
import {
  calculatePersonInvolvement,
  groupByWeek,
  calculateMonthlyDramaQueens,
  calculateStatistics,
} from '@/lib/analytics'

describe('Smoke Tests - Analytics Utils', () => {
  it('should handle empty drama array for person involvement', () => {
    const result = calculatePersonInvolvement([])
    expect(result).toEqual([])
  })

  it('should handle empty drama array for weekly grouping', () => {
    const result = groupByWeek([])
    expect(result).toEqual([])
  })

  it('should handle empty drama array for monthly queens', () => {
    const result = calculateMonthlyDramaQueens([])
    expect(result).toEqual([])
  })

  it('should calculate drama involvement correctly', () => {
    const mockDramas = [
      {
        id: '1',
        title: 'Test',
        details: 'Details',
        createdAt: new Date('2025-01-15'),
        participants: [
          { id: '1', name: 'Alice', icon: '👤', createdAt: new Date() },
          { id: '2', name: 'Bob', icon: '👤', createdAt: new Date() },
        ],
      },
      {
        id: '2',
        title: 'Test 2',
        details: 'Details',
        createdAt: new Date('2025-01-16'),
        participants: [{ id: '1', name: 'Alice', icon: '👤', createdAt: new Date() }],
      },
    ]

    const result = calculatePersonInvolvement(mockDramas)
    expect(result.length).toBe(2)

    const alice = result.find(p => p.name === 'Alice')
    const bob = result.find(p => p.name === 'Bob')

    expect(alice?.count).toBe(2)
    expect(bob?.count).toBe(1)
  })

  it('should calculate statistics with sample data', () => {
    const mockDramas = [
      {
        id: '1',
        title: 'Test',
        details: 'Details',
        createdAt: new Date('2025-01-15'),
        participants: [
          { id: '1', name: 'Alice', icon: '👤', createdAt: new Date() },
        ],
      },
    ]

    const result = calculateStatistics(mockDramas)
    expect(result.totalDramas).toBe(1)
    expect(result.perPerson.length).toBe(1)
    expect(result.perWeek.length).toBeGreaterThan(0)
  })
})
