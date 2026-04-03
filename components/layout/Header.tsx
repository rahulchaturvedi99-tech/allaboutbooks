'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Search, Home, Library, Users, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/books', label: 'Browse', icon: Library },
  { href: '/authors', label: 'Authors', icon: Users },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold text-gray-900 leading-none tracking-tight">AllAboutBooks</span>
            <span className="text-[10px] font-bold text-orange-500 tracking-widest uppercase">AI Summaries</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
              pathname === href ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            )}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/books" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-orange-300 transition-all text-sm text-gray-400">
            <Search className="w-4 h-4" /><span className="hidden sm:inline">Search books...</span>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-50">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-gray-100 bg-white px-4 py-3">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
              pathname === href ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
            )}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
