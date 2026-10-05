import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Filter,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  FileText,
  File,
  HardDrive,
  Calendar,
  Layers,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { adminApi } from '../adminApi.js';
import { ConfirmDialog } from '../components/FeedbackModals.jsx';
import { safeHref, safeImageSrc } from '../../utils/safeHref.js';

export function MediaLibraryView({ onToast }) {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [previewMedia, setPreviewMedia] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef(null);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getMedia();
      setMediaFiles(data || []);
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to load media' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (const file of files) {
      try {
        await adminApi.uploadFile(file, ['library']);
        successCount++;
      } catch (err) {
        onToast({ type: 'error', message: `Failed to upload ${file.name}: ${err.message}` });
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (successCount > 0) {
      onToast({ type: 'success', title: 'Upload Complete', message: `Uploaded ${successCount} file(s) to server` });
      loadMedia();
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      const res = await adminApi.deleteMedia(deleteConfirmId);
      if (res?.warning) {
        onToast({
          type: 'warning',
          title: 'Deleted with Warning',
          message: `${res.warning}: referenced in ${res.referencedIn?.join(', ')}`
        });
      } else {
        onToast({ type: 'success', message: 'Media file removed from disk and database' });
      }
      setDeleteConfirmId(null);
      if (previewMedia?.id === deleteConfirmId) setPreviewMedia(null);
      loadMedia();
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to delete file' });
    } finally {
      setDeleting(false);
    }
  };

  const copyUrl = (file) => {
    navigator.clipboard.writeText(file.file_path);
    setCopiedId(file.id);
    onToast({ type: 'info', message: `Copied URL: ${file.file_path}` });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filtered = mediaFiles.filter((m) => {
    const matchesSearch =
      m.filename?.toLowerCase().includes(search.toLowerCase()) ||
      m.original_name?.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'IMAGES' && m.mime_type?.startsWith('image/')) ||
      (typeFilter === 'DOCS' && !m.mime_type?.startsWith('image/'));
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <span>Media & File Library</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {mediaFiles.length} Files
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Centralized file store for project screenshots, certificates, PDFs, and event photos.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search files by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'IMAGES', 'DOCS'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                typeFilter === type
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs bg-slate-900 border border-slate-800 rounded-2xl">
            No media files match your criteria. Click "Upload Media" to add images or documents.
          </div>
        ) : (
          filtered.map((file) => {
            const isImage = file.mime_type?.startsWith('image/');
            const isCopied = copiedId === file.id;

            return (
              <div
                key={file.id}
                className="group relative bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => setPreviewMedia(file)}
                  className="aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer relative"
                >
                  {isImage ? (
                    <img
                      loading="lazy"
                      decoding="async"
                      src={safeImageSrc(file.file_path)}
                      alt={file.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-slate-500">
                      <FileText className="w-10 h-10 text-rose-400 mb-1" />
                      <span className="text-[10px] font-mono uppercase text-slate-400">PDF</span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyUrl(file);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      title="Copy URL"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(file.id);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2.5 space-y-1">
                  <div className="text-[11px] font-medium text-slate-200 truncate" title={file.original_name || file.filename}>
                    {file.original_name || file.filename}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{formatSize(file.file_size)}</span>
                    <span>{file.upload_date}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Preview Modal */}
      {previewMedia && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPreviewMedia(null);
              setIsFullscreen(false);
            }
          }}
          className="admin-modal-overlay fixed inset-0 z-[9990] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md"
        >
          <div className={`admin-modal-card w-full ${isFullscreen ? 'max-w-[98vw] h-[96vh]' : 'max-w-3xl max-h-[92vh]'} bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-200 flex flex-col transition-all duration-300`}>
            <div className="admin-modal-header flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="truncate mr-4">
                <h3 className="font-bold text-white text-sm truncate">{previewMedia.original_name || previewMedia.filename}</h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatSize(previewMedia.file_size)} • {previewMedia.mime_type}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {previewMedia.mime_type?.startsWith('image/') && (
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                    title={isFullscreen ? 'Exit Full Screen' : 'Toggle Full Screen (Zero Cropping)'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setPreviewMedia(null);
                    setIsFullscreen(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className={`flex-1 flex items-center justify-center bg-slate-950 rounded-2xl overflow-hidden p-2 sm:p-4 my-3 border border-white/5 ${isFullscreen ? 'max-h-[78vh]' : 'min-h-[280px] max-h-[62vh]'}`}>
              {previewMedia.mime_type?.startsWith('image/') ? (
                <img
                  loading="lazy"
                  decoding="async"
                  src={safeImageSrc(previewMedia.file_path)}
                  alt={previewMedia.filename}
                  className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl select-none"
                />
              ) : (
                <div className="py-12 text-center space-y-2">
                  <FileText className="w-16 h-16 text-rose-400 mx-auto" />
                  <p className="text-xs text-slate-300">Document File ({previewMedia.mime_type})</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <span className="font-mono text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 truncate max-w-sm">
                {previewMedia.file_path}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyUrl(previewMedia)}
                  className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy URL</span>
                </button>
                <a
                  href={safeHref(previewMedia.file_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center justify-center"
                  title="Open Original"
                  aria-label="Open Original"
                >
                  <ExternalLink className="w-4 h-4 text-sky-400" />
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        title="Delete Media File"
        message="Are you sure you want to permanently delete this media file? Any project or post linking to this image will no longer be able to display it."
        confirmText="Delete File"
        confirmColor="rose"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
