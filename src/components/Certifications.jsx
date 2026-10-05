import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { safeHref, safeImageSrc } from '../utils/safeHref';
import {
  FileCheck,
  Award,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building2,
  Copy,
  Check,
  X,
  Maximize2,
  Minimize2,
  Sparkles,
  Download,
  Eye
} from 'lucide-react';

const certColorPalettes = [
  {
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.25)',
    topBarGradient: 'linear-gradient(90deg, #10b981, #06b6d4, #3b82f6)',
    badgeClass: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300',
    iconColor: '#34d399',
  },
  {
    accent: '#0ea5e9',
    glow: 'rgba(14, 165, 233, 0.25)',
    topBarGradient: 'linear-gradient(90deg, #0ea5e9, #38bdf8, #818cf8)',
    badgeClass: 'from-sky-500/20 to-blue-500/20 border-sky-500/40 text-sky-300',
    iconColor: '#38bdf8',
  },
  {
    accent: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.25)',
    topBarGradient: 'linear-gradient(90deg, #8b5cf6, #c084fc, #ec4899)',
    badgeClass: 'from-purple-500/20 to-violet-500/20 border-purple-500/40 text-purple-300',
    iconColor: '#c084fc',
  },
  {
    accent: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.25)',
    topBarGradient: 'linear-gradient(90deg, #f59e0b, #fbbf24, #ea580c)',
    badgeClass: 'from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-300',
    iconColor: '#fbbf24',
  },
];

function getCertPalette(cert, idx) {
  const org = (cert.issuingOrganization || cert.issuing_organization || '').toLowerCase();
  const name = (cert.name || '').toLowerCase();
  if (org.includes('bharat') || name.includes('hackathon')) return certColorPalettes[0];
  if (org.includes('nsda') || org.includes('nagaland') || name.includes('energy') || name.includes('sustainable')) return certColorPalettes[1];
  if (org.includes('capabl') || name.includes('agentic') || name.includes('ai')) return certColorPalettes[2];
  return certColorPalettes[idx % certColorPalettes.length];
}

// =========================================================================
// FULL-SCREEN / LIGHTBOX MODAL (ZERO CROPPING)
// =========================================================================
function CertificateModal({ cert, onClose }) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!cert) return null;

  const name = cert.name;
  const issuer = cert.issuingOrganization || cert.issuing_organization || 'Accredited Institution';
  const issueDate = cert.issueDate || cert.issue_date || '2026';
  const expiryDate = cert.expiryDate || cert.expiry_date || 'No Expiration';
  const credentialId = cert.credentialId || cert.credential_id;
  const credentialUrl = cert.credentialUrl || cert.credential_url;
  const certificateFile = cert.certificateFile || cert.certificate_file;
  const description = cert.description;

  const handleCopyId = () => {
    if (credentialId) {
      navigator.clipboard.writeText(credentialId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
        className={`relative w-full ${isFullscreen ? 'max-w-[98vw] h-[96vh]' : 'max-w-4xl max-h-[92vh]'} rounded-3xl border shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden z-10 my-auto glass-card transition-all duration-300`}
        style={{
          background: 'var(--theme-card-solid, #0f172a)',
          borderColor: 'var(--theme-border, rgba(255, 255, 255, 0.12))',
        }}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b flex items-center justify-between gap-3 shrink-0"
          style={{ borderColor: 'var(--theme-border, rgba(255, 255, 255, 0.08))' }}>
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 font-mono text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified License / Certificate</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Issued: {issueDate}
              </span>
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold font-sans text-slate-100 truncate mt-1">
              {name}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {certificateFile && (
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Full Screen' : 'Toggle Full Screen'}
                aria-label={isFullscreen ? 'Exit Full Screen' : 'Toggle Full Screen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Completely Uncropped Image Viewer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-5">
          {certificateFile ? (
            <div className={`relative rounded-2xl overflow-hidden border border-white/10 ${isFullscreen ? 'h-[75vh]' : 'min-h-[320px] max-h-[66vh]'} bg-slate-950/95 flex items-center justify-center p-2 sm:p-4 group shadow-inner`}>
              {/* Full Uncropped Certificate Display */}
              <img
                loading="lazy"
                decoding="async"
                src={safeImageSrc(certificateFile)}
                alt={name}
                className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl transition-all select-none"
              />

              {/* Top overlay pills */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-white font-mono text-[11px] font-bold">
                  {issuer}
                </span>
              </div>

              {/* Fullscreen indicator button */}
              <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
                <a
                  href={safeHref(certificateFile)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white backdrop-blur-md border border-white/20 text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-md"
                  title="Open high-res original"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Open Original</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/10 text-center space-y-3">
              <Award className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-lg font-bold text-white">{name}</h4>
              <p className="text-sm text-slate-400 max-w-md mx-auto">{description}</p>
            </div>
          )}

          {/* Certificate Metadata Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ISSUING ORGANIZATION</span>
                <span className="text-slate-200 font-bold text-sm tracking-wide">{issuer}</span>
              </div>
            </div>

            {credentialId ? (
              <div className="flex items-center gap-3">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-slate-400 block text-[10px]">CREDENTIAL ID</span>
                  <span className="text-slate-200 font-bold tracking-wider">{credentialId}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="Copy Credential ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ) : null}

            <div className="flex items-center gap-3 ml-auto">
              <span className="text-slate-400 text-[11px]">
                Valid: <strong className="text-slate-200">{expiryDate}</strong>
              </span>

              {credentialUrl && (
                <a
                  href={safeHref(credentialUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold transition-all"
                >
                  <span>Verify Credential</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                Program Description &amp; Competencies
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {description}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

// =========================================================================
// CERTIFICATION CARD
// =========================================================================
function CertificationCard({ cert, index, onSelect }) {
  const palette = getCertPalette(cert, index);
  const name = cert.name;
  const issuer = cert.issuingOrganization || cert.issuing_organization || 'Accredited Institution';
  const issueDate = cert.issueDate || cert.issue_date || '2026';
  const expiryDate = cert.expiryDate || cert.expiry_date || 'No Expiration';
  const credentialId = cert.credentialId || cert.credential_id;
  const credentialUrl = cert.credentialUrl || cert.credential_url;
  const certificateFile = cert.certificateFile || cert.certificate_file;
  const description = cert.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      onClick={() => onSelect(cert)}
      className="p-5 rounded-3xl border flex flex-col justify-between gap-4 glass-card shimmer glow-border transition-all duration-300 cursor-pointer group select-none relative overflow-hidden shadow-md"
      style={{
        background: `linear-gradient(145deg, var(--theme-card) 0%, ${palette.accent}0a 100%)`,
        borderColor: `${palette.accent}35`,
        boxShadow: `0 14px 40px -10px ${palette.glow}, 0 2px 8px -2px ${palette.accent}15`,
        '--glow-hover-gradient': `linear-gradient(135deg, ${palette.accent}20, rgba(99, 102, 241, 0.14), ${palette.accent}0c)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = palette.accent;
        e.currentTarget.style.boxShadow = `0 18px 40px -8px ${palette.glow}, 0 2px 8px -2px ${palette.accent}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${palette.accent}35`;
        e.currentTarget.style.boxShadow = `0 14px 40px -10px ${palette.glow}, 0 2px 8px -2px ${palette.accent}15`;
      }}
    >
      {/* Top Colorful Strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none z-10"
        style={{ background: palette.topBarGradient }}
      />

      <div>
        {/* Certificate Image Frame: CLEAN, FULL, NEVER CROPPED */}
        {certificateFile ? (
          <div className="relative rounded-2xl overflow-hidden mb-4 bg-slate-950/90 border border-white/10 h-48 sm:h-52 w-full flex items-center justify-center p-2.5 group/img">
            {/* Certificate image with object-contain so full certificate is visible without cropping */}
            <img
              loading="lazy"
              decoding="async"
              src={safeImageSrc(certificateFile)}
              alt={name}
              className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg transition-transform duration-500 group-hover/img:scale-105 select-none"
            />

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
              <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg">
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>View Full Certificate</span>
              </span>
            </div>

            {/* Top Badges */}
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border bg-gradient-to-r shadow-md backdrop-blur-md ${palette.badgeClass}`}>
                {issuer}
              </span>
            </div>
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="text-[11px] font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md border border-white/10 shadow-xs">
                {issueDate}
              </span>
            </div>
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden mb-4 bg-slate-950/90 border border-white/10 h-36 w-full flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-300">{issuer}</span>
          </div>
        )}

        {/* Title */}
        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug mb-1.5 transition-colors font-sans">
          {name}
        </h4>

        {/* Issuing Org & Date Row */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">
          <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate font-semibold text-slate-700 dark:text-slate-300">{issuer}</span>
          <span>•</span>
          <span>{issueDate}</span>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 font-sans mt-2">
            {description}
          </p>
        )}

        {/* Credential ID if present */}
        {credentialId && (
          <div className="mt-3 p-2 rounded-xl bg-slate-900/60 border border-white/10 text-[11px] font-mono text-slate-300 flex items-center justify-between">
            <span className="text-slate-500 text-[10px]">ID:</span>
            <span className="truncate font-bold text-slate-200">{credentialId}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-white/5 text-[11px] font-mono">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(cert);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs hover:scale-105 cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${palette.accent}20, ${palette.accent}08)`,
            borderColor: `${palette.accent}45`,
            borderWidth: '1px',
            borderStyle: 'solid',
            color: palette.accent,
          }}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect Certificate</span>
        </button>

        {credentialUrl && (
          <a
            href={safeHref(credentialUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80"
          >
            <span>Verify</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

// =========================================================================
// MAIN CERTIFICATIONS COMPONENT
// =========================================================================
export default function Certifications() {
  const { data } = usePortfolioData();
  const certifications = data?.certifications && data.certifications.length > 0
    ? data.certifications
    : portfolioData.certifications || [];

  const [selectedCert, setSelectedCert] = useState(null);

  if (!certifications || certifications.length === 0) {
    return null;
  }

  return (
    <section id="certifications" className="py-24 px-6 md:px-12 max-w-6xl mx-auto relative scroll-mt-12">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-14"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase mb-3">
              <FileCheck className="w-3.5 h-3.5" />
              Verified Licenses &amp; Training
            </span>
            <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tight text-slate-100 mt-1">
              Licenses &amp;{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #10b981, #06b6d4, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Certifications
              </span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-3 max-w-2xl leading-relaxed">
              Official accreditations, AI hackathon participation credentials, energy conservation certifications, and specialized technical training with verified IDs and high-resolution credentials.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>{certifications.length} Verified Credentials</span>
          </div>
        </div>
      </motion.div>

      {/* Grid of Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.map((cert, idx) => (
          <CertificationCard
            key={cert.id || idx}
            cert={cert}
            index={idx}
            onSelect={(c) => setSelectedCert(c)}
          />
        ))}
      </div>

      {/* Full Resolution Modal (Zero Cropping) */}
      <AnimatePresence>
        {selectedCert && (
          <CertificateModal
            cert={selectedCert}
            onClose={() => setSelectedCert(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
