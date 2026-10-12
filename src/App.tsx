import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { AudioListeningTab } from './components/AudioListeningTab';
import { BotanicalVisionTab } from './components/BotanicalVisionTab';
import { TrailMapTab } from './components/TrailMapTab';
import { FieldJournalTab } from './components/FieldJournalTab';
import { PocketPatrolMode } from './components/PocketPatrolMode';
import { OpenAiInspectorModal } from './components/OpenAiInspectorModal';
import { SpeciesDetailModal } from './components/SpeciesDetailModal';
import { FallingGrassBackground } from './components/FallingGrassBackground';
import { GrassClickEffect } from './components/GrassClickEffect';
import { bioacousticEngine } from './services/bioacousticEngine';
import { storageService } from './services/storageService';
import { AcousticMatchResult, SightingRecord, SpeciesProfile } from './types/nature';

export default function App() {
  const [activeTab, setActiveTab] = useState<'listen' | 'vision' | 'trails' | 'journal'>('listen');
  const [isPocketMode, setIsPocketMode] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Real-time audio spectral state
  const [freqData, setFreqData] = useState<Uint8Array | null>(null);
  const [timeData, setTimeData] = useState<Uint8Array | null>(null);
  const [peakFreq, setPeakFreq] = useState<number>(0);

  // Match states
  const [latestMatch, setLatestMatch] = useState<AcousticMatchResult | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesProfile | null>(null);
  const [showModelInspector, setShowModelInspector] = useState<boolean>(false);

  // Sightings state
  const [sightings, setSightings] = useState<SightingRecord[]>(() =>
    storageService.getSightings()
  );

  // Wire up audio engine callbacks
  useEffect(() => {
    bioacousticEngine.setOnMatch((match) => {
      setLatestMatch(match);
    });

    bioacousticEngine.setOnFrequencyData((freq, time, peak) => {
      setFreqData(freq);
      setTimeData(time);
      setPeakFreq(peak);
    });

    return () => {
      bioacousticEngine.stop();
    };
  }, []);

  const handleSaveSighting = (newSighting: SightingRecord) => {
    const updated = storageService.saveSighting(newSighting);
    setSightings(updated);
  };

  const handleDeleteSighting = (id: string) => {
    const updated = storageService.deleteSighting(id);
    setSightings(updated);
  };

  return (
    <div className="relative min-h-screen bg-[#090c0a] text-stone-100 flex flex-col selection:bg-emerald-500 selection:text-stone-950 overflow-x-hidden">
      {/* Nature Theme: Falling Grass and Foliage Particles */}
      <FallingGrassBackground />

      {/* Nature Theme: Interactive Click Grass Wave & Sprout Ripple Effect */}
      <GrassClickEffect />

      {/* Top Bar Header strictly adheres to Top Bar Contract with Liquid Glass */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenModelInspector={() => setShowModelInspector(true)}
        isPocketMode={isPocketMode}
        setIsPocketMode={setIsPocketMode}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {isPocketMode ? (
          <PocketPatrolMode
            onExit={() => setIsPocketMode(false)}
            latestMatch={latestMatch}
            onSelectSpecies={(sp) => setSelectedSpecies(sp)}
            onSaveSighting={handleSaveSighting}
          />
        ) : (
          <>
            {activeTab === 'listen' && (
              <AudioListeningTab
                isListening={isListening}
                setIsListening={setIsListening}
                freqData={freqData}
                timeData={timeData}
                peakFreq={peakFreq}
                latestMatch={latestMatch}
                onSelectSpecies={(sp) => setSelectedSpecies(sp)}
                onSaveSighting={handleSaveSighting}
              />
            )}

            {activeTab === 'vision' && (
              <BotanicalVisionTab
                onSelectSpecies={(sp) => setSelectedSpecies(sp)}
                onSaveSighting={handleSaveSighting}
              />
            )}

            {activeTab === 'trails' && (
              <TrailMapTab onSaveSighting={handleSaveSighting} />
            )}

            {activeTab === 'journal' && (
              <FieldJournalTab
                sightings={sightings}
                onDeleteSighting={handleDeleteSighting}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Sticky Tab Navigation (for smartphone viewports) */}
      {!isPocketMode && (
        <nav className="md:hidden sticky bottom-0 z-40 liquid-glass-nav text-stone-400">
          <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
            <button
              onClick={() => setActiveTab('listen')}
              className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
                activeTab === 'listen' ? 'text-emerald-400 font-semibold' : 'hover:text-stone-200'
              }`}
            >
              <span className="text-[11px] font-medium tracking-tight">Acoustic</span>
            </button>
            <button
              onClick={() => setActiveTab('vision')}
              className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
                activeTab === 'vision' ? 'text-emerald-400 font-semibold' : 'hover:text-stone-200'
              }`}
            >
              <span className="text-[11px] font-medium tracking-tight">Foliage</span>
            </button>
            <button
              onClick={() => setActiveTab('trails')}
              className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
                activeTab === 'trails' ? 'text-emerald-400 font-semibold' : 'hover:text-stone-200'
              }`}
            >
              <span className="text-[11px] font-medium tracking-tight">Trails</span>
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
                activeTab === 'journal' ? 'text-emerald-400 font-semibold' : 'hover:text-stone-200'
              }`}
            >
              <span className="text-[11px] font-medium tracking-tight">Journal</span>
            </button>
          </div>
        </nav>
      )}

      {/* Modals */}
      <OpenAiInspectorModal
        isOpen={showModelInspector}
        onClose={() => setShowModelInspector(false)}
      />

      <SpeciesDetailModal
        species={selectedSpecies}
        onClose={() => setSelectedSpecies(null)}
        onSaveSighting={handleSaveSighting}
      />
    </div>
  );
}
