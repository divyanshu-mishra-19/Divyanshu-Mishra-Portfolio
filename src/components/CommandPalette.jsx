import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileCode, ArrowRight, CornerDownLeft } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export default function CommandPalette({ isOpen, onClose, onNavigate, onOpenMonitor }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const items = [
    { type: 'Section', name: 'Home / Hero', action: () => onNavigate('hero'), icon: 'home.jsx' },
    { type: 'Section', name: 'About Me', action: () => onNavigate('about'), icon: 'about.md' },
    { type: 'Section', name: 'Technical Skills Toolkit', action: () => onNavigate('skills'), icon: 'toolkit.jsx' },
    { type: 'Section', name: 'Projects Bookshelf', action: () => onNavigate('projects'), icon: 'projects/' },
    { type: 'Section', name: 'Achievements & Verified Certificates', action: () => onNavigate('achievements'), icon: 'achievements/' },
    { type: 'Section', name: 'Positions of Responsibility & Leadership', action: () => onNavigate('responsibility'), icon: 'responsibility.jsx' },
    { type: 'Section', name: 'Education & Academic Coursework', action: () => onNavigate('education'), icon: 'education.md' },
    { 
      type: 'Widget', 
      name: 'System Monitor (Live Telemetry & Logs)', 
      action: () => {
        if (onOpenMonitor) onOpenMonitor();
        else onNavigate('monitor');
      }, 
      icon: 'monitor.log' 
    },
    { type: 'Section', name: 'Behind The Code (Lo-Fi Music Player)', action: () => onNavigate('behind-the-code'), icon: 'playlist.spotify' },
    { type: 'Section', name: 'Moments & Visual Gallery', action: () => onNavigate('gallery'), icon: 'moments-gallery.json' },
    { type: 'Section', name: 'Reading List / Magazine FlipBook', action: () => onNavigate('blog'), icon: 'blog/' },
    { type: 'Section', name: 'Visitors & Community Guestbook', action: () => onNavigate('visitors'), icon: 'visitors.db' },
    { type: 'Section', name: 'Contact & Socials', action: () => onNavigate('contact'), icon: 'contact.jsx' },
    { 
      type: 'Admin', 
      name: 'Admin Portal & Content Management System', 
      sub: 'Secure Login & Management Console',
      action: () => {
        window.history.pushState(null, '', '/admin');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 
      icon: 'admin.auth' 
    },
    ...portfolioData.projects.map((p) => ({
      type: 'Project',
      name: p.title,
      sub: p.tagline,
      action: () => onNavigate('projects', p.id),
      icon: p.file || 'project.jsx'
    })),
    ...portfolioData.achievements.map((a) => ({
      type: 'Achievement',
      name: a.title,
      sub: `${a.badge || ''} • ${a.year || ''}`,
      action: () => onNavigate('achievements'),
      icon: a.file || 'achievement.md'
    })),
    ...portfolioData.blog.map((b) => ({
      type: 'Article',
      name: b.title,
      sub: b.category,
      action: () => onNavigate('blog', b.id),
      icon: b.file || 'post.md'
    }))
  ];

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      (item.sub && item.sub.toLowerCase().includes(query.toLowerCase())) ||
      item.type.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose(false);
        }
      } else if (e.key === 'Escape') {
        onClose(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onClose(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -16 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl overflow-hidden font-sans relative z-10 glass-card"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 40px rgba(245, 158, 11, 0.1)'
            }}
          >
            {/* Input Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center gap-3 bg-slate-50/80 dark:bg-slate-900/90">
              <Search className="w-5 h-5 text-amber-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search portfolio files..."
                className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm md:text-base outline-none font-medium"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-mono cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => onClose(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar font-mono text-xs">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-sans text-sm">
                  No matching files or sections found for "{query}".
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isHighlighted = idx === selectedIndex;
                  return (
                    <button
                      key={idx}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => {
                        item.action();
                        onClose(false);
                      }}
                      className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all duration-150 group cursor-pointer ${
                        isHighlighted
                          ? 'bg-amber-500/10 dark:bg-slate-800 border border-amber-500/30 dark:border-slate-600/80 shadow-sm text-slate-900 dark:text-white'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg transition-colors shrink-0 ${
                            isHighlighted
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-100 dark:bg-slate-800 text-amber-500'
                          }`}
                        >
                          <FileCode className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm block font-sans truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {item.icon} {item.sub ? `• ${item.sub}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            item.type === 'Project'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : item.type === 'Article'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.type}
                        </span>
                        {isHighlighted ? (
                          <CornerDownLeft className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer info */}
            <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">↵</kbd> Select
                </span>
              </div>
              <span>ESC to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
