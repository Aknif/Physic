
import React, { useState, useRef } from 'react';
import { Screen } from '../types';

interface ResourceHubProps {
  onNavigate: (screen: Screen) => void;
  onNext: () => void;
  onOpenChat: () => void;
  isDarkMode: boolean;
}

type SimSource = 'phet' | 'javalab';

const ResourceHub: React.FC<ResourceHubProps> = ({ onNavigate, onNext, onOpenChat, isDarkMode }) => {
  const [showCERModal, setShowCERModal] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState<string | null>(null);
  const [showReadinessCheck, setShowReadinessCheck] = useState(false);
  const [activeSim, setActiveSim] = useState<SimSource>('phet');
  
  const topRef = useRef<HTMLDivElement>(null);
  const cerSectionRef = useRef<HTMLElement>(null);
  
  const trackingClass = "tracking-standard-15";

  const simUrls = {
    phet: "https://phet.colorado.edu/sims/html/faradays-electromagnetic-lab/latest/faradays-electromagnetic-lab_all.html",
    javalab: "https://javalab.org/en/faradays_law_en/"
  };

  const scientificDocs = [
    {
      id: 'doc1',
      title: 'การเหนี่ยวนำและความร้อนในไข่',
      subtitle: 'Induction & Thermal Response',
      content: 'เตาแม่เหล็กไฟฟ้าสร้างสนามแม่เหล็กไฟฟ้าสลับ ซึ่งจะเหนี่ยวนำให้เกิดกระแสไฟฟ้าวน (eddy currents) ได้เฉพาะในวัสดุที่มีสมบัติเป็นสารแม่เหล็ก เช่น เหล็กหรือโลหะบางชนิด ไข่ซึ่งไม่ใช่วัสดุแม่เหล็กจึงไม่เกิดกระแสไฟฟ้าวนและไม่เกิดความร้อนแม้จะวางอยู่บนหน้าเตาโดยตรง',
      icon: '🍳'
    },
    {
      id: 'doc2',
      title: 'วัสดุฉนวนกับสนามแม่เหล็ก',
      subtitle: 'Insulators in EM Fields',
      content: 'แก้วและเซรามิกเป็นวัสดุฉนวนและไม่เป็นสารแม่เหล็ก (non-ferromagnetic materials) สนามแม่เหล็กไฟฟ้าจากเตาจึงไม่สามารถเหนี่ยวนำให้เกิดกระแสไฟฟ้าวนได้ เมื่อไม่เกิดกระแสไฟฟ้าวน พลังงานไฟฟ้าจึงไม่ถูกเปลี่ยนเป็นพลังงานความร้อนในวัสดุเหล่านี้',
      icon: '💎'
    },
    {
      id: 'doc3',
      title: 'ความร้อนสะท้อน (Heat Transfer)',
      subtitle: 'Secondary Heating Effect',
      content: 'หน้าเตาแม่เหล็กไฟฟ้าไม่ได้ร้อนด้วยตัวเอง ความร้อนที่ผิวหน้าเตาที่เกิดขึ้นหลังจากทำอาหารเสร็จ เกิดจากการถ่ายเทความร้อนย้อนกลับ (Conduction) จากภาชนะโลหะที่ร้อนมาสู่หน้ากระจกเซรามิกเท่านั้น',
      icon: '🔥'
    }
  ];

  const strategies = [
    {
      id: 'strat1',
      title: 'Magnetic Flux Analysis',
      label: 'กลยุทธ์การวิเคราะห์ฟลักซ์',
      icon: '🧲',
      color: 'from-cyan-500 to-blue-600',
      tips: [
        'ใน PhET Lab: ลองใช้เข็มทิศ (Compass) ตรวจสอบความหนาแน่นของเส้นแรงแม่เหล็ก',
        'สังเกตว่าระยะห่างจากขดลวด (Coil) ส่งผลต่อความแรงของสนามอย่างไร',
        'ยิ่งขดลวดมีจำนวนรอบ (N) มากขึ้น สนามแม่เหล็กจะยิ่งเข้มข้นขึ้น'
      ]
    },
    {
      id: 'strat2',
      title: 'Inductive Logic',
      label: 'กลยุทธ์ตรรกะการเหนี่ยวนำ',
      icon: '💡',
      color: 'from-amber-400 to-orange-600',
      tips: [
        'ใน Java Lab: สังเกตการเปลี่ยนทิศทางของกระแสไฟฟ้าเมื่อแม่เหล็กเคลื่อนที่',
        'เชื่อมโยง: การสลับขั้วแม่เหล็กอย่างรวดเร็วในเตาจริง คือการ "สั่น" ของสนามแม่เหล็ก',
        'ทำไมไข่ถึงไม่เกิดกระแส? เพราะไข่ไม่มีอิเล็กตรอนอิสระที่เคลื่อนที่ตามแรงแม่เหล็กได้'
      ]
    },
    {
      id: 'strat3',
      title: 'Evidence Harvesting',
      label: 'กลยุทธ์การเก็บหลักฐาน',
      icon: '📊',
      color: 'from-indigo-500 to-purple-600',
      tips: [
        'สังเกตความแตกต่าง: วัสดุแม่เหล็ก (Ferromagnetic) vs วัสดุทั่วไป',
        'ใช้ PhET ทดลองวาง "แก้ว" ในสนามแม่เหล็กเปรียบเทียบกับ "เหล็ก"',
        'จดบันทึกค่าการเบี่ยงเบนของเข็มมิเตอร์ใน Java Lab เมื่อความเร็วในการเคลื่อนที่เปลี่ยน'
      ]
    }
  ];

  const cerDetails = [
    {
      title: 'Claim (C)',
      subtitle: 'คำตอบหรือข้อสรุป',
      desc: 'คือการสร้างคำตอบหรือข้อสรุปที่ได้จากการทดลองหรือจากการทำกิจกรรม เพื่อตอบปัญหาที่ศึกษา โดยต้องมีความชัดเจนและตรงประเด็น',
      icon: '🎯'
    },
    {
      title: 'Evidence (E)',
      subtitle: 'หลักฐานสนับสนุน',
      desc: 'ข้อมูลที่เก็บรวบรวมจากการทดลองหรือการสังเกต โดยหลักฐานต้องมีความสอดคล้อง และมากเพียงพอที่จะสนับสนุนคำตอบให้มีความน่าเชื่อถือ',
      icon: '📊'
    },
    {
      title: 'Reasoning (R)',
      subtitle: 'การให้เหตุผล',
      desc: 'สิ่งที่แสดงความสัมพันธ์อย่างสมเหตุสมผลระหว่าง Claim และ Evidence โดยแสดงให้เห็นว่าเพราะเหตุใดหลักฐานนั้นถึงเหมาะสมในการนำมาสนับสนุนคำตอบ โดยอาศัยหลักการทางวิทยาศาสตร์ประกอบ',
      icon: '💡'
    }
  ];

  const handleReturnToCER = () => {
    setShowReadinessCheck(false);
    if (cerSectionRef.current) {
      cerSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-transparent p-6 md:p-10 pb-48 scrollbar-hide relative">
      <div ref={topRef} className="absolute top-0 left-0" />
      
      {/* 📂 CER Summary Modal */}
      {showCERModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className={`max-w-4xl w-full h-[85vh] overflow-y-auto rounded-[3.5rem] p-8 md:p-16 border-4 shadow-2xl relative ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-950 text-slate-950'}`}>
              <button onClick={() => setShowCERModal(false)} className="absolute top-8 right-8 p-4 hover:bg-red-500 hover:text-white rounded-full transition-all z-20">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <span className="text-indigo-500 font-chakra font-black text-sm uppercase tracking-widest">Scientific Process Help</span>
                  <h2 className="text-3xl md:text-5xl font-chakra font-black uppercase text-indigo-600 tracking-tighter">คู่มือกระบวนการ CER</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {cerDetails.map((item, i) => (
                    <div key={i} className={`p-8 rounded-[2.5rem] border-2 flex flex-col space-y-4 ${isDarkMode ? 'bg-black/40 border-white/5 shadow-inner' : 'bg-indigo-50 border-indigo-100 shadow-sm'}`}>
                      <div className="text-5xl">{item.icon}</div>
                      <h3 className="text-xl font-chakra font-black text-indigo-600 uppercase">{item.title}</h3>
                      <p className={`text-xs font-chakra font-medium leading-relaxed opacity-70 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        </div>
      )}

      {/* 🚀 Strategy Vault Modal (NEW CONTENT) */}
      {showStrategyModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className={`max-w-5xl w-full h-[85vh] overflow-y-auto rounded-[3.5rem] p-8 md:p-16 border-4 shadow-2xl relative ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-950 text-slate-950'}`}>
              <button onClick={() => setShowStrategyModal(false)} className="absolute top-8 right-8 p-4 hover:bg-red-500 hover:text-white rounded-full transition-all z-20">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <span className="text-cyan-500 font-chakra font-black text-sm uppercase tracking-widest">Scientific Strategy Vault</span>
                  <h2 className="text-3xl md:text-5xl font-chakra font-black uppercase text-cyan-600 tracking-tighter">คลังกลยุทธ์การพิสูจน์ฟิสิกส์</h2>
                  <p className="font-chakra font-bold opacity-50">ใช้กลยุทธ์เหล่านี้ร่วมกับ PhET และ Java Lab เพื่อหาคำตอบ</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {strategies.map((strat) => (
                    <div key={strat.id} className={`rounded-[3rem] border-4 p-8 flex flex-col space-y-6 transition-all hover:scale-105 ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white border-slate-950 shadow-xl'}`}>
                       <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${strat.color} flex items-center justify-center text-3xl shadow-lg border-2 border-white/20`}>
                          {strat.icon}
                       </div>
                       <div>
                          <h4 className="font-chakra font-black text-xl uppercase tracking-tight leading-none mb-1">{strat.title}</h4>
                          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">{strat.label}</span>
                       </div>
                       <div className="space-y-4 flex-1">
                          {strat.tips.map((tip, idx) => (
                             <div key={idx} className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
                                <p className="text-xs font-chakra font-bold leading-relaxed opacity-70">{tip}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                  ))}
                </div>

                <div className={`p-10 rounded-[2.5rem] border-4 text-center space-y-4 ${isDarkMode ? 'bg-indigo-600/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                   <h5 className="font-chakra font-black text-xl uppercase text-indigo-600">Pro Tip: สังเกตสิ่งที่ "ไม่เกิดขึ้น"</h5>
                   <p className="font-chakra font-bold text-sm max-w-2xl mx-auto opacity-70">
                     บ่อยครั้งที่หลักฐานที่ดีที่สุดคือการที่วัตถุ "ไม่ตอบสนอง" เช่น การวางแก้วในสนามแม่เหล็กแล้วเข็มมิเตอร์ไม่กระดิก 
                     นั่นคือหลักฐานสำคัญ (Evidence) ที่ใช้ยืนยันว่าวัสดุนั้นไม่เกิดการเหนี่ยวนำ!
                   </p>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* 📄 Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-300">
           <div className={`max-w-3xl w-full rounded-[3.5rem] p-10 md:p-14 border-4 shadow-2xl relative ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-950 text-slate-950'}`}>
              <button onClick={() => setShowDocModal(null)} className="absolute top-8 right-8 p-4 hover:bg-red-500 hover:text-white rounded-full transition-all z-20">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              {scientificDocs.find(d => d.id === showDocModal) && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="text-6xl">{scientificDocs.find(d => d.id === showDocModal)?.icon}</div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-chakra font-black uppercase text-indigo-500 leading-none mb-1">{scientificDocs.find(d => d.id === showDocModal)?.title}</h3>
                      <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40">{scientificDocs.find(d => d.id === showDocModal)?.subtitle}</p>
                    </div>
                  </div>
                  <div className={`p-8 rounded-[2rem] border-2 font-chakra font-bold text-lg leading-relaxed ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    {scientificDocs.find(d => d.id === showDocModal)?.content}
                  </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Readiness Check Modal */}
      {showReadinessCheck && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className={`max-w-2xl w-full rounded-[3.5rem] p-10 md:p-14 border-4 shadow-2xl text-center space-y-10 ${isDarkMode ? 'bg-slate-900 border-indigo-500/30' : 'bg-white border-slate-950'}`}>
              <h2 className={`text-3xl md:text-4xl font-chakra font-black uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>พร้อมทำแบบทดสอบ CER แล้วใช่หรือไม่?</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <button onClick={handleReturnToCER} className="flex-1 py-5 rounded-2xl font-chakra font-black uppercase text-lg border-2 border-current opacity-40 hover:opacity-100 transition-all">ยังไม่พร้อม</button>
                <button onClick={onNext} className="flex-1 py-5 rounded-2xl font-chakra font-black uppercase text-lg bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 transition-all">พร้อมไปต่อ</button>
              </div>
           </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className={`inline-flex items-center space-x-3 px-6 py-2 border-2 rounded-full ${isDarkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-950 text-white border-slate-950'}`}>
            <span className={`text-xs font-chakra font-black uppercase tracking-[0.5em] ${trackingClass}`}>Step 04: Elaboration Hub</span>
          </div>
          <h2 className={`text-5xl md:text-8xl font-chakra font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-950'} ${trackingClass}`}>
            Deep <span className="text-indigo-600">Elaborate</span>
          </h2>
        </div>

        {/* 🚀 Simulator Hub: Toggle between external sims */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-6 border-l-8 border-cyan-500 pl-8">
              <div>
                <h3 className={`text-3xl md:text-5xl font-chakra font-black uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>01 Advanced Simulator Hub</h3>
                <p className="text-sm font-bold uppercase tracking-widest text-cyan-500 mt-2">PhET Faraday • Java Lab Law</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
            {/* Simulation Canvas Wrapper */}
            <div className="xl:col-span-9 group relative">
               <div className={`rounded-[4rem] overflow-hidden border-4 shadow-2xl transition-all duration-500 flex flex-col ${isDarkMode ? 'bg-slate-950 border-white/10 shadow-cyan-900/10' : 'bg-white border-slate-950 shadow-[20px_20px_0px_#06b6d4]'}`}>
                  {/* Dashboard Style Header with Tabs */}
                  <div className={`h-20 flex flex-col md:flex-row items-center px-4 md:px-10 border-b shrink-0 ${isDarkMode ? 'bg-slate-900/80 border-white/5' : 'bg-slate-50 border-slate-950/10'}`}>
                     <div className="flex-1 flex gap-2 md:gap-4 overflow-x-auto no-scrollbar w-full md:w-auto py-2">
                        {[
                          { id: 'phet', label: 'PhET Faraday', icon: '🌌' },
                          { id: 'javalab', label: 'Java Lab Law', icon: '⚙️' }
                        ].map(sim => (
                          <button
                            key={sim.id}
                            onClick={() => setActiveSim(sim.id as SimSource)}
                            className={`px-4 md:px-6 py-2 rounded-full font-chakra font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap border-2 ${
                              activeSim === sim.id 
                                ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                                : isDarkMode ? 'bg-white/5 text-slate-500 border-transparent hover:text-white' : 'bg-white text-slate-400 border-slate-200'
                            }`}
                          >
                            <span>{sim.icon}</span>
                            {sim.label}
                          </button>
                        ))}
                     </div>
                     <div className="hidden md:flex items-center gap-4 pl-6 border-l border-white/10">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[9px] font-chakra font-black uppercase tracking-widest opacity-40">External Labs Live</span>
                     </div>
                  </div>

                  <div className="flex-1 relative min-h-[500px] md:min-h-[700px] bg-black">
                    <div className="w-full h-full animate-in fade-in duration-700">
                      <iframe 
                        src={simUrls[activeSim as keyof typeof simUrls]}
                        className="w-full h-full min-h-[500px] md:min-h-[700px]"
                        style={{ border: 'none' }}
                        allowFullScreen
                      />
                      <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between text-white">
                          <div className="flex items-center gap-4">
                            <span className="text-xl">⚠️</span>
                            <p className="text-[10px] font-chakra font-bold uppercase tracking-widest opacity-70">
                              แหล่งข้อมูลภายนอก: {activeSim === 'phet' ? 'PhET Colorado' : 'JavaLab Interactive'}
                            </p>
                          </div>
                          <a 
                            href={simUrls[activeSim as keyof typeof simUrls]} 
                            target="_blank" 
                            rel="noreferrer"
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-chakra font-black uppercase transition-all"
                          >
                            Open in New Tab
                          </a>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Scientific Archive (Side Panel) */}
            <div className="xl:col-span-3 flex flex-col gap-8">
               <div className={`flex-1 p-8 md:p-10 rounded-[3.5rem] border-4 flex flex-col space-y-8 ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-950 shadow-[15px_15px_0px_#10b981]'}`}>
                  <div className="flex items-center gap-4 border-b pb-6 border-current/10">
                    <span className="text-4xl">📚</span>
                    <h4 className={`text-2xl font-chakra font-black uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Archive</h4>
                  </div>
                  
                  <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                    {scientificDocs.map((doc) => (
                      <button 
                        key={doc.id}
                        onClick={() => setShowDocModal(doc.id)}
                        className={`w-full p-6 rounded-3xl border-2 flex items-center gap-5 transition-all hover:scale-105 text-left ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-indigo-600 hover:text-white' : 'bg-white border-slate-200 hover:border-indigo-600'}`}
                      >
                        <span className="text-3xl">{doc.icon}</span>
                        <div>
                          <h5 className="font-chakra font-black text-[10px] uppercase leading-none mb-1">{doc.title}</h5>
                          <p className="text-[9px] opacity-40 uppercase font-bold tracking-widest">{doc.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className={`p-6 rounded-[2.5rem] border-2 text-center ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                    <p className={`text-[11px] font-chakra font-bold leading-relaxed ${isDarkMode ? 'text-indigo-200' : 'text-indigo-900'}`}>
                      "วิเคราะห์สนามแม่เหล็กด้วย PhET และตรวจสอบทฤษฎีใน Archive เพื่อทำความเข้าใจกฎของฟาราเดย์"
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="space-y-12">
           <div className="flex items-center gap-4 border-l-8 border-rose-500 pl-8">
              <div>
                <h3 className={`text-3xl md:text-5xl font-chakra font-black uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>02 ศูนย์ช่วยเหลือเเละกลยุทธ์</h3>
              </div>
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              {/* Process Support Module */}
              <div className={`p-10 rounded-[3.5rem] border-4 flex flex-col space-y-8 relative overflow-hidden transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-[#0a0a0c] border-indigo-500/20 shadow-indigo-500/10' : 'bg-white border-slate-950 shadow-[15px_15px_0px_#4f46e5]'}`}>
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shrink-0">
                       <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <h4 className={`text-2xl md:text-3xl font-chakra font-black uppercase ${isDarkMode ? 'text-indigo-400' : 'text-indigo-900'}`}>ศูนย์ช่วยเหลือด้านกระบวนการ</h4>
                 </div>
                 <button onClick={() => setShowCERModal(true)} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-chakra font-black uppercase text-sm shadow-lg hover:bg-indigo-500 transition-all">ดูคู่มือกระบวนการ CER</button>
              </div>

              {/* Strategy Support Module (ADJUSTED) */}
              <div className={`p-10 rounded-[3.5rem] border-4 flex flex-col space-y-8 relative overflow-hidden transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-[#0a0a0c] border-cyan-500/20 shadow-cyan-500/10' : 'bg-white border-slate-950 shadow-[15px_15px_0px_#06b6d4]'}`}>
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-xl shrink-0">
                       <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" /></svg>
                    </div>
                    <div>
                       <h4 className={`text-2xl md:text-3xl font-chakra font-black uppercase ${isDarkMode ? 'text-cyan-400' : 'text-cyan-900'}`}>ศูนย์ช่วยเหลือด้านกลยุทธ์</h4>
                       <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500/60 block mt-1">Physics Investigation Strategy</span>
                    </div>
                 </div>

                 <div className="space-y-4 flex-1">
                    <p className="text-xs font-chakra font-bold opacity-60">Scientific Approaches:</p>
                    <div className="grid grid-cols-1 gap-3">
                       <div className={`flex items-center gap-4 p-4 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                          <span className="text-lg">🎯</span>
                          <span className="text-xs font-chakra font-black uppercase">วิเคราะห์ N & I vs B-Field Intensity</span>
                       </div>
                       <div className={`flex items-center gap-4 p-4 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                          <span className="text-lg">⚡</span>
                          <span className="text-xs font-chakra font-black uppercase">พิสูจน์การเหนี่ยวนำด้วย Eddy Currents</span>
                       </div>
                    </div>
                 </div>

                 <button onClick={() => setShowStrategyModal(true)} className="w-full py-5 bg-cyan-600 text-white rounded-3xl font-chakra font-black uppercase text-sm shadow-lg hover:bg-cyan-500 transition-all border-b-4 border-cyan-800">เปิดคลังกลยุทธ์ฟิสิกส์ (Open Strategy Vault)</button>
              </div>
           </div>
        </section>

        {/* Action Link to Chat */}
        <div className={`p-10 rounded-[4rem] border-4 flex flex-wrap items-center justify-between gap-10 ${isDarkMode ? 'bg-black border-indigo-500/10' : 'bg-slate-50 border-slate-950 shadow-xl'}`}>
           <div className="flex items-center gap-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black italic shadow-lg text-2xl">Phy</div>
              <div>
                 <h5 className={`font-chakra font-black text-2xl uppercase leading-none mb-2 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>ต้องการไกด์ไลน์เพิ่มเติม?</h5>
                 <p className="text-sm font-chakra font-bold opacity-50 uppercase tracking-[0.2em]">Connect with PhyEM AI Guide (No Spoilers!)</p>
              </div>
           </div>
           <button onClick={onOpenChat} className="px-16 py-5 bg-indigo-600 text-white rounded-[2rem] font-chakra font-black uppercase text-sm tracking-widest shadow-xl hover:scale-105 transition-all">Chat with Guide</button>
        </div>

        {/* Final Navigation Action */}
        <div className="pt-10 flex justify-center pb-24">
           <button 
              onClick={() => setShowReadinessCheck(true)}
              className={`px-20 py-10 rounded-[4rem] bg-emerald-600 text-white font-chakra font-black text-3xl md:text-5xl uppercase shadow-[0_30px_60px_-15px_rgba(16,185,129,0.5)] hover:scale-110 active:scale-95 transition-all flex items-center gap-12 border-4 border-white/20`}
           >
              <span>ทำเเบบทดสอบ CER</span>
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
           </button>
        </div>

      </div>
    </div>
  );
};

export default ResourceHub;
