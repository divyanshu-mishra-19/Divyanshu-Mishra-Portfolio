import React from 'react';
import { motion } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import {
  Briefcase, GraduationCap, Calendar, Award,
  ShieldCheck, Users, Lightbulb, Zap
} from 'lucide-react';

const typeConfig = {
  Leadership: {
    icon: <Users className="w-4 h-4" />,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.3)',
  },
  'Government Initiative': {
    icon: <ShieldCheck className="w-4 h-4" />,
    color: '#38bdf8',
    glow: 'rgba(56,189,248,0.15)',
    border: 'rgba(56,189,248,0.3)',
  },
  Innovation: {
    icon: <Lightbulb className="w-4 h-4" />,
    color: '#34d399',
    glow: 'rgba(52,211,153,0.15)',
    border: 'rgba(52,211,153,0.3)',
  },
  Conference: {
    icon: <Award className="w-4 h-4" />,
    color: '#c084fc',
    glow: 'rgba(192,132,252,0.15)',
    border: 'rgba(192,132,252,0.3)',
  },
  Education: {
    icon: <GraduationCap className="w-4 h-4" />,
    color: '#fb7185',
    glow: 'rgba(251,113,133,0.15)',
    border: 'rgba(251,113,133,0.3)',
  },
  Institutional: {
    icon: <Briefcase className="w-4 h-4" />,
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.15)',
    border: 'rgba(167,139,250,0.3)',
  },
};

export default function Experience() {
  return (
    <section id="experience" className="py-28 px-6 md:px-12 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <span className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-rose-400 uppercase mb-3">
          <Zap className="w-3.5 h-3.5" />
          Experience & Leadership
        </span>
        <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tight text-slate-100 mt-1">
          Positions &{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #fb7185, #f43f5e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Education
          </span>
        </h2>
        <p className="text-slate-400 text-sm md:text-base mt-4">
          Roles of responsibility, government program management, and academic background.
        </p>
      </motion.div>

      {/* Vertical Timeline */}
      <div className="relative">
        {/* Animated timeline spine */}
        <motion.div
          className="absolute left-6 md:left-10 top-0 bottom-0 w-px"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(245,158,11,0.4), rgba(139,92,246,0.4), rgba(59,130,246,0.4), transparent)'
          }}
          initial={{ scaleY: 0, originY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />

        <div className="space-y-8 pl-16 md:pl-24">
          {portfolioData.experience.map((item, idx) => {
            const cfg = typeConfig[item.type] || typeConfig['Institutional'];

            return (
              <motion.div
                key={item.id}
                className="relative group"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: idx * 0.08 }}
              >
                {/* Timeline node */}
                <div
                  className="absolute -left-[52px] md:-left-[68px] top-6 w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-125"
                  style={{
                    backgroundColor: '#0d1117',
                    borderColor: cfg.color,
                    color: cfg.color,
                    boxShadow: `0 0 12px ${cfg.glow}`
                  }}
                >
                  {cfg.icon}
                </div>

                {/* Card */}
                <motion.div
                  className="p-6 md:p-8 rounded-2xl glass-card border transition-all duration-400 shimmer"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  whileHover={{
                    y: -4,
                    borderColor: cfg.border,
                    boxShadow: `0 16px 40px ${cfg.glow}`,
                  }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Top Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold"
                        style={{
                          background: `${cfg.color}15`,
                          color: cfg.color,
                          border: `1px solid ${cfg.border}`
                        }}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {item.period}
                      </span>
                      {item.type && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold border"
                          style={{
                            background: 'rgba(15,23,42,0.8)',
                            color: 'rgba(148,163,184,0.8)',
                            borderColor: 'rgba(255,255,255,0.08)'
                          }}
                        >
                          {item.type}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-400 font-semibold flex items-center gap-1.5"
                      style={{ color: cfg.color }}
                    >
                      {item.company}
                    </span>
                  </div>

                  {/* Role Title */}
                  <h3 className="text-xl md:text-2xl font-sans font-bold text-slate-100 mb-3 leading-tight">
                    {item.role}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-5">
                    {item.description}
                  </p>

                  {/* Skill Pills */}
                  <div className="flex flex-wrap gap-2">
                    {item.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-lg text-xs font-mono border"
                        style={{
                          background: `${cfg.color}08`,
                          color: 'rgba(203,213,225,0.8)',
                          borderColor: `${cfg.color}20`
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
