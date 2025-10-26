import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const people = await prisma.person.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(people)
  } catch (error) {
    console.error('Error fetching people:', error)
    return NextResponse.json(
      { error: 'Failed to fetch people' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Check for case-insensitive duplicate
    const allPeople = await prisma.person.findMany()
    const existing = allPeople.find(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    )

    if (existing) {
      return NextResponse.json(
        { error: 'A person with this name already exists' },
        { status: 409 }
      )
    }

    const person = await prisma.person.create({
      data: {
        name: trimmedName,
        icon: icon || '👤'
      },
    })

    return NextResponse.json(person, { status: 201 })
  } catch (error) {
    console.error('Error creating person:', error)
    return NextResponse.json(
      { error: 'Failed to create person' },
      { status: 500 }
    )
  }
}
