import React, { useState, useEffect, useRef } from 'react';
import { Mountain, Compass, Plus, Footprints } from 'lucide-react';
import { TRAIL_ROUTES } from '../data/trailRoutes';
import { SightingRecord, TrailRoute } from '../types/nature';

interface TrailMapTabProps {
  onSaveSighting: (sighting: SightingRecord) => void;
}

export const TrailMapTab: React.FC<TrailMapTabProps> = ({ onSaveSighting }) => {
  const [selectedRoute, setSelectedRoute] = useState<TrailRoute>(TRAIL_ROUTES[0]);
  const [customWaypoints, setCustomWaypoints] = useState<Array<{ name: string; lat: number; lng: number }>>([
    { name: 'Hemlock Stream Ford', lat: 35.858, lng: -82.342 },
    { name: 'Sugar Maple Vista Bench', lat: 35.864, lng: -82.336 },
  ]);
  const [newWaypointName, setNewWaypointName] = useState('');
  const [addedNote, setAddedNote] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // High-DPI Retina offline topographic canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const cssWidth = Math.floor(rect.width) || 760;
    const cssHeight = 360;

    if (canvas.width !== cssWidth * dpr || canvas.height !== cssHeight * dpr) {
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const width = cssWidth;
    const height = cssHeight;

    // Earthy slate topo bedrock
    ctx.fillStyle = '#0f1211';
    ctx.fillRect(0, 0, width, height);

    // Subtle topographic elevation contour rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let r = 40; r < Math.max(width, height) * 1.2; r += 38) {
      ctx.beginPath();
      ctx.ellipse(width * 0.48, height * 0.52, r * 1.15, r * 0.75, Math.PI / 7, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Foliage canopy glow zone (fall foliage heat layer)
    const foliageGlow = ctx.createRadialGradient(width * 0.52, height * 0.44, 15, width * 0.52, height * 0.44, 170);
    foliageGlow.addColorStop(0, 'rgba(234, 88, 12, 0.22)');
    foliageGlow.addColorStop(0.65, 'rgba(220, 38, 38, 0.1)');
    foliageGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = foliageGlow;
    ctx.fillRect(0, 0, width, height);

    // Coordinate normalization bounds
    const pts = selectedRoute.pathPoints;
    let minLat = pts[0].lat, maxLat = pts[0].lat;
    let minLng = pts[0].lng, maxLng = pts[0].lng;
    pts.forEach((p) => {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    });

    const latSpan = Math.max(0.001, maxLat - minLat);
    const lngSpan = Math.max(0.001, maxLng - minLng);

    const mapX = (lng: number) => 64 + ((lng - minLng) / lngSpan) * (width - 128);
    const mapY = (lat: number) => height - 54 - ((lat - minLat) / latSpan) * (height - 108);

    // Trail route shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach((p, idx) => {
      const x = mapX(p.lng);
      const y = mapY(p.lat) + 2;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Trail vector line (Emerald)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach((p, idx) => {
      const x = mapX(p.lng);
      const y = mapY(p.lat);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Trail dash centerline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Trailhead start point
    const startX = mapX(pts[0].lng);
    const startY = mapY(pts[0].lat);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(startX, startY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Trailhead', startX + 10, startY + 4);

    // Custom waypoints
    customWaypoints.forEach((wp) => {
      const wx = mapX(wp.lng);
      const wy = mapY(wp.lat);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(wx, wy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde68a';
      ctx.font = '10px "Space Mono", monospace';
      ctx.fillText(wp.name, wx + 8, wy - 4);
    });

    // Compass indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px "Space Mono", monospace';
    ctx.fillText('N ▲ · Local Topo Grid', width - 140, 24);

    ctx.restore();
  }, [selectedRoute, customWaypoints]);

  const handleAddWaypoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWaypointName.trim()) return;

    const baseLat = selectedRoute.pathPoints[1]?.lat || 35.856;
    const baseLng = selectedRoute.pathPoints[1]?.lng || -82.338;
    const jitterLat = baseLat + (Math.random() - 0.5) * 0.006;
    const jitterLng = baseLng + (Math.random() - 0.5) * 0.006;

    const newWp = {
      name: newWaypointName.trim(),
      lat: parseFloat(jitterLat.toFixed(4)),
      lng: parseFloat(jitterLng.toFixed(4)),
    };

    setCustomWaypoints((prev) => [...prev, newWp]);
    setNewWaypointName('');
    setAddedNote(`Logged waypoint "${newWp.name}" at coordinates ${newWp.lat}, ${newWp.lng}`);
    setTimeout(() => setAddedNote(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl liquid-glass p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
            <span>Offline Topographic Geometry</span>
            <span aria-hidden="true">·</span>
            <span>Zero Third-Party Map SDKs</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Autumn Foliage Radar</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Trail Routes & Foliage Contours
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Pre-cached wilderness trails and run loops plotted with peak scarlet foliage progression
            and acoustic bird hotspots. Navigable completely without cellular connectivity.
          </p>
        </div>
      </div>

      {/* Route Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TRAIL_ROUTES.map((route) => {
          const isSelected = selectedRoute.id === route.id;
          return (
            <button
              key={route.id}
              onClick={() => setSelectedRoute(route)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between active:scale-95 ${
                isSelected
                  ? 'liquid-glass border-emerald-500/70 shadow-md'
                  : 'liquid-glass-subtle hover:border-white/[0.18]'
              }`}
            >
              <div>
                <span className="text-[11px] font-mono text-emerald-400 block mb-1">
                  {route.region}
                </span>
                <h3 className="text-sm font-semibold text-white mb-2 leading-snug">
                  {route.name}
                </h3>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between text-xs text-stone-300 font-mono">
                  <span className="flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5 text-stone-400" />
                    <span>{route.distanceMiles} mi</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Mountain className="w-3.5 h-3.5 text-stone-400" />
                    <span>+{route.elevationGainFt} ft</span>
                  </span>
                </div>

                <div className="text-[11px] text-amber-300 flex items-center justify-between">
                  <span>Foliage Peak</span>
                  <span className="font-mono font-bold">{route.foliageScorePercent}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Canvas Map Viewport and Route Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Topo Canvas */}
        <div
          ref={containerRef}
          className="lg:col-span-8 liquid-glass-subtle rounded-3xl p-5 flex flex-col justify-between shadow-lg"
        >
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2 text-stone-200">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">{selectedRoute.name}</span>
              </div>
              <span className="font-mono text-stone-400 text-[11px]">Offline Topographic Engine</span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0a0d0c]">
              <canvas
                ref={canvasRef}
                className="w-full h-72 sm:h-88 block"
                style={{ transform: 'translateZ(0)' }}
              />
            </div>
          </div>

          {/* Form to log landmark */}
          <form onSubmit={handleAddWaypoint} className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2">
            <input
              type="text"
              placeholder="Log trail waypoint (e.g., 'Big Mossy Oak', 'Owl Nest Cavity')..."
              value={newWaypointName}
              onChange={(e) => setNewWaypointName(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-[#090b0a] border border-white/[0.08] rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Point</span>
            </button>
          </form>

          {addedNote && (
            <p className="text-xs text-emerald-400 pt-2 font-mono">{addedNote}</p>
          )}
        </div>

        {/* Trail Card details */}
        <div className="lg:col-span-4 liquid-glass-subtle rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-lg">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400 block mb-1">
                Field Conditions
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">{selectedRoute.name}</h2>
              <p className="text-xs text-stone-400 mt-1">{selectedRoute.region}</p>
            </div>

            {/* Fall Foliage Meter */}
            <div className="p-4 rounded-2xl bg-[#0a0d0c] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-medium">Autumn Canopy Progress</span>
                <span className="font-mono text-amber-400 font-bold">
                  {selectedRoute.foliageScorePercent}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${selectedRoute.foliageScorePercent}%` }}
                />
              </div>
              <span className="text-[11px] text-stone-400 block">
                Status: <strong className="text-stone-200">{selectedRoute.fallFoliageStatus}</strong>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {selectedRoute.description}
            </p>

            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-stone-400 block mb-2">
                High Probability Species
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedRoute.primarySpecies.map((sp, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-stone-300 bg-white/[0.05] px-2.5 py-1 rounded-lg border border-white/[0.06]"
                  >
                    {sp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] text-xs text-stone-400 flex items-center justify-between">
            <span>Terrain Difficulty</span>
            <span className="font-semibold text-white">{selectedRoute.difficulty}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
