import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/people/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    person: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('GET /api/people', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return list of people', async () => {
    const mockPeople = [
      { id: '1', name: 'Alice', createdAt: new Date() },
      { id: '2', name: 'Bob', createdAt: new Date() },
    ]

    vi.mocked(prisma.person.findMany).mockResolvedValue(mockPeople)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockPeople)
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
    const newPerson = { id: '1', name: 'Alice', createdAt: new Date() }

    vi.mocked(prisma.person.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.person.create).mockResolvedValue(newPerson)

    const request = new Request('http://localhost/api/people', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alice' }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toEqual(newPerson)
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
    const existingPerson = { id: '1', name: 'alice', createdAt: new Date() }
    vi.mocked(prisma.person.findFirst).mockResolvedValue(existingPerson)

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
