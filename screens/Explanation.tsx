
import React, { useState } from 'react';
import { VideoObservation, CERState } from '../types';
import { evaluateReasoning } from '../services/geminiService';

interface ExplanationProps {
  observations: VideoObservation[];
  cerState: CERState;
  setCerState: React.Dispatch<React.SetStateAction<CERState>>;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

const SCIENTIFIC_STARTERS = [
  "จากหลักการทำงานของเตาแม่เหล็กไฟฟ้า...",
  "สาเหตุที่ไข่ไม่สุกเนื่องจาก...",
  "ความร้อนจะเกิดขึ้นได้ก็ต่อเมื่อ...",
  "การที่ไข่ไม่ใช่โลหะส่งผลให้...",
  "สรุปได้ว่ากระแสไฟฟ้าเหนี่ยวนำ..."
];

const EVIDENCE_LOGS = [
  {
    id: '01',
    title: 'การตอกไข่ลงบนหน้าเตาแม่เหล็กไฟฟ้าโดยตรง',
    obs: 'ไข่ยังคงเป็นของเหลว (ไข่ดิบ) แม้เปิดเตาแม่เหล็กไฟฟ้าโดยไม่มีภาชนะโลหะวางอยู่ หน้าเตาไม่ร้อนจนทำให้ไข่สุก',
    reason: 'เตาแม่เหล็กไฟฟ้าสร้างสนามแม่เหล็กไฟฟ้าสลับ ซึ่งจะเหนี่ยวนำให้เกิดกระแสไฟฟ้าวน (eddy currents) ได้เฉพาะในวัสดุที่มีสมบัติเป็นสารแม่เหล็ก เช่น เหล็กหรือโลหะบางชนิด ไข่ซึ่งไม่ใช่วัสดุแม่เหล็กจึงไม่เกิดกระแสไฟฟ้าวนและไม่เกิดความร้อน',
    videoUrl: 'https://youtu.be/ECKV35A2fos',
    articleUrl: 'https://www.aceee.org/files/proceedings/2014/data/papers/9-702.pdf?utm_source=chatgpt.com'
  },
  {
    id: '02',
    title: 'การตอกไข่ใส่ภาชนะฉนวน (แก้ว / เซรามิก)',
    obs: 'ไข่ยังคงอยู่ในสภาพดิบ และภาชนะแก้วหรือเซรามิกไม่เกิดความร้อนเมื่อใช้กับเตาแม่เหล็กไฟฟ้า',
    reason: 'แก้วและเซรามิกเป็นวัสดุฉนวนและไม่เป็นสารแม่เหล็ก (non-ferromagnetic materials) สนามแม่เหล็กไฟฟ้าจากเตาจึงไม่สามารถเหนี่ยวนำให้เกิดกระแสไฟฟ้าวนได้ เมื่อไม่เกิดกระแสไฟฟ้าวน พลังงานไฟฟ้าจึงไม่ถูกเปลี่ยนเป็นพลังงานความร้อน',
    videoUrl: 'https://youtu.be/pbwr73R6Ay8',
    articleUrl: 'https://www.mdpi.com/2227-7080/12/10/206?utm_source=chatgpt.com'
  },
  {
    id: '03',
    title: 'การทดลองวางกระดาษคั่นระหว่างเตาและกระทะเหล็ก',
    obs: 'กระดาษที่วางบนหน้าเตาไม่ไหม้ ในขณะที่กระทะเหล็กรร้อนขึ้นและสามารถทำให้ไข่สุกได้',
    reason: 'ความร้อนเกิดขึ้นเฉพาะในกระทะเหล็กซึ่งเป็นวัสดุที่ตอบสนองต่อสนามแม่เหล็กไฟฟ้า หน้าเตาไม่ได้ร้อนด้วยตัวเอง ความร้อนที่ผิวหน้าเตาเกิดจากการถ่ายเทความร้อนย้อนกลับจากกระทะ',
    videoUrl: 'https://youtu.be/r-fe4eEqBEs'
  }
];

const Explanation: React.FC<ExplanationProps> = ({ observations, cerState, setCerState, onNext, onBack, isDarkMode }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string>(
    'ยินดีต้อนรับครับ! ลองสรุป CER เพื่อพิสูจน์ความเข้าใจของคุณดูนะครับ'
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeField, setActiveField] = useState<keyof CERState | null>(null);

  const handleOptionSelect = (option: string, label: string) => {
    setSelectedOption(option);
    const claimText = option === 'raw' 
      ? 'ชิปปี้จะได้กินไข่ดิบหลังจากที่เตาสามารถพิสูจน์ความร้อนในไข่ได้โดยตรง' 
      : `ชิปปี้จะได้กิน${label} เนื่องจากเตาแม่เหล็กไฟฟ้าไม่สามารถเหนี่ยวนำให้เกิดความร้อนในตัวไข่ได้โดยตรง`;
    
    setCerState(prev => ({ ...prev, claim: claimText }));
    
    if (option === 'raw') {
      setAiFeedback("ถูกต้องครับ! 'ไข่ดิบ' คือ Claim ที่สอดคล้องกับหลักฐาน");
    } else {
      setAiFeedback("ลองวิเคราะห์ดูนะว่าไข่สุกได้จริงหรือไม่ถ้าไม่มีภาชนะโลหะ?");
    }
  };

  const handleEvaluate = async () => {
    if (!cerState.reasoning) {
      setAiFeedback("กรุณาระบุ Reasoning ก่อนตรวจสอบนะครับ");
      return;
    }
    setIsEvaluating(true);
    try {
      const feedback = await evaluateReasoning(cerState.reasoning);
      setAiFeedback(feedback);
    } catch (error) {
      setAiFeedback("ขออภัยครับ เกิดข้อผิดพลาดในการวิเคราะห์ ลองใหม่อีกครั้งนะ");
    } finally {
      setIsEvaluating(false);
    }
  };

  const insertText = (field: keyof CERState, text: string) => {
    setCerState(prev => ({ ...prev, [field]: (prev[field] ? prev[field] + ' ' : '') + text }));
  };

  const trackingClass = "tracking-standard-15";

  const options = [
    { id: 'cooked', label: 'ไข่สุก', emoji: '❤️', bgColor: 'bg-rose-500' },
    { id: 'raw', label: 'ไข่ดิบ', emoji: '🥳', bgColor: 'bg-amber-400' },
    { id: 'palo', label: 'ไข่พะโล้', emoji: '😮', bgColor: 'bg-yellow-500' }
  ];

  return (
    <div className="min-h-0 flex-1 flex flex-col lg:flex-row p-4 lg:p-8 gap-8 overflow-y-auto lg:overflow-hidden relative bg-transparent animate-in slide-in-from-right-12 duration-500 pb-20 lg:pb-8">
      
      {/* Left Panel: Evaluation Dossier */}
      <div className={`flex-1 rounded-[2.5rem] p-6 lg:p-10 flex flex-col shadow-xl lg:overflow-y-auto scrollbar-hide border-2 transition-all duration-300 ${isDarkMode ? 'bg-[#0a0a0c]/80 border-white/5' : 'bg-white border-slate-950 shadow-[10px_10px_0px_#020617]'} ${activeField ? 'opacity-30 blur-sm' : ''}`}>
        <div className="mb-8 flex items-center space-x-6">
           <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl md:text-3xl shadow-lg shrink-0">⚡</div>
           <div>
              <h2 className={`text-xl md:text-3xl font-chakra font-black uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-950'} ${trackingClass}`}>Evaluation Dossier</h2>
              <span className={`text-xs md:text-sm font-chakra font-bold text-indigo-500 uppercase mt-1 block tracking-widest`}>Phase 05 • Evaluation</span>
           </div>
        </div>

        <div className="space-y-10 md:space-y-12">
          {/* Mission Scenario Card */}
          <div className="rounded-[3rem] overflow-hidden bg-[#FF4D4D] border-4 border-slate-950 shadow-[12px_12px_0px_#020617] p-8 md:p-10 lg:p-14 relative min-h-[450px] flex items-center">
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-8 md:gap-14 relative z-10 w-full">
              
              {/* Left Column: Massive Text Block */}
              <div className="flex-1 flex flex-col justify-center space-y-4 md:space-y-8">
                <div className="space-y-2">
                  <p className="font-chakra font-black text-3xl md:text-4xl lg:text-5xl text-white/95 uppercase tracking-tight leading-[1.05]">
                    ถ้าตอกไข่ใส่บนเตาแม่เหล็กไฟฟ้าเหนี่ยวนำโดยตรง ไข่จะสุกหรือไม่?
                  </p>
                  <h3 className="font-chakra font-black text-3xl md:text-4xl lg:text-5xl text-white uppercase tracking-tight leading-[1.05]">
                    ชิปปี้จะได้กิน...
                  </h3>
                </div>
                
                {/* Visual Question Mark */}
                <div className="text-[140px] md:text-[200px] lg:text-[240px] font-chakra font-black text-white/90 leading-none drop-shadow-2xl animate-pulse -ml-2 select-none">
                  ?
                </div>
              </div>

              {/* Right Column: High-Impact Selection Pills */}
              <div className="w-full md:w-[360px] flex flex-col justify-center gap-5 shrink-0">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt.id, opt.label)}
                    className={`group w-full h-20 md:h-24 bg-white rounded-[2rem] border-4 flex items-center p-3 transition-all transform active:scale-95 shadow-xl ${
                      selectedOption === opt.id 
                      ? 'border-indigo-600 ring-8 ring-white/20 -translate-x-4' 
                      : 'border-slate-950/10 hover:border-slate-950 hover:-translate-x-2'
                    }`}
                  >
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${opt.bgColor} flex items-center justify-center text-3xl md:text-4xl shadow-inner shrink-0 group-hover:rotate-6 transition-transform`}>
                      {opt.emoji}
                    </div>
                    <div className="flex-1 text-center font-chakra font-black text-3xl md:text-4xl text-slate-800 uppercase tracking-tight px-4">
                      {opt.label}
                    </div>
                    {selectedOption === opt.id && (
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

            </div>
            
            {/* Ambient Background Glows */}
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-black/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
          </div>

          {/* Evidence Logs Section */}
          <div className="space-y-8 pb-10">
             <div className="flex items-center gap-6 px-4">
                <span className="text-4xl">📝</span>
                <h4 className={`text-xl md:text-2xl font-chakra font-black uppercase tracking-widest ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>บันทึกหลักฐาน (Evidence Log)</h4>
             </div>
             
             <div className="grid grid-cols-1 gap-6">
                {EVIDENCE_LOGS.map((log) => (
                  <div key={log.id} className={`p-6 md:p-8 rounded-[2rem] border-2 transition-all space-y-6 ${isDarkMode ? 'bg-white/5 border-white/5 shadow-inner' : 'bg-white border-slate-950 shadow-[10px_10px_0px_#020617]'}`}>
                     <div className="flex flex-col md:flex-row items-center justify-between border-b-2 pb-4 border-current gap-4">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">🔎</span>
                          <h5 className={`font-chakra font-black text-sm md:text-lg uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>หลักฐานที่ {log.id}: {log.title}</h5>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <a 
                            href={log.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-chakra font-black text-xs md:text-sm uppercase tracking-widest transition-all ${isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            <span>Video</span>
                          </a>
                          {log.articleUrl && (
                            <a 
                              href={log.articleUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-chakra font-black text-xs md:text-sm uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20 border-2 border-white/10' : 'bg-white border border-slate-950 text-slate-950 hover:bg-slate-50'}`}
                            >
                              <span>Article</span>
                            </a>
                          )}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-[10px] md:text-xs uppercase font-black tracking-widest text-indigo-500 bg-indigo-500/10 w-fit px-4 py-1 rounded-full">Observation:</p>
                          <p className={`text-sm md:text-lg font-chakra font-bold italic leading-relaxed ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>"{log.obs}"</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] md:text-xs uppercase font-black tracking-widest text-emerald-500 bg-emerald-500/10 w-fit px-4 py-1 rounded-full">Reason:</p>
                          <p className={`text-xs md:text-base font-chakra font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{log.reason}</p>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel: CER Workspace */}
      <div className="w-full lg:w-[540px] max-w-full flex flex-col space-y-6 shrink-0">
        
        {/* PhyEM Analysis Box */}
        <div className={`rounded-[2rem] p-6 md:p-8 border-4 shadow-lg relative shrink-0 transition-all ${isDarkMode ? 'bg-black border-indigo-500/20 shadow-indigo-950/40' : 'bg-white border-slate-950 shadow-[12px_12px_0px_#4f46e5]'}`}>
          <div className="flex items-center space-x-6 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg font-chakra font-black text-2xl italic shrink-0">Phy</div>
            <div>
              <h3 className={`text-lg md:text-xl font-chakra font-black uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-950'} ${trackingClass}`}>PhyEM Analysis</h3>
              <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase mt-1 tracking-widest">AI Guided feedback</p>
            </div>
          </div>
          <div className={`p-6 rounded-[1.5rem] border-4 text-center font-chakra font-black italic text-sm md:text-xl leading-relaxed shadow-inner transition-all duration-500 flex items-center justify-center min-h-[100px] ${
            isEvaluating 
              ? 'animate-pulse bg-slate-800/50 text-slate-400 border-slate-700' 
              : (isDarkMode ? 'bg-yellow-500/10 text-yellow-200 border-yellow-500/20' : 'bg-yellow-400 text-slate-950 border-slate-950')
          }`}>
            {isEvaluating ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="flex gap-1">
                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                </div>
                <span className="uppercase tracking-widest text-xs font-black">กำลังประมวลผลด้วย AI... (Processing)</span>
              </div>
            ) : (
              <span className="animate-in fade-in duration-500">"{aiFeedback}"</span>
            )}
          </div>
        </div>

        {/* CER Input Area */}
        <div className={`flex-1 rounded-[2.5rem] p-6 md:p-10 space-y-10 border-4 shadow-xl lg:overflow-y-auto scrollbar-hide relative transition-all duration-300 ${isDarkMode ? 'bg-[#0a0a0c]/90 border-white/5' : 'bg-white border-slate-950'}`}>
          
          <div className={`space-y-4 transition-all ${activeField && activeField !== 'claim' ? 'opacity-30' : ''}`}>
             <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-chakra font-black text-xl shrink-0 shadow-md">C</div>
                <label className={`text-lg md:text-xl font-chakra font-black uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'} ${trackingClass}`}>ข้อเรียกร้อง (C)</label>
             </div>
             <textarea 
                value={cerState.claim}
                onFocus={() => setActiveField('claim')}
                onBlur={() => setActiveField(null)}
                onChange={(e) => setCerState(prev => ({ ...prev, claim: e.target.value }))}
                placeholder="👉 ชิปปี้จะได้กินไข่ดิบ..."
                className={`w-full p-6 rounded-[1.5rem] border-2 outline-none font-chakra font-bold text-base md:text-lg transition-all min-h-[100px] resize-none leading-relaxed ${isDarkMode ? 'bg-black text-white border-white/10 focus:border-blue-500 shadow-inner' : 'bg-slate-50 text-slate-950 border-slate-300 focus:border-blue-600'}`}
             />
          </div>

          <div className={`space-y-4 transition-all ${activeField && activeField !== 'evidence' ? 'opacity-30' : ''}`}>
             <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-chakra font-black text-xl shrink-0 shadow-md">E</div>
                <label className={`text-lg md:text-xl font-chakra font-black uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'} ${trackingClass}`}>หลักฐาน (E)</label>
             </div>
             <textarea 
                value={cerState.evidence}
                onFocus={() => setActiveField('evidence')}
                onBlur={() => setActiveField(null)}
                onChange={(e) => setCerState(prev => ({ ...prev, evidence: e.target.value }))}
                placeholder="👉 อ้างอิงหลักฐานจากบันทึก..."
                className={`w-full p-6 rounded-[1.5rem] border-2 outline-none font-chakra font-bold text-base md:text-lg transition-all min-h-[120px] resize-none leading-relaxed ${isDarkMode ? 'bg-black text-white border-white/10 focus:border-emerald-500 shadow-inner' : 'bg-slate-50 text-slate-950 border-slate-300 focus:border-emerald-600'}`}
             />
          </div>

          <div className={`space-y-4 transition-all ${activeField && activeField !== 'reasoning' ? 'opacity-30' : ''}`}>
             <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-chakra font-black text-xl shrink-0 shadow-md">R</div>
                <label className={`text-lg md:text-xl font-chakra font-black uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'} ${trackingClass}`}>เหตุผล (R)</label>
             </div>
             <textarea 
                value={cerState.reasoning}
                onFocus={() => setActiveField('reasoning')}
                onBlur={() => setActiveField(null)}
                onChange={(e) => setCerState(prev => ({ ...prev, reasoning: e.target.value }))}
                placeholder="👉 อธิบายด้วยหลักการฟิสิกส์..."
                className={`w-full p-6 rounded-[1.5rem] border-2 outline-none font-chakra font-bold text-base md:text-lg transition-all min-h-[200px] resize-none leading-relaxed ${isDarkMode ? 'bg-black text-white border-white/10 focus:border-indigo-500 shadow-inner' : 'bg-slate-50 text-slate-950 border-slate-300 focus:border-indigo-600'}`}
             />
             
             <div className="flex flex-col gap-4 pt-4">
                <p className="text-[10px] md:text-xs font-chakra font-black uppercase text-slate-500 tracking-[0.3em] ml-4">นักวิทยาศาสตร์เริ่มต้น (Starters)</p>
                <div className="grid grid-cols-1 gap-3">
                   {SCIENTIFIC_STARTERS.map((s, i) => (
                     <button 
                        key={i} 
                        onClick={() => insertText('reasoning', s)}
                        className={`text-left text-xs md:text-sm p-4 rounded-xl border-2 transition-all font-chakra font-bold leading-relaxed shadow-sm ${isDarkMode ? 'bg-white/5 border-white/10 text-white hover:bg-indigo-600 hover:border-indigo-600' : 'bg-white border-slate-200 text-slate-950 hover:bg-slate-950 hover:text-white hover:border-slate-950'}`}
                     >
                        {s}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="pt-8 border-t-4 border-white/5 flex flex-col space-y-6">
            <div className="flex gap-4">
              <button 
                onClick={onBack} 
                className={`flex-1 py-4 md:py-5 font-chakra font-black uppercase text-xs md:text-sm border-2 rounded-2xl transition-all ${isDarkMode ? 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10' : 'bg-white text-slate-500 border-slate-400 hover:text-black hover:border-slate-950'}`}
              >
                BACK
              </button>
              <button 
                onClick={handleEvaluate} 
                disabled={isEvaluating} 
                className={`flex-[2] py-4 md:py-5 font-chakra font-black rounded-2xl transition-all uppercase text-sm md:text-lg border-2 shadow-md ${isDarkMode ? 'bg-white text-slate-950 border-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600' : 'bg-slate-950 text-white border-slate-700 hover:bg-indigo-600 hover:border-indigo-600'}`}
              >
                {isEvaluating ? 'รอประมวลผล...' : 'Check CER'}
              </button>
            </div>
            
            <button 
              onClick={onNext}
              disabled={!cerState.claim || !cerState.evidence || !cerState.reasoning}
              className={`w-full py-6 md:py-8 rounded-[2rem] shadow-lg transition-all uppercase text-xl md:text-3xl font-chakra font-black flex items-center justify-center gap-4 ${
                (!cerState.claim || !cerState.evidence || !cerState.reasoning)
                ? 'bg-slate-800 text-slate-700 opacity-20' 
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:scale-[1.02] shadow-indigo-500/30'
              }`}
            >
              <span>SEND ANSWER</span>
              <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explanation;
