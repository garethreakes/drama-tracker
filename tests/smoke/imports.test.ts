import { describe, it, expect } from 'vitest'

describe('Smoke Tests - Critical Imports', () => {
  it('should load Next.js core modules', async () => {
    const { NextResponse } = await import('next/server')
    expect(NextResponse).toBeDefined()
  })

  it('should load React modules', async () => {
    const React = await import('react')
    expect(React).toBeDefined()
    expect(React.useState).toBeDefined()
  })

  it('should load date-fns', async () => {
    const { format } = await import('date-fns')
    expect(format).toBeDefined()

    const testDate = new Date('2025-01-15')
    const formatted = format(testDate, 'MMM d, yyyy')
    expect(formatted).toBe('Jan 15, 2025')
  })

  it('should load Prisma client definition', async () => {
    const { PrismaClient } = await import('@prisma/client')
    expect(PrismaClient).toBeDefined()
  })
})
