import React, { useEffect, useRef } from 'react';

interface ClickSprout {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  length: number;
  opacity: number;
  color: string;
}

interface ClickRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  sprouts: ClickSprout[];
}

export const GrassClickEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ripplesRef = useRef<ClickRipple[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const sproutColors = [
      '#34d399', // Emerald
      '#4ade80', // Leaf green
      '#a3e635', // Lime sprout
      '#86efac', // Mint
      '#fbbf24', // Sunlit gold
    ];

    const handleClick = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      // Create 4-6 small blade sprouts exploding outward gently
      const sproutCount = 5;
      const sprouts: ClickSprout[] = [];

      for (let i = 0; i < sproutCount; i++) {
        const angle = (i * (Math.PI * 2)) / sproutCount + (Math.random() - 0.5) * 0.4;
        const speed = Math.random() * 1.8 + 1.2;
        sprouts.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5, // slight upward float
          angle,
          length: Math.random() * 8 + 6,
          opacity: 1,
          color: sproutColors[Math.floor(Math.random() * sproutColors.length)],
        });
      }

      ripplesRef.current.push({
        x,
        y,
        radius: 4,
        maxRadius: 36,
        opacity: 0.8,
        sprouts,
      });
    };

    window.addEventListener('click', handleClick);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];

        // Expand rounded liquid wave
        r.radius += 1.4;
        r.opacity *= 0.94;

        // Draw outer gentle circular wave
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(52, 211, 153, ${r.opacity * 0.7})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Draw secondary inner ripple for liquid depth
        if (r.radius > 10) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius * 0.65, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(163, 230, 53, ${r.opacity * 0.4})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Draw and update micro grass sprouts
        for (let j = 0; j < r.sprouts.length; j++) {
          const sp = r.sprouts[j];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vy += 0.04; // subtle gravity pull
          sp.opacity *= 0.95;

          ctx.save();
          ctx.translate(sp.x, sp.y);
          ctx.rotate(sp.angle);

          // Render micro blade
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(sp.length * 0.3, -2, sp.length, 0);
          ctx.quadraticCurveTo(sp.length * 0.3, 2, 0, 0);
          ctx.fillStyle = sp.color;
          ctx.globalAlpha = Math.max(0, sp.opacity);
          ctx.fill();

          ctx.restore();
        }

        if (r.opacity < 0.02) {
          ripples.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{ transform: 'translateZ(0)' }}
    />
  );
};
