import React, { useEffect, useState } from 'react';
import { Eye, Bell, Sun, Sparkles, X } from 'lucide-react';
import { AcousticMatchResult, SightingRecord, SpeciesProfile } from '../types/nature';
import { storageService } from '../services/storageService';
import { bioacousticEngine } from '../services/bioacousticEngine';

interface PocketPatrolModeProps {
  onExit: () => void;
  latestMatch: AcousticMatchResult | null;
  onSelectSpecies: (species: SpeciesProfile) => void;
  onSaveSighting: (sighting: SightingRecord) => void;
}

export const PocketPatrolMode: React.FC<PocketPatrolModeProps> = ({
  onExit,
  latestMatch,
  onSelectSpecies,
  onSaveSighting,
}) => {
  const [screenSavedMinutes, setScreenSavedMinutes] = useState(() =>
    storageService.getScreenTimeSavedMinutes()
  );
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionMatches, setSessionMatches] = useState<AcousticMatchResult[]>([]);
  const [isSunlightMode, setIsSunlightMode] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  // Track session duration & increment screen-off minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => {
        const next = prev + 1;
        if (next % 60 === 0) {
          storageService.addScreenTimeSavedMinutes(1);
          setScreenSavedMinutes((m) => m + 1);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // When a new match occurs in pocket mode, add to session matches and trigger haptic/audio chime
  useEffect(() => {
    if (latestMatch) {
      setSessionMatches((prev) => {
        if (prev.some((m) => m.species.id === latestMatch.species.id && Date.now() - m.timestamp < 10000)) {
          return prev;
        }
        return [latestMatch, ...prev];
      });

      if (hapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([120, 60, 120]);
        } catch {
          // ignore
        }
      }
    }
  }, [latestMatch, hapticEnabled]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSimulatePocketPing = () => {
    bioacousticEngine.playSyntheticCall('wood-thrush');
  };

  return (
    <div
      className={`min-h-[85vh] rounded-3xl p-6 sm:p-10 transition-colors flex flex-col justify-between ${
        isSunlightMode
          ? 'bg-[#fef9ee] text-stone-950 border-2 border-stone-900 sunlight-mode'
          : 'bg-[#080a09] text-stone-200 border border-white/[0.08]'
      }`}
    >
      {/* Top Bar inside Pocket Patrol */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className={`p-2 rounded-xl transition-colors cursor-pointer active:scale-95 ${
              isSunlightMode ? 'bg-stone-200 hover:bg-stone-300 text-stone-950' : 'bg-white/[0.06] hover:bg-white/[0.1] text-stone-300'
            }`}
            title="Exit Pocket Mode"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 block">
              Pocket Patrol Active
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-tight">Focus on the trail, not your screen</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSunlightMode(!isSunlightMode)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 ${
              isSunlightMode
                ? 'bg-stone-900 text-amber-100'
                : 'bg-white/[0.06] text-stone-300 hover:text-white border border-white/[0.08]'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSunlightMode ? 'Dark OLED' : 'Sunlight Mode'}</span>
          </button>

          <button
            onClick={() => setHapticEnabled(!hapticEnabled)}
            className={`p-2 rounded-xl text-xs transition-colors cursor-pointer active:scale-95 ${
              hapticEnabled
                ? 'text-emerald-400 bg-white/[0.06] border border-white/[0.08]'
                : 'text-stone-600 bg-white/[0.02]'
            }`}
            title="Toggle Haptic Notification"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Focus: Big Outdoor Timer */}
      <div className="my-auto py-8 text-center space-y-6 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs font-mono">
          <Eye className="w-3.5 h-3.5" />
          <span>Screen Minimizer Active · Microphone Processing Local FFT</span>
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase font-mono tracking-widest text-stone-400">
            Active Trail Time
          </span>
          <div className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-white tabular-nums">
            {formatTime(sessionSeconds)}
          </div>
        </div>

        {/* Counter of Screen Time Saved */}
        <div className={`p-5 rounded-2xl border ${isSunlightMode ? 'bg-amber-100/90 border-stone-900' : 'bg-white/[0.03] border-white/[0.08]'}`}>
          <div className="flex items-center justify-center gap-6 text-left">
            <div>
              <span className="text-[11px] text-stone-400 block font-mono">Screen Time Saved</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {screenSavedMinutes} min
              </span>
            </div>
            <div className="h-8 w-px bg-white/[0.1]" />
            <div>
              <span className="text-[11px] text-stone-400 block font-mono">Pocket Detections</span>
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {sessionMatches.length} calls
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-md mx-auto">
          Slip your phone into your chest pocket. If a thrush, owl, or chickadee vocalizes along your route,
          your device will gently pulse so you can look up into the canopy.
        </p>

        {/* Indoor Simulation Trigger */}
        <div className="pt-2">
          <button
            onClick={handleSimulatePocketPing}
            className="text-xs text-stone-400 hover:text-stone-200 underline underline-offset-4 cursor-pointer"
          >
            Indoor Test: Simulate pocket bird detection pulse
          </button>
        </div>
      </div>

      {/* Detected Sightings During Pocket Session */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
          <span>Heard Along The Trail</span>
          <span>{sessionMatches.length} species</span>
        </div>

        {sessionMatches.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-white/[0.08] text-center text-xs text-stone-500">
            Listening for wild calls along your route...
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sessionMatches.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isSunlightMode
                    ? 'bg-white border-stone-900 text-stone-900'
                    : 'bg-[#121614] border-white/[0.08] text-stone-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-sm font-bold block">{m.species.commonName}</span>
                    <span className="text-xs text-stone-400 font-serif italic">
                      {m.species.scientificName} · {m.dominantFreq} Hz
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelectSpecies(m.species);
                      onExit();
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg bg-white/[0.06] text-stone-200 hover:bg-white/[0.1] transition-colors cursor-pointer active:scale-95"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      onSaveSighting({
                        id: `sighting-${Date.now()}`,
                        speciesId: m.species.id,
                        speciesName: m.species.commonName,
                        scientificName: m.species.scientificName,
                        category: m.species.category,
                        confidence: m.confidence,
                        timestamp: m.timestamp,
                        locationName: 'Pocket Patrol Trail Run',
                        lat: 35.856,
                        lng: -82.338,
                        notes: 'Pocket detection verified offline.',
                        verifiedOffline: true,
                      });
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg bg-emerald-400 text-stone-950 font-bold hover:bg-emerald-300 transition-colors cursor-pointer active:scale-95"
                  >
                    Log
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 flex justify-center">
          <button
            onClick={onExit}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-stone-200 text-xs font-semibold transition-colors cursor-pointer active:scale-95"
          >
            Return to Full App
          </button>
        </div>
      </div>
    </div>
  );
};
