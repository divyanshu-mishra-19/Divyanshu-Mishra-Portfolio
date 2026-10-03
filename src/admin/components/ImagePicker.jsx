import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, Check, X, FolderOpen } from 'lucide-react';
import { adminApi } from '../adminApi.js';
import { safeImageSrc } from '../../utils/safeHref.js';

export function ImagePicker({ label, value, onChange, placeholder = '/images/... or https://...' }) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
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
        {/* Preview thumbnail */}
        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 overflow-hidden flex items-center justify-center shrink-0 relative group">
          {value ? (
            <>
              <img loading="lazy" decoding="async" src={safeImageSrc(value)} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
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
          className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors shrink-0"
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

      {/* Media Library Picker Modal */}
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
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
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
                      className={`group relative rounded-xl border overflow-hidden aspect-video cursor-pointer transition-all ${
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
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-xl text-slate-200 transition-colors"
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
