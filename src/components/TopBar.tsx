import React from 'react';
import { Compass, Radio } from 'lucide-react';

interface TopBarProps {
  activeTab: 'listen' | 'vision' | 'trails' | 'journal';
  setActiveTab: (tab: 'listen' | 'vision' | 'trails' | 'journal') => void;
  onOpenModelInspector: () => void;
  isPocketMode: boolean;
  setIsPocketMode: (val: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenModelInspector,
  isPocketMode,
  setIsPocketMode,
}) => {
  return (
    <header className="sticky top-0 z-40 liquid-glass-nav text-stone-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => {
            setActiveTab('listen');
            setIsPocketMode(false);
          }}
          className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>BioTrail</span>
        </button>

        {/* Zone 2: 4 Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-medium text-stone-400">
          <button
            onClick={() => {
              setActiveTab('listen');
              setIsPocketMode(false);
            }}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'listen' && !isPocketMode
                ? 'text-white font-semibold border-b border-emerald-400 pb-0.5'
                : 'hover:text-stone-200'
            }`}
          >
            Acoustics
          </button>
          <button
            onClick={() => {
              setActiveTab('vision');
              setIsPocketMode(false);
            }}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'vision' && !isPocketMode
                ? 'text-white font-semibold border-b border-emerald-400 pb-0.5'
                : 'hover:text-stone-200'
            }`}
          >
            Foliage & Flora
          </button>
          <button
            onClick={() => {
              setActiveTab('trails');
              setIsPocketMode(false);
            }}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'trails' && !isPocketMode
                ? 'text-white font-semibold border-b border-emerald-400 pb-0.5'
                : 'hover:text-stone-200'
            }`}
          >
            Trail Map
          </button>
          <button
            onClick={() => {
              setActiveTab('journal');
              setIsPocketMode(false);
            }}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'journal' && !isPocketMode
                ? 'text-white font-semibold border-b border-emerald-400 pb-0.5'
                : 'hover:text-stone-200'
            }`}
          >
            Field Journal
          </button>
          <button
            onClick={onOpenModelInspector}
            className="whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 text-stone-500 hover:text-stone-300"
          >
            Open Architecture
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Pocket Patrol) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsPocketMode(!isPocketMode)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer active:scale-95 ${
              isPocketMode
                ? 'bg-emerald-400 text-stone-950 font-bold shadow-md shadow-emerald-400/20'
                : 'bg-white/[0.06] text-stone-200 hover:bg-white/[0.1] border border-white/[0.08]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isPocketMode ? 'Exit Pocket Mode' : 'Pocket Patrol'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
