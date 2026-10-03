import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, CheckCircle2, User, Link as LinkIcon, FileText } from 'lucide-react';
import { adminApi } from '../adminApi.js';
import { ImagePicker } from '../components/ImagePicker.jsx';

export function ProfileView({ onToast }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getProfile();
      setProfile(data);
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateProfile(profile);
      onToast({ type: 'success', title: 'Profile Updated', message: 'Personal details saved and synced with live portfolio!' });
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  const addTitle = () => {
    if (!newTitle.trim()) return;
    setProfile(prev => ({
      ...prev,
      titles: [...(prev.titles || []), newTitle.trim().toUpperCase()]
    }));
    setNewTitle('');
  };

  const removeTitle = (index) => {
    setProfile(prev => ({
      ...prev,
      titles: prev.titles.filter((_, i) => i !== index)
    }));
  };

  const addParagraph = () => {
    setProfile(prev => ({
      ...prev,
      about_paragraphs: [...(prev.about_paragraphs || []), '']
    }));
  };

  const updateParagraph = (index, value) => {
    setProfile(prev => {
      const arr = [...(prev.about_paragraphs || [])];
      arr[index] = value;
      return { ...prev, about_paragraphs: arr };
    });
  };

  const removeParagraph = (index) => {
    setProfile(prev => ({
      ...prev,
      about_paragraphs: prev.about_paragraphs.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <span className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading Profile Configuration...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-200">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white">Profile & Bio Settings</h2>
          <p className="text-xs text-slate-400">
            Edit your core identity, bio narrative, contact endpoints, and social channels.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Personal Identity & Imagery */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <User className="w-4 h-4 text-amber-400" />
              <span>Identity & Media</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profile?.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Status Badge Pill
              </label>
              <input
                type="text"
                value={profile?.status || ''}
                onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                placeholder="e.g. NIT Nagaland • Active & Building"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <ImagePicker
              label="Avatar / Profile Photo"
              value={profile?.avatar || ''}
              onChange={(val) => setProfile({ ...profile, avatar: val })}
              placeholder="/images/avatar.webp"
            />

            <ImagePicker
              label="Workspace Illustration"
              value={profile?.workspace_illustration || ''}
              onChange={(val) => setProfile({ ...profile, workspace_illustration: val })}
              placeholder="/images/workspace.webp"
            />
          </div>

          {/* Contact Details */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <LinkIcon className="w-4 h-4 text-emerald-400" />
              <span>Contact & Social Links</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={profile?.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                GitHub Profile URL
              </label>
              <input
                type="url"
                value={profile?.github || ''}
                onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={profile?.linkedin || ''}
                onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Right Columns: Titles, Hero Subtitle, About Paragraphs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Animated Hero Titles */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between pb-3 border-b border-slate-800">
              <span>Hero Rotating Titles</span>
              <span className="text-xs text-slate-400 font-mono">{(profile?.titles || []).length} Titles</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {(profile?.titles || []).map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-medium text-amber-300"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => removeTitle(idx)}
                    className="text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new title (e.g. DATA SCIENCE & ML)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTitle(); } }}
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
              <button
                type="button"
                onClick={addTitle}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Hero Subtitle (Degree & Institution)
              </label>
              <input
                type="text"
                value={profile?.hero_subtitle || ''}
                onChange={(e) => setProfile({ ...profile, hero_subtitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          {/* About Section Narrative */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>About Me Narrative</span>
              </h3>
              <button
                type="button"
                onClick={addParagraph}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Paragraph</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                About Section Tagline
              </label>
              <input
                type="text"
                value={profile?.about_tagline || ''}
                onChange={(e) => setProfile({ ...profile, about_tagline: e.target.value })}
                placeholder="Electrical & Electronics Engineer by degree, AI & Full-Stack Developer by passion."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Biography Paragraphs
              </label>
              {(profile?.about_paragraphs || []).map((para, idx) => (
                <div key={idx} className="relative group">
                  <div className="flex items-center justify-between mb-1 text-[11px] text-slate-400">
                    <span>Paragraph {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeParagraph(idx)}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[10px]"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={para}
                    onChange={(e) => updateParagraph(idx, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
