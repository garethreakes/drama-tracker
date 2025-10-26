import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find Lowri
  const lowri = await prisma.person.findFirst({
    where: {
      name: {
        equals: 'Lowri',
      },
    },
  })

  if (!lowri) {
    console.log('❌ Lowri not found in database')
    return
  }

  // Set Lowri as admin
  await prisma.person.update({
    where: { id: lowri.id },
    data: { isAdmin: true },
  })

  console.log('✅ Lowri is now an admin!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
