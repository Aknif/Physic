
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StudentReport } from '../types';
import * as XLSX from 'xlsx';

interface AdminReportProps {
  isDarkMode: boolean;
}

const AdminReport: React.FC<AdminReportProps> = ({ isDarkMode }) => {
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1EpMn4GJ0Wp2gj1u1wTYwREn04nWumgOB?usp=sharing";

  const loadLocalReports = useCallback(() => {
    const saved = localStorage.getItem('phyem_student_reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const sorted = parsed.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setReports(sorted);
      } catch (e) {
        console.error("Failed to parse local reports", e);
      }
    }
  }, []);

  useEffect(() => {
    loadLocalReports();
    window.addEventListener('storage', loadLocalReports);
    return () => window.removeEventListener('storage', loadLocalReports);
  }, [loadLocalReports]);

  const clearDatabase = () => {
    if (window.confirm("⚠️ ยืนยันการลบข้อมูลทั้งหมดถาวร?")) {
      localStorage.removeItem('phyem_student_reports');
      setReports([]);
      setCopyStatus("ล้างฐานข้อมูลสำเร็จ");
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const importedReports: StudentReport[] = [];
    const processFile = (file: File): Promise<void> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

        reader.onload = (event) => {
          try {
            if (isExcel) {
              const data = new Uint8Array(event.target?.result as ArrayBuffer);
              const workbook = XLSX.read(data, { type: 'array' });
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              const json = XLSX.utils.sheet_to_json(worksheet) as any[];

              json.forEach((row: any, idx) => {
                const studentId = row['รหัสนักเรียน'] || row['Student ID'] || row['ID'] || `EXL-${idx}`;
                const userName = row['ชื่อ-นามสกุล'] || row['Name'] || 'Unknown Student';
                importedReports.push({
                  id: `exl-${Date.now()}-${idx}`,
                  studentId: String(studentId),
                  userName: String(userName),
                  score: Number(row['คะแนนรวม (%)'] || row['Score'] || 0),
                  quizScore: Number(row['คะแนนควิซ (/5)']?.toString().split('/')[0] || 0),
                  totalQuizQuestions: 5,
                  collaborationBonus: Number(row['โบนัสตอบเพื่อน'] || 0),
                  observationsCount: Number(row['จำนวนบันทึก VDO'] || 0),
                  observationNotes: row['บันทึกรายละเอียด'] ? String(row['บันทึกรายละเอียด']).split(' | ') : [],
                  materialsTested: row['วัสดุที่ทดลองทั้งหมด'] ? String(row['วัสดุที่ทดลองทั้งหมด']).split(', ') : [],
                  starRating: Number(row['ความพึงพอใจ (ดาว)'] || 5),
                  feedbackComment: String(row['ความคิดเห็นเพิ่มเติม'] || ''),
                  questionsAsked: row['คำถาม AI ทั้งหมด'] ? Array(Number(row['คำถาม AI ทั้งหมด']) || 0).fill('Imported Question') : [],
                  timestamp: row['วันที่ส่งข้อมูล'] || new Date().toISOString(),
                  cer: {
                    claim: String(row['Claim (CER)'] || ''),
                    evidence: String(row['Evidence (CER)'] || ''),
                    reasoning: String(row['Reasoning (CER)'] || ''),
                  },
                  aiFeedback: ""
                });
              });
            }
          } catch (err) { console.error(err); }
          resolve();
        };
        if (isExcel) reader.readAsArrayBuffer(file);
        else reader.readAsText(file);
      });
    };

    const fileList = Array.from(files) as File[];
    for (const file of fileList) { await processFile(file); }

    if (importedReports.length > 0) {
      setReports(prev => {
        const combined = [...importedReports, ...prev];
        const unique = combined.filter((v, i, a) => a.findIndex(t => (t.studentId === v.studentId && t.timestamp === v.timestamp)) === i);
        localStorage.setItem('phyem_student_reports', JSON.stringify(unique));
        return unique;
      });
      setCopyStatus(`นำเข้าสำเร็จ ${importedReports.length} รายการ`);
      setTimeout(() => setCopyStatus(null), 3000);
    }
    e.target.value = '';
  };

  const exportToExcel = () => {
    if (reports.length === 0) return;
    const dataToExport = reports.map((r, idx) => ({
      'ลำดับ (No.)': idx + 1,
      'รหัสนักเรียน (ID)': r.studentId,
      'ชื่อ-นามสกุล (Name)': r.userName,
      'คะแนนรวม (%)': r.score,
      'คะแนนควิซ (Quiz)': `${r.quizScore}/${r.totalQuizQuestions}`,
      'โบนัสตอบเพื่อน (Bonus)': r.collaborationBonus,
      'วัสดุที่ทดลอง': r.materialsTested.join(', '),
      'บันทึก VDO': r.observationNotes?.join(' | ') || '-',
      'CER: Claim': r.cer.claim,
      'CER: Evidence': r.cer.evidence,
      'CER: Reasoning': r.cer.reasoning,
      'จำนวนคำถาม AI': r.questionsAsked.length,
      'ความพึงพอใจ (Rating)': r.starRating,
      'ข้อความเพิ่มเติม': r.feedbackComment,
      'วันเวลาที่ส่งข้อมูล': new Date(r.timestamp).toLocaleString('th-TH')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Set column widths for better readability
    const wscols = [
      {wch: 10}, {wch: 20}, {wch: 25}, {wch: 15}, {wch: 15}, {wch: 15}, 
      {wch: 30}, {wch: 40}, {wch: 50}, {wch: 50}, {wch: 60}, 
      {wch: 15}, {wch: 15}, {wch: 30}, {wch: 25}
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PhyEM_Report");
    XLSX.writeFile(workbook, `PhyEM_Master_Data_${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}.xlsx`);
    setCopyStatus("ส่งออกไฟล์สำเร็จ");
    setTimeout(() => setCopyStatus(null), 2500);
  };

  const filteredReports = useMemo(() => {
    return reports.filter(r => 
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.studentId.includes(searchTerm)
    );
  }, [reports, searchTerm]);

  const analytics = useMemo(() => {
    if (reports.length === 0) return { total: 0, avgScore: 0, avgSat: 0 };
    const total = reports.length;
    const avgScore = reports.reduce((acc, curr) => acc + (curr.score || 0), 0) / total;
    const avgSat = reports.reduce((acc, curr) => acc + (curr.starRating || 0), 0) / total;
    return { total, avgScore, avgSat };
  }, [reports]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode === '123') setIsAuthenticated(true);
    else setError(true);
  };

  if (!isAuthenticated) {
    return (
      <div className={`h-full flex items-center justify-center p-6 ${isDarkMode ? 'bg-[#020617]' : 'bg-slate-50'}`}>
        <div className={`max-w-md w-full rounded-[3rem] p-12 border-4 shadow-2xl text-center space-y-8 ${isDarkMode ? 'bg-slate-900 border-indigo-500/20' : 'bg-white border-slate-950'}`}>
          <div className="text-6xl mb-4">🔐</div>
          <h2 className={`text-3xl font-chakra font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Master Access</h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              type="password" value={inputCode} onChange={(e) => setInputCode(e.target.value)}
              placeholder="ENTER PASSCODE" className={`w-full border-4 rounded-2xl py-6 text-center font-chakra text-3xl outline-none focus:border-indigo-500 transition-all ${isDarkMode ? 'bg-black text-white border-white/10' : 'bg-slate-50 border-slate-950 text-slate-950'}`} autoFocus
            />
            {error && <p className="text-red-500 font-bold uppercase text-xs">Passcode ไม่ถูกต้อง!</p>}
            <button type="submit" className="w-full py-6 bg-indigo-600 text-white font-chakra font-black uppercase rounded-2xl shadow-xl border-b-8 border-indigo-900">Unlock Master Board</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-y-auto p-4 md:p-8 pb-40 scrollbar-hide ${isDarkMode ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      <div className="max-w-[2400px] mx-auto space-y-8">
        
        {/* --- PREMIUM HEADER STATS BAR --- */}
        <div className={`p-8 rounded-[3.5rem] border-4 flex flex-wrap items-center justify-between gap-10 relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-white/5 shadow-2xl shadow-indigo-500/10' : 'bg-white border-slate-950 shadow-[15px_15px_0px_#4f46e5]'}`}>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

          <div className="flex flex-wrap gap-12 flex-1">
            <div className="flex flex-col group transition-transform hover:scale-105">
              <span className="text-[11px] font-chakra font-black uppercase text-indigo-500 tracking-[0.3em] mb-2 flex items-center gap-2">
                 <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                 Student Count
              </span>
              <div className="flex items-baseline gap-2">
                 <span className={`text-6xl font-chakra font-black ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{analytics.total}</span>
                 <span className="text-sm font-bold opacity-40 uppercase">Accounts</span>
              </div>
            </div>

            <div className="flex flex-col group transition-transform hover:scale-105">
              <span className="text-[11px] font-chakra font-black uppercase text-emerald-500 tracking-[0.3em] mb-2 flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 Average Score
              </span>
              <div className="flex items-baseline gap-2">
                 <span className={`text-6xl font-chakra font-black ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>{analytics.avgScore.toFixed(1)}</span>
                 <span className="text-sm font-bold opacity-40 uppercase">% Proficiency</span>
              </div>
            </div>

            <div className="flex flex-col group transition-transform hover:scale-105">
              <span className="text-[11px] font-chakra font-black uppercase text-amber-500 tracking-[0.3em] mb-2 flex items-center gap-2">
                 <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                 User Satisfaction
              </span>
              <div className="flex items-baseline gap-2">
                 <span className={`text-6xl font-chakra font-black ${isDarkMode ? 'text-amber-500' : 'text-amber-600'}`}>{analytics.avgSat.toFixed(1)}</span>
                 <span className="text-sm font-bold opacity-40 uppercase">/ 5.0 Stars</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto shrink-0">
             <div className="relative w-full xl:w-[400px]">
                <input 
                  type="text" placeholder="ค้นหารายชื่อนักเรียน..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full py-5 pl-14 pr-6 rounded-2xl border-4 font-chakra font-bold text-xl outline-none focus:border-indigo-600 transition-all ${isDarkMode ? 'bg-black border-white/5 text-white' : 'bg-slate-50 border-slate-950 text-slate-950'}`}
                />
                <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             
             <div className="flex flex-wrap gap-3 justify-center w-full md:w-auto">
                <button onClick={exportToExcel} className="flex-1 md:flex-none px-6 py-5 bg-emerald-600 text-white rounded-2xl font-chakra font-black uppercase text-xs shadow-xl border-b-8 border-emerald-900 hover:-translate-y-1 transition-transform">Export Data</button>
                <a href={DRIVE_FOLDER_URL} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none px-6 py-5 bg-amber-500 text-slate-950 rounded-2xl font-chakra font-black uppercase text-xs shadow-xl border-b-8 border-amber-700 hover:-translate-y-1 transition-transform flex items-center justify-center gap-2">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.5 13.5l-3.5 0l0-1l3.5 0l0 1zm0-3l-3.5 0l0 1l3.5 0l0-1zm1.5-3l-5 0l0 1l5 0l0-1zm2 10l-10 0c-1.1 0-2-.9-2-2l0-10c0-1.1.9-2 2-2l10 0c1.1 0 2 .9 2 2l0 10c0 1.1-.9 2-2 2zm-10-12l0 10l10 0l0-10l-10 0z"/></svg>
                   Online Folder
                </a>
                <button onClick={clearDatabase} className="flex-1 md:flex-none px-6 py-5 bg-rose-600 text-white rounded-2xl font-chakra font-black uppercase text-xs shadow-xl border-b-8 border-rose-900 hover:-translate-y-1 transition-transform">Reset All</button>
             </div>
          </div>
        </div>

        {/* --- STUDENT LIST (Bento Box Cards) --- */}
        <div className="grid grid-cols-1 gap-8">
          {filteredReports.map((report, idx) => (
            <div key={report.id} className={`group rounded-[4rem] border-4 overflow-hidden transition-all hover:border-indigo-500 shadow-2xl flex flex-col xl:flex-row ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-950'}`}>
              
              {/* Identity Panel (Fixed Side) */}
              <div className={`p-10 xl:w-[380px] shrink-0 flex flex-col justify-between border-b xl:border-b-0 xl:border-r-4 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-indigo-50/50 border-slate-950/10'}`}>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[12px] font-chakra font-black uppercase tracking-widest shadow-lg">STUDENT {idx + 1}</span>
                       <div className="flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full ${report.lmsStatus === 'completed' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{report.lmsStatus || 'pending'}</span>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <h3 className={`text-4xl font-chakra font-black leading-tight tracking-tight ${isDarkMode ? 'text-indigo-400' : 'text-indigo-900'}`}>{report.userName}</h3>
                       <p className={`text-xl font-chakra font-bold opacity-40 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}> รหัสนักเรียน: {report.studentId}</p>
                    </div>
                 </div>
                 
                 <div className="pt-8 border-t-2 border-current/5 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase opacity-40">
                       <span>Submission Log</span>
                       <span>System v2.5</span>
                    </div>
                    <span className="text-sm font-chakra font-bold block">{new Date(report.timestamp).toLocaleString('th-TH')}</span>
                 </div>
              </div>

              {/* Data Dashboard (Adaptive Content) */}
              <div className="flex-1 p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
                 
                 {/* Grading Column */}
                 <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className={`p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center border-4 relative overflow-hidden ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                       <span className="text-[10px] font-chakra font-black uppercase text-indigo-500 mb-2 relative z-10">Total Performance</span>
                       <span className={`text-6xl font-chakra font-black relative z-10 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{report.score}%</span>
                       {/* Mini visual indicator */}
                       <div className="absolute bottom-0 left-0 h-2 bg-indigo-500 transition-all duration-1000" style={{ width: `${report.score}%` }} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className={`p-4 rounded-2xl border-2 text-center ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                          <span className="text-[9px] block font-black uppercase text-emerald-500 mb-1">Quiz Score</span>
                          <span className="text-2xl font-chakra font-black">{report.quizScore}/5</span>
                       </div>
                       <div className={`p-4 rounded-2xl border-2 text-center ${isDarkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-100'}`}>
                          <span className="text-[9px] block font-black uppercase text-amber-500 mb-1">Bonus Pts</span>
                          <span className="text-2xl font-chakra font-black">+{report.collaborationBonus}</span>
                       </div>
                    </div>
                 </div>

                 {/* Lab & Materials Column */}
                 <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="space-y-3">
                       <span className="text-[11px] font-chakra font-black uppercase text-emerald-600 flex items-center gap-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.722 2.528a2 2 0 00.535 2.093l1.847 1.847a2 2 0 002.106.535L20.353 22a2 2 0 001.414-1.96l-.477-2.387a2 2 0 00-.547-1.022z" /></svg>
                          Lab Observation Materials
                       </span>
                       <div className="flex flex-wrap gap-2">
                          {report.materialsTested.map((m, i) => (
                             <span key={i} className={`px-4 py-1.5 rounded-xl text-[10px] font-chakra font-black uppercase border-2 ${isDarkMode ? 'bg-white/5 border-white/5 text-emerald-400' : 'bg-white border-emerald-100 text-emerald-700'}`}>{m}</span>
                          ))}
                          {report.materialsTested.length === 0 && <span className="text-xs opacity-20 italic">No materials tested...</span>}
                       </div>
                    </div>

                    <div className="space-y-3 flex-1">
                       <span className="text-[11px] font-chakra font-black uppercase text-indigo-500 flex items-center gap-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          Recorded Explanations
                       </span>
                       <div className={`p-5 rounded-[2rem] border-2 text-sm font-chakra font-bold italic leading-relaxed h-[150px] overflow-y-auto scrollbar-hide ${isDarkMode ? 'bg-black/30 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
                          {report.observationNotes?.length ? report.observationNotes.join(' | ') : '— บันทึก VDO ยังว่างอยู่ —'}
                       </div>
                    </div>
                 </div>

                 {/* CER Analysis Column */}
                 <div className="lg:col-span-5 grid grid-cols-1 gap-4">
                    <div className={`p-6 rounded-[2rem] border-2 flex flex-col justify-center ${isDarkMode ? 'bg-blue-600/5 border-blue-500/10' : 'bg-blue-50 border-blue-100'}`}>
                       <span className="text-[9px] font-black uppercase text-blue-600 mb-1">Claim (C)</span>
                       <p className={`text-base font-chakra font-black leading-tight ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>{report.cer.claim || 'N/A'}</p>
                    </div>
                    <div className={`p-6 rounded-[2rem] border-2 flex flex-col justify-center ${isDarkMode ? 'bg-emerald-600/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-100'}`}>
                       <span className="text-[9px] font-black uppercase text-emerald-600 mb-1">Evidence (E)</span>
                       <p className={`text-base font-chakra font-black leading-tight ${isDarkMode ? 'text-white' : 'text-emerald-900'}`}>{report.cer.evidence || 'N/A'}</p>
                    </div>
                    <div className={`p-6 rounded-[2.5rem] border-2 flex flex-col justify-center ${isDarkMode ? 'bg-indigo-600/5 border-indigo-500/10' : 'bg-indigo-50 border-indigo-100'}`}>
                       <span className="text-[9px] font-black uppercase text-indigo-600 mb-1">Reasoning (R)</span>
                       <p className={`text-xs font-chakra font-bold leading-relaxed italic ${isDarkMode ? 'text-slate-300' : 'text-indigo-900/70'}`}>{report.cer.reasoning || 'N/A'}</p>
                    </div>
                 </div>

              </div>

              {/* Status Footer */}
              <div className={`px-12 py-5 border-t-2 flex flex-wrap items-center justify-between gap-6 ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-950/5'}`}>
                 <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black uppercase opacity-40">AI Qs:</span>
                       <span className="text-lg font-chakra font-black text-indigo-500">{report.questionsAsked.length}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black uppercase opacity-40">Rating:</span>
                       <div className="flex text-amber-500 text-lg">
                          {Array.from({ length: 5 }).map((_, i) => <span key={i} className={i < report.starRating ? "opacity-100" : "opacity-10"}>★</span>)}
                       </div>
                    </div>
                 </div>
                 <div className="flex-1 max-w-md">
                    <p className="text-[10px] font-chakra font-bold opacity-50 italic truncate">Feedback: "{report.feedbackComment || 'ไม่มีข้อความเพิ่มเติม'}"</p>
                 </div>
                 <button className="px-5 py-2 rounded-xl bg-indigo-600/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 transition-all hover:bg-indigo-600 hover:text-white">View Details</button>
              </div>

            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="py-60 text-center space-y-6">
             <div className="text-9xl opacity-10 animate-pulse">🔍</div>
             <p className="font-chakra font-black text-3xl opacity-20 uppercase tracking-widest">No Student Data Found</p>
          </div>
        )}

        {copyStatus && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-12 py-6 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] font-chakra font-black uppercase text-sm animate-in slide-in-from-bottom-12 z-[600] border-4 border-white/20">
            {copyStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReport;
