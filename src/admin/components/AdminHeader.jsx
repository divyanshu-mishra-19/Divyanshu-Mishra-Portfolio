import React, { useState, useEffect } from 'react';
import { Menu, ExternalLink, Shield, Plus, Clock, Search, LogOut, Lock, Sun, Moon } from 'lucide-react';
import { adminAuth } from '../adminApi.js';

export function AdminHeader({
  activeTab,
  onOpenMobileMenu,
  onPreviewSite,
  onQuickAdd,
  onLogout,
  onLockSession,
  adminTheme = 'dark',
  onToggleTheme
}) {
  const user = adminAuth.getUser();
  const [minutesActive, setMinutesActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const last = adminAuth.getLastActivity();
      if (last) {
        const diffMin = Math.floor((Date.now() - last) / 60000);
        setMinutesActive(diffMin);
      }
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const titles = {
    overview: 'System Telemetry & Database Analytics',
    profile: 'Profile & Bio Customizer',
    projects: 'Projects Showcase Management',
    education: 'Education & Academic History',
    positions: 'Positions of Responsibility & Leadership',
    achievements: 'Achievements & Hackathon Awards',
    certifications: 'Verified Licenses & Certifications',
    skills: 'Technical Skills Matrix',
    gallery: 'Photo Gallery & Event Moments',
    blog: 'Blog & Editorial Articles',
    media: 'Media Assets & Upload Library',
    settings: 'Homepage Configuration & Meta',
    security: 'Security, Cryptography & Access Control'
  };

  return (
    <header className={`sticky top-0 z-30 h-16 ${
      adminTheme === 'light'
        ? 'bg-white/95 border-b border-slate-200 shadow-sm'
        : 'bg-[#0c121d]/90 border-b border-amber-500/15'
    } backdrop-blur-xl flex items-center justify-between px-3 sm:px-5 lg:px-8`}>
      {/* Left Title & Mobile Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className={`lg:hidden p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
            adminTheme === 'light' ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className={`text-[11px] font-mono hidden sm:flex items-center gap-1.5 ${
            adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <span>~/portfolio/cms</span>
            <span className="text-amber-500">/</span>
            <span className={`font-semibold capitalize ${adminTheme === 'light' ? 'text-amber-700' : 'text-amber-400'}`}>{activeTab}</span>
          </div>
          <h2 className={`text-xs sm:text-base font-bold tracking-tight font-sans truncate max-w-[130px] sm:max-w-xs md:max-w-md lg:max-w-none ${
            adminTheme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            {titles[activeTab] || 'Content Management'}
          </h2>
        </div>
      </div>

      {/* Right Controls Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Active Session Telemetry Indicator */}
        <div className={`hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full ${
          adminTheme === 'light' ? 'bg-slate-100 border border-slate-200 text-slate-700' : 'bg-black/40 border border-amber-500/20 text-slate-300'
        } text-xs font-mono`}>
          <Clock className={`w-3.5 h-3.5 ${adminTheme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
          <span>Active Session</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        </div>

        {/* Theme Mode Switcher (Clean Light / Cyber Dark) */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer shadow-sm ${
              adminTheme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                : 'bg-white/5 hover:bg-amber-500/15 text-slate-200 hover:text-white border border-white/10 hover:border-amber-500/30'
            }`}
            title={adminTheme === 'light' ? 'Switch to Cyber Dark Mode' : 'Switch to Clean Light Mode'}
            aria-label="Toggle admin theme"
          >
            {adminTheme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Light</span>
              </>
            )}
          </button>
        )}

        {/* Lock Dashboard Button */}
        {onLockSession && (
          <button
            type="button"
            onClick={onLockSession}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer shadow-sm ${
              adminTheme === 'light'
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25'
            }`}
            title="Lock dashboard session and require login"
          >
            <Lock className={`w-3.5 h-3.5 ${adminTheme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
            <span>Lock</span>
          </button>
        )}

        {/* View Live Site Button */}
        <button
          type="button"
          onClick={onPreviewSite}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer shadow-sm ${
            adminTheme === 'light'
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
              : 'bg-white/5 hover:bg-amber-500/15 text-slate-200 hover:text-white border border-white/10 hover:border-amber-500/30'
          }`}
          title="Return to public portfolio site"
        >
          <ExternalLink className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span className="hidden sm:inline">Live Site</span>
        </button>

        {/* Administrator Profile Pill */}
        <div className={`flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l ${
          adminTheme === 'light' ? 'border-slate-300' : 'border-white/10'
        }`}>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-xs font-bold font-mono text-slate-950 ring-2 ring-amber-500/30 shadow-md shrink-0">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="hidden lg:block text-left text-xs">
            <div className={`font-semibold leading-tight font-sans ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {user?.fullName || 'Divyanshu'}
            </div>
            <div className={`text-[10px] font-mono leading-none ${adminTheme === 'light' ? 'text-amber-700 font-bold' : 'text-amber-400'}`}>
              Superadmin
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className={`p-1.5 rounded-lg transition-colors ml-0.5 cursor-pointer ${
              adminTheme === 'light' ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
            }`}
            title="Sign out of administrative session"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
