import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EditDramaForm from '@/components/EditDramaForm'

async function getDrama(id: string) {
  const drama = await prisma.drama.findUnique({
    where: { id },
    include: {
      participants: {
        orderBy: { name: 'asc' },
      },
    },
  })

  return drama
}

async function getPeople() {
  const people = await prisma.person.findMany({
    orderBy: { name: 'asc' },
  })
  return people
}

export default async function EditDramaPage({ params }: { params: { id: string } }) {
  const drama = await getDrama(params.id)

  if (!drama) {
    notFound()
  }

  const people = await getPeople()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Drama</h1>
        <EditDramaForm drama={drama} allPeople={people} />
      </div>
    </div>
  )
}
