import React from 'react';
import {
  FolderGit2,
  Award,
  Briefcase,
  GraduationCap,
  FileCheck,
  Cpu,
  Camera,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Database,
  Plus,
  Shield,
  Layers,
  Sparkles,
  Terminal
} from 'lucide-react';

export function OverviewView({ stats = {}, recentLogs = [], onNavigateTab }) {
  const cards = [
    {
      title: 'Projects',
      total: stats.projects?.total ?? 0,
      sub: `${stats.projects?.published ?? 0} Published`,
      icon: FolderGit2,
      color: 'from-amber-500 to-amber-600',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      tab: 'projects'
    },
    {
      title: 'Achievements',
      total: stats.achievements?.total ?? 0,
      sub: 'Awards & Hackathons',
      icon: Award,
      color: 'from-amber-500 to-orange-500',
      badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      tab: 'achievements'
    },
    {
      title: 'Positions',
      total: stats.positions?.total ?? 0,
      sub: 'Leadership & Organizer Roles',
      icon: Briefcase,
      color: 'from-emerald-500 to-teal-500',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      tab: 'positions'
    },
    {
      title: 'Education',
      total: stats.education?.total ?? 0,
      sub: 'Degrees & Schooling',
      icon: GraduationCap,
      color: 'from-sky-500 to-cyan-500',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      tab: 'education'
    },
    {
      title: 'Certifications',
      total: stats.certifications?.total ?? 0,
      sub: 'Verified Credentials',
      icon: FileCheck,
      color: 'from-violet-500 to-purple-500',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      tab: 'certifications'
    },
    {
      title: 'Technical Skills',
      total: stats.skills?.total ?? 0,
      sub: 'Languages, Tools & ML',
      icon: Cpu,
      color: 'from-rose-500 to-pink-500',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      tab: 'skills'
    },
    {
      title: 'Gallery Moments',
      total: stats.gallery?.total ?? 0,
      sub: 'Events & Photo Stories',
      icon: Camera,
      color: 'from-fuchsia-500 to-pink-500',
      badgeColor: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
      tab: 'gallery'
    },
    {
      title: 'Blog Articles',
      total: stats.blog?.total ?? 0,
      sub: 'Engineering Deep-dives',
      icon: BookOpen,
      color: 'from-teal-500 to-emerald-600',
      badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      tab: 'blog'
    },
    {
      title: 'Media Files',
      total: stats.media?.total ?? 0,
      sub: 'Assets & Uploaded Images',
      icon: ImageIcon,
      color: 'from-slate-600 to-slate-800',
      badgeColor: 'text-slate-300 bg-white/5 border-white/10',
      tab: 'media'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner with Mac Window Dots */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#131b2a] to-[#0e1422] border border-amber-500/25 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        {/* Top Window Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-[11px] font-mono text-slate-400 ml-2">~/terminal/cms-overview</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync
          </span>
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25 mb-4">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>SQLite Database Engine • Port 5173</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            Divyanshu Mishra Portfolio CMS
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Manage, publish, and reorder all portfolio content in real-time. Changes made here persist in SQLite and immediately reflect on your live website without touching source code.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => onNavigateTab('projects')}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-mono font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Project</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('blog')}
              className="px-4 py-2 bg-white/5 hover:bg-amber-500/15 text-slate-200 hover:text-white rounded-xl text-xs font-mono font-semibold border border-white/10 hover:border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Write Blog Article</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('gallery')}
              className="px-4 py-2 bg-white/5 hover:bg-amber-500/15 text-slate-200 hover:text-white rounded-xl text-xs font-mono font-semibold border border-white/10 hover:border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Gallery Moment</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('profile')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-semibold border border-white/5 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Ambient lighting */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Grid of Stats Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-sans">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Content Inventory Matrix</span>
          </h2>
          <span className="text-xs text-amber-400 font-mono">9 Sections Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                onClick={() => onNavigateTab(card.tab)}
                className="group relative bg-[#121824]/90 hover:bg-[#151d2c] border border-amber-500/15 hover:border-amber-500/40 rounded-2xl p-5 cursor-pointer transition-all duration-200 shadow-xl hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-black/40`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="p-1 rounded-lg text-slate-500 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-2xl font-black text-white tracking-tight font-sans">{card.total}</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5 font-sans">{card.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">{card.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Database & Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit Logs */}
        <div className="lg:col-span-2 bg-[#121824]/90 border border-amber-500/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-sans">Recent System & Audit Logs</h3>
            </div>
            <span className="text-[11px] text-amber-400 font-mono">SQLite Audit Trail</span>
          </div>

          <div className="space-y-2.5">
            {recentLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-mono">
                No recent activity logged yet.
              </div>
            ) : (
              recentLogs.slice(0, 7).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#080d18] border border-white/5 text-xs hover:border-amber-500/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                        log.action === 'CREATE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : log.action === 'UPDATE'
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : log.action === 'DELETE'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : log.action === 'LOGIN'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-white/5 text-slate-300'
                      }`}
                    >
                      {log.action}
                    </span>
                    <div>
                      <span className="font-semibold text-white mr-1.5 font-mono">{log.entity_type}</span>
                      <span className="text-slate-400 truncate max-w-[130px] sm:max-w-[220px] md:max-w-md inline-block align-bottom font-sans">
                        {log.details}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System & Architecture Info */}
        <div className="bg-[#121824]/90 border border-amber-500/15 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-sans">System Telemetry</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Database Engine</span>
              <span className="font-mono text-emerald-400 font-semibold">Node.js SQLite v22</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Storage Location</span>
              <span className="font-mono text-amber-300">portfolio.db</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Auth Token Type</span>
              <span className="font-mono text-slate-200">Cryptographic Bearer</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Password Encryption</span>
              <span className="font-mono text-slate-200">scrypt (64-byte key)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Inactivity Timeout</span>
              <span className="font-mono text-slate-200">30 minutes</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Public Sync</span>
              <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Real-Time Event Bus
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080d18] border border-amber-500/15 text-[11px] text-slate-400 leading-relaxed font-sans">
            All data operations are directly committed to the local SQLite database. The live portfolio queries these tables asynchronously with fallback support.
          </div>
        </div>
      </div>
    </div>
  );
}
