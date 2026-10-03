import React, { useState, useEffect } from 'react';
import { Cpu, Plus, Edit, Trash2, Search, Filter, Tag, Check } from 'lucide-react';
import { adminApi } from '../adminApi.js';
import { Modal, ConfirmDialog } from '../components/FeedbackModals.jsx';

export function SkillsView({ onToast }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const defaultForm = {
    id: '',
    name: '',
    category: 'Backend',
    color: '#38bdf8',
    level: 85,
    icon_name: '',
    published: 1
  };
  const [formData, setFormData] = useState(defaultForm);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getList('skills');
      setSkills(data || []);
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to load skills' });
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
      id: `skill_${Date.now()}`
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onToast({ type: 'error', message: 'Skill name is required' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        id: formData.id || `skill_${Date.now()}`
      };

      if (editingItem) {
        await adminApi.updateItem('skills', editingItem.id, payload);
        onToast({ type: 'success', title: 'Skill Updated', message: `Saved ${payload.name}` });
      } else {
        await adminApi.createItem('skills', payload);
        onToast({ type: 'success', title: 'Skill Added', message: `Added ${payload.name}` });
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to save skill' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await adminApi.deleteItem('skills', deleteConfirmId);
      onToast({ type: 'success', message: 'Skill removed' });
      setDeleteConfirmId(null);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to delete' });
    } finally {
      setDeleting(false);
    }
  };

  const categories = ['ALL', 'Frontend', 'Backend', 'Languages', 'Systems', 'Database', 'Tools', 'AI / ML', 'Cloud'];

  const filtered = skills.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || s.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <span>Technical Skills Matrix</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {skills.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure technical stacks, proficiency bars, custom color identifiers, and categorizations.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search skills by name..."
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

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-slate-900 border border-slate-800 rounded-2xl">
            No skills found. Click "Add Skill" to create one.
          </div>
        ) : (
          filtered.map((skill) => (
            <div
              key={skill.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: skill.color || '#38bdf8' }}
                    />
                    <span className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                      {skill.name}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {skill.category}
                  </span>
                </div>

                {/* Proficiency progress */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Proficiency</span>
                    <span>{skill.level || 85}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${skill.level || 85}%`,
                        backgroundColor: skill.color || '#38bdf8'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-1.5 mt-4 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => openEditModal(skill)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Edit skill"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(skill.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  title="Delete skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
        title={editingItem ? `Edit Skill: ${editingItem.name}` : 'Add New Technical Skill'}
        subtitle="Configure skill naming, category groupings, proficiency percentages, and brand colors."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Skill Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. PyTorch, YOLOv8, React.js"
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
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Languages">Languages</option>
              <option value="Systems">Systems</option>
              <option value="Database">Database</option>
              <option value="Tools">Tools</option>
              <option value="AI / ML">AI / ML</option>
              <option value="Cloud">Cloud</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Brand Accent Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.color || '#38bdf8'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-10 h-8 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer"
              />
              <input
                type="text"
                value={formData.color || '#38bdf8'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Proficiency Level
              </label>
              <span className="font-mono text-xs text-amber-400 font-bold">{formData.level || 85}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={formData.level || 85}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
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
              <span>{editingItem ? 'Save Changes' : 'Create Skill'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        title="Delete Skill"
        message="Are you sure you want to delete this skill entry from your technical toolkit?"
        confirmText="Delete"
        confirmColor="rose"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
