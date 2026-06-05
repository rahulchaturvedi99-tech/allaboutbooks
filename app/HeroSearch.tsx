'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function HeroSearch() {
  const [q, setQ] = useState('');
  const router = useRouter();

  function go() {
    const term = q.trim();
    // Sends the reader to your books page with their search.
    router.push(term ? `/books?q=${encodeURIComponent(term)}` : '/books');
  }

  return (
    <div className="flex items-center w-full bg-white rounded-full shadow-sm ring-1 ring-amber-200/70 focus-within:ring-2 focus-within:ring-orange-400 transition pl-5 pr-2 py-2">
      <Search className="w-5 h-5 text-amber-700/60 flex-shrink-0" />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && go()}
        placeholder="Search a title, author, or topic…"
        className="flex-1 bg-transparent outline-none px-3 text-gray-800 placeholder:text-gray-400 text-base"
      />
      <button
        onClick={go}
        className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full px-6 py-2.5 text-sm transition"
      >
        Search
      </button>
    </div>
  );
}