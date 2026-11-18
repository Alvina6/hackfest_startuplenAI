import { useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  Edit3,
  Info,
  MessageSquare,
  Printer,
  X,
} from 'lucide-react';
import type { AnalysisDocument, MentorMessage } from '../../../shared/types';
import { VerdictBadge } from '../common/StateViews';
import { MentorChat } from '../mentor/MentorChat';
import { ScoreBreakdownChart } from './ScoreBreakdownChart';

type ReportTab =
  | 'overview'
  | 'market'
  | 'competitors'
  | 'business'
  | 'mvp'
  | 'risks'
  | 'pitch'
  | 'mentor';

interface ReportViewProps {
  analysis: AnalysisDocument;
  isSamplePreview?: boolean;
  onRename?: (id: string, newName: string) => Promise<void>;
  onHistoryUpdated: (id: string, chatHistory: MentorMessage[]) => void;
  onAnalyzeNewIdea: () => void;
}

const TABS: { id: ReportTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'market', label: 'Market & Validation' },
  { id: 'competitors', label: 'Competitors' },
  { id: 'business', label: 'Business & SWOT' },
  { id: 'mvp', label: 'MVP & Roadmap' },
  { id: 'risks', label: 'Risks' },
  { id: 'pitch', label: 'Pitch Deck' },
  { id: 'mentor', label: 'Startup Mentor' },
];

export function ReportView({
  analysis,
  isSamplePreview = false,
  onRename,
  onHistoryUpdated,
  onAnalyzeNewIdea,
}: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(analysis.ideaName);
  const [isSavingName, setIsSavingName] = useState(false);
  const [copiedDeck, setCopiedDeck] = useState(false);

  const report = analysis.reportJson;

  const formattedDate = new Date(report.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleSaveName = async () => {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed.length < 2 || !onRename) {
      setIsEditingName(false);
      setDraftName(analysis.ideaName);
      return;
    }
    setIsSavingName(true);
    try {
      await onRename(analysis.id, trimmed);
      setIsEditingName(false);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.ideaName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyPitchDeck = async () => {
    const markdown = report.pitchDeckOutline
      .map(
        (slide) =>
          `## Slide ${slide.slideNumber}: ${slide.title}\n${slide.keyPoints
            .map((pt) => `- ${pt}`)
            .join('\n')}\nSpeaker Note: ${slide.speakerNote}`
      )
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(`# ${analysis.ideaName} — Pitch Deck Outline\n\n${markdown}`);
      setCopiedDeck(true);
      setTimeout(() => setCopiedDeck(false), 2000);
    } catch {
      // Ignore clipboard failure silently
    }
  };

  return (
    <div className="space-y-6">
      {/* Sample Preview Banner */}
      {isSamplePreview && (
        <div className="no-print rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-violet-300 mt-0.5 shrink-0" strokeWidth={1.75} />
            <p className="text-xs sm:text-sm text-slate-200">
              <span className="font-semibold text-white">Sample Report Preview:</span> This report demonstrates the StartupLens AI output structure using the scholarship-matching demo idea. Submit your own idea to generate a live Gemini assessment.
            </p>
          </div>
          <button
            type="button"
            onClick={onAnalyzeNewIdea}
            className="rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition-colors whitespace-nowrap shrink-0"
          >
            Analyze My Idea
          </button>
        </div>
      )}

      {/* Report Header */}
      <header className="rounded-xl border border-slate-800 bg-[#111827] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={draftName}
                    maxLength={120}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleSaveName();
                      if (e.key === 'Escape') {
                        setIsEditingName(false);
                        setDraftName(analysis.ideaName);
                      }
                    }}
                    className="rounded-lg border border-violet-500 bg-[#0B1120] px-3 py-1.5 font-display text-xl font-bold text-slate-100 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => void handleSaveName()}
                    disabled={isSavingName}
                    aria-label="Save project name"
                    className="rounded-lg bg-violet-600 p-2 text-white hover:bg-violet-500"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false);
                      setDraftName(analysis.ideaName);
                    }}
                    aria-label="Cancel rename"
                    className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 min-w-0">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 truncate">
                    {analysis.ideaName}
                  </h1>
                  {!isSamplePreview && onRename && (
                    <button
                      type="button"
                      onClick={() => {
                        setDraftName(analysis.ideaName);
                        setIsEditingName(true);
                      }}
                      aria-label="Rename analysis"
                      className="no-print rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  )}
                </div>
              )}
              <VerdictBadge verdict={report.verdict} />
            </div>

            {/* Clean unboxed metadata line */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400">
              <span>{analysis.industry || 'General Industry'}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">Stage: {analysis.currentStage}</span>
              <span aria-hidden="true">·</span>
              <span>{analysis.targetMarket || 'Market Unspecified'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">Generated {formattedDate}</span>
            </div>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('mentor')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-500/10 px-3.5 py-2 text-xs font-medium text-violet-200 hover:bg-violet-500/20 transition-colors whitespace-nowrap shrink-0"
            >
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.75} />
              Ask Mentor
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Printer className="h-3.5 w-3.5" strokeWidth={1.75} />
              Export PDF
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
              JSON
            </button>
          </div>
        </div>

        {/* Explicit Heuristic + Research Mode Disclosure */}
        <div className="mt-4 border-t border-slate-800/80 pt-3.5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
          <span>{report.validationStatus}</span>
          <span className="font-mono text-slate-500 shrink-0">
            Heuristic AI Assessment · Not Investment Advice
          </span>
        </div>
      </header>

      {/* Report Tabs */}
      <nav aria-label="Report sections" className="no-print overflow-x-auto pb-1">
        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-[#111827] p-1 min-w-full sm:min-w-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Heuristic Score Card */}
            <section className="lg:col-span-4 rounded-xl border border-slate-800 bg-[#111827] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-sm font-semibold text-slate-300">
                    Heuristic Readiness Score
                  </h2>
                  <span className="font-mono text-xs text-slate-500">0–100 Scale</span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-mono text-5xl font-bold tracking-tight text-slate-100 tabular-nums">
                    {report.overallScore}
                  </span>
                  <span className="font-mono text-lg text-slate-500">/ 100</span>
                </div>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  Weighted AI rubric across Problem Clarity (20%), Customer Clarity (15%), Feasibility (20%), Differentiation (15%), Business Potential (20%), and Validation Readiness (10%).
                </p>
              </div>

              <div className="mt-6 border-t border-slate-800 pt-4">
                <h3 className="text-xs font-semibold text-slate-300 mb-2.5">
                  3 Highest-Priority Next Actions
                </h3>
                <ol className="space-y-2.5">
                  {report.nextActions.map((action, idx) => (
                    <li key={action} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <span className="font-mono font-semibold text-violet-400 tabular-nums shrink-0">
                        0{idx + 1}.
                      </span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {/* Score Breakdown Chart */}
            <section className="lg:col-span-8 rounded-xl border border-slate-800 bg-[#111827] p-6">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-display text-base font-semibold text-slate-100">
                  Rubric Score Breakdown
                </h2>
                <span className="text-xs text-slate-400">
                  Hover bars for category weightings
                </span>
              </div>
              <ScoreBreakdownChart items={report.scoreBreakdown} />
            </section>
          </div>

          {/* Executive Summary & Assumptions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-5">
              <div>
                <h2 className="font-display text-base font-semibold text-slate-100">
                  Executive Summary
                </h2>
                <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                  {report.executiveSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 border-t border-slate-800 pt-5">
                <div>
                  <h3 className="text-xs font-semibold text-teal-400 mb-2.5">Top Strengths</h3>
                  <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                    {report.topStrengths.map((s) => (
                      <li key={s} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-amber-400 mb-2.5">Top Concerns</h3>
                  <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                    {report.topConcerns.map((c) => (
                      <li key={c} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#111827] p-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-violet-400 shrink-0" strokeWidth={1.75} />
                <h2 className="font-display text-base font-semibold text-slate-100">
                  Key Assumptions & Uncertainties
                </h2>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                Statements inferred by AI or left unspecified in the submission—verify before building.
              </p>
              <ul className="mt-4 divide-y divide-slate-800/80">
                {report.assumptions.map((item) => (
                  <li key={item} className="py-2.5 text-xs text-slate-300 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}

      {/* TAB: MARKET & VALIDATION */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4">
              <h2 className="font-display text-base font-semibold text-slate-100">
                Customer Segments
              </h2>
              <div>
                <h3 className="text-xs font-semibold text-slate-400 mb-2">Primary Segments</h3>
                <ul className="space-y-2 text-sm text-slate-200">
                  {report.market.targetSegments.map((seg) => (
                    <li key={seg} className="rounded-lg border border-slate-800 bg-[#0B1120] px-3.5 py-2.5 text-xs leading-relaxed">
                      {seg}
                    </li>
                  ))}
                </ul>
              </div>
              {report.market.secondarySegments.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 mb-2">Secondary Segments</h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {report.market.secondarySegments.map((seg) => (
                      <li key={seg} className="rounded-lg border border-slate-800/70 bg-[#0B1120]/60 px-3.5 py-2 leading-relaxed">
                        {seg}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4">
              <h2 className="font-display text-base font-semibold text-slate-100">
                Jobs-to-be-Done, Pain Points & Barriers
              </h2>
              <div>
                <h3 className="text-xs font-semibold text-slate-400 mb-2">Core Pain Points</h3>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  {report.market.painPoints.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <h3 className="text-xs font-semibold text-slate-400 mb-2">Likely Adoption Barriers</h3>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  {report.market.barriers.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-slate-100">
                  Demand Hypotheses & Opportunities
                </h2>
                <span className="text-xs text-amber-300">Unverified Hypotheses</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                {[...report.market.opportunities, ...report.market.hypotheses].map((item) => (
                  <li key={item} className="rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-3">
              <h2 className="font-display text-base font-semibold text-slate-100">
                Customer Discovery Interview Questions
              </h2>
              <ol className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                {report.market.interviewQuestions.map((q, idx) => (
                  <li key={q} className="flex items-start gap-2.5">
                    <span className="font-mono text-violet-400 tabular-nums shrink-0">
                      Q{idx + 1}.
                    </span>
                    <span>{q}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4">
            <h2 className="font-display text-base font-semibold text-slate-100">
              Validation Experiments
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {report.market.validationExperiments.map((exp, idx) => (
                <div key={exp.assumption} className="rounded-lg border border-slate-800 bg-[#0B1120] p-4 space-y-2">
                  <div className="font-mono text-xs text-violet-400">Experiment 0{idx + 1}</div>
                  <p className="text-xs font-semibold text-slate-100">{exp.assumption}</p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="text-slate-400 font-medium">Test: </span>
                    {exp.experiment}
                  </p>
                  <p className="text-xs text-teal-300 leading-relaxed">
                    <span className="text-teal-400 font-medium">Success Signal: </span>
                    {exp.successSignal}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB: COMPETITORS */}
      {activeTab === 'competitors' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-base font-semibold text-slate-100">
                Competitor & Alternative Landscape
              </h2>
              <span className="text-xs text-slate-400">
                Distinguishes user-provided names from unverified AI candidates
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-medium text-slate-400">
                    <th className="py-3 pr-4">Competitor</th>
                    <th className="py-3 pr-4">Type & Verification</th>
                    <th className="py-3 pr-4">Audience & Offering</th>
                    <th className="py-3 pr-4">Strengths / Weaknesses</th>
                    <th className="py-3">Differentiation & Pricing Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs">
                  {report.competitors.map((comp) => (
                    <tr key={comp.name} className="align-top">
                      <td className="py-4 pr-4 font-semibold text-slate-100 min-w-[140px]">
                        {comp.name}
                      </td>
                      <td className="py-4 pr-4 min-w-[150px] space-y-1">
                        <div className="capitalize text-slate-200">{comp.type}</div>
                        <div
                          className={`text-xs ${
                            comp.verificationStatus === 'user-provided'
                              ? 'text-teal-400'
                              : comp.verificationStatus === 'verified'
                              ? 'text-emerald-400'
                              : 'text-amber-300'
                          }`}
                        >
                          {comp.verificationStatus === 'user-provided'
                            ? 'User-provided'
                            : comp.verificationStatus === 'verified'
                            ? 'Verified source'
                            : 'Unverified AI candidate'}
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-slate-300 min-w-[200px] space-y-1">
                        <div className="text-slate-400">{comp.targetAudience}</div>
                        <div>{comp.offering}</div>
                      </td>
                      <td className="py-4 pr-4 min-w-[220px] space-y-2">
                        <div>
                          <span className="text-teal-400 font-medium">Strengths: </span>
                          <span className="text-slate-300">{comp.strengths.join('; ')}</span>
                        </div>
                        <div>
                          <span className="text-amber-400 font-medium">Weaknesses: </span>
                          <span className="text-slate-300">{comp.weaknesses.join('; ')}</span>
                        </div>
                      </td>
                      <td className="py-4 min-w-[200px] space-y-1.5 text-slate-300">
                        <div>{comp.differentiation}</div>
                        <div className="text-slate-400">{comp.pricingNote}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-xl border border-slate-800 bg-[#111827] p-6">
              <h3 className="font-display text-sm font-semibold text-slate-100 mb-3">
                Differentiation Opportunities
              </h3>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                {report.differentiationOpportunities.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-xl border border-slate-800 bg-[#111827] p-6">
              <h3 className="font-display text-sm font-semibold text-slate-100 mb-3">
                Competitive Risks
              </h3>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                {report.competitiveRisks.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}

      {/* TAB: BUSINESS MODEL & SWOT */}
      {activeTab === 'business' && (
        <div className="space-y-6">
          <section className="rounded-xl border border-violet-500/30 bg-[#111827] p-6">
            <div className="text-xs font-medium text-violet-300">Recommended Starting Model</div>
            <h2 className="mt-1 font-display text-lg font-semibold text-slate-100">
              {report.recommendedBusinessModel}
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {report.recommendedBusinessModelReason}
            </p>
          </section>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {report.businessModels.map((model) => (
              <div
                key={model.name}
                className="rounded-xl border border-slate-800 bg-[#111827] p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-base font-semibold text-slate-100">
                      {model.name}
                    </h3>
                    <span className="font-mono text-sm font-semibold text-violet-300 tabular-nums shrink-0">
                      {model.fitScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{model.description}</p>
                  <div className="text-xs text-slate-400">
                    Complexity: <span className="capitalize text-slate-200">{model.implementationComplexity}</span>
                    <span className="mx-2">·</span>
                    Risk: <span className="capitalize text-slate-200">{model.riskLevel}</span>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-3 text-xs text-slate-300">
                    <span className="font-medium text-slate-100">Pricing Hypothesis: </span>
                    {model.pricingHypothesis}
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="font-medium text-teal-400">Pros</div>
                    <ul className="space-y-1 text-slate-300">
                      {model.pros.map((p) => (
                        <li key={p}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="font-medium text-amber-400">Cons</div>
                    <ul className="space-y-1 text-slate-300">
                      {model.cons.map((c) => (
                        <li key={c}>• {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 text-xs text-slate-400 space-y-1">
                  <div>
                    <span className="text-slate-300 font-medium">Revenue: </span>
                    {model.revenueStreams.join(', ')}
                  </div>
                  <div>
                    <span className="text-slate-300 font-medium">Cost Drivers: </span>
                    {model.costDrivers.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 4-Quadrant SWOT Grid */}
          <section className="rounded-xl border border-slate-800 bg-[#111827] p-6">
            <h2 className="font-display text-base font-semibold text-slate-100 mb-4">
              SWOT Analysis
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-teal-500/20 bg-[#0B1120] p-4 space-y-2">
                <h3 className="text-xs font-semibold text-teal-400">Strengths</h3>
                <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  {report.swot.strengths.map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-[#0B1120] p-4 space-y-2">
                <h3 className="text-xs font-semibold text-amber-400">Weaknesses</h3>
                <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  {report.swot.weaknesses.map((w) => (
                    <li key={w}>• {w}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-violet-500/20 bg-[#0B1120] p-4 space-y-2">
                <h3 className="text-xs font-semibold text-violet-300">Opportunities</h3>
                <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  {report.swot.opportunities.map((o) => (
                    <li key={o}>• {o}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-rose-500/20 bg-[#0B1120] p-4 space-y-2">
                <h3 className="text-xs font-semibold text-rose-400">Threats</h3>
                <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  {report.swot.threats.map((t) => (
                    <li key={t}>• {t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB: MVP & ROADMAP */}
      {activeTab === 'mvp' && (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4">
            <h2 className="font-display text-base font-semibold text-slate-100">
              Recommended Testable MVP Scope
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">{report.mvp.recommendedScope}</p>

            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-xs font-semibold text-slate-400 mb-3">Core User Journey</h3>
              <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {report.mvp.coreUserJourney.map((step, i) => (
                  <li key={step} className="rounded-lg border border-slate-800 bg-[#0B1120] p-3.5 text-xs text-slate-300 leading-relaxed">
                    <div className="font-mono text-violet-400 mb-1">Step 0{i + 1}</div>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-3">
              <h3 className="text-sm font-semibold text-teal-400">Must-Have (MVP Core)</h3>
              <ul className="space-y-3">
                {report.mvp.mustHave.map((item) => (
                  <li key={item.feature} className="rounded-lg border border-slate-800 bg-[#0B1120] p-3 text-xs space-y-1">
                    <div className="font-semibold text-slate-100">{item.feature}</div>
                    <div className="text-slate-400 leading-relaxed">{item.reason}</div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-3">
              <h3 className="text-sm font-semibold text-violet-300">Should-Have / Could-Have</h3>
              <ul className="space-y-3">
                {[...report.mvp.shouldHave, ...report.mvp.couldHave].map((item) => (
                  <li key={item.feature} className="rounded-lg border border-slate-800 bg-[#0B1120] p-3 text-xs space-y-1">
                    <div className="font-semibold text-slate-100">{item.feature}</div>
                    <div className="text-slate-400 leading-relaxed">{item.reason}</div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-rose-400 mb-2.5">
                  Explicitly Out of MVP Scope
                </h3>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  {report.mvp.outOfScope.map((o) => (
                    <li key={o}>• {o}</li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <h3 className="text-sm font-semibold text-slate-200 mb-2.5">
                  Measurable Success Metrics
                </h3>
                <ul className="space-y-2 text-xs text-teal-300 leading-relaxed">
                  {report.mvp.successMetrics.map((m) => (
                    <li key={m}>• {m}</li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* Phased Startup Roadmap */}
          <section className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-base font-semibold text-slate-100">
                Execution Roadmap ({analysis.roadmapWeeks}-Week Planning Estimate)
              </h2>
              <span className="text-xs text-slate-400">
                Planning estimate, not a fixed guarantee
              </span>
            </div>

            <div className="space-y-4">
              {report.roadmap.map((phase) => (
                <div key={phase.phase} className="rounded-xl border border-slate-800 bg-[#0B1120] p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-semibold text-slate-100">
                      {phase.phase}
                    </h3>
                    <span className="font-mono text-xs text-violet-300">{phase.duration}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {phase.tasks.map((task) => (
                      <div key={task.title} className="rounded-lg border border-slate-800/80 bg-[#111827] p-3.5 space-y-1.5 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-slate-100">{task.title}</span>
                          <span className="font-mono capitalize text-slate-400 shrink-0">
                            {task.priority} · {task.durationEstimate}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{task.description}</p>
                        <div className="text-teal-300">
                          <span className="text-slate-400">Deliverable: </span>
                          {task.deliverable}
                        </div>
                        {task.dependency && (
                          <div className="text-slate-400">Depends on: {task.dependency}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB: RISKS */}
      {activeTab === 'risks' && (
        <section className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-base font-semibold text-slate-100">
              Risk Register & Mitigation Plan
            </h2>
            <span className="text-xs text-slate-400">
              Severity, likelihood, mitigation actions, and early warning signals
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-medium text-slate-400">
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Risk</th>
                  <th className="py-3 pr-4">Severity / Likelihood</th>
                  <th className="py-3 pr-4">Mitigation Action</th>
                  <th className="py-3">Early Warning Sign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {report.risks.map((item) => (
                  <tr key={item.risk} className="align-top">
                    <td className="py-4 pr-4 font-medium text-violet-300 whitespace-nowrap">
                      {item.category}
                    </td>
                    <td className="py-4 pr-4 text-slate-100 font-medium min-w-[200px]">
                      {item.risk}
                    </td>
                    <td className="py-4 pr-4 whitespace-nowrap font-mono">
                      <span
                        className={
                          item.severity === 'high'
                            ? 'text-rose-400'
                            : item.severity === 'medium'
                            ? 'text-amber-300'
                            : 'text-slate-300'
                        }
                      >
                        Sev: {item.severity}
                      </span>
                      <span className="mx-1.5 text-slate-600">/</span>
                      <span className="text-slate-300">Lik: {item.likelihood}</span>
                    </td>
                    <td className="py-4 pr-4 text-slate-300 min-w-[220px] leading-relaxed">
                      {item.mitigation}
                    </td>
                    <td className="py-4 text-slate-400 min-w-[180px] leading-relaxed">
                      {item.earlyWarning}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB: PITCH DECK OUTLINE */}
      {activeTab === 'pitch' && (
        <section className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-100">
                Pitch Deck Slide Outline
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Structured slide narrative synthesized directly from your validated analysis.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleCopyPitchDeck()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              {copiedDeck ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedDeck ? 'Copied Markdown' : 'Copy Outline'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {report.pitchDeckOutline.map((slide) => (
              <div
                key={slide.slideNumber}
                className="rounded-lg border border-slate-800 bg-[#0B1120] p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-violet-400">
                    Slide 0{slide.slideNumber}
                  </span>
                </div>
                <h3 className="font-display text-sm font-semibold text-slate-100">
                  {slide.title}
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  {slide.keyPoints.map((pt) => (
                    <li key={pt}>• {pt}</li>
                  ))}
                </ul>
                <p className="border-t border-slate-800/80 pt-2 text-xs text-slate-400">
                  <span className="text-slate-300 font-medium">Speaker note: </span>
                  {slide.speakerNote}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB: STARTUP MENTOR */}
      {activeTab === 'mentor' && (
        <MentorChat
          analysis={analysis}
          isSamplePreview={isSamplePreview}
          onHistoryUpdated={onHistoryUpdated}
          onAnalyzeOwnIdea={onAnalyzeNewIdea}
        />
      )}

      {/* Print-only comprehensive report summary for clean PDF export */}
      <div className="hidden print:block space-y-6 pt-4">
        <div className="border-b pb-3">
          <h2 className="text-lg font-bold">Score Summary ({report.overallScore}/100 — {report.verdict})</h2>
          <p className="mt-1 text-sm">{report.executiveSummary}</p>
          <ul className="mt-2 space-y-1 text-xs">
            {report.scoreBreakdown.map((s) => (
              <li key={s.category}>
                <strong>{s.category} ({s.weight}%):</strong> {s.score}/100 — {s.reason}
              </li>
            ))}
          </ul>
        </div>
        <div className="print-break-inside-avoid">
          <h2 className="text-lg font-bold">Market & Validation Experiments</h2>
          <ul className="mt-1 space-y-1 text-xs">
            {report.market.validationExperiments.map((e) => (
              <li key={e.assumption}>
                <strong>{e.assumption}:</strong> {e.experiment} (Signal: {e.successSignal})
              </li>
            ))}
          </ul>
        </div>
        <div className="print-break-inside-avoid">
          <h2 className="text-lg font-bold">Recommended Business Model & SWOT</h2>
          <p className="text-xs mt-1"><strong>{report.recommendedBusinessModel}:</strong> {report.recommendedBusinessModelReason}</p>
        </div>
        <div className="print-break-inside-avoid">
          <h2 className="text-lg font-bold">MVP Must-Haves & {analysis.roadmapWeeks}-Week Roadmap</h2>
          <ul className="mt-1 space-y-1 text-xs">
            {report.mvp.mustHave.map((m) => (
              <li key={m.feature}>• {m.feature}: {m.reason}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
