import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Star,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Tag,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { adminApi } from '../adminApi.js';
import { Modal, ConfirmDialog } from '../components/FeedbackModals.jsx';
import { ImagePicker } from '../components/ImagePicker.jsx';
import { safeImageSrc } from '../../utils/safeHref.js';

export function ProjectsView({ onToast }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const defaultForm = {
    id: '',
    file: '',
    title: '',
    spine_title: '',
    tagline: '',
    description: '',
    tags: [],
    status: 'In Development',
    image: '',
    spine_bg: '#1e293b',
    spine_accent: '#38bdf8',
    live_url: '',
    github_url: '',
    video_url: '',
    features: [],
    contribution: '',
    project_date: '2025 — 2026',
    category: 'AI / ML',
    featured: 0,
    published: 1
  };
  const [formData, setFormData] = useState(defaultForm);
  const [tagInput, setTagInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getList('projects');
      setProjects(data || []);
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to load projects' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      ...defaultForm,
      id: `proj_${Date.now()}`
    });
    setTagInput('');
    setFeatureInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    setFormData({
      ...proj,
      tags: Array.isArray(proj.tags) ? proj.tags : [],
      features: Array.isArray(proj.features) ? proj.features : []
    });
    setTagInput('');
    setFeatureInput('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      onToast({ type: 'error', message: 'Project title is required' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        id: formData.id || formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        file: formData.file || `${formData.id}.py`,
        spine_title: formData.spine_title || formData.title.slice(0, 18).toUpperCase()
      };

      if (editingProject) {
        await adminApi.updateItem('projects', editingProject.id, payload);
        onToast({ type: 'success', title: 'Project Updated', message: `Saved changes to "${payload.title}"` });
      } else {
        await adminApi.createItem('projects', payload);
        onToast({ type: 'success', title: 'Project Created', message: `Added "${payload.title}"` });
      }

      setIsModalOpen(false);
      loadProjects();
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to save project' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await adminApi.deleteItem('projects', deleteConfirmId);
      onToast({ type: 'success', message: 'Project removed from database' });
      setDeleteConfirmId(null);
      loadProjects();
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to delete project' });
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (id, field) => {
    try {
      await adminApi.toggleField('projects', id, field);
      loadProjects();
      onToast({ type: 'info', message: `Toggled ${field} status` });
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const moveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const reordered = [...projects];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setProjects(reordered);
    try {
      await adminApi.reorderItems('projects', reordered.map(p => p.id));
      onToast({ type: 'success', message: 'Display order updated' });
    } catch (err) {
      onToast({ type: 'error', message: 'Failed to update order' });
      loadProjects();
    }
  };

  // Tag Helpers
  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
    }
    setTagInput('');
  };

  const removeTag = (t) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== t) });
  };

  // Feature Bullet Helpers
  const addFeature = () => {
    if (!featureInput.trim()) return;
    setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
    setFeatureInput('');
  };

  const removeFeature = (idx) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== idx) });
  };

  // Filter
  const filtered = projects.filter(p => {
    const matchesSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const categories = ['ALL', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-amber-400" />
            <span>Engineering Projects</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {projects.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage projects shown on the 3D interactive book shelf. Add research, hackathons, and software projects.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects by title, tag, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table / Card List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs min-w-[620px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">Order</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4 hidden md:table-cell">Category</th>
                <th className="py-3 px-4 hidden lg:table-cell">Status Badge</th>
                <th className="py-3 px-4 text-center">Visibility</th>
                <th className="py-3 px-4 text-center">Featured</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No projects match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((proj, idx) => (
                  <tr key={proj.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Order arrows */}
                    <td className="py-3 px-2 text-center">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveOrder(idx, -1)}
                          disabled={idx === 0}
                          className="text-slate-500 hover:text-white disabled:opacity-20 p-0.5"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-[10px] text-slate-400">{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => moveOrder(idx, 1)}
                          disabled={idx === projects.length - 1}
                          className="text-slate-500 hover:text-white disabled:opacity-20 p-0.5"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Project info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                          {proj.image ? (
                            <img loading="lazy" decoding="async" src={safeImageSrc(proj.image)} alt={proj.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold">
                              {proj.title?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate max-w-xs group-hover:text-amber-300 transition-colors">
                            {proj.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {proj.tagline || proj.description}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {(Array.isArray(proj.tags) ? proj.tags : []).slice(0, 3).map((t, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/60 text-slate-300 text-[11px] font-medium">
                        {proj.category || 'General'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {proj.status || 'Active'}
                      </span>
                    </td>

                    {/* Published Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleStatus(proj.id, 'published')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                          proj.published === 1
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {proj.published === 1 ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{proj.published === 1 ? 'Live' : 'Draft'}</span>
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleStatus(proj.id, 'featured')}
                        className={`p-1.5 rounded-lg transition-colors ${
                          proj.featured === 1
                            ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                        title={proj.featured === 1 ? 'Featured on Top' : 'Mark as Featured'}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(proj)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit project"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(proj.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? `Edit Project: ${editingProject.title}` : 'Add New Engineering Project'}
        subtitle="Specify technical architecture, hardware/software telemetry, links, and 3D spine styles."
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. AI Early Osteoarthritis Screening"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Project Slug / Unique ID
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="osteo-ai-screening"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Tagline (Subheader)
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Multimodal AI & Wearable Sensor Screening"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              >
                <option value="AI / ML">AI / ML</option>
                <option value="Computer Vision">Computer Vision</option>
                <option value="Data Science & ML">Data Science & ML</option>
                <option value="IoT & Embedded">IoT & Embedded</option>
                <option value="Full-Stack Web">Full-Stack Web</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="MedTech">MedTech</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Status Badge
              </label>
              <input
                type="text"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                placeholder="e.g. SIH 2026 Nominee / Production Ready"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                3D Book Spine Title
              </label>
              <input
                type="text"
                value={formData.spine_title}
                onChange={(e) => setFormData({ ...formData, spine_title: e.target.value })}
                placeholder="OSTEOARTHRITIS AI"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-mono uppercase"
              />
            </div>

            {/* Colors for 3D Spine */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Spine Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.spine_bg || '#1e293b'}
                  onChange={(e) => setFormData({ ...formData, spine_bg: e.target.value })}
                  className="w-10 h-8 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.spine_bg || '#1e293b'}
                  onChange={(e) => setFormData({ ...formData, spine_bg: e.target.value })}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Spine Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.spine_accent || '#38bdf8'}
                  onChange={(e) => setFormData({ ...formData, spine_accent: e.target.value })}
                  className="w-10 h-8 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.spine_accent || '#38bdf8'}
                  onChange={(e) => setFormData({ ...formData, spine_accent: e.target.value })}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Image Picker */}
          <ImagePicker
            label="Project Cover Image"
            value={formData.image}
            onChange={(val) => setFormData({ ...formData, image: val })}
            placeholder="/images/osteo-screening-ai.webp"
          />

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Detailed Description / Engineering Overview *
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the system problem statement, ML architectures, hardware sensors, and performance benchmarks..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Tech Stack Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Tech Stack Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {formData.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type technology (e.g. PyTorch, YOLOv8) and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                placeholder="https://github.com/divyanshu1911/..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Live Demo / Paper URL
              </label>
              <input
                type="url"
                value={formData.live_url}
                onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={formData.published === 1}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
              />
              <span>Published (Visible on Live Website)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={formData.featured === 1}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
              />
              <span>Mark as Featured Project</span>
            </label>
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
              <span>{editingProject ? 'Save Changes' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        title="Delete Project"
        message="Are you sure you want to permanently delete this project? This will remove its database entry and take it off your live portfolio."
        confirmText="Delete Project"
        confirmColor="rose"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
