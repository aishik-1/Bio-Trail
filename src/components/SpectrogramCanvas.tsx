import React, { useEffect, useRef } from 'react';

interface SpectrogramCanvasProps {
  freqData: Uint8Array | null;
  timeData: Uint8Array | null;
  peakFreq: number;
  isListening: boolean;
}

export const SpectrogramCanvas: React.FC<SpectrogramCanvasProps> = ({
  freqData,
  timeData,
  peakFreq,
  isListening,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const peakHistoryRef = useRef<number[]>(new Array(120).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const cssWidth = Math.floor(rect.width) || 720;
    const cssHeight = 220;

    if (canvas.width !== cssWidth * dpr || canvas.height !== cssHeight * dpr) {
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const width = cssWidth;
    const height = cssHeight;

    // Deep matte obsidian background
    ctx.fillStyle = '#0a0d0c';
    ctx.fillRect(0, 0, width, height);

    // Subtle horizontal frequency guides (calibrated biological avian range)
    const guides = [
      { freq: '8 kHz', y: 0.16 },
      { freq: '4 kHz', y: 0.40 },
      { freq: '2 kHz', y: 0.65 },
      { freq: '500 Hz', y: 0.88 },
    ];

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.font = '10px "Space Mono", monospace';
    ctx.fillStyle = 'rgba(161, 161, 170, 0.45)';

    guides.forEach((g) => {
      const y = Math.round(height * g.y);
      ctx.beginPath();
      ctx.moveTo(42, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillText(g.freq, 6, y + 3);
    });

    if (!isListening || !freqData) {
      // Idle ambient baseline with quiet harmonic ripple
      const t = performance.now() * 0.0015;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const mid = height / 2;
      for (let x = 44; x < width; x += 3) {
        const y = mid + Math.sin((x * 0.03) + t) * 4 + Math.cos((x * 0.015) - t * 0.8) * 3;
        if (x === 44) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(212, 212, 216, 0.5)';
      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Awaiting audio input · Start Trail Mic or play a synthetic song below', width / 2 + 20, height / 2 - 12);
      ctx.restore();
      return;
    }

    // High 60Hz resolution bar renderer
    const plotLeft = 44;
    const plotWidth = width - plotLeft - 10;
    const numBars = Math.min(110, Math.floor(plotWidth / 4));
    const barWidth = Math.max(2, (plotWidth / numBars) - 1.5);
    const step = Math.floor(freqData.length / (numBars * 2.5));

    const peakArray = peakHistoryRef.current;
    if (peakArray.length !== numBars) {
      peakHistoryRef.current = new Array(numBars).fill(0);
    }

    // Gradient palette: deep emerald to bright seafoam to warm gold peak
    const grad = ctx.createLinearGradient(0, height, 0, 20);
    grad.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
    grad.addColorStop(0.5, 'rgba(52, 211, 153, 0.85)');
    grad.addColorStop(0.85, 'rgba(250, 204, 21, 0.95)');
    grad.addColorStop(1, '#fef08a');

    for (let i = 0; i < numBars; i++) {
      const dataIndex = Math.min(freqData.length - 1, i * step + 4);
      const val = freqData[dataIndex] || 0;
      const barHeight = Math.max(2, (val / 255) * (height - 35));
      const x = plotLeft + i * (barWidth + 1.5);
      const y = height - barHeight;

      // Update falling peak indicator
      if (barHeight > peakArray[i]) {
        peakArray[i] = barHeight;
      } else {
        peakArray[i] = Math.max(0, peakArray[i] - 1.2); // smooth gravity drop
      }

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Peak cap line
      if (peakArray[i] > 4) {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
        ctx.fillRect(x, height - peakArray[i], barWidth, 1.5);
      }
    }

    // Time-domain subtle oscilloscope overlay
    if (timeData) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const timeStep = Math.max(1, Math.floor(timeData.length / plotWidth));
      for (let tx = 0; tx < plotWidth; tx += 2) {
        const sampleIdx = Math.min(timeData.length - 1, tx * timeStep);
        const v = timeData[sampleIdx] / 128.0;
        const ty = (v * (height * 0.28)) + (height * 0.35);
        if (tx === 0) ctx.moveTo(plotLeft + tx, ty);
        else ctx.lineTo(plotLeft + tx, ty);
      }
      ctx.stroke();
    }

    // Minimalist peak marker badge
    if (peakFreq > 0) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
      ctx.font = '11px "Space Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${peakFreq} Hz`, width - 14, 22);
    }

    ctx.restore();
  }, [freqData, timeData, peakFreq, isListening]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0d0c] shadow-2xl transition-all"
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06] text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="font-medium text-stone-200 tracking-tight">Spectral Acoustic Analyzer</span>
        </div>
        <div className="flex items-center gap-2.5 font-mono text-[11px] text-stone-400">
          <span>FFT 2048</span>
          <span className="text-stone-600" aria-hidden="true">/</span>
          <span>48 kHz</span>
          <span className="text-stone-600" aria-hidden="true">/</span>
          <span className="text-emerald-400 font-semibold">0ms Net</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-[220px] block"
        style={{ transform: 'translateZ(0)' }}
      />
    </div>
  );
};
