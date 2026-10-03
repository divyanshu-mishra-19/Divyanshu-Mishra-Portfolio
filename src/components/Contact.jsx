import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowUpRight, Zap, ShieldCheck } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { safeHref } from '../utils/safeHref';

const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const contactLinks = [
  {
    key: 'email',
    label: 'EMAIL',
    icon: <Mail className="w-7 h-7" />,
    href: (c) => `mailto:${c.email}`,
    value: (c) => c.email,
    color: '#fb7185',
    glow: 'rgba(251,113,133,0.2)',
    border: 'rgba(251,113,133,0.3)',
  },
  {
    key: 'linkedin',
    label: 'LINKEDIN',
    icon: <LinkedinIcon className="w-7 h-7" />,
    href: (c) => c.linkedin,
    value: () => 'divyanshu-mishra',
    color: '#38bdf8',
    glow: 'rgba(56,189,248,0.2)',
    border: 'rgba(56,189,248,0.3)',
    external: true,
  },
  {
    key: 'phone',
    label: 'PHONE',
    icon: <Phone className="w-7 h-7" />,
    href: null,
    value: (c) => c.phone,
    color: '#34d399',
    glow: 'rgba(52,211,153,0.2)',
    border: 'rgba(52,211,153,0.3)',
  },
  {
    key: 'github',
    label: 'GITHUB',
    icon: <GithubIcon className="w-7 h-7" />,
    href: (c) => c.github,
    value: () => 'divyanshu1911',
    color: '#c084fc',
    glow: 'rgba(192,132,252,0.2)',
    border: 'rgba(192,132,252,0.3)',
    external: true,
  },
];

export default function Contact() {
  const { data } = usePortfolioData();
  const contact = data?.contact || portfolioData.contact;

  return (
    <section id="contact" className="py-28 px-6 md:px-12 max-w-5xl mx-auto text-center">
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
          Contact
        </span>
        <h2 className="text-4xl md:text-7xl font-serif font-black tracking-tight text-slate-100 mt-1 leading-tight">
          Let's Build{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Something
          </span>
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base mt-4">
          Open for collaborations, hackathons, engineering roles, and impactful projects.
        </p>
      </motion.div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto mb-16">
        {contactLinks.map((link, idx) => {
          const hrefVal = typeof link.href === 'function' ? link.href(contact) : null;
          const Component = hrefVal ? motion.a : motion.div;
          return (
            <Component
              key={link.key}
              href={safeHref(hrefVal, undefined)}
              target={hrefVal && link.external ? '_blank' : undefined}
              rel={hrefVal && link.external ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`group relative p-7 rounded-3xl glass-card border flex flex-col items-center justify-center gap-4 overflow-hidden shimmer transition-all duration-300 select-none shadow-md ${hrefVal ? 'cursor-pointer' : 'cursor-default'}`}
              style={{
                background: `linear-gradient(145deg, var(--theme-card) 0%, ${link.color}0e 100%)`,
                borderColor: `${link.color}40`,
                boxShadow: `0 10px 30px -8px ${link.color}25, 0 2px 8px -2px ${link.color}15`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${link.color}65`;
                e.currentTarget.style.boxShadow = `0 14px 34px -6px ${link.glow}, 0 2px 8px -2px ${link.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${link.color}40`;
                e.currentTarget.style.boxShadow = `0 10px 30px -8px ${link.color}25, 0 2px 8px -2px ${link.color}15`;
              }}
            >
              {/* Top Brand Color Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, ${link.color}, ${link.color}60, transparent)` }}
              />

              {/* Background radial glow - subtle ambient light */}
              <div
                className="absolute inset-0 opacity-5 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none rounded-3xl"
                style={{ background: `radial-gradient(circle at 50% 25%, ${link.color} 0%, transparent 70%)` }}
              />

              {/* Icon container */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${link.color}24, ${link.color}0e)`,
                  color: link.color,
                  border: `1px solid ${link.color}45`,
                }}
              >
                {link.icon}
              </div>

              <div className="text-center relative z-10 w-full">
                <span className="font-mono font-bold text-xs tracking-widest uppercase block mb-1 text-slate-900 dark:text-slate-100 transition-colors">
                  {link.label}
                </span>
                <span className="text-[12px] text-slate-600 dark:text-slate-400 font-mono truncate max-w-full block font-medium">
                  {link.value(contact)}
                </span>
              </div>

              {/* Action pill */}
              <span
                className="mt-1 px-3 py-1 rounded-full text-[11px] font-mono font-bold border transition-all shadow-xs group-hover:scale-105"
                style={{
                  background: `${link.color}14`,
                  borderColor: `${link.color}40`,
                  color: link.color,
                }}
              >
                {link.key === 'email' ? 'Send Email ↗' : link.key === 'linkedin' ? 'Connect ↗' : link.key === 'phone' ? 'Available on request' : 'View Profile ↗'}
              </span>

              {hrefVal && (
                <ArrowUpRight
                  className="w-4 h-4 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: link.color }}
                />
              )}
            </Component>
          );
        })}
      </div>

      {/* Location Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-16 border glass-card shadow-sm"
        style={{ borderColor: 'rgba(251,113,133,0.3)' }}
      >
        <MapPin className="w-4 h-4 text-rose-500" />
        <span className="text-slate-700 dark:text-slate-300 text-sm font-mono font-semibold">{contact.location}</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 glow-pulse" />
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="pt-10 border-t flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 gap-4"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <span>{contact.footerText}</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 glow-pulse" />
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">NIT Nagaland Campus</span>
          </div>
          <span className="text-slate-600 dark:text-slate-700">•</span>
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState(null, '', '/admin');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors font-mono cursor-pointer py-1 px-2.5 rounded-lg hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30"
            title="Admin Portal Login"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Admin Login</span>
          </a>
        </div>
      </motion.footer>
    </section>
  );
}
