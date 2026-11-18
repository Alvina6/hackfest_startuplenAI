import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import type { VerdictLabel } from '../../../shared/types';

export function VerdictBadge({ verdict }: { verdict: VerdictLabel }) {
  if (verdict === 'Promising') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 whitespace-nowrap shrink-0">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.75} />
        Promising
      </span>
    );
  }
  if (verdict === 'Needs Validation') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 whitespace-nowrap shrink-0">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" strokeWidth={1.75} />
        Needs Validation
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 whitespace-nowrap shrink-0">
      <ShieldAlert className="h-3.5 w-3.5 text-rose-400" strokeWidth={1.75} />
      High Risk
    </span>
  );
}

export function AnalysisLoadingState({ ideaName }: { ideaName?: string }) {
  const steps = [
    'Evaluating problem clarity, target customer, feasibility, and differentiation rubric',
    'Formulating market demand hypotheses, interview questions, and validation experiments',
    'Structuring competitor candidates, business models, SWOT, MVP scope, and roadmap',
    'Validating structured JSON report schema and checking uncertainty disclosures',
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827] p-8 max-w-2xl mx-auto">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10">
          <Sparkles className="h-5 w-5 text-violet-400 animate-pulse" strokeWidth={1.75} />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-display text-lg font-semibold text-slate-100">
            Generating StartupLens Analysis{ideaName ? ` for ${ideaName}` : ''}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Gemini is analyzing your concept and validating the structured report schema. This
            typically takes 30–60 seconds depending on idea complexity.
          </p>
        </div>
      </div>

      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="h-full w-1/3 rounded-full bg-violet-500 animate-[loadingBar_1.8s_ease-in-out_infinite]" />
      </div>

      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(120%); }
          100% { transform: translateX(300%); }
        }
      `}</style>

      <ul className="mt-6 space-y-3 border-t border-slate-800/80 pt-5">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-3 text-sm text-slate-300">
            <span className="mt-0.5 font-mono text-xs text-violet-400 tabular-nums">
              0{index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ErrorState({
  title = 'Unable to complete request',
  message,
  onRetry,
  onSecondaryAction,
  secondaryLabel,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  onSecondaryAction?: () => void;
  secondaryLabel?: string;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-500/30 bg-[#111827] p-6 max-w-2xl mx-auto"
    >
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10">
          <ShieldAlert className="h-5 w-5 text-rose-400" strokeWidth={1.75} />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-display text-base font-semibold text-slate-100">{title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 whitespace-nowrap shrink-0"
              >
                <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
                Retry Request
              </button>
            )}
            {onSecondaryAction && secondaryLabel && (
              <button
                type="button"
                onClick={onSecondaryAction}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                {secondaryLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  primaryLabel,
  onPrimaryAction,
  secondaryLabel,
  onSecondaryAction,
}: {
  title: string;
  description: string;
  primaryLabel: string;
  onPrimaryAction: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827] px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400">
        <FileSearch className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-slate-100">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400 leading-relaxed">{description}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onPrimaryAction}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 whitespace-nowrap shrink-0"
        >
          {primaryLabel}
        </button>
        {onSecondaryAction && secondaryLabel && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
