import {
  ArrowRight,
  Compass,
  FileText,
  Layers,
  MessageSquare,
  ShieldAlert,
  Target,
} from 'lucide-react';
import { SAMPLE_REPORT_DOC } from '../../data/sampleReport';
import { VerdictBadge } from '../common/StateViews';

interface LandingPageProps {
  savedCount: number;
  isAuthenticated: boolean;
  onStartAnalyze: () => void;
  onViewSampleReport: () => void;
  onOpenDashboard: () => void;
}

export function LandingPage({
  savedCount,
  isAuthenticated,
  onStartAnalyze,
  onViewSampleReport,
  onOpenDashboard,
}: LandingPageProps) {
  const sample = SAMPLE_REPORT_DOC.reportJson;

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0B1120]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
          <a
            href="#top"
            className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            StartupLens AI
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
            <a href="#workflow" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
              Workflow
            </a>
            <a href="#capabilities" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
              Capabilities
            </a>
            <button
              type="button"
              onClick={onViewSampleReport}
              className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              Sample Report
            </button>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              {isAuthenticated ? `Workspace${savedCount > 0 ? ` (${savedCount})` : ''}` : 'Sign In'}
            </button>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={onStartAnalyze}
              className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition-colors whitespace-nowrap shrink-0"
            >
              Analyze My Idea
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-16 lg:pt-24 lg:pb-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-6">
              <p className="text-xs font-medium tracking-wide text-violet-300">
                From idea to informed action
              </p>
              <h1
                className="font-display font-bold tracking-tight text-white leading-[1.12]"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', textWrap: 'balance' }}
              >
                Turn an early startup idea into a structured validation plan
              </h1>
              <p className="max-w-xl text-base text-slate-300 leading-relaxed">
                Evaluate problem clarity, map competitor candidates, test business model hypotheses, scope a lean MVP, and build a 4–8 week validation roadmap before writing production code.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={onStartAnalyze}
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 whitespace-nowrap shrink-0"
                >
                  Analyze My Idea
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={onViewSampleReport}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#111827] px-5 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                >
                  Inspect Sample Report
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Explicitly separates user-provided facts, assumptions, and unverified AI hypotheses.
              </p>
            </div>

            {/* Structured Preview Card (clearly labeled Sample Preview) */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-5">
                <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-violet-300">Sample Output Preview</div>
                    <h2 className="font-display text-lg font-semibold text-slate-100">
                      {sample.ideaName}
                    </h2>
                    <div className="text-xs text-slate-400">
                      EdTech · Pakistan · Early Idea
                    </div>
                  </div>
                  <VerdictBadge verdict={sample.verdict} />
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Heuristic Score</div>
                    <div className="mt-0.5 font-mono text-3xl font-bold text-slate-100 tabular-nums">
                      {sample.overallScore}
                      <span className="text-sm font-normal text-slate-500"> / 100</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <div>6 Weighted Dimensions</div>
                    <div className="font-mono text-slate-300 mt-0.5">AI-Only Hypothesis Mode</div>
                  </div>
                </div>

                <div className="space-y-2.5 border-t border-slate-800 pt-4">
                  {sample.scoreBreakdown.slice(0, 4).map((item) => (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{item.category}</span>
                        <span className="font-mono text-slate-200 tabular-nums">{item.score}/100</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onViewSampleReport}
                  className="w-full rounded-lg border border-slate-700 bg-[#0B1120] py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Open Full Sample Report
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="border-t border-slate-800/80 bg-[#0E1526] py-16">
          <div className="mx-auto max-w-6xl px-6 space-y-10">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Structured founder workflow
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Move from an unvalidated pitch sentence to concrete discovery interviews, feature priorities, and risk mitigation in one flow.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  num: '01.',
                  title: 'Submit Idea Context',
                  body: 'Enter your concept in plain language with optional target market, stage, known competitors, and constraints.',
                },
                {
                  num: '02.',
                  title: 'Rubric-Based Assessment',
                  body: 'Gemini scores six weighted dimensions and separates verified user inputs from inferred assumptions.',
                },
                {
                  num: '03.',
                  title: 'Validation & MVP Scope',
                  body: 'Inspect customer interview questions, experiments, MoSCoW priorities, and a phased 4–8 week roadmap.',
                },
                {
                  num: '04.',
                  title: 'Contextual Mentor Q&A',
                  body: 'Ask follow-up questions about pricing, first 100 users, or scope cuts grounded directly in your report.',
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-3"
                >
                  <span className="font-mono text-sm font-semibold text-violet-400">{step.num}</span>
                  <h3 className="font-display text-base font-semibold text-slate-100">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities Bento Grid */}
        <section id="capabilities" className="mx-auto max-w-6xl px-6 py-16 space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Decision-grade analysis modules
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every report section renders from a strictly validated schema—designed for pragmatic product planning rather than motivational fluff.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
            <div className="md:col-span-3 rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-3">
              <Target className="h-5 w-5 text-violet-400" strokeWidth={1.75} />
              <h3 className="font-display text-base font-semibold text-slate-100">
                Heuristic Idea Validator & Rubric
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Weighted 0–100 scoring across Problem Clarity, Customer Clarity, Feasibility, Differentiation, Business Potential, and Validation Readiness with explicit uncertainty notes.
              </p>
            </div>

            <div className="md:col-span-3 rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-3">
              <Compass className="h-5 w-5 text-teal-400" strokeWidth={1.75} />
              <h3 className="font-display text-base font-semibold text-slate-100">
                Market Hypotheses & Discovery Scripts
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Primary and secondary segments, adoption barriers, non-leading interview questions, and concrete validation experiments with clear success signals.
              </p>
            </div>

            <div className="md:col-span-2 rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-3">
              <Layers className="h-5 w-5 text-violet-400" strokeWidth={1.75} />
              <h3 className="font-display text-base font-semibold text-slate-100">
                Competitor & SWOT Matrix
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Distinguishes user-provided competitors from unverified AI candidates so you know exactly what still needs verification.
              </p>
            </div>

            <div className="md:col-span-2 rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-3">
              <FileText className="h-5 w-5 text-teal-400" strokeWidth={1.75} />
              <h3 className="font-display text-base font-semibold text-slate-100">
                MVP Priorities & Roadmap
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                MoSCoW feature breakdown, explicit out-of-scope exclusions, and a configurable 4, 6, or 8-week milestone plan.
              </p>
            </div>

            <div className="md:col-span-2 rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-3">
              <ShieldAlert className="h-5 w-5 text-amber-400" strokeWidth={1.75} />
              <h3 className="font-display text-base font-semibold text-slate-100">
                Risk Register & Pitch Outline
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Severity/likelihood risk matrix with early warning signs, plus an 8-slide pitch deck outline and printable PDF export.
              </p>
            </div>

            <div className="md:col-span-6 rounded-xl border border-slate-800 bg-[#111827] p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5">
                <MessageSquare className="h-5 w-5 text-violet-400 mt-0.5 shrink-0" strokeWidth={1.75} />
                <div>
                  <h3 className="font-display text-base font-semibold text-slate-100">
                    Contextual Startup Mentor
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed max-w-2xl">
                    Continue interrogating your report in natural language. Ask which assumption to test first, what to cut from your MVP, or how to acquire your first 100 users.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onStartAnalyze}
                className="rounded-lg bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-violet-500 transition-colors whitespace-nowrap shrink-0"
              >
                Analyze Your Idea
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-800/80 py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
          <div>StartupLens AI · From idea to informed action.</div>
          <div>
            Heuristic AI analysis for early planning only. Does not constitute legal, tax, or investment advice.
          </div>
        </div>
      </footer>
    </div>
  );
}
