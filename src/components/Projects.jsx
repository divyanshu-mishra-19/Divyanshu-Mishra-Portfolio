import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  BookOpen,
  Sparkles,
  Camera,
  CloudSun,
  Cpu,
  Layers,
  Activity,
  ShieldCheck,
  Gauge
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { safeHref, safeImageSrc } from '../utils/safeHref';

const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const projectHighlights = {
  'osteo-ai-screening': [
    { label: 'Gait Accuracy', value: '92.64%' },
    { label: 'X-Ray AI', value: '84% DenseNet' },
    { label: 'Hardware', value: 'ESP32 + IMU/FSR' },
  ],
  'ibvap-surveillance': [
    { label: 'Inference', value: '10-15 FPS' },
    { label: 'Precision', value: '>90% Multi-Cam' },
    { label: 'Alert Latency', value: '<3 Seconds' },
  ],
  'f1-race-predictor': [
    { label: 'Dataset', value: '70+ Yrs & FastF1' },
    { label: 'Models', value: 'XGBoost & LightGBM' },
    { label: 'Telemetry', value: 'Real-Time Speed' },
  ],
  'traffic-vision': [
    { label: 'Accuracy', value: '84%+' },
    { label: 'Detections', value: '100+ Live' },
    { label: 'Edge ANPR', value: '80% Plate' },
  ],
  'weather-app': [
    { label: 'Coverage', value: '200k+ Cities' },
    { label: 'Latency', value: '<150ms API' },
    { label: 'Interface', value: 'Geolocation' },
  ],
  'iot-power-telemetry': [
    { label: 'Accuracy', value: '98%+' },
    { label: 'Protocol', value: 'FreeRTOS / REST' },
    { label: 'Hardware', value: 'ESP32 ADC' },
  ]
};

const projectIcons = {
  'osteo-ai-screening': Activity,
  'ibvap-surveillance': ShieldCheck,
  'f1-race-predictor': Gauge,
  'traffic-vision': Camera,
  'weather-app': CloudSun,
  'iot-power-telemetry': Cpu,
};

const projectThemes = {
  'osteo-ai-screening': {
    color: '#082f2c',
    spineHighlight: '#2dd4bf',
    spineShadow: '#031413',
    glow: 'rgba(45, 212, 191, 0.4)',
    gradient: 'from-teal-600 to-emerald-700',
  },
  'ibvap-surveillance': {
    color: '#0d1f35',
    spineHighlight: '#38bdf8',
    spineShadow: '#040d17',
    glow: 'rgba(56, 189, 248, 0.4)',
    gradient: 'from-sky-600 to-blue-700',
  },
  'f1-race-predictor': {
    color: '#360909',
    spineHighlight: '#ef4444',
    spineShadow: '#150202',
    glow: 'rgba(239, 68, 68, 0.4)',
    gradient: 'from-red-600 to-rose-700',
  },
  'traffic-vision': {
    color: '#152538',
    spineHighlight: '#60a5fa',
    spineShadow: '#08111e',
    glow: 'rgba(59, 130, 246, 0.4)',
    gradient: 'from-blue-600 to-cyan-700',
  },
  'weather-app': {
    color: '#1a3654',
    spineHighlight: '#38bdf8',
    spineShadow: '#081c2d',
    glow: 'rgba(56, 189, 248, 0.4)',
    gradient: 'from-sky-600 to-indigo-700',
  },
  'iot-power-telemetry': {
    color: '#143224',
    spineHighlight: '#34d399',
    spineShadow: '#081a12',
    glow: 'rgba(52, 211, 153, 0.4)',
    gradient: 'from-emerald-600 to-teal-700',
  },
};

// Desktop Book Card with Exact 3D Book Spine & Smooth Hover Expansion (From Danny Montoya)
function BookCardDesktop({ project, expanded, onHover, onSelect }) {
  const IconComponent = projectIcons[project.id] || Layers;
  const theme = projectThemes[project.id] || {
    color: project.spineBg || '#1e293b',
    spineHighlight: project.spineAccent || '#f59e0b',
    spineShadow: '#0a0f18',
    glow: 'rgba(245, 158, 11, 0.3)',
    gradient: 'from-amber-600 to-orange-700',
  };
  const highlights = projectHighlights[project.id] || [];

  return (
    <div
      onMouseEnter={onHover}
      onClick={() => onSelect(project.id)}
      className={`group relative cursor-pointer overflow-hidden shrink-0 transition-[width,box-shadow,border-radius] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] book-card-desktop ${
        expanded
          ? 'rounded-3xl z-20'
          : 'rounded-t-[8px] rounded-b-[4px] z-10'
      }`}
      style={{
        width: expanded ? '35rem' : '5.25rem',
        height: '40rem',
        willChange: 'width',
        transform: 'translateZ(0)',
        boxShadow: expanded
          ? `0 25px 60px -12px rgba(0,0,0,0.7), 0 0 0 1.5px ${theme.spineHighlight}45, 0 0 40px -10px ${theme.glow}`
          : '0 20px 30px -12px rgba(0,0,0,0.8), 0 4px 10px rgba(0,0,0,0.5)',
      }}
    >
      {/* ========================================================================= */}
      {/* 1. COLLAPSED STATE: 3D HARDCOVER BOOK SPINE (Identical to Danny's Portfolio) */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          expanded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Base Spine Color */}
        <div
          className="absolute inset-0 transition-[filter] duration-500 group-hover:brightness-110 group-hover:saturate-[1.15]"
          style={{ background: theme.color }}
        />

        {/* Multi-stop Radial Specular Leather Highlights & Shadow Creases */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-soft-light opacity-90"
          style={{
            background: `
              radial-gradient(ellipse 55% 26% at 28% 22%, ${theme.spineHighlight}60 0%, transparent 70%),
              radial-gradient(ellipse 45% 30% at 72% 56%, ${theme.spineShadow}85 0%, transparent 75%),
              radial-gradient(ellipse 60% 22% at 38% 82%, ${theme.spineHighlight}40 0%, transparent 80%),
              radial-gradient(ellipse 35% 35% at 68% 30%, ${theme.spineShadow}55 0%, transparent 70%),
              radial-gradient(ellipse 30% 18% at 22% 65%, ${theme.spineHighlight}30 0%, transparent 75%)
            `,
          }}
        />

        {/* High-Performance Leather Cloth Shading (GPU-accelerated, zero recalculation lag) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 1px, transparent 1px),
              radial-gradient(circle at 0% 0%, rgba(0,0,0,0.2) 1px, transparent 1px)
            `,
            backgroundSize: '4px 4px, 6px 6px',
          }}
        />

        {/* Spine Ambient Gradient & Screen Sheen */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(15,8,4,0.3) 0%, transparent 14%, transparent 86%, rgba(15,8,4,0.35) 100%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-[0.35]"
          style={{
            background: `
              radial-gradient(ellipse 70% 22% at 50% 34%, rgba(255,248,226,0.55), transparent 75%),
              radial-gradient(ellipse 40% 12% at 42% 60%, rgba(255,248,226,0.35), transparent 80%)
            `,
          }}
        />

        {/* Top Paper Page Edges (Gilded antique pages) */}
        <div
          className="absolute top-0 left-[5px] right-[5px] h-[10px] pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, #ebd5a1 0%, #d1af70 55%, #a68044 100%)',
          }}
        />
        <div
          className="absolute top-0 left-[5px] right-[5px] h-[10px] pointer-events-none opacity-55 mix-blend-multiply"
          style={{
            backgroundImage: 'repeating-linear-gradient(to bottom, rgba(80,50,22,0) 0px, rgba(80,50,22,0) 0.7px, rgba(80,50,22,0.35) 0.7px, rgba(80,50,22,0.35) 1.5px)',
          }}
        />
        <div
          className="absolute top-0 left-[5px] w-[1.5px] h-[10px] pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(15,8,4,0.55), transparent)' }}
        />
        <div
          className="absolute top-0 right-[5px] w-[1.5px] h-[10px] pointer-events-none"
          style={{ background: 'linear-gradient(to left, rgba(15,8,4,0.55), transparent)' }}
        />
        <div
          className="absolute top-[10px] left-0 right-0 h-[2px] pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(15,8,4,0.75) 0%, rgba(15,8,4,0.15) 100%)' }}
        />

        {/* Bottom Paper Page Edges */}
        <div
          className="absolute bottom-0 left-[5px] right-[5px] h-[6px] pointer-events-none"
          style={{
            background: 'linear-gradient(to top, #ebd5a1 0%, #d1af70 55%, #a68044 100%)',
          }}
        />
        <div
          className="absolute bottom-0 left-[5px] right-[5px] h-[6px] pointer-events-none opacity-55 mix-blend-multiply"
          style={{
            backgroundImage: 'repeating-linear-gradient(to bottom, rgba(80,50,22,0) 0px, rgba(80,50,22,0) 0.7px, rgba(80,50,22,0.35) 0.7px, rgba(80,50,22,0.35) 1.5px)',
          }}
        />

        {/* Decorative Gold Filigree Bands (Top) */}
        <div className="absolute top-[6%] left-1.5 right-1.5 pointer-events-none">
          <div className="h-px bg-[#ecdaa7]/60" />
          <div className="h-[4px]" />
          <div className="relative h-[3px]">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-[#fff0be]/80" />
            <div className="absolute inset-x-0 top-[1px] h-[1.25px] bg-[#d2af73]/65" />
            <div className="absolute inset-x-0 bottom-0 h-[0.75px] bg-[#462a12]/60" />
          </div>
          <div className="h-[5px]" />
          <div
            className="h-[1.5px]"
            style={{
              backgroundImage: 'repeating-linear-gradient(to right, rgba(236,218,167,0.58) 0px, rgba(236,218,167,0.58) 3px, transparent 3px, transparent 7px)',
            }}
          />
          <div className="relative mt-[4px] flex justify-center">
            <div
              className="h-[3px] w-[3px] rotate-45 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(255,240,190,0.75) 0%, rgba(180,135,75,0.55) 100%)',
              }}
            />
          </div>
        </div>

        {/* Decorative Gold Filigree Bands (Bottom) */}
        <div className="absolute bottom-[5%] left-1.5 right-1.5 pointer-events-none">
          <div className="relative mb-[4px] flex justify-center">
            <div
              className="h-[3px] w-[3px] rotate-45 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(255,240,190,0.75) 0%, rgba(180,135,75,0.55) 100%)',
              }}
            />
          </div>
          <div
            className="h-[1.5px]"
            style={{
              backgroundImage: 'repeating-linear-gradient(to right, rgba(236,218,167,0.58) 0px, rgba(236,218,167,0.58) 3px, transparent 3px, transparent 7px)',
            }}
          />
          <div className="h-[5px]" />
          <div className="relative h-[3px]">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-[#fff0be]/80" />
            <div className="absolute inset-x-0 top-[1px] h-[1.25px] bg-[#d2af73]/65" />
            <div className="absolute inset-x-0 bottom-0 h-[0.75px] bg-[#462a12]/60" />
          </div>
          <div className="h-[4px]" />
          <div className="h-px bg-[#ecdaa7]/60" />
        </div>

        {/* Cylindrical 3D Curvature Edge Shading */}
        <div
          className="absolute left-0 top-[10px] bottom-[6px] w-[9px] pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(5,3,1,0.75) 0%, rgba(5,3,1,0.3) 40%, transparent 100%)',
          }}
        />
        <div
          className="absolute left-0 top-[10px] bottom-[6px] w-[1px] pointer-events-none"
          style={{ background: 'rgba(2,1,0,0.55)' }}
        />
        <div
          className="absolute right-0 top-[10px] bottom-[6px] w-[10px] pointer-events-none"
          style={{
            background: 'linear-gradient(to left, rgba(3,2,1,0.82) 0%, rgba(3,2,1,0.35) 40%, transparent 100%)',
          }}
        />
        <div
          className="absolute right-0 top-[10px] bottom-[6px] w-[1px] pointer-events-none"
          style={{ background: 'rgba(2,1,0,0.65)' }}
        />

        {/* Book Spine Content: Circular Icon, Vertical Title, Status */}
        <div className="relative h-full flex flex-col items-center justify-between pt-14 pb-14 px-1">
          {/* Top Circular Emblem */}
          <div
            className="flex items-center justify-center w-9 h-9 rounded-full transition-transform duration-300 group-hover:scale-105 shrink-0"
            style={{
              border: '1.25px solid rgba(236, 218, 167, 0.58)',
              background: 'rgba(236, 218, 167, 0.08)',
              color: 'rgba(243, 230, 198, 0.9)',
              boxShadow: 'inset 0 1px 0 rgba(15,8,4,0.35), 0 1px 0 rgba(255,245,215,0.08)',
            }}
          >
            <IconComponent className="w-4 h-4" />
          </div>

          {/* Vertical Book Title (Gold Debossed) */}
          <div className="my-auto py-4 select-none flex items-center justify-center">
            <span
              className="font-serif font-bold uppercase tracking-[0.22em] block"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                fontSize: '0.8rem',
                color: 'rgba(243, 230, 198, 0.9)',
                textShadow: '0 1px 0 rgba(15,8,4,0.7), 0 -0.5px 0 rgba(255,245,215,0.15)',
              }}
            >
              {project.spineTitle || project.title}
            </span>
          </div>

          {/* Bottom Online Status Pill */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-amber-400/25 text-[8.5px] font-mono text-amber-200/90 shadow-sm shrink-0">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: theme.spineHighlight }}
            />
            <span className="font-semibold tracking-wider uppercase text-[8px]">
              ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXPANDED STATE: FULL IMMERSIVE SHOWCASE CARD (Identical to Danny)       */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Cover Scene Image with Parallax / Zoom */}
        {project.image && (
          <img
            loading="lazy"
            decoding="async"
            src={safeImageSrc(project.image)}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            style={{ objectPosition: 'center 40%' }}
          />
        )}

        {/* Ambient Project Tone Gradient Backdrop */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${theme.glow} 0%, transparent 75%)`,
          }}
        />

        {/* Deep Contrast Shading Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/85 to-slate-950/98" />

        {/* Inset Ring Highlight */}
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none" />

        {/* Top Edge Color Accent Strip */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl z-10 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, ${theme.spineHighlight}, ${theme.spineHighlight}40, transparent)`,
          }}
        />
      </div>

      {/* Expanded Content Layer (Fills width cleanly without clipping) */}
      <div
        className={`relative flex h-full w-[35rem] max-w-full flex-col justify-between p-6 lg:p-7 transition-opacity duration-300 ${
          expanded ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-300 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate max-w-[190px]">{project.file}</span>
          </div>

          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border backdrop-blur-md"
            style={{
              backgroundColor: `${theme.spineHighlight}20`,
              borderColor: `${theme.spineHighlight}45`,
              color: theme.spineHighlight,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: theme.spineHighlight }}
            />
            <span>{project.status || 'Active'}</span>
          </span>
        </div>

        {/* Middle Main Content */}
        <div className="space-y-3.5 my-auto py-2">
          <div>
            <h3 className="font-serif text-2xl lg:text-3xl font-bold tracking-tight text-white drop-shadow-md leading-tight">
              {project.title}
            </h3>

            {/* Tagline flanked by elegant calipers */}
            <div className="mt-1.5 flex items-center gap-2 font-serif italic text-amber-200/90 text-xs md:text-sm">
              <span className="h-px w-5 bg-amber-400/50" />
              <span className="truncate">{project.tagline}</span>
              <span className="h-px w-5 bg-amber-400/50" />
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-300 text-xs lg:text-[13.5px] leading-relaxed font-sans line-clamp-4">
            {project.description}
          </p>

          {/* Highlights Metric Badges Grid */}
          {highlights.length > 0 && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="p-2 rounded-xl bg-slate-900/80 border border-white/10 text-center backdrop-blur-md shadow-sm"
                >
                  <div
                    className="font-mono font-bold text-xs lg:text-sm"
                    style={{ color: theme.spineHighlight }}
                  >
                    {h.value}
                  </div>
                  <div className="text-[9px] uppercase font-mono text-slate-400 tracking-wider mt-0.5">
                    {h.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-200 text-[11px] font-mono font-medium hover:border-amber-400/40 transition-colors"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 5 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-800/40 border border-slate-700/40 text-slate-400 text-[10px] font-mono">
                +{project.tags.length - 5}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-white/10">
          <a
            href={safeHref(project.liveUrl || project.githubUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-sans font-bold text-xs shadow-lg transition-all hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${theme.spineHighlight}, #f59e0b)`,
              color: '#090d16',
              boxShadow: `0 4px 20px ${theme.glow}`,
            }}
          >
            <span>Launch Project</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href={safeHref(project.githubUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-sans font-semibold text-xs transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>Code</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// Mobile Accordion Card
function BookCardMobile({ project, expanded, onToggle }) {
  const IconComponent = projectIcons[project.id] || Layers;
  const theme = projectThemes[project.id] || {
    color: project.spineBg || '#1e293b',
    spineHighlight: project.spineAccent || '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.3)',
  };
  const highlights = projectHighlights[project.id] || [];

  return (
    <div
      onClick={onToggle}
      className={`rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer book-card-mobile ${
        expanded
          ? 'bg-slate-950/95 shadow-2xl'
          : 'bg-slate-900/80 border-slate-800 shadow-md hover:border-slate-700'
      }`}
      style={{
        borderColor: expanded ? theme.spineHighlight : undefined,
        boxShadow: expanded ? `0 14px 40px -10px ${theme.glow}` : undefined,
      }}
    >
      {/* Card Header Bar */}
      <div
        className="p-4 flex items-center justify-between relative"
        style={{
          background: expanded
            ? `linear-gradient(90deg, ${theme.color} 0%, rgba(15,23,42,0.8) 100%)`
            : undefined,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm shrink-0"
            style={{
              backgroundColor: `${theme.spineHighlight}15`,
              borderColor: `${theme.spineHighlight}40`,
              color: theme.spineHighlight,
            }}
          >
            <IconComponent className="w-5 h-5" />
          </div>

          <div>
            <h4 className="font-serif font-bold text-slate-100 text-base leading-snug">
              {project.title}
            </h4>
            <p className="font-mono text-xs text-amber-400/90 truncate max-w-[220px]">
              {project.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: theme.spineHighlight }}
          />
          <span className="font-mono text-[10px] text-slate-400 uppercase font-semibold">
            {expanded ? 'Open' : 'Tap'}
          </span>
        </div>
      </div>

      {/* Expanded Accordion Body */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="p-5 pt-1 space-y-4 border-t border-slate-800/80"
        >
          {/* Artwork Cover */}
          {project.image && (
            <div className="relative h-44 rounded-xl overflow-hidden border border-white/10">
              <img
                loading="lazy"
                decoding="async"
                src={safeImageSrc(project.image)}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            </div>
          )}

          <p className="text-slate-300 text-xs leading-relaxed font-sans">
            {project.description}
          </p>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center"
                >
                  <div
                    className="font-mono font-bold text-xs"
                    style={{ color: theme.spineHighlight }}
                  >
                    {h.value}
                  </div>
                  <div className="text-[8px] uppercase font-mono text-slate-400 tracking-wider">
                    {h.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href={safeHref(project.liveUrl || project.githubUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-sans font-bold text-xs shadow-md"
              style={{
                background: `linear-gradient(135deg, ${theme.spineHighlight}, #f59e0b)`,
                color: '#090d16',
              }}
            >
              <span>Launch</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={safeHref(project.githubUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-sans font-semibold text-xs"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>Source</span>
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function Projects({ activeProject, onSelectProject }) {
  const { data } = usePortfolioData();
  const projectsList = data?.projects && data.projects.length > 0 ? data.projects : portfolioData.projects;

  // Find initial expanded index based on activeProject prop
  const initialIndex = Math.max(
    0,
    projectsList.findIndex((p) => p.id === activeProject)
  );
  const [expandedIndex, setExpandedIndex] = useState(initialIndex);
  const hoverTimerRef = React.useRef(null);

  // Sync state if external selection changes (e.g. sidebar navigation)
  useEffect(() => {
    const idx = projectsList.findIndex((p) => p.id === activeProject);
    if (idx !== -1) {
      setExpandedIndex(idx);
    }
  }, [activeProject, projectsList]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  // Hover intent debounce: 75ms prevents rapid shaking when moving cursor across spines
  const handleHover = (idx) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setExpandedIndex(idx);
    }, 75);
  };

  const handleSelect = (idx) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setExpandedIndex(idx);
    const selected = projectsList[idx];
    if (selected && onSelectProject) {
      onSelectProject(selected.id);
    }
  };

  return (
    <motion.section
      id="projects"
      className="py-24 px-4 sm:px-6 md:px-10 lg:px-12 max-w-7xl mx-auto scroll-mt-8"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* ========================================================================= */}
      {/* SECTION HEADER (Identical to Danny's: Status Pill + Hint + Systems Online) */}
      {/* ========================================================================= */}
      <div className="text-center mb-12">
        <motion.div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase mb-3 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>PORTFOLIO SHOWCASE</span>
        </motion.div>

        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase leading-[1.08] mb-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          WHAT I'VE{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            BUILT
          </span>
        </motion.h2>

        {/* Dynamic Responsive Interaction Hint */}
        <motion.p
          className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto text-sm md:text-base font-sans"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <span className="md:hidden">Tap a book to open and explore.</span>
          <span className="hidden md:inline">Hover over any book spine to explore, click to launch.</span>
        </motion.p>

        {/* Live Systems Online Counter Badge */}
        <motion.div
          className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-slate-900/90 border border-slate-800/90 px-4 py-1.5 text-xs font-mono font-medium text-slate-300 shadow-md backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{projectsList.length}/{projectsList.length} systems online</span>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP BOOKSHELF INTERFACE: HORIZONTAL ACCORDION (gap-0 flush books)     */}
      {/* ========================================================================= */}
      <div className="hidden md:block relative">
        {/* Books Row Container */}
        <div className="flex w-full items-stretch justify-center gap-0 py-4 overflow-x-auto lg:overflow-visible custom-scrollbar">
          {projectsList.map((proj, idx) => (
            <BookCardDesktop
              key={proj.id}
              project={proj}
              expanded={expandedIndex === idx}
              onHover={() => handleHover(idx)}
              onSelect={() => handleSelect(idx)}
            />
          ))}
        </div>

        {/* Realistic Wooden Shelf Base Board */}
        <div className="w-full relative mt-1">
          {/* Shadow dropped by the books onto the shelf */}
          <div className="w-full h-3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

          {/* Polished Shelf Board with Grain and Grooves */}
          <div
            className="w-full h-5 rounded-lg border-t border-amber-600/40 shadow-2xl relative overflow-hidden flex items-center justify-around px-12"
            style={{
              background: 'linear-gradient(180deg, #3d2212 0%, #2b170c 45%, #190c06 100%)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(245,158,11,0.25)',
            }}
          >
            {/* Shelf brass / wood grain highlight inlays */}
            <div className="w-24 h-0.5 bg-amber-500/20 rounded-full" />
            <div className="w-48 h-0.5 bg-amber-500/30 rounded-full" />
            <div className="w-24 h-0.5 bg-amber-500/20 rounded-full" />
          </div>

          {/* Under-shelf deep shadow */}
          <div className="w-[96%] mx-auto h-3 bg-gradient-to-b from-black/80 to-transparent blur-sm -mt-0.5" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE INTERFACE: VERTICAL ACCORDION STACK                                 */}
      {/* ========================================================================= */}
      <div className="md:hidden flex flex-col gap-4">
        {projectsList.map((proj, idx) => (
          <BookCardMobile
            key={proj.id}
            project={proj}
            expanded={expandedIndex === idx}
            onToggle={() => handleSelect(idx)}
          />
        ))}
      </div>
    </motion.section>
  );
}
