import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const dramas = await prisma.drama.findMany({
      include: {
        participants: {
          orderBy: { name: 'asc' },
        },
        votes: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(dramas)
  } catch (error) {
    console.error('Error fetching dramas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dramas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, details, severity, participantIds } = body

    // Validation
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400 }
      )
    }

    if (title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title cannot be empty' },
        { status: 400 }
      )
    }

    if (severity !== undefined && (typeof severity !== 'number' || severity < 1 || severity > 5)) {
      return NextResponse.json(
        { error: 'Severity must be a number between 1 and 5' },
        { status: 400 }
      )
    }

    if (!Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: 'participantIds must be an array' },
        { status: 400 }
      )
    }

    if (participantIds.length < 2) {
      return NextResponse.json(
        { error: 'Drama must have at least 2 participants' },
        { status: 400 }
      )
    }

    // Verify all participants exist
    const participants = await prisma.person.findMany({
      where: {
        id: { in: participantIds },
      },
    })

    if (participants.length !== participantIds.length) {
      return NextResponse.json(
        { error: 'One or more participant IDs are invalid' },
        { status: 400 }
      )
    }

    // Create the drama
    const drama = await prisma.drama.create({
      data: {
        title: title.trim(),
        details: typeof details === 'string' ? details.trim() : '',
        severity: typeof severity === 'number' ? severity : 3,
        participants: {
          connect: participantIds.map((id: string) => ({ id })),
        },
      },
      include: {
        participants: {
          orderBy: { name: 'asc' },
        },
      },
    })

    return NextResponse.json(drama, { status: 201 })
  } catch (error) {
    console.error('Error creating drama:', error)
    return NextResponse.json(
      { error: 'Failed to create drama' },
      { status: 500 }
    )
  }
}
