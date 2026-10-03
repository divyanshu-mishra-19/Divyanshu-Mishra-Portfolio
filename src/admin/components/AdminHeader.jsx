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
    <header className="sticky top-0 z-30 h-16 bg-[#0c121d]/90 backdrop-blur-xl border-b border-amber-500/15 flex items-center justify-between px-3 sm:px-5 lg:px-8">
      {/* Left Title & Mobile Hamburger */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="text-[11px] text-slate-400 font-mono hidden sm:flex items-center gap-1.5">
            <span>~/portfolio/cms</span>
            <span className="text-amber-500">/</span>
            <span className="text-amber-400 font-semibold capitalize">{activeTab}</span>
          </div>
          <h2 className="text-xs sm:text-base font-bold text-white tracking-tight font-sans truncate max-w-[150px] sm:max-w-xs md:max-w-md lg:max-w-none">
            {titles[activeTab] || 'Content Management'}
          </h2>
        </div>
      </div>

      {/* Right Controls Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Active Session Telemetry Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-amber-500/20 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Session</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        </div>

        {/* Theme Mode Switcher (Clean Light / Cyber Dark) */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white/5 hover:bg-amber-500/15 text-slate-200 hover:text-white border border-white/10 hover:border-amber-500/30 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer shadow-sm"
            title={adminTheme === 'light' ? 'Switch to Cyber Dark Mode' : 'Switch to Clean Light Mode'}
            aria-label="Toggle admin theme"
          >
            {adminTheme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="hidden md:inline">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden md:inline">Light</span>
              </>
            )}
          </button>
        )}

        {/* Lock Dashboard Button */}
        {onLockSession && (
          <button
            type="button"
            onClick={onLockSession}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 rounded-xl text-xs font-mono transition-all cursor-pointer shadow-sm"
            title="Lock dashboard session and require login"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Lock</span>
          </button>
        )}

        {/* View Live Site Button */}
        <button
          type="button"
          onClick={onPreviewSite}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-white/5 hover:bg-amber-500/15 text-slate-200 hover:text-white border border-white/10 hover:border-amber-500/30 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer shadow-sm"
          title="Return to public portfolio site"
        >
          <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Live Site</span>
        </button>

        {/* Administrator Profile Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-white/10">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-xs font-bold font-mono text-slate-950 ring-2 ring-amber-500/30 shadow-md shrink-0">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="hidden lg:block text-left text-xs">
            <div className="font-semibold text-white leading-tight font-sans">{user?.fullName || 'Divyanshu'}</div>
            <div className="text-[10px] text-amber-400 font-mono leading-none">Superadmin</div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors ml-0.5 cursor-pointer"
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
