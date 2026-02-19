
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (name: string, nickname: string, id: string) => void;
  isDarkMode: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, isDarkMode }) => {
  const [fullNameWithNickname, setFullNameWithNickname] = useState('');
  const [studentId, setStudentId] = useState('');
  const trackingClass = "tracking-standard-15";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullNameWithNickname.trim() && studentId.trim()) {
      onLogin(fullNameWithNickname.trim(), '', studentId.trim());
    }
  };

  return (
    <div className="h-full relative flex items-center justify-center p-6 bg-transparent">
      <div className={`max-w-xl w-full backdrop-blur-2xl rounded-[3.5rem] p-10 md:p-14 border shadow-2xl relative z-10 space-y-10 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white border-slate-950 shadow-[16px_16px_0px_#020617]'}`}>
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-2xl">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h2 className={`text-4xl font-chakra font-black uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-950'} ${trackingClass}`}>เข้าสู่ PhyEM</h2>
          <p className={`font-chakra text-[12px] font-black uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} ${trackingClass}`}>Physics Induction Module</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className={`text-xl font-chakra font-black uppercase ml-4 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-800'} ${trackingClass}`}>ชื่อ-นามสกุล หรือ ชื่อเล่น</label>
            <input 
              type="text" 
              required
              value={fullNameWithNickname}
              onChange={(e) => setFullNameWithNickname(e.target.value)}
              placeholder="เช่น นายฟิสิกส์ เก่งมาก (พี)"
              className={`w-full border-4 rounded-[2rem] py-6 px-8 text-2xl font-chakra font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950/50 border-white/10 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-950 text-slate-950 focus:border-cyan-600'}`}
            />
          </div>

          <div className="space-y-4">
            <label className={`text-xl font-chakra font-black uppercase ml-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-800'} ${trackingClass}`}>เลขที่ หรือ รหัสนักเรียน</label>
            <input 
              type="text" 
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="กรอกเลขที่หรือรหัส..."
              className={`w-full border-4 rounded-[2rem] py-6 px-8 text-2xl font-chakra font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950/50 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-950 text-slate-950 focus:border-indigo-600'}`}
            />
          </div>

          <button 
            type="submit"
            className={`w-full py-8 font-chakra font-black uppercase rounded-[2rem] shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4 text-2xl border-4 ${isDarkMode ? 'bg-cyan-600 text-white border-black/10 hover:bg-cyan-500' : 'bg-slate-950 text-white border-slate-700 hover:bg-slate-800'} ${trackingClass}`}
          >
            เริ่มภารกิจ
          </button>
        </form>

        <p className={`text-center text-[10px] font-black uppercase leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} ${trackingClass}`}>
          ข้อมูลของคุณจะถูกบันทึกเพื่อใช้ในการสรุปผลภารกิจ <br /> Ready for the challenge?
        </p>
      </div>
    </div>
  );
};

export default Login;
