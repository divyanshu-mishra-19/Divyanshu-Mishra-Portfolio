import React, { useState, useEffect } from 'react';
import { Sliders, Save, Plus, Trash2, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { adminApi } from '../adminApi.js';

export function SettingsView({ onToast }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSettings();
      setSettings(data || {});
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to load website settings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      onToast({ type: 'success', title: 'Settings Saved', message: 'Homepage & global settings updated on live website!' });
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const updateStat = (index, field, value) => {
    const arr = [...(settings.stats || [])];
    arr[index] = { ...arr[index], [field]: value };
    setSettings({ ...settings, stats: arr });
  };

  const addStat = () => {
    setSettings({
      ...settings,
      stats: [...(settings.stats || []), { label: 'New Metric', value: '10+' }]
    });
  };

  const removeStat = (index) => {
    setSettings({
      ...settings,
      stats: settings.stats.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <span className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading Configuration...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <span>Homepage & Website Settings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Customize hero banners, CTA action buttons, live stats counters, and contact text without writing code.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto justify-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Hero Controls */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Hero Section Copy</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Top Pill Status Badge
              </label>
              <input
                type="text"
                value={settings?.hero_badge || ''}
                onChange={(e) => setSettings({ ...settings, hero_badge: e.target.value })}
                placeholder="NIT NAGALAND • ACTIVE & BUILDING"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Greeting Lead Text
              </label>
              <input
                type="text"
                value={settings?.hero_greeting || ''}
                onChange={(e) => setSettings({ ...settings, hero_greeting: e.target.value })}
                placeholder="HELLO, WORLD! I AM"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Hero Tagline / Mission Statement
              </label>
              <textarea
                rows={3}
                value={settings?.hero_tagline || ''}
                onChange={(e) => setSettings({ ...settings, hero_tagline: e.target.value })}
                placeholder="Electrical & Electronics Engineer by degree, AI & Full-Stack Developer by passion..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
              Hero Call-to-Action (CTA) Buttons
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={settings?.cta_primary_text || ''}
                  onChange={(e) => setSettings({ ...settings, cta_primary_text: e.target.value })}
                  placeholder="Explore My Projects"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Primary Target Link
                </label>
                <input
                  type="text"
                  value={settings?.cta_primary_link || ''}
                  onChange={(e) => setSettings({ ...settings, cta_primary_link: e.target.value })}
                  placeholder="#projects"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Secondary Button Text
                </label>
                <input
                  type="text"
                  value={settings?.cta_secondary_text || ''}
                  onChange={(e) => setSettings({ ...settings, cta_secondary_text: e.target.value })}
                  placeholder="Get In Touch"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Secondary Target Link
                </label>
                <input
                  type="text"
                  value={settings?.cta_secondary_link || ''}
                  onChange={(e) => setSettings({ ...settings, cta_secondary_link: e.target.value })}
                  placeholder="#contact"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Statistics Counters & Contact Notice */}
        <div className="space-y-6">
          {/* Key Statistics Counters */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Homepage Key Statistics</span>
              </h3>
              <button
                type="button"
                onClick={addStat}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Metric</span>
              </button>
            </div>

            <div className="space-y-3">
              {(settings?.stats || []).map((st, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-400 mb-1">Metric Label</label>
                    <input
                      type="text"
                      value={st.label}
                      onChange={(e) => updateStat(i, 'label', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>

                  <div className="w-28">
                    <label className="block text-[10px] text-slate-400 mb-1">Value Display</label>
                    <input
                      type="text"
                      value={st.value}
                      onChange={(e) => updateStat(i, 'value', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono font-bold text-amber-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeStat(i)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 mt-4"
                    title="Remove Metric"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section Notice */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
              Contact Section Status Notice
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Availability & Collaboration Pitch
              </label>
              <textarea
                rows={3}
                value={settings?.contact_notice || ''}
                onChange={(e) => setSettings({ ...settings, contact_notice: e.target.value })}
                placeholder="Always open to high-impact software engineering roles, research collaborations..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
