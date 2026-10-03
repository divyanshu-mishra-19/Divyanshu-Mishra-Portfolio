import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Star,
  ExternalLink,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';
import { adminApi } from '../adminApi.js';
import { Modal, ConfirmDialog } from '../components/FeedbackModals.jsx';
import { ImagePicker } from '../components/ImagePicker.jsx';
import { safeImageSrc } from '../../utils/safeHref.js';

export function AchievementsView({ onToast }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const defaultForm = {
    id: '',
    title: '',
    spine_title: '',
    desc: '',
    detailed_description: '',
    year: '2025',
    badge: 'National Award',
    issuer: '',
    category: 'Innovation',
    metric: '',
    images: [],
    key_highlights: [],
    skills: [],
    certificate: {
      credentialId: '',
      issueDate: '',
      status: 'Verified Credential',
      organization: '',
      signatory1: '',
      signatory2: '',
      goldSealText: 'OFFICIAL MERIT RECOGNITION',
      verificationUrl: ''
    },
    featured: 1,
    published: 1
  };
  const [formData, setFormData] = useState(defaultForm);
  const [highlightInput, setHighlightInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getList('achievements');
      setAchievements(data || []);
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to load achievements' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      ...defaultForm,
      id: `ach_${Date.now()}`
    });
    setHighlightInput('');
    setSkillInput('');
    setPhotoUrlInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      ...item,
      images: Array.isArray(item.images) ? item.images : [],
      key_highlights: Array.isArray(item.key_highlights) ? item.key_highlights : [],
      skills: Array.isArray(item.skills) ? item.skills : [],
      certificate: typeof item.certificate === 'object' && item.certificate !== null ? item.certificate : defaultForm.certificate
    });
    setHighlightInput('');
    setSkillInput('');
    setPhotoUrlInput('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      onToast({ type: 'error', message: 'Achievement title is required' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        id: formData.id || `ach_${Date.now()}`,
        spine_title: formData.spine_title || formData.title.slice(0, 18).toUpperCase()
      };

      if (editingItem) {
        await adminApi.updateItem('achievements', editingItem.id, payload);
        onToast({ type: 'success', title: 'Achievement Updated', message: `Saved ${payload.title}` });
      } else {
        await adminApi.createItem('achievements', payload);
        onToast({ type: 'success', title: 'Achievement Added', message: `Added ${payload.title}` });
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to save achievement' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await adminApi.deleteItem('achievements', deleteConfirmId);
      onToast({ type: 'success', message: 'Achievement deleted' });
      setDeleteConfirmId(null);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to delete' });
    } finally {
      setDeleting(false);
    }
  };

  const moveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= achievements.length) return;

    const reordered = [...achievements];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setAchievements(reordered);
    try {
      await adminApi.reorderItems('achievements', reordered.map(a => a.id));
      onToast({ type: 'success', message: 'Display order updated' });
    } catch (err) {
      onToast({ type: 'error', message: 'Failed to update order' });
      loadData();
    }
  };

  // Photo handlers
  const addPhoto = (url) => {
    if (!url) return;
    if (!formData.images.includes(url)) {
      setFormData({ ...formData, images: [...formData.images, url] });
    }
  };

  const removePhoto = (url) => {
    setFormData({ ...formData, images: formData.images.filter(x => x !== url) });
  };

  // Highlights
  const addHighlight = () => {
    if (!highlightInput.trim()) return;
    setFormData({ ...formData, key_highlights: [...formData.key_highlights, highlightInput.trim()] });
    setHighlightInput('');
  };

  const removeHighlight = (idx) => {
    setFormData({ ...formData, key_highlights: formData.key_highlights.filter((_, i) => i !== idx) });
  };

  // Skills
  const addSkill = () => {
    if (!skillInput.trim()) return;
    if (!formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
    }
    setSkillInput('');
  };

  const removeSkill = (s) => {
    setFormData({ ...formData, skills: formData.skills.filter(x => x !== s) });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Honors & Achievements</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {achievements.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your hackathon titles, ideathon prizes, institute distinctions, multi-photo proof galleries, and verified certificates.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="w-full sm:w-auto justify-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Achievement</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {achievements.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No achievements listed yet.
          </div>
        ) : (
          achievements.map((item, idx) => (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                {/* Order arrows */}
                <div className="flex flex-col items-center justify-center gap-0.5 py-1">
                  <button
                    type="button"
                    onClick={() => moveOrder(idx, -1)}
                    disabled={idx === 0}
                    className="text-slate-500 hover:text-white disabled:opacity-20 p-0.5"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[10px] text-slate-400">{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => moveOrder(idx, 1)}
                    disabled={idx === achievements.length - 1}
                    className="text-slate-500 hover:text-white disabled:opacity-20 p-0.5"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                  {Array.isArray(item.images) && item.images[0] ? (
                    <img loading="lazy" decoding="async" src={safeImageSrc(item.images[0])} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-400">
                      <Award className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{item.title}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.year}</span>
                  </div>

                  <p className="text-xs text-amber-300">{item.issuer || item.category}</p>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{item.desc}</p>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                    <span>{(Array.isArray(item.images) ? item.images : []).length} Proof Photos</span>
                    {item.certificate?.credentialId && (
                      <span>• Credential ID: {item.certificate.credentialId}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Edit className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 text-xs transition-colors border border-slate-700 hover:border-rose-800/60"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Achievement: ${editingItem.title}` : 'Add New Achievement'}
        subtitle="Manage competition details, multi-photo event proof, and verified certificate credentials."
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Achievement Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Top 5 Finalist — Capabl Agentic AI Hackathon"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Award Badge Text
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. 1st Prize / National Finalist"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Issuing Body / Event Organizer
              </label>
              <input
                type="text"
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                placeholder="e.g. Capabl India & National AI Jury"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Year / Date
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2025"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Agentic AI & Multi-Agent Orchestration"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Impact / Metric Pill
              </label>
              <input
                type="text"
                value={formData.metric}
                onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                placeholder="Top 5 Finalist • 26 Teams"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Short Summary Description
            </label>
            <input
              type="text"
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              placeholder="Short 1-sentence card summary..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Detailed Case Study Narrative
            </label>
            <textarea
              rows={3}
              value={formData.detailed_description}
              onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
              placeholder="Full narrative of your achievement, jury evaluation, and prototype architecture..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Supporting Photos (2-3+ photos) */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Event Proof Photos (2 to 3 photos per achievement)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">{formData.images.length} photos</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.images.map((img, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-700 bg-slate-900">
                  <img loading="lazy" decoding="async" src={safeImageSrc(img)} alt={`Proof ${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(img)}
                    className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <ImagePicker
              label="Add Supporting Photo"
              value={photoUrlInput}
              onChange={(url) => {
                if (url) {
                  addPhoto(url);
                  setPhotoUrlInput('');
                }
              }}
              placeholder="Upload or choose photo..."
            />
          </div>

          {/* Verified Certificate Details */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Certificate Metadata</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Credential ID</label>
                <input
                  type="text"
                  value={formData.certificate?.credentialId || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    certificate: { ...formData.certificate, credentialId: e.target.value }
                  })}
                  placeholder="e.g. CAPABL-AI-SAKSHAM-2025-084"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Verification URL</label>
                <input
                  type="url"
                  value={formData.certificate?.verificationUrl || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    certificate: { ...formData.certificate, verificationUrl: e.target.value }
                  })}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Signatory 1</label>
                <input
                  type="text"
                  value={formData.certificate?.signatory1 || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    certificate: { ...formData.certificate, signatory1: e.target.value }
                  })}
                  placeholder="e.g. Dr. K. R. Sharma (Hackathon Jury Chair)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Signatory 2</label>
                <input
                  type="text"
                  value={formData.certificate?.signatory2 || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    certificate: { ...formData.certificate, signatory2: e.target.value }
                  })}
                  placeholder="e.g. A. Sengupta (Chief Program Director)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <span>{editingItem ? 'Save Changes' : 'Create Achievement'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        title="Delete Achievement"
        message="Are you sure you want to permanently delete this achievement?"
        confirmText="Delete Achievement"
        confirmColor="rose"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
