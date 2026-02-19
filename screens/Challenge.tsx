
import React, { useState } from 'react';
import InductionSimulation from '../components/InductionSimulation';

interface ChallengeProps {
  onStart: () => void;
  isDarkMode: boolean;
}

const Challenge: React.FC<ChallengeProps> = ({ onStart, isDarkMode }) => {
  const [table1, setTable1] = useState<Record<string, string>>({});
  const [table2, setTable2] = useState<Record<string, string>>({});
  const [analysis, setAnalysis] = useState('');
  
  const trackingClass = "tracking-standard-15";

  const handleTable1Change = (material: string, n: number, value: string) => {
    setTable1(prev => ({ ...prev, [`${material}-${n}`]: value }));
  };

  const handleTable2Change = (material: string, i: number, value: string) => {
    setTable2(prev => ({ ...prev, [`${material}-${i}`]: value }));
  };

  const downloadWorksheet = () => {
    const reportTitle = "ใบงานปฏิบัติการเสมือน : เตาแม่เหล็กไฟฟ้า (Induction Heating)";
    const timestamp = new Date().toLocaleString('th-TH');
    
    let content = `${reportTitle}\n`;
    content += `บันทึกเวลา: ${timestamp}\n`;
    content += `--------------------------------------------------\n\n`;
    
    content += `3.1 ทำไมภาชนะโลหะจึงร้อน แต่แก้วไม่ร้อน?\n`;
    content += `คำตอบ: ${analysis || "ไม่ได้ระบุ"}\n\n`;

    content += `2.1 ผลของชนิดวัสดุ (I = 10 A)\n`;
    content += `วัสดุ\t\tจำนวนขดลวด (รอบ)\tอุณหภูมิ (°C)\n`;
    [
      { name: 'เหล็ก (Iron)', turns: [40, 60, 80] },
      { name: 'สเตนเลส', turns: [40, 60, 80] },
      { name: 'แก้ว/ไข่ (ฉนวน)', turns: [40, 60, 80] }
    ].forEach(mat => {
      mat.turns.forEach(n => {
        const val = table1[`${mat.name}-${n}`] || " - ";
        content += `${mat.name}\t${n}\t\t\t${val}\n`;
      });
    });

    content += `\n2.2 ผลของชนิดวัสดุ (กำหนดให้ N = 210 รอบ)\n`;
    content += `วัสดุ\t\tกระแสไฟฟ้า (A)\t\tอุณหภูมิ (°C)\n`;
    [
      { name: 'เหล็ก (Iron)', amps: [10, 20, 30] },
      { name: 'สเตนเลส', amps: [10, 20, 30] },
      { name: 'แก้ว/ไข่ (ฉนวน)', amps: [10, 20, 30] }
    ].forEach(mat => {
      mat.amps.forEach(i => {
        const val = table2[`${mat.name}-${i}`] || " - ";
        content += `${mat.name}\t${i}\t\t\t${val}\n`;
      });
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PhyEM_Lab_Report_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full relative flex flex-col p-4 md:p-6 overflow-y-auto scrollbar-hide bg-transparent">
      <div className="max-w-[1600px] mx-auto w-full flex flex-col space-y-8 py-4">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className={`inline-flex items-center space-x-3 px-5 py-2 border-2 rounded-full ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-slate-50 border-slate-950'}`}>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            <span className={`text-[10px] font-chakra font-black uppercase ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'} ${trackingClass}`}>Phase 02: Exploration</span>
          </div>
          
          <h1 className={`text-3xl md:text-5xl font-chakra font-black leading-tight uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'} ${trackingClass}`}>
            หน้าสถานการณ์ปัญหา: <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-emerald-400 via-cyan-400 to-blue-500' : 'from-emerald-700 via-blue-800 to-indigo-900'}`}>The Challenge</span>
          </h1>
        </div>

        {/* --- 3.1 Analysis Hook (Moved to Top) --- */}
        <div className={`p-8 md:p-12 rounded-[3.5rem] border-4 shadow-2xl transition-all animate-in zoom-in-95 duration-700 ${isDarkMode ? 'bg-indigo-950/30 border-indigo-500/30 shadow-indigo-900/20' : 'bg-white border-slate-950 shadow-[12px_12px_0px_#4f46e5]'}`}>
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-14">
             <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-4 shrink-0">
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-[0_10px_30px_rgba(79,70,229,0.4)]">3.1</div>
                <h4 className={`font-chakra font-black text-2xl md:text-4xl uppercase leading-[1.1] max-w-[400px] ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                  ทำไมภาชนะโลหะจึงร้อน <br/> <span className="text-indigo-500">แต่แก้วไม่ร้อน?</span>
                </h4>
             </div>
             <div className="flex-1 w-full relative">
                <textarea 
                  value={analysis}
                  onChange={(e) => setAnalysis(e.target.value)}
                  placeholder="เขียนคำอธิบายด้วยหลักการฟิสิกส์ของคุณที่นี่... (เช่น Eddy Currents, Magnetic Induction)"
                  className={`w-full p-8 rounded-[2.5rem] border-4 font-chakra font-bold text-lg md:text-2xl outline-none min-h-[200px] transition-all shadow-inner focus:ring-8 focus:ring-indigo-500/10 ${isDarkMode ? 'bg-black/60 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-950 text-slate-950 focus:border-indigo-600'}`}
                />
                <div className="absolute bottom-6 right-8 text-[10px] font-chakra font-black uppercase text-indigo-500 tracking-widest opacity-40">Scientific Hypothesis Mode</div>
             </div>
          </div>
        </div>

        {/* Main Content Layout: Simulation (Left) + Worksheet (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">
          
          {/* Simulation Section (Left) */}
          <div className="space-y-6 flex flex-col">
             {/* Exploration Description */}
             <div className={`p-8 rounded-[3rem] border-2 shadow-xl ${isDarkMode ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-950 shadow-[8px_8px_0px_#10b981]'}`}>
                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                         <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div>
                         <h3 className={`font-chakra font-black text-xl uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>ใบกิจกรรมการสำรวจ</h3>
                         <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-none">สำรวจ Eddy Currents • ปรับ N • ทดลอง I</p>
                      </div>
                   </div>
                   <p className={`text-sm md:text-lg font-chakra font-bold leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                     ลองใช้เครื่องมือจำลองเพื่อตั้งสมมติฐานเกี่ยวกับการแผ่ความร้อน และระบุตัวแปรที่ส่งผลต่อการเหนี่ยวนำแม่เหล็กไฟฟ้าในวัสดุรอบตัวคุณ
                   </p>
                </div>
             </div>

             {/* Simulation Canvas Card */}
             <div className={`rounded-[3rem] overflow-hidden border-2 shadow-2xl flex flex-col flex-1 min-h-[500px] ${isDarkMode ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-950 shadow-[10px_10px_0px_#020617]'}`}>
                <div className={`h-14 flex items-center px-8 border-b shrink-0 ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-slate-50 border-slate-950/10'}`}>
                   <span className="text-[10px] font-chakra font-black uppercase tracking-widest text-slate-500">Simulation Setup: จำลองการวางวัตถุชนิดต่างๆ</span>
                </div>
                <div className="p-4 md:p-6 flex-1">
                   <InductionSimulation isDarkMode={isDarkMode} />
                </div>
             </div>
          </div>

          {/* Worksheet Section (Right) */}
          <div className="space-y-6 flex flex-col">
             {/* Data Sheets Section */}
             <div className={`rounded-[3rem] overflow-hidden border-2 shadow-2xl flex flex-col flex-1 ${isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white border-slate-950 shadow-[10px_10px_0px_#020617]'}`}>
                <div className={`h-14 flex items-center px-8 border-b justify-between shrink-0 ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-slate-50 border-slate-950/10'}`}>
                   <span className="text-[10px] font-chakra font-black uppercase tracking-widest text-slate-500">Data Sheet: บันทึกอุณหภูมิ</span>
                   <button 
                      onClick={downloadWorksheet}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-chakra font-black uppercase transition-all shadow-md ${isDarkMode ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
                   >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      <span>Download Report</span>
                   </button>
                </div>

                <div className="p-6 md:p-8 flex-1 overflow-y-auto scrollbar-hide space-y-12">
                   {/* Table 2.1 */}
                   <div className="space-y-4">
                      <h4 className={`font-chakra font-black text-base uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                        2.1 ผลของชนิดวัสดุ (I = 10 A)
                      </h4>
                      <div className={`overflow-x-auto rounded-[2rem] border-2 ${isDarkMode ? 'border-white/10' : 'border-slate-950'}`}>
                         <table className="w-full font-chakra text-sm border-collapse">
                            <thead>
                               <tr className={isDarkMode ? 'bg-white/10 text-slate-200' : 'bg-slate-950 text-white'}>
                                  <th className="p-4 border-r border-current text-center uppercase tracking-widest">วัสดุ</th>
                                  <th className="p-4 border-r border-current text-center uppercase tracking-widest">ขดลวด (รอบ)</th>
                                  <th className="p-4 text-center uppercase tracking-widest">อุณหภูมิ (°C)</th>
                               </tr>
                            </thead>
                            <tbody className={isDarkMode ? 'text-white' : 'text-slate-950'}>
                               {[
                                 { name: 'เหล็ก (Iron)', turns: [40, 60, 80] },
                                 { name: 'สเตนเลส', turns: [40, 60, 80] },
                                 { name: 'แก้ว/ไข่ (ฉนวน)', turns: [40, 60, 80] }
                               ].map((mat) => (
                                 <React.Fragment key={mat.name}>
                                   {mat.turns.map((n, idx) => (
                                     <tr key={`${mat.name}-${n}`} className="border-b border-current/10">
                                       {idx === 0 && <td rowSpan={3} className={`p-4 border-r border-current font-black text-center text-base ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>{mat.name}</td>}
                                       <td className={`p-4 border-r border-current text-center font-bold text-base ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{n}</td>
                                       <td className="p-4">
                                          <input 
                                             type="number" 
                                             value={table1[`${mat.name}-${n}`] || ''}
                                             onChange={(e) => handleTable1Change(mat.name, n, e.target.value)}
                                             placeholder="0.0"
                                             className={`w-full bg-transparent text-center outline-none font-black text-2xl text-indigo-600 ${isDarkMode ? 'placeholder:text-white/20' : 'placeholder:text-slate-300'}`}
                                          />
                                       </td>
                                     </tr>
                                   ))}
                                 </React.Fragment>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>

                   {/* Table 2.2 */}
                   <div className="space-y-4">
                      <h4 className={`font-chakra font-black text-base uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                        2.2 ผลของชนิดวัสดุ (กำหนดให้ N = 210 รอบ)
                      </h4>
                      <div className={`overflow-x-auto rounded-[2rem] border-2 ${isDarkMode ? 'border-white/10' : 'border-slate-950'}`}>
                         <table className="w-full font-chakra text-sm border-collapse">
                            <thead>
                               <tr className={isDarkMode ? 'bg-white/10 text-slate-200' : 'bg-slate-950 text-white'}>
                                  <th className="p-4 border-r border-current text-center uppercase tracking-widest">วัสดุ</th>
                                  <th className="p-4 border-r border-current text-center uppercase tracking-widest">กระแสไฟฟ้า (A)</th>
                                  <th className="p-4 text-center uppercase tracking-widest">อุณหภูมิ (°C)</th>
                               </tr>
                            </thead>
                            <tbody className={isDarkMode ? 'text-white' : 'text-slate-950'}>
                               {[
                                 { name: 'เหล็ก (Iron)', amps: [10, 20, 30] },
                                 { name: 'สเตนเลส', amps: [10, 20, 30] },
                                 { name: 'แก้ว/ไข่ (ฉนวน)', amps: [10, 20, 30] }
                               ].map((mat) => (
                                 <React.Fragment key={`t2-${mat.name}`}>
                                   {mat.amps.map((i, idx) => (
                                     <tr key={`t2-${mat.name}-${i}`} className="border-b border-current/10">
                                       {idx === 0 && <td rowSpan={3} className={`p-4 border-r border-current font-black text-center text-base ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>{mat.name}</td>}
                                       <td className={`p-4 border-r border-current text-center font-bold text-base ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{i}</td>
                                       <td className="p-4">
                                          <input 
                                             type="number" 
                                             value={table2[`${mat.name}-${i}`] || ''}
                                             onChange={(e) => handleTable2Change(mat.name, i, e.target.value)}
                                             placeholder="0.0"
                                             className={`w-full bg-transparent text-center outline-none font-black text-2xl text-indigo-600 ${isDarkMode ? 'placeholder:text-white/20' : 'placeholder:text-slate-300'}`}
                                          />
                                       </td>
                                     </tr>
                                   ))}
                                 </React.Fragment>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>

                   <div className="pt-6">
                      <button
                        onClick={onStart}
                        className={`w-full py-8 font-chakra font-black rounded-[2.5rem] transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-2xl flex items-center justify-center uppercase text-2xl border-4 ${isDarkMode ? 'bg-white text-slate-950 border-slate-950' : 'bg-slate-950 text-white border-slate-700'} ${trackingClass}`}
                      >
                        <span>ไปที่ขั้นถัดไป (Explore)</span>
                        <svg className="w-8 h-8 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </button>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Challenge;
