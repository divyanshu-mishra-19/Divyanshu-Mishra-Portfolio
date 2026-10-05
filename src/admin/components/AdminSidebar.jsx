import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  FolderGit2,
  GraduationCap,
  Briefcase,
  Award,
  FileCheck,
  Cpu,
  Camera,
  BookOpen,
  Image as ImageIcon,
  Sliders,
  ShieldCheck,
  ExternalLink,
  LogOut,
  ChevronRight,
  Database,
  Lock,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile & Bio', icon: UserCheck },
  { id: 'projects', label: 'Projects', icon: FolderGit2, badgeKey: 'projects' },
  { id: 'education', label: 'Education', icon: GraduationCap, badgeKey: 'education' },
  { id: 'positions', label: 'Positions & Leadership', icon: Briefcase, badgeKey: 'positions' },
  { id: 'achievements', label: 'Achievements', icon: Award, badgeKey: 'achievements' },
  { id: 'certifications', label: 'Certifications', icon: FileCheck, badgeKey: 'certifications' },
  { id: 'skills', label: 'Skills Matrix', icon: Cpu, badgeKey: 'skills' },
  { id: 'gallery', label: 'Photo Gallery', icon: Camera, badgeKey: 'gallery' },
  { id: 'blog', label: 'Blog & Content', icon: BookOpen, badgeKey: 'blog' },
  { id: 'media', label: 'Media Library', icon: ImageIcon, badgeKey: 'media' },
  { id: 'settings', label: 'Website Settings', icon: Sliders },
  { id: 'security', label: 'Security & Access', icon: ShieldCheck }
];

export function AdminSidebar({
  activeTab,
  onSelectTab,
  onLogout,
  onLockSession,
  onPreviewSite,
  counts = {},
  isMobileOpen,
  onCloseMobile,
  adminTheme = 'dark'
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 max-w-[85vw] ${
          adminTheme === 'light'
            ? 'bg-white/95 border-r border-slate-200 text-slate-800'
            : 'bg-[#0c121d]/95 border-r border-amber-500/15 text-slate-100'
        } flex flex-col transition-transform duration-300 lg:translate-x-0 backdrop-blur-2xl ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Mac Traffic Lights */}
        <div className={`p-4 sm:p-5 border-b ${adminTheme === 'light' ? 'border-slate-200' : 'border-amber-500/15'}`}>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 inline-block" />
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              adminTheme === 'light'
                ? 'text-amber-800 bg-amber-50 border-amber-300 font-bold'
                : 'text-amber-400 bg-amber-500/10 border-amber-500/25'
            }`}>
              CMS v2.4
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-mono font-bold text-sm shadow-lg shadow-amber-500/20 shrink-0">
                DM
              </div>
              <div>
                <div className={`text-sm font-bold tracking-wide font-sans ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  PORTFOLIO CMS
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>SQLite 3.45 Online</span>
                </div>
              </div>
            </div>

            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className={`lg:hidden p-1.5 rounded-xl ${
                  adminTheme === 'light' ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/5'
                } transition-colors cursor-pointer`}
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Explorer Links */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          <div className={`px-3 pt-2 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
            adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'
          }`}>
            Explorer / Content
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const count = item.badgeKey ? counts[item.badgeKey]?.total ?? counts[item.badgeKey] : null;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? adminTheme === 'light'
                      ? 'bg-amber-500/15 text-amber-900 border-l-2 border-amber-500 shadow-sm font-bold'
                      : 'bg-amber-500/15 text-amber-300 border-l-2 border-amber-500 shadow-sm font-semibold'
                    : adminTheme === 'light'
                      ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${
                    isActive
                      ? adminTheme === 'light' ? 'text-amber-600' : 'text-amber-400'
                      : adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'
                  }`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {count !== null && count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                        isActive
                          ? adminTheme === 'light'
                            ? 'bg-amber-500/20 text-amber-900 border border-amber-500/30'
                            : 'bg-amber-500/25 text-amber-200 border border-amber-500/30'
                          : adminTheme === 'light'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-black/40 text-slate-500 border border-white/5'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                  {isActive && <ChevronRight className={`w-3.5 h-3.5 ${adminTheme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Quick Controls */}
        <div className={`p-3 border-t ${adminTheme === 'light' ? 'border-slate-200 bg-slate-50/80' : 'border-amber-500/15 bg-black/40'} space-y-1.5`}>
          <button
            type="button"
            onClick={onPreviewSite}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-mono ${
              adminTheme === 'light'
                ? 'text-slate-700 hover:text-slate-950 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400'
                : 'text-slate-300 hover:text-white bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30'
            } transition-all cursor-pointer group`}
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-sky-500 group-hover:scale-110 transition-transform" />
              <span>~/return-to-site</span>
            </span>
            <span className={`text-[10px] ${adminTheme === 'light' ? 'text-amber-700' : 'text-amber-400'} font-bold`}>LIVE</span>
          </button>

          <div className="flex items-center gap-1.5">
            {onLockSession && (
              <button
                type="button"
                onClick={onLockSession}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono ${
                  adminTheme === 'light'
                    ? 'text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300'
                    : 'text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20'
                } transition-colors cursor-pointer`}
                title="Lock session and show login gate"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Lock</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono ${
                adminTheme === 'light'
                  ? 'text-rose-800 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-300'
                  : 'text-rose-300 hover:text-rose-100 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20'
              } transition-colors cursor-pointer`}
              title="Sign out of administrative session"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
