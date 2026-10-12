import React, { useState, useRef } from 'react';
import { Upload, AlertTriangle, ShieldCheck, Bookmark, Check, Sparkles, Leaf } from 'lucide-react';
import { botanicalArtworks } from './BotanicalArtwork';
import { botanyVisionEngine } from '../services/botanyVisionEngine';
import { BotanicalMatchResult, SightingRecord, SpeciesProfile } from '../types/nature';
import { SPECIES_CATALOG } from '../data/speciesData';

interface BotanicalVisionTabProps {
  onSelectSpecies: (species: SpeciesProfile) => void;
  onSaveSighting: (sighting: SightingRecord) => void;
}

export const BotanicalVisionTab: React.FC<BotanicalVisionTabProps> = ({
  onSelectSpecies,
  onSaveSighting,
}) => {
  const [matchResult, setMatchResult] = useState<BotanicalMatchResult | null>(() =>
    botanyVisionEngine.getSampleMatch('sugar-maple')
  );
  const [isLogged, setIsLogged] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState('sugar-maple');
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const floraSamples = SPECIES_CATALOG.filter(
    (s) => s.category === 'flora' || s.category === 'fungi'
  );

  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setCustomImageSrc(null);
    setIsLogged(false);
    const result = botanyVisionEngine.getSampleMatch(sampleId);
    setMatchResult(result);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setCustomImageSrc(src);
      setIsLogged(false);

      const img = new Image();
      img.onload = async () => {
        const result = await botanyVisionEngine.classifyPlantImage(img);
        setMatchResult(result);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleLogSighting = () => {
    if (!matchResult) return;
    const sighting: SightingRecord = {
      id: `sighting-${Date.now()}`,
      speciesId: matchResult.species.id,
      speciesName: matchResult.species.commonName,
      scientificName: matchResult.species.scientificName,
      category: matchResult.species.category,
      confidence: matchResult.confidence,
      timestamp: Date.now(),
      locationName: 'Foliage Waypoint (Trail Marker)',
      lat: 35.861,
      lng: -82.335,
      notes: `Offline botanical identification: ${matchResult.foliageStage}. Traits: ${matchResult.matchedTraits.join('; ')}`,
      verifiedOffline: true,
    };
    onSaveSighting(sighting);
    setIsLogged(true);
  };

  return (
    <div className="space-y-6">
      {/* Herbarium Hero Banner */}
      <div className="relative rounded-3xl liquid-glass p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
            <span>Offline Botanical Vision</span>
            <span aria-hidden="true">·</span>
            <span>Local Pixel Feature Extraction</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Zero Cloud Uploads</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Foliage & Forage Scout
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Analyze leaf venation, autumn anthocyanin transitions, and mushroom gills directly on-device.
            Instantly flags toxic look-alikes like Poison Ivy without broadcasting your foraging coordinates.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full bg-emerald-400 hover:bg-emerald-300 text-stone-950 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-md"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Trail Photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <span className="text-xs text-stone-400">
              Or pick an authentic botanical specimen below
            </span>
          </div>
        </div>
      </div>

      {/* Preset Specimen Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {floraSamples.map((sp) => (
          <button
            key={sp.id}
            onClick={() => handleSelectSample(sp.id)}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              selectedSampleId === sp.id && !customImageSrc
                ? 'bg-stone-100 text-stone-950 font-bold shadow-md'
                : 'liquid-glass-subtle text-stone-300 hover:bg-white/[0.09]'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>{sp.commonName}</span>
          </button>
        ))}
      </div>

      {/* Specimen Inspection Grid */}
      {matchResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Specimen Visual Plate */}
          <div className="lg:col-span-5 liquid-glass-subtle rounded-3xl p-6 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-stone-400 uppercase tracking-wider font-mono">
                  Herbarium Plate
                </span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                  {matchResult.confidence}% Confidence
                </span>
              </div>

              <div className="rounded-2xl overflow-hidden bg-[#090b0a] border border-white/[0.06] aspect-4/3 flex items-center justify-center relative p-4">
                {customImageSrc ? (
                  <img
                    src={customImageSrc}
                    alt={matchResult.species.commonName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    {botanicalArtworks[matchResult.species.id] || (
                      <Leaf className="w-20 h-20 text-emerald-500/70" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.06] text-xs text-stone-400 flex items-center justify-between">
              <span>Family: {matchResult.species.family}</span>
              <span className="font-mono text-stone-300">{matchResult.species.category.toUpperCase()}</span>
            </div>
          </div>

          {/* Botanical Dossier Details */}
          <div className="lg:col-span-7 liquid-glass-subtle rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Trait Profile Verified</span>
                  <span aria-hidden="true">·</span>
                  <span>{matchResult.foliageStage}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {matchResult.species.commonName}
                </h2>
                <p className="text-sm text-stone-400 font-serif italic">
                  {matchResult.species.scientificName}
                </p>
              </div>

              {/* Toxicity / Edibility Callout */}
              {matchResult.species.visual?.edibility === 'Toxic Hazard' ? (
                <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-2xl text-rose-200 text-xs sm:text-sm flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-300 block mb-0.5">
                      Urushiol Dermatitis Contact Hazard
                    </span>
                    <span>{matchResult.species.visual.hazardNote}</span>
                  </div>
                </div>
              ) : matchResult.species.visual?.edibility === 'Choice Edible' ? (
                <div className="p-4 bg-emerald-950/30 border border-emerald-800/50 rounded-2xl text-emerald-200 text-xs sm:text-sm flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-300 block mb-0.5">
                      Foraging Status: Choice Edible
                    </span>
                    <span>
                      {matchResult.species.visual.hazardNote ||
                        'Verified wild culinary species. Remember 100% confirmation rule before harvesting.'}
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Matched Anatomical Traits */}
              <div>
                <h3 className="text-xs uppercase font-mono tracking-wider text-stone-400 mb-2">
                  Morphological Signatures
                </h3>
                <ul className="space-y-1.5">
                  {matchResult.matchedTraits.map((trait, idx) => (
                    <li
                      key={idx}
                      className="text-xs sm:text-sm text-stone-300 flex items-start gap-2"
                    >
                      <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                      <span>{trait}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {matchResult.species.fieldNotes}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/[0.06]">
              <button
                onClick={() => onSelectSpecies(matchResult.species)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-stone-200 border border-white/[0.08] transition-colors cursor-pointer active:scale-95"
              >
                Taxonomy Dossier
              </button>

              <button
                onClick={handleLogSighting}
                disabled={isLogged}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  isLogged
                    ? 'bg-stone-800 text-emerald-400 border border-emerald-900/60'
                    : 'bg-emerald-400 text-stone-950 font-bold hover:bg-emerald-300 shadow-sm'
                }`}
              >
                {isLogged ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Logged to Journal</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Log Specimen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
