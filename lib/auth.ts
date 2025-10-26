import { cookies } from 'next/headers'
import { prisma } from './prisma'

const SESSION_COOKIE_NAME = 'drama_tracker_session'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

export interface SessionUser {
  id: string
  name: string
  icon: string
  isAdmin: boolean
}

/**
 * Hash a password using a simple method
 * Note: In production, use bcrypt or similar
 */
export function hashPassword(password: string): string {
  // Simple hash for demo - in production use bcrypt
  return Buffer.from(password).toString('base64')
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

/**
 * Get the current session user from cookies
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionUserId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionUserId) {
    return null
  }

  const user = await prisma.person.findUnique({
    where: { id: sessionUserId },
    select: {
      id: true,
      name: true,
      icon: true,
      isAdmin: true,
    },
  })

  return user
}

/**
 * Create a session for a user
 */
export async function createSession(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/',
  })
}

/**
 * Destroy the current session
 */
export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Authenticate a user with name and password
 */
export async function authenticateUser(name: string, password: string): Promise<SessionUser | null> {
  // Get all users and do case-insensitive comparison in JavaScript
  // SQLite doesn't support mode: 'insensitive'
  const allUsers = await prisma.person.findMany({
    select: {
      id: true,
      name: true,
      icon: true,
      password: true,
      isAdmin: true,
    },
  })

  const user = allUsers.find(
    (u) => u.name.toLowerCase() === name.toLowerCase()
  )

  if (!user || !user.password) {
    return null
  }

  if (!verifyPassword(password, user.password)) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    icon: user.icon,
    isAdmin: user.isAdmin,
  }
}
