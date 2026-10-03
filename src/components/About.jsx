import React from 'react';
import { motion } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { safeImageSrc } from '../utils/safeHref';
import {
  ExternalLink,
  Trophy,
  Zap,
  Award,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function About({ onNavigate }) {
  const { data } = usePortfolioData();
  const profile = data?.profile || portfolioData.profile;
  const about = profile.about || portfolioData.profile.about;
  const workspaceIllustration = profile.workspaceIllustration || portfolioData.profile.workspaceIllustration;

  return (
    <section id="about" className="py-28 px-6 md:px-12 max-w-6xl mx-auto relative scroll-mt-12">
      {/* Section Header */}
      <motion.div {...fadeUp(0)} className="mb-16">
        <span className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-amber-400 uppercase mb-3">
          <Zap className="w-3.5 h-3.5" />
          About Me
        </span>
        <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tight text-slate-100 mt-1">
          A Few{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Words
          </span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
        {/* Bio Text Column */}
        <motion.div
          {...fadeUp(0.1)}
          className="lg:col-span-7 space-y-6 text-slate-300 text-base md:text-lg leading-relaxed"
        >
          <p className="font-semibold text-slate-100 text-xl md:text-2xl leading-snug">
            {about.tagline}
          </p>

          <p>
            I am an Electrical and Electronics Engineering undergraduate at{' '}
            <a
              href="https://nitnagaland.ac.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-rose-400 underline decoration-rose-400/40 hover:decoration-rose-400 transition-all inline-flex items-center gap-0.5 hover:text-rose-300"
            >
              NIT Nagaland (CGPA: 8.81) <ExternalLink className="w-3.5 h-3.5" />
            </a>
            . My work spans{' '}
            <button
              onClick={() => onNavigate('projects', 'traffic-vision')}
              className="font-bold text-purple-400 underline decoration-purple-400/40 hover:decoration-purple-400 transition-all cursor-pointer hover:text-purple-300"
              type="button"
            >
              Real-Time Computer Vision &amp; Edge AI
            </button>
            , full-stack systems, and{' '}
            <button
              onClick={() => onNavigate('achievements')}
              className="font-bold text-sky-400 underline decoration-sky-400/40 hover:decoration-sky-400 transition-all cursor-pointer hover:text-sky-300"
              type="button"
            >
              Autonomous Agentic Workflows
            </button>
            . Whether it's training YOLOv8 models for ANPR license plate detection or orchestrating multi-agent pipelines with n8n, I build high-efficiency solutions optimized for real-world deployment.
          </p>

          <p>
            As{' '}
            <button
              onClick={() => onNavigate('responsibility')}
              className="font-bold text-amber-400 underline decoration-amber-400/40 hover:decoration-amber-400 transition-all cursor-pointer hover:text-amber-300"
              type="button"
            >
              Technical Secretary at NIT Nagaland
            </button>{' '}
            and{' '}
            <span className="font-semibold text-sky-400">
              Smart India Hackathon (SIH) Student Coordinator
            </span>
            , I was the lead organizer of{' '}
            <span className="font-bold text-rose-400">
              Hackdays Nagaland &amp; Hack $ Brahma
            </span>
            , while co-organizing Tech Avinya and Ekarikthin (Nagaland's 2nd largest fest), leading a team of 30+ members and 15+ sponsors. I have also coordinated national bootcamps for the{' '}
            <span className="font-semibold text-slate-100">
              Ministry of Education, Govt of India
            </span>
            . If a problem involves{' '}
            <button
              onClick={() => onNavigate('skills')}
              className="font-bold text-emerald-400 underline decoration-emerald-400/40 hover:decoration-emerald-400 transition-all cursor-pointer hover:text-emerald-300"
              type="button"
            >
              Python, C++, OpenCV, or React
            </button>
            , I am passionate about engineering it to perfection.
          </p>

          {/* Quick stats row - Colorful individual cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-slate-200/50 dark:border-slate-800">
            {[
              { value: '8.81', label: 'CGPA', color: '#f59e0b', icon: Award },
              { value: '6+', label: 'Core Projects', color: '#0ea5e9', icon: Zap },
              { value: '30+', label: 'Team Members Led', color: '#10b981', icon: Trophy },
              { value: 'Top 5', label: 'Hackathon Rank', color: '#a855f7', icon: Sparkles },
            ].map((stat, i) => {
              const StatIcon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="p-3.5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group select-none shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, var(--theme-card) 0%, ${stat.color}14 100%)`,
                    borderColor: `${stat.color}45`,
                    boxShadow: `0 10px 28px -6px ${stat.color}25, 0 2px 8px -2px ${stat.color}15`,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-2xl md:text-3xl font-serif font-black" style={{ color: stat.color }}>
                      {stat.value}
                    </span>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform"
                      style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}35`, color: stat.color }}
                    >
                      <StatIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider block">
                    {stat.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Illustration Column */}
        <motion.div
          {...fadeUp(0.2)}
          className="lg:col-span-5 relative group"
        >
          <div
            className="absolute -inset-3 rounded-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-700 illustration-glow"
          />
          <div className="relative rounded-2xl overflow-hidden border border-white/8 shadow-2xl glass-card">
            <img
              loading="lazy"
              decoding="async"
              width={600}
              height={400}
              src={safeImageSrc(workspaceIllustration)}
              alt="Divyanshu Mishra workspace illustration"
              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            {/* Image overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117]/60 via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>

      {/* Direct Quick Link Banner to Achievements */}
      <motion.div
        {...fadeUp(0.1)}
        className="p-6 sm:p-8 rounded-3xl glass-card border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shimmer glow-border relative overflow-hidden"
        style={{
          borderColor: 'rgba(245, 158, 11, 0.35)',
          boxShadow: '0 12px 35px -10px rgba(245, 158, 11, 0.2)',
          '--glow-hover-gradient': 'linear-gradient(135deg, rgba(56, 189, 248, 0.16), rgba(99, 102, 241, 0.14), rgba(168, 85, 247, 0.12))',
        }}
      >
        {/* Top vibrant multi-color strip */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, #f59e0b, #ec4899, #38bdf8)' }}
        />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PROVEN TRACK RECORD
              </span>
              <span className="text-xs font-mono text-slate-400">National Competitions</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-sans text-slate-100">
              Podium Finishes, 1st Prizes &amp; Government Citations
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Capabl India Agentic AI Saksham Hackathon (Top 5 Finalist), 1st Prize National Ideathon, and ISRO space-tech citations with verifiable certificates.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('achievements')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer relative z-10"
          type="button"
        >
          <Award className="w-4 h-4" />
          <span>Explore Achievements</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    </section>
  );
}
