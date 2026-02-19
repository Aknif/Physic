
import React, { useState, useEffect, useCallback } from 'react';
import { CERState, CommunityQuestion, CommunityReply } from '../types';

interface CollaborationProps {
  cerState: CERState;
  collaborationBonus: number;
  setCollaborationBonus: React.Dispatch<React.SetStateAction<number>>;
  onBack: () => void;
  onFinish: () => void;
  isDarkMode: boolean;
}

const FORUM_STORAGE_KEY = 'phyem_global_forum';

const Collaboration: React.FC<CollaborationProps> = ({ cerState, collaborationBonus, setCollaborationBonus, onBack, onFinish, isDarkMode }) => {
  const [showBonusToast, setShowBonusToast] = useState(false);
  const [questions, setQuestions] = useState<CommunityQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [replyInputs, setReplyInputs] = useState<{[key: string]: string}>({});

  const syncForum = useCallback(() => {
    const saved = localStorage.getItem(FORUM_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setQuestions(parsed.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } else {
      const initial: CommunityQuestion[] = [
        {
          id: 'q-induction-1',
          author: 'Researcher_Phy',
          question: 'ถ้าเราเพิ่มจำนวนรอบของขดลวดในเตา จะส่งผลต่อความร้อนที่เกิดขึ้นกับวัตถุอย่างไร?',
          timestamp: new Date().toISOString(),
          replies: [
            { id: 'r1', author: 'PhyEM_Bot', text: 'การเพิ่มจำนวนรอบจะช่วยเพิ่มความเข้มข้นของฟลักซ์แม่เหล็ก ซึ่งจะส่งผลให้เกิดกระแส Eddy Current ที่รุนแรงขึ้นและความร้อนจะเพิ่มขึ้นครับ!', timestamp: new Date().toISOString() }
          ]
        },
        {
          id: 'q-induction-2',
          author: 'Researcher_Phy',
          question: 'ทำไมกระทะสแตนเลสบางชนิดถึงใช้กับเตาแม่เหล็กไฟฟ้าไม่ได้ ทั้งที่มันเป็นโลหะเหมือนกัน?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
          replies: []
        },
        {
          id: 'q-induction-3',
          author: 'Researcher_Phy',
          question: 'ถ้าเราเปลี่ยนวัสดุจาก "เหล็ก" เป็น "ทองแดง" ที่นำไฟฟ้าได้ดีกว่า จะเกิดความร้อนมากกว่าหรือน้อยกว่า? ลองใช้ PhET สังเกตดูนะ',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
          replies: []
        },
        {
          id: 'q-induction-4',
          author: 'Researcher_Phy',
          question: 'การวางไข่บน "ฟอยล์อลูมิเนียม" จะช่วยให้ไข่สุกได้จริงหรือไม่? ใครเห็นหลักฐานในวิดีโอบ้างว่าเกิดอะไรขึ้น?',
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
          replies: []
        }
      ];
      localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(initial));
      setQuestions(initial);
    }
  }, []);

  useEffect(() => {
    syncForum();
    window.addEventListener('storage', (e) => {
      if (e.key === FORUM_STORAGE_KEY) {
        syncForum();
      }
    });
  }, [syncForum]);

  const saveToGlobal = (updatedQuestions: CommunityQuestion[]) => {
    localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(updatedQuestions));
    setQuestions(updatedQuestions);
    window.dispatchEvent(new Event('storage'));
  };

  const postQuestion = () => {
    if (!newQuestion.trim()) return;
    const q: CommunityQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      author: 'You (Researcher)',
      question: newQuestion,
      timestamp: new Date().toISOString(), 
      replies: []
    };
    saveToGlobal([q, ...questions]);
    setNewQuestion('');
  };

  const handleReply = (questionId: string) => {
    const text = replyInputs[questionId];
    if (!text?.trim()) return;
    
    const updated = questions.map(q => 
      q.id === questionId 
        ? { ...q, replies: [...q.replies, { id: Date.now().toString(), author: 'You (Researcher)', text, timestamp: new Date().toISOString() }] }
        : q
    );
    
    saveToGlobal(updated);
    
    setCollaborationBonus(prev => prev + 2);
    setShowBonusToast(true);
    setTimeout(() => setShowBonusToast(false), 3000);

    setReplyInputs(prev => ({ ...prev, [questionId]: '' }));
  };

  const trackingClass = "tracking-standard-15";

  return (
    <div className="h-full flex flex-col p-4 md:p-8 max-w-7xl mx-auto space-y-10 overflow-y-auto pb-32 scrollbar-hide bg-transparent relative">
      
      {showBonusToast && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-10 duration-500">
           <div className="bg-emerald-500 text-white px-10 py-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(16,185,129,0.6)] border-4 border-white/30 flex items-center gap-6">
              <div className="bg-white text-emerald-600 w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl shadow-xl">
                 +2
              </div>
              <span className="font-chakra font-black uppercase tracking-[0.2em] text-xl">Scientific Bonus!</span>
           </div>
        </div>
      )}

      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
           <div className="w-3 h-12 bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
           <div>
              <div className="flex items-center gap-4">
                <h2 className={`text-3xl md:text-4xl font-chakra font-black uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'} ${trackingClass}`}>Peer Review</h2>
                <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 shadow-inner">
                   <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   <span className="text-[10px] font-chakra font-black text-emerald-500 uppercase tracking-widest">Global Activity Live</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">แลกเปลี่ยนทฤษฎีเพื่อรับแต้มสะสม</p>
           </div>
        </div>

        <div className={`px-8 py-4 rounded-[2rem] border-4 flex items-center gap-6 shadow-2xl transform hover:scale-105 transition-all ${isDarkMode ? 'bg-indigo-950/40 border-indigo-500/30 shadow-indigo-900/40' : 'bg-white border-slate-950'}`}>
           <div className="text-right">
              <span className="block text-[9px] text-indigo-400 font-black uppercase tracking-[0.4em] mb-1">Collaboration Wallet</span>
              <span className={`text-3xl font-chakra font-black ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{collaborationBonus} <span className="text-sm opacity-50">PTS</span></span>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-xl text-3xl font-black border-2 border-white/20">★</div>
        </div>
      </section>
      
      <section className="space-y-10">
        <div className="flex items-center space-x-4 px-2">
          <div className="w-1.5 h-8 bg-cyan-500 rounded-full" />
          <h3 className={`text-xl md:text-2xl font-chakra font-black uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'} ${trackingClass}`}>Laboratory Discussion Forum</h3>
        </div>

        {/* Create Question Card */}
        <div className={`rounded-[3.5rem] p-10 border-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col md:flex-row gap-6 items-center transition-all ${isDarkMode ? 'bg-black/60 border-indigo-500/30' : 'bg-white border-slate-950 shadow-indigo-100'}`}>
          <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-2xl text-3xl font-black border-2 border-white/20">?</div>
          <input 
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="ตั้งคำถามเพื่อแลกเปลี่ยนความรู้กับเพื่อนๆ..."
            className={`w-full flex-1 border-4 rounded-[2rem] px-8 py-6 font-chakra font-black text-xl outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-600 text-slate-950'}`}
          />
          <button 
            onClick={postQuestion}
            disabled={!newQuestion.trim()}
            className="w-full md:w-auto px-12 py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-chakra font-black uppercase rounded-[1.8rem] shadow-2xl transition-all active:scale-95 disabled:opacity-20 text-lg border-2 border-white/10"
          >
            Post Inquiry
          </button>
        </div>

        {/* Questions List */}
        <div className="grid grid-cols-1 gap-12">
          {questions.map((q) => (
            <div key={q.id} className={`rounded-[4rem] overflow-hidden border-4 shadow-2xl flex flex-col transition-all relative ${isDarkMode ? 'bg-slate-900 border-indigo-500/10 hover:border-indigo-500/30 shadow-black' : 'bg-white border-slate-950'}`}>
              
              <div className="p-10 md:p-14 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-chakra font-black text-xl shadow-lg border-2 ${isDarkMode ? 'bg-black text-cyan-400 border-white/10' : 'bg-slate-950 text-white border-slate-700'}`}>Q</div>
                    <div>
                      <h4 className={`font-chakra font-black text-xl leading-none uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{q.author}</h4>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2 block">
                        {new Date(q.timestamp).toLocaleTimeString()} • Researcher Session
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20 px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest animate-pulse shadow-sm">
                    +2 Points Active
                  </div>
                </div>
                
                <p className={`text-2xl md:text-3xl font-chakra font-black leading-tight italic ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>"{q.question}"</p>
              </div>

              {/* Replies Section with Card-like input */}
              <div className={`p-10 md:p-14 space-y-10 relative z-10 ${isDarkMode ? 'bg-black/40' : 'bg-slate-50'} border-t-4 border-current opacity-100`}>
                <div className="space-y-6">
                  {q.replies.map((reply) => (
                    <div key={reply.id} className={`p-8 rounded-[2.5rem] border-2 shadow-sm transition-all flex flex-col gap-4 ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-950/10'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                          <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-indigo-400' : 'text-indigo-900'}`}>{reply.author}</span>
                        </div>
                        <span className="text-[9px] opacity-30 font-bold">{new Date(reply.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className={`text-lg font-chakra font-bold leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-950'}`}>{reply.text}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Input Card - Prominent Styling */}
                <div className={`p-8 rounded-[3rem] border-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] relative overflow-hidden group ${isDarkMode ? 'bg-slate-950 border-emerald-500/30' : 'bg-white border-slate-950'}`}>
                  <div className="flex flex-col lg:flex-row gap-6 items-center relative z-20">
                    <div className="relative flex-1 w-full">
                      <div className="absolute left-6 top-6 opacity-30">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      </div>
                      <textarea 
                        rows={1}
                        value={replyInputs[q.id] || ''}
                        onChange={(e) => setReplyInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="ตอบคำถามเพื่อนและรับคะแนนพิเศษ..."
                        className={`w-full pl-16 pr-8 py-6 rounded-2xl border-4 outline-none font-chakra font-bold text-lg transition-all ${isDarkMode ? 'bg-black border-white/5 focus:border-emerald-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-950'}`}
                      />
                    </div>
                    
                    <button 
                      onClick={() => handleReply(q.id)}
                      disabled={!(replyInputs[q.id]?.trim())}
                      className={`relative px-12 py-6 rounded-[2rem] shadow-2xl transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-6 group/btn border-4 ${
                        !(replyInputs[q.id]?.trim()) 
                        ? 'bg-slate-700 text-slate-500 border-transparent' 
                        : (isDarkMode ? 'bg-emerald-600 border-white/20 text-white hover:bg-emerald-500' : 'bg-slate-950 border-slate-700 text-white hover:bg-slate-800')
                      }`}
                    >
                      <span className="font-chakra font-black uppercase text-sm tracking-[0.2em] drop-shadow-sm">Answer Mission</span>
                      
                      <div className={`px-5 py-2.5 rounded-2xl text-[16px] font-black shadow-xl transition-all group-hover/btn:scale-110 group-hover/btn:rotate-6 flex items-center gap-2 border-2 ${
                         !(replyInputs[q.id]?.trim())
                         ? 'bg-slate-800 text-slate-600 border-transparent'
                         : 'bg-amber-400 text-amber-950 border-white/80 animate-pulse ring-4 ring-amber-300/30'
                      }`}>
                        +2 <span className="text-[10px] opacity-60">PTS</span>
                      </div>
                    </button>
                  </div>
                  
                  {/* Decorative background for the reply input card */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
                </div>
              </div>

              {/* Decorative side accent */}
              <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500/20" />
            </div>
          ))}
        </div>
      </section>

      <div className={`pt-12 flex flex-col md:flex-row justify-between items-center gap-8 border-t-4 ${isDarkMode ? 'border-white/10' : 'border-slate-950/10'}`}>
        <button 
          onClick={onBack}
          className={`w-full md:w-auto px-10 py-6 font-chakra font-black uppercase text-sm border-4 rounded-2xl transition-all ${isDarkMode ? 'text-slate-400 border-white/10 hover:text-white hover:bg-white/5' : 'text-slate-950 border-slate-950 hover:bg-slate-50'}`}
        >
          Back to Evaluation
        </button>
        <button 
          onClick={onFinish}
          className="w-full md:w-auto px-20 py-8 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-700 text-white font-chakra font-black uppercase rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(99,102,241,0.5)] hover:scale-[1.05] active:scale-95 transition-all text-2xl tracking-standard-15 border-4 border-white/20"
        >
          Finalize Mission
        </button>
      </div>
    </div>
  );
};

export default Collaboration;
