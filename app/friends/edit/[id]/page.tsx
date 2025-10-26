import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EditFriendForm from '@/components/EditFriendForm'

async function getFriend(id: string) {
  const friend = await prisma.person.findUnique({
    where: { id },
  })
  return friend
}

export default async function EditFriendPage({ params }: { params: { id: string } }) {
  const friend = await getFriend(params.id)

  if (!friend) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-purple-900 mb-2">✏️ Edit Friend</h1>
        <p className="text-purple-700 font-semibold">Update your friend&apos;s details</p>
      </div>

      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-4 border-purple-300 p-8">
        <EditFriendForm friend={friend} />
      </div>
    </div>
  )
}
