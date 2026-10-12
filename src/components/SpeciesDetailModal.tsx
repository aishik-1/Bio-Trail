import React from 'react';
import { X, Volume2, ShieldAlert, Sparkles, Bookmark } from 'lucide-react';
import { SightingRecord, SpeciesProfile } from '../types/nature';
import { bioacousticEngine } from '../services/bioacousticEngine';
import { botanicalArtworks } from './BotanicalArtwork';

interface SpeciesDetailModalProps {
  species: SpeciesProfile | null;
  onClose: () => void;
  onSaveSighting: (sighting: SightingRecord) => void;
}

export const SpeciesDetailModal: React.FC<SpeciesDetailModalProps> = ({
  species,
  onClose,
  onSaveSighting,
}) => {
  if (!species) return null;

  const handleSynthesize = () => {
    bioacousticEngine.playSyntheticCall(species.id);
  };

  const handleLog = () => {
    const sighting: SightingRecord = {
      id: `sighting-${Date.now()}`,
      speciesId: species.id,
      speciesName: species.commonName,
      scientificName: species.scientificName,
      category: species.category,
      confidence: 95,
      timestamp: Date.now(),
      locationName: 'Trail Field Waypoint',
      lat: 35.856,
      lng: -82.338,
      notes: `Logged from species field dossier: ${species.fieldNotes.slice(0, 100)}...`,
      callPattern: species.acoustic?.patternType,
      verifiedOffline: true,
    };
    onSaveSighting(sighting);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="liquid-glass rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-400 font-mono mb-1">
              <span className="capitalize">{species.category}</span>
              <span aria-hidden="true">·</span>
              <span>{species.family}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">{species.conservationStatus}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {species.commonName}
            </h2>
            <p className="text-sm text-stone-400 font-serif italic">
              {species.scientificName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl bg-white/[0.06] hover:bg-white/[0.1] transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Botanical / Visual Artwork if flora/fungi */}
        {botanicalArtworks[species.id] && (
          <div className="rounded-2xl bg-[#090b0a] border border-white/[0.06] p-4 flex items-center justify-center max-h-52">
            {botanicalArtworks[species.id]}
          </div>
        )}

        {/* Hazard Alert if present */}
        {species.visual?.hazardNote && (
          <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-2xl text-rose-200 text-xs sm:text-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <span className="font-bold text-rose-300 block mb-0.5">
                Field Warning Note
              </span>
              <span>{species.visual.hazardNote}</span>
            </div>
          </div>
        )}

        {/* Bioacoustic Details (Birds & Amphibians) */}
        {species.acoustic && (
          <div className="p-5 rounded-2xl bg-[#0a0d0c] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-400">
                Acoustic Frequency Profile
              </span>
              <button
                onClick={handleSynthesize}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Play Synthetic Syrinx Call</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {species.callDescription}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-2.5 bg-[#121614] rounded-xl border border-white/[0.06]">
                <span className="text-stone-400 block text-[11px]">Dominant Pitch</span>
                <span className="font-mono font-bold text-emerald-400">
                  {species.acoustic.dominantFreqHz} Hz
                </span>
              </div>
              <div className="p-2.5 bg-[#121614] rounded-xl border border-white/[0.06]">
                <span className="text-stone-400 block text-[11px]">Bandwidth</span>
                <span className="font-mono font-bold text-white">
                  {species.acoustic.minFreqHz}–{species.acoustic.maxFreqHz} Hz
                </span>
              </div>
              <div className="p-2.5 bg-[#121614] rounded-xl border border-white/[0.06]">
                <span className="text-stone-400 block text-[11px]">Pattern Form</span>
                <span className="font-mono font-bold text-stone-200">
                  {species.acoustic.patternType}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Diagnostic Traits */}
        {species.visual?.distinguishingTraits && (
          <div>
            <h3 className="text-xs uppercase font-mono tracking-wider text-stone-400 mb-2">
              Key Diagnostic Traits
            </h3>
            <ul className="space-y-1.5">
              {species.visual.distinguishingTraits.map((trait, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-stone-300 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{trait}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ecology & Habitat */}
        <div className="space-y-2 text-xs sm:text-sm text-stone-300">
          <div>
            <strong className="text-stone-200">Natural Habitat: </strong>
            <span>{species.habitat}</span>
          </div>
          <div>
            <strong className="text-stone-200">Active Seasonality: </strong>
            <span>{species.seasonality}</span>
          </div>
          <div className="pt-2">
            <strong className="text-stone-200">Field Notes: </strong>
            <p className="mt-1 leading-relaxed text-stone-300">{species.fieldNotes}</p>
          </div>
        </div>

        {/* Ecological Fun Fact */}
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-xs sm:text-sm text-emerald-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ecological Observation</span>
          </div>
          <p className="leading-relaxed">{species.funFact}</p>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handleLog}
            className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Log to Field Journal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
