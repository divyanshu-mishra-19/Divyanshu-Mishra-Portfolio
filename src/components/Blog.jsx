import React, { useRef, useState, useEffect, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { safeHref, safeImageSrc } from '../utils/safeHref';
import {
  Clock,
  ExternalLink,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  RotateCcw,
  ArrowUpRight
} from 'lucide-react';
const HTMLFlipBook = React.lazy(() => import('./HTMLFlipBook'));

const categoryThemes = {
  'COMPUTER VISION': {
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    badgeBorder: 'rgba(245, 158, 11, 0.4)',
    badgeText: '#b45309',
    accent: '#f59e0b',
    image: '/images/homesprint.webp',
  },
  'AGENTIC AI': {
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    badgeBorder: 'rgba(16, 185, 129, 0.4)',
    badgeText: '#047857',
    accent: '#10b981',
    image: '/images/vinylsheetz.webp',
  },
  'LEADERSHIP': {
    badgeBg: 'rgba(168, 85, 247, 0.15)',
    badgeBorder: 'rgba(168, 85, 247, 0.4)',
    badgeText: '#6b21a8',
    accent: '#a855f7',
    image: '/images/workspace.webp',
  },
  'INNOVATION': {
    badgeBg: 'rgba(244, 63, 94, 0.15)',
    badgeBorder: 'rgba(244, 63, 94, 0.4)',
    badgeText: '#be123c',
    accent: '#f43f5e',
    image: '/images/beadwork.webp',
  },
  'WEB DEV': {
    badgeBg: 'rgba(14, 165, 233, 0.15)',
    badgeBorder: 'rgba(14, 165, 233, 0.4)',
    badgeText: '#0369a1',
    accent: '#0ea5e9',
    image: '/images/sam-intel.webp',
  },
};

// Hardcover Front Page (data-density="hard")
const FrontCover = forwardRef((props, ref) => {
  const authorName = portfolioData.profile.name;

  return (
    <div ref={ref} className="page" data-density="hard">
      <div
        className="relative h-full w-full overflow-hidden rounded-r-md flex flex-col justify-between p-8 text-center select-none shadow-inner"
        style={{
          background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
          boxShadow: 'inset -4px 0 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      >
        {/* Leather micro-texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.25] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.8'/></svg>")`,
          }}
        />

        {/* Gold leaf decorative border */}
        <div className="absolute inset-4 border-2 border-amber-500/40 rounded-sm pointer-events-none" />
        <div className="absolute inset-5 border border-amber-400/20 rounded-sm pointer-events-none" />

        {/* Top book header */}
        <div className="relative z-10 pt-4">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-amber-300/80 block">
            THE EDITORIAL DISPATCHES
          </span>
          <div className="w-12 h-0.5 bg-amber-400/60 mx-auto mt-2 rounded-full" />
        </div>

        {/* Center book title */}
        <div className="relative z-10 my-auto py-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-amber-400/40 flex items-center justify-center bg-amber-500/10 text-amber-300 shadow-md">
            <Bookmark className="w-6 h-6" />
          </div>

          <h2 className="font-serif text-3xl md:text-4xl font-black tracking-wider text-amber-100 uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-tight">
            PIECE OF<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MIND
            </span>
          </h2>

          <p className="font-serif italic text-xs md:text-sm text-stone-300 mt-4 max-w-[240px] mx-auto leading-relaxed">
            Engineering Logs, AI Agent Architecture & Leadership Retrospectives
          </p>

          <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-200 font-mono text-[10px] uppercase tracking-widest font-semibold">
            Vol. 01 • NIT Nagaland
          </div>
        </div>

        {/* Bottom author and hint */}
        <div className="relative z-10 pb-4">
          <p className="font-mono text-xs text-stone-400">
            By <span className="text-amber-200 font-semibold">{authorName}</span>
          </p>
          <p className="font-mono text-[9px] text-amber-400/70 tracking-widest uppercase mt-2">
            Click corner or controls to open ➔
          </p>
        </div>

        {/* Gilded spine edge highlight */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-[4px] bg-gradient-to-l from-amber-200/50 to-transparent" />
      </div>
    </div>
  );
});

// Table of Contents Page (Page 1)
const TableOfContentsPage = forwardRef(({ onJumpToPage }, ref) => {
  const blogList = portfolioData.blog;

  return (
    <div ref={ref} className="page" data-density="soft">
      <div className="page-content bg-[#fbf6ec] h-full w-full p-8 md:p-10 flex flex-col justify-between border-l border-stone-300/60 select-none">
        {/* Paper texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
          }}
        />

        <div>
          {/* Header */}
          <div className="text-center pb-4 border-b border-stone-300">
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-stone-500 font-semibold block">
              TABLE OF CONTENTS
            </span>
            <h3 className="font-serif text-2xl font-bold text-stone-900 mt-1">
              Index of Articles
            </h3>
          </div>

          {/* Article list */}
          <div className="mt-6 space-y-4">
            {blogList.map((article, idx) => {
              const targetPage = idx + 2; // page 0: cover, page 1: TOC, page 2+: articles
              return (
                <div
                  key={article.id}
                  onClick={() => onJumpToPage && onJumpToPage(targetPage)}
                  className="group flex items-baseline justify-between gap-2 p-2.5 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
                >
                  <div className="flex-1 pr-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-700 tracking-wider block mb-0.5">
                      {article.category}
                    </span>
                    <span className="font-serif font-semibold text-stone-800 text-xs md:text-sm group-hover:text-amber-900 transition-colors block leading-tight">
                      {article.title}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-stone-400 group-hover:text-stone-700 transition-colors shrink-0">
                    p. {targetPage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editorial note / quote */}
        <div className="pt-4 border-t border-stone-300/80 text-center">
          <p className="font-serif italic text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
            “The craft of engineering software is not merely in writing syntax, but in building systems that solve tangible problems with clarity.”
          </p>
          <span className="font-mono text-[10px] text-stone-400 mt-2 block uppercase tracking-wider">
            — Folio 01
          </span>
        </div>
      </div>
    </div>
  );
});

// Single Article Page Component
const ArticlePage = forwardRef(({ article, pageNumber }, ref) => {
  const theme = categoryThemes[article.category] || categoryThemes['COMPUTER VISION'];

  return (
    <div ref={ref} className="page" data-density="soft">
      <div className="page-content bg-[#fbf6ec] h-full w-full p-7 md:p-9 flex flex-col justify-between border-l border-stone-300/60 select-none relative overflow-hidden">
        {/* Tactile paper texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
          }}
        />

        {/* Top metadata bar */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-stone-300">
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border"
            style={{
              backgroundColor: theme.badgeBg,
              borderColor: theme.badgeBorder,
              color: theme.badgeText,
            }}
          >
            {article.category}
          </span>

          <span className="font-mono text-[10px] text-stone-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>{article.readTime}</span>
          </span>
        </div>

        {/* Article header & image */}
        <div className="relative z-10 my-auto py-2 space-y-3">
          {/* Article artwork scene */}
          {theme.image && (
            <div className="relative h-32 md:h-36 rounded-xl overflow-hidden border border-stone-300/80 shadow-sm">
              <img
                loading="lazy"
                decoding="async"
                width={600}
                height={338}
                src={safeImageSrc(theme.image)}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#fbf6ec]/80 via-transparent to-transparent" />
            </div>
          )}

          <div>
            <h3 className="font-serif text-lg md:text-xl font-bold text-stone-900 leading-snug tracking-tight">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 font-mono text-[10px] text-stone-500 mt-1">
              <span>{article.date}</span>
              <span>•</span>
              <span>By {article.author}</span>
            </div>
          </div>

          <p className="font-serif text-stone-700 text-xs md:text-[13px] leading-relaxed line-clamp-4">
            {article.description}
          </p>

          {/* Action button */}
          <div className="pt-2">
            <a
              href={safeHref(article.url)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-100 font-sans font-semibold text-xs shadow transition-all hover:scale-105 active:scale-95"
            >
              <span>Read Repository Notes</span>
              <ExternalLink className="w-3 h-3 text-amber-400" />
            </a>
          </div>
        </div>

        {/* Bottom page folio */}
        <div className="relative z-10 flex items-center justify-between pt-3 border-t border-stone-300 font-mono text-[10px] text-stone-400">
          <span>PIECE OF MIND • VOL. 01</span>
          <span className="font-bold text-stone-600">p. {pageNumber}</span>
        </div>
      </div>
    </div>
  );
});

// Hardcover Back Page (data-density="hard")
const BackCover = forwardRef((props, ref) => {
  return (
    <div ref={ref} className="page" data-density="hard">
      <div
        className="relative h-full w-full overflow-hidden rounded-l-md flex flex-col justify-between p-8 text-center select-none shadow-inner"
        style={{
          background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
          boxShadow: 'inset 4px 0 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      >
        {/* Leather micro-texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.25] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.8'/></svg>")`,
          }}
        />

        {/* Gold leaf decorative border */}
        <div className="absolute inset-4 border-2 border-amber-500/40 rounded-sm pointer-events-none" />
        <div className="absolute inset-5 border border-amber-400/20 rounded-sm pointer-events-none" />

        <div className="relative z-10 pt-4">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-amber-300/80 block">
            COLOPHON
          </span>
          <div className="w-12 h-0.5 bg-amber-400/60 mx-auto mt-2 rounded-full" />
        </div>

        <div className="relative z-10 my-auto py-6 max-w-[240px] mx-auto">
          <p className="font-serif font-bold text-lg text-amber-100 uppercase tracking-wider">
            PIECE OF MIND
          </p>
          <p className="font-mono text-[11px] text-amber-300/80 mt-1 uppercase tracking-widest">
            Volume 01
          </p>

          <p className="font-serif italic text-xs text-stone-300 mt-4 leading-relaxed">
            Written and compiled by Divyanshu Mishra at National Institute of Technology, Nagaland.
          </p>

          <p className="font-sans text-[11px] text-stone-400 mt-4 leading-relaxed">
            More technical dispatches arriving as projects deploy. Reach out at{' '}
            <a
              href="mailto:divyanshu.nit.28@gmail.com"
              className="text-amber-300 underline font-mono text-[10px]"
            >
              divyanshu.nit.28@gmail.com
            </a>
          </p>
        </div>

        <div className="relative z-10 pb-4">
          <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest">
            2025 — 2026 • NIT NAGALAND
          </span>
        </div>

        {/* Gilded spine edge highlight */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-r from-amber-200/50 to-transparent" />
      </div>
    </div>
  );
});

export default function Blog({ activeBlog, onSelectBlog }) {
  const { data } = usePortfolioData();
  const blogList = data?.blog && data.blog.length > 0 ? data.blog : portfolioData.blog;
  const flipBookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Total pages = Front Cover + TOC + Articles + Back Cover
  const totalPages = blogList.length + 3;

  // Sync when activeBlog changes from sidebar / navigation
  useEffect(() => {
    if (!activeBlog) return;
    const articleIdx = blogList.findIndex((b) => b.id === activeBlog);
    if (articleIdx !== -1 && flipBookRef.current?.pageFlip()) {
      const targetPage = articleIdx + 2;
      flipBookRef.current.pageFlip().flip(targetPage);
      setCurrentPage(targetPage);
    }
  }, [activeBlog, blogList]);

  const handleNext = () => {
    if (flipBookRef.current?.pageFlip()) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const handlePrev = () => {
    if (flipBookRef.current?.pageFlip()) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const handleJumpToPage = (pageIdx) => {
    if (flipBookRef.current?.pageFlip()) {
      flipBookRef.current.pageFlip().flip(pageIdx);
    }
  };

  const handleFlipEvent = (e) => {
    const pageNum = e.data;
    setCurrentPage(pageNum);
    // If on an article page (2, 3, 4, 5), sync back with onSelectBlog
    const articleIdx = pageNum - 2;
    if (articleIdx >= 0 && articleIdx < blogList.length && onSelectBlog) {
      onSelectBlog(blogList[articleIdx].id);
    }
  };

  return (
    <motion.section
      id="blog"
      className="py-24 px-4 sm:px-6 md:px-10 lg:px-12 max-w-6xl mx-auto scroll-mt-8"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold tracking-widest uppercase mb-3 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>READING LIST & EDITORIAL</span>
        </motion.div>

        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight text-slate-100 uppercase leading-[1.08] mb-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          PIECE OF{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            MIND
          </span>
        </motion.h2>

        <motion.p
          className="text-slate-400 max-w-xl mx-auto text-sm md:text-base font-sans"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <span className="md:hidden">A collection of technical articles and engineering notes.</span>
          <span className="hidden md:inline">An interactive 3D magazine of engineering dispatches. Drag any corner or use the controls below to flip pages.</span>
        </motion.p>
      </div>

      {/* ========================================================================= */}
      {/* 3D MAGAZINE FLIPBOOK CONTAINER (DESKTOP)                                   */}
      {/* ========================================================================= */}
      <div className="hidden md:flex flex-col items-center">
        <div className="magazine-shadow relative">
          <React.Suspense fallback={<div className="w-full h-96 flex items-center justify-center font-mono text-xs text-slate-400"><div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mr-2" />Loading 3D FlipBook...</div>}><HTMLFlipBook
            ref={flipBookRef}
            width={380}
            height={540}
            size="fixed"
            minWidth={300}
            maxWidth={480}
            minHeight={420}
            maxHeight={650}
            maxShadowOpacity={0.5}
            drawShadow={true}
            showCover={true}
            flippingTime={750}
            usePortrait={false}
            mobileScrollSupport={true}
            className="magazine-flipbook"
            style={{ background: 'transparent' }}
            onFlip={handleFlipEvent}
          >
            {/* Page 0: Hardcover */}
            <FrontCover />

            {/* Page 1: Table of Contents */}
            <TableOfContentsPage onJumpToPage={handleJumpToPage} />

            {/* Article Pages */}
            {blogList.map((article, idx) => (
              <ArticlePage
                key={article.id}
                article={article}
                pageNumber={idx + 2}
                totalPages={totalPages}
              />
            ))}

            {/* Final Page: Back Hardcover */}
            <BackCover />
          </HTMLFlipBook></React.Suspense>
        </div>

        {/* FlipBook Controls & Folio Navigation Bar */}
        <div className="mt-8 flex items-center justify-center gap-4 py-2.5 px-6 rounded-full bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
          {/* Previous Page Button */}
          <button
            onClick={handlePrev}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Quick jump to cover / TOC */}
          <button
            onClick={() => handleJumpToPage(0)}
            className="px-3 py-1 rounded-full text-xs font-mono font-medium text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Jump to Cover"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Cover</span>
          </button>

          <button
            onClick={() => handleJumpToPage(1)}
            className="px-3 py-1 rounded-full text-xs font-mono font-medium text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Jump to Index"
          >
            <BookOpen className="w-3 h-3" />
            <span>Index</span>
          </button>

          {/* Page Counter */}
          <span className="font-mono text-xs font-bold text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Page {currentPage + 1} / {totalPages}
          </span>

          {/* Next Page Button */}
          <button
            onClick={handleNext}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE RESPONSIVE EDITORIAL STACK                                         */}
      {/* ========================================================================= */}
      <div className="md:hidden flex flex-col gap-5">
        {blogList.map((article, idx) => {
          const theme = categoryThemes[article.category] || categoryThemes['COMPUTER VISION'];
          return (
            <div
              key={article.id}
              className="p-6 rounded-2xl bg-[#fbf6ec] border border-stone-300 shadow-lg text-stone-900 relative overflow-hidden"
            >
              {/* Paper texture overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-multiply"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
                }}
              />

              <div className="relative z-10 flex items-center justify-between pb-3 border-b border-stone-300">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border"
                  style={{
                    backgroundColor: theme.badgeBg,
                    borderColor: theme.badgeBorder,
                    color: theme.badgeText,
                  }}
                >
                  {article.category}
                </span>
                <span className="font-mono text-xs text-stone-500">{article.readTime}</span>
              </div>

              <div className="relative z-10 my-4">
                <h3 className="font-serif text-xl font-bold text-stone-900 leading-snug">
                  {article.title}
                </h3>
                <p className="font-mono text-xs text-stone-500 mt-1">
                  {article.date} • By {article.author}
                </p>
                <p className="font-serif text-stone-700 text-sm mt-3 leading-relaxed">
                  {article.description}
                </p>
              </div>

              <div className="relative z-10 pt-3 border-t border-stone-300 flex items-center justify-between">
                <span className="font-mono text-xs text-stone-500">Folio 0{idx + 1}</span>
                <a
                  href={safeHref(article.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 text-stone-100 font-sans font-semibold text-xs shadow"
                >
                  <span>Read Notes</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
