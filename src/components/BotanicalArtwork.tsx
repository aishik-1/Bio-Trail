import React from 'react';

export const botanicalArtworks: Record<string, React.ReactNode> = {
  'sugar-maple': (
    <svg viewBox="0 0 240 240" className="w-full h-full max-h-60" fill="none">
      <defs>
        <radialGradient id="mapleGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#dc2626" />
        </radialGradient>
      </defs>
      {/* 5-lobed Sugar Maple leaf silhouette with U-shaped sinuses */}
      <path
        d="M120 220 L120 180 Q100 180 80 190 Q90 160 60 160 Q80 140 60 120 Q90 120 95 95 Q105 110 120 40 Q135 110 145 95 Q150 120 180 120 Q160 140 180 160 Q150 160 160 190 Q140 180 120 180 Z"
        fill="url(#mapleGrad)"
        stroke="#991b1b"
        strokeWidth="2.5"
      />
      {/* Main leaf veins */}
      <path d="M120 180 L120 60" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M120 140 L75 115" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M120 140 L165 115" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M120 160 L80 165" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M120 160 L160 165" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      {/* Stem */}
      <path d="M120 180 L120 220" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  'golden-chanterelle': (
    <svg viewBox="0 0 240 240" className="w-full h-full max-h-60" fill="none">
      <defs>
        <linearGradient id="chanterelleCap" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      {/* Wavy funnel trumpet cap */}
      <path
        d="M60 90 Q80 70 120 75 Q160 70 180 90 Q170 115 140 125 L135 190 Q120 200 105 190 L100 125 Q70 115 60 90 Z"
        fill="url(#chanterelleCap)"
        stroke="#b45309"
        strokeWidth="2"
      />
      {/* Funnel depression center */}
      <ellipse cx="120" cy="85" rx="35" ry="12" fill="#d97706" opacity="0.6" />
      {/* Decurrent forking false gill ridges */}
      <path d="M120 85 Q115 120 112 160" stroke="#fbbf24" strokeWidth="1.8" />
      <path d="M100 95 Q102 125 106 150" stroke="#fbbf24" strokeWidth="1.5" />
      <path d="M140 95 Q138 125 134 150" stroke="#fbbf24" strokeWidth="1.5" />
      <path d="M80 95 Q90 115 102 135" stroke="#fbbf24" strokeWidth="1.2" />
      <path d="M160 95 Q150 115 138 135" stroke="#fbbf24" strokeWidth="1.2" />
      {/* Forest floor moss & pine needles */}
      <path d="M80 195 Q120 185 160 195" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
      <line x1="90" y1="198" x2="110" y2="192" stroke="#854d0e" strokeWidth="2" />
      <line x1="130" y1="190" x2="150" y2="198" stroke="#854d0e" strokeWidth="2" />
    </svg>
  ),
  'poison-ivy': (
    <svg viewBox="0 0 240 240" className="w-full h-full max-h-60" fill="none">
      {/* Central leaf (longer stalk) */}
      <path
        d="M120 130 Q100 100 105 60 Q120 40 135 60 Q140 100 120 130 Z"
        fill="#dc2626"
        stroke="#991b1b"
        strokeWidth="2"
        opacity="0.9"
      />
      {/* Left leaflet */}
      <path
        d="M110 145 Q80 130 60 115 Q65 95 90 100 Q105 120 110 145 Z"
        fill="#ea580c"
        stroke="#991b1b"
        strokeWidth="2"
        opacity="0.9"
      />
      {/* Right leaflet */}
      <path
        d="M130 145 Q160 130 180 115 Q175 95 150 100 Q135 120 130 145 Z"
        fill="#ea580c"
        stroke="#991b1b"
        strokeWidth="2"
        opacity="0.9"
      />
      {/* Stalks */}
      <path d="M120 180 L120 130" stroke="#78350f" strokeWidth="3" />
      <path d="M120 150 L110 145" stroke="#78350f" strokeWidth="2.5" />
      <path d="M120 150 L130 145" stroke="#78350f" strokeWidth="2.5" />
      {/* Urushiol warning indicator ring */}
      <circle cx="120" cy="115" r="75" stroke="#f87171" strokeWidth="1.5" strokeDasharray="6 4" />
    </svg>
  ),
  'western-sword-fern': (
    <svg viewBox="0 0 240 240" className="w-full h-full max-h-60" fill="none">
      <defs>
        <linearGradient id="fernGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#14532d" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      {/* Arching central frond stipe */}
      <path d="M60 210 Q100 140 180 50" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" />
      {/* Sword pinnae with hilt lobes */}
      {[
        { x: 80, y: 180, l: 30, a: -35 },
        { x: 95, y: 160, l: 35, a: -30 },
        { x: 110, y: 140, l: 38, a: -25 },
        { x: 125, y: 120, l: 38, a: -20 },
        { x: 140, y: 100, l: 34, a: -15 },
        { x: 155, y: 80, l: 28, a: -10 },
      ].map((p, idx) => (
        <React.Fragment key={idx}>
          {/* Left pinna */}
          <line
            x1={p.x}
            y1={p.y}
            x2={p.x - p.l * 0.8}
            y2={p.y + p.l * 0.4}
            stroke="url(#fernGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Right pinna */}
          <line
            x1={p.x}
            y1={p.y}
            x2={p.x + p.l * 0.7}
            y2={p.y - p.l * 0.4}
            stroke="url(#fernGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </React.Fragment>
      ))}
    </svg>
  ),
  'wild-blackberry': (
    <svg viewBox="0 0 240 240" className="w-full h-full max-h-60" fill="none">
      {/* Prickly cane */}
      <path d="M50 180 Q100 130 190 100" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
      <polygon points="90,150 92,143 85,148" fill="#78350f" />
      <polygon points="130,128 132,121 125,126" fill="#78350f" />
      {/* Leaves */}
      <ellipse cx="140" cy="80" rx="25" ry="14" transform="rotate(-20 140 80)" fill="#166534" stroke="#14532d" />
      <ellipse cx="115" cy="95" rx="22" ry="12" transform="rotate(25 115 95)" fill="#166534" stroke="#14532d" />
      {/* Aggregate Blackberry drupelets */}
      <g transform="translate(160, 110)">
        <circle cx="0" cy="0" r="7" fill="#18181b" stroke="#3f3f46" />
        <circle cx="10" cy="-4" r="6" fill="#27272a" stroke="#52525b" />
        <circle cx="-8" cy="4" r="6" fill="#18181b" stroke="#3f3f46" />
        <circle cx="4" cy="8" r="6" fill="#09090b" stroke="#3f3f46" />
        <circle cx="12" cy="6" r="6" fill="#27272a" stroke="#52525b" />
        <circle cx="-4" cy="-8" r="6" fill="#27272a" stroke="#52525b" />
        <circle cx="5" cy="-10" r="5" fill="#18181b" stroke="#3f3f46" />
      </g>
    </svg>
  ),
  'white-oak': (
    <svg viewBox="0 0 240 240" className="w-full h-full max-h-60" fill="none">
      {/* Rounded 7-lobed Oak leaf with deep smooth sinuses */}
      <path
        d="M120 210 L120 180 C95 180 85 170 85 160 C85 150 95 145 90 135 C80 130 75 115 85 105 C95 100 100 95 100 85 C100 70 120 50 125 50 C130 50 150 70 150 85 C150 95 155 100 165 105 C175 115 170 130 160 135 C155 145 165 150 165 160 C165 170 155 180 130 180 L130 210 Z"
        fill="#b45309"
        stroke="#78350f"
        strokeWidth="2.5"
      />
      <path d="M125 180 L125 65" stroke="#fef08a" strokeWidth="2" opacity="0.6" />
      {/* Sweet low-tannin acorn */}
      <g transform="translate(150, 160)">
        <ellipse cx="10" cy="18" rx="8" ry="12" fill="#92400e" />
        <path d="M2 12 Q10 6 18 12 Q10 16 2 12 Z" fill="#78350f" stroke="#451a03" />
      </g>
    </svg>
  ),
};
