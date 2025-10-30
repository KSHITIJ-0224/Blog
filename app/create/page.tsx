'use client';
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function generateSlug(title: string) {
  return title.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-');
}

export default function CreatePostPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    published: false,
    categoryIds: [] as number[],
  });
  const [error, setError] = useState('');
  const { data: user } = trpc.auth.me.useQuery();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => router.push('/login'),
  });
  const { data: categories, isLoading } = trpc.categories.list.useQuery();
  const createPost = trpc.posts.create.useMutation({
    onSuccess: () => router.push('/dashboard'),
    onError: (err) => setError(err.message || 'Failed to create post'),
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.content) {
      setError('Title, slug, and content are required');
      return;
    }
    const cleanSlug = generateSlug(form.slug);
    createPost.mutate({ ...form, slug: cleanSlug });
  };

  const toggleCategory = (id: number) => {
    setForm(old => ({
      ...old,
      categoryIds: old.categoryIds.includes(id)
        ? old.categoryIds.filter(cid => cid !== id)
        : [...old.categoryIds, id],
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
        <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">BlogPlatform</Link>
            <nav className="flex items-center space-x-8 font-semibold text-gray-700 dark:text-gray-300">
              <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
              <Link href="/dashboard" className="hover:text-indigo-600 transition">Dashboard</Link>
              <Link href="/create" className="hover:text-indigo-600 transition">Create Post</Link>
              <button
                aria-label="Toggle Dark Mode"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                {dropdownOpen ? '🌞' : '🌙'}
              </button>
              {user && user.name ? (
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Profile menu"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>
                </div>
              ) : (
                <Link href="/login" className="ml-4 text-blue-600 hover:underline">Login</Link>
              )}
            </nav>
          </div>
        </header>
        <p>Loading...</p>
        <footer className="bg-gray-900 dark:bg-gray-800 text-gray-400 dark:text-gray-500 py-16 px-6 text-center mt-20">
          <p>© 2025 BlogPlatform. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">BlogPlatform</Link>
          <nav className="flex items-center space-x-8 font-semibold text-gray-700 dark:text-gray-300">
            <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
            <Link href="/dashboard" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-500">Dashboard</Link>
            <Link href="/create" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-500">Create Post</Link>
            <button
              aria-label="Toggle Dark Mode"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {dropdownOpen ? '🌞' : '🌙'}
            </button>
            {user && user.name ? (
              <div className="relative">
                <button
                  type="button"
                  aria-label="Profile menu"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>
              </div>
            ) : (
              <Link href="/login" className="ml-4 text-blue-600 hover:underline">Login</Link>
            )}
          </nav>
        </div>
      </header>

      <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 text-center overflow-hidden">
        <h2 className="text-4xl font-extrabold mb-4">Create Your Story</h2>
        <p className="max-w-2xl mx-auto text-lg">Share your ideas and insights with our community</p>
      </section>

      <main className="max-w-2xl mx-auto p-6 flex-1">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="My Awesome Blog Post"
            />
            <button
              type="button"
              className="text-xs mt-2 text-indigo-600 dark:text-indigo-400 hover:underline"
              onClick={() => setForm(old => ({ ...old, slug: generateSlug(old.title) }))}
              disabled={!form.title}
            >
              Auto-generate slug
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Slug *</label>
            <input
              type="text"
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="my-awesome-blog-post"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Content *</label>
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 rounded-lg h-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your content here..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Categories</label>
            <div className="space-y-3">
              {categories?.map((cat) => (
                <label key={cat.id} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.categoryIds.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="ml-3 text-sm">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="published" className="ml-3 text-sm font-medium cursor-pointer">
              Publish immediately
            </label>
          </div>

          {error && <p className="text-red-600 mb-6 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={createPost.isPending}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 font-semibold disabled:opacity-50 transition"
          >
            {createPost.isPending ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </main>

      <footer className="bg-gray-900 dark:bg-gray-800 text-gray-400 dark:text-gray-500 py-16 px-6 text-center mt-20">
        <p>© 2025 BlogPlatform. All rights reserved.</p>
      </footer>
    </div>
  );
}
