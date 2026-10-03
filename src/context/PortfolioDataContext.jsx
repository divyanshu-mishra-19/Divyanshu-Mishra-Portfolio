import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { portfolioData as initialFallbackData } from '../data/portfolioData.js';

const PortfolioDataContext = createContext(null);

export function PortfolioDataProvider({ children }) {
  const [data, setData] = useState(initialFallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const json = await res.json();
        // Merge with fallback data to ensure any missing fields remain safe
        setData(prev => ({
          ...prev,
          profile: json.profile || prev.profile,
          projects: json.projects && json.projects.length > 0 ? json.projects : prev.projects,
          achievements: json.achievements && json.achievements.length > 0 ? json.achievements : prev.achievements,
          positionsOfResponsibility: json.positionsOfResponsibility && json.positionsOfResponsibility.length > 0 ? json.positionsOfResponsibility : prev.positionsOfResponsibility,
          education: json.education && json.education.length > 0 ? json.education : prev.education,
          certifications: json.certifications || prev.certifications || [],
          skills: json.skills && json.skills.length > 0 ? json.skills : prev.skills,
          gallery: json.gallery && json.gallery.length > 0 ? json.gallery : prev.gallery,
          blog: json.blog && json.blog.length > 0 ? json.blog : prev.blog,
          settings: json.settings || prev.settings || {},
          contact: json.contact || prev.contact
        }));
        setError(null);
        setLastUpdated(Date.now());
      } else {
        setError(`Failed to fetch content (HTTP ${res.status})`);
      }
    } catch (err) {
      // Offline fallback mode: maintain local seed data and report status
      setError(err?.message || 'Network unavailable; displaying offline cached data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();

    // Listen for custom cross-component update events
    const handleUpdate = () => {
      fetchContent();
    };
    window.addEventListener('portfolio-data-updated', handleUpdate);
    return () => window.removeEventListener('portfolio-data-updated', handleUpdate);
  }, [fetchContent]);

  return (
    <PortfolioDataContext.Provider value={{ data, loading, error, refreshData: fetchContent, lastUpdated }}>
      {children}
    </PortfolioDataContext.Provider>
  );
}

export function usePortfolioData() {
  const context = useContext(PortfolioDataContext);
  if (!context) {
    return { data: initialFallbackData, loading: false, refreshData: () => {}, lastUpdated: 0 };
  }
  return context;
}
