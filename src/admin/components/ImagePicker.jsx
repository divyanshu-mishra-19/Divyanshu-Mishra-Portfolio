import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Upload, Image as ImageIcon, Check, X, FolderOpen, Maximize2, ExternalLink } from 'lucide-react';
import { adminApi } from '../adminApi.js';
import { safeHref, safeImageSrc } from '../../utils/safeHref.js';

export function ImagePicker({ label, value, onChange, placeholder = '/images/... or https://...' }) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isFullscreenPreviewOpen, setIsFullscreenPreviewOpen] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const loadMedia = async () => {
    try {
      const list = await adminApi.getMedia();
      setMediaList(list);
    } catch (err) {
      setUploadError(err.message || 'Failed to load media library');
    }
  };

  useEffect(() => {
    if (isLibraryOpen) {
      loadMedia();
    }
  }, [isLibraryOpen]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    try {
      const res = await adminApi.uploadFile(file, ['picker']);
      if (res?.url) {
        onChange(res.url);
      }
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</label>}

      <div className="flex items-center gap-2">
        {/* Preview thumbnail with ZERO cropping (object-contain) & full-screen button */}
        <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-700/80 overflow-hidden flex items-center justify-center shrink-0 relative group p-1">
          {value ? (
            <>
              <img
                loading="lazy"
                decoding="async"
                src={safeImageSrc(value)}
                alt="Preview"
                className="max-w-full max-h-full w-auto h-auto object-contain rounded select-none"
              />
              <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity">
                <button
                  type="button"
                  onClick={() => setIsFullscreenPreviewOpen(true)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 transition-colors"
                  title="View Full Screen (Uncropped)"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-1 rounded bg-rose-950/90 hover:bg-rose-900 text-rose-300 transition-colors"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <ImageIcon className="w-5 h-5 text-slate-500" />
          )}
        </div>

        {/* URL Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#080d18] border border-amber-500/25 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-mono text-xs"
          />
        </div>

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-3.5 py-2.5 bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/30 rounded-xl text-xs font-mono text-slate-200 flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-50 cursor-pointer"
          title="Upload image from computer"
        >
          {uploading ? (
            <span className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
          ) : (
            <Upload className="w-4 h-4 text-amber-400" />
          )}
          <span>Upload</span>
        </button>

        {/* Media Library Button */}
        <button
          type="button"
          onClick={() => setIsLibraryOpen(true)}
          className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          title="Browse media library"
        >
          <FolderOpen className="w-4 h-4 text-amber-400" />
          <span>Library</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {uploadError && <p className="text-xs text-rose-400 mt-1">{uploadError}</p>}

      {/* Full-Screen Lightbox for the Uploaded Image (Zero Cropping) */}
      {isFullscreenPreviewOpen && value && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFullscreenPreviewOpen(false);
          }}
          className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div className="relative max-w-[95vw] max-h-[92vh] flex flex-col items-center">
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 px-1 text-white">
              <span className="text-xs font-mono text-slate-400 truncate max-w-md">
                {value}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={safeHref(value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5"
                  title="Open original file"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Open Original</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsFullscreenPreviewOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Uncropped Full Image */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-2 overflow-hidden shadow-2xl flex items-center justify-center max-h-[82vh]">
              <img
                src={safeImageSrc(value)}
                alt="Full uncropped preview"
                className="max-h-[80vh] max-w-[92vw] w-auto h-auto object-contain rounded-xl select-none"
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Media Library Picker Modal with Uncropped Thumbnails */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-200 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white">Select from Media Library</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-4 overflow-y-auto flex-1 custom-scrollbar">
              {mediaList.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-400 text-sm">
                  No images in media library yet. Upload one above!
                </div>
              ) : (
                mediaList.map((m) => {
                  const isSelected = value === m.file_path;
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        onChange(m.file_path);
                        setIsLibraryOpen(false);
                      }}
                      className={`group relative rounded-xl border overflow-hidden aspect-video cursor-pointer transition-all bg-slate-950 flex items-center justify-center p-1 ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/50'
                          : 'border-white/10 hover:border-amber-500/40'
                      }`}
                    >
                      <img
                        loading="lazy"
                        decoding="async"
                        src={safeImageSrc(m.file_path)}
                        alt={m.filename}
                        className="max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-[#080d18]/70 opacity-0 group-hover:opacity-100 flex items-center justify-center p-2 text-center transition-opacity">
                        <span className="text-[10px] text-white font-medium truncate block max-w-full">
                          {m.original_name || m.filename}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-xl text-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
