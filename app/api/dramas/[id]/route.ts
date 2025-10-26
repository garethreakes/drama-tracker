import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const drama = await prisma.drama.findUnique({
      where: { id: params.id },
      include: {
        participants: {
          orderBy: { name: 'asc' },
        },
      },
    })

    if (!drama) {
      return NextResponse.json(
        { error: 'Drama not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(drama)
  } catch (error) {
    console.error('Error fetching drama:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drama' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, details, severity, participantIds } = body

    // Check if drama exists
    const existingDrama = await prisma.drama.findUnique({
      where: { id: params.id },
    })

    if (!existingDrama) {
      return NextResponse.json(
        { error: 'Drama not found' },
        { status: 404 }
      )
    }

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

    // Update the drama
    const drama = await prisma.drama.update({
      where: { id: params.id },
      data: {
        title: title.trim(),
        details: typeof details === 'string' ? details.trim() : '',
        severity: typeof severity === 'number' ? severity : existingDrama.severity,
        participants: {
          set: participantIds.map((id: string) => ({ id })),
        },
      },
      include: {
        participants: {
          orderBy: { name: 'asc' },
        },
      },
    })

    return NextResponse.json(drama)
  } catch (error) {
    console.error('Error updating drama:', error)
    return NextResponse.json(
      { error: 'Failed to update drama' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if drama exists
    const existingDrama = await prisma.drama.findUnique({
      where: { id: params.id },
    })

    if (!existingDrama) {
      return NextResponse.json(
        { error: 'Drama not found' },
        { status: 404 }
      )
    }

    // Delete the drama
    await prisma.drama.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting drama:', error)
    return NextResponse.json(
      { error: 'Failed to delete drama' },
      { status: 500 }
    )
  }
}
