import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/people/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    person: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('GET /api/people', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return list of people', async () => {
    const mockDate = '2025-10-30T10:00:00.000Z'
    const mockPeople = [
      { id: '1', name: 'Alice', createdAt: new Date(mockDate), icon: '👤' },
      { id: '2', name: 'Bob', createdAt: new Date(mockDate), icon: '👤' },
    ]

    vi.mocked(prisma.person.findMany).mockResolvedValue(mockPeople as any)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject([
      { id: '1', name: 'Alice', icon: '👤' },
      { id: '2', name: 'Bob', icon: '👤' },
    ])
    expect(prisma.person.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    })
  })
})

describe('POST /api/people', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new person successfully', async () => {
    const mockDate = '2025-10-30T10:00:00.000Z'
    const newPerson = { id: '1', name: 'Alice', createdAt: new Date(mockDate), icon: '👤' }

    // Mock findMany to return empty array (no existing people)
    vi.mocked(prisma.person.findMany).mockResolvedValue([])
    vi.mocked(prisma.person.create).mockResolvedValue(newPerson as any)

    const request = new Request('http://localhost/api/people', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alice' }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toMatchObject({ id: '1', name: 'Alice', icon: '👤' })
  })

  it('should return 400 if name is missing', async () => {
    const request = new Request('http://localhost/api/people', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Name is required and must be a string')
  })

  it('should return 400 if name is empty', async () => {
    const request = new Request('http://localhost/api/people', {
      method: 'POST',
      body: JSON.stringify({ name: '   ' }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Name cannot be empty')
  })

  it('should return 409 if person already exists (case insensitive)', async () => {
    const mockDate = '2025-10-30T10:00:00.000Z'
    const existingPerson = { id: '1', name: 'alice', createdAt: new Date(mockDate), icon: '👤' }
    // Mock findMany to return existing person
    vi.mocked(prisma.person.findMany).mockResolvedValue([existingPerson as any])

    const request = new Request('http://localhost/api/people', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alice' }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('A person with this name already exists')
  })
})
