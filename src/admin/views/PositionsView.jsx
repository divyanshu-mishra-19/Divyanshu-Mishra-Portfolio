import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Award,
  Users
} from 'lucide-react';
import { adminApi } from '../adminApi.js';
import { Modal, ConfirmDialog } from '../components/FeedbackModals.jsx';
import { ImagePicker } from '../components/ImagePicker.jsx';

export function PositionsView({ onToast }) {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const defaultForm = {
    id: '',
    company: '',
    role: '',
    period: '2025 — Present',
    type: 'Leadership Role',
    badge_color: '#f59e0b',
    metric: '',
    description: '',
    highlights: [],
    skills: [],
    logo: '',
    images: [],
    external_link: '',
    published: 1
  };
  const [formData, setFormData] = useState(defaultForm);
  const [highlightInput, setHighlightInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getList('positions');
      setPositions(data || []);
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to load positions' });
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
      id: `pos_${Date.now()}`
    });
    setHighlightInput('');
    setSkillInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      ...item,
      highlights: Array.isArray(item.highlights) ? item.highlights : [],
      skills: Array.isArray(item.skills) ? item.skills : [],
      images: Array.isArray(item.images) ? item.images : []
    });
    setHighlightInput('');
    setSkillInput('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.role.trim()) {
      onToast({ type: 'error', message: 'Organization and Role are required' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        id: formData.id || `pos_${Date.now()}`
      };

      if (editingItem) {
        await adminApi.updateItem('positions', editingItem.id, payload);
        onToast({ type: 'success', title: 'Position Updated', message: `Saved ${payload.role}` });
      } else {
        await adminApi.createItem('positions', payload);
        onToast({ type: 'success', title: 'Position Created', message: `Added ${payload.role}` });
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to save position' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await adminApi.deleteItem('positions', deleteConfirmId);
      onToast({ type: 'success', message: 'Position deleted successfully' });
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
    if (targetIndex < 0 || targetIndex >= positions.length) return;

    const reordered = [...positions];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setPositions(reordered);
    try {
      await adminApi.reorderItems('positions', reordered.map(p => p.id));
      onToast({ type: 'success', message: 'Display order updated' });
    } catch (err) {
      onToast({ type: 'error', message: 'Failed to update order' });
      loadData();
    }
  };

  // Highlights
  const addHighlight = () => {
    if (!highlightInput.trim()) return;
    setFormData({ ...formData, highlights: [...formData.highlights, highlightInput.trim()] });
    setHighlightInput('');
  };

  const removeHighlight = (idx) => {
    setFormData({ ...formData, highlights: formData.highlights.filter((_, i) => i !== idx) });
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
            <Briefcase className="w-5 h-5 text-emerald-400" />
            <span>Positions of Responsibility</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {positions.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your leadership roles, student body appointments, hackathon organizing roles, and council positions.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="w-full sm:w-auto justify-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Position</span>
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {positions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No positions listed yet. Click "Add Position" to create your first role.
          </div>
        ) : (
          positions.map((item, idx) => (
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
                    disabled={idx === positions.length - 1}
                    className="text-slate-500 hover:text-white disabled:opacity-20 p-0.5"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{item.role}</h3>
                    <span className="text-xs text-amber-300 font-semibold font-mono">@{item.company}</span>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border"
                      style={{
                        backgroundColor: `${item.badge_color || '#f59e0b'}15`,
                        borderColor: `${item.badge_color || '#f59e0b'}40`,
                        color: item.badge_color || '#f59e0b'
                      }}
                    >
                      {item.type}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono">
                    {item.period} {item.metric && `• ${item.metric}`}
                  </p>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{item.description}</p>

                  {/* Skills tags */}
                  {Array.isArray(item.skills) && item.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {item.skills.map((s, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
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
        title={editingItem ? `Edit Position: ${editingItem.role}` : 'Add Position of Responsibility'}
        subtitle="Specify organization, leadership title, impact metrics, and key accomplishments."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Role / Position Title *
              </label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Smart India Hackathon Student Coordinator"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Organization / Institution *
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. NIT NAGALAND & MOE INNOVATION CELL"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Period (Start — End / Present)
              </label>
              <input
                type="text"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                placeholder="2025 — Present"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Leadership Category / Type
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g. National Hackathon Leadership / Apex Student Leadership"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Key Metric Pill
              </label>
              <input
                type="text"
                value={formData.metric}
                onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                placeholder="e.g. 200+ Hackers • State-Level Hackathon"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Badge Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.badge_color || '#f59e0b'}
                  onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                  className="w-10 h-8 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.badge_color || '#f59e0b'}
                  onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          <ImagePicker
            label="Organization Logo / Icon"
            value={formData.logo}
            onChange={(val) => setFormData({ ...formData, logo: val })}
            placeholder="/images/avatar.webp"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Position Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline high-level responsibilities, leadership scope, and coordination results..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Highlights */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Key Responsibilities & Highlights
            </label>
            <div className="space-y-1.5 mb-2">
              {formData.highlights.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200">
                  <span>• {h}</span>
                  <button type="button" onClick={() => removeHighlight(i)} className="text-rose-400 hover:text-rose-300 text-xs">
                    Delete
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add bullet accomplishment (e.g. Founded Hackdays Nagaland for 200+ hackers)"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHighlight(); } }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
              <button
                type="button"
                onClick={addHighlight}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Leadership & Operational Skills
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {formData.skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300"
                >
                  <span>{s}</span>
                  <button type="button" onClick={() => removeSkill(s)} className="text-slate-400 hover:text-rose-400">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type skill and press Enter (e.g. Hackathon Mentorship, Team Coordination)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Actions */}
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
              <span>{editingItem ? 'Save Changes' : 'Create Position'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        title="Delete Leadership Position"
        message="Are you sure you want to permanently delete this leadership position?"
        confirmText="Delete Position"
        confirmColor="rose"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
