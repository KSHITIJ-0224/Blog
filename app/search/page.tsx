'use client';
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const searchResults = trpc.posts.search.useQuery(
    { query },
    { enabled: query.length > 0 }
  );

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">BlogPlatform</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-6 flex-1">
        <h1 className="text-3xl font-bold mb-8">Search Posts</h1>
        <input
          className="w-full border border-indigo-200 dark:border-indigo-700 p-3 rounded-lg mb-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="text"
          placeholder="Search by title or content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <>
            <div className="space-y-4">
              {searchResults.isLoading && (
                <div className="text-gray-500">Searching...</div>
              )}
              {(searchResults.data || []).map((post) => (
                <Link key={post.id} href={`/post/${post.slug}`}>
                  <div className="border bg-white dark:bg-gray-800 p-5 rounded-lg shadow hover:shadow-lg transition">
                    <h2 className="text-xl font-bold mb-1">{post.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300">{post.content.substring(0, 140)}...</p>
                  </div>
                </Link>
              ))}
              {searchResults.data?.length === 0 && (
                <div className="text-gray-500">No posts found.</div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
