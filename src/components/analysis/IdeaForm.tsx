import { useState, type FormEvent } from 'react';
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import type { AnalyzeIdeaInput, IdeaStage } from '../../../shared/types';
import { DEMO_IDEA_INPUT } from '../../data/sampleReport';

interface IdeaFormProps {
  initialInput?: AnalyzeIdeaInput;
  defaultRoadmapWeeks: 4 | 6 | 8;
  isSubmitting: boolean;
  onSubmit: (input: AnalyzeIdeaInput) => Promise<void>;
}

const INDUSTRY_OPTIONS = [
  'SaaS / B2B Software',
  'EdTech',
  'FinTech',
  'HealthTech',
  'E-commerce / Retail',
  'Marketplace',
  'AI / Developer Tools',
  'Physical / Service Business',
  'Other',
];

const STAGE_OPTIONS: { value: IdeaStage; label: string }[] = [
  { value: 'idea', label: 'Early Idea' },
  { value: 'research', label: 'User Research' },
  { value: 'prototype', label: 'Prototype / MVP' },
  { value: 'launched', label: 'Launched / Early Traction' },
];

export function IdeaForm({
  initialInput,
  defaultRoadmapWeeks,
  isSubmitting,
  onSubmit,
}: IdeaFormProps) {
  const [form, setForm] = useState<AnalyzeIdeaInput>(
    initialInput || {
      ideaName: '',
      ideaDescription: '',
      industry: '',
      targetMarket: '',
      targetAudience: '',
      problemStatement: '',
      currentStage: 'idea',
      knownCompetitors: '',
      budgetConstraints: '',
      roadmapWeeks: defaultRoadmapWeeks,
    }
  );

  const [validationError, setValidationError] = useState<string | null>(null);

  const descriptionLength = form.ideaDescription.trim().length;

  const handleLoadDemo = () => {
    setForm({
      ...DEMO_IDEA_INPUT,
      roadmapWeeks: defaultRoadmapWeeks,
    });
    setValidationError(null);
  };

  const handleReset = () => {
    setForm({
      ideaName: '',
      ideaDescription: '',
      industry: '',
      targetMarket: '',
      targetAudience: '',
      problemStatement: '',
      currentStage: 'idea',
      knownCompetitors: '',
      budgetConstraints: '',
      roadmapWeeks: defaultRoadmapWeeks,
    });
    setValidationError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (descriptionLength < 20) {
      setValidationError(
        'Please describe your startup idea in at least 20 characters so Gemini can evaluate it accurately.'
      );
      return;
    }
    if (descriptionLength > 2500) {
      setValidationError('Idea description cannot exceed 2,500 characters.');
      return;
    }

    setValidationError(null);
    await onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-slate-800 bg-[#111827] p-6 sm:p-8 space-y-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-100">
            Describe Your Startup Idea
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Only the idea description is required. Adding context sharpens competitor and validation recommendations.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleLoadDemo}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-400" strokeWidth={1.75} />
            Load Demo Idea
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-transparent px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
            Reset
          </button>
        </div>
      </div>

      {/* Required: Idea Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="ideaDescription" className="text-sm font-medium text-slate-200">
            Idea Description <span className="text-rose-400">*</span>
          </label>
          <span
            className={`font-mono text-xs tabular-nums ${
              descriptionLength > 2500
                ? 'text-rose-400'
                : descriptionLength >= 20
                ? 'text-teal-400'
                : 'text-slate-500'
            }`}
          >
            {descriptionLength} / 2500
          </span>
        </div>
        <textarea
          id="ideaDescription"
          name="ideaDescription"
          rows={4}
          required
          maxLength={2500}
          disabled={isSubmitting}
          value={form.ideaDescription}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, ideaDescription: e.target.value }));
            if (validationError) setValidationError(null);
          }}
          placeholder="Explain what you are building, who it helps, and how it delivers value in plain language..."
          className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-60"
        />
        <p className="text-xs text-slate-400">
          Minimum 20 characters. Avoid confidential credentials or private personal information.
        </p>
        {validationError && (
          <p role="alert" className="text-xs font-medium text-rose-400">
            {validationError}
          </p>
        )}
      </div>

      {/* Optional structured grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="ideaName" className="text-sm font-medium text-slate-200">
            Startup / Project Name <span className="text-xs font-normal text-slate-500">(Optional)</span>
          </label>
          <input
            id="ideaName"
            type="text"
            maxLength={120}
            disabled={isSubmitting}
            value={form.ideaName || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, ideaName: e.target.value }))}
            placeholder="Leave blank to auto-generate a neutral title"
            className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="industry" className="text-sm font-medium text-slate-200">
            Industry / Category <span className="text-xs font-normal text-slate-500">(Optional)</span>
          </label>
          <select
            id="industry"
            disabled={isSubmitting}
            value={form.industry || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, industry: e.target.value }))}
            className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="">Select or leave unspecified</option>
            {INDUSTRY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="targetMarket" className="text-sm font-medium text-slate-200">
            Target Country / Market <span className="text-xs font-normal text-slate-500">(Optional)</span>
          </label>
          <input
            id="targetMarket"
            type="text"
            maxLength={100}
            disabled={isSubmitting}
            value={form.targetMarket || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, targetMarket: e.target.value }))}
            placeholder="e.g., Pakistan, North America, Southeast Asia"
            className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="currentStage" className="text-sm font-medium text-slate-200">
            Current Stage
          </label>
          <select
            id="currentStage"
            disabled={isSubmitting}
            value={form.currentStage || 'idea'}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, currentStage: e.target.value as IdeaStage }))
            }
            className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            {STAGE_OPTIONS.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="targetAudience" className="text-sm font-medium text-slate-200">
            Target Audience <span className="text-xs font-normal text-slate-500">(Optional)</span>
          </label>
          <input
            id="targetAudience"
            type="text"
            maxLength={250}
            disabled={isSubmitting}
            value={form.targetAudience || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, targetAudience: e.target.value }))}
            placeholder="Who directly experiences this problem?"
            className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="knownCompetitors" className="text-sm font-medium text-slate-200">
            Known Competitors <span className="text-xs font-normal text-slate-500">(Optional)</span>
          </label>
          <input
            id="knownCompetitors"
            type="text"
            maxLength={300}
            disabled={isSubmitting}
            value={form.knownCompetitors || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, knownCompetitors: e.target.value }))}
            placeholder="Comma-separated names (labeled separately in report)"
            className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="problemStatement" className="text-sm font-medium text-slate-200">
          Problem Being Solved <span className="text-xs font-normal text-slate-500">(Optional)</span>
        </label>
        <textarea
          id="problemStatement"
          rows={2}
          maxLength={600}
          disabled={isSubmitting}
          value={form.problemStatement || ''}
          onChange={(e) => setForm((prev) => ({ ...prev, problemStatement: e.target.value }))}
          placeholder="What concrete workflow, cost, or pain point fails today?"
          className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="budgetConstraints" className="text-sm font-medium text-slate-200">
            Budget / Team Constraints <span className="text-xs font-normal text-slate-500">(Optional)</span>
          </label>
          <input
            id="budgetConstraints"
            type="text"
            maxLength={300}
            disabled={isSubmitting}
            value={form.budgetConstraints || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, budgetConstraints: e.target.value }))}
            placeholder="e.g., Solo founder, $0 ad budget, 20 hrs/week"
            className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-slate-200">Roadmap Horizon</span>
          <div className="flex items-center gap-2 p-1 rounded-lg border border-slate-800 bg-[#0B1120] w-fit">
            {([4, 6, 8] as const).map((weeks) => (
              <button
                key={weeks}
                type="button"
                disabled={isSubmitting}
                onClick={() => setForm((prev) => ({ ...prev, roadmapWeeks: weeks }))}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  form.roadmapWeeks === weeks
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {weeks} Weeks
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400">
          Scores are heuristic AI assessments, not guaranteed market forecasts.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          {isSubmitting ? 'Analyzing...' : 'Generate Validation Report'}
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </form>
  );
}
