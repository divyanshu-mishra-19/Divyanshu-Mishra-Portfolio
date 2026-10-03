import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Heart, 
  Send, 
  Sparkles, 
  Globe, 
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  Flame,
  Award,
  MessageSquare
} from 'lucide-react';

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Generates a deterministic inline-SVG initials avatar — fully XML-escaped and unicode-safe. */
export function getInitialsAvatar(name) {
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const words = cleanName.split(/s+/).filter(Boolean);
  let initials = '';
  for (const w of words) {
    const chars = Array.from(w);
    if (chars.length > 0) {
      initials += chars[0];
    }
    if (initials.length >= 2) break;
  }
  if (!initials) initials = '?';
  initials = initials.toUpperCase();

  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = (hash << 5) - hash + cleanName.charCodeAt(i);
    hash |= 0;
  }
  const hues = [200, 260, 320, 160, 40, 280];
  const hue = hues[Math.abs(hash) % hues.length];
  const safeInitials = escapeXml(initials);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="hsl(${hue},60%,25%)"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#f8fafc" font-family="system-ui,sans-serif" font-size="15" font-weight="600">${safeInitials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function Visitors() {
  const [signatures, setSignatures] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio-guestbook');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [visitorCount, setVisitorCount] = useState(14892);
  const [activeCount, setActiveCount] = useState(17);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('Builder');
  const [submitted, setSubmitted] = useState(false);
  const [likedMap, setLikedMap] = useState({});

  // Real-time visitor oscillation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCount((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(12, Math.min(28, prev + delta));
      });
      setVisitorCount((prev) => prev + (Math.random() > 0.6 ? 1 : 0));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const newSig = {
      id: `sig-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Software Engineer',
      company: company.trim() || 'Tech Explorer',
      message: message.trim(),
      badge: selectedBadge,
      timestamp: 'Just now',
      likes: 1,
      avatar: getInitialsAvatar(name.trim())
    };

    const updated = [newSig, ...signatures];
    setSignatures(updated);
    try {
      localStorage.setItem('portfolio-guestbook', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setName('');
    setRole('');
    setCompany('');
    setMessage('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const handleLike = (id) => {
    if (likedMap[id]) return;
    setLikedMap((prev) => ({ ...prev, [id]: true }));
    setSignatures((prev) =>
      prev.map((sig) => (sig.id === id ? { ...sig, likes: sig.likes + 1 } : sig))
    );
  };

  const badgeOptions = [
    { label: 'Builder', color: 'border-sky-500/40 text-sky-400 bg-sky-500/10' },
    { label: 'Hacker', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
    { label: 'Leader', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    { label: 'AI Explorer', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' }
  ];

  return (
    <section id="visitors" className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative font-sans scroll-mt-12">
      {/* Background Accent Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-20"
        style={{ background: 'var(--theme-accent, #38bdf8)' }}
      />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-medium mb-4 glass-card"
          style={{
            borderColor: 'var(--theme-border, rgba(255,255,255,0.1))',
            color: 'var(--theme-accent, #38bdf8)'
          }}
        >
          <Users className="w-3.5 h-3.5" />
          <span>COMMUNITY &amp; GUESTBOOK</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-black tracking-tight mb-4"
          style={{ color: 'var(--theme-text, #f8fafc)' }}
        >
          Global Builders <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400">&amp; Visitors</span>
        </motion.h2>

        <p className="text-sm md:text-base text-slate-400 font-sans leading-relaxed">
          Real-time global telemetry and open guestbook for collaborators, teammates, hackathon partners, and mentors.
        </p>
      </div>

      {/* Live Telemetry Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14 relative z-10">
        {/* Total Visitors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 rounded-2xl border backdrop-blur-xl flex items-center justify-between glass-card"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Total Worldwide Hits</span>
            </div>
            <div className="text-3xl font-black font-mono tracking-tight text-white">
              {visitorCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-mono">
              <TrendingUp className="w-3 h-3" />
              <span>+14.2% traffic this week</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Globe className="w-6 h-6 animate-spin-slow" />
          </div>
        </motion.div>

        {/* Live Active Builders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl border backdrop-blur-xl flex items-center justify-between glass-card"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Active Right Now</span>
            </div>
            <div className="text-3xl font-black font-mono tracking-tight text-emerald-400">
              {activeCount} <span className="text-sm font-normal text-slate-400 font-sans">peers live</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Global real-time activity</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Guestbook Signatures */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border backdrop-blur-xl flex items-center justify-between glass-card"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Signatures Left</span>
            </div>
            <div className="text-3xl font-black font-mono tracking-tight text-amber-400">
              {signatures.length} <span className="text-sm font-normal text-slate-400 font-sans">notes</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
              <Award className="w-3 h-3 text-purple-400" />
              <span>Saved on this device</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Sign Guestbook Form + Signature Wall */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Form: Sign The Guestbook */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-5 p-6 md:p-8 rounded-2xl border backdrop-blur-xl flex flex-col justify-between glass-card"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Send className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Leave Your Signature</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Drop a quick hello, review a project, or share a note for Divyanshu. It will appear live on the wall!
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  maxLength={60}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-all"
                  style={{ borderColor: 'var(--theme-border, rgba(255,255,255,0.1))' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Founder / Engineer"
                    maxLength={80}
                    className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-all"
                    style={{ borderColor: 'var(--theme-border, rgba(255,255,255,0.1))' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Org / Campus
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. IIT / Startup"
                    maxLength={80}
                    className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-all"
                    style={{ borderColor: 'var(--theme-border, rgba(255,255,255,0.1))' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Choose Vibe Badge
                </label>
                <div className="flex flex-wrap gap-2">
                  {badgeOptions.map((b) => (
                    <button
                      type="button"
                      key={b.label}
                      onClick={() => setSelectedBadge(b.label)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all ${
                        selectedBadge === b.label
                          ? `${b.color} font-bold ring-1 ring-sky-400/30 scale-105`
                          : 'border-slate-700/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Message / Feedback *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hey Divyanshu, love the SIH projects and computer vision benchmarks..."
                  maxLength={500}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-all resize-none"
                  style={{ borderColor: 'var(--theme-border, rgba(255,255,255,0.1))' }}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #38bdf8 100%)',
                  color: '#0f172a'
                }}
              >
                <Send className="w-4 h-4" />
                <span>Publish to Wall</span>
              </button>
            </form>
          </div>

          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you! Your note has been pinned to the guestbook wall.</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Anti-spam protected
            </span>
            <span>Messages are saved on this device only.</span>
          </div>
        </motion.div>

        {/* Right Wall: Live Wall of Signatures */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-7 flex flex-col space-y-4 max-h-[620px] overflow-y-auto pr-2 custom-scrollbar"
        >
          {signatures.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-dashed text-center px-6" style={{ borderColor: 'var(--theme-border, rgba(255,255,255,0.1))' }}>
              <div className="w-12 h-12 mb-3 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1">No notes yet</h4>
              <p className="text-xs text-slate-400 max-w-xs">Be the first to leave a greeting or feedback in the guestbook!</p>
            </div>
          ) : (
            <AnimatePresence>
              {signatures.map((sig, idx) => {
                const hasLiked = likedMap[sig.id];
                const badgeColor =
                  sig.badge === 'Hacker'
                    ? '#10b981'
                    : sig.badge === 'Leader'
                    ? '#f59e0b'
                    : sig.badge === 'AI Explorer'
                    ? '#0ea5e9'
                    : '#a855f7';

                return (
                  <motion.div
                    key={sig.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 group glass-card relative overflow-hidden select-none shadow-sm"
                    style={{
                      background: `linear-gradient(145deg, var(--theme-card) 0%, ${badgeColor}0c 100%)`,
                      borderColor: `${badgeColor}38`,
                      boxShadow: `0 8px 24px -6px ${badgeColor}20, 0 2px 6px -2px ${badgeColor}10`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${badgeColor}80`;
                      e.currentTarget.style.boxShadow = `0 12px 28px -4px ${badgeColor}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${badgeColor}38`;
                      e.currentTarget.style.boxShadow = `0 8px 24px -6px ${badgeColor}20, 0 2px 6px -2px ${badgeColor}10`;
                    }}
                  >
                    {/* Top Badge Color Strip */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(90deg, ${badgeColor}, ${badgeColor}50, transparent)` }}
                    />
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          loading="lazy"
                          decoding="async"
                          src={sig.avatar}
                          alt={sig.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {sig.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wide font-bold shadow-2xs ${
                                sig.badge === 'Hacker'
                                  ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/15'
                                  : sig.badge === 'Leader'
                                  ? 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/15'
                                  : sig.badge === 'AI Explorer'
                                  ? 'border-sky-500/40 text-sky-600 dark:text-sky-400 bg-sky-500/15'
                                  : 'border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/15'
                              }`}
                            >
                              {sig.badge}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 font-sans mt-0.5">
                            {sig.role} {sig.company ? `• ${sig.company}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{sig.timestamp}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3 pl-1 font-sans">
                      "{sig.message}"
                    </p>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60 dark:border-slate-800/40 text-xs">
                      <span className="text-[11px] text-slate-500 font-mono">Verified signature</span>
                      <button
                        onClick={() => handleLike(sig.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          hasLiked
                            ? 'border-rose-500/40 bg-rose-500/10 text-rose-500 font-semibold'
                            : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 text-slate-500 hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500' : ''}`} />
                        <span className="font-mono text-[11px]">{sig.likes}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </section>
  );
}
