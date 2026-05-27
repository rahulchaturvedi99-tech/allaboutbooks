'use client';

import { cn } from '@/lib/utils';
import { Target, Clock, Users, Zap, BookOpen, Star, TrendingUp, Lightbulb, Sparkles } from 'lucide-react';

interface ReadScoreData {
  readability: number;
  impact: number;
  entertainment: number;
  relevance: number;
  value: number;
  overall: number;
}

interface ReadScoreProps {
  score: ReadScoreData | null;
  readingTime?: number | null;
  bestFor?: string[] | null;
  verdict?: string | null;
}

function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;
  const color = score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : score >= 4 ? '#f97316' : '#ef4444';
  const bgColor = score >= 8 ? '#ecfdf5' : score >= 6 ? '#fffbeb' : score >= 4 ? '#fff7ed' : '#fef2f2';
  const label = score >= 9 ? 'Must Read' : score >= 7.5 ? 'Highly Rec.' : score >= 6 ? 'Worth It' : score >= 4 ? 'Maybe' : 'Skip';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={circumference - progress}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-2xl" style={{ color }}>{score.toFixed(1)}</span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">/10</span>
        </div>
      </div>
      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: bgColor, color }}>{label}</span>
    </div>
  );
}

function DimensionBar({ label, score, icon: Icon }: { label: string; score: number; icon: any }) {
  const pct = (score / 10) * 100;
  const color = score >= 8 ? 'bg-emerald-500' : score >= 6 ? 'bg-amber-500' : score >= 4 ? 'bg-orange-500' : 'bg-red-500';
  const bgColor = score >= 8 ? 'bg-emerald-50' : score >= 6 ? 'bg-amber-50' : score >= 4 ? 'bg-orange-50' : 'bg-red-50';

  return (
    <div className="flex items-center gap-3">
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', bgColor)}>
        <Icon className="w-3.5 h-3.5 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-600">{label}</span>
          <span className="text-xs font-bold text-gray-800">{score}/10</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all duration-1000 ease-out', color)} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function ReadScore({ score, readingTime, bestFor, verdict }: ReadScoreProps) {
  if (!score) return null;

  const dimensions = [
    { label: 'Readability', key: 'readability', icon: BookOpen },
    { label: 'Impact', key: 'impact', icon: Lightbulb },
    { label: 'Entertainment', key: 'entertainment', icon: Zap },
    { label: 'Relevance', key: 'relevance', icon: TrendingUp },
    { label: 'Value for Time', key: 'value', icon: Star },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
          <Target className="w-4 h-4 text-orange-600" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-gray-900">Should I Read This?</h3>
          <p className="text-[11px] text-gray-400">AI-powered reading recommendation</p>
        </div>
      </div>

      {/* Score + Dimensions */}
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Left: Overall score ring */}
        <div className="flex flex-col items-center gap-4">
          <ScoreRing score={score.overall} size={120} />
          
          {readingTime && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-bold text-blue-700">{formatTime(readingTime)} read</span>
            </div>
          )}
        </div>

        {/* Right: Dimension bars */}
        <div className="flex-1 space-y-3">
          {dimensions.map(d => (
            <DimensionBar
              key={d.key}
              label={d.label}
              score={(score as any)[d.key] || 0}
              icon={d.icon}
            />
          ))}
        </div>
      </div>

      {/* Best For tags */}
      {bestFor && bestFor.length > 0 && (
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Best For</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {bestFor.map(tag => (
              <span key={tag} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Verdict */}
      {verdict && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">AI Verdict</p>
              <p className="text-sm text-gray-700 leading-relaxed">{verdict}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}