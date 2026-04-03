'use client';

import { useState } from 'react';
import { Sparkles, Zap, BookOpen, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Book } from '@/lib/data';

export function AISummary({ book }: { book: Book }) {
  const [tab, setTab] = useState<'short' | 'long'>('short');
  const summary = tab === 'short' ? book.short_summary : book.long_summary;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-gray-900">AI Summary</h3>
            <p className="text-[11px] text-gray-400">Powered by AI</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setTab('short')} className={cn('px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1', tab === 'short' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')}>
            <Zap className="w-3 h-3" /> Quick
          </button>
          <button onClick={() => setTab('long')} className={cn('px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1', tab === 'long' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')}>
            <BookOpen className="w-3 h-3" /> Deep Dive
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="px-2.5 py-0.5 bg-violet-50 text-violet-600 rounded-full text-[10px] font-bold">
          {tab === 'short' ? '1 min read' : '3-5 min read'}
        </span>
      </div>

      {summary ? (
        <div>
          <div className="text-gray-600 leading-relaxed text-sm">
            {summary.split('\n').map((p, i) => p.trim() ? <p key={i} className="mb-3 last:mb-0">{p}</p> : null)}
          </div>
          <div className="flex items-center gap-1.5 pt-4 mt-4 border-t border-gray-100 text-[11px] text-gray-400">
            <CheckCircle className="w-3 h-3 text-emerald-500" /> AI-generated summary
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Sparkles className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Summary coming soon</p>
        </div>
      )}
    </div>
  );
}
