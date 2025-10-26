import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const person = await prisma.person.findUnique({
      where: { id: params.id },
      include: {
        dramas: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(person)
  } catch (error) {
    console.error('Error fetching person:', error)
    return NextResponse.json(
      { error: 'Failed to fetch person' },
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
    const { name, icon } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    if (trimmedName.length === 0) {
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      )
    }

    // Check if person exists
    const existingPerson = await prisma.person.findUnique({
      where: { id: params.id },
    })

    if (!existingPerson) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    // Check for duplicate name (excluding current person)
    const allPeople = await prisma.person.findMany({
      where: {
        NOT: {
          id: params.id,
        },
      },
    })

    const duplicate = allPeople.find(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    )

    if (duplicate) {
      return NextResponse.json(
        { error: 'A person with this name already exists' },
        { status: 409 }
      )
    }

    const updatedPerson = await prisma.person.update({
      where: { id: params.id },
      data: {
        name: trimmedName,
        icon: icon || existingPerson.icon,
      },
    })

    return NextResponse.json(updatedPerson)
  } catch (error) {
    console.error('Error updating person:', error)
    return NextResponse.json(
      { error: 'Failed to update person' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const person = await prisma.person.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { dramas: true },
        },
      },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    // Prevent deletion if person is involved in any dramas
    if (person._count.dramas > 0) {
      return NextResponse.json(
        { error: 'Cannot delete person who is involved in dramas' },
        { status: 400 }
      )
    }

    await prisma.person.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting person:', error)
    return NextResponse.json(
      { error: 'Failed to delete person' },
      { status: 500 }
    )
  }
}
