'use client';

import { Volume2 } from 'lucide-react';

interface MixerProps {
  crossfader: number; // 0-100, 50 = center
  onCrossfaderChange: (value: number) => void;
  volumeA: number;
  volumeB: number;
  onVolumeAChange: (value: number) => void;
  onVolumeBChange: (value: number) => void;
}

export default function Mixer({
  crossfader,
  onCrossfaderChange,
  volumeA,
  volumeB,
  onVolumeAChange,
  onVolumeBChange,
}: MixerProps) {
  return (
    <div className="glass-liquid rounded-3xl p-4 flex flex-col items-center gap-6">
      {/* MIXER label */}
      <span className="text-[10px] font-bold text-slate-500 tracking-widest">MIXER</span>

      {/* Volume A */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] text-cyan-400 font-medium">A</span>
        <div className="relative h-24 w-2 bg-white/10 rounded-full overflow-hidden">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volumeA}
            onChange={(e) => onVolumeAChange(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
          />
          <div
            className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full transition-all"
            style={{ height: `${volumeA * 100}%` }}
          />
        </div>
        <Volume2 className="w-3 h-3 text-cyan-400" />
      </div>

      {/* Crossfader */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] text-slate-500 font-medium">XFADE</span>
        <div className="relative w-2 h-32 bg-white/10 rounded-full">
          <input
            type="range"
            min="0"
            max="100"
            value={crossfader}
            onChange={(e) => onCrossfaderChange(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
          />
          {/* Crossfader handle */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-4 h-6 bg-white rounded-lg shadow-lg transition-all duration-100"
            style={{ top: `calc(${crossfader}% - 12px)` }}
          />
          {/* Center line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20" />
        </div>
        <div className="flex gap-2 text-[10px] text-slate-500">
          <span>A</span>
          <span>B</span>
        </div>
      </div>

      {/* Volume B */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] text-pink-400 font-medium">B</span>
        <div className="relative h-24 w-2 bg-white/10 rounded-full overflow-hidden">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volumeB}
            onChange={(e) => onVolumeBChange(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
          />
          <div
            className="absolute bottom-0 w-full bg-gradient-to-t from-pink-500 to-purple-500 rounded-full transition-all"
            style={{ height: `${volumeB * 100}%` }}
          />
        </div>
        <Volume2 className="w-3 h-3 text-pink-400" />
      </div>
    </div>
  );
}
