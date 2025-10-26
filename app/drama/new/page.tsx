import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AddDramaForm from '@/components/AddDramaForm'

async function getPeople() {
  const people = await prisma.person.findMany({
    orderBy: { name: 'asc' },
  })
  return people
}

export default async function NewDramaPage() {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Drama</h1>
        <AddDramaForm initialPeople={people} />
      </div>
    </div>
  )
}
