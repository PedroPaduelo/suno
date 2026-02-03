'use client';

import { useState, useEffect } from 'react';
import { X, Youtube, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface AddMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Helper to extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function AddMusicModal({ isOpen, onClose, onSuccess }: AddMusicModalProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setYoutubeUrl('');
      setTitle('');
      setTags('');
      setError(null);
      setPreviewId(null);
    }
  }, [isOpen]);

  // Extract YouTube ID when URL changes
  useEffect(() => {
    const id = extractYouTubeId(youtubeUrl);
    setPreviewId(id);
    setError(null);
  }, [youtubeUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!previewId) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl,
          title: title.trim(),
          tags: tags.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add music');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add music');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Youtube className="w-4 h-4 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Add YouTube Music</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* YouTube URL Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              YouTube URL
            </label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Preview */}
          {previewId && (
            <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
              <div className="relative aspect-video">
                <Image
                  src={`https://img.youtube.com/vi/${previewId}/hqdefault.jpg`}
                  alt="Video thumbnail"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center">
                    <Youtube className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter music title"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tags <span className="text-slate-500">(optional)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="pop, rock, indie..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !previewId || !title.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Youtube className="w-4 h-4" />
                  Add to Library
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
