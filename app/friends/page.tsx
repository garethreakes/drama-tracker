import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AddFriendForm from '@/components/AddFriendForm'
import PasswordChangeForm from '@/components/PasswordChangeForm'
import { format } from 'date-fns'
import { getSessionUser } from '@/lib/auth'

async function getPeople() {
  const people = await prisma.person.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          dramas: true,
        },
      },
    },
  })
  return people
}

export const dynamic = 'force-dynamic'

export default async function ManageFriendsPage() {
  const people = await getPeople()
  const sessionUser = await getSessionUser()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="mb-6">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← Back to Home
        </Link>
      </div>

      <div>
        <h1 className="text-4xl font-black text-purple-900 mb-2">👥 Manage Friends 👥</h1>
        <p className="text-purple-700 font-semibold">Add new friends and view your friend list</p>
      </div>

      {/* Add Friend Section */}
      <section className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-4 border-purple-300 p-8">
        <h2 className="text-2xl font-black text-purple-900 mb-4">✨ Add New Friend ✨</h2>
        <div className="max-w-md">
          <AddFriendForm />
        </div>
      </section>

      {/* Friends List Section */}
      <section className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-4 border-purple-300 p-8">
        <h2 className="text-2xl font-black text-purple-900 mb-4">
          ✨ All Friends ({people.length}) ✨
        </h2>

        {people.length === 0 ? (
          <p className="text-purple-700 text-center py-8 font-semibold">
            No friends added yet. Add your first friend above! 👆
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {people.map((person) => (
              <div
                key={person.id}
                className="relative p-5 bg-white rounded-xl shadow-lg hover:shadow-xl border-3 border-purple-200 hover:border-purple-300 transition-all"
              >
                <div className="absolute top-3 right-3 z-10">
                  <Link
                    href={`/friends/edit/${person.id}`}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-purple-600 hover:text-purple-700 shadow-md transition-all transform hover:scale-110"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </Link>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-4xl flex-shrink-0">{person.icon}</div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-purple-900">{person.name}</h3>
                      {person.isAdmin && (
                        <span className="px-2 py-0.5 text-xs font-black bg-yellow-400 text-purple-900 rounded-full shadow-md">
                          👑 ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-purple-600 font-semibold mt-1">
                      Added {format(new Date(person.createdAt), 'MMM d, yyyy')}
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-purple-200 text-purple-800 shadow">
                        🎭 {person._count.dramas} {person._count.dramas === 1 ? 'drama' : 'dramas'}
                      </span>
                    </div>
                    {sessionUser && (sessionUser.id === person.id || sessionUser.isAdmin) && (
                      <PasswordChangeForm
                        personId={person.id}
                        personName={person.name}
                        canChange={true}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
