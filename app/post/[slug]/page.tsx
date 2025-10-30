'use client';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import Image from 'next/image';

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  let slug = params.slug as string;
  slug = decodeURIComponent(slug);

  const { data: post, isLoading, error } = trpc.posts.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white sticky top-0 z-10 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">BlogPlatform</Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
          <div className="h-10 bg-gray-300 rounded mb-4 w-3/4 dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-300 rounded mb-8 dark:bg-gray-700"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-300 rounded dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 dark:bg-gray-700"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white sticky top-0 z-10 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">BlogPlatform</Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-900 mb-2">Post Not Found</h2>
            <p className="text-red-700 mb-6">{error?.message || 'The post you are looking for does not exist.'}</p>
            <Link
              href="/"
              className="inline-block text-red-600 hover:text-red-700 font-medium"
            >
              ← Back to all posts
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">BlogPlatform</Link>
          <nav className="flex gap-4">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="text-indigo-600 hover:text-indigo-700 font-medium mb-8 inline-flex items-center gap-2"
        >
          ← Back to all posts
        </Link>

        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Cover Image Section - ✅ ADDED */}
          

          <div className="p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v2H4a2 2 0 00-2 2v2h16V7a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v2H7V3a1 1 0 00-1-1zm0 5H4v6a2 2 0 002 2h12a2 2 0 002-2V7h-2v1a1 1 0 11-2 0V7H7v1a1 1 0 11-2 0V7z" clipRule="evenodd" />
                </svg>
                <time dateTime={post.publishedAt ? new Date(post.publishedAt).toISOString() : ''}>
                  {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : 'Just now'}
                </time>
              </div>

              <div className="text-sm text-gray-500">
                ({post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true }) : 'just now'})
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
                </svg>
                <span>{calculateReadingTime(post.content)} min read</span>
              </div>
            </div>

            {post.categories && post.categories.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full hover:bg-blue-200 transition"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="prose prose-lg max-w-none mb-12">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-200 leading-relaxed text-lg">
                {post.content}
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-8 my-8 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Published on</p>
                <p className="text-gray-900 font-medium">
                  {post.publishedAt ? format(new Date(post.publishedAt), 'MMMM d, yyyy \'at\' HH:mm') : 'Recently'}
                </p>
              </div>
              <div className="flex gap-2">
                {/* Social Icons (optional) */}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <p className="text-gray-700 mb-4">Enjoyed this post?</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href="/"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Read more posts
                </Link>
                <Link
                  href="/create"
                  className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
                >
                  Write a post
                </Link>
              </div>
            </div>
          </div>
        </article>

        <div className="mt-12 mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
          >
            ← Back to all posts
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-800 text-gray-400 dark:text-gray-500 py-16 px-6 text-center mt-20">
        <p>© 2025 BlogPlatform. All rights reserved.</p>
      </footer>
    </div>
  );
}
