import React, { useState, useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import ParticleCanvas from './components/ParticleCanvas';
import CustomCursor from './components/CustomCursor';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import About from './components/About';
import Toolkit from './components/Toolkit';
import Projects from './components/Projects';
import Achievements from './components/Achievements';
import Certifications from './components/Certifications';
import PositionsOfResponsibility from './components/PositionsOfResponsibility';
import Education from './components/Education';
import SystemMonitor from './components/SystemMonitor';
import BehindTheCode from './components/BehindTheCode';
import Gallery from './components/Gallery';
import Blog from './components/Blog';
import Visitors from './components/Visitors';
import Contact from './components/Contact';
import CommandPalette from './components/CommandPalette';
import ThemeSwitcher from './components/ThemeSwitcher';
import AIAgent from './components/AIAgent';
const AdminPortal = React.lazy(() => import('./admin/AdminPortal'));
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.startsWith('/admin') || hash.startsWith('#/admin') || hash === '#admin';
  });

  const [activeSection, setActiveSection] = useState('hero');
  const [activeProject, setActiveProject] = useState('traffic-vision');
  const [activeBlog, setActiveBlog] = useState('anpr-yolov8');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isMonitorOpen, setIsMonitorOpen] = useState(false);

  // Synchronize admin route with popstate and hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const isNowAdmin = path.startsWith('/admin') || hash.startsWith('#/admin') || hash === '#admin';
      setIsAdminRoute(isNowAdmin);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleReturnToPortfolio = () => {
    window.history.pushState(null, '', '/');
    setIsAdminRoute(false);
  };

  // Collapsible Sidebar state (persisted)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('portfolio-sidebar-collapsed') === 'true';
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('portfolio-sidebar-collapsed', String(next));
      return next;
    });
  };

  // 2 Themes: dark | light
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('portfolio-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const handleThemeChange = (newTheme) => {
    const validTheme = newTheme === 'light' ? 'light' : 'dark';
    setCurrentTheme(validTheme);
    localStorage.setItem('portfolio-theme', validTheme);
    localStorage.setItem('admin-theme', validTheme);
    document.documentElement.setAttribute('data-theme', validTheme);
    document.documentElement.classList.toggle('dark', validTheme === 'dark');
    document.documentElement.classList.toggle('light', validTheme === 'light');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
    document.documentElement.classList.toggle('light', currentTheme === 'light');
  }, [currentTheme]);

  // Sync admin mode class & attributes for crisp pointer and isolated theme
  useEffect(() => {
    if (isAdminRoute) {
      document.body.classList.add('admin-active');
      document.documentElement.setAttribute('data-admin-active', 'true');
    } else {
      document.body.classList.remove('admin-active');
      document.documentElement.removeAttribute('data-admin-active');
    }
    return () => {
      document.body.classList.remove('admin-active');
      document.documentElement.removeAttribute('data-admin-active');
    };
  }, [isAdminRoute]);

  // IntersectionObserver to sync active section with sidebar while scrolling
  useEffect(() => {
    const sectionIds = [
      'hero', 
      'about', 
      'skills', 
      'projects', 
      'achievements',
      'certifications',
      'responsibility',
      'education',
      'behind-the-code', 
      'gallery', 
      'blog', 
      'visitors',
      'contact'
    ];
    
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcuts (Cmd/Ctrl+K for search, Cmd/Ctrl+B for sidebar toggle)
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleSidebar();
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        window.history.pushState(null, '', '/admin');
        setIsAdminRoute(true);
      } else if (e.key === '/' && !isCommandOpen) {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          setIsCommandOpen(true);
        }
      } else if (e.key === 's' && !e.ctrlKey && !e.metaKey && !e.altKey && !isCommandOpen) {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          setIsCommandOpen(true);
        }
      } else if (e.key === 'Escape') {
        if (isCommandOpen) setIsCommandOpen(false);
        if (isMonitorOpen) setIsMonitorOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isCommandOpen, isMonitorOpen]);

  const handleNavigate = (sectionId, extraId = null) => {
    if (sectionId === 'monitor') {
      setIsMonitorOpen(true);
      return;
    }

    setActiveSection(sectionId);

    if (sectionId === 'projects' && extraId) {
      setActiveProject(extraId);
    }
    if (sectionId === 'blog' && extraId) {
      setActiveBlog(extraId);
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If visiting /admin or #/admin, render the secure Admin Portal exclusively (code-split)
  if (isAdminRoute) {
    return (
      <React.Suspense fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-mono text-sm">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading Secure Portal...</span>
          </div>
        </div>
      }>
        <AdminPortal onReturnToPortfolio={handleReturnToPortfolio} />
      </React.Suspense>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <div 
      className="min-h-screen font-sans selection:bg-amber-400/80 selection:text-slate-950 relative overflow-x-hidden transition-colors duration-400"
      style={{
        background: 'var(--theme-bg, #0d1117)',
        color: 'var(--theme-text, #f1f5f9)'
      }}
    >
      {/* Custom Premium Cursor */}
      <CustomCursor />

      {/* Top Right Header Controls: Monitor Telemetry Pill & Theme Switcher & Admin Quick Access */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 sm:gap-2.5">
        <SystemMonitor isOpen={isMonitorOpen} setIsOpen={setIsMonitorOpen} />
        <ThemeSwitcher currentTheme={currentTheme} onThemeChange={handleThemeChange} />
        <button
          onClick={() => {
            window.history.pushState(null, '', '/admin');
            setIsAdminRoute(true);
          }}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-amber-500/35 bg-slate-900/80 hover:bg-amber-500/15 text-amber-400 hover:text-amber-300 transition-all shadow-md flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer backdrop-blur-md group"
          title="Admin CMS Portal (Secure Login) — Shortcut: Cmd+Shift+A"
          aria-label="Admin Portal Login"
        >
          <ShieldCheck className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Admin</span>
        </button>
      </div>

      {/* Interactive AI Agent Assistant ("Divyanshu AI") */}
      <AIAgent />

      {/* Animated background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Grid Pattern Overlay */}
      <div className="grid-pattern fixed inset-0 pointer-events-none z-0 opacity-85" />

      {/* Interactive Particle Background */}
      <ParticleCanvas />

      {/* IDE File Explorer Navigation Sidebar (Collapsible) */}
      <Sidebar
        activeSection={activeSection}
        activeProject={activeProject}
        activeBlog={activeBlog}
        onNavigate={handleNavigate}
        onOpenMonitor={() => setIsMonitorOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Right Content Canvas - Dynamically adjusts padding when sidebar collapses */}
      <main className={`transition-all duration-300 relative z-10 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <Hero
          onOpenCommand={() => setIsCommandOpen(true)}
          onExploreClick={() => handleNavigate('about')}
        />

        <About onNavigate={handleNavigate} />

        <Toolkit />

        {/* Clean Engineering Projects Bookshelf (Agentic AI & Ideathon moved to Achievements) */}
        <Projects
          activeProject={activeProject}
          onSelectProject={(id) => {
            setActiveProject(id);
            setActiveSection('projects');
          }}
        />

        {/* Dedicated Achievements Section with Multi-Image Photo Proofs & Case Studies */}
        <Achievements />

        {/* Dedicated Licenses & Certifications Section (Verifiable Credentials & Uncropped Certificate Inspection) */}
        <Certifications />

        {/* Dedicated Positions of Responsibility Section */}
        <PositionsOfResponsibility />

        {/* Dedicated Education & Coursework Section */}
        <Education />

        <BehindTheCode />

        {/* Moments & Gallery with Multi-Image Support (2-3 photos per event) */}
        <Gallery />

        {/* 3D Magazine FlipBook Reading List */}
        <Blog
          activeBlog={activeBlog}
          onSelectBlog={(id) => {
            setActiveBlog(id);
            setActiveSection('blog');
          }}
        />

        {/* Global Visitors & Community Guestbook Section (at bottom before Contact) */}
        <Visitors />

        <Contact />
      </main>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={(val) => setIsCommandOpen(val)}
        onNavigate={handleNavigate}
        onOpenMonitor={() => setIsMonitorOpen(true)}
      />
    </div>
    </MotionConfig>
  );
}
