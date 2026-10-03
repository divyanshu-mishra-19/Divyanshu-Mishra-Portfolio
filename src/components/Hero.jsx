import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles, GraduationCap, ArrowRight } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { safeImageSrc } from '../utils/safeHref';

const DEFAULT_TITLES = portfolioData.profile.titles;

function useTypewriter(texts, speed = 60, pause = 1800) {
  const [displayed, setDisplayed] = useState('');
  const [titleIdx, setTitleIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const list = texts && texts.length > 0 ? texts : DEFAULT_TITLES;
    const current = list[titleIdx % list.length];
    let timer;

    if (!deleting && charIdx < current.length) {
      timer = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timer = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timer = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setTitleIdx((i) => (i + 1) % list.length);
    }

    setDisplayed(current.substring(0, charIdx));
    return () => clearTimeout(timer);
  }, [charIdx, deleting, titleIdx, texts, speed, pause]);

  return displayed;
}

// Floating orbit badges
const orbitBadges = [
  { label: 'YOLOv8', color: '#f59e0b', angle: 0 },
  { label: 'React', color: '#38bdf8', angle: 72 },
  { label: 'Python', color: '#818cf8', angle: 144 },
  { label: 'n8n AI', color: '#34d399', angle: 216 },
  { label: 'OpenCV', color: '#f472b6', angle: 288 },
];

export default function Hero({ onOpenCommand, onExploreClick }) {
  const { data } = usePortfolioData();
  const profile = data?.profile || portfolioData.profile;
  const titles = profile.titles || DEFAULT_TITLES;
  const typewriter = useTypewriter(titles);

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center relative px-6 py-20 text-center overflow-hidden"
    >
      {/* Hero radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.05) 40%, transparent 70%)'
        }}
      />

      {/* Animated entrance group */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="flex flex-col items-center"
      >
        {/* Avatar with orbit rings */}
        <motion.div
          className="relative mb-10 group"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Outer pulsing ring */}
          <div className="absolute -inset-6 rounded-full border border-amber-400/10 animate-ping" style={{ animationDuration: '3s' }} />
          {/* Animated gradient ring */}
          <motion.div
            className="absolute -inset-2 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #f59e0b, #8b5cf6, #38bdf8, #34d399, #f59e0b)',
              opacity: 0.7
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
          />
          {/* Blur behind gradient ring */}
          <div className="absolute -inset-2 rounded-full blur-md"
            style={{
              background: 'conic-gradient(from 0deg, #f59e0b44, #8b5cf644, #38bdf844, #34d39944, #f59e0b44)',
            }}
          />
          <img
            src={safeImageSrc(profile.avatar || portfolioData.profile.avatar)}
            alt={profile.name || portfolioData.profile.name}
            width={176}
            height={176}
            fetchPriority="high"
            className="relative w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-[#0d1117] object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105"
            style={{ zIndex: 1 }}
          />
          {/* Online status */}
          <span className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 rounded-full ring-4 ring-[#0d1117] glow-pulse" style={{ zIndex: 2 }} />
        </motion.div>

        {/* Name */}
        <motion.h1
          className="text-5xl md:text-8xl font-serif font-extrabold tracking-tight mb-4 hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{
            background: 'var(--theme-hero-gradient, linear-gradient(135deg, #f8fafc 0%, #cbd5e1 40%, #f59e0b 70%, #f8fafc 100%))',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradientShift 5s ease infinite'
          }}
        >
          {(profile.name || portfolioData.profile.name).toUpperCase()}
        </motion.h1>

        {/* Typewriter subtitle */}
        <motion.div
          className="h-8 md:h-10 flex items-center justify-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <span className="text-base md:text-xl font-mono font-bold text-slate-800 dark:text-amber-300 tracking-widest uppercase">
            {typewriter}
            <span className="typewriter-cursor" />
          </span>
        </motion.div>

        {/* Subtitle badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 border glass-card shadow-sm"
          style={{
            borderColor: 'rgba(245, 158, 11, 0.4)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <GraduationCap className="w-4 h-4 text-amber-500" />
          <span className="text-amber-900 dark:text-amber-200 text-xs md:text-sm font-mono font-semibold">
            {profile.heroSubtitle || portfolioData.profile.heroSubtitle}
          </span>
        </motion.div>

        {/* Orbit Badges Row */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-2 mb-8 max-w-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          {orbitBadges.map((badge, idx) => (
            <span
              key={badge.label}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border bg-white dark:bg-slate-900/80 backdrop-blur-md transition-all hover:scale-105 shadow-sm"
              style={{
                borderColor: `${badge.color}50`,
                color: badge.color,
                animation: `floatSlow 5s ease-in-out infinite`,
                animationDelay: `${idx * 0.7}s`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badge.color }} />
              <span>{badge.label}</span>
            </span>
          ))}
        </motion.div>

        {/* Action row */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4 mb-20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
        >
          {/* Command Palette Button */}
          <button
            onClick={onOpenCommand}
            className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg shimmer glass-card"
            style={{
              borderColor: 'rgba(148, 163, 184, 0.25)',
            }}
          >
            <kbd className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs border border-slate-300 dark:border-slate-700">S</kbd>
            <span className="text-slate-400">|</span>
            <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
            <span className="text-sm text-slate-800 dark:text-slate-100 group-hover:text-amber-500 transition-colors font-medium">Search Portfolio</span>
          </button>

          {/* Explore button */}
          <button
            onClick={onExploreClick}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              color: '#0d1117',
              boxShadow: '0 4px 20px rgba(245,158,11,0.25)'
            }}
          >
            <span>Explore Work</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.button
          onClick={onExploreClick}
          className="flex flex-col items-center gap-2 cursor-pointer group"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-slate-500 group-hover:text-slate-300 transition-colors">
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-amber-400/60 to-transparent relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-full bg-amber-400 rounded-full"
              style={{ height: '40%' }}
              animate={{ y: ['-40%', '180%'] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <ChevronDown className="w-4 h-4 text-amber-400 animate-bounce" />
        </motion.button>
      </motion.div>
    </section>
  );
}
