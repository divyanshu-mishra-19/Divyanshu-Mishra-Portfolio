import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileCheck,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Calendar,
  ShieldCheck,
  Maximize2,
  X
} from 'lucide-react';
import { adminApi } from '../adminApi.js';
import { Modal, ConfirmDialog } from '../components/FeedbackModals.jsx';
import { ImagePicker } from '../components/ImagePicker.jsx';
import { safeHref, safeImageSrc } from '../../utils/safeHref.js';

export function CertificationsView({ onToast }) {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const defaultForm = {
    id: '',
    name: '',
    issuing_organization: '',
    issue_date: '2025',
    expiry_date: 'No Expiration',
    credential_id: '',
    credential_url: '',
    certificate_file: '',
    description: '',
    published: 1
  };
  const [formData, setFormData] = useState(defaultForm);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getList('certifications');
      setCertifications(data || []);
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to load certifications' });
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
      id: `cert_${Date.now()}`
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
    if (!formData.name.trim() || !formData.issuing_organization.trim()) {
      onToast({ type: 'error', message: 'Certification Name and Organization are required' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        id: formData.id || `cert_${Date.now()}`
      };

      if (editingItem) {
        await adminApi.updateItem('certifications', editingItem.id, payload);
        onToast({ type: 'success', title: 'Certification Updated', message: `Saved ${payload.name}` });
      } else {
        await adminApi.createItem('certifications', payload);
        onToast({ type: 'success', title: 'Certification Added', message: `Added ${payload.name}` });
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to save certification' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await adminApi.deleteItem('certifications', deleteConfirmId);
      onToast({ type: 'success', message: 'Certification deleted' });
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
    if (targetIndex < 0 || targetIndex >= certifications.length) return;

    const reordered = [...certifications];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setCertifications(reordered);
    try {
      await adminApi.reorderItems('certifications', reordered.map(c => c.id));
      onToast({ type: 'success', message: 'Display order updated' });
    } catch (err) {
      onToast({ type: 'error', message: 'Failed to update order' });
      loadData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-violet-400" />
            <span>Licenses & Certifications</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {certifications.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your online certifications, specialized courses (Deep Learning, Cloud, Hardware), credential IDs, and links.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="w-full sm:w-auto justify-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Certification</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {certifications.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No certifications registered yet. Click "Add Certification" to add your verified licenses or certificates.
          </div>
        ) : (
          certifications.map((item, idx) => (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                {/* Order */}
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
                    disabled={idx === certifications.length - 1}
                    className="text-slate-500 hover:text-white disabled:opacity-20 p-0.5"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {item.certificate_file ? (
                  <div
                    onClick={() => setFullscreenImage({ url: item.certificate_file, title: item.name, issuer: item.issuing_organization })}
                    className="w-16 h-12 rounded-xl bg-slate-950 border border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer relative group p-0.5 shadow-sm"
                    title="Click to view full certificate (uncropped)"
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src={safeImageSrc(item.certificate_file)}
                      alt={item.name}
                      className="max-h-full max-w-full w-auto h-auto object-contain select-none"
                    />
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-violet-400 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{item.name}</h3>
                    <span className="text-xs text-violet-300 font-mono">@{item.issuing_organization}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono">
                    Issued: {item.issue_date} • Expires: {item.expiry_date || 'None'}
                  </p>

                  {item.credential_id && (
                    <p className="text-[11px] text-slate-400 font-mono">
                      Credential ID: <span className="text-slate-200">{item.credential_id}</span>
                    </p>
                  )}

                  {item.description && (
                    <p className="text-xs text-slate-300 max-w-xl">{item.description}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {item.credential_url && (
                  <a
                    href={safeHref(item.credential_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700"
                    title="View Credential Link"
                    aria-label="View Credential Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  </a>
                )}
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
        title={editingItem ? `Edit Certification: ${editingItem.name}` : 'Add New Certification'}
        subtitle="Record verified courses, issuing authorities, credential verification URLs, and certificate badges."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Certification Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Deep Learning Specialization / AWS Certified"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Issuing Organization *
            </label>
            <input
              type="text"
              required
              value={formData.issuing_organization}
              onChange={(e) => setFormData({ ...formData, issuing_organization: e.target.value })}
              placeholder="e.g. DeepLearning.AI / Coursera / Stanford Online"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Issue Date
              </label>
              <input
                type="text"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                placeholder="e.g. Nov 2025"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                placeholder="No Expiration"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Credential ID
              </label>
              <input
                type="text"
                value={formData.credential_id}
                onChange={(e) => setFormData({ ...formData, credential_id: e.target.value })}
                placeholder="e.g. DLAI-98471"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Verification URL
              </label>
              <input
                type="url"
                value={formData.credential_url}
                onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
                placeholder="https://coursera.org/verify/..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          <ImagePicker
            label="Certificate Image or PDF Badge"
            value={formData.certificate_file}
            onChange={(val) => setFormData({ ...formData, certificate_file: val })}
            placeholder="/images/... or upload PDF/image"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description / Key Skills Acquired
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Covered convolutional networks, transformer architectures, and optimization..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
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
              <span>{editingItem ? 'Save Changes' : 'Create Certification'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        title="Delete Certification"
        message="Are you sure you want to permanently delete this certification record?"
        confirmText="Delete"
        confirmColor="rose"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Fullscreen Certificate Lightbox Modal (Zero Cropping) */}
      {fullscreenImage && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setFullscreenImage(null);
          }}
          className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div className="relative max-w-[96vw] max-h-[94vh] flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 px-1 text-white">
              <div>
                <h3 className="text-sm font-bold text-slate-100 truncate">{fullscreenImage.title}</h3>
                <span className="text-xs font-mono text-emerald-400">@{fullscreenImage.issuer}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={safeHref(fullscreenImage.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5"
                  title="Open original file"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Open Original</span>
                </a>
                <button
                  type="button"
                  onClick={() => setFullscreenImage(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950 p-2 sm:p-4 overflow-hidden shadow-2xl flex items-center justify-center max-h-[84vh]">
              <img
                src={safeImageSrc(fullscreenImage.url)}
                alt={fullscreenImage.title}
                className="max-h-[80vh] max-w-[92vw] w-auto h-auto object-contain rounded-xl select-none"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
