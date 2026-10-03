import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  ExternalLink,
  Code2,
  FileText,
  Clock,
  Calendar,
  Layers
} from 'lucide-react';
import { adminApi } from '../adminApi.js';
import { Modal, ConfirmDialog } from '../components/FeedbackModals.jsx';
import { ImagePicker } from '../components/ImagePicker.jsx';
import { safeImageSrc } from '../../utils/safeHref.js';

export function BlogView({ onToast }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewTab, setPreviewTab] = useState('write'); // 'write' or 'preview'

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const defaultForm = {
    id: '',
    file: '',
    title: '',
    category: 'COMPUTER VISION',
    read_time: '5 min read',
    author: 'Divyanshu Mishra',
    date: 'Feb 2026',
    description: '',
    content: `# Title Here\n\nWrite your technical article here in Markdown...\n\n## Section 1: Overview\n\nAdd details, code blocks, and diagrams.`,
    image: '/images/workspace.webp',
    url: '',
    status: 'published',
    featured: 0
  };
  const [formData, setFormData] = useState(defaultForm);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getList('blog_posts');
      setPosts(data || []);
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to load blog posts' });
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
      id: `post_${Date.now()}`
    });
    setPreviewTab('write');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setPreviewTab('write');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      onToast({ type: 'error', message: 'Article title is required' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        id: formData.id || formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        file: formData.file || `${formData.id}.md`
      };

      if (editingItem) {
        await adminApi.updateItem('blog_posts', editingItem.id, payload);
        onToast({ type: 'success', title: 'Article Updated', message: `Saved "${payload.title}"` });
      } else {
        await adminApi.createItem('blog_posts', payload);
        onToast({ type: 'success', title: 'Article Created', message: `Published "${payload.title}"` });
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to save blog post' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await adminApi.deleteItem('blog_posts', deleteConfirmId);
      onToast({ type: 'success', message: 'Article deleted' });
      setDeleteConfirmId(null);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to delete' });
    } finally {
      setDeleting(false);
    }
  };

  const togglePublish = async (post) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await adminApi.updateItem('blog_posts', post.id, { ...post, status: nextStatus });
      loadData();
      onToast({ type: 'info', message: `Article status set to ${nextStatus}` });
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>Blog & Technical Articles CMS</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {posts.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, draft, and publish technical deep-dives shown on the interactive 3D magazine flipbook.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="w-full sm:w-auto justify-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No articles found. Click "Write New Article" to draft your first post.
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                  {post.image ? (
                    <img loading="lazy" decoding="async" src={safeImageSrc(post.image)} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-emerald-400">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                      {post.title}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {post.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePublish(post)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium transition-colors ${
                        post.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {post.status === 'published' ? 'Published' : 'Draft'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono">
                    {post.date} • {post.read_time} • By {post.author}
                  </p>

                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    {post.description}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => openEditModal(post)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Edit className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Post</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(post.id)}
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

      {/* Editor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Post: ${editingItem.title}` : 'Write New Technical Post'}
        subtitle="Rich Markdown editor for technical write-ups, architecture breakdowns, and benchmarks."
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Post Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Building Real-Time ANPR with YOLOv8"
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
                onChange={(e) => setFormData({ ...formData, category: e.target.value.toUpperCase() })}
                placeholder="e.g. COMPUTER VISION, AGENTIC AI, LEADERSHIP"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Read Time
              </label>
              <input
                type="text"
                value={formData.read_time}
                onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                placeholder="5 min read"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Publication Date
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="Feb 2026"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          <ImagePicker
            label="Featured Cover Image"
            value={formData.image}
            onChange={(val) => setFormData({ ...formData, image: val })}
            placeholder="/images/workspace.webp"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Short Description / Excerpt
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="High-level takeaway and key engineering metrics achieved..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Markdown Content Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Full Article Content (Markdown)
              </label>
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewTab('write')}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                    previewTab === 'write' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('preview')}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                    previewTab === 'preview' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            {previewTab === 'write' ? (
              <textarea
                rows={10}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="# Article Title&#10;&#10;Use standard Markdown headings, lists, quotes, and code blocks..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-100 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            ) : (
              <div className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 min-h-[220px] max-h-[350px] overflow-y-auto text-xs text-slate-200 space-y-3 prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap font-sans leading-relaxed">
                  {formData.content}
                </div>
              </div>
            )}
          </div>

          {/* Status Selection */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="radio"
                name="status"
                value="published"
                checked={formData.status === 'published'}
                onChange={() => setFormData({ ...formData, status: 'published' })}
                className="text-amber-500"
              />
              <span>Published (Visible on Portfolio)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={formData.status === 'draft'}
                onChange={() => setFormData({ ...formData, status: 'draft' })}
                className="text-amber-500"
              />
              <span>Save as Draft</span>
            </label>
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
              <span>{editingItem ? 'Save Article' : 'Publish Article'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        title="Delete Blog Post"
        message="Are you sure you want to permanently delete this article?"
        confirmText="Delete Post"
        confirmColor="rose"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
