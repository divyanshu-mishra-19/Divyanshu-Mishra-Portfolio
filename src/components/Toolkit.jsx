import React from 'react';
import { motion } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { Code, Terminal, Layers, Database, Cpu, Wrench, Zap } from 'lucide-react';

const categoryConfig = {
  Frontend: {
    icon: <Layers className="w-3.5 h-3.5" />,
    color: '#0ea5e9',
    textColor: '#0284c7',
    bg: 'rgba(14, 165, 233, 0.12)',
    border: 'rgba(14, 165, 233, 0.35)',
  },
  Backend: {
    icon: <Terminal className="w-3.5 h-3.5" />,
    color: '#10b981',
    textColor: '#047857',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
  },
  Database: {
    icon: <Database className="w-3.5 h-3.5" />,
    color: '#a855f7',
    textColor: '#7e22ce',
    bg: 'rgba(168, 85, 247, 0.12)',
    border: 'rgba(168, 85, 247, 0.35)',
  },
  Systems: {
    icon: <Cpu className="w-3.5 h-3.5" />,
    color: '#f43f5e',
    textColor: '#be123c',
    bg: 'rgba(244, 63, 94, 0.12)',
    border: 'rgba(244, 63, 94, 0.35)',
  },
  Tools: {
    icon: <Wrench className="w-3.5 h-3.5" />,
    color: '#f59e0b',
    textColor: '#b45309',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
  },
  Languages: {
    icon: <Code className="w-3.5 h-3.5" />,
    color: '#6366f1',
    textColor: '#4338ca',
    bg: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.35)',
  },
};

export default function Toolkit() {
  const { data } = usePortfolioData();
  const skills = data?.skills && data.skills.length > 0 ? data.skills : portfolioData.skills;
  const doubled = [...skills, ...skills];

  return (
    <section id="skills" className="py-28 px-6 md:px-12 max-w-6xl mx-auto text-center overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <span className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-sky-400 uppercase mb-3">
          <Zap className="w-3.5 h-3.5" />
          Technical Skills
        </span>
        <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tight text-slate-100 mt-1">
          My{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Toolkit
          </span>
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto mt-4 text-sm md:text-base">
          The stack I reach for when shipping products end-to-end.
        </p>
      </motion.div>

      {/* Scrolling Marquee Row 1 */}
      <div className="relative mb-8 overflow-hidden" style={{ maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)' }}>
        <div className="marquee-track">
          {doubled.slice(0, doubled.length / 2 + 2).concat(doubled.slice(0, doubled.length / 2 + 2)).map((skill, i) => {
            const cfg = categoryConfig[skill.category] || categoryConfig['Languages'];
            return (
              <motion.div
                key={`${skill.name}-${i}`}
                className="flex-shrink-0 mx-3 flex items-center gap-3 px-4 py-2.5 rounded-2xl border glass-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default shadow-xs"
                style={{
                  borderColor: `${skill.color}40`,
                  background: `linear-gradient(145deg, var(--theme-card) 0%, ${skill.color}0a 100%)`,
                  boxShadow: `0 6px 20px -6px ${skill.color}20`,
                }}
                whileHover={{ scale: 1.06, y: -4 }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black font-mono shadow-xs"
                  style={{
                    background: `linear-gradient(135deg, ${skill.color}22, ${skill.color}0e)`,
                    color: skill.color,
                    border: `1px solid ${skill.color}45`,
                  }}
                >
                  {skill.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block whitespace-nowrap">{skill.name}</span>
                  <span className="text-[10px] font-mono font-semibold" style={{ color: cfg.textColor || cfg.color }}>{skill.category}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Grid view */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-10">
        {skills.map((skill, idx) => {
          const cfg = categoryConfig[skill.category] || categoryConfig['Languages'];
          return (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.03 }}
              whileHover={{ y: -8, scale: 1.05 }}
              className="group relative p-5 rounded-2xl glass-card border flex flex-col items-center justify-center gap-3 overflow-hidden cursor-default transition-all duration-300 shadow-sm"
              style={{
                background: `linear-gradient(145deg, var(--theme-card) 0%, ${skill.color}0e 100%)`,
                borderColor: `${skill.color}40`,
                boxShadow: `0 10px 30px -8px ${skill.color}25, 0 2px 8px -2px ${skill.color}15`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${skill.color}65`;
                e.currentTarget.style.boxShadow = `0 12px 28px -6px ${skill.color}25, 0 2px 8px -2px ${skill.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${skill.color}40`;
                e.currentTarget.style.boxShadow = `0 10px 30px -8px ${skill.color}25, 0 2px 8px -2px ${skill.color}15`;
              }}
            >
              {/* Top Brand Color Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, ${skill.color}, ${skill.color}60, transparent)` }}
              />

              {/* Ambient Brand Glow - low brightness for sharp readability */}
              <div
                className="absolute inset-0 opacity-5 group-hover:opacity-15 transition-opacity duration-400 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(circle at 50% 15%, ${skill.color} 0%, transparent 75%)` }}
              />

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black font-mono shadow-xs transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${skill.color}24, ${skill.color}0e)`,
                  color: skill.color,
                  border: `1px solid ${skill.color}45`,
                }}
              >
                {skill.name.substring(0, 2).toUpperCase()}
              </div>

              {/* Name & Category - Always High Contrast */}
              <div className="flex flex-col items-center gap-1.5 w-full">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-black dark:group-hover:text-white text-center leading-tight transition-colors">
                  {skill.name}
                </span>
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full shadow-xs"
                  style={{
                    color: cfg.textColor || cfg.color,
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                  }}
                >
                  {cfg.icon}
                  {skill.category}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
