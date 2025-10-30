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
    // Create initial friends with passwords for testing
    const bcrypt = require('bcrypt')
    const friendNames = ['Lowri', 'Emma', 'Melissa', 'Grace', 'Ella', 'Sofia']
    const testPassword = await bcrypt.hash('test123', 10)

    for (const name of friendNames) {
      await prisma.person.upsert({
        where: { name },
        update: { password: testPassword },
        create: { name, password: testPassword },
      })
    }

    // Create a test drama for voting tests
    const lowri = await prisma.person.findUnique({ where: { name: 'Lowri' } })
    const emma = await prisma.person.findUnique({ where: { name: 'Emma' } })
    const melissa = await prisma.person.findUnique({ where: { name: 'Melissa' } })

    if (lowri && emma && melissa) {
      await prisma.drama.create({
        data: {
          title: 'Test Drama for Voting',
          details: 'This is a test drama to verify voting functionality',
          severity: 3,
          createdAt: new Date(),
          isFinished: false,
          participants: {
            connect: [
              { id: lowri.id },
              { id: emma.id },
              { id: melissa.id },
            ],
          },
        },
      })
    }

    console.log('Test database seeded successfully')
  } finally {
    await prisma.$disconnect()
  }
}

export default globalSetup
