'use client';
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { calculateReadingTime, getWordCount } from '@/lib/utils';


function PostListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border p-4 rounded animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2 w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
}


export default function DashboardPage() {
  const router = useRouter();
  const { data: posts, isLoading, refetch } = trpc.posts.myPosts.useQuery();
  const { data: user } = trpc.auth.me.useQuery();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => router.push('/login'),
  });


  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // NEW: dropdown state


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


  const deletePost = trpc.posts.delete.useMutation({
    onSuccess: () => {
      setDeletingId(null);
      setConfirmOpen(false);
      refetch();
    },
    onError: () => {
      setDeletingId(null);
      setConfirmOpen(false);
    },
  });


  const togglePublish = trpc.posts.togglePublish.useMutation({
    onMutate: (vars) => setTogglingId(vars.id),
    onSuccess: () => {
      setTogglingId(null);
      refetch();
    },
    onError: () => setTogglingId(null),
  });


  const handleDeleteClick = (id: number) => {
    setConfirmTargetId(id);
    setConfirmOpen(true);
  };


  const confirmDelete = () => {
    if (confirmTargetId !== null) {
      setDeletingId(confirmTargetId);
      deletePost.mutate({ id: confirmTargetId });
    }
  };


  const cancelDelete = () => {
    setConfirmOpen(false);
    setConfirmTargetId(null);
  };


  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <PostListSkeleton />
      </main>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      {/* Header - UPDATED */}
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">BlogPlatform</Link>
          
          <nav className="flex items-center space-x-8 font-semibold text-gray-700 dark:text-gray-300">
            <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
            <Link href="/dashboard" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-500">Dashboard</Link>
            <Link href="/create" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-500">Create Post</Link>

            {/* Dark Mode Toggle */}
            <button
              aria-label="Toggle Dark Mode"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {darkMode ? '🌞' : '🌙'}
            </button>

            {/* User Profile Dropdown - NEW */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {/* User Name */}
                  <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                  {/* Dropdown Arrow */}
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg py-2 z-30">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>

                    {/* Dropdown Options */}
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

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>

                    {/* Logout Button */}
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
            )}
          </nav>
        </div>
      </header>


      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Posts</h1>
          <Link href="/create" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Create Post
          </Link>
        </div>
        {posts && posts.length === 0 ? (
          <p className="text-gray-500">
            No posts yet. <Link href="/create" className="text-blue-600">Create one!</Link>
          </p>
        ) : (
          <div className="space-y-4">
            {posts?.map((post) => (
              <div key={post.id} className="border p-4 rounded bg-white dark:bg-gray-800">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{post.title}</h2>
                    <p className="text-gray-500 text-sm">
                      Status: {post.published ? '✓ Published' : '◯ Draft'}
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex justify-between">
                      <span>{getWordCount(post.content)} words</span>
                      <span>{calculateReadingTime(post.content)} min read</span>
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button
                      disabled={togglingId === post.id}
                      onClick={() => togglePublish.mutate({ id: post.id })}
                      className={`text-purple-600 hover:underline ${togglingId === post.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {togglingId === post.id ? 'Toggling...' : post.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <Link href={`/edit/${post.id}`} className="text-blue-600 hover:underline">Edit</Link>
                    <button
                      disabled={deletingId === post.id}
                      className={`text-red-600 hover:underline ${deletingId === post.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleDeleteClick(post.id)}
                    >
                      {deletingId === post.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-200 mt-2">{post.content.substring(0, 100)}...</p>
              </div>
            ))}
          </div>
        )}


        {/* Confirm Delete Modal */}
        {confirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 border rounded shadow-lg p-8 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4 text-red-700">Confirm Delete</h3>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                Are you sure you want to permanently delete this post? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
                  onClick={cancelDelete}
                  disabled={deletingId !== null}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                  onClick={confirmDelete}
                  disabled={deletingId !== null}
                >
                  {deletingId === confirmTargetId ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}


      </main>


      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-800 text-gray-400 dark:text-gray-500 py-16 px-6 text-center mt-20">
        <p>© 2025 BlogPlatform. All rights reserved.</p>
      </footer>
    </div>
  );
}
