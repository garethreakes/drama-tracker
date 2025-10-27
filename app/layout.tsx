import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import UserMenu from "@/components/UserMenu";

export const metadata: Metadata = {
  title: "Drama Tracker",
  description: "Track drama among friends",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUser = await getSessionUser();

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          {sessionUser && (
            <header className="gradient-purple-pink shadow-md border-t-8 border-b-4 border-pink-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h1 className="text-4xl font-black text-pink-800 drop-shadow-sm">
                    🎭 Drama Tracker 🎭
                  </h1>
                  <nav className="flex space-x-2">
                    <Link
                      href="/"
                      className="px-4 py-2 text-sm font-bold text-pink-700 hover:text-pink-900 bg-white hover:bg-pink-50 rounded-full transition-all transform hover:scale-105 shadow"
                    >
                      🏠 Home
                    </Link>
                    <Link
                      href="/friends"
                      className="px-4 py-2 text-sm font-bold text-pink-700 hover:text-pink-900 bg-white hover:bg-pink-50 rounded-full transition-all transform hover:scale-105 shadow"
                    >
                      👥 Friends
                    </Link>
                    <Link
                      href="/statistics"
                      className="px-4 py-2 text-sm font-bold text-pink-700 hover:text-pink-900 bg-white hover:bg-pink-50 rounded-full transition-all transform hover:scale-105 shadow"
                    >
                      📊 Stats
                    </Link>
                  </nav>
                  <UserMenu user={sessionUser} />
                </div>
              </div>
            </header>
          )}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
