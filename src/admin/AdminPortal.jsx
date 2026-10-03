import React, { useState, useEffect } from 'react';
import { adminAuth, adminApi } from './adminApi.js';
import { AdminLogin } from './components/AdminLogin.jsx';
import { AdminSidebar } from './components/AdminSidebar.jsx';
import { AdminHeader } from './components/AdminHeader.jsx';
import { ToastContainer } from './components/FeedbackModals.jsx';

// Views
import { OverviewView } from './views/OverviewView.jsx';
import { ProfileView } from './views/ProfileView.jsx';
import { ProjectsView } from './views/ProjectsView.jsx';
import { EducationView } from './views/EducationView.jsx';
import { PositionsView } from './views/PositionsView.jsx';
import { AchievementsView } from './views/AchievementsView.jsx';
import { CertificationsView } from './views/CertificationsView.jsx';
import { SkillsView } from './views/SkillsView.jsx';
import { GalleryView } from './views/GalleryView.jsx';
import { BlogView } from './views/BlogView.jsx';
import { MediaLibraryView } from './views/MediaLibraryView.jsx';
import { SettingsView } from './views/SettingsView.jsx';
import { SecurityView } from './views/SecurityView.jsx';

export default function AdminPortal({ onReturnToPortfolio }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => adminAuth.isAuthenticated());
  
  // Initialize tab from URL hash (#/admin/projects -> projects) or localStorage, defaulting to 'overview'
  const getInitialTab = () => {
    const hash = window.location.hash;
    const match = hash.match(/#\/admin\/([a-zA-Z0-9_-]+)/) || hash.match(/#admin-([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1];
    }
    const saved = localStorage.getItem('admin-active-tab');
    if (saved) return saved;
    return 'overview';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('admin-active-tab', tab);
    window.history.replaceState(null, '', `#/admin/${tab}`);
  };

  useEffect(() => {
    const handleHash = () => {
      const match = window.location.hash.match(/#\/admin\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        setActiveTabState(match[1]);
        localStorage.setItem('admin-active-tab', match[1]);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Admin Theme (dark | light)
  const [adminTheme, setAdminTheme] = useState(() => {
    return localStorage.getItem('admin-theme') || 'dark';
  });

  const toggleAdminTheme = () => {
    setAdminTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('admin-theme', next);
      return next;
    });
  };

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [overviewData, setOverviewData] = useState({ stats: {}, recentLogs: [] });
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });

  // Ensure admin mode classes and attribute are active for cursor & styling isolation
  useEffect(() => {
    document.body.classList.add('admin-active');
    document.documentElement.setAttribute('data-admin-active', 'true');

    const handlePointerMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      document.body.classList.remove('admin-active');
      document.documentElement.removeAttribute('data-admin-active');
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  // Add toast notification
  const addToast = (toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch overview telemetry and counts
  const loadOverview = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await adminApi.getOverview();
      setOverviewData(data);
    } catch {
      // ignore network errors
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOverview();
    }
  }, [isAuthenticated, activeTab]);

  // Session listener for expiration
  useEffect(() => {
    const handleExpired = () => {
      setIsAuthenticated(false);
      addToast({ type: 'error', title: 'Session Expired', message: 'You have been locked out due to inactivity.' });
    };

    window.addEventListener('admin-session-expired', handleExpired);
    return () => window.removeEventListener('admin-session-expired', handleExpired);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    addToast({ type: 'success', title: 'Authenticated', message: 'Welcome back to your portfolio CMS!' });
  };

  const handleLogout = async () => {
    await adminApi.logout();
    setIsAuthenticated(false);
    addToast({ type: 'info', title: 'Logged Out', message: 'Your administrative session has ended.' });
  };

  const handleLockSession = () => {
    setIsAuthenticated(false);
    addToast({ type: 'info', title: 'Dashboard Locked', message: 'Dashboard locked. Enter credentials to re-authenticate.' });
  };

  if (!isAuthenticated) {
    return (
      <div className="font-sans admin-portal">
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onReturnToPortfolio={onReturnToPortfolio}
        />
      </div>
    );
  }

  return (
    <div
      data-admin-theme={adminTheme}
      className={`min-h-screen ${
        adminTheme === 'light' ? 'bg-[#f1f5f9] text-slate-800' : 'bg-[#0b0f17] text-slate-100'
      } font-sans selection:bg-amber-500/80 selection:text-slate-950 flex relative overflow-x-hidden admin-portal`}
    >
      {/* Ambient Cyber Cursor Follower Glow */}
      <div
        className="fixed w-96 h-96 rounded-full pointer-events-none z-0 transition-opacity duration-300 opacity-20 -translate-x-1/2 -translate-y-1/2"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(6, 182, 212, 0.08) 45%, transparent 70%)',
          left: mousePos.x,
          top: mousePos.y
        }}
      />

      {/* Background Cyber Orbs & Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px]" />
        <div className="grid-pattern absolute inset-0 opacity-40" />
      </div>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Admin Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        onLockSession={handleLockSession}
        onPreviewSite={onReturnToPortfolio}
        counts={overviewData.stats}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        adminTheme={adminTheme}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen relative z-10 w-full min-w-0">
        {/* Top Header */}
        <AdminHeader
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onPreviewSite={onReturnToPortfolio}
          onLogout={handleLogout}
          onLockSession={handleLockSession}
          adminTheme={adminTheme}
          onToggleTheme={toggleAdminTheme}
        />

        {/* Dynamic Section View */}
        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          {activeTab === 'overview' && (
            <OverviewView
              stats={overviewData.stats}
              recentLogs={overviewData.recentLogs}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'profile' && <ProfileView onToast={addToast} />}

          {activeTab === 'projects' && <ProjectsView onToast={addToast} />}

          {activeTab === 'education' && <EducationView onToast={addToast} />}

          {activeTab === 'positions' && <PositionsView onToast={addToast} />}

          {activeTab === 'achievements' && <AchievementsView onToast={addToast} />}

          {activeTab === 'certifications' && <CertificationsView onToast={addToast} />}

          {activeTab === 'skills' && <SkillsView onToast={addToast} />}

          {activeTab === 'gallery' && <GalleryView onToast={addToast} />}

          {activeTab === 'blog' && <BlogView onToast={addToast} />}

          {activeTab === 'media' && <MediaLibraryView onToast={addToast} />}

          {activeTab === 'settings' && <SettingsView onToast={addToast} />}

          {activeTab === 'security' && <SecurityView onToast={addToast} onLockSession={handleLockSession} />}
        </main>
      </div>
    </div>
  );
}
