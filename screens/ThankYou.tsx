
import React, { useState } from 'react';

interface ThankYouProps {
  onRestart: () => void;
  onFinalSubmit: (rating: number, comment: string) => void;
  isDarkMode: boolean;
}

const ThankYou: React.FC<ThankYouProps> = ({ onRestart, onFinalSubmit, isDarkMode }) => {
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hover, setHover] = useState<number>(0);

  const evaluationUrl = "https://docs.google.com/forms/d/e/1FAIpQLSc1ohpVBkX6yaIDn6iuDduZPhysW0r6E3ET762C_TUd4ZVMVA/viewform?pli=1";

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    onFinalSubmit(rating, review);
    setSubmitted(true);
  };

  const trackingClass = "tracking-standard-15";

  return (
    <div className="h-full relative flex items-center justify-center p-6 overflow-y-auto scrollbar-hide">
      <div className="max-w-4xl w-full text-center space-y-12 relative z-10 py-16">
        {!submitted ? (
          <div className="space-y-10 animate-in fade-in zoom-in duration-700">
            <div className="space-y-4">
              <h1 className={`text-4xl md:text-7xl font-chakra font-black leading-tight uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                MISSION <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600">
                  ACCOMPLISHED
                </span>
              </h1>
              <p className={`opacity-70 text-lg md:text-xl font-chakra max-w-2xl mx-auto font-bold uppercase tracking-widest leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                ความคิดเห็นของคุณมีความสำคัญยิ่งต่อการพัฒนา PhyEM <br /> ขอบคุณที่เป็นส่วนหนึ่งของภารกิจการเรียนรู้นี้
              </p>
            </div>

            <div className={`border-4 rounded-[3.5rem] p-8 md:p-14 shadow-2xl space-y-10 ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-950 text-slate-950'}`}>
              <div className="space-y-6">
                <h3 className="text-2xl font-chakra font-black uppercase tracking-widest">ประเมินความพึงพอใจ</h3>
                <div className="flex justify-center gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className="transition-transform hover:scale-125 focus:outline-none"
                    >
                      <svg
                        className={`w-12 h-12 md:w-16 md:h-16 ${
                          (hover || rating) >= star ? 'text-amber-400 fill-current' : 'text-slate-300 dark:text-slate-700'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
                <p className="text-xs font-chakra font-black uppercase tracking-widest opacity-60">
                  {rating === 5 ? 'ยอดเยี่ยมที่สุด!' : rating === 4 ? 'ดีมาก' : rating === 3 ? 'ดี' : rating === 2 ? 'พอใช้' : rating === 1 ? 'ควรปรับปรุง' : 'โปรดเลือกคะแนน'}
                </p>
              </div>

              <div className="space-y-4">
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="ร่วมแบ่งปันประสบการณ์การเรียนรู้ของคุณที่นี่..."
                  className={`w-full border-4 rounded-3xl p-6 text-lg font-chakra font-bold outline-none focus:border-cyan-500 transition-all resize-none h-32 ${isDarkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-950 text-slate-950'}`}
                />
              </div>

              <div className="flex flex-col gap-6">
                <button
                  onClick={handleSubmitReview}
                  disabled={rating === 0}
                  className={`w-full py-6 rounded-3xl font-chakra font-black text-xl uppercase tracking-[0.2em] transition-all shadow-xl border-4 border-slate-950 ${
                    rating > 0 
                    ? (isDarkMode ? 'bg-cyan-600 text-white hover:scale-[1.02]' : 'bg-slate-950 text-white hover:scale-[1.02]')
                    : 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                  }`}
                >
                  บันทึกผลการสรุปภารกิจ
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="space-y-6 flex flex-col items-center">
              <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-2xl relative group">
                <div className="absolute inset-0 rounded-[3rem] border-4 border-white/20 animate-pulse scale-110" />
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className={`text-4xl md:text-6xl font-chakra font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>บันทึกผลเรียบร้อย ขอบคุณครับ!</h2>
              <p className={`opacity-70 text-xl font-chakra max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                การเรียนรู้ของคุณไม่สิ้นสุดเพียงเท่านี้ <br /> ขั้นตอนสุดท้าย: โปรดทำแบบประเมินความพึงพอใจโครงการที่ลิงก์ด้านล่าง
              </p>
            </div>

            <div className="flex flex-col gap-6 max-w-xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-600 to-red-500 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <a 
                  href={evaluationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative w-full py-6 px-8 flex items-center justify-center rounded-3xl font-chakra font-black text-lg uppercase tracking-[0.2em] transition-all shadow-2xl border-4 ${
                    isDarkMode 
                    ? 'bg-amber-500 text-slate-950 border-white/20 hover:bg-amber-400' 
                    : 'bg-amber-500 text-slate-950 border-slate-950 hover:bg-amber-400'
                  }`}
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>เปิดแบบประเมินภายนอก (Google Forms)</span>
                </a>
              </div>

              <button
                onClick={onRestart}
                className={`group relative px-16 py-6 font-chakra font-black rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center uppercase tracking-widest text-lg border-4 ${isDarkMode ? 'bg-white text-slate-950 border-slate-300' : 'bg-slate-950 text-white border-slate-950'}`}
              >
                <span>Restart Mission</span>
                <svg className="w-6 h-6 ml-3 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThankYou;
