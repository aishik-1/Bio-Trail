import React, { useState } from 'react';
import { Download, Trash2, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { SightingRecord, TaxaCategory } from '../types/nature';
import { storageService } from '../services/storageService';

interface FieldJournalTabProps {
  sightings: SightingRecord[];
  onDeleteSighting: (id: string) => void;
}

export const FieldJournalTab: React.FC<FieldJournalTabProps> = ({
  sightings,
  onDeleteSighting,
}) => {
  const [selectedTaxa, setSelectedTaxa] = useState<TaxaCategory | 'all'>('all');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const filtered = sightings.filter((s) => {
    if (selectedTaxa === 'all') return true;
    return s.category === selectedTaxa;
  });

  const handleExportCSV = () => {
    const csvContent = storageService.exportToDarwinCoreCSV(sightings);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BioTrail_DarwinCore_Sightings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Exported Darwin Core CSV (eBird / iNaturalist standard)');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(sightings, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BioTrail_Field_Sightings_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Exported Local JSON Archive');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl liquid-glass p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
            <span>Air-Gapped Naturalist Journal</span>
            <span aria-hidden="true">·</span>
            <span>Local Storage</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Darwin Core Standards</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Field Sightings Journal
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Acoustic recordings, verified flora, and waypoint observations stored solely in your local client.
            Export directly to scientific biodiversity formats without corporate telemetry.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 text-xs font-bold rounded-full bg-emerald-400 hover:bg-emerald-300 text-stone-950 transition-colors flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Darwin Core CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-4 py-2.5 text-xs font-medium rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-stone-200 border border-white/[0.08] transition-colors flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-stone-400" />
              <span>Export JSON Archive</span>
            </button>
          </div>

          {exportNotice && (
            <p className="pt-1 text-xs text-emerald-400 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{exportNotice}</span>
            </p>
          )}
        </div>
      </div>

      {/* Taxa Filter Segmented Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-1 p-1 liquid-glass-subtle rounded-xl">
          {(['all', 'bird', 'flora', 'fungi', 'amphibian'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedTaxa(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize cursor-pointer active:scale-95 ${
                selectedTaxa === cat
                  ? 'bg-white text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {cat === 'all' ? 'All Taxa' : `${cat}s`}
            </button>
          ))}
        </div>

        <span className="text-xs text-stone-400 font-mono">
          {filtered.length} {filtered.length === 1 ? 'sighting' : 'sightings'} recorded
        </span>
      </div>

      {/* Sightings List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-white/[0.08] liquid-glass-subtle space-y-2">
          <p className="text-sm font-semibold text-stone-300">No sightings in this category yet</p>
          <p className="text-xs text-stone-500">
            Head to Acoustics or Foliage to identify and log specimens on the trail.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="liquid-glass-subtle hover:border-white/[0.18] rounded-2xl p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-400 font-semibold uppercase tracking-wider font-mono">
                    {s.category}
                  </span>
                  <span className="text-stone-600" aria-hidden="true">·</span>
                  <span className="text-stone-400 font-mono">{s.confidence}% Confidence</span>
                  <span className="text-stone-600" aria-hidden="true">·</span>
                  <span className="text-stone-400 flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3 h-3 text-stone-500" />
                    <span>{new Date(s.timestamp).toLocaleDateString()}</span>
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">{s.speciesName}</h3>
                  <span className="text-xs text-stone-400 font-serif italic">{s.scientificName}</span>
                </div>

                {s.notes && (
                  <p className="text-xs text-stone-300 leading-relaxed pt-1">
                    {s.notes}
                  </p>
                )}

                <div className="flex items-center gap-2 text-[11px] text-stone-400 pt-1 font-mono">
                  <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                  <span>{s.locationName} ({s.lat}, {s.lng})</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onDeleteSighting(s.id)}
                  className="p-2 text-stone-500 hover:text-rose-400 hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
                  title="Remove sighting"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
