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
      setError('Titulo e obrigatorio');
      return;
    }

    if (!isInstrumental && !lyrics.trim()) {
      setError('Letras sao obrigatorias (ou marque como instrumental)');
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
        throw new Error(data.error || 'Erro ao gerar musica');
      }

      setSuccess(`Musica(s) criada(s) com sucesso! IDs: ${data.map((m: any) => m.id).join(', ')}`);
      onMusicGenerated();

      // Clear form
      setTitle('');
      setLyrics('');
      setTags('');
      setNegativeTags('');
      setIsInstrumental(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar musica');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600">
        <h2 className="text-xl font-bold text-white">Gerar Musica Manualmente</h2>
        <p className="text-purple-100 text-sm">Preencha os campos abaixo</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titulo *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nome da musica"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estilo / Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="pop, rock, electronic, acoustic..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">Separe os estilos por virgula</p>
        </div>

        {/* Negative Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags Negativas (opcional)
          </label>
          <input
            type="text"
            value={negativeTags}
            onChange={(e) => setNegativeTags(e.target.value)}
            placeholder="autotune, heavy metal..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">Estilos que voce NAO quer</p>
        </div>

        {/* Instrumental Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="instrumental"
            checked={isInstrumental}
            onChange={(e) => setIsInstrumental(e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            disabled={isLoading}
          />
          <label htmlFor="instrumental" className="text-sm text-gray-700">
            Instrumental (sem letra)
          </label>
        </div>

        {/* Lyrics */}
        {!isInstrumental && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Letra da Musica *
            </label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder={`[Verse 1]
Primeira estrofe aqui...

[Chorus]
Refrao aqui...

[Verse 2]
Segunda estrofe...`}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use [Verse], [Chorus], [Bridge], [Outro] para estruturar
            </p>
          </div>
        )}

        {/* Wait for audio checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="waitAudio"
            checked={waitAudio}
            onChange={(e) => setWaitAudio(e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            disabled={isLoading}
          />
          <label htmlFor="waitAudio" className="text-sm text-gray-700">
            Aguardar geracao completa (pode demorar)
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Gerando...
            </span>
          ) : (
            'Gerar Musica'
          )}
        </button>
      </form>
    </div>
  );
}
