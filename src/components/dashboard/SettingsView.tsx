import { LogOut } from 'lucide-react';
import type { AuthUser } from '../../../shared/types';
import type { HealthStatus } from '../../services/api';

interface SettingsViewProps {
  user: AuthUser | null;
  defaultRoadmapWeeks: 4 | 6 | 8;
  onChangeDefaultRoadmapWeeks: (weeks: 4 | 6 | 8) => void;
  onSignOut: () => void;
  health: HealthStatus | null;
}

export function SettingsView({
  user,
  defaultRoadmapWeeks,
  onChangeDefaultRoadmapWeeks,
  onSignOut,
  health,
}: SettingsViewProps) {
  const storageDescription =
    health?.storageMode === 'mongodb'
      ? 'MongoDB Atlas (Connected via MONGODB_URI)'
      : 'Local File Persistence (.data/) — add MONGODB_URI in .env to switch to MongoDB Atlas';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Settings & Account</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your founder profile, planning defaults, and database configuration.
        </p>
      </div>

      {/* Account Card */}
      {user && (
        <section className="rounded-xl border border-slate-800 bg-[#111827] p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-400">Signed-in Founder Account</div>
            <div className="font-display text-base font-semibold text-slate-100">{user.name}</div>
            <div className="text-xs text-slate-400">{user.email}</div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors self-start sm:self-auto whitespace-nowrap"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
            Sign Out
          </button>
        </section>
      )}

      {/* Planning Preferences */}
      <section className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-100">
            Default Roadmap Horizon
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Pre-selected timeline duration when submitting a new startup idea.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-lg border border-slate-800 bg-[#0B1120] w-fit">
          {([4, 6, 8] as const).map((weeks) => (
            <button
              key={weeks}
              type="button"
              onClick={() => onChangeDefaultRoadmapWeeks(weeks)}
              className={`rounded-md px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                defaultRoadmapWeeks === weeks
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {weeks} Weeks
            </button>
          ))}
        </div>
      </section>

      {/* Transparency & Backend Configuration */}
      <section className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4">
        <h2 className="font-display text-base font-semibold text-slate-100">
          Workspace Configuration & Storage
        </h2>

        <dl className="divide-y divide-slate-800/80 text-xs">
          <div className="py-3 flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-slate-400">AI Service Status</dt>
            <dd className="font-mono text-slate-200">
              {health
                ? health.aiConfigured
                  ? 'Configured (Server-side Gemini API)'
                  : 'GEMINI_API_KEY not set in environment'
                : 'Checking server health...'}
            </dd>
          </div>
          <div className="py-3 flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-slate-400">Active Model</dt>
            <dd className="font-mono text-slate-200">{health?.modelName || 'gemini-4-hydrogen'}</dd>
          </div>
          <div className="py-3 flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-slate-400">Database Storage</dt>
            <dd className="text-slate-200">{storageDescription}</dd>
          </div>
          <div className="py-3 flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-slate-400">Authentication</dt>
            <dd className="text-slate-200">
              JWT Bearer sessions + scrypt password hashing (reports isolated per user)
            </dd>
          </div>
          <div className="py-3 flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-slate-400">Research Mode</dt>
            <dd className="text-slate-200">
              AI-only heuristic synthesis (no live web scraping; unverified claims are labeled)
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
