import { ArrowRight, Plus } from 'lucide-react';
import type { AnalysisDocument } from '../../../shared/types';
import { EmptyState, VerdictBadge } from '../common/StateViews';

interface DashboardViewProps {
  analyses: AnalysisDocument[];
  isLoading: boolean;
  onAnalyzeNewIdea: () => void;
  onOpenReport: (id: string) => void;
  onViewAllAnalyses: () => void;
  onViewSampleReport: () => void;
}

export function DashboardView({
  analyses,
  isLoading,
  onAnalyzeNewIdea,
  onOpenReport,
  onViewAllAnalyses,
  onViewSampleReport,
}: DashboardViewProps) {
  const totalCount = analyses.length;
  const averageScore =
    totalCount > 0
      ? Math.round(
          analyses.reduce((sum, item) => sum + item.reportJson.overallScore, 0) / totalCount
        )
      : null;
  const promisingCount = analyses.filter(
    (item) => item.reportJson.verdict === 'Promising'
  ).length;
  const recentAnalyses = analyses.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Header */}
      <section className="rounded-xl border border-slate-800 bg-[#111827] p-6 sm:p-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1.5 max-w-2xl">
          <h1 className="font-display text-2xl font-bold text-white">
            Founder Validation Workspace
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Submit an early startup concept for heuristic rubric scoring, customer discovery scripts, competitor landscape mapping, and a scoped MVP roadmap.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onAnalyzeNewIdea}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Analyze New Idea
          </button>
          <button
            type="button"
            onClick={onViewSampleReport}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            Sample Report
          </button>
        </div>
      </section>

      {/* Summary Metric Cards (strictly derived from real saved reports) */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
          <div className="text-xs font-medium text-slate-400">Saved Analyses</div>
          <div className="mt-2 font-mono text-3xl font-bold text-slate-100 tabular-nums">
            {totalCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">Persisted on server</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
          <div className="text-xs font-medium text-slate-400">Average Heuristic Score</div>
          <div className="mt-2 font-mono text-3xl font-bold text-slate-100 tabular-nums">
            {averageScore !== null ? `${averageScore}/100` : '—'}
          </div>
          <div className="mt-1 text-xs text-slate-500">Across saved reports</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
          <div className="text-xs font-medium text-slate-400">Promising Verdicts</div>
          <div className="mt-2 font-mono text-3xl font-bold text-slate-100 tabular-nums">
            {promisingCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {totalCount > 0 ? `${totalCount - promisingCount} needing validation or high risk` : 'No analyses evaluated yet'}
          </div>
        </div>
      </section>

      {/* Recent Analyses or Empty State */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-100">
            Recent Analyses
          </h2>
          {totalCount > 0 && (
            <button
              type="button"
              onClick={onViewAllAnalyses}
              className="inline-flex items-center gap-1 text-xs font-medium text-violet-300 hover:text-violet-200"
            >
              View all ({totalCount})
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 rounded-lg bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : recentAnalyses.length === 0 ? (
          <EmptyState
            title="No startup analyses saved yet"
            description="Submit your first startup idea to generate a Gemini-powered score breakdown, market hypotheses, competitor landscape, MVP priorities, and roadmap."
            primaryLabel="Analyze First Idea"
            onPrimaryAction={onAnalyzeNewIdea}
            secondaryLabel="Inspect Sample Report"
            onSecondaryAction={onViewSampleReport}
          />
        ) : (
          <div className="rounded-xl border border-slate-800 bg-[#111827] divide-y divide-slate-800">
            {recentAnalyses.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenReport(item.id)}
                className="w-full text-left px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-800/40 transition-colors"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-display text-sm font-semibold text-slate-100 truncate">
                      {item.ideaName}
                    </span>
                    <VerdictBadge verdict={item.reportJson.verdict} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span>{item.industry || 'General'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{item.currentStage}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="font-mono text-sm font-semibold text-slate-200 tabular-nums">
                    {item.reportJson.overallScore}/100
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
