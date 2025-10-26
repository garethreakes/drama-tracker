import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create initial friends
  const friendNames = ['Lowri', 'Emma', 'Melissa', 'Grace', 'Ella', 'Sofia']

  const friends = await Promise.all(
    friendNames.map(async (name) => {
      return prisma.person.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    })
  )

  console.log(`Created ${friends.length} friends`)

  // Create some sample dramas for testing
  const drama1 = await prisma.drama.create({
    data: {
      title: 'WhatsApp chat blew up',
      details: 'Someone sent a controversial message in the group chat and things escalated quickly.',
      participants: {
        connect: [
          { id: friends[0].id }, // Lowri
          { id: friends[1].id }, // Emma
          { id: friends[2].id }, // Melissa
        ],
      },
    },
  })

  const drama2 = await prisma.drama.create({
    data: {
      title: 'Birthday party planning disaster',
      details: 'Nobody could agree on a date or venue. Arguments ensued.',
      participants: {
        connect: [
          { id: friends[3].id }, // Grace
          { id: friends[4].id }, // Ella
        ],
      },
    },
  })

  const drama3 = await prisma.drama.create({
    data: {
      title: 'Coffee shop incident',
      details: 'An awkward encounter at Starbucks led to a full-blown disagreement about who said what.',
      participants: {
        connect: [
          { id: friends[1].id }, // Emma
          { id: friends[5].id }, // Sofia
        ],
      },
    },
  })

  const drama4 = await prisma.drama.create({
    data: {
      title: 'Group vacation planning gone wrong',
      details: 'Everyone had different ideas about where to go and budget expectations.',
      participants: {
        connect: [
          { id: friends[0].id }, // Lowri
          { id: friends[2].id }, // Melissa
          { id: friends[3].id }, // Grace
          { id: friends[5].id }, // Sofia
        ],
      },
    },
  })

  console.log(`Created 4 sample dramas`)
  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
