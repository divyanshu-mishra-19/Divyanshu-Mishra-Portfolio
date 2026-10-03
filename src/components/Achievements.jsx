import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { safeHref, safeImageSrc } from '../utils/safeHref';
import {
  Trophy,
  Award,
  Zap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Printer,
  Copy,
  Check,
  X,
  FileCheck,
  Images,
  Maximize2
} from 'lucide-react';

const achievementThemes = {
  'capabl-saksham-hackathon': {
    accent: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.25)',
    border: 'rgba(168, 85, 247, 0.35)',
    borderHover: 'rgba(168, 85, 247, 0.8)',
    topBarGradient: 'linear-gradient(90deg, #a855f7, #ec4899, #8b5cf6)',
    badgeClass: 'from-purple-500/25 to-violet-500/25 border-purple-500/50 text-purple-200',
    highlightBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    iconColor: '#c084fc',
    actionText: 'text-purple-400 group-hover:text-purple-300',
  },
  'national-ideathon-1st-prize': {
    accent: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.25)',
    border: 'rgba(245, 158, 11, 0.35)',
    borderHover: 'rgba(245, 158, 11, 0.8)',
    topBarGradient: 'linear-gradient(90deg, #f59e0b, #fbbf24, #ea580c)',
    badgeClass: 'from-amber-500/25 to-yellow-500/25 border-amber-500/50 text-amber-200',
    highlightBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    iconColor: '#fbbf24',
    actionText: 'text-amber-400 group-hover:text-amber-300',
  },
  'bharatiya-antariksh-hackathon': {
    accent: '#0ea5e9',
    glow: 'rgba(14, 165, 233, 0.25)',
    border: 'rgba(14, 165, 233, 0.35)',
    borderHover: 'rgba(14, 165, 233, 0.8)',
    topBarGradient: 'linear-gradient(90deg, #0ea5e9, #38bdf8, #6366f1)',
    badgeClass: 'from-sky-500/25 to-cyan-500/25 border-sky-500/50 text-sky-200',
    highlightBg: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
    iconColor: '#38bdf8',
    actionText: 'text-sky-400 group-hover:text-sky-300',
  },
  'mr-talent-nit-nagaland': {
    accent: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.25)',
    border: 'rgba(244, 63, 94, 0.35)',
    borderHover: 'rgba(244, 63, 94, 0.8)',
    topBarGradient: 'linear-gradient(90deg, #f43f5e, #fb7185, #f59e0b)',
    badgeClass: 'from-rose-500/25 to-pink-500/25 border-rose-500/50 text-rose-200',
    highlightBg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
    iconColor: '#fb7185',
    actionText: 'text-rose-400 group-hover:text-rose-300',
  },
};

function getAchievementTheme(achievement) {
  if (achievementThemes[achievement.id]) {
    return achievementThemes[achievement.id];
  }
  const badgeStr = (achievement.badge || '').toLowerCase();
  if (badgeStr.includes('hackathon')) return achievementThemes['capabl-saksham-hackathon'];
  if (badgeStr.includes('prize') || badgeStr.includes('winner') || badgeStr.includes('1st')) return achievementThemes['national-ideathon-1st-prize'];
  if (badgeStr.includes('isro') || badgeStr.includes('space')) return achievementThemes['bharatiya-antariksh-hackathon'];
  return achievementThemes['mr-talent-nit-nagaland'];
}

const badgeColors = {
  'National Hackathon': 'from-violet-500/25 to-purple-500/25 border-violet-500/40 text-violet-300',
  '1st Prize': 'from-amber-500/25 to-yellow-500/25 border-amber-500/40 text-amber-300',
  'ISRO / Space Tech': 'from-sky-500/25 to-blue-500/25 border-sky-500/40 text-sky-300',
  'NIT Nagaland': 'from-rose-500/25 to-pink-500/25 border-rose-500/40 text-rose-300',
};

// =========================================================================
// INTERACTIVE ACHIEVEMENT & MULTI-IMAGE CERTIFICATE MODAL
// =========================================================================
function AchievementModal({ achievement, initialTab = 'certificate', onClose }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'certificate' | 'overview' | 'photos'
  const [copied, setCopied] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!achievement) return null;

  const {
    title,
    desc,
    year,
    badge,
    issuer,
    category,
    images = [],
    detailedDescription,
    keyHighlights = [],
    skills = [],
    certificate
  } = achievement;

  const handleCopyId = () => {
    if (certificate?.credentialId) {
      navigator.clipboard.writeText(certificate.credentialId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
        className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl border shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden z-10 my-auto glass-card"
        style={{
          background: 'var(--theme-card-solid, #0f172a)',
          borderColor: 'var(--theme-border, rgba(255, 255, 255, 0.12))',
        }}
      >
        {/* Modal Top Bar */}
        <div
          className="p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3 bg-slate-900/40"
          style={{ borderColor: 'var(--theme-border, rgba(255, 255, 255, 0.08))' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-gradient-to-r ${badgeColors[badge] || 'border-amber-500/30 text-amber-300'}`}>
                  {badge}
                </span>
                <span className="text-xs font-mono text-slate-400">{year}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight leading-snug line-clamp-1 font-sans">
                {title}
              </h3>
            </div>
          </div>

          {/* Tab Switcher & Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-mono">
              <button
                onClick={() => setActiveTab('certificate')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'certificate'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                type="button"
              >
                Certificate
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'photos'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                type="button"
              >
                <Images className="w-3.5 h-3.5" />
                <span>Photos ({images.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                type="button"
              >
                Case Study
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-white/10 bg-slate-950/70 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {activeTab === 'certificate' && certificate && (
            <div className="space-y-6">
              {/* Authenticated Certificate Card */}
              <div
                className="relative rounded-2xl border-2 p-6 sm:p-10 overflow-hidden shadow-inner flex flex-col justify-between min-h-[440px]"
                style={{
                  background: 'radial-gradient(ellipse at 50% 30%, #1e293b 0%, #090d16 100%)',
                  borderColor: 'rgba(245, 158, 11, 0.45)',
                  boxShadow: '0 0 50px rgba(245,158,11,0.1), inset 0 0 40px rgba(0,0,0,0.8)',
                }}
              >
                {/* Decorative Guilloche Border Lines */}
                <div className="absolute inset-2 border border-amber-500/20 rounded-xl pointer-events-none" />
                <div className="absolute inset-3 border border-dashed border-amber-500/15 rounded-lg pointer-events-none" />

                {/* Watermark in background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none text-slate-100 font-serif font-black text-8xl tracking-widest uppercase">
                  VERIFIED
                </div>

                {/* Certificate Header */}
                <div className="relative z-10 text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{certificate.status || 'Verified Institute Credential'}</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-slate-100 tracking-tight pt-2">
                    {certificate.organization}
                  </h4>
                  <p className="text-xs sm:text-sm font-mono text-slate-400">
                    CERTIFICATE OF MERIT &amp; EXCELLENCE
                  </p>
                </div>

                {/* Recipient & Reason */}
                <div className="relative z-10 text-center my-6 space-y-3">
                  <p className="text-xs sm:text-sm font-sans text-slate-300 italic">
                    This is proudly presented to
                  </p>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-amber-400 tracking-wide underline decoration-amber-500/40 decoration-wavy underline-offset-8">
                    {portfolioData.profile.name}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto pt-2 font-sans leading-relaxed">
                    in formal recognition of outstanding distinction and technical leadership for{' '}
                    <span className="font-bold text-slate-100">{title}</span>.
                  </p>
                </div>

                {/* Footer Signatories & Gold Seal */}
                <div className="relative z-10 pt-6 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-center">
                  <div className="text-left space-y-1">
                    <p className="font-mono text-xs font-bold text-slate-200">{certificate.signatory1}</p>
                    <p className="text-[10px] font-mono text-slate-500">Authorized Evaluator</p>
                  </div>

                  {/* Gold Seal */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 p-0.5 shadow-lg flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center p-1 text-center border border-amber-400/50">
                        <Award className="w-5 h-5 text-amber-400 mb-0.5" />
                        <span className="text-[8px] font-mono font-black text-amber-300 uppercase leading-none">
                          OFFICIAL
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-amber-400/80 font-bold uppercase tracking-wider mt-1">
                      {certificate.goldSealText || 'SEAL OF EXCELLENCE'}
                    </span>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="font-mono text-xs font-bold text-slate-200">{certificate.signatory2}</p>
                    <p className="text-[10px] font-mono text-slate-500">Organizing Convener</p>
                  </div>
                </div>
              </div>

              {/* Certificate Verification Details Bar */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">CREDENTIAL ID</span>
                    <span className="text-slate-200 font-bold tracking-wider">{certificate.credentialId}</span>
                  </div>
                  <button
                    onClick={handleCopyId}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title="Copy Credential ID"
                    type="button"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                  <span>Issued: <strong className="text-slate-200">{certificate.issueDate}</strong></span>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                    type="button"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                  {certificate.verificationUrl && (
                    <a
                      href={safeHref(certificate.verificationUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold transition-all"
                    >
                      <span>Verify</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Photos Tab (2-3 images for this achievement) */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              {/* Main Photo Viewer */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black/40 flex items-center justify-center group">
                <img
                  loading="lazy"
                  decoding="async"
                  src={safeImageSrc(images[activePhotoIdx] || images[0])}
                  alt={`${title} proof photo ${activePhotoIdx + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Photo Counter Pill */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-mono font-bold">
                  Photo {activePhotoIdx + 1} of {images.length}
                </div>

                {/* Left/Right Navigation Arrows if > 1 photo */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer opacity-90 hover:opacity-100"
                      aria-label="Previous photo"
                      type="button"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActivePhotoIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer opacity-90 hover:opacity-100"
                      aria-label="Next photo"
                      type="button"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative rounded-xl overflow-hidden border-2 aspect-video transition-all cursor-pointer ${
                      activePhotoIdx === idx
                        ? 'border-amber-500 scale-[1.02] shadow-lg shadow-amber-500/20'
                        : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                    }`}
                    type="button"
                  >
                    <img loading="lazy" decoding="async" width={48} height={48} src={safeImageSrc(img)} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Category & Issuer Info */}
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">CATEGORY</span>
                  <span className="text-sm font-sans font-bold text-slate-100">{category}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">AWARDING AUTHORITY</span>
                  <span className="text-sm font-sans font-bold text-amber-300">{issuer}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">YEAR / CYCLE</span>
                  <span className="text-sm font-sans font-bold text-slate-200">{year}</span>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-3">
                <h4 className="text-base font-bold text-slate-100 font-sans flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Engineering Context &amp; Solution
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {detailedDescription}
                </p>
              </div>

              {/* Key Highlights Bullet points */}
              {keyHighlights.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-slate-100 font-sans flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Key Milestones &amp; Impact
                  </h4>
                  <ul className="space-y-2">
                    {keyHighlights.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0 shadow-sm" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills Tags */}
              {skills.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-slate-100 font-sans flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    Demonstrated Competencies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-slate-900/70 border border-white/10 text-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

const achievementSkillPalette = [
  { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.35)', color: '#7e22ce' },
  { bg: 'rgba(14, 165, 233, 0.12)', border: 'rgba(14, 165, 233, 0.35)', color: '#0284c7' },
  { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#047857' },
  { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', color: '#b45309' },
  { bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.35)', color: '#be123c' },
];

function getAchSkillTheme(idx) {
  return achievementSkillPalette[idx % achievementSkillPalette.length];
}

// Individual Achievement Card with Multi-Image Slider & Carousel
function AchievementCard({ achievement, onSelect, onSelectPhotos }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const images = achievement.images || ['/images/workspace.webp'];
  const theme = getAchievementTheme(achievement);

  const nextPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      whileHover={{ y: -6 }}
      onClick={() => onSelect(achievement)}
      className="p-5 rounded-3xl border flex flex-col justify-between gap-5 glass-card shimmer glow-border transition-all duration-300 cursor-pointer group select-none relative overflow-hidden shadow-md"
      style={{
        background: `linear-gradient(145deg, var(--theme-card) 0%, ${theme.accent}0c 100%)`,
        borderColor: `${theme.accent}40`,
        boxShadow: `0 14px 40px -10px ${theme.glow}, 0 2px 8px -2px ${theme.accent}15`,
        '--glow-hover-gradient': `linear-gradient(135deg, ${theme.accent}20, rgba(99, 102, 241, 0.14), ${theme.accent}0c)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = theme.borderHover;
        e.currentTarget.style.boxShadow = `0 16px 36px -8px ${theme.glow}, 0 2px 8px -2px ${theme.accent}15`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${theme.accent}40`;
        e.currentTarget.style.boxShadow = `0 14px 40px -10px ${theme.glow}, 0 2px 8px -2px ${theme.accent}15`;
      }}
    >
      {/* Top Colorful Accent Strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none z-10"
        style={{ background: theme.topBarGradient }}
      />

      {/* Ambient Corner Glow - low brightness for sharp text legibility */}
      <div
        className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-5 group-hover:opacity-15 pointer-events-none transition-opacity duration-500"
        style={{ background: theme.accent }}
      />

      <div>
        {/* Top Image Preview with Multi-Image Controls */}
        <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-4 bg-slate-950 border border-white/10 group/img">
          <img
            loading="lazy"
            decoding="async"
            src={safeImageSrc(images[photoIndex])}
            alt={achievement.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Multiple Photo Dots & Counter */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white z-10">
            <div className="flex items-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoIndex(i);
                  }}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    photoIndex === i ? 'w-4' : 'bg-white/50 hover:bg-white/80'
                  }`}
                  style={{ backgroundColor: photoIndex === i ? theme.accent : undefined }}
                  aria-label={`Go to photo ${i + 1}`}
                  type="button"
                />
              ))}
            </div>
            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold flex items-center gap-1 shadow-xs">
              <Images className="w-3 h-3" style={{ color: theme.accent }} />
              {photoIndex + 1}/{images.length} Photos
            </span>
          </div>

          {/* Quick Prev / Next Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-10"
                aria-label="Previous image"
                type="button"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-10"
                aria-label="Next image"
                type="button"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Badge Overlay */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border bg-gradient-to-r shadow-md backdrop-blur-md ${theme.badgeClass}`}>
              {achievement.badge}
            </span>
          </div>
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="text-[11px] font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md border border-white/10 shadow-xs">
              {achievement.year}
            </span>
          </div>
        </div>

        {/* Content Details - High-Contrast Title */}
        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug mb-2 transition-colors font-sans">
          {achievement.title}
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 font-sans">
          {achievement.desc}
        </p>

        {/* Key Highlight Pill with High-Contrast Text */}
        {achievement.keyHighlights && achievement.keyHighlights.length > 0 && (
          <div
            className="mt-3.5 p-2.5 rounded-xl border text-xs font-mono flex items-center gap-2 shadow-xs"
            style={{
              background: `linear-gradient(135deg, ${theme.accent}14, ${theme.accent}05)`,
              borderColor: `${theme.accent}38`,
            }}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: theme.accent }} />
            <span className="truncate font-bold text-slate-800 dark:text-slate-100">{achievement.keyHighlights[0]}</span>
          </div>
        )}

        {/* Domain-Colored Skills Chips on Card */}
        {achievement.skills && achievement.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-200/50 dark:border-white/5">
            {achievement.skills.slice(0, 4).map((skill, sIdx) => {
              const sTheme = getAchSkillTheme(sIdx);
              return (
                <span
                  key={skill}
                  className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-semibold shadow-2xs cursor-default"
                  style={{
                    background: sTheme.bg,
                    borderColor: sTheme.border,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    color: sTheme.color,
                  }}
                >
                  {skill}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-white/5 text-[11px] font-mono">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectPhotos(achievement);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shadow-xs hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}18, ${theme.accent}08)`,
            borderColor: `${theme.accent}40`,
            borderWidth: '1px',
            borderStyle: 'solid',
            color: theme.accent,
          }}
          type="button"
        >
          <Images className="w-3.5 h-3.5" />
          <span>{images.length} Event Photos</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(achievement);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-xs hover:scale-105 cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, #f59e0b)`,
            color: '#0f172a',
          }}
          type="button"
        >
          <Award className="w-3.5 h-3.5" />
          <span>Certificate</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

// =========================================================================
// MAIN ACHIEVEMENTS COMPONENT
// =========================================================================
export default function Achievements() {
  const { data } = usePortfolioData();
  const achievements = data?.achievements && data.achievements.length > 0 ? data.achievements : portfolioData.achievements || [];
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [modalTab, setModalTab] = useState('certificate');

  const handleOpenCertificate = (ach) => {
    setSelectedAchievement(ach);
    setModalTab('certificate');
  };

  const handleOpenPhotos = (ach) => {
    setSelectedAchievement(ach);
    setModalTab('photos');
  };

  return (
    <section id="achievements" className="py-28 px-6 md:px-12 max-w-6xl mx-auto relative scroll-mt-12">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-amber-400 uppercase mb-3">
              <Trophy className="w-3.5 h-3.5" />
              Honors &amp; Recognitions
            </span>
            <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tight text-slate-100 mt-1">
              Major{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Achievements
              </span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-3 max-w-2xl leading-relaxed">
              National hackathon podium finishes, 1st prize innovation prototypes, and space-tech citations. Each achievement includes verified credentials and multi-image photo proof.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Multi-Image Proof</span>
          </div>
        </div>
      </motion.div>

      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((ach) => (
          <AchievementCard
            key={ach.id}
            achievement={ach}
            onSelect={handleOpenCertificate}
            onSelectPhotos={handleOpenPhotos}
          />
        ))}
      </div>

      {/* Modal Dialog */}
      <AnimatePresence>
        {selectedAchievement && (
          <AchievementModal
            achievement={selectedAchievement}
            initialTab={modalTab}
            onClose={() => setSelectedAchievement(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
