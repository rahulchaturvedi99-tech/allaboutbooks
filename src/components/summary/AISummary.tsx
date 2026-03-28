import { useState } from 'react';
import { Book } from '@/types';
import { generateBookSummary } from '@/lib/aiSummary';
import { supabase } from '@/lib/supabase';
import { Sparkles, RefreshCw, Lock, Zap, CheckCircle, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AISummaryProps {
  book: Book;
  authorName?: string;
  onSummaryGenerated?: (short: string, long: string) => void;
}

type SummaryTab = 'short' | 'long';

export function AISummary({ book, authorName, onSummaryGenerated }: AISummaryProps) {
  const [tab, setTab] = useState<SummaryTab>('short');
  const [isGenerating, setIsGenerating] = useState(false);
  const [shortSummary, setShortSummary] = useState(book.short_summary || '');
  const [longSummary, setLongSummary] = useState(book.long_summary || '');
  const [error, setError] = useState('');

  const hasSummary = tab === 'short' ? !!shortSummary : !!longSummary;
  const currentSummary = tab === 'short' ? shortSummary : longSummary;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const result = await generateBookSummary(
        book.title,
        authorName || 'Unknown Author',
        book.description || '',
        book.language as 'english' | 'hindi',
        book.genre || [],
        book.pages || 0
      );

      setShortSummary(result.short);
      setLongSummary(result.long);

      // Save to database
      const { error: dbError } = await supabase
        .from('books')
        .update({
          short_summary: result.short,
          long_summary: result.long,
        })
        .eq('id', book.id);

      if (dbError) {
        console.error('Failed to save summary:', dbError);
      }

      onSummaryGenerated?.(result.short, result.long);
    } catch (err: any) {
      console.error('Summary generation error:', err);
      setError(err.message || 'Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-gray-900">AI Summary</h3>
            <p className="text-[11px] text-gray-400">Powered by Claude AI</p>
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTab('short')}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1',
              tab === 'short'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Zap className="w-3 h-3" />
            Quick
          </button>
          <button
            onClick={() => setTab('long')}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1',
              tab === 'long'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <BookOpen className="w-3 h-3" />
            Deep Dive
          </button>
        </div>
      </div>

      {/* Read time badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2.5 py-0.5 bg-violet-50 text-violet-600 rounded-full text-[10px] font-bold">
          {tab === 'short' ? '1 min read' : '3-5 min read'}
        </span>
        <span className="text-[11px] text-gray-400">
          {tab === 'short' ? 'Key insights & overview' : 'Comprehensive analysis'}
        </span>
      </div>

      {/* Content */}
      {hasSummary ? (
        <div className="animate-fade-in">
          {/* Summary text */}
          <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
            {currentSummary.split('\n').map((para, i) => (
              para.trim() ? <p key={i} className="mb-3 last:mb-0">{para}</p> : null
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              AI-generated summary • Not a substitute for reading the book
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
            >
              {isGenerating ? (
                <><RefreshCw className="w-3 h-3 animate-spin" /> Regenerating...</>
              ) : (
                <><RefreshCw className="w-3 h-3" /> Regenerate</>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Generate button */
        <div className="text-center py-8">
          {error ? (
            <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-50 to-orange-50 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-violet-400" />
              </div>
              <p className="text-gray-500 text-sm mb-1">
                {tab === 'short'
                  ? 'Get the key insights in 1 minute'
                  : 'Deep analysis with themes, takeaways & more'}
              </p>
              <p className="text-gray-400 text-xs mb-5">
                AI will analyze "{book.title}" and generate a {tab === 'short' ? 'concise' : 'detailed'} summary
              </p>
            </>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all',
              isGenerating
                ? 'bg-gray-100 text-gray-400 cursor-wait'
                : 'bg-gradient-to-r from-violet-500 to-violet-600 text-white hover:from-violet-600 hover:to-violet-700 shadow-md hover:shadow-lg active:scale-[0.98]'
            )}
          >
            {isGenerating ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Generating summary...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate {tab === 'short' ? 'Quick' : 'Deep Dive'} Summary</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
