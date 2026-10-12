import React, { useEffect, useRef } from 'react';

interface BladeParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  swaySpeed: number;
  swayOffset: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
  type: 'blade' | 'leaflet' | 'spore';
}

export const FallingGrassBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color palette of fresh meadow grass, golden autumn blades, and tender sprouts
    const colors = [
      'rgba(52, 211, 153, ',  // Emerald
      'rgba(74, 222, 128, ',  // Fresh grass green
      'rgba(163, 230, 53, ',  // Lime sprout
      'rgba(234, 179, 8, ',   // Autumn golden grass
      'rgba(16, 185, 129, ',  // Deep forest
    ];

    const particleCount = Math.min(38, Math.floor((width * height) / 32000));
    const particles: BladeParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 12 + 8,
        speedY: Math.random() * 0.7 + 0.35,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayOffset: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.35 + 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: Math.random() > 0.4 ? 'blade' : Math.random() > 0.5 ? 'leaflet' : 'spore',
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Motion physics: smooth falling with lateral wind sway
        p.y += p.speedY;
        p.x += Math.sin(time * 0.8 + p.swayOffset) * 0.75 + 0.2; // gentle rightward wind breeze
        p.rotation += p.rotationSpeed;

        // Wrap around boundaries
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) {
          p.x = -20;
        } else if (p.x < -20) {
          p.x = width + 20;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'blade') {
          // Curved blade of grass
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 0.35, 0, 0, p.size);
          ctx.quadraticCurveTo(-p.size * 0.2, 0, 0, -p.size);
          ctx.fillStyle = `${p.color}${p.opacity})`;
          ctx.fill();
        } else if (p.type === 'leaflet') {
          // Oval leaflet
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.3, p.size * 0.7, 0.2, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.opacity * 0.85})`;
          ctx.fill();
        } else {
          // Floating pollen/seed spore with tiny glow
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.22, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.opacity * 1.2})`;
          ctx.fill();
        }

        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-60"
      style={{ transform: 'translateZ(0)' }}
    />
  );
};
