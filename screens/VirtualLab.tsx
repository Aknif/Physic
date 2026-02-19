
import React, { useState } from 'react';
import { VideoObservation } from '../types';

interface VirtualLabProps {
  onRecord: (result: VideoObservation) => void;
  onMaterialTest?: (material: string) => void;
  recordedData: VideoObservation[];
  onNext: () => void;
  isDarkMode: boolean;
}

const VirtualLab: React.FC<VirtualLabProps> = ({ onRecord, onMaterialTest, recordedData, onNext, isDarkMode }) => {
  const [note, setNote] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [aiMessage, setAiMessage] = useState('วิดีโอนี้จะแสดงการทดลองจริง สังเกตการเปลี่ยนแปลงที่เกิดขึ้นกับไข่และกระดาษฟอยล์ แล้วบันทึกสิ่งที่พบลงในช่องด้านล่างนะ');
  const trackingClass = "tracking-standard-15";

  const handleRecord = () => {
    if (!note.trim()) return;
    onRecord({
      id: Math.random().toString(36).substr(2, 9),
      text: note,
      timestamp: new Date()
    });
    setNote('');
    setIsFocused(false);
    setAiMessage('บันทึกข้อมูลหลักฐานเรียบร้อย! สามารถบันทึกเพิ่มเติมได้หากสังเกตพบประเด็นใหม่ๆ ครับ');
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-4 lg:p-6 gap-6 relative overflow-y-auto lg:overflow-hidden bg-transparent pb-10">
      <div className={`flex-1 flex flex-col space-y-4 transition-all duration-300 ${isFocused && window.innerWidth < 1024 ? 'opacity-20 blur-md h-20' : 'opacity-100 flex-1'}`}>
        <div className={`flex-1 relative rounded-[2.5rem] overflow-hidden border-2 shadow-2xl flex flex-col min-h-[300px] md:min-h-[450px] ${isDarkMode ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-950'}`}>
           <div className={`h-12 md:h-16 shrink-0 backdrop-blur-xl border-b flex items-center px-6 md:px-8 z-10 justify-between ${isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-slate-50/95 border-slate-950/10'}`}>
              <div className="flex items-center space-x-3">
                 <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                 <h2 className={`font-chakra font-black text-[10px] md:text-sm uppercase tracking-standard-15 ${isDarkMode ? 'text-cyan-400' : 'text-slate-950'}`}>
                   Experimental Video Observation
                 </h2>
              </div>
           </div>
           
           <div className="flex-1 p-2 md:p-6 h-full relative">
              {isVideoLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 backdrop-blur-sm transition-all duration-500">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                  </div>
                  <p className="mt-6 font-chakra font-black text-cyan-400 uppercase tracking-widest text-xs animate-pulse">
                    Initiating Video Stream...
                  </p>
                </div>
              )}
              <div className="w-full h-full rounded-2xl overflow-hidden bg-black border border-white/5 shadow-inner relative">
                <iframe 
                  src="https://edpuzzle.com/embed/media/6993185d86953f237625e5b0" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 'none' }}
                  onLoad={() => setIsVideoLoading(false)}
                  allowFullScreen
                ></iframe>
              </div>
           </div>
        </div>
      </div>

      <div className="w-full lg:w-[420px] flex flex-col space-y-4 md:space-y-6 z-10">
        <div className={`rounded-[2rem] p-6 md:p-8 flex flex-col shrink-0 border shadow-xl ${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-950'}`}>
           <div className="flex items-center space-x-4 mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
                 <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
              </div>
              <h4 className={`font-chakra font-black text-lg md:text-xl uppercase tracking-standard-15 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>PhyEM Guide</h4>
           </div>
           <p className={`text-sm md:text-base leading-tight font-chakra italic font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>"{aiMessage}"</p>
        </div>

        <div className={`flex-1 rounded-[2rem] p-6 md:p-8 flex flex-col shadow-2xl border transition-all duration-300 ${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-950'} ${isFocused ? 'ring-4 ring-indigo-500/20' : ''}`}>
           <div className="flex items-center justify-between mb-4 md:mb-6">
             <h3 className={`font-chakra font-black text-xl md:text-2xl uppercase tracking-standard-15 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Observations</h3>
             <div className="px-4 py-1.5 bg-indigo-600 rounded-lg shadow-lg">
                <span className="text-lg text-white font-chakra font-black">{recordedData.length}</span>
             </div>
           </div>
           
           <div className="space-y-4 md:space-y-6 flex-1 flex flex-col min-h-[150px]">
              <textarea 
                 value={note}
                 onFocus={() => setIsFocused(true)}
                 onBlur={() => setIsFocused(false)}
                 onChange={(e) => setNote(e.target.value)}
                 placeholder="👉 บันทึกสิ่งที่คุณเห็น เช่น หน้าเตาร้อนไหม? ไข่สุกในกระทะแต่ไม่สุกบนเตาโดยตรงเพราะอะไร?..."
                 className={`flex-1 w-full border-2 rounded-xl p-5 text-base md:text-lg font-bold font-chakra focus:border-indigo-500 outline-none transition-all resize-none leading-relaxed min-h-[120px] ${isDarkMode ? 'bg-black/40 text-white' : 'bg-slate-50 text-slate-950'} ${isFocused ? 'border-indigo-500 shadow-lg' : isDarkMode ? 'border-white/10' : 'border-slate-950/20'}`}
              />
              <button 
                 onClick={handleRecord}
                 disabled={!note.trim()}
                 className={`w-full py-4 md:py-6 rounded-xl font-chakra font-black text-lg md:text-xl uppercase transition-all shadow-xl border-2 ${note.trim() ? (isDarkMode ? 'bg-white text-slate-950 hover:scale-[1.02]' : 'bg-slate-950 text-white hover:scale-[1.02]') : 'bg-slate-800 text-slate-600 opacity-20'}`}
              >
                 บันทึกหลักฐาน
              </button>
           </div>
        </div>

        <button
          disabled={recordedData.length < 1}
          onClick={onNext}
          className={`w-full py-5 md:py-7 rounded-2xl font-chakra font-black text-lg md:text-xl uppercase transition-all flex items-center justify-center gap-4 ${recordedData.length >= 1 ? 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white hover:scale-[1.02] shadow-2xl border-2 border-slate-950' : 'bg-slate-900 text-slate-700 opacity-40'} tracking-standard-15`}
        >
          <span>Next: Elaborate</span>
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </button>
      </div>
    </div>
  );
};

export default VirtualLab;
