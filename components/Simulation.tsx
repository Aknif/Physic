
import React, { useMemo } from 'react';

interface SimulationProps {
  n: number;
  v: number;
  core: 'Air' | 'Iron';
  fieldStrength: number;
}

const Simulation: React.FC<SimulationProps> = ({ n, v, core, fieldStrength }) => {
  const loops = useMemo(() => {
    const loopCount = Math.floor(n / 2);
    return Array.from({ length: Math.max(5, loopCount) }).map((_, i) => i);
  }, [n]);

  const glowIntensity = (v / 12) * 0.5;
  const magneticLines = Array.from({ length: 6 }).map((_, i) => i);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Background Grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Magnetic Field Lines (Visual indicator) */}
        {v > 0 && magneticLines.map(i => {
          const offset = (i - 2.5) * 30;
          const strength = fieldStrength / 100;
          return (
            <ellipse
              key={i}
              cx="200" cy="150"
              rx={150 + Math.abs(offset)}
              ry={60 + Math.abs(offset * 0.5)}
              fill="none"
              stroke="rgba(0, 255, 255, 0.1)"
              strokeWidth={1 + strength * 2}
              strokeDasharray="5,5"
              className="animate-pulse"
              style={{ animationDuration: `${2 / (strength || 1)}s` }}
            />
          );
        })}

        {/* Core */}
        <rect
          x="100" y="140"
          width="200" height="20"
          rx="5"
          fill={core === 'Iron' ? '#475569' : 'rgba(255,255,255,0.05)'}
          stroke={core === 'Iron' ? '#94a3b8' : 'rgba(255,255,255,0.2)'}
          strokeWidth="2"
        />

        {/* Solenoid Wires */}
        {loops.map((i) => {
          const x = 110 + (i * (180 / loops.length));
          const color = v > 0 ? `rgb(255, ${200 - v * 10}, 0)` : '#64748b';
          return (
            <g key={i}>
              <path
                d={`M ${x} 120 C ${x + 5} 120, ${x + 10} 140, ${x + 10} 150 C ${x + 10} 160, ${x + 5} 180, ${x} 180`}
                fill="none"
                stroke={color}
                strokeWidth="3"
                style={{ filter: v > 0 ? `drop-shadow(0 0 ${glowIntensity * 10}px ${color})` : 'none' }}
              />
              <path
                d={`M ${x} 120 C ${x - 5} 120, ${x - 10} 140, ${x - 10} 150 C ${x - 10} 160, ${x - 5} 180, ${x} 180`}
                fill="none"
                stroke={color}
                strokeWidth="2"
                opacity="0.4"
              />
            </g>
          );
        })}

        {/* Wires to Battery */}
        <path d="M 110 180 L 110 240 L 160 240" fill="none" stroke="#64748b" strokeWidth="2" />
        <path d="M 290 180 L 290 240 L 240 240" fill="none" stroke="#64748b" strokeWidth="2" />

        {/* Battery */}
        <rect x="160" y="220" width="80" height="40" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
        <rect x="160" y="220" width="20" height="40" rx="2" fill="#ef4444" />
        <text x="200" y="245" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">{v}V</text>

        {/* Labels */}
        <text x="200" y="100" fill="#94a3b8" fontSize="10" textAnchor="middle" className="uppercase tracking-widest">
          Magnetic Field Intensity (B): {fieldStrength.toFixed(2)} mT
        </text>
      </svg>

      {/* Compass Mini-Simulation */}
      <div className="absolute top-4 right-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800 shadow-xl">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-2 border-slate-700 relative flex items-center justify-center">
            <div 
              className="w-1 h-10 bg-gradient-to-b from-red-500 to-white absolute transition-transform duration-500 ease-out"
              style={{ transform: `rotate(${fieldStrength * 10}deg)` }}
            />
            <div className="w-2 h-2 rounded-full bg-slate-800 z-10" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 uppercase">Compass</span>
        </div>
      </div>
    </div>
  );
};

export default Simulation;
