import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { isFinished } = body

    if (typeof isFinished !== 'boolean') {
      return NextResponse.json(
        { error: 'isFinished must be a boolean' },
        { status: 400 }
      )
    }

    const drama = await prisma.drama.findUnique({
      where: { id: params.id },
    })

    if (!drama) {
      return NextResponse.json(
        { error: 'Drama not found' },
        { status: 404 }
      )
    }

    const updatedDrama = await prisma.drama.update({
      where: { id: params.id },
      data: {
        isFinished,
        finishedAt: isFinished ? new Date() : null,
      },
      include: {
        participants: {
          orderBy: { name: 'asc' },
        },
      },
    })

    return NextResponse.json(updatedDrama)
  } catch (error) {
    console.error('Error updating drama:', error)
    return NextResponse.json(
      { error: 'Failed to update drama' },
      { status: 500 }
    )
  }
}
