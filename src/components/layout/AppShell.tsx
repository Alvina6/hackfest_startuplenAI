import { useState, type ReactNode } from 'react';
import {
  FolderKanban,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Settings,
  X,
} from 'lucide-react';
import type { AuthUser } from '../../../shared/types';

export type WorkspaceRoute =
  | 'dashboard'
  | 'analyze'
  | 'analyses'
  | 'report'
  | 'sample'
  | 'mentor'
  | 'settings';

interface AppShellProps {
  activeRoute: WorkspaceRoute;
  breadcrumb: string;
  savedCount: number;
  user: AuthUser | null;
  onNavigate: (route: WorkspaceRoute) => void;
  onBackToLanding: () => void;
  onSignOut: () => void;
  children: ReactNode;
}

export function AppShell({
  activeRoute,
  breadcrumb,
  savedCount,
  user,
  onNavigate,
  onBackToLanding,
  onSignOut,
  children,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: {
    id: WorkspaceRoute;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyses', label: 'My Analyses', icon: FolderKanban, badge: savedCount },
    { id: 'mentor', label: 'Startup Mentor', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (route: WorkspaceRoute) => {
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-800 bg-[#0E1526]">
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800">
          <button
            type="button"
            onClick={onBackToLanding}
            className="font-display text-base font-bold tracking-tight text-white hover:text-violet-300 transition-colors whitespace-nowrap"
          >
            StartupLens AI
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => handleNavClick('analyze')}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeRoute === 'analyze'
                  ? 'bg-violet-500 text-white'
                  : 'bg-violet-600 text-white hover:bg-violet-500'
              }`}
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Analyze New Idea
            </button>

            <nav aria-label="Workspace navigation" className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeRoute === item.id ||
                  (item.id === 'analyses' && activeRoute === 'report');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-800/90 text-white'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                      <span>{item.label}</span>
                    </span>
                    {typeof item.badge === 'number' && (
                      <span className="font-mono text-xs text-slate-400 tabular-nums">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-2">
            <button
              type="button"
              onClick={() => handleNavClick('sample')}
              className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeRoute === 'sample'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              Sample Report Preview
            </button>
            <button
              type="button"
              onClick={onBackToLanding}
              className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors"
            >
              <Home className="h-3.5 w-3.5" strokeWidth={1.75} />
              Landing Page
            </button>

            {user && (
              <div className="mt-2 border-t border-slate-800 pt-3 px-2 space-y-2">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">{user.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="w-full flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0B1120] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Context Bar */}
        <header className="no-print sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-slate-800 bg-[#0B1120]/95 backdrop-blur-sm px-4 sm:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden rounded-lg border border-slate-800 bg-[#111827] p-2 text-slate-300 hover:bg-slate-800"
            >
              <Menu className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <div className="text-xs sm:text-sm font-medium text-slate-300 truncate">
              <span className="text-slate-500">Workspace / </span>
              <span className="text-slate-100">{breadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeRoute !== 'analyze' && (
              <button
                type="button"
                onClick={() => handleNavClick('analyze')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Analyze Idea
              </button>
            )}
          </div>
        </header>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="no-print fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-[#0E1526] border-r border-slate-800 p-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-display text-base font-bold text-white">StartupLens AI</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 space-y-4 flex-1">
                <button
                  type="button"
                  onClick={() => handleNavClick('analyze')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Analyze New Idea
                </button>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeRoute === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium ${
                          isActive
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-300 hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" strokeWidth={1.75} />
                          <span>{item.label}</span>
                        </span>
                        {typeof item.badge === 'number' && (
                          <span className="font-mono text-xs text-slate-400 tabular-nums">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => handleNavClick('sample')}
                  className="w-full text-left rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-slate-800/50"
                >
                  Sample Report Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onBackToLanding();
                  }}
                  className="w-full text-left rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-slate-800/50"
                >
                  Landing Page
                </button>
                {user && (
                  <div className="border-t border-slate-800 pt-3 space-y-2">
                    <div className="px-1">
                      <div className="text-xs font-medium text-slate-200 truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0B1120] px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                    >
                      <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
