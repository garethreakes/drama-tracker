import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

async function globalSetup() {
  // Set DATABASE_URL for test - uses a separate test database
  const testDatabaseUrl = 'postgresql://postgres:postgres@localhost:5432/drama_tracker_test'
  process.env.DATABASE_URL = testDatabaseUrl

  // Drop and recreate test database
  try {
    execSync('dropdb drama_tracker_test --if-exists', {
      env: { ...process.env, PGUSER: 'postgres', PGPASSWORD: 'postgres' },
    })
  } catch (e) {
    // Ignore errors if database doesn't exist
  }

  execSync('createdb drama_tracker_test', {
    env: { ...process.env, PGUSER: 'postgres', PGPASSWORD: 'postgres' },
  })

  // Run migrations
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
  })

  // Seed test database
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: testDatabaseUrl,
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
