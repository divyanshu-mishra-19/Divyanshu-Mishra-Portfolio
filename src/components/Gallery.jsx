import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  Maximize2,
  X,
  Calendar,
  MapPin,
  Award,
  ChevronLeft,
  ChevronRight,
  Camera,
  Heart
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { safeImageSrc } from '../utils/safeHref';

const galleryCategoryThemes = {
  'Fest Leadership': {
    color: '#f59e0b',
    textColor: '#b45309',
    glow: 'rgba(245, 158, 11, 0.28)',
    topGradient: 'linear-gradient(90deg, #f59e0b, #fbbf24, #ea580c)',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    footerBg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(245, 158, 11, 0.04))',
    footerBorder: 'rgba(245, 158, 11, 0.3)',
  },
  'Hackathons': {
    color: '#8b5cf6',
    textColor: '#7c3aed',
    glow: 'rgba(139, 92, 246, 0.28)',
    topGradient: 'linear-gradient(90deg, #8b5cf6, #c084fc, #ec4899)',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    footerBg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.14), rgba(139, 92, 246, 0.04))',
    footerBorder: 'rgba(139, 92, 246, 0.3)',
  },
  'Govt Bootcamps': {
    color: '#10b981',
    textColor: '#047857',
    glow: 'rgba(16, 185, 129, 0.28)',
    topGradient: 'linear-gradient(90deg, #10b981, #34d399, #06b6d4)',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    footerBg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(16, 185, 129, 0.04))',
    footerBorder: 'rgba(16, 185, 129, 0.3)',
  },
  'Campus Moments': {
    color: '#f43f5e',
    textColor: '#be123c',
    glow: 'rgba(244, 63, 94, 0.28)',
    topGradient: 'linear-gradient(90deg, #f43f5e, #fb7185, #f59e0b)',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    footerBg: 'linear-gradient(135deg, rgba(244, 63, 94, 0.14), rgba(244, 63, 94, 0.04))',
    footerBorder: 'rgba(244, 63, 94, 0.3)',
  },
};

export default function Gallery() {
  const { data } = usePortfolioData();
  const galleryItems = data?.gallery && data.gallery.length > 0 ? data.gallery : portfolioData.gallery || [];
  const [selectedSection, setSelectedSection] = useState('ALL'); // 'ALL' | 'events' | 'moments'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [modalImageIdx, setModalImageIdx] = useState(0);

  // Filter items by section ('events' vs 'moments') and category
  const filteredItems = galleryItems.filter((item) => {
    const matchesSection =
      selectedSection === 'ALL' || item.section === selectedSection;
    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSection && matchesCategory;
  });

  const categories = [
    'ALL',
    'Fest Leadership',
    'Hackathons',
    'Govt Bootcamps',
    'Campus Moments',
  ];

  const handleOpenModal = (item, imageIdx = 0) => {
    setActiveModalItem(item);
    setModalImageIdx(imageIdx);
  };

  return (
    <motion.section
      id="gallery"
      className="py-28 px-4 sm:px-6 md:px-10 lg:px-12 max-w-6xl mx-auto scroll-mt-12"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-amber-400 uppercase mb-3">
            <Camera className="w-3.5 h-3.5" />
            Visual Archive &amp; Memories
          </span>
          <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tight text-slate-100 mt-1">
            Moments &amp;{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Gallery
            </span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-3 max-w-2xl leading-relaxed">
            Separated visual showcase of technical events, hackathon finals, and candid campus life moments. Every card supports multi-image galleries with 2–3 photos.
          </p>
        </div>

        {/* Primary View Switcher: Events vs Moments */}
        <div className="flex items-center p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 self-start md:self-end">
          <button
            onClick={() => {
              setSelectedSection('ALL');
              setSelectedCategory('ALL');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedSection === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            type="button"
          >
            All Showcase
          </button>
          <button
            onClick={() => {
              setSelectedSection('events');
              setSelectedCategory('ALL');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedSection === 'events'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            type="button"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Events &amp; Fests</span>
          </button>
          <button
            onClick={() => {
              setSelectedSection('moments');
              setSelectedCategory('ALL');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedSection === 'moments'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            type="button"
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Campus Moments</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap gap-2 mb-10 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50 shadow-sm'
                : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/10'
            }`}
            type="button"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Cards Grid with Multi-Image Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <GalleryCard
            key={item.id}
            item={item}
            onOpenModal={handleOpenModal}
          />
        ))}
      </div>

      {/* Interactive Multi-Image Lightbox Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <GalleryLightboxModal
            item={activeModalItem}
            activeIdx={modalImageIdx}
            setActiveIdx={setModalImageIdx}
            onClose={() => setActiveModalItem(null)}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
}

// Individual Gallery Card with Multi-Image Slider (2-3 images)
function GalleryCard({ item, onOpenModal }) {
  const images = item.images && item.images.length > 0 ? item.images : [item.image || '/images/workspace.webp'];
  const captions = item.captions || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const catTheme = galleryCategoryThemes[item.category] || (item.section === 'moments' ? galleryCategoryThemes['Campus Moments'] : galleryCategoryThemes['Fest Leadership']);

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.4 }}
      className="group rounded-3xl overflow-hidden glass-card border flex flex-col justify-between transition-all duration-300 shadow-md cursor-pointer relative select-none"
      style={{
        background: `linear-gradient(145deg, var(--theme-card) 0%, ${catTheme.color}0c 100%)`,
        borderColor: `${catTheme.color}40`,
        boxShadow: `0 14px 40px -10px ${catTheme.glow}, 0 2px 8px -2px ${catTheme.color}15`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${catTheme.color}65`;
        e.currentTarget.style.boxShadow = `0 14px 34px -8px ${catTheme.glow}, 0 2px 8px -2px ${catTheme.color}15`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${catTheme.color}40`;
        e.currentTarget.style.boxShadow = `0 14px 40px -10px ${catTheme.glow}, 0 2px 8px -2px ${catTheme.color}15`;
      }}
      onClick={() => onOpenModal(item, currentIdx)}
    >
      {/* Top Category Accent Strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none z-10"
        style={{ background: catTheme.topGradient }}
      />

      <div>
        {/* Image Container with Multi-Photo Slider Controls */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
          <img
            loading="lazy"
            decoding="async"
            src={safeImageSrc(images[currentIdx])}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-xs ${catTheme.badgeClass}`}>
              {item.category}
            </span>

            {/* Photo count indicator */}
            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-white flex items-center gap-1 shadow-xs">
              <Camera className="w-3 h-3 text-amber-400" />
              {currentIdx + 1}/{images.length}
            </span>
          </div>

          {/* Quick Prev / Next Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Previous image"
                type="button"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Next image"
                type="button"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Bottom Dot indicators for 2-3 images */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIdx(i);
                  }}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    currentIdx === i ? 'w-4' : 'bg-white/50 hover:bg-white/80'
                  }`}
                  style={{ backgroundColor: currentIdx === i ? catTheme.color : undefined }}
                  aria-label={`Show image ${i + 1}`}
                  type="button"
                />
              ))}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenModal(item, currentIdx);
              }}
              className="p-1 rounded-md bg-black/60 hover:bg-black/90 text-white transition-colors"
              title="Expand full image"
              type="button"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs font-mono mb-2.5 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-slate-700 dark:text-slate-300 font-medium shadow-2xs"
              style={{ background: `${catTheme.color}10`, borderColor: `${catTheme.color}35` }}
            >
              <Calendar className="w-3 h-3" style={{ color: catTheme.color }} />
              {item.date}
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-slate-700 dark:text-slate-300 font-medium truncate shadow-2xs"
              style={{ background: `${catTheme.color}0a`, borderColor: `${catTheme.color}25` }}
            >
              <MapPin className="w-3 h-3" style={{ color: catTheme.color }} />
              {item.location}
            </span>
          </div>

          <h3 className="font-sans font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 transition-colors mb-2 leading-snug line-clamp-1">
            {item.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4 font-sans">
            {captions[currentIdx] || item.description}
          </p>
        </div>
      </div>

      {/* Footer Metric / Role */}
      <div
        className="px-5 py-3 border-t flex items-center justify-between text-xs font-mono shadow-xs"
        style={{
          background: catTheme.footerBg,
          borderColor: catTheme.footerBorder,
        }}
      >
        <span className="text-slate-800 dark:text-slate-200 font-bold truncate flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" style={{ color: catTheme.color }} />
          {item.role}
        </span>
        {item.metric && (
          <span
            className="font-bold shrink-0 ml-2 px-2.5 py-0.5 rounded-md border text-[11px] shadow-2xs"
            style={{
              background: `${catTheme.color}18`,
              borderColor: `${catTheme.color}45`,
              color: catTheme.color,
            }}
          >
            {item.metric}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Interactive Fullscreen Multi-Image Lightbox Modal
function GalleryLightboxModal({ item, activeIdx, setActiveIdx, onClose }) {
  const images = item.images && item.images.length > 0 ? item.images : [item.image || '/images/workspace.webp'];
  const captions = item.captions || [];

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Lightbox Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl glass-card overflow-hidden z-10 my-auto flex flex-col"
        style={{ background: 'var(--theme-card-solid, #0f172a)' }}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-900/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {item.category}
              </span>
              <span className="text-xs font-mono text-slate-400">{item.date}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 font-sans">
              {item.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-950/70 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10"
            aria-label="Close Lightbox"
            title="Close Lightbox"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Photo Display with Navigation Arrows */}
        <div className="relative aspect-video sm:aspect-[16/9] bg-black/60 flex items-center justify-center overflow-hidden">
          <img
            loading="lazy"
            decoding="async"
            src={safeImageSrc(images[activeIdx])}
            alt={captions[activeIdx] || item.title}
            className="max-h-full max-w-full object-contain"
          />

          {/* Left Arrow */}
          {images.length > 1 && (
            <button
              onClick={() => setActiveIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
              type="button"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Right Arrow */}
          {images.length > 1 && (
            <button
              onClick={() => setActiveIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
              type="button"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Photo Counter Pill */}
          <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-mono font-bold">
            Photo {activeIdx + 1} of {images.length}
          </div>
        </div>

        {/* Thumbnails Filmstrip & Description */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`relative rounded-xl overflow-hidden border-2 w-24 h-16 shrink-0 transition-all cursor-pointer ${
                    activeIdx === idx
                      ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/20'
                      : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                  }`}
                  type="button"
                >
                  <img loading="lazy" decoding="async" width={48} height={48} src={safeImageSrc(img)} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0.5 right-1 px-1 rounded bg-black/80 text-[9px] font-mono text-white">
                    #{idx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Caption for Current Photo */}
          {captions[activeIdx] && (
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs font-mono text-amber-300">
              <strong>Photo Note:</strong> {captions[activeIdx]}
            </div>
          )}

          {/* Description & Metadata */}
          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {item.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs font-mono text-slate-400">
            <div>
              <span className="text-slate-500">Role:</span>{' '}
              <strong className="text-slate-200">{item.role}</strong>
            </div>
            <div>
              <span className="text-slate-500">Location:</span>{' '}
              <strong className="text-slate-200">{item.location}</strong>
            </div>
            {item.metric && (
              <div>
                <span className="text-slate-500">Impact:</span>{' '}
                <strong className="text-amber-400">{item.metric}</strong>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
