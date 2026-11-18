import { useCallback, useEffect, useState } from 'react';
import type {
  AnalysisDocument,
  AnalyzeIdeaInput,
  AuthUser,
  MentorMessage,
} from '../shared/types';
import { IdeaForm } from './components/analysis/IdeaForm';
import { AuthView } from './components/auth/AuthView';
import {
  AnalysisLoadingState,
  EmptyState,
  ErrorState,
} from './components/common/StateViews';
import { DashboardView } from './components/dashboard/DashboardView';
import { MyAnalysesView } from './components/dashboard/MyAnalysesView';
import { SettingsView } from './components/dashboard/SettingsView';
import { LandingPage } from './components/landing/LandingPage';
import { AppShell, type WorkspaceRoute } from './components/layout/AppShell';
import { MentorChat } from './components/mentor/MentorChat';
import { ReportView } from './components/report/ReportView';
import { SAMPLE_REPORT_DOC } from './data/sampleReport';
import {
  ApiClientError,
  clearAuthToken,
  createAnalysis,
  deleteAnalysisById,
  fetchAnalyses,
  fetchCurrentUser,
  fetchHealth,
  getAuthToken,
  renameAnalysisById,
  type HealthStatus,
} from './services/api';

const ROADMAP_PREF_KEY = 'startuplens_default_roadmap_weeks';

function loadDefaultRoadmapWeeks(): 4 | 6 | 8 {
  try {
    const raw = localStorage.getItem(ROADMAP_PREF_KEY);
    if (raw === '4') return 4;
    if (raw === '8') return 8;
  } catch {
    // Ignore storage access errors
  }
  return 6;
}

export default function App() {
  const [mode, setMode] = useState<'landing' | 'auth' | 'sample-public' | 'workspace'>('landing');
  const [route, setRoute] = useState<WorkspaceRoute>('dashboard');
  const [pendingRoute, setPendingRoute] = useState<WorkspaceRoute>('dashboard');

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [analyses, setAnalyses] = useState<AnalysisDocument[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const [defaultRoadmapWeeks, setDefaultRoadmapWeeks] = useState<4 | 6 | 8>(
    loadDefaultRoadmapWeeks
  );

  // Submission state (preserves user input on error)
  const [draftInput, setDraftInput] = useState<AnalyzeIdeaInput | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const loadUserAnalyses = useCallback(async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const docs = await fetchAnalyses();
      setAnalyses(docs);
      setSelectedId((prev) => prev || docs[0]?.id || null);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        clearAuthToken();
        setUser(null);
        setAnalyses([]);
        setMode('auth');
        return;
      }
      setListError(
        err instanceof Error ? err.message : 'Unable to load saved analyses from server.'
      );
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const healthData = await fetchHealth().catch(() => null);
        if (active && healthData) setHealth(healthData);

        const token = getAuthToken();
        if (token) {
          const currentUser = await fetchCurrentUser();
          if (!active) return;
          setUser(currentUser);
          const docs = await fetchAnalyses();
          if (!active) return;
          setAnalyses(docs);
          setSelectedId(docs[0]?.id || null);
        }
      } catch {
        clearAuthToken();
        if (active) {
          setUser(null);
          setAnalyses([]);
        }
      } finally {
        if (active) setIsCheckingAuth(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const navigateWorkspace = (nextRoute: WorkspaceRoute, reportId?: string) => {
    if (nextRoute === 'sample' && !user) {
      setMode('sample-public');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!user) {
      setPendingRoute(nextRoute);
      setMode('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setMode('workspace');
    setRoute(nextRoute);
    if (reportId) {
      setSelectedId(reportId);
    }
    if (nextRoute !== 'analyze') {
      setAnalyzeError(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthenticated = async (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    setMode('workspace');
    setRoute(pendingRoute === 'sample' ? 'dashboard' : pendingRoute);
    await loadUserAnalyses();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = () => {
    clearAuthToken();
    setUser(null);
    setAnalyses([]);
    setSelectedId(null);
    setDraftInput(undefined);
    setAnalyzeError(null);
    setMode('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyzeSubmit = async (input: AnalyzeIdeaInput) => {
    setDraftInput(input);
    setAnalyzeError(null);
    setIsAnalyzing(true);
    try {
      const created = await createAnalysis(input);
      setAnalyses((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
      setSelectedId(created.id);
      setDraftInput(undefined);
      setRoute('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        handleSignOut();
        setMode('auth');
        return;
      }
      setAnalyzeError(
        err instanceof Error
          ? err.message
          : 'Failed to generate analysis. Your inputs are preserved—please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRenameReport = async (id: string, newName: string) => {
    const updated = await renameAnalysisById(id, newName);
    setAnalyses((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  const handleDeleteReport = async (id: string) => {
    await deleteAnalysisById(id);
    setAnalyses((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      if (selectedId === id) {
        setSelectedId(remaining[0]?.id || null);
        if (route === 'report') {
          setRoute('analyses');
        }
      }
      return remaining;
    });
  };

  const handleHistoryUpdated = (id: string, chatHistory: MentorMessage[]) => {
    setAnalyses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, chatHistory } : a))
    );
  };

  const handleChangeDefaultWeeks = (weeks: 4 | 6 | 8) => {
    setDefaultRoadmapWeeks(weeks);
    try {
      localStorage.setItem(ROADMAP_PREF_KEY, String(weeks));
    } catch {
      // Ignore storage error
    }
  };

  const selectedAnalysis =
    analyses.find((a) => a.id === selectedId) || analyses[0] || null;

  if (mode === 'landing') {
    return (
      <LandingPage
        savedCount={analyses.length}
        isAuthenticated={Boolean(user)}
        onStartAnalyze={() => navigateWorkspace('analyze')}
        onViewSampleReport={() => navigateWorkspace('sample')}
        onOpenDashboard={() => navigateWorkspace('dashboard')}
      />
    );
  }

  if (mode === 'sample-public') {
    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-100">
        <header className="no-print sticky top-0 z-20 border-b border-slate-800 bg-[#0B1120]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
            <button
              type="button"
              onClick={() => setMode('landing')}
              className="font-display text-lg font-bold text-white hover:text-violet-300 transition-colors"
            >
              StartupLens AI
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMode('landing')}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
              >
                Back to Home
              </button>
              <button
                type="button"
                onClick={() => navigateWorkspace('analyze')}
                className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500"
              >
                {user ? 'Analyze New Idea' : 'Sign In & Analyze'}
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">
          <ReportView
            key={SAMPLE_REPORT_DOC.id}
            analysis={SAMPLE_REPORT_DOC}
            isSamplePreview
            onHistoryUpdated={() => {}}
            onAnalyzeNewIdea={() => navigateWorkspace('analyze')}
          />
        </main>
      </div>
    );
  }

  if (mode === 'auth' || (!user && !isCheckingAuth)) {
    return (
      <AuthView
        onAuthenticated={handleAuthenticated}
        onBackToLanding={() => setMode('landing')}
        onViewSampleReport={() => navigateWorkspace('sample')}
      />
    );
  }

  if (isCheckingAuth && !user) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-sm text-slate-400">
        Restoring your founder workspace...
      </div>
    );
  }

  const breadcrumbMap: Record<WorkspaceRoute, string> = {
    dashboard: 'Dashboard',
    analyze: 'Analyze New Idea',
    analyses: 'My Analyses',
    report: selectedAnalysis ? `Report · ${selectedAnalysis.ideaName}` : 'Analysis Report',
    sample: 'Sample Report Preview',
    mentor: 'Startup Mentor',
    settings: 'Settings',
  };

  return (
    <AppShell
      activeRoute={route}
      breadcrumb={breadcrumbMap[route]}
      savedCount={analyses.length}
      user={user}
      onNavigate={(r) => navigateWorkspace(r)}
      onBackToLanding={() => {
        setMode('landing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onSignOut={handleSignOut}
    >
      {listError && route !== 'analyze' && route !== 'sample' && (
        <div className="mb-6">
          <ErrorState
            title="Could not sync saved reports"
            message={listError}
            onRetry={() => void loadUserAnalyses()}
          />
        </div>
      )}

      {route === 'dashboard' && (
        <DashboardView
          analyses={analyses}
          isLoading={isLoadingList}
          onAnalyzeNewIdea={() => navigateWorkspace('analyze')}
          onOpenReport={(id) => navigateWorkspace('report', id)}
          onViewAllAnalyses={() => navigateWorkspace('analyses')}
          onViewSampleReport={() => navigateWorkspace('sample')}
        />
      )}

      {route === 'analyze' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {isAnalyzing ? (
            <AnalysisLoadingState ideaName={draftInput?.ideaName} />
          ) : (
            <>
              {analyzeError && (
                <ErrorState
                  title="Analysis could not be completed"
                  message={analyzeError}
                  onRetry={() => {
                    if (draftInput) void handleAnalyzeSubmit(draftInput);
                  }}
                  onSecondaryAction={() => setAnalyzeError(null)}
                  secondaryLabel="Edit Idea Details"
                />
              )}
              <IdeaForm
                initialInput={draftInput}
                defaultRoadmapWeeks={defaultRoadmapWeeks}
                isSubmitting={isAnalyzing}
                onSubmit={handleAnalyzeSubmit}
              />
            </>
          )}
        </div>
      )}

      {route === 'analyses' && (
        <MyAnalysesView
          analyses={analyses}
          onOpenReport={(id) => navigateWorkspace('report', id)}
          onDeleteReport={handleDeleteReport}
          onAnalyzeNewIdea={() => navigateWorkspace('analyze')}
        />
      )}

      {route === 'report' &&
        (selectedAnalysis ? (
          <ReportView
            key={selectedAnalysis.id}
            analysis={selectedAnalysis}
            onRename={handleRenameReport}
            onHistoryUpdated={handleHistoryUpdated}
            onAnalyzeNewIdea={() => navigateWorkspace('analyze')}
          />
        ) : (
          <EmptyState
            title="No report selected"
            description="Select an existing report from My Analyses or submit a new startup idea to generate one."
            primaryLabel="Analyze New Idea"
            onPrimaryAction={() => navigateWorkspace('analyze')}
            secondaryLabel="View Sample Report"
            onSecondaryAction={() => navigateWorkspace('sample')}
          />
        ))}

      {route === 'sample' && (
        <ReportView
          key={SAMPLE_REPORT_DOC.id}
          analysis={SAMPLE_REPORT_DOC}
          isSamplePreview
          onHistoryUpdated={() => {}}
          onAnalyzeNewIdea={() => navigateWorkspace('analyze')}
        />
      )}

      {route === 'mentor' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Startup Mentor</h1>
              <p className="mt-1 text-sm text-slate-400">
                Ask contextual validation, MVP scope, pricing, and user acquisition questions grounded in any saved analysis.
              </p>
            </div>
            {analyses.length > 0 && (
              <div className="space-y-1">
                <label htmlFor="mentor-report-select" className="block text-xs text-slate-400">
                  Selected Analysis Context
                </label>
                <select
                  id="mentor-report-select"
                  value={selectedAnalysis?.id || ''}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-[#111827] px-3.5 py-2 text-sm text-slate-100 focus:border-violet-500 focus:outline-none"
                >
                  {analyses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.ideaName} ({a.reportJson.overallScore}/100)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {selectedAnalysis ? (
            <MentorChat
              analysis={selectedAnalysis}
              onHistoryUpdated={handleHistoryUpdated}
            />
          ) : (
            <EmptyState
              title="Analyze an idea to unlock your Startup Mentor"
              description="The Startup Mentor grounds every answer in a completed startup report—including its rubric scores, assumptions, competitors, and MVP scope."
              primaryLabel="Analyze New Idea"
              onPrimaryAction={() => navigateWorkspace('analyze')}
              secondaryLabel="Inspect Sample Report"
              onSecondaryAction={() => navigateWorkspace('sample')}
            />
          )}
        </div>
      )}

      {route === 'settings' && (
        <SettingsView
          user={user}
          defaultRoadmapWeeks={defaultRoadmapWeeks}
          onChangeDefaultRoadmapWeeks={handleChangeDefaultWeeks}
          onSignOut={handleSignOut}
          health={health}
        />
      )}
    </AppShell>
  );
}
