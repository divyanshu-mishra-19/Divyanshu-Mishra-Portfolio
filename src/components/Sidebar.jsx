import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  FileCode, 
  FileText, 
  Folder, 
  FolderOpen, 
  Music, 
  Code2, 
  Menu, 
  X,
  Sparkles,
  GitBranch,
  Circle,
  Activity,
  Image as ImageIcon,
  Users,
  Trophy,
  GraduationCap,
  Briefcase,
  Home,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Mail,
  BookOpen,
  Layers,
  Camera,
  MessageSquare,
  ShieldCheck,
  FileCheck,
  Lock
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { safeImageSrc } from '../utils/safeHref';

export default function Sidebar({
  activeSection,
  activeProject,
  activeBlog,
  onNavigate,
  onOpenMonitor,
  isCollapsed = false,
  onToggleCollapse
}) {
  const { data } = usePortfolioData();
  const profile = data?.profile || portfolioData.profile;
  const projectsList = data?.projects && data.projects.length > 0 ? data.projects : portfolioData.projects;
  const achievementsList = data?.achievements && data.achievements.length > 0 ? data.achievements : portfolioData.achievements;
  const certificationsList = data?.certifications && data.certifications.length > 0 ? data.certifications : portfolioData.certifications || [];
  const blogList = data?.blog && data.blog.length > 0 ? data.blog : portfolioData.blog;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredRailItem, setHoveredRailItem] = useState(null);

  const [expandedFolders, setExpandedFolders] = useState({
    skills: true,
    projects: true,
    achievements: true,
    certifications: true,
    leadership: true,
    behindTheCode: true,
    blog: true
  });

  const toggleFolder = (folderKey) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderKey]: !prev[folderKey]
    }));
  };

  const handleItemClick = (sectionId, extra = null) => {
    if (sectionId === 'monitor' && onOpenMonitor) {
      onOpenMonitor();
      setMobileOpen(false);
      return;
    }
    onNavigate(sectionId, extra);
    setMobileOpen(false);
  };

  const getItemIcon = (fileName) => {
    if (!fileName || typeof fileName !== 'string') return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.jsx')) return <FileCode className="w-4 h-4 text-sky-400 shrink-0" />;
    if (lower.endsWith('.py')) return <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    if (lower.endsWith('.js')) return <FileCode className="w-4 h-4 text-yellow-400 shrink-0" />;
    if (lower.endsWith('.cpp')) return <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    if (lower.endsWith('.json')) {
      if (lower.includes('gallery')) return <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />;
      return <FileCode className="w-4 h-4 text-orange-400 shrink-0" />;
    }
    if (lower.endsWith('.md')) {
      if (lower.includes('hackathon') || lower.includes('ideathon') || lower.includes('talent')) {
        return <Trophy className="w-4 h-4 text-amber-400 shrink-0" />;
      }
      if (lower.includes('education')) {
        return <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />;
      }
      return <FileText className="w-4 h-4 text-amber-300 shrink-0" />;
    }
    if (lower.endsWith('.cert') || lower.includes('certif')) {
      return <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (lower.endsWith('.spotify')) return <Music className="w-4 h-4 text-emerald-400 shrink-0" />;
    if (lower.endsWith('.log')) return <Activity className="w-4 h-4 text-emerald-400 shrink-0" />;
    if (lower.endsWith('.db')) return <Users className="w-4 h-4 text-sky-400 shrink-0" />;
    return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  const NavItem = ({ sectionId, fileName, activeColor = '#38bdf8', extraId = null, activeCheck }) => {
    const isActive = activeCheck ? activeCheck() : activeSection === sectionId;
    return (
      <button
        onClick={() => handleItemClick(sectionId, extraId)}
        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-200 text-left group relative overflow-hidden cursor-pointer ${
          isActive ? 'font-semibold' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
        }`}
        style={isActive ? {
          background: `${activeColor}15`,
          color: activeColor,
          borderLeft: `2px solid ${activeColor}`,
          paddingLeft: '10px',
        } : {}}
      >
        <div className="flex items-center gap-2 relative z-10 truncate">
          {getItemIcon(fileName)}
          <span className="truncate text-[12px]">{fileName}</span>
        </div>
        {isActive && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-1.5 h-1.5 rounded-full shrink-0 relative z-10"
            style={{ background: activeColor, boxShadow: `0 0 6px ${activeColor}` }}
          />
        )}
      </button>
    );
  };

  // Rail Nav item for collapsed mode
  const RailItem = ({ sectionId, label, icon: Icon, activeColor = '#f59e0b', extraId = null }) => {
    const isActive = activeSection === sectionId;
    return (
      <div className="relative group/rail w-full flex justify-center py-1">
        <button
          onClick={() => handleItemClick(sectionId, extraId)}
          onMouseEnter={() => setHoveredRailItem(label)}
          onMouseLeave={() => setHoveredRailItem(null)}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer relative ${
            isActive
              ? 'shadow-md'
              : 'text-slate-400 hover:text-slate-100 hover:bg-white/10'
          }`}
          style={isActive ? {
            background: `${activeColor}20`,
            color: activeColor,
            border: `1px solid ${activeColor}50`,
            boxShadow: `0 0 12px ${activeColor}30`,
          } : {}}
          aria-label={label}
        >
          <Icon className="w-5 h-5" />
          {isActive && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
              style={{ background: activeColor }}
            />
          )}
        </button>

        {/* Floating Tooltip to the right */}
        <div
          className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs font-bold whitespace-nowrap shadow-xl border border-white/15 pointer-events-none opacity-0 group-hover/rail:opacity-100 transition-opacity z-50 flex items-center gap-1.5"
          style={{ background: 'var(--theme-card-solid, #0f172a)' }}
        >
          <span>{label}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl border shadow-xl backdrop-blur-md transition-all cursor-pointer animate-in fade-in"
          style={{
            background: 'var(--theme-sidebar-bg, rgba(13,17,23,0.95))',
            borderColor: 'var(--theme-sidebar-border, rgba(255,255,255,0.15))',
            color: 'var(--theme-text, #f1f5f9)'
          }}
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-sky-400" />
        </button>
      )}

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 text-slate-300 z-40 flex flex-col font-mono text-xs select-none transition-all duration-300 ${
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed && !mobileOpen ? 'lg:w-20' : 'lg:w-72'}`}
        style={{
          background: 'var(--theme-sidebar-bg, rgba(10, 13, 20, 0.97))',
          borderRight: '1px solid var(--theme-sidebar-border, rgba(255,255,255,0.08))',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '4px 0 30px var(--theme-sidebar-shadow, rgba(0,0,0,0.5))',
        }}
      >
        {/* Accent top gradient line */}
        <div
          className="h-1 w-full shrink-0"
          style={{ background: 'linear-gradient(90deg, #f59e0b, #8b5cf6, #38bdf8)' }}
        />

        {/* =========================================================
            COLLAPSED MINI ICON RAIL (WHEN isCollapsed IS TRUE)
            ========================================================= */}
        {isCollapsed && !mobileOpen ? (
          <div className="flex-1 flex flex-col items-center justify-between py-4 px-2 overflow-y-auto custom-scrollbar">
            {/* Top Collapse/Expand Toggle + Avatar */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onToggleCollapse}
                className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 flex items-center justify-center transition-all cursor-pointer shadow-sm"
                title="Expand Sidebar (⌘B)"
                aria-label="Expand Sidebar"
                type="button"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>

              <div className="relative group cursor-pointer" onClick={() => handleItemClick('about')}>
                <img
                  loading="lazy"
                  decoding="async"
                  width={40}
                  height={40}
                  src={safeImageSrc(profile.avatar || portfolioData.profile.avatar)}
                  alt={profile.name || portfolioData.profile.name}
                  className="w-10 h-10 rounded-full object-cover border border-amber-500/50 shadow"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
              </div>
            </div>

            {/* Vertical Stack of Rail Navigation Icons */}
            <div className="flex-1 my-4 flex flex-col items-center gap-1 w-full">
              <RailItem sectionId="hero" label="Home" icon={Home} activeColor="#38bdf8" />
              <RailItem sectionId="about" label="About Me" icon={User} activeColor="#fbbf24" />
              <RailItem sectionId="skills" label="Technical Skills" icon={Code2} activeColor="#38bdf8" />
              <RailItem sectionId="projects" label={`Projects (${projectsList.length})`} icon={Layers} activeColor="#f59e0b" />
              <RailItem sectionId="achievements" label={`Achievements (${achievementsList.length})`} icon={Trophy} activeColor="#eab308" />
              <RailItem sectionId="certifications" label={`Certifications (${certificationsList.length})`} icon={FileCheck} activeColor="#10b981" />
              <RailItem sectionId="responsibility" label="Positions of Responsibility" icon={Briefcase} activeColor="#f59e0b" />
              <RailItem sectionId="education" label="Education & Coursework" icon={GraduationCap} activeColor="#38bdf8" />
              <RailItem sectionId="behind-the-code" label="Behind The Code" icon={Music} activeColor="#34d399" />
              <RailItem sectionId="gallery" label="Moments & Gallery" icon={Camera} activeColor="#ec4899" />
              <RailItem sectionId="blog" label="FlipBook & Articles" icon={BookOpen} activeColor="#c084fc" />
              <RailItem sectionId="visitors" label="Visitors Guestbook" icon={MessageSquare} activeColor="#38bdf8" />
              <RailItem sectionId="contact" label="Contact & Links" icon={Mail} activeColor="#38bdf8" />

              {/* Admin Portal Rail Button */}
              <div className="relative group/rail w-full flex justify-center py-1 mt-auto">
                <button
                  onClick={() => {
                    window.history.pushState(null, '', '/admin');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  onMouseEnter={() => setHoveredRailItem('Admin CMS Login')}
                  onMouseLeave={() => setHoveredRailItem(null)}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-amber-500 hover:text-amber-300 hover:bg-amber-500/15 border border-amber-500/30 transition-all cursor-pointer shadow-sm"
                  aria-label="Admin CMS Login"
                  title="Admin Portal Login"
                >
                  <ShieldCheck className="w-5 h-5" />
                </button>
                <div
                  className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-amber-400 font-mono text-xs font-bold whitespace-nowrap shadow-xl border border-amber-500/30 pointer-events-none opacity-0 group-hover/rail:opacity-100 transition-opacity z-50 flex items-center gap-1.5"
                  style={{ background: 'var(--theme-card-solid, #0f172a)' }}
                >
                  <span>Admin CMS Login</span>
                </div>
              </div>
            </div>

            {/* Bottom Expand Tab */}
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors cursor-pointer"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
              type="button"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* =========================================================
             EXPANDED FULL EXPLORER (DEFAULT)
             ========================================================= */
          <>
            {/* Profile Header with Collapse Button */}
            <header
              className="p-4 border-b flex items-center justify-between gap-3 transition-colors"
              style={{
                borderColor: 'var(--theme-sidebar-border, rgba(255,255,255,0.06))',
                background: 'var(--theme-card, rgba(255,255,255,0.02))'
              }}
            >
              <div className="flex items-center gap-3 truncate">
                <div className="relative shrink-0">
                  <img
                    loading="lazy"
                    decoding="async"
                    width={40}
                    height={40}
                    src={safeImageSrc(profile.avatar || portfolioData.profile.avatar)}
                    alt={profile.name || portfolioData.profile.name}
                    className="w-10 h-10 rounded-full object-cover shadow-md"
                    style={{ border: '1px solid rgba(245,158,11,0.4)' }}
                  />
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 glow-pulse bg-emerald-500"
                    style={{ ringColor: 'var(--theme-sidebar-bg, rgba(10,13,20,1))' }}
                  />
                </div>
                <div className="truncate">
                  <span className="font-sans font-bold text-slate-100 text-sm tracking-wide block truncate">
                    {profile.name || portfolioData.profile.name}
                  </span>
                  <span
                    className="text-[10px] tracking-widest uppercase font-semibold"
                    style={{ color: 'var(--theme-accent, #f59e0b)' }}
                  >
                    NIT NAGALAND
                  </span>
                </div>
              </div>

              {/* Close Button on Mobile (inside header) */}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-2 rounded-xl border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-all cursor-pointer shrink-0"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Collapse Button (Desktop Only) */}
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-xl border border-white/10 hover:border-amber-500/40 text-slate-400 hover:text-amber-400 hover:bg-white/5 transition-all cursor-pointer"
                title="Collapse Sidebar (⌘B)"
                aria-label="Collapse Sidebar"
                type="button"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </header>

            {/* Traffic Lights & Branch Header */}
            <div
              className="px-4 py-2 border-b flex items-center justify-between transition-colors"
              style={{
                borderColor: 'var(--theme-sidebar-border, rgba(255,255,255,0.04))',
                background: 'var(--theme-card, rgba(255,255,255,0.01))'
              }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-500" />
              </div>
              <div className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] text-slate-400 font-sans font-medium">main</span>
              </div>
            </div>

            {/* Explorer Label */}
            <div
              className="px-4 py-2 border-b flex items-center justify-between transition-colors"
              style={{ borderColor: 'var(--theme-sidebar-border, rgba(255,255,255,0.04))' }}
            >
              <span className="text-[10px] text-slate-500 font-sans uppercase tracking-widest font-bold">
                EXPLORER
              </span>
              <span className="text-[10px] font-mono text-slate-500">PORTFOLIO-WORKSPACE</span>
            </div>

            {/* Scrollable File Explorer Tree */}
            <nav aria-label="Main Navigation" className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
              {/* home.jsx */}
              <NavItem sectionId="hero" fileName="home.jsx" activeColor="#38bdf8" />

              {/* about.md */}
              <NavItem sectionId="about" fileName="about.md" activeColor="#fbbf24" />

              {/* Folder: skills */}
              <div>
                <button
                  onClick={() => toggleFolder('skills')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-lg transition-colors text-[12px] cursor-pointer"
                  type="button"
                >
                  {expandedFolders.skills ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  {expandedFolders.skills ? <FolderOpen className="w-4 h-4 text-sky-500" /> : <Folder className="w-4 h-4 text-sky-500" />}
                  <span className="font-semibold text-slate-300">skills</span>
                </button>
                <AnimatePresence>
                  {expandedFolders.skills && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 border-l border-white/10 pl-2 space-y-0.5 mt-0.5 overflow-hidden"
                    >
                      <NavItem sectionId="skills" fileName="toolkit.jsx" activeColor="#38bdf8" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Folder: projects */}
              <div>
                <button
                  onClick={() => toggleFolder('projects')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-lg transition-colors text-[12px] cursor-pointer"
                  type="button"
                >
                  {expandedFolders.projects ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  {expandedFolders.projects ? <FolderOpen className="w-4 h-4 text-amber-500" /> : <Folder className="w-4 h-4 text-amber-500" />}
                  <span className="font-semibold text-slate-300">projects</span>
                  <span className="text-[10px] text-amber-400 font-mono ml-auto">({projectsList.length})</span>
                </button>
                <AnimatePresence>
                  {expandedFolders.projects && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 border-l border-white/10 pl-2 space-y-0.5 mt-0.5 overflow-hidden"
                    >
                      {projectsList.map((proj) => {
                        const isActive = activeSection === 'projects' && activeProject === proj.id;
                        return (
                          <NavItem
                            key={proj.id}
                            sectionId="projects"
                            fileName={proj.file || `${proj.id || 'project'}.py`}
                            activeColor="#f59e0b"
                            extraId={proj.id}
                            activeCheck={() => isActive}
                          />
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Folder: achievements (NEW Dedicated Section) */}
              <div>
                <button
                  onClick={() => toggleFolder('achievements')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-lg transition-colors text-[12px] cursor-pointer"
                  type="button"
                >
                  {expandedFolders.achievements ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  {expandedFolders.achievements ? <FolderOpen className="w-4 h-4 text-yellow-400" /> : <Folder className="w-4 h-4 text-yellow-400" />}
                  <span className="font-semibold text-slate-300">achievements</span>
                  <span className="text-[10px] text-yellow-400 font-mono ml-auto">({achievementsList.length})</span>
                </button>
                <AnimatePresence>
                  {expandedFolders.achievements && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 border-l border-white/10 pl-2 space-y-0.5 mt-0.5 overflow-hidden"
                    >
                      <NavItem sectionId="achievements" fileName="all-achievements.md" activeColor="#eab308" />
                      {achievementsList.map((ach) => (
                        <NavItem
                          key={ach.id}
                          sectionId="achievements"
                          fileName={ach.file || `${ach.id || 'achievement'}.md`}
                          activeColor="#f59e0b"
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Folder: certifications (Dedicated Licenses & Certifications Section) */}
              <div>
                <button
                  onClick={() => toggleFolder('certifications')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-lg transition-colors text-[12px] cursor-pointer"
                  type="button"
                >
                  {expandedFolders.certifications ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  {expandedFolders.certifications ? <FolderOpen className="w-4 h-4 text-emerald-400" /> : <Folder className="w-4 h-4 text-emerald-400" />}
                  <span className="font-semibold text-slate-300">certifications</span>
                  <span className="text-[10px] text-emerald-400 font-mono ml-auto">({certificationsList.length})</span>
                </button>
                <AnimatePresence>
                  {expandedFolders.certifications && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 border-l border-white/10 pl-2 space-y-0.5 mt-0.5 overflow-hidden"
                    >
                      <NavItem sectionId="certifications" fileName="all-certifications.md" activeColor="#10b981" />
                      {certificationsList.map((cert, cIdx) => {
                        const baseName = (cert.name || `cert-${cIdx}`)
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, '')
                          .slice(0, 18);
                        return (
                          <NavItem
                            key={cert.id || cIdx}
                            sectionId="certifications"
                            fileName={`${baseName}.cert`}
                            activeColor="#10b981"
                          />
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* responsibility.jsx (Dedicated Positions of Responsibility) */}
              <NavItem sectionId="responsibility" fileName="responsibility.jsx" activeColor="#f59e0b" />

              {/* education.md (Dedicated Education Section) */}
              <NavItem sectionId="education" fileName="education.md" activeColor="#38bdf8" />

              {/* monitor.log (System Telemetry) */}
              <NavItem sectionId="monitor" fileName="monitor.log" activeColor="#10b981" />

              {/* Folder: behind-the-code */}
              <div>
                <button
                  onClick={() => toggleFolder('behindTheCode')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-lg transition-colors text-[12px] cursor-pointer"
                  type="button"
                >
                  {expandedFolders.behindTheCode ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  {expandedFolders.behindTheCode ? <FolderOpen className="w-4 h-4 text-emerald-500" /> : <Folder className="w-4 h-4 text-emerald-500" />}
                  <span className="font-semibold text-slate-300">behind-the-code</span>
                </button>
                <AnimatePresence>
                  {expandedFolders.behindTheCode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 border-l border-white/10 pl-2 space-y-0.5 mt-0.5 overflow-hidden"
                    >
                      <NavItem sectionId="behind-the-code" fileName={portfolioData?.audio?.file || 'focus-audio.spotify'} activeColor="#34d399" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* gallery.json (Moments & Gallery) */}
              <NavItem sectionId="gallery" fileName="moments-gallery.json" activeColor="#ec4899" />

              {/* Folder: blog */}
              <div>
                <button
                  onClick={() => toggleFolder('blog')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-lg transition-colors text-[12px] cursor-pointer"
                  type="button"
                >
                  {expandedFolders.blog ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  {expandedFolders.blog ? <FolderOpen className="w-4 h-4 text-purple-500" /> : <Folder className="w-4 h-4 text-purple-500" />}
                  <span className="font-semibold text-slate-300">blog</span>
                </button>
                <AnimatePresence>
                  {expandedFolders.blog && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 border-l border-white/10 pl-2 space-y-0.5 mt-0.5 overflow-hidden"
                    >
                      {blogList.map((article) => {
                        const isActive = activeSection === 'blog' && activeBlog === article.id;
                        return (
                          <NavItem
                            key={article.id}
                            sectionId="blog"
                            fileName={article.file || `${article.id || 'post'}.md`}
                            activeColor="#c084fc"
                            extraId={article.id}
                            activeCheck={() => isActive}
                          />
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* visitors.db (Global Visitors & Guestbook) */}
              <NavItem sectionId="visitors" fileName="visitors.db" activeColor="#38bdf8" />

              {/* contact.jsx */}
              <NavItem sectionId="contact" fileName="contact.jsx" activeColor="#38bdf8" />

              {/* Dedicated Admin CMS Login Item */}
              <div className="pt-2 mt-2 border-t border-white/5">
                <button
                  onClick={() => {
                    window.history.pushState(null, '', '/admin');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/25 transition-all cursor-pointer group"
                  title="Admin Portal Login & Content Management"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold tracking-wide">Admin Portal</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Login
                  </span>
                </button>
              </div>
            </nav>

            {/* Footer with Collapse Action hint */}
            <div
              className="p-3 border-t flex items-center justify-between"
              style={{
                borderColor: 'var(--theme-sidebar-border, rgba(255,255,255,0.06))',
                background: 'var(--theme-card, rgba(255,255,255,0.01))'
              }}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-slate-500 font-sans">NIT Nagaland</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-2 h-2 text-emerald-500 fill-emerald-500" />
                <span className="text-[10px] text-slate-500 font-mono">v2.5.0</span>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
