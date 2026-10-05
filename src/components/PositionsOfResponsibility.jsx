import React from 'react';
import { motion } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { safeImageSrc } from '../utils/safeHref';
import {
  Users,
  ShieldCheck,
  Briefcase,
  Lightbulb,
  Award,
  Calendar,
  Zap,
  Building2,
  CheckCircle2,
  ChevronRight,
  Terminal,
  Cpu,
  Target,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const roleTypeIcons = {
  'Apex Student Leadership': Users,
  'National Hackathon Leadership': ShieldCheck,
  'Hackathon Organizer': Terminal,
  'Government Initiative': Building2,
  'Institutional': Briefcase,
  'Innovation & Incubation': Lightbulb,
  'International Conference': Award,
};

const skillThemes = {
  // Leadership & Strategy -> Amber / Gold
  'Leadership': { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', color: '#b45309' },
  'Team Leadership': { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', color: '#b45309' },
  'Team Coordination': { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', color: '#b45309' },
  'Event Management': { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', color: '#b45309' },

  // Tech, Evaluation & Hackathons -> Sky / Cyan
  'Hackathon Mentorship': { bg: 'rgba(14, 165, 233, 0.12)', border: 'rgba(14, 165, 233, 0.35)', color: '#0284c7' },
  'Technical Project Evaluation': { bg: 'rgba(14, 165, 233, 0.12)', border: 'rgba(14, 165, 233, 0.35)', color: '#0284c7' },
  'Hackathon Organization': { bg: 'rgba(14, 165, 233, 0.12)', border: 'rgba(14, 165, 233, 0.35)', color: '#0284c7' },
  'Developer Relations': { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.35)', color: '#0891b2' },

  // Community, PR & Outreach -> Pink / Rose / Violet
  'Community Building': { bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.35)', color: '#be185d' },
  'Sponsorship Outreach': { bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.35)', color: '#be185d' },
  'Sponsorship & PR': { bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.35)', color: '#be185d' },

  // Government & Operations -> Emerald / Teal / Purple
  'MoE Coordination': { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#047857' },
  'Government Programs': { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#047857' },
  'Program Management': { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#047857' },
  'Operations': { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#047857' },
  'Hackathon Operations': { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#047857' },
  'Event Operations': { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#047857' },
  'Budgeting': { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.35)', color: '#7e22ce' },
  'Logistics & Hospitality': { bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.35)', color: '#4338ca' },
};

const fallbackSkillPalette = [
  { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', color: '#b45309' },
  { bg: 'rgba(14, 165, 233, 0.12)', border: 'rgba(14, 165, 233, 0.35)', color: '#0284c7' },
  { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#047857' },
  { bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.35)', color: '#be185d' },
  { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.35)', color: '#7e22ce' },
];

function getSkillTheme(skill, sIdx) {
  if (skillThemes[skill]) return skillThemes[skill];
  return fallbackSkillPalette[sIdx % fallbackSkillPalette.length];
}

function getHighlightIcon(text) {
  const lower = text.toLowerCase();
  if (lower.includes('sponsorship') || lower.includes('corporate') || lower.includes('budget')) {
    return { icon: TrendingUp, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.35)' };
  }
  if (lower.includes('volunteer') || lower.includes('team') || lower.includes('hospitality') || lower.includes('community')) {
    return { icon: Users, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.14)', border: 'rgba(236, 72, 153, 0.35)' };
  }
  if (lower.includes('government') || lower.includes('moe') || lower.includes('ministry') || lower.includes('protocol')) {
    return { icon: ShieldCheck, color: '#10b981', bg: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.35)' };
  }
  if (lower.includes('hackathon') || lower.includes('judging') || lower.includes('evaluation') || lower.includes('hardware')) {
    return { icon: Zap, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.14)', border: 'rgba(14, 165, 233, 0.35)' };
  }
  if (lower.includes('head') || lower.includes('spearheaded') || lower.includes('founded') || lower.includes('award')) {
    return { icon: Award, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.14)', border: 'rgba(139, 92, 246, 0.35)' };
  }
  return { icon: Target, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.14)', border: 'rgba(56, 189, 248, 0.35)' };
}

export default function PositionsOfResponsibility() {
  const { data } = usePortfolioData();
  const roles = data?.positionsOfResponsibility && data.positionsOfResponsibility.length > 0 ? data.positionsOfResponsibility : portfolioData.positionsOfResponsibility || [];

  return (
    <section id="responsibility" className="py-28 px-6 md:px-12 max-w-5xl mx-auto scroll-mt-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center md:text-left"
      >
        <span className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-amber-400 uppercase mb-3">
          <Users className="w-3.5 h-3.5" />
          Leadership &amp; Governance
        </span>
        <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tight text-slate-100 mt-1">
          Positions of{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Responsibility
          </span>
        </h2>
        <p className="text-slate-400 text-sm md:text-base mt-3 max-w-2xl leading-relaxed">
          Elected university leadership, national government program coordination, corporate recruitment outreach, and innovation mentorship.
        </p>
      </motion.div>

      {/* Leadership Timeline / Grid */}
      <div className="space-y-6">
        {roles.map((role, idx) => {
          const IconComponent = roleTypeIcons[role.type] || Briefcase;
          const accentColor = role.badgeColor || '#f59e0b';

          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="p-6 sm:p-8 rounded-3xl glass-card border shimmer glow-border transition-all duration-300 relative overflow-hidden group select-none shadow-md"
              style={{
                background: `linear-gradient(145deg, var(--theme-card) 0%, ${accentColor}0e 100%)`,
                borderColor: `${accentColor}40`,
                boxShadow: `0 14px 40px -10px ${accentColor}25, 0 2px 10px -2px ${accentColor}15`,
                '--role-accent': accentColor,
                '--glow-hover-gradient': `linear-gradient(135deg, ${accentColor}20, rgba(99, 102, 241, 0.14), ${accentColor}0c)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${accentColor}70`;
                e.currentTarget.style.boxShadow = `0 16px 36px -8px ${accentColor}25, 0 2px 10px -2px ${accentColor}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${accentColor}40`;
                e.currentTarget.style.boxShadow = `0 14px 40px -10px ${accentColor}25, 0 2px 10px -2px ${accentColor}15`;
              }}
            >
              {/* Top Vibrant Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none z-10"
                style={{
                  background: `linear-gradient(90deg, ${accentColor}, ${accentColor}55, transparent)`,
                }}
              />

              {/* Ambient Corner Glow - low brightness for razor-sharp text readability */}
              <div
                className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl opacity-5 group-hover:opacity-15 pointer-events-none transition-opacity duration-500"
                style={{ background: accentColor }}
              />

              {/* Header Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
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
                    {role.period}
                  </span>

                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold shadow-xs"
                    style={{
                      background: `${accentColor}14`,
                      borderColor: `${accentColor}40`,
                      color: accentColor,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                    }}
                  >
                    <IconComponent className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    {role.type}
                  </span>
                </div>

                {role.metric && (
                  <span
                    className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border shadow-xs"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
                      borderColor: `${accentColor}50`,
                      color: accentColor,
                    }}
                  >
                    {role.metric}
                  </span>
                )}
              </div>

              {/* Title & Organization - Solid Contrast */}
              <div className="mb-5 relative z-10 flex items-start gap-3.5 sm:gap-4">
                {role.logo ? (
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-1 shrink-0 flex items-center justify-center overflow-hidden bg-white/95 dark:bg-slate-900/90 shadow-md transition-all duration-300 group-hover:scale-105"
                    style={{
                      border: `1.5px solid ${accentColor}55`,
                      boxShadow: `0 4px 16px -2px ${accentColor}25`
                    }}
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src={safeImageSrc(role.logo)}
                      alt={`${role.company} logo`}
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
                    {role.role}
                  </h3>
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-mono mt-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                    <span className="truncate">{role.company}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-5 font-sans relative z-10">
                {role.description}
              </p>

              {/* Key Bullet Highlights with Custom Colorful Icons */}
              {role.highlights && role.highlights.length > 0 && (
                <div
                  className="space-y-2.5 mb-5 p-4 sm:p-5 rounded-2xl relative z-10 shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}0a 0%, ${accentColor}02 100%)`,
                    border: `1px solid ${accentColor}30`,
                  }}
                >
                  {role.highlights.map((item, hIdx) => {
                    const hIconInfo = getHighlightIcon(item);
                    const HIcon = hIconInfo.icon;
                    return (
                      <div key={hIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-sans">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 shadow-xs"
                          style={{ background: hIconInfo.bg, color: hIconInfo.color, border: `1px solid ${hIconInfo.border}` }}
                        >
                          <HIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium leading-relaxed">{item}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Skills Tags with Domain-Specific Colorful Badges */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200/50 dark:border-white/5 relative z-10">
                {role.skills.map((skill, sIdx) => {
                  const sTheme = getSkillTheme(skill, sIdx);
                  return (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all shadow-xs hover:scale-105 cursor-default"
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
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
