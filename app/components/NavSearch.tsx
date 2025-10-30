'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';

type Result = {
  id: number;
  title: string;
  slug: string;
  content: string;
};

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function NavSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 250);

  const resultsQuery = trpc.posts.search.useQuery(
    { query: debounced },
    { enabled: debounced.length > 0 }
  );

  const results: Result[] = resultsQuery.data || [];
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setOpen(Boolean(debounced) && (resultsQuery.isFetching || results.length > 0));
    setActive(0);
  }, [debounced, resultsQuery.isFetching, results.length]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?query=${encodeURIComponent(query.trim())}`);
    setOpen(false);
    setQuery('');
  };

  const visible = useMemo(() => {
    if (!open) return [];
    return results.slice(0, 6);
  }, [open, results]);

  return (
    <div className="relative">
      <form onSubmit={onSubmit} className="relative">
        <input
          type="search"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(Boolean(debounced) && (resultsQuery.isFetching || results.length > 0))}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 w-48 max-w-xs transition"
        />
        <button
          type="submit"
          className="absolute right-1 top-1 bottom-1 px-2 text-indigo-600 hover:text-indigo-800 focus:outline-none"
          aria-label="Search"
          tabIndex={-1}
        >
          🔍
        </button>
      </form>

      {open && (
        <ul className="absolute mt-2 w-[24rem] max-w-[80vw] z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden">
          {resultsQuery.isFetching && (
            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300">Searching…</li>
          )}
          {!resultsQuery.isFetching && visible.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300">No results</li>
          )}
          {visible.map((r, idx) => {
            const isActive = idx === active;
            return (
              <li
                key={r.id}
                className={`px-3 py-2 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
                }`}
                onMouseEnter={() => setActive(idx)}
                onClick={() => {
                  setOpen(false);
                  setQuery('');
                  router.push(`/post/${r.slug}`);
                }}
              >
                <div className="text-sm font-medium">{r.title}</div>
                <div className="text-xs text-gray-500 line-clamp-1">{r.content?.slice(0, 80)}…</div>
              </li>
            );
          })}
          {visible.length > 0 && (
            <li className="px-3 py-2 text-xs text-indigo-600 dark:text-indigo-400">
              Press Enter to see all results
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
