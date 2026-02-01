'use client';

import { useState } from 'react';

interface ManualFormProps {
  onMusicGenerated: () => void;
}

export default function ManualForm({ onMusicGenerated }: ManualFormProps) {
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [tags, setTags] = useState('');
  const [negativeTags, setNegativeTags] = useState('');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [waitAudio, setWaitAudio] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!isInstrumental && !lyrics.trim()) {
      setError('Lyrics are required (or mark as instrumental)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/custom_generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          prompt: lyrics,
          tags,
          negative_tags: negativeTags,
          make_instrumental: isInstrumental,
          wait_audio: waitAudio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error generating music');
      }

      setSuccess(`Music created successfully! IDs: ${data.map((m: { id: string }) => m.id).join(', ')}`);
      onMusicGenerated();

      setTitle('');
      setLyrics('');
      setTags('');
      setNegativeTags('');
      setIsInstrumental(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error generating music';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Genre/Style quick picks
  const quickTags = [
    'Pop', 'Rock', 'Jazz', 'Electronic', 'Hip-Hop', 'Classical',
    'R&B', 'Country', 'Lo-fi', 'Ambient', 'Cinematic', 'Folk'
  ];

  return (
    <div className="flex flex-col h-full glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-pink-500/10 to-primary/20" />

        <div className="relative px-5 py-4 flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-xl blur-lg" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-white">Manual Creation</h2>
            <p className="text-xs text-slate-400">Full control over your music</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Title <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name your track"
            className="glass-input w-full"
            disabled={isLoading}
          />
        </div>

        {/* Tags with Quick Picks */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Style / Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="pop, 120 BPM, upbeat, female vocals..."
            className="glass-input w-full mb-2"
            disabled={isLoading}
          />
          <div className="flex flex-wrap gap-1.5">
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTags((prev) => prev ? `${prev}, ${tag.toLowerCase()}` : tag.toLowerCase())}
                className="px-2.5 py-1 text-xs text-slate-400 bg-surface-elevated rounded-full border border-white/5
                         hover:border-primary/30 hover:text-primary transition-all duration-200"
                disabled={isLoading}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Negative Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Negative Tags <span className="text-slate-500 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            value={negativeTags}
            onChange={(e) => setNegativeTags(e.target.value)}
            placeholder="no autotune, no heavy metal..."
            className="glass-input w-full"
            disabled={isLoading}
          />
          <p className="text-xs text-slate-500 mt-1.5">Styles you want to avoid</p>
        </div>

        {/* Instrumental Toggle */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated/50">
          <button
            type="button"
            onClick={() => setIsInstrumental(!isInstrumental)}
            className={`
              relative w-12 h-6 rounded-full transition-all duration-300
              ${isInstrumental ? 'bg-primary' : 'bg-surface-elevated'}
            `}
            disabled={isLoading}
          >
            <div
              className={`
                absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300
                ${isInstrumental ? 'left-7' : 'left-1'}
              `}
            />
          </button>
          <label className="text-sm text-slate-300 cursor-pointer" onClick={() => setIsInstrumental(!isInstrumental)}>
            Instrumental (no lyrics)
          </label>
        </div>

        {/* Lyrics */}
        {!isInstrumental && (
          <div className="animate-fade-in">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Lyrics <span className="text-primary">*</span>
            </label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder={`[Intro]
[Mood: Uplifting]

[Verse 1]
Your first verse here...
(6-12 syllables per line)

[Chorus]
[Energy: High]
Your chorus here...

[Outro]
[Fade Out]`}
              rows={8}
              className="glass-input w-full resize-none font-mono text-sm"
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Use meta-tags: [Verse], [Chorus], [Bridge], [Mood: X], [Energy: X]
            </p>
          </div>
        )}

        {/* Wait for audio toggle */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated/50">
          <button
            type="button"
            onClick={() => setWaitAudio(!waitAudio)}
            className={`
              relative w-12 h-6 rounded-full transition-all duration-300
              ${waitAudio ? 'bg-accent' : 'bg-surface-elevated'}
            `}
            disabled={isLoading}
          >
            <div
              className={`
                absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300
                ${waitAudio ? 'left-7' : 'left-1'}
              `}
            />
          </button>
          <label className="text-sm text-slate-300 cursor-pointer" onClick={() => setWaitAudio(!waitAudio)}>
            Wait for full generation
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3 animate-fade-in">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3 animate-fade-in">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary py-4 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <span>Generate Music</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
