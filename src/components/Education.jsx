import React from 'react';
import { motion } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { safeImageSrc } from '../utils/safeHref';
import {
  GraduationCap,
  Calendar,
  Building2,
  Award,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Trophy,
  Zap,
  Star,
  Cpu,
  Layers,
  Compass,
  Code
} from 'lucide-react';

const educationThemes = {
  'nit-btech': {
    accent: '#0ea5e9',
    accentText: '#0284c7',
    glow: 'rgba(14, 165, 233, 0.28)',
    topGradient: 'linear-gradient(90deg, #0ea5e9, #38bdf8, #818cf8)',
    gradeBadge: 'linear-gradient(135deg, rgba(14, 165, 233, 0.22), rgba(99, 102, 241, 0.18))',
    iconColor: '#38bdf8',
    panelBg: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(14, 165, 233, 0.02) 100%)',
    panelBorder: 'rgba(14, 165, 233, 0.25)',
  },
  'nit-nagaland': {
    accent: '#0ea5e9',
    accentText: '#0284c7',
    glow: 'rgba(14, 165, 233, 0.28)',
    topGradient: 'linear-gradient(90deg, #0ea5e9, #38bdf8, #818cf8)',
    gradeBadge: 'linear-gradient(135deg, rgba(14, 165, 233, 0.22), rgba(99, 102, 241, 0.18))',
    iconColor: '#38bdf8',
    panelBg: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(14, 165, 233, 0.02) 100%)',
    panelBorder: 'rgba(14, 165, 233, 0.25)',
  },
  'blooming-buds-xii': {
    accent: '#a855f7',
    accentText: '#7e22ce',
    glow: 'rgba(168, 85, 247, 0.28)',
    topGradient: 'linear-gradient(90deg, #a855f7, #c084fc, #ec4899)',
    gradeBadge: 'linear-gradient(135deg, rgba(168, 85, 247, 0.22), rgba(236, 72, 153, 0.18))',
    iconColor: '#c084fc',
    panelBg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.02) 100%)',
    panelBorder: 'rgba(168, 85, 247, 0.25)',
  },
  'blooming-buds-x': {
    accent: '#10b981',
    accentText: '#047857',
    glow: 'rgba(16, 185, 129, 0.28)',
    topGradient: 'linear-gradient(90deg, #10b981, #34d399, #06b6d4)',
    gradeBadge: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(6, 182, 212, 0.18))',
    iconColor: '#34d399',
    panelBg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)',
    panelBorder: 'rgba(16, 185, 129, 0.25)',
  },
};

const subjectThemes = {
  // AI, ML & Data Science -> Purple / Indigo
  'Applied Machine Learning & Computer Vision': { bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.35)', color: '#7c3aed', icon: Sparkles },
  'Computer Science (Python & Database Fundamentals)': { bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.35)', color: '#7c3aed', icon: Code },
  'Information Technology Fundamentals': { bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.35)', color: '#7c3aed', icon: Cpu },

  // Systems / Hardware / Microcontrollers -> Emerald / Mint
  'Microcontrollers & Embedded Systems (C/C++)': { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#047857', icon: Cpu },
  'Data Structures & Object-Oriented Programming': { bg: 'rgba(14, 165, 233, 0.12)', border: 'rgba(14, 165, 233, 0.35)', color: '#0284c7', icon: Layers },

  // Electrical, Signals, Hardware & Analog -> Amber / Orange / Cyan / Rose
  'Circuit Theory & Network Analysis': { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', color: '#b45309', icon: Zap },
  'Signals & Systems Processing': { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.35)', color: '#0e7490', icon: Compass },
  'Control Systems Engineering': { bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.35)', color: '#be123c', icon: ShieldCheck },
  'Power Electronics & Analog Circuits': { bg: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.35)', color: '#a16207', icon: Zap },

  // School Foundations
  'Physics': { bg: 'rgba(14, 165, 233, 0.12)', border: 'rgba(14, 165, 233, 0.35)', color: '#0284c7', icon: Zap },
  'Chemistry': { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#047857', icon: Sparkles },
  'Mathematics (Calculus, Vectors, Algebra)': { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.35)', color: '#7e22ce', icon: Compass },
  'Mathematics & Geometry': { bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.35)', color: '#4338ca', icon: Compass },
  'General Science (Physics, Chemistry, Biology)': { bg: 'rgba(20, 184, 166, 0.12)', border: 'rgba(20, 184, 166, 0.35)', color: '#0f766e', icon: Sparkles },
  'Social Sciences': { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', color: '#b45309', icon: BookOpen },
  'English Core': { bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.35)', color: '#be123c', icon: Award },
};

const fallbackSubjectPalette = [
  { bg: 'rgba(14, 165, 233, 0.12)', border: 'rgba(14, 165, 233, 0.35)', color: '#0284c7' },
  { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.35)', color: '#7e22ce' },
  { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#047857' },
  { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', color: '#b45309' },
  { bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.35)', color: '#be123c' },
  { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.35)', color: '#0e7490' },
];

function getSubjectTheme(subject, sIdx) {
  if (subjectThemes[subject]) return subjectThemes[subject];
  return fallbackSubjectPalette[sIdx % fallbackSubjectPalette.length];
}

function getMilestoneTheme(text) {
  const lower = text.toLowerCase();
  if (lower.includes('cgpa') || lower.includes('distinction') || lower.includes('89%') || lower.includes('93%') || lower.includes('standing')) {
    return { icon: Award, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.38)' };
  }
  if (lower.includes('secretary') || lower.includes('coordinator') || lower.includes('leadership')) {
    return { icon: ShieldCheck, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.14)', border: 'rgba(14, 165, 233, 0.38)' };
  }
  if (lower.includes('hackdays') || lower.includes('organizer') || lower.includes('brahma')) {
    return { icon: Zap, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.14)', border: 'rgba(236, 72, 153, 0.38)' };
  }
  if (lower.includes('finalist') || lower.includes('top 5') || lower.includes('trophy')) {
    return { icon: Trophy, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.14)', border: 'rgba(139, 92, 246, 0.38)' };
  }
  if (lower.includes('prize') || lower.includes('ideathon') || lower.includes('1st')) {
    return { icon: Sparkles, color: '#10b981', bg: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.38)' };
  }
  if (lower.includes('merit') || lower.includes('certificate') || lower.includes('mathematics')) {
    return { icon: Star, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.14)', border: 'rgba(168, 85, 247, 0.38)' };
  }
  return { icon: CheckCircle2, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.14)', border: 'rgba(56, 189, 248, 0.38)' };
}

function getEduTheme(edu, idx) {
  if (educationThemes[edu.id]) return educationThemes[edu.id];
  const color = edu.badgeColor || (idx === 0 ? '#0ea5e9' : idx === 1 ? '#a855f7' : '#10b981');
  return {
    accent: color,
    accentText: color,
    glow: `${color}35`,
    topGradient: `linear-gradient(90deg, ${color}, ${color}60, transparent)`,
    gradeBadge: `linear-gradient(135deg, ${color}20, ${color}10)`,
    iconColor: color,
    panelBg: `linear-gradient(135deg, ${color}10 0%, ${color}03 100%)`,
    panelBorder: `${color}30`,
  };
}

export default function Education() {
  const { data } = usePortfolioData();
  const educationList = data?.education && data.education.length > 0 ? data.education : portfolioData.education || [];

  return (
    <section id="education" className="py-28 px-6 md:px-12 max-w-5xl mx-auto scroll-mt-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center md:text-left"
      >
        <span className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-sky-400 uppercase mb-3">
          <GraduationCap className="w-3.5 h-3.5" />
          Academic Background
        </span>
        <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tight text-slate-100 mt-1">
          Education &amp;{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Coursework
          </span>
        </h2>
        <p className="text-slate-400 text-sm md:text-base mt-3 max-w-2xl leading-relaxed">
          National Institute of Technology engineering foundations, core mathematics and computer science distinctions.
        </p>
      </motion.div>

      {/* Education Cards */}
      <div className="space-y-8">
        {educationList.map((edu, idx) => {
          const theme = getEduTheme(edu, idx);
          const accentColor = theme.accent;

          return (
            <motion.div
              key={edu.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: idx * 0.1 }}
              className="p-6 sm:p-8 rounded-3xl glass-card border shimmer glow-border transition-all duration-300 relative overflow-hidden group select-none shadow-md"
              style={{
                background: `linear-gradient(145deg, var(--theme-card) 0%, ${accentColor}0e 100%)`,
                borderColor: `${accentColor}40`,
                boxShadow: `0 14px 40px -10px ${theme.glow}, 0 2px 10px -2px ${accentColor}20`,
                '--glow-hover-gradient': `linear-gradient(135deg, ${accentColor}20, rgba(99, 102, 241, 0.14), ${accentColor}0c)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${accentColor}70`;
                e.currentTarget.style.boxShadow = `0 16px 36px -8px ${theme.glow}, 0 2px 10px -2px ${accentColor}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${accentColor}40`;
                e.currentTarget.style.boxShadow = `0 14px 40px -10px ${theme.glow}, 0 2px 10px -2px ${accentColor}20`;
              }}
            >
              {/* Top Colorful Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none z-10"
                style={{ background: theme.topGradient }}
              />

              {/* Ambient Corner Glow - gentle and soft to preserve text readability */}
              <div
                className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl opacity-5 group-hover:opacity-15 pointer-events-none transition-opacity duration-500"
                style={{ background: accentColor }}
              />

              {/* Top Banner Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 relative z-10">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold shadow-xs"
                    style={{
                      background: `${accentColor}18`,
                      color: accentColor,
                      border: `1px solid ${accentColor}45`,
                    }}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {edu.period}
                  </span>

                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold shadow-xs"
                    style={{
                      background: `${accentColor}14`,
                      border: `1px solid ${accentColor}40`,
                      color: accentColor,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
                    {edu.status}
                  </span>
                </div>

                <div
                  className="px-3.5 py-1.5 rounded-2xl border font-mono text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm"
                  style={{
                    background: theme.gradeBadge,
                    borderColor: `${accentColor}55`,
                    color: accentColor,
                  }}
                >
                  <Award className="w-4 h-4" style={{ color: accentColor }} />
                  <span>{edu.grade}</span>
                </div>
              </div>

              {/* Institution & Degree - Razor-sharp contrast with Crest / Logo */}
              <div className="mb-5 relative z-10 flex items-start gap-3.5 sm:gap-4">
                {edu.logo ? (
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-1 shrink-0 flex items-center justify-center overflow-hidden bg-white/95 dark:bg-slate-900/90 shadow-md transition-all duration-300 group-hover:scale-105"
                    style={{
                      border: `1.5px solid ${accentColor}55`,
                      boxShadow: `0 4px 16px -2px ${theme.glow}`
                    }}
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src={safeImageSrc(edu.logo)}
                      alt={`${edu.institution} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }
                      }}
                    />
                    <div
                      className="hidden w-full h-full items-center justify-center"
                      style={{ background: `${accentColor}18`, color: accentColor }}
                    >
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-all duration-300 group-hover:scale-105"
                    style={{
                      background: `${accentColor}18`,
                      color: accentColor,
                      border: `1.5px solid ${accentColor}40`,
                    }}
                  >
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold font-sans text-slate-900 dark:text-slate-100 transition-colors leading-snug">
                    {edu.degree}
                  </h3>
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-mono mt-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                    <span className="truncate">{edu.institution}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-sans relative z-10">
                {edu.description}
              </p>

              {/* Key Coursework Pills with Domain-Specific Color Palette */}
              {edu.coursework && edu.coursework.length > 0 && (
                <div className="mb-6 space-y-2.5 relative z-10">
                  <h4
                    className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2"
                    style={{ color: accentColor }}
                  >
                    <BookOpen className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    <span>Key Subjects &amp; Engineering Disciplines</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {edu.coursework.map((subject, sIdx) => {
                      const sTheme = getSubjectTheme(subject, sIdx);
                      const SubIcon = sTheme.icon || Sparkles;
                      return (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all shadow-xs hover:scale-105 cursor-default"
                          style={{
                            background: sTheme.bg,
                            borderColor: sTheme.border,
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            color: sTheme.color,
                          }}
                        >
                          <SubIcon className="w-3 h-3 shrink-0" style={{ color: sTheme.color }} />
                          <span>{subject}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Academic Highlights & Distinctions (Colorful Mini-Cards) */}
              {edu.highlights && edu.highlights.length > 0 && (
                <div
                  className="p-4 sm:p-5 rounded-2xl space-y-3 shadow-sm relative z-10"
                  style={{
                    background: theme.panelBg,
                    border: `1px solid ${theme.panelBorder}`,
                  }}
                >
                  <span
                    className="text-[11px] font-mono uppercase tracking-wider font-bold block flex items-center gap-2"
                    style={{ color: accentColor }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Academic Distinction &amp; Milestones
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {edu.highlights.map((item, hIdx) => {
                      const mTheme = getMilestoneTheme(item);
                      const MIcon = mTheme.icon;
                      return (
                        <div
                          key={hIdx}
                          className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 shadow-xs"
                          style={{
                            background: `linear-gradient(135deg, var(--theme-card) 0%, ${mTheme.color}0a 100%)`,
                            borderColor: mTheme.border,
                          }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                            style={{ background: mTheme.bg, color: mTheme.color, border: `1px solid ${mTheme.border}` }}
                          >
                            <MIcon className="w-4 h-4" />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 font-sans leading-snug">
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
