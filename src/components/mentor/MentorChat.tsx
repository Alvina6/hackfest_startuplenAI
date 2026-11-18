import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowUp, Bot, MessageSquare, User } from 'lucide-react';
import type { AnalysisDocument, MentorMessage } from '../../../shared/types';
import { DEMO_MENTOR_QUESTIONS } from '../../data/sampleReport';
import { sendMentorQuestion } from '../../services/api';

interface MentorChatProps {
  analysis: AnalysisDocument;
  isSamplePreview?: boolean;
  onHistoryUpdated: (analysisId: string, chatHistory: MentorMessage[]) => void;
  onAnalyzeOwnIdea?: () => void;
}

export function MentorChat({
  analysis,
  isSamplePreview = false,
  onHistoryUpdated,
  onAnalyzeOwnIdea,
}: MentorChatProps) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (questionText?: string) => {
    const message = (questionText ?? input).trim();
    if (!message || isSending || isSamplePreview) return;

    setError(null);
    setIsSending(true);
    try {
      const result = await sendMentorQuestion(analysis.id, message);
      onHistoryUpdated(analysis.id, result.chatHistory);
      if (!questionText) {
        setInput('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach Startup Mentor.');
    } finally {
      setIsSending(false);
    }
  };

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    void handleSubmit();
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827] flex flex-col">
      <div className="border-b border-slate-800 px-5 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-slate-100">
            Startup Mentor — {analysis.ideaName}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Answers are scoped strictly to this report’s heuristic scores, assumptions, competitors, MVP scope, and risks.
          </p>
        </div>
        <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
          AI-generated guidance · Not financial or legal advice
        </span>
      </div>

      {isSamplePreview ? (
        <div className="p-6 text-center space-y-4">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400">
            <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <p className="text-sm font-medium text-slate-200">
              Mentor chat is active on generated reports
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              This is a static sample preview. Run a live Gemini analysis to ask contextual follow-up questions about assumptions, acquisition, MVP cuts, or pricing.
            </p>
          </div>
          {onAnalyzeOwnIdea && (
            <button
              type="button"
              onClick={onAnalyzeOwnIdea}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
            >
              Analyze an Idea Now
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="p-5 space-y-4 max-h-[460px] overflow-y-auto">
            {analysis.chatHistory.length === 0 ? (
              <div className="space-y-4 py-4">
                <p className="text-sm text-slate-300">
                  Ask a focused question about <span className="font-medium text-slate-100">{analysis.ideaName}</span>, or start with one of these prompts:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DEMO_MENTOR_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      disabled={isSending}
                      onClick={() => void handleSubmit(q)}
                      className="text-left rounded-lg border border-slate-800 bg-[#0B1120] px-3.5 py-2.5 text-xs text-slate-200 hover:border-violet-500/50 hover:bg-slate-900 transition-colors disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              analysis.chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-300">
                      <Bot className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-violet-600/20 border border-violet-500/30 text-slate-100'
                        : 'bg-[#0B1120] border border-slate-800 text-slate-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300">
                      <User className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                  )}
                </div>
              ))
            )}

            {isSending && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-300">
                  <Bot className="h-4 w-4 animate-pulse" strokeWidth={1.75} />
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0B1120] px-4 py-3 text-sm text-slate-400">
                  Reviewing report context and drafting guidance...
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mx-5 mb-3 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onFormSubmit} className="border-t border-slate-800 p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label htmlFor="mentor-question-input" className="sr-only">
                  Ask Startup Mentor
                </label>
                <textarea
                  id="mentor-question-input"
                  rows={2}
                  maxLength={1200}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSubmit();
                    }
                  }}
                  placeholder="Ask about validation tests, MVP cuts, pricing, or risks..."
                  className="w-full resize-none rounded-lg border border-slate-700 bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSending || input.trim().length < 2}
                aria-label="Send mentor question"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white hover:bg-violet-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
              >
                <ArrowUp className="h-4 w-4" strokeWidth={1.75} />
                Ask
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
