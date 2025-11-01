"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

function PostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-5/6"></div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => router.push("/login"),
  });

  const { data: categories } = trpc.categories.list.useQuery();

  const postsQuery = selectedCategory
    ? trpc.posts.listByCategory.useQuery({ slug: selectedCategory })
    : trpc.posts.list.useQuery();

  const posts = postsQuery.data || [];
  const isLoading = postsQuery.isLoading;
  const error = postsQuery.error;

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      if (saved === "true") setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      root.classList.remove("dark");
      localStorage.removeItem("darkMode");
    }
  }, [darkMode]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return (
      <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, idx) => (
          <PostCardSkeleton key={idx} />
        ))}
      </main>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">BlogPlatform</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, idx) => (
            <PostCardSkeleton key={idx} />
          ))}
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <main className="p-6 text-center text-red-600">
        Error loading posts: {error.message}
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">BlogPlatform</h1>
          <nav className="flex items-center space-x-8 font-semibold text-gray-700 dark:text-gray-300">
            <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
            <Link href="/dashboard" className="hover:text-indigo-600 transition">Dashboard</Link>
            <Link href="/create" className="text-indigo-600 hover:text-indigo-700 transition font-bold">
              Create Post
            </Link>
            <button
              aria-label="Toggle Dark Mode"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {darkMode ? "🌞" : "🌙"}
            </button>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg py-2 z-30">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    href="/create"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    ✍️ Create Post
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout.mutate();
                    }}
                    disabled={logout.isPending}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center space-x-2"
                  >
                    <span>🚪</span>
                    <span>{logout.isPending ? "Logging out..." : "Logout"}</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 flex-grow w-full">
        <h2 className="text-4xl font-bold mb-2">All blog posts</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-12">Discover amazing content from our community</p>

        {categories && categories.length > 0 && (
          <div className="mb-12">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  !selectedCategory 
                    ? "bg-indigo-600 text-white" 
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedCategory === category.slug 
                      ? "bg-indigo-600 text-white" 
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <section>
          {!posts || posts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-300 text-lg mb-4">No posts yet. Be the first to write!</p>
              <Link href="/create" className="inline-block text-indigo-600 hover:text-indigo-700 font-medium">
                Create your first post →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Post header with title initial */}
                  <Link href={`/post/${post.slug}`}>
                    <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                        {post.title.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </Link>

                  <div className="p-6 flex flex-col flex-grow">
                    {/* Author and Date */}
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span className="font-medium">{post.authorName}</span>
                      <span className="mx-2">•</span>
                      <span>
                        {post.publishedAt
                          ? format(new Date(post.publishedAt), 'MMM d, yyyy')
                          : 'Draft'}
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={`/post/${post.slug}`}>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 hover:text-indigo-600 dark:hover:text-indigo-400 transition line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm flex-grow">
                      {post.excerpt || post.content.substring(0, 150)}...
                    </p>

                    {/* Categories Tags */}
                    {post.categories && post.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.categories.slice(0, 3).map((category) => (
                          <span
                            key={category.id}
                            className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Read More Link */}
                    <Link
                      href={`/post/${post.slug}`}
                      className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-500 font-medium text-sm mt-auto"
                    >
                      Read article
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        {posts && posts.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Previous
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={`w-10 h-10 rounded ${
                  page === 1 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Next
            </button>
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 px-6 text-center text-gray-600 dark:text-gray-400">
        <p>© 2025 BlogPlatform. All rights reserved.</p>
      </footer>
    </div>
  );
}
