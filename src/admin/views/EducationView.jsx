import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Award,
  CheckCircle2
} from 'lucide-react';
import { adminApi } from '../adminApi.js';
import { Modal, ConfirmDialog } from '../components/FeedbackModals.jsx';
import { ImagePicker } from '../components/ImagePicker.jsx';
import { safeImageSrc } from '../../utils/safeHref.js';

export function EducationView({ onToast }) {
  const [educationList, setEducationList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const defaultForm = {
    id: '',
    institution: '',
    degree: '',
    period: '2024 — Present',
    grade: 'CGPA: 8.81 / 10.0',
    status: 'Currently Enrolled (Undergraduate)',
    badge_color: '#38bdf8',
    description: '',
    coursework: [],
    highlights: [],
    logo: '',
    published: 1
  };
  const [formData, setFormData] = useState(defaultForm);
  const [courseInput, setCourseInput] = useState('');
  const [highlightInput, setHighlightInput] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getList('education');
      setEducationList(data || []);
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to load education' });
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
      id: `edu_${Date.now()}`
    });
    setCourseInput('');
    setHighlightInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      ...item,
      coursework: Array.isArray(item.coursework) ? item.coursework : [],
      highlights: Array.isArray(item.highlights) ? item.highlights : []
    });
    setCourseInput('');
    setHighlightInput('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.institution.trim() || !formData.degree.trim()) {
      onToast({ type: 'error', message: 'Institution and Degree are required' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        id: formData.id || `edu_${Date.now()}`
      };

      if (editingItem) {
        await adminApi.updateItem('education', editingItem.id, payload);
        onToast({ type: 'success', title: 'Education Updated', message: `Saved ${payload.institution}` });
      } else {
        await adminApi.createItem('education', payload);
        onToast({ type: 'success', title: 'Education Added', message: `Added ${payload.institution}` });
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to save education' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await adminApi.deleteItem('education', deleteConfirmId);
      onToast({ type: 'success', message: 'Education entry deleted' });
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
    if (targetIndex < 0 || targetIndex >= educationList.length) return;

    const reordered = [...educationList];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setEducationList(reordered);
    try {
      await adminApi.reorderItems('education', reordered.map(e => e.id));
      onToast({ type: 'success', message: 'Education order updated' });
    } catch (err) {
      onToast({ type: 'error', message: 'Failed to update order' });
      loadData();
    }
  };

  // Coursework tag helpers
  const addCourse = () => {
    if (!courseInput.trim()) return;
    if (!formData.coursework.includes(courseInput.trim())) {
      setFormData({ ...formData, coursework: [...formData.coursework, courseInput.trim()] });
    }
    setCourseInput('');
  };

  const removeCourse = (c) => {
    setFormData({ ...formData, coursework: formData.coursework.filter(x => x !== c) });
  };

  // Highlight helpers
  const addHighlight = () => {
    if (!highlightInput.trim()) return;
    setFormData({ ...formData, highlights: [...formData.highlights, highlightInput.trim()] });
    setHighlightInput('');
  };

  const removeHighlight = (idx) => {
    setFormData({ ...formData, highlights: formData.highlights.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-sky-400" />
            <span>Education & Academic Credentials</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {educationList.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your degrees, high school qualifications, CGPA/percentages, and technical coursework.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="w-full sm:w-auto justify-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Education</span>
        </button>
      </div>

      {/* Education Cards */}
      <div className="space-y-4">
        {educationList.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No education entries found. Click "Add Education" to create your first degree record.
          </div>
        ) : (
          educationList.map((item, idx) => (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                {/* Order buttons */}
                <div className="flex flex-col items-center justify-center gap-0.5 py-1">
                  <button
                    type="button"
                    onClick={() => moveOrder(idx, -1)}
                    disabled={idx === 0}
                    className="text-slate-500 hover:text-white disabled:opacity-20 p-0.5"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-[10px] text-slate-400">{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => moveOrder(idx, 1)}
                    disabled={idx === educationList.length - 1}
                    className="text-slate-500 hover:text-white disabled:opacity-20 p-0.5"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 shrink-0 overflow-hidden">
                  {item.logo ? (
                    <img loading="lazy" decoding="async" src={safeImageSrc(item.logo)} alt={item.institution} className="w-full h-full object-contain p-1" />
                  ) : (
                    <GraduationCap className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{item.institution}</h3>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border"
                      style={{
                        backgroundColor: `${item.badge_color || '#38bdf8'}15`,
                        borderColor: `${item.badge_color || '#38bdf8'}40`,
                        color: item.badge_color || '#38bdf8'
                      }}
                    >
                      {item.grade}
                    </span>
                  </div>

                  <p className="text-xs text-amber-300 font-medium">{item.degree}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{item.period} • {item.status}</p>

                  {/* Coursework preview */}
                  {Array.isArray(item.coursework) && item.coursework.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {item.coursework.slice(0, 4).map((c, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {c}
                        </span>
                      ))}
                      {item.coursework.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-500 font-mono">
                          +{item.coursework.length - 4} more
                        </span>
                      )}
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
        title={editingItem ? `Edit Education: ${editingItem.institution}` : 'Add New Academic Qualification'}
        subtitle="Specify institute name, degree title, grades, and core technical coursework."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Institution Name *
              </label>
              <input
                type="text"
                required
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="e.g. National Institute of Technology, Nagaland"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Degree / Course *
              </label>
              <input
                type="text"
                required
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g. B.Tech, Electrical & Electronics Engineering"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Time Period (Start — End / Present)
              </label>
              <input
                type="text"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                placeholder="2024 — Present"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Grade / CGPA / Score
              </label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="CGPA: 8.81 / 10.0 or 89%"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Enrollment Status
              </label>
              <input
                type="text"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                placeholder="Currently Enrolled or Completed with Distinction"
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
                  value={formData.badge_color || '#38bdf8'}
                  onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                  className="w-10 h-8 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.badge_color || '#38bdf8'}
                  onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          <ImagePicker
            label="Institution Logo / Crest"
            value={formData.logo}
            onChange={(val) => setFormData({ ...formData, logo: val })}
            placeholder="/images/avatar.webp"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Academic Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Curriculum overview and engineering focus..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Coursework Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Key Coursework Subjects
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {formData.coursework.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-sky-300"
                >
                  <span>{c}</span>
                  <button type="button" onClick={() => removeCourse(c)} className="text-slate-400 hover:text-rose-400">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type course name and press Enter (e.g. Microcontrollers, Control Systems)"
                value={courseInput}
                onChange={(e) => setCourseInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCourse(); } }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
              <button
                type="button"
                onClick={addCourse}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Highlights */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Key Academic Highlights / Distinctions
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
                placeholder="Add highlight (e.g. Strong Academic Standing with 8.81 CGPA)"
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
              <span>{editingItem ? 'Save Changes' : 'Create Entry'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        title="Delete Education Entry"
        message="Are you sure you want to permanently delete this academic credential?"
        confirmText="Delete Entry"
        confirmColor="rose"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
