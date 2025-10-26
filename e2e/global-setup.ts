import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

async function globalSetup() {
  const testDbPath = path.join(__dirname, '..', 'prisma', 'test.db')

  // Remove existing test database
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath)
  }

  // Set DATABASE_URL for test
  process.env.DATABASE_URL = 'file:./test.db'

  // Run migrations
  execSync('npx prisma db push', {
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  })

  // Seed test database
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./test.db',
      },
    },
  })

  try {
    // Create initial friends
    const friendNames = ['Lowri', 'Emma', 'Melissa', 'Grace', 'Ella', 'Sofia']

    for (const name of friendNames) {
      await prisma.person.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    }

    console.log('Test database seeded successfully')
  } finally {
    await prisma.$disconnect()
  }
}

export default globalSetup
