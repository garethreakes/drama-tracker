import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user from cookie
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get('userId')

    if (!userIdCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userId = userIdCookie.value
    const dramaId = params.id

    // Verify drama exists
    const drama = await prisma.drama.findUnique({
      where: { id: dramaId },
    })

    if (!drama) {
      return NextResponse.json(
        { error: 'Drama not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { severity, comment } = body

    // Validation
    if (typeof severity !== 'number' || severity < 1 || severity > 5) {
      return NextResponse.json(
        { error: 'Severity must be a number between 1 and 5' },
        { status: 400 }
      )
    }

    // Create or update the vote
    const vote = await prisma.dramaSeverityVote.upsert({
      where: {
        dramaId_personId: {
          dramaId,
          personId: userId,
        },
      },
      update: {
        severity,
        comment: comment || null,
      },
      create: {
        dramaId,
        personId: userId,
        severity,
        comment: comment || null,
      },
      include: {
        person: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    })

    // Calculate new average severity
    const allVotes = await prisma.dramaSeverityVote.findMany({
      where: { dramaId },
    })

    const averageSeverity = Math.round(
      allVotes.reduce((sum, v) => sum + v.severity, 0) / allVotes.length
    )

    // Update drama severity
    await prisma.drama.update({
      where: { id: dramaId },
      data: { severity: averageSeverity },
    })

    return NextResponse.json({
      vote,
      averageSeverity,
      totalVotes: allVotes.length,
    })
  } catch (error) {
    console.error('Error creating vote:', error)
    return NextResponse.json(
      { error: 'Failed to create vote' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dramaId = params.id

    // Get all votes for this drama
    const votes = await prisma.dramaSeverityVote.findMany({
      where: { dramaId },
      include: {
        person: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get all people (friends) to see who hasn't voted
    const allPeople = await prisma.person.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
      },
      orderBy: { name: 'asc' },
    })

    const votedPersonIds = new Set(votes.map(v => v.personId))
    const pendingVoters = allPeople.filter(p => !votedPersonIds.has(p.id))

    // Calculate statistics
    const totalVotes = votes.length
    const averageSeverity = totalVotes > 0
      ? votes.reduce((sum, v) => sum + v.severity, 0) / totalVotes
      : 0

    // Get vote distribution
    const distribution = [1, 2, 3, 4, 5].map(severity => ({
      severity,
      count: votes.filter(v => v.severity === severity).length,
      voters: votes
        .filter(v => v.severity === severity)
        .map(v => ({ name: v.person.name, icon: v.person.icon })),
    }))

    // Get current user's vote
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get('userId')
    const currentUserVote = userIdCookie
      ? votes.find(v => v.personId === userIdCookie.value)
      : null

    return NextResponse.json({
      votes,
      averageSeverity,
      totalVotes,
      totalPeople: allPeople.length,
      pendingVoters,
      distribution,
      currentUserVote,
    })
  } catch (error) {
    console.error('Error fetching votes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    )
  }
}
