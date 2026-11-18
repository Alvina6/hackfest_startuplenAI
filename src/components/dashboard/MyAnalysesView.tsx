import { useMemo, useState } from 'react';
import { ArrowRight, Search, Trash2 } from 'lucide-react';
import type { AnalysisDocument, VerdictLabel } from '../../../shared/types';
import { EmptyState, VerdictBadge } from '../common/StateViews';

interface MyAnalysesViewProps {
  analyses: AnalysisDocument[];
  onOpenReport: (id: string) => void;
  onDeleteReport: (id: string) => Promise<void>;
  onAnalyzeNewIdea: () => void;
}

type VerdictFilter = 'all' | VerdictLabel;

export function MyAnalysesView({
  analyses,
  onOpenReport,
  onDeleteReport,
  onAnalyzeNewIdea,
}: MyAnalysesViewProps) {
  const [query, setQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<VerdictFilter>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return analyses.filter((item) => {
      const matchesVerdict =
        verdictFilter === 'all' || item.reportJson.verdict === verdictFilter;
      if (!matchesVerdict) return false;
      if (!q) return true;
      return (
        item.ideaName.toLowerCase().includes(q) ||
        item.industry.toLowerCase().includes(q) ||
        item.ideaDescription.toLowerCase().includes(q) ||
        item.targetMarket.toLowerCase().includes(q)
      );
    });
  }, [analyses, query, verdictFilter]);

  const handleConfirmDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteReport(id);
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">My Analyses</h1>
          <p className="mt-1 text-sm text-slate-400">
            Search, reopen, or remove saved startup validation reports.
          </p>
        </div>
        <button
          type="button"
          onClick={onAnalyzeNewIdea}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          Analyze New Idea
        </button>
      </div>

      {analyses.length === 0 ? (
        <EmptyState
          title="No saved analyses found"
          description="Generated reports are automatically persisted so you can revisit scores, roadmaps, and mentor conversations."
          primaryLabel="Analyze New Idea"
          onPrimaryAction={onAnalyzeNewIdea}
        />
      ) : (
        <>
          {/* Search & Verdict Filter Bar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                strokeWidth={1.75}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by idea name, industry, or market..."
                aria-label="Search saved analyses"
                className="w-full rounded-lg border border-slate-800 bg-[#111827] pl-9 pr-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-[#111827] p-1 w-fit">
              {(['all', 'Promising', 'Needs Validation', 'High Risk'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVerdictFilter(v)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    verdictFilter === v
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v === 'all' ? 'All Verdicts' : v}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-[#111827] p-8 text-center text-sm text-slate-400">
              No reports match your current search or verdict filter.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-[#111827] divide-y divide-slate-800">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onOpenReport(item.id)}
                        className="font-display text-base font-semibold text-slate-100 hover:text-violet-300 transition-colors text-left"
                      >
                        {item.ideaName}
                      </button>
                      <VerdictBadge verdict={item.reportJson.verdict} />
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 max-w-2xl">
                      {item.reportJson.executiveSummary}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{item.industry || 'General'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.targetMarket || 'Unspecified Market'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {item.chatHistory.length} mentor messages
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="font-mono text-base font-bold text-slate-100 tabular-nums mr-2">
                      {item.reportJson.overallScore}/100
                    </div>

                    {confirmDeleteId === item.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          onClick={() => void handleConfirmDelete(item.id)}
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 disabled:opacity-50"
                        >
                          {deletingId === item.id ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.id)}
                          aria-label={`Delete ${item.ideaName}`}
                          className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:border-rose-500/40 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenReport(item.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap"
                        >
                          Open Report
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
