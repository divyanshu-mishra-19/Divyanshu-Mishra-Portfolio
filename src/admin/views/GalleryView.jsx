import React, { useState, useEffect } from 'react';
import {
  Camera,
  Plus,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Star,
  Image as ImageIcon,
  FolderOpen
} from 'lucide-react';
import { adminApi } from '../adminApi.js';
import { Modal, ConfirmDialog } from '../components/FeedbackModals.jsx';
import { ImagePicker } from '../components/ImagePicker.jsx';
import { safeImageSrc } from '../../utils/safeHref.js';

export function GalleryView({ onToast }) {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const defaultForm = {
    id: '',
    title: '',
    section: 'events',
    category: 'Hackathons',
    date: '2025 — 2026',
    location: 'NIT Nagaland Campus',
    role: '',
    metric: '',
    images: [],
    captions: [],
    description: '',
    featured: 0,
    published: 1
  };
  const [formData, setFormData] = useState(defaultForm);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [captionInput, setCaptionInput] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getList('gallery');
      setGalleryItems(data || []);
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to load gallery' });
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
      id: `gal_${Date.now()}`
    });
    setNewPhotoUrl('');
    setCaptionInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      ...item,
      images: Array.isArray(item.images) ? item.images : [],
      captions: Array.isArray(item.captions) ? item.captions : []
    });
    setNewPhotoUrl('');
    setCaptionInput('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      onToast({ type: 'error', message: 'Gallery title is required' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        id: formData.id || `gal_${Date.now()}`
      };

      if (editingItem) {
        await adminApi.updateItem('gallery', editingItem.id, payload);
        onToast({ type: 'success', title: 'Gallery Updated', message: `Saved ${payload.title}` });
      } else {
        await adminApi.createItem('gallery', payload);
        onToast({ type: 'success', title: 'Gallery Added', message: `Added ${payload.title}` });
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to save gallery item' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await adminApi.deleteItem('gallery', deleteConfirmId);
      onToast({ type: 'success', message: 'Gallery entry deleted' });
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
    if (targetIndex < 0 || targetIndex >= galleryItems.length) return;

    const reordered = [...galleryItems];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setGalleryItems(reordered);
    try {
      await adminApi.reorderItems('gallery', reordered.map(g => g.id));
      onToast({ type: 'success', message: 'Display order updated' });
    } catch (err) {
      onToast({ type: 'error', message: 'Failed to update order' });
      loadData();
    }
  };

  const addImageToEvent = (url) => {
    if (!url) return;
    if (!formData.images.includes(url)) {
      setFormData({
        ...formData,
        images: [...formData.images, url],
        captions: [...formData.captions, captionInput.trim() || formData.title]
      });
      setCaptionInput('');
    }
  };

  const removeImageFromEvent = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
      captions: formData.captions.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-fuchsia-400" />
            <span>Moments & Photo Gallery</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {galleryItems.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize event photos, hackathons, and campus moments. Each entry supports 2 to 3+ photos with captions.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="w-full sm:w-auto justify-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Gallery Album</span>
        </button>
      </div>

      {/* Grid of gallery albums */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {galleryItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-slate-900 border border-slate-800 rounded-2xl">
            No gallery items found. Click "Add Gallery Album" to upload event photos.
          </div>
        ) : (
          galleryItems.map((item, idx) => (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Photo banner */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  {Array.isArray(item.images) && item.images[0] ? (
                    <img
                      loading="lazy"
                      decoding="async"
                      src={safeImageSrc(item.images[0])}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-950/80 backdrop-blur-md text-white border border-white/10">
                      {(item.images || []).length} Photos
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 uppercase">
                      {item.section}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-1.5">
                  <h3 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {item.date} • {item.location}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Bottom controls */}
              <div className="px-4 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveOrder(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 text-slate-500 hover:text-white disabled:opacity-20"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono text-slate-400">{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => moveOrder(idx, 1)}
                    disabled={idx === galleryItems.length - 1}
                    className="p-1 text-slate-500 hover:text-white disabled:opacity-20"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Gallery: ${editingItem.title}` : 'Add New Gallery Album'}
        subtitle="Upload 2-3+ photos per event with custom captions and campus category."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Album / Event Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Hackdays Nagaland & Hack $ Brahma"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Section Grouping
              </label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              >
                <option value="events">Events & Fests</option>
                <option value="moments">Campus Moments</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Hackathons, Fest Leadership, Govt Bootcamps"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Date / Period
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="2025 — 2026"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="NIT Nagaland Campus / Dimapur"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Role / Leadership Title
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Lead Organizer & Technical Lead"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Event Narrative Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the fest highlight, hackathon track, or memorable campus story..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Photos Management */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Event Images ({formData.images.length} photos)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Min 2-3 photos per event</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {formData.images.map((img, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-700 bg-slate-900">
                  <img loading="lazy" decoding="async" src={safeImageSrc(img)} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-2 transition-opacity">
                    <p className="text-[10px] text-slate-200 line-clamp-2">
                      {formData.captions[i] || 'No caption'}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeImageFromEvent(i)}
                      className="px-2 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded text-[10px] self-end"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                placeholder="Optional caption for this photo..."
                value={captionInput}
                onChange={(e) => setCaptionInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
              <ImagePicker
                label="Add Photo to this Event"
                value={newPhotoUrl}
                onChange={(url) => {
                  if (url) {
                    addImageToEvent(url);
                    setNewPhotoUrl('');
                  }
                }}
                placeholder="Upload or choose photo..."
              />
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
              <span>{editingItem ? 'Save Changes' : 'Create Gallery Entry'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        title="Delete Gallery Album"
        message="Are you sure you want to permanently delete this gallery item?"
        confirmText="Delete"
        confirmColor="rose"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
