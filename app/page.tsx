'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    router.push('/calendar');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Equipment Calendar</h1>
        <p className="text-lg mb-8 opacity-90">
          Manage your equipment rentals with ease. Check-in, check-out, and sync with HubSpot.
        </p>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-white text-blue-500 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="block w-full bg-blue-400 hover:bg-blue-500 font-bold py-3 px-4 rounded-lg transition"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-12 text-sm opacity-75">
          <p>Powered by Next.js, PostgreSQL & HubSpot Integration</p>
        </div>
      </div>
    </div>
  );
}
