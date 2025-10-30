'use client';
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-');
}

function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse max-w-2xl mx-auto p-6">
      <div className="h-10 bg-gray-200 rounded w-full"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
      <div className="h-32 bg-gray-200 rounded w-full"></div>
      <div className="h-10 bg-gray-200 rounded w-32"></div>
    </div>
  );
}

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = parseInt(params.id as string);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    published: false,
    categoryIds: [] as number[],
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: post } = trpc.posts.getById.useQuery(
    { id: postId },
    { enabled: !!postId }
  );

  // Populate form when post data is fetched
  useEffect(() => {
    if (post) {
      setForm({
        title: post.title,
        slug: post.slug,
        content: post.content,
        published: post.published,
        categoryIds: post.categories?.map((c) => c.id) || [],
      });
      setIsLoading(false);
    }
  }, [post]);

  const updatePost = trpc.posts.update.useMutation({
    onSuccess: () => {
      router.push('/dashboard');
    },
    onError: (err) => {
      setError(err.message || 'Failed to update post');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.content) {
      setError('Title, slug, and content are required');
      return;
    }
    const cleanSlug = generateSlug(form.slug);
    updatePost.mutate({
      id: postId,
      title: form.title,
      slug: cleanSlug,
      content: form.content,
      published: form.published,
      categoryIds: form.categoryIds,
    });
  };

  const toggleCategory = (id: number) => {
    setForm({
      ...form,
      categoryIds: form.categoryIds.includes(id)
        ? form.categoryIds.filter((cid) => cid !== id)
        : [...form.categoryIds, id],
    });
  };

  if (isLoading) {
    return (
      <>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              BlogPlatform
            </Link>
          </div>
        </header>
        <FormSkeleton />
        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">BlogPlatform</h3>
                <p className="text-gray-400">
                  A modern blogging platform built with Next.js 15, PostgreSQL, and tRPC.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="text-gray-400 hover:text-white">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="text-gray-400 hover:text-white">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/create" className="text-gray-400 hover:text-white">
                      Create Post
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">About</h4>
                <p className="text-gray-400">
                  Built with ❤️ using modern web technologies and best practices.
                </p>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>© 2025 BlogPlatform. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            BlogPlatform
          </Link>
          <nav className="space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
              Home
            </Link>
            <Link href="/dashboard" className="text-purple-600 hover:text-purple-700 font-medium">
              Dashboard
            </Link>
            <Link href="/create" className="text-green-600 hover:text-green-700 font-medium">
              Create Post
            </Link>
            <button className="text-red-600 hover:text-red-700 font-medium cursor-pointer">
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="My Awesome Blog Post"
            />
            <button
              type="button"
              className="text-xs mt-1 underline text-blue-600"
              onClick={() =>
                setForm((old) => ({
                  ...old,
                  slug: generateSlug(old.title),
                }))
              }
              disabled={!form.title}
            >
              Auto-generate slug
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="my-awesome-blog-post"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              className="w-full border p-2 rounded h-48"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your content here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Categories</label>
            <div className="space-y-2">
              {categories?.map((cat) => (
                <label key={cat.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.categoryIds.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="mr-2"
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="published"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            <label htmlFor="published" className="text-sm font-medium">
              Publish immediately
            </label>
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <div className="space-x-4">
            <button
              type="submit"
              disabled={updatePost.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {updatePost.isPending ? 'Updating...' : 'Update Post'}
            </button>
            <Link
              href="/dashboard"
              className="inline-block text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BlogPlatform</h3>
              <p className="text-gray-400">
                A modern blogging platform built with Next.js 15, PostgreSQL, and tRPC.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/create" className="text-gray-400 hover:text-white">
                    Create Post
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">About</h4>
              <p className="text-gray-400">
                Built with ❤️ using modern web technologies and best practices.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 BlogPlatform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
