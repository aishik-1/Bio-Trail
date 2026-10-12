import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Bookmark, Check, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import { bioacousticEngine } from '../services/bioacousticEngine';
import { AcousticMatchResult, SightingRecord, SpeciesProfile } from '../types/nature';
import { SPECIES_CATALOG } from '../data/speciesData';
import { SpectrogramCanvas } from './SpectrogramCanvas';

interface AudioListeningTabProps {
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  freqData: Uint8Array | null;
  timeData: Uint8Array | null;
  peakFreq: number;
  latestMatch: AcousticMatchResult | null;
  onSelectSpecies: (species: SpeciesProfile) => void;
  onSaveSighting: (sighting: SightingRecord) => void;
}

export const AudioListeningTab: React.FC<AudioListeningTabProps> = ({
  isListening,
  setIsListening,
  freqData,
  timeData,
  peakFreq,
  latestMatch,
  onSelectSpecies,
  onSaveSighting,
}) => {
  const [loggedIds, setLoggedIds] = useState<Set<string>>(new Set());
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const avianSpecies = SPECIES_CATALOG.filter(
    (s) => (s.category === 'bird' || s.category === 'amphibian') && s.acoustic
  );

  const handleToggleMic = async () => {
    setMicError(null);
    if (isListening) {
      bioacousticEngine.stop();
      setIsListening(false);
    } else {
      const ok = await bioacousticEngine.startMicrophone();
      if (ok) {
        setIsListening(true);
      } else {
        setMicError('Microphone access is needed for live trail acoustic listening. You can also test calls with the synthesizer buttons below.');
      }
    }
  };

  const handlePlaySynthesizedCall = (speciesId: string) => {
    setActiveTestId(speciesId);
    bioacousticEngine.playSyntheticCall(speciesId);
    setTimeout(() => {
      setActiveTestId(null);
    }, 1200);
  };

  const handleLogMatch = (match: AcousticMatchResult) => {
    const sighting: SightingRecord = {
      id: `sighting-${Date.now()}`,
      speciesId: match.species.id,
      speciesName: match.species.commonName,
      scientificName: match.species.scientificName,
      category: match.species.category,
      confidence: match.confidence,
      timestamp: Date.now(),
      locationName: 'Active Field Session (Trail Coordinates)',
      lat: 35.856,
      lng: -82.338,
      notes: `Identified on-device via acoustic frequency ${match.dominantFreq} Hz. Call pattern: ${match.detectedPattern}.`,
      callPattern: match.detectedPattern,
      verifiedOffline: true,
    };

    onSaveSighting(sighting);
    setLoggedIds((prev) => new Set([...prev, match.species.id]));
  };

  return (
    <div className="space-y-6">
      {/* Editorial Field Instrument Hero */}
      <div className="relative rounded-3xl liquid-glass p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
            <span>Bioacoustic Field Sensor</span>
            <span aria-hidden="true">·</span>
            <span>Local FFT Decomposition</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Offline Backcountry Ready</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Listen on the Trail
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Real-time avian and amphibian bioacoustic identification running completely inside your browser.
            Stream live audio or test calibrated syrinx harmonics with zero network packets sent.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleToggleMic}
              className={`px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-95 shadow-md ${
                isListening
                  ? 'bg-rose-500 hover:bg-rose-400 text-white'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Pause Trail Microphone</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Start Microphone Stream</span>
                </>
              )}
            </button>

            <button
              onClick={() => handlePlaySynthesizedCall('wood-thrush')}
              className="px-4 py-2.5 text-xs sm:text-sm font-medium rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-stone-200 border border-white/[0.08] transition-colors flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Test Wood Thrush Call</span>
            </button>
          </div>

          {micError && (
            <div className="mt-3 p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{micError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Spectrogram Canvas with 60Hz Retina support */}
      <SpectrogramCanvas
        freqData={freqData}
        timeData={timeData}
        peakFreq={peakFreq}
        isListening={isListening}
      />

      {/* Latest Match Banner (Clean Naturalist Plate) */}
      {latestMatch && (
        <div className="relative rounded-2xl liquid-glass p-5 sm:p-6 shadow-xl transition-all border border-emerald-500/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bioacoustic Sighting Verified</span>
                <span aria-hidden="true">·</span>
                <span>{latestMatch.confidence}% Confidence</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {latestMatch.species.commonName}
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-serif italic">
                {latestMatch.species.scientificName} — {latestMatch.species.family}
              </p>
              <p className="text-xs sm:text-sm text-stone-300 pt-1 max-w-xl">
                {latestMatch.species.callDescription}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => onSelectSpecies(latestMatch.species)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-stone-200 border border-white/[0.08] transition-colors cursor-pointer active:scale-95"
              >
                Dossier
              </button>

              <button
                onClick={() => handleLogMatch(latestMatch)}
                disabled={loggedIds.has(latestMatch.species.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  loggedIds.has(latestMatch.species.id)
                    ? 'bg-stone-800 text-emerald-400 border border-emerald-900/60'
                    : 'bg-emerald-400 text-stone-950 font-bold hover:bg-emerald-300 shadow-sm'
                }`}
              >
                {loggedIds.has(latestMatch.species.id) ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Logged</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Log Sighting</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Call Synthesizer Deck */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Calibrated Species Library</h2>
            <p className="text-xs text-stone-400">
              Direct biological audio synthesis through Web Audio oscillators for testing recognition patterns.
            </p>
          </div>
          <span className="text-xs text-stone-400 font-mono">
            {avianSpecies.length} species calibrated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {avianSpecies.map((sp) => {
            const isPlaying = activeTestId === sp.id;
            return (
              <div
                key={sp.id}
                className="group relative liquid-glass-subtle hover:border-white/[0.18] rounded-2xl p-5 transition-all duration-150 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                        {sp.commonName}
                      </h3>
                      <p className="text-xs text-stone-400 font-serif italic">{sp.scientificName}</p>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                      {sp.acoustic?.dominantFreqHz} Hz
                    </span>
                  </div>

                  <p className="text-xs text-stone-300 line-clamp-2 mb-3 leading-relaxed">
                    {sp.callDescription}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-stone-400 mb-4 font-mono">
                    <span>{sp.acoustic?.patternType}</span>
                    <span aria-hidden="true">·</span>
                    <span>{sp.acoustic?.harmonicBands} harmonics</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                  <button
                    onClick={() => handlePlaySynthesizedCall(sp.id)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 ${
                      isPlaying
                        ? 'bg-emerald-400 text-stone-950 font-bold'
                        : 'bg-white/[0.06] text-stone-200 hover:bg-white/[0.1] border border-white/[0.08]'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isPlaying ? 'Synthesizing...' : 'Synthesize'}</span>
                  </button>

                  <button
                    onClick={() => onSelectSpecies(sp)}
                    className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="View taxonomy dossier"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
