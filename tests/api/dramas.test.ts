import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/dramas/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    drama: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    person: {
      findMany: vi.fn(),
    },
  },
}))

describe('GET /api/dramas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return list of dramas with participants', async () => {
    const mockDate = '2025-10-30T10:00:00.000Z'
    const mockDramas = [
      {
        id: '1',
        title: 'Test Drama',
        details: 'Details',
        createdAt: new Date(mockDate),
        participants: [
          { id: '1', name: 'Alice', createdAt: new Date(mockDate), icon: '👤' },
          { id: '2', name: 'Bob', createdAt: new Date(mockDate), icon: '👤' },
        ],
      },
    ]

    vi.mocked(prisma.drama.findMany).mockResolvedValue(mockDramas as any)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject([
      {
        id: '1',
        title: 'Test Drama',
        details: 'Details',
        participants: [
          { id: '1', name: 'Alice' },
          { id: '2', name: 'Bob' },
        ],
      },
    ])
  })
})

describe('POST /api/dramas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new drama successfully', async () => {
    const mockDate = '2025-10-30T10:00:00.000Z'
    const participants = [
      { id: '1', name: 'Alice', createdAt: new Date(mockDate), icon: '👤' },
      { id: '2', name: 'Bob', createdAt: new Date(mockDate), icon: '👤' },
    ]

    const newDrama = {
      id: '1',
      title: 'Test Drama',
      details: 'Details',
      createdAt: new Date(mockDate),
      participants,
    }

    vi.mocked(prisma.person.findMany).mockResolvedValue(participants as any)
    vi.mocked(prisma.drama.create).mockResolvedValue(newDrama as any)

    const request = new Request('http://localhost/api/dramas', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Drama',
        details: 'Details',
        participantIds: ['1', '2'],
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toMatchObject({
      id: '1',
      title: 'Test Drama',
      details: 'Details',
      participants: [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ],
    })
  })

  it('should return 400 if title is missing', async () => {
    const request = new Request('http://localhost/api/dramas', {
      method: 'POST',
      body: JSON.stringify({
        participantIds: ['1', '2'],
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Title is required and must be a string')
  })

  it('should return 400 if less than 2 participants', async () => {
    const request = new Request('http://localhost/api/dramas', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Drama',
        participantIds: ['1'],
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Drama must have at least 2 participants')
  })

  it('should return 400 if participantIds is not an array', async () => {
    const request = new Request('http://localhost/api/dramas', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Drama',
        participantIds: 'not-an-array',
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('participantIds must be an array')
  })

  it('should return 400 if participant IDs are invalid', async () => {
    const mockDate = '2025-10-30T10:00:00.000Z'
    vi.mocked(prisma.person.findMany).mockResolvedValue([
      { id: '1', name: 'Alice', createdAt: new Date(mockDate), icon: '👤' },
    ] as any)

    const request = new Request('http://localhost/api/dramas', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Drama',
        participantIds: ['1', '2', '3'],
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('One or more participant IDs are invalid')
  })
})
