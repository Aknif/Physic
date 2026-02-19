
import React, { useEffect, useRef, useState } from 'react';

interface InductionSimulationProps {
  isDarkMode: boolean;
  onMaterialChange?: (material: string) => void;
  hideControls?: boolean;
}

type Material = 'iron' | 'stainless' | 'glass';

const InductionSimulation: React.FC<InductionSimulationProps> = ({ isDarkMode, onMaterialChange, hideControls = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [material, setMaterial] = useState<Material>('iron');
  const [nTurns, setNTurns] = useState(120);
  const [current, setCurrent] = useState(15);
  const [temp, setTemp] = useState(25.0);
  const requestRef = useRef<number>(null);
  const [isPlacing, setIsPlacing] = useState(false);

  useEffect(() => {
    setIsPlacing(true);
    if (onMaterialChange) onMaterialChange(material);
    const timer = setTimeout(() => setIsPlacing(false), 500);
    return () => clearTimeout(timer);
  }, [material, onMaterialChange]);

  useEffect(() => {
    let currentTemp = temp;
    
    const animate = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let heatGain = 0;
      if (material !== 'glass') {
        const efficiency = material === 'iron' ? 1.0 : 0.45;
        const powerFactor = Math.pow((nTurns * current) / 1000, 2);
        heatGain = powerFactor * efficiency * 0.15;
      }
      
      currentTemp += heatGain;
      currentTemp -= (currentTemp - 25) * 0.01; 
      
      if (currentTemp > 350) currentTemp = 350;
      setTemp(currentTemp);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
      ctx.lineWidth = 1;
      for(let i=0; i<w; i+=20) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
      for(let i=0; i<h; i+=20) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(w,i); ctx.stroke(); }

      if (current > 0) {
        ctx.save();
        const fluxStrength = (nTurns * current) / 3000;
        ctx.strokeStyle = isDarkMode ? `rgba(34, 211, 238, ${0.1 + fluxStrength})` : `rgba(79, 70, 229, ${0.1 + fluxStrength})`;
        ctx.setLineDash([5, 10]);
        ctx.lineDashOffset = -(time / 20);
        
        for (let i = -6; i <= 6; i++) {
          const xOffset = i * 35;
          ctx.beginPath();
          ctx.moveTo(w/2 + xOffset, 320);
          ctx.bezierCurveTo(w/2 + xOffset * 1.5, 200, w/2 + xOffset * 1.5, 100, w/2 + xOffset, 20);
          ctx.stroke();
        }
        ctx.restore();
      }

      const coilY = 320;
      const coilCount = Math.floor(nTurns / 15);
      ctx.lineWidth = 2 + (current / 8);
      ctx.strokeStyle = isDarkMode ? '#f59e0b' : '#92400e';
      for(let i=0; i < coilCount; i++) {
        ctx.beginPath();
        ctx.ellipse(w/2, coilY, 30 + i * 5, 10, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = isDarkMode ? '#0f172a' : '#cbd5e1';
      ctx.beginPath();
      ctx.roundRect(100, 280, 400, 10, 5);
      ctx.fill();
      ctx.strokeStyle = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)';
      ctx.stroke();

      const panW = 180;
      const panH = 90;
      const dropOffset = isPlacing ? 30 : 0;
      const panBaseX = w/2 - panW/2;
      const panBaseY = 280 - dropOffset;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(panBaseX - 20, panBaseY - panH);
      ctx.lineTo(panBaseX + panW + 20, panBaseY - panH);
      ctx.lineTo(panBaseX + panW, panBaseY);
      ctx.lineTo(panBaseX, panBaseY);
      ctx.closePath();

      if (material === 'glass') {
        ctx.fillStyle = isDarkMode ? 'rgba(186, 230, 253, 0.2)' : 'rgba(224, 242, 254, 0.5)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      } else if (material === 'stainless') {
        ctx.fillStyle = isDarkMode ? '#64748b' : '#94a3b8';
        ctx.strokeStyle = '#cbd5e1';
      } else {
        ctx.fillStyle = isDarkMode ? '#334155' : '#475569';
        ctx.strokeStyle = '#1e293b';
      }
      ctx.fill();
      ctx.stroke();

      if (material !== 'glass' && currentTemp > 40) {
        const glowAlpha = Math.min((currentTemp - 40) / 200, 0.7);
        ctx.fillStyle = `rgba(239, 68, 68, ${glowAlpha})`;
        ctx.fill();
      }

      if (material !== 'glass' && current > 5 && !isPlacing) {
        ctx.strokeStyle = isDarkMode ? 'rgba(34, 211, 238, 0.6)' : 'rgba(79, 70, 229, 0.6)';
        ctx.lineWidth = 1;
        const eddyCount = 3;
        for(let e=0; e<eddyCount; e++) {
           const size = 20 + e*15;
           const rotation = (time / 500) * (e % 2 === 0 ? 1 : -1);
           ctx.save();
           ctx.translate(w/2, panBaseY - 15);
           ctx.rotate(rotation);
           ctx.beginPath();
           ctx.ellipse(0, 0, size, size/3, 0, 0, Math.PI * 2);
           ctx.stroke();
           ctx.restore();
        }
      }

      if (currentTemp > 95 && !isPlacing) {
         ctx.fillStyle = isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
         for(let s=0; s<4; s++) {
           const sX = w/2 - 50 + s*30 + Math.sin(time/400 + s)*15;
           const sY = panBaseY - panH - 10 - ((time/15 + s*20) % 60);
           const sSize = 8 + Math.sin(time/300)*4;
           ctx.beginPath();
           ctx.arc(sX, sY, sSize, 0, Math.PI*2);
           ctx.fill();
         }
      }
      ctx.restore();

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [material, nTurns, current, isDarkMode, isPlacing]);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className={`flex-1 relative rounded-[3rem] overflow-hidden border-2 shadow-2xl ${isDarkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-950/20'}`}>
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={400} 
          className="w-full h-full object-contain"
        />
        
        {!hideControls && (
          <div className="absolute top-8 left-8 flex flex-col gap-4">
             <div className={`p-5 rounded-2xl backdrop-blur-xl border-2 flex items-center gap-4 ${isDarkMode ? 'bg-black/60 border-white/10' : 'bg-white/80 border-slate-950/10 shadow-lg'}`}>
                <div className={`w-3 h-3 rounded-full animate-ping ${temp > 100 ? 'bg-red-500' : 'bg-cyan-500'}`} />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Thermal Reading</span>
                  <span className={`text-4xl font-chakra font-black ${temp > 100 ? 'text-red-500' : isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                    {temp.toFixed(1)}°C
                  </span>
                </div>
             </div>
          </div>
        )}
      </div>

      {!hideControls && (
        <div className={`p-8 rounded-[3rem] border-2 grid grid-cols-1 lg:grid-cols-2 gap-10 ${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-950 shadow-xl'}`}>
          <div className="space-y-4 overflow-hidden">
             <label className="text-xs font-chakra font-black uppercase tracking-[0.2em] text-slate-500 block mb-4">วางวัตถุทดลอง (PLACE TEST OBJECT)</label>
             <div className="flex lg:grid lg:grid-cols-1 gap-3 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 snap-x no-scrollbar">
                {([
                  { id: 'iron', label: 'Cast Iron Pan (เหล็กหล่อ)', desc: 'CONDUCTIVE & MAGNETIC' },
                  { id: 'stainless', label: 'Stainless Plate (สแตนเลส)', desc: 'LOW MAGNETIC RESPONSE' },
                  { id: 'glass', label: 'Glass / Egg (แก้ว/ไข่)', desc: 'NON-MAGNETIC INSULATOR' }
                ] as const).map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMaterial(m.id)}
                    className={`min-w-[280px] lg:min-w-0 px-5 py-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group transform hover:scale-[1.02] active:scale-95 snap-center ${
                      material === m.id 
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                      : isDarkMode ? 'border-white/5 bg-black/20 text-slate-500' : 'border-slate-100 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div>
                      <div className={`text-sm md:text-base font-chakra font-black uppercase ${material === m.id ? 'text-white' : ''}`}>{m.label}</div>
                      <div className="text-[10px] opacity-60 uppercase font-bold tracking-wider">{m.desc}</div>
                    </div>
                    {material === m.id && (
                       <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse ml-4 shadow-cyan-500/50" />
                    )}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-8 flex flex-col justify-center">
             <div className="space-y-4">
                <div className="flex justify-between items-end px-2">
                   <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      <label className="text-[10px] font-chakra font-black uppercase tracking-widest text-slate-500">ขดลวด (N)</label>
                   </div>
                   <span className="text-xl font-chakra font-black text-cyan-400">{nTurns}</span>
                </div>
                <div className="relative group py-2">
                   <input 
                     type="range" min="20" max="300" step="10" value={nTurns} 
                     onChange={e => setNTurns(parseInt(e.target.value))}
                     className="w-full h-4 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 touch-pan-x"
                   />
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex justify-between items-end px-2">
                   <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      <label className="text-[10px] font-chakra font-black uppercase tracking-widest text-slate-500">กระแสไฟฟ้า (I)</label>
                   </div>
                   <span className="text-xl font-chakra font-black text-amber-500">{current}A</span>
                </div>
                <div className="relative group py-2">
                   <input 
                     type="range" min="0" max="40" step="1" value={current} 
                     onChange={e => setCurrent(parseInt(e.target.value))}
                     className="w-full h-4 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 touch-pan-x"
                   />
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InductionSimulation;
